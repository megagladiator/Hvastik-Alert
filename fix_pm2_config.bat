@echo off
REM --- Settings for Hvostik Alert ---

SET SSH_USER=root
SET SSH_HOST=212.34.138.16
SET SSH_KEY_PATH=C:\Users\SuperBoss007\.ssh\id_rsa
SET LOCAL_SCRIPT=fix_pm2_config.sh
SET REMOTE_SCRIPT=/var/www/hvostikalert_usr/fix_pm2_config.sh

ECHO.
ECHO ======================================================
ECHO Fixing PM2 configuration to set NODE_ENV=production
ECHO ======================================================
ECHO.

REM Upload the script to the server
scp -i "%SSH_KEY_PATH%" "%LOCAL_SCRIPT%" %SSH_USER%@%SSH_HOST%:%REMOTE_SCRIPT%

REM Make the script executable
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "chmod +x %REMOTE_SCRIPT%"

REM Execute the script on the server
ssh -t -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "%REMOTE_SCRIPT%"

IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO ERROR: Failed to fix PM2 configuration! Exit code: %ERRORLEVEL%
) ELSE (
    ECHO.
    ECHO PM2 configuration fixed successfully!
    ECHO.
    ECHO Next steps:
    ECHO 1. Go to https://hvostikalert.ru/debug-env
    ECHO 2. Verify that NODE_ENV = 'production'
    ECHO 3. Test password reset functionality
)

ECHO.
PAUSE
