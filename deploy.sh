# Deployment script for PropNova
# This script will help you deploy your changes to both Vercel (frontend) and Render (backend)

# Function to display colored text
function print_colored() {
    local color=$1
    local text=$2
    
    case $color in
        "green") echo -e "\e[32m$text\e[0m" ;;
        "red") echo -e "\e[31m$text\e[0m" ;;
        "yellow") echo -e "\e[33m$text\e[0m" ;;
        "blue") echo -e "\e[34m$text\e[0m" ;;
        *) echo "$text" ;;
    esac
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_colored "red" "Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Ensure we have the correct environment files
if [ ! -f ".env.production" ]; then
    print_colored "red" "Missing .env.production file. Please create it first."
    exit 1
fi

# Copy production env file for Vercel
print_colored "blue" "Preparing environment for production deployment..."
cp .env.production .env

# Ensure backend has correct CORS settings
if grep -q "CORS_ORIGIN=http://localhost" "./backend/.env"; then
    print_colored "yellow" "Updating CORS settings in backend/.env..."
    sed -i 's|CORS_ORIGIN=http://localhost.*|CORS_ORIGIN=https://www.nova-prop.com|g' ./backend/.env
fi

# Add all changes to git
print_colored "blue" "Adding files to git..."
git add .

# Commit changes
print_colored "blue" "Committing changes..."
read -p "Enter commit message: " commit_message
git commit -m "$commit_message"

# Push to remote
print_colored "blue" "Pushing to remote repository..."
git push

print_colored "green" "Deployment initiated!"
print_colored "yellow" "Note: Vercel and Render should automatically deploy your changes if you have CI/CD set up."
print_colored "yellow" "Check your deployment status at:"
print_colored "yellow" "  - Vercel: https://vercel.com/dashboard"
print_colored "yellow" "  - Render: https://dashboard.render.com"

print_colored "green" "Your app will be available at:"
print_colored "green" "  - Frontend: https://www.nova-prop.com"
print_colored "green" "  - Backend API: https://nova-prop-backend.onrender.com/api"
