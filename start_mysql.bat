@echo off
setlocal
set "MYSQL_SERVICE_NAME=MySQL80"

sc query "%MYSQL_SERVICE_NAME%" | findstr /I "RUNNING" >nul
if not errorlevel 1 (
  echo MySQL service %MYSQL_SERVICE_NAME% is already running.
  exit /b 0
)

echo Starting MySQL Windows service %MYSQL_SERVICE_NAME%...
net start "%MYSQL_SERVICE_NAME%"
if errorlevel 1 (
  echo Could not start %MYSQL_SERVICE_NAME%. Check the service name in start_mysql.bat and run this script as Administrator if required.
  exit /b 1
)
