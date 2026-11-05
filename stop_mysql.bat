@echo off
setlocal
set "MYSQL_SERVICE_NAME=MySQL80"
echo Stopping MySQL Windows service %MYSQL_SERVICE_NAME%...
net stop "%MYSQL_SERVICE_NAME%"
