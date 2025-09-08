# Deployment script for PropNova
# This script will help you deploy your changes to both Vercel (frontend) and Render (backend)

function Write-Colored {
    param(
        [string]$Color,
        [string]$Text
    )
    
    switch ($Color) {
        "green" { Write-Host $Text -ForegroundColor Green }
        "red" { Write-Host $Text -ForegroundColor Red }
        "yellow" { Write-Host $Text -ForegroundColor Yellow }
        "blue" { Write-Host $Text -ForegroundColor Blue }
        default { Write-Host $Text }
    }
}

# Check if git is initialized
if (-not (Test-Path -Path ".git")) {
    Write-Colored "red" "Git repository not initialized. Please run 'git init' first."
    exit 1
}

# Ensure we have the correct environment files
if (-not (Test-Path -Path ".env.production")) {
    Write-Colored "red" "Missing .env.production file. Please create it first."
    exit 1
}

# Copy production env file for Vercel
Write-Colored "blue" "Preparing environment for production deployment..."
Copy-Item -Path ".env.production" -Destination ".env" -Force

# Ensure backend has correct CORS settings
$envContent = Get-Content -Path "./backend/.env" -Raw
if ($envContent -match "CORS_ORIGIN=http://localhost") {
    Write-Colored "yellow" "Updating CORS settings in backend/.env..."
    $updatedContent = $envContent -replace "CORS_ORIGIN=http://localhost.*", "CORS_ORIGIN=https://www.nova-prop.com"
    Set-Content -Path "./backend/.env" -Value $updatedContent
}

# Add all changes to git
Write-Colored "blue" "Adding files to git..."
git add .

# Commit changes
Write-Colored "blue" "Committing changes..."
$commitMessage = Read-Host "Enter commit message"
git commit -m $commitMessage

# Push to remote
Write-Colored "blue" "Pushing to remote repository..."
git push

Write-Colored "green" "Deployment initiated!"
Write-Colored "yellow" "Note: Vercel and Render should automatically deploy your changes if you have CI/CD set up."
Write-Colored "yellow" "Check your deployment status at:"
Write-Colored "yellow" "  - Vercel: https://vercel.com/dashboard"
Write-Colored "yellow" "  - Render: https://dashboard.render.com"

Write-Colored "green" "Your app will be available at:"
Write-Colored "green" "  - Frontend: https://www.nova-prop.com"
Write-Colored "green" "  - Backend API: https://nova-prop-backend.onrender.com/api"
