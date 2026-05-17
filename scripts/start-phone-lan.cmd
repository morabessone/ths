@echo off
title LivIn - Expo (misma WiFi)
cd /d "%~dp0.."
echo.
echo  LivIn - Modo celular (LAN, misma WiFi que la PC)
echo  Necesitas Expo Go instalado en el telefono.
echo.
npx expo start --clear --lan
pause
