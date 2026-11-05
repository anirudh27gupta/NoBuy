@echo off
setlocal
echo ========================================================
echo Starting No-Buy (MySQL + Flask + React)
echo ========================================================

call "%~dp0start_mysql.bat"
if errorlevel 1 (
  echo MySQL did not start. Review the MySQL service name and setup instructions in README.md.
  pause
  exit /b 1
)

pushd "%~dp0backend"
echo Initializing database schema...
python init_db.py
if errorlevel 1 (
  popd
  echo Database initialization failed. Check backend\.env and the MySQL server.
  pause
  exit /b 1
)
start "No-Buy Flask Backend" /D "%~dp0backend" cmd /k python app.py
popd

start "No-Buy React Frontend" /D "%~dp0frontend" cmd /k npm run dev
echo.
echo Frontend: http://localhost:5173
echo API health: http://localhost:5000/api/health
pause
