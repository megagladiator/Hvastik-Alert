@echo off
REM --- Settings for Hvostik Alert ---

SET SSH_USER=root
SET SSH_HOST=212.34.138.16
SET SSH_KEY_PATH=C:\Users\SuperBoss007\.ssh\id_rsa

ECHO.
ECHO ======================================================
ECHO Checking and fixing NODE_ENV on server
ECHO ======================================================
ECHO.

ECHO Step 1: Checking current PM2 processes...
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "pm2 list"

ECHO.
ECHO Step 2: Checking current environment variables...
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "pm2 env 0"

ECHO.
ECHO Step 3: Setting NODE_ENV=production for current process...
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "pm2 set NODE_ENV production"

ECHO.
ECHO Step 4: Restarting PM2 process...
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "pm2 restart hvastik-alert"

ECHO.
ECHO Step 5: Checking environment variables after restart...
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "pm2 env 0"

ECHO.
ECHO Step 6: Checking PM2 status...
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "pm2 list"

ECHO.
ECHO ======================================================
ECHO NODE_ENV fix completed!
ECHO ======================================================
ECHO.
ECHO Next steps:
ECHO 1. Go to https://hvostikalert.ru/debug-env
ECHO 2. Verify that NODE_ENV = 'production'
ECHO 3. Test password reset functionality
ECHO.

PAUSE
