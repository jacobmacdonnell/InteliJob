@echo off
echo Killing all backend (python) and frontend (node) processes...
powershell -Command "Stop-Process -Name python -Force -ErrorAction SilentlyContinue; Stop-Process -Name node -Force -ErrorAction SilentlyContinue"
echo Done.
pause
