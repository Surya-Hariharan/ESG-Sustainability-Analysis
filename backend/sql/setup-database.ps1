#!/usr/bin/env pwsh
# ==============================================================================
# ESG Sustainability Analysis - Database Setup Script
# ==============================================================================
# Purpose: Initialize PostgreSQL database and run all SQL migration scripts
# Usage: .\setup-database.ps1 [-Force] [-SkipInit]
# ==============================================================================

param(
    [switch]$Force,      # Force recreation of database (WARNING: Deletes all data!)
    [switch]$SkipInit    # Skip database initialization (use existing database)
)

# ==============================================================================
# Configuration
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Get the project root directory (two levels up from backend/sql)
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# Load .env file from project root
$envFile = Join-Path $ProjectRoot ".env"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "WARNING: .env file not found. Using default values." -ForegroundColor Yellow
}

# Database configuration (PowerShell 5.1 compatible)
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "esg_db" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }

# SQL files directory
$SQL_DIR = $PSScriptRoot

# PostgreSQL connection string
$PGPASSWORD = $DB_PASSWORD
$env:PGPASSWORD = $DB_PASSWORD

# ==============================================================================
# Functions
# ==============================================================================

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Green
}

function Write-Success {
    param([string]$Message)
    Write-Host "    ✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "    ✗ $Message" -ForegroundColor Red
}

function Test-PostgreSQL {
    Write-Step "Checking PostgreSQL connection..."
    
    try {
        $testQuery = 'SELECT version();'
        $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c $testQuery 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is accessible"
            return $true
        } else {
            Write-Host "    Cannot connect to PostgreSQL" -ForegroundColor Red
            Write-Host "    Error: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "    PostgreSQL connection test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Execute-SQLFile {
    param(
        [string]$FilePath,
        [string]$Database = $DB_NAME
    )
    
    $fileName = Split-Path $FilePath -Leaf
    Write-Host "    Executing $fileName..." -ForegroundColor Cyan
    
    try {
        $output = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $Database -f $FilePath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$fileName completed successfully"
            return $true
        } else {
            Write-Error "$fileName failed"
            Write-Host "    Output: $output" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Error "Error executing $fileName : $_"
        return $false
    }
}

function Initialize-Database {
    Write-Step "Initializing database..."
    
    $initFile = Join-Path $SQL_DIR "00_init_database.sql"
    
    if (Test-Path $initFile) {
        if (Execute-SQLFile -FilePath $initFile -Database "postgres") {
            Write-Success "Database initialized"
            return $true
        }
    } else {
        Write-Error "Initialization file not found: $initFile"
        return $false
    }
    
    return $false
}

function Run-Migrations {
    Write-Step "Running database migrations..."
    
    # Get SQL files in order (01, 02, 03, ...)
    $sqlFiles = Get-ChildItem -Path $SQL_DIR -Filter "*.sql" | 
                Where-Object { $_.Name -match '^\d{2}_' } |
                Sort-Object Name
    
    if ($sqlFiles.Count -eq 0) {
        Write-Error "No migration files found in $SQL_DIR"
        return $false
    }
    
    $success = $true
    foreach ($file in $sqlFiles) {
        if (-not (Execute-SQLFile -FilePath $file.FullName)) {
            $success = $false
            break
        }
    }
    
    return $success
}

function Import-CSVData {
    Write-Step "Checking for CSV data import..."
    
    $csvFile = Join-Path $ProjectRoot "data\processed\processed.csv"
    
    if (-not (Test-Path $csvFile)) {
        Write-Host "    No processed CSV file found. Skipping data import." -ForegroundColor Yellow
        Write-Host "    Run the preprocessing notebook first to generate data." -ForegroundColor Yellow
        return $true
    }
    
    Write-Host "    CSV file found. Importing data..." -ForegroundColor Cyan
    
    # Use Python script to import data
    $importScript = Join-Path $ProjectRoot "scripts\database_loader.py"
    
    if (Test-Path $importScript) {
        try {
            python $importScript
            if ($LASTEXITCODE -eq 0) {
                Write-Success "CSV data imported successfully"
                return $true
            } else {
                Write-Error "CSV import failed"
                return $false
            }
        } catch {
            Write-Error "Error running import script: $_"
            return $false
        }
    } else {
        Write-Host "    Import script not found. Skipping automatic import." -ForegroundColor Yellow
        return $true
    }
}

function Show-DatabaseInfo {
    Write-Step "Database Information"
    
    $query = @'
SELECT 
    schemaname AS schema,
    tablename AS table,
    pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) DESC;
'@
    
    Write-Host "`n    Tables and Sizes:" -ForegroundColor Cyan
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $query
    
    $countQuery = @'
SELECT 'esg_companies' AS table_name, COUNT(*) AS row_count FROM esg_companies
UNION ALL
SELECT 'model_predictions', COUNT(*) FROM model_predictions
UNION ALL
SELECT 'news_cache', COUNT(*) FROM news_cache
UNION ALL
SELECT 'agent_analysis_cache', COUNT(*) FROM agent_analysis_cache;
'@
    
    Write-Host "`n    Row Counts:" -ForegroundColor Cyan
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $countQuery
}

# ==============================================================================
# Main Execution
# ==============================================================================

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║   ESG Sustainability Analysis - Database Setup                ║
║   PostgreSQL Database Initialization                          ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host ""

# Confirm if Force flag is set
if ($Force -and -not $SkipInit) {
    Write-Host "WARNING: Force flag is set. This will DELETE all existing data!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Test PostgreSQL connection
if (-not (Test-PostgreSQL)) {
    Write-Host "`nPlease ensure PostgreSQL is running and credentials are correct." -ForegroundColor Red
    Write-Host "Connection: postgresql://$DB_USER@${DB_HOST}:${DB_PORT}" -ForegroundColor Yellow
    exit 1
}

# Initialize database (unless skipped)
if (-not $SkipInit) {
    if ($Force) {
        if (-not (Initialize-Database)) {
            Write-Host "`nDatabase initialization failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Skipping database initialization (use -Force to recreate)." -ForegroundColor Yellow
    }
}

# Run migrations
if (-not (Run-Migrations)) {
    Write-Host "`nMigration failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

# Import CSV data
Import-CSVData | Out-Null

# Show database info
Show-DatabaseInfo

# Success message
Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║   ✓ Database setup completed successfully!                    ║
╚════════════════════════════════════════════════════════════════╝

Next steps:
  1. Verify API keys in .env file (NEWS_API_KEY, GROQ_API_KEY)
  2. Start the backend: cd backend && uvicorn main:app --reload
  3. Start the frontend: cd frontend && npm run dev

"@ -ForegroundColor Green

exit 0
