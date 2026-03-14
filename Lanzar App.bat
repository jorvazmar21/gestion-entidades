@echo off
echo Iniciando Servidor Local de Gestion Entidades...
start http://localhost:8000
python -m http.server 8000
