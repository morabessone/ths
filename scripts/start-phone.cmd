@echo off
title LivIn - Expo (celular)
cd /d "%~dp0.."
echo.
echo  LivIn - Modo celular (QR con tunnel)
echo  Necesitas Expo Go instalado en el telefono.
echo  La primera vez puede tardar 2-5 minutos.
echo.
npx expo start --clear --tunnel
pause
