const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log(" Переменные окружения не найдены");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  console.log(" Проверяем пользователя agentgl007@gmail.com...");
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: "agentgl007@gmail.com",
      password: "dummy_check_password"
    });
    
    if (error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes("invalid login credentials") || 
          errorMsg.includes("invalid email or password")) {
        console.log(" Пользователь agentgl007@gmail.com СУЩЕСТВУЕТ в базе данных");
        console.log(" Но пароль неверный");
        console.log(" Нужно сбросить пароль или создать новый");
      } else if (errorMsg.includes("user not found")) {
        console.log(" Пользователь agentgl007@gmail.com НЕ НАЙДЕН в базе данных");
        console.log(" Нужно создать аккаунт администратора");
      } else {
        console.log(" Ошибка:", error.message);
      }
    } else {
      console.log(" Пользователь найден и пароль верный!");
    }
  } catch (err) {
    console.log(" Ошибка подключения:", err.message);
  }
}

checkUser();