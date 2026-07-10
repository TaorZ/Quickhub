@echo off
echo ========================================
echo QuickHub - Hub de Acessos Rápidos
echo ========================================
echo.

:: Verifica se Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org
    pause
    exit /b 1
)

:: Verifica se npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo [1/3] Verificando dependencias...

:: Instala dependências se necessário
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo ERRO ao instalar dependencias!
        pause
        exit /b 1
    )
) else (
    echo Dependencias ja instaladas.
)

echo.
echo [2/3] Iniciando QuickHub...
echo.

:: Inicia o app
call npm start

echo.
echo [3/3] QuickHub encerrado.
pause
