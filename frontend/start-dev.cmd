@echo off
REM Use npm.cmd to avoid PowerShell execution policy blocking npm.ps1
cd /d "%~dp0"

where npm.cmd >nul 2>&1
if %ERRORLEVEL% equ 0 (
  set "NPM=npm.cmd"
) else if exist "%ProgramFiles%\nodejs\npm.cmd" (
  set "NPM=%ProgramFiles%\nodejs\npm.cmd"
) else if exist "..\tools\node\node-v22.16.0-win-x64\npm.cmd" (
  set "PATH=..\tools\node\node-v22.16.0-win-x64;%PATH%"
  set "NPM=npm.cmd"
) else (
  echo npm.cmd not found. Install Node.js from https://nodejs.org/
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call %NPM% install
  if errorlevel 1 exit /b 1
)

echo Starting http://localhost:4200
call %NPM% start
