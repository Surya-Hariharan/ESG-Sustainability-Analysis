@echo off
REM ESG Sustainability Analysis - Quick Start Script (Windows)
REM This script automates the initial setup process

echo ====================================
echo ESG Sustainability Analysis - Quick Start
echo ====================================
echo.

REM Step 1: Check prerequisites
echo Step 1: Checking prerequisites...
echo -----------------------------------

where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker is installed
) else (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker Compose is installed
) else (
    echo [ERROR] Docker Compose is not installed
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python is installed
) else (
    echo [WARNING] Python is not installed
)

echo.

REM Step 2: Environment setup
echo Step 2: Setting up environment...
echo -----------------------------------

if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file from template
    echo [WARNING] Please edit .env with your configuration
    pause
) else (
    echo [INFO] .env file already exists
)

echo.

REM Step 3: Choose deployment method
echo Step 3: Choose deployment method
echo -----------------------------------
echo 1) Docker Compose (Recommended)
echo 2) Local Development Setup
echo 3) Skip deployment
echo.

set /p DEPLOY_CHOICE="Enter your choice (1-3): "

if "%DEPLOY_CHOICE%"=="1" (
    echo.
    echo Starting Docker Compose deployment...
    echo --------------------------------------
    
    REM Create necessary directories
    if not exist logs mkdir logs
    if not exist data\processed mkdir data\processed
    if not exist data\raw mkdir data\raw
    if not exist models mkdir models
    
    REM Start services
    echo Building and starting containers...
    docker-compose up -d --build
    
    REM Wait for services
    echo Waiting for services to be ready...
    timeout /t 10 /nobreak >nul
    
    echo.
    echo [OK] Docker deployment complete!
    echo.
    echo Access your applications:
    echo   Frontend:  http://localhost:3000
    echo   Backend:   http://localhost:8000
    echo   API Docs:  http://localhost:8000/api/docs
    echo   MLflow:    http://localhost:5000
    echo.
    echo View logs: docker-compose logs -f
    echo Stop services: docker-compose down
    
) else if "%DEPLOY_CHOICE%"=="2" (
    echo.
    echo Setting up local development environment...
    echo -------------------------------------------
    
    REM Backend setup
    echo Setting up backend...
    
    if not exist venv (
        python -m venv venv
        echo [OK] Created Python virtual environment
    )
    
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    echo [OK] Installed Python dependencies
    
    REM Pre-commit hooks
    where pre-commit >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        pre-commit install
        echo [OK] Installed pre-commit hooks
    )
    
    REM Frontend setup
    echo Setting up frontend...
    cd frontend
    
    where bun >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        bun install
        echo [OK] Installed frontend dependencies with Bun
    ) else (
        where npm >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            npm install
            echo [OK] Installed frontend dependencies with npm
        )
    )
    
    cd ..
    
    echo.
    echo [OK] Local development setup complete!
    echo.
    echo To start development:
    echo.
    echo Terminal 1 (Backend):
    echo   venv\Scripts\activate.bat
    echo   python -m backend.app
    echo.
    echo Terminal 2 (Frontend):
    echo   cd frontend
    echo   bun run dev  (or npm run dev)
    echo.
    
) else if "%DEPLOY_CHOICE%"=="3" (
    echo Skipping deployment
) else (
    echo Invalid choice
    exit /b 1
)

echo.
echo ==========================================
echo Quick start complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Configure your database connection in .env
echo 2. Apply database schema
echo 3. Load sample data: python scripts\load_db.py
echo 4. Train ML model: python scripts\train_pipeline.py
echo.
echo Documentation:
echo   README.md        - General information
echo   DEPLOYMENT.md    - Deployment guide
echo   CONTRIBUTING.md  - Contribution guidelines
echo.
pause
