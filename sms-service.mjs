import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'No phone' });

  const otp = generateOtp();
  const url = `https://smsc.ru/sys/send.php?login=${process.env.SMSC_LOGIN}&psw=${process.env.SMSC_PSW}&phones=${phone}&mes=Код: ${otp}&fmt=3`;
  const smsRes = await fetch(url);
  const smsData = await smsRes.json();

  await supabase.from('phone_otp').upsert({ phone, otp, created_at: new Date().toISOString() });

  res.json({ success: true, sms: smsData });
});

app.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'No phone or otp' });

  const { data, error } = await supabase
    .from('phone_otp')
    .select('*')
    .eq('phone', phone)
    .eq('otp', otp)
    .single();

  if (error || !data) return res.status(400).json({ error: 'Invalid code' });

  const now = new Date();
  const sent = new Date(data.created_at);
  if ((now - sent) / 1000 > 300) return res.status(400).json({ error: 'Code expired' });

  // Найти или создать пользователя
  let userId;
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single();
  if (user && user.id) {
    userId = user.id;
  } else {
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert({ phone })
      .select('id')
      .single();
    if (newUser && newUser.id) userId = newUser.id;
  }
  if (!userId) return res.status(500).json({ error: 'User creation failed' });

  res.json({ success: true, userId });
});

app.listen(3005, () => console.log('SMS microservice running on 3005')); 