@echo off
echo ========================================
echo QuickHub - Teste de Configuracao
echo ========================================
echo.

:: Verifica Node.js
echo [1/5] Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo FALHA: Node.js nao encontrado!
    echo Instale: https://nodejs.org
    goto :error
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo OK: Node.js %NODE_VERSION%
)
echo.

:: Verifica npm
echo [2/5] Verificando npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo FALHA: npm nao encontrado!
    goto :error
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo OK: npm %NPM_VERSION%
)
echo.

:: Verifica package.json
echo [3/5] Verificando package.json...
if exist "package.json" (
    echo OK: package.json encontrado
) else (
    echo FALHA: package.json nao encontrado!
    goto :error
)
echo.

:: Verifica node_modules
echo [4/5] Verificando dependencias...
if exist "node_modules" (
    echo OK: node_modules encontrado
) else (
    echo AVISO: node_modules nao encontrado
    echo Execute: npm install
)
echo.

:: Verifica estrutura
echo [5/5] Verificando estrutura do projeto...
if exist "src\main\index.js" (
    echo OK: src\main\index.js
) else (
    echo FALHA: src\main\index.js nao encontrado!
    goto :error
)

if exist "src\renderer\index.html" (
    echo OK: src\renderer\index.html
) else (
    echo FALHA: src\renderer\index.html nao encontrado!
    goto :error
)

if exist "src\renderer\css\styles.css" (
    echo OK: src\renderer\css\styles.css
) else (
    echo FALHA: src\renderer\css\styles.css nao encontrado!
    goto :error
)

if exist "src\renderer\js\hub.js" (
    echo OK: src\renderer\js\hub.js
) else (
    echo FALHA: src\renderer\js\hub.js nao encontrado!
    goto :error
)

echo.
echo ========================================
echo Todos os testes passaram!
echo ========================================
echo.
echo O projeto esta configurado corretamente.
echo.
echo Para iniciar o app:
echo   npm start
echo.
echo Ou execute:
echo   iniciar.bat
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo Teste falhou!
echo ========================================
echo.
echo Verifique os erros acima e corrija-os.
echo.
pause
exit /b 1
