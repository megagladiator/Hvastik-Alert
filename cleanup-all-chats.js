require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAllChats() {
  console.log(' ������� ���� ������������ �����...\n');
  
  try {
    // 1. �������� ��� ����
    const { data: allChats, error: chatsError } = await supabase
      .from('chats')
      .select('*');
    
    if (chatsError) {
      console.error('������ ��� ��������� �����:', chatsError);
      return;
    }
    
    console.log( ������� �����: );
    
    if (!allChats || allChats.length === 0) {
      console.log(' ����� ��� �������� ���');
      return;
    }
    
    // 2. ������� ��� ���� (��������� �������� ������������� ��-�� CASCADE)
    const { error: deleteChatsError } = await supabase
      .from('chats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteChatsError) {
      console.error('������ ��� �������� �����:', deleteChatsError);
    } else {
      console.log(' ���� �������');
    }
    
    // 3. ��������� ���������
    const { data: remainingChats } = await supabase
      .from('chats')
      .select('*');
    
    console.log( �������� �����: );
    
    if ((remainingChats?.length || 0) === 0) {
      console.log(' ������� ��������� �������!');
    }
    
  } catch (error) {
    console.error('������ ��� �������:', error);
  }
}

cleanupAllChats();
