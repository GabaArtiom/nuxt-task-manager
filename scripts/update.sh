#!/bin/bash
source ~/.nvm/nvm.sh

# --- Color Definitions ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color (Reset)

# --- Helper Function for Status Messages ---
log_success() {
  echo -e "---- ${GREEN}âœ” $1${NC} ----"
}

log_error() {
  echo -e "---- ${RED}âœ˜ $1${NC} ----"
}

log_info() {
  echo -e "---- ${BLUE}â„¹ $1${NC} ----"
}

# --- Script Execution ---

# Check for package.json
if [ ! -f package.json ]; then
  log_error "package.json not found! Please run this script in the project root directory."
  exit 1
fi

echo -e "${YELLOW}Switching Node version...${NC}"
nvm use 22
log_success "Using Node.js version 22"

log_info "Pulling latest code from Git..."
git pull
log_success "Git pull completed successfully!"

log_info "Installing dependencies..."
bun install
log_success "Dependencies installed successfully!"

log_info "Building the project..."
bun run build
log_success "Build completed successfully!"

log_info "Cleaning up..."
rm -rf node_modules
log_success "Removed node_modules"

log_info "Restarting PM2 process..."
pm2 restart ag-backend-challenge
log_success "Application ag-backend-challenge restarted successfully!"
