REM --- Settings for Hvostik Alert ---
SET SSH_USER=root
SET SSH_HOST=212.34.138.16
REM Path to your private SSH key in Windows
SET SSH_KEY_PATH=C:\Users\SuperBoss007\.ssh\id_rsa
REM Path to deploy script for hvostikalert.ru on the server
echo "SET DEPLOY_SCRIPT_PATH=/var/www/hvostikalert_usr/deploy_with_git_fix.sh"
SET DEPLOY_SCRIPT_PATH=/var/www/hvostikalert_usr/deploy_with_git_fix.sh
REM Show value of deploy script path to check
echo Deploy script path is %DEPLOY_SCRIPT_PATH%

ECHO.
ECHO ======================================================
ECHO Starting deployment for hvostikalert.ru on %SSH_HOST%...
ECHO Using FIXED deploy script with Git conflict resolution
ECHO ======================================================
ECHO.

REM Connect via SSH and run the deploy script on the server
ssh -t -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST% "%DEPLOY_SCRIPT_PATH%"

IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO ERROR: Deployment for hvostikalert.ru failed! Exit code: %ERRORLEVEL%
) ELSE (
    ECHO.
    ECHO Deployment for hvostikalert.ru completed successfully.
)
ECHO.
PAUSE
