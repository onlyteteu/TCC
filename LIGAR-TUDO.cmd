@echo off
REM Duplo-clique para ligar tudo (Docker + Postgres + Backend + Frontend) e abrir o localhost.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
pause
