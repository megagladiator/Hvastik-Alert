# 🚨 КРИТИЧНО: Настройка Firebase Admin SDK

## Проблема
В админ-панели отображаются "нереальные" пользователи, потому что Firebase Admin SDK не настроен.

## Решение

### 1. Получите Firebase Admin ключи

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект **"hvostalert"**
3. Перейдите в **"Project Settings"** → **"Service accounts"**
4. Нажмите **"Generate new private key"**
5. Скачайте JSON файл

### 2. Добавьте переменные в .env.local

Откройте файл `.env.local` и добавьте в конец:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=hvostalert
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hvostalert.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Замените:**
- `xxxxx` на реальный ID из JSON файла
- `MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...` на полный private key из JSON

### 3. Проверьте настройку

После добавления переменных запустите:

```bash
node test-firebase-admin.js
```

Должно показать:
```
✅ Firebase Admin инициализирован
✅ Найдено X пользователей:
  - user1@example.com (uid1)
  - user2@example.com (uid2)
```

### 4. Перезапустите сервер

```bash
npm run dev
```

### 5. Проверьте админ-панель

1. Откройте админ-панель
2. Перейдите в раздел "Пользователи"
3. Должны отображаться **только реальные пользователи из Firebase**

## Важно

- Никогда не коммитьте `.env.local` в git
- Храните Firebase ключи в безопасности
- В продакшене используйте переменные окружения хостинга
