// Простой тест для проверки API загрузки
const fs = require('fs');
const path = require('path');

async function testUpload() {
  console.log('🧪 Тестируем API загрузки файлов...\n');

  try {
    // Создаем тестовый файл
    const testImagePath = path.join(__dirname, 'public', 'placeholder.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Тестовый файл не найден. Создаем простой тест...');
      
      // Тестируем API без файла
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: new FormData()
      });
      
      const result = await response.json();
      console.log('📤 Ответ API:', result);
      
      if (response.status === 400) {
        console.log('✅ API работает - ожидаемая ошибка "Файл не найден"');
      } else {
        console.log('❌ Неожиданный ответ API');
      }
    } else {
      console.log('✅ Тестовый файл найден, тестируем загрузку...');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testImagePath));
      
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('📤 Ответ API:', result);
      
      if (response.ok) {
        console.log('✅ Файл успешно загружен!');
        console.log('🔗 URL:', result.url);
      } else {
        console.log('❌ Ошибка загрузки:', result.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка теста:', error.message);
  }
}

testUpload();
