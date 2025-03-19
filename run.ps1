# PowerShell script to run both frontend and backend servers

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check if required commands exist
if (-not (Test-CommandExists "npm")) {
    Write-Error "npm is not installed. Please install Node.js and npm."
    exit 1
}

if (-not (Test-CommandExists "python")) {
    Write-Error "python is not installed. Please install Python."
    exit 1
}

# Start the backend server
Write-Host "Starting Django backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python manage.py runserver"

# Start the frontend server
Write-Host "Starting React frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Both servers are running!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C in the respective terminal windows to stop the servers." -ForegroundColor Cyan 