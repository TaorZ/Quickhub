@echo off
echo ========================================
echo QuickHub - Instalacao Rapida
echo ========================================
echo.

:: Verifica se Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org
    echo.
    echo Apos instalar, execute este script novamente.
    pause
    exit /b 1
)

echo [1/4] Node.js encontrado!
node --version
echo.

:: Verifica se npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo [2/4] npm encontrado!
npm --version
echo.

:: Instala dependências
echo [3/4] Instalando dependencias...
echo Isso pode levar alguns minutos...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERRO ao instalar dependencias!
    echo Tente executar manualmente: npm install
    pause
    exit /b 1
)

echo.
echo [4/4] Dependencias instaladas com sucesso!
echo.
echo ========================================
echo Instalacao concluida!
echo ========================================
echo.
echo Para iniciar o QuickHub, execute:
echo   iniciar.bat
echo.
echo Ou manualmente:
echo   npm start
echo.
pause
