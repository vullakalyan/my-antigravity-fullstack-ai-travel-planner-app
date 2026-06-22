@echo off
echo Checking permissions...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Starting MongoDB Service...
    net start MongoDB
    echo.
    echo Press any key to close this window.
    pause >nul
) else (
    echo Requesting Administrator privileges to start MongoDB...
    powershell -Command "Start-Process cmd -ArgumentList '/c ""%~dpnx0""' -Verb RunAs"
)
