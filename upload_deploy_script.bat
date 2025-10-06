@echo off
REM --- Settings for Hvostik Alert ---

SET SSH_USER=root
SET SSH_HOST=212.34.138.16
SET SSH_KEY_PATH=C:\Users\SuperBoss007\.ssh\id_rsa
SET LOCAL_SCRIPT=deploy_with_git_fix.sh
SET REMOTE_SCRIPT=/var/www/hvostikalert_usr/deploy_with_git_fix.sh

ECHO.
ECHO ======================================================
ECHO Uploading fixed deploy script to server...
ECHO ======================================================
ECHO.

REM Upload the script to the server
scp -i "%SSH_KEY_PATH%" "%LOCAL_SCRIPT%" %SSH_USER%@%SSH_HOST%:%REMOTE_SCRIPT%

REM Make the script executable
ssh -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "chmod +x %REMOTE_SCRIPT%"

REM Check if upload was successful
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO ERROR: Failed to upload deploy script! Exit code: %ERRORLEVEL%
) ELSE (
    ECHO.
    ECHO Deploy script uploaded successfully!
    ECHO You can now run deploy_fixed.bat to deploy with Git conflict resolution
)

ECHO.
PAUSE
