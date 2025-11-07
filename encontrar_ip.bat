@echo off
echo ========================================
echo   ENCUENTRA TU IP PARA IPHONE
echo ========================================
echo.
echo Tu IP local es:
echo.
ipconfig | findstr /i "IPv4"
echo.
echo ========================================
echo Usa esta IP en tu iPhone:
echo http://TU_IP/proyecto_ar_jb/index.html
echo ========================================
echo.
echo Ejemplo: http://192.168.1.100/proyecto_ar_jb/index.html
echo.
pause
