# Настройка Firebase Admin SDK

Для работы с реальными пользователями Firebase нужно настроить Firebase Admin SDK.

## 1. Получение сервисного ключа

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект "hvostalert"
3. Перейдите в "Project Settings" → "Service accounts"
4. Нажмите "Generate new private key"
5. Скачайте JSON файл с ключом

## 2. Добавление переменных окружения

Добавьте в файл `.env.local` следующие переменные:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=hvostalert
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hvostalert.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Важно:** 
- Замените `xxxxx` на реальный ID из скачанного JSON файла
- Скопируйте полный private key из JSON файла
- Обязательно заключите private key в кавычки
- Замените `\n` на реальные переносы строк

## 3. Пример JSON файла

```json
{
  "type": "service_account",
  "project_id": "hvostalert",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@hvostalert.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40hvostalert.iam.gserviceaccount.com"
}
```

## 4. Проверка

После настройки переменных окружения:

1. Перезапустите сервер разработки
2. Откройте админ-панель
3. Перейдите в раздел "Пользователи"
4. Должны отображаться реальные пользователи из Firebase

## 5. Безопасность

- Никогда не коммитьте `.env.local` в git
- Храните сервисный ключ в безопасном месте
- В продакшене используйте переменные окружения хостинга
