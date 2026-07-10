@echo off
echo ========================================
echo QuickHub - Modo Desenvolvimento
echo ========================================
echo.

:: Verifica se Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)

:: Verifica se dependências estão instaladas
if not exist "node_modules" (
    echo Dependencias nao encontradas!
    echo Execute: instalar.bat
    pause
    exit /b 1
)

echo Iniciando QuickHub em modo desenvolvimento...
echo.
echo Pressione Ctrl+C para encerrar
echo.

call npm start

pause
