@echo off
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Frontend Unit Tests Runner
echo ========================================
echo.
echo Testing 14 Frontend Components
echo Total Test Cases: 230+
echo.

echo Installing dependencies if needed...
call npm install --legacy-peer-deps >nul 2>&1

if errorlevel 1 (
    echo Warning: npm install may have encountered issues
    echo Attempting to run tests anyway...
)

echo.
echo ========================================
echo   Running Vitest Test Suite
echo ========================================
echo.

node node_modules\vitest\vitest.mjs --run

echo.
if errorlevel 0 (
    echo ✓ Tests Completed
) else (
    echo ✗ Tests Failed
)
echo ========================================
echo.
