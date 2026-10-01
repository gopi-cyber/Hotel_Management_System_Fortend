@echo off
title LuxeStay Hotel Management System
:menu
cls
echo ========================================================
echo   🏨 LUXESTAY HOTEL MANAGEMENT SYSTEM
echo ========================================================
echo.
echo   [1] Start Next.js Frontend (Port 3000)
echo   [2] Exit
echo.
echo ========================================================
set /p choice="Select an option (1-2): "

if "%choice%"=="1" goto start_frontend
if "%choice%"=="2" goto end

echo Invalid selection! Please enter 1-2.
timeout /t 2 >nul
goto menu

:start_frontend
call start_frontend.bat
goto menu

:end
exit
