@echo off
setlocal EnableExtensions
title System Edit - Automatic Setup
cd /d "%~dp0"

echo.
echo ==========================================
echo          SYSTEM EDIT - EASY START
echo ==========================================
echo.

REM Check whether Node.js/npm is already installed.
where npm >nul 2>nul
if not errorlevel 1 goto NODE_READY

echo Node.js was not found.
echo.
echo Checking for Windows Package Manager (winget)...
where winget >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: winget is not available on this PC.
  echo Please install Node.js LTS manually from https://nodejs.org/
  echo Then run this file again.
  echo.
  pause
  exit /b 1
)

echo Installing Node.js LTS automatically...
echo You may see a Windows permission prompt. Choose Yes.
echo.
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements
if errorlevel 1 (
  echo.
  echo Node.js installation failed or was cancelled.
  echo Please install Node.js LTS manually, then run this file again.
  echo.
  pause
  exit /b 1
)

echo.
echo Node.js installation finished.
echo Refreshing the command path...

REM winget may install Node.js without updating this CMD session's PATH.
if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\nodejs\npm.cmd" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js was installed, but this window cannot see npm yet.
  echo Please close this window and double-click start_editor.bat again.
  echo.
  pause
  exit /b 1
)

:NODE_READY
echo Node.js/npm is ready.
echo.
echo Node version:
node --version
echo npm version:
npm --version
echo.

if not exist node_modules (
  echo Installing System Edit dependencies...
  echo This only needs to happen on the first run.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo Starting System Edit...
echo.
call npm start
if errorlevel 1 (
  echo.
  echo System Edit could not start.
  echo.
  pause
  exit /b 1
)

endlocal
