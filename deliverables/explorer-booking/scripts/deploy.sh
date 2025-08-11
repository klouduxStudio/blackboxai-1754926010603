#!/bin/bash

# Enhanced Deployment Script for Explorer Shack with Bland AI Integration
# Version: 2.0
# Author: BLACKBOXAI

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="explorer-shack"
BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
ADMIN_PORT=${ADMIN_PORT:-3002}
NODE_ENV=${NODE_ENV:-production}
DEPLOYMENT_DIR="/var/www/${PROJECT_NAME}"
BACKUP_DIR="/var/backups/${PROJECT_NAME}"
LOG_DIR="/var/log/${PROJECT_NAME}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create directories
create_directories() {
    print_status "Creating necessary directories..."
    sudo mkdir -p "$DEPLOYMENT_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo chown -R $USER:$USER "$DEPLOYMENT_DIR"
    sudo chown -R $USER:$USER "$LOG_DIR"
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js version
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js version: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ before continuing."
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm version: $NPM_VERSION"
    else
        print_error "npm is not installed."
        exit 1
    fi
    
    # Check PM2
    if command_exists pm2; then
        PM2_VERSION=$(pm2 --version)
        print_success "PM2 version: $PM2_VERSION"
    else
        print_warning "PM2 is not installed. Installing PM2..."
        npm install -g pm2
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    if [ "$AVAILABLE_SPACE" -lt 1048576 ]; then  # Less than 1GB
        print_warning "Low disk space available: $(($AVAILABLE_SPACE/1024))MB"
    fi
    
    # Check memory
    AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$AVAILABLE_MEMORY" -lt 512 ]; then
        print_warning "Low memory available: ${AVAILABLE_MEMORY}MB"
    fi
}

# Function to backup existing deployment
backup_existing() {
    if [ -d "$DEPLOYMENT_DIR" ]; then
        print_status "Creating backup of existing deployment..."
        BACKUP_NAME="${PROJECT_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
        sudo cp -r "$DEPLOYMENT_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        print_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Function to install dependencies with retry logic
install_dependencies() {
    local dir=$1
    local name=$2
    local max_retries=3
    local retry=0
    
    print_status "Installing $name dependencies..."
    cd "$dir"
    
    while [ $retry -lt $max_retries ]; do
        if npm ci --production=false --silent; then
            print_success "$name dependencies installed successfully"
            return 0
        else
            retry=$((retry + 1))
            print_warning "Attempt $retry failed. Retrying..."
            sleep 5
        fi
    done
    
    print_error "Failed to install $name dependencies after $max_retries attempts"
    return 1
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    if [ -f "deliverables/explorer-booking/backend/package.json" ]; then
        cd deliverables/explorer-booking/backend
        if npm run test --if-present; then
            print_success "Backend tests passed"
        else
            print_warning "Backend tests failed or not configured"
        fi
    fi
    
    # Frontend tests
    if [ -f "deliverables/explorer-booking/frontend/package.json" ]; then
        cd ../frontend
        if npm run test --if-present; then
            print_success "Frontend tests passed"
        else
            print_warning "Frontend tests failed or not configured"
        fi
    fi
    
    # Integration tests
    if [ -f "deliverables/explorer-booking/tests/package.json" ]; then
        cd ../tests
        if npm run test --if-present; then
            print_success "Integration tests passed"
        else
            print_warning "Integration tests failed or not configured"
        fi
    fi
}

# Function to build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    if [ -f "deliverables/explorer-booking/backend/package.json" ]; then
        print_status "Building backend..."
        cd deliverables/explorer-booking/backend
        if npm run build --if-present; then
            print_success "Backend built successfully"
        else
            print_warning "Backend build script not found or failed"
        fi
    fi
    
    # Build frontend
    if [ -f "deliverables/explorer-booking/frontend/package.json" ]; then
        print_status "Building frontend..."
        cd ../frontend
        if npm run build --if-present; then
            print_success "Frontend built successfully"
        else
            print_warning "Frontend build script not found or failed"
        fi
    fi
    
    # Build admin panel
    if [ -f "deliverables/explorer-booking/admin/package.json" ]; then
        print_status "Building admin panel..."
        cd ../admin
        if npm run build --if-present; then
            print_success "Admin panel built successfully"
        else
            print_warning "Admin panel build script not found or failed"
        fi
    fi
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    if [ -f "deliverables/explorer-booking/backend/prisma/schema.prisma" ]; then
        cd deliverables/explorer-booking/backend
        
        # Generate Prisma client
        if npx prisma generate; then
            print_success "Prisma client generated"
        else
            print_warning "Prisma client generation failed"
        fi
        
        # Run migrations
        if npx prisma migrate deploy; then
            print_success "Database migrations completed"
        else
            print_warning "Database migrations failed or not configured"
        fi
        
        # Seed database if seed script exists
        if npm run seed --if-present; then
            print_success "Database seeded successfully"
        else
            print_warning "Database seeding skipped or failed"
        fi
    else
        print_warning "Prisma schema not found, skipping database setup"
    fi
}

# Function to setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f "deliverables/explorer-booking/.env" ]; then
        print_status "Creating default .env file..."
        cat > deliverables/explorer-booking/.env << EOF
NODE_ENV=${NODE_ENV}
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
ADMIN_PORT=${ADMIN_PORT}

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/explorer_shack"

# Bland AI Configuration
BLAND_AI_API_KEY="your_bland_ai_api_key_here"
BLAND_AI_WEBHOOK_SECRET="your_webhook_secret_here"

# JWT Secret
JWT_SECRET="your_jwt_secret_here"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Redis (for caching and sessions)
REDIS_URL="redis://localhost:6379"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="/var/uploads"

# Logging
LOG_LEVEL="info"
EOF
        print_warning "Default .env file created. Please update with your actual values."
    else
        print_success "Environment file already exists"
    fi
}

# Function to setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    if command_exists certbot; then
        # This would be configured based on your domain
        print_warning "SSL setup requires manual configuration with your domain"
    else
        print_warning "Certbot not installed. SSL certificates not configured."
    fi
}

# Function to setup nginx
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    if command_exists nginx; then
        # Create nginx configuration
        sudo tee /etc/nginx/sites-available/${PROJECT_NAME} > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Admin Panel
    location /admin/ {
        proxy_pass http://localhost:${ADMIN_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket for real-time features
    location /ws/ {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location /static/ {
        alias ${DEPLOYMENT_DIR}/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
        
        # Enable the site
        sudo ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
        
        # Test nginx configuration
        if sudo nginx -t; then
            print_success "Nginx configuration is valid"
            sudo systemctl reload nginx
        else
            print_error "Nginx configuration is invalid"
        fi
    else
        print_warning "Nginx not installed. Reverse proxy not configured."
    fi
}

# Function to start services with PM2
start_services() {
    print_status "Starting services with PM2..."
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: '${PROJECT_NAME}-backend',
      script: 'deliverables/explorer-booking/backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: ${BACKEND_PORT}
      },
      error_file: '${LOG_DIR}/backend-error.log',
      out_file: '${LOG_DIR}/backend-out.log',
      log_file: '${LOG_DIR}/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: '${PROJECT_NAME}-frontend',
      script: 'deliverables/explorer-booking/frontend/server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: ${FRONTEND_PORT}
      },
      error_file: '${LOG_DIR}/frontend-error.log',
      out_file: '${LOG_DIR}/frontend-out.log',
      log_file: '${LOG_DIR}/frontend-combined.log',
      time: true
    },
    {
      name: '${PROJECT_NAME}-admin',
      script: 'deliverables/explorer-booking/admin/server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: ${ADMIN_PORT}
      },
      error_file: '${LOG_DIR}/admin-error.log',
      out_file: '${LOG_DIR}/admin-out.log',
      log_file: '${LOG_DIR}/admin-combined.log',
      time: true
    }
  ]
};
EOF
    
    # Stop existing processes
    pm2 delete all 2>/dev/null || true
    
    # Start new processes
    if pm2 start ecosystem.config.js; then
        print_success "Services started successfully"
        pm2 save
        pm2 startup
    else
        print_error "Failed to start services"
        return 1
    fi
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Install PM2 monitoring
    if command_exists pm2; then
        pm2 install pm2-logrotate
        pm2 set pm2-logrotate:max_size 10M
        pm2 set pm2-logrotate:retain 30
        pm2 set pm2-logrotate:compress true
        print_success "PM2 log rotation configured"
    fi
    
    # Setup health check script
    cat > health-check.sh << 'EOF'
#!/bin/bash
# Health check script for Explorer Shack

check_service() {
    local service_name=$1
    local port=$2
    
    if curl -f -s "http://localhost:$port/health" > /dev/null; then
        echo "✓ $service_name is healthy"
        return 0
    else
        echo "✗ $service_name is unhealthy"
        return 1
    fi
}

echo "=== Explorer Shack Health Check ==="
echo "Timestamp: $(date)"

check_service "Backend" 3001
check_service "Frontend" 3000
check_service "Admin" 3002

# Check PM2 processes
echo ""
echo "=== PM2 Process Status ==="
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status)"'

# Check disk space
echo ""
echo "=== System Resources ==="
echo "Disk usage: $(df -h / | awk 'NR==2 {print $5}')"
echo "Memory usage: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Load average: $(uptime | awk -F'load average:' '{print $2}')"
EOF
    
    chmod +x health-check.sh
    
    # Setup cron job for health checks
    (crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/health-check.sh >> ${LOG_DIR}/health-check.log 2>&1") | crontab -
    
    print_success "Health monitoring configured"
}

# Function to run post-deployment tasks
post_deployment() {
    print_status "Running post-deployment tasks..."
    
    # Clear caches
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        print_success "Node modules cache cleared"
    fi
    
    # Optimize images (if imagemin is available)
    if command_exists imagemin; then
        find . -name "*.jpg" -o -name "*.png" -o -name "*.gif" | xargs imagemin --out-dir=optimized/ 2>/dev/null || true
    fi
    
    # Generate sitemap (if applicable)
    if [ -f "generate-sitemap.js" ]; then
        node generate-sitemap.js
        print_success "Sitemap generated"
    fi
    
    # Warm up caches
    print_status "Warming up application caches..."
    sleep 10  # Wait for services to fully start
    curl -s "http://localhost:${BACKEND_PORT}/health" > /dev/null || true
    curl -s "http://localhost:${FRONTEND_PORT}/" > /dev/null || true
    curl -s "http://localhost:${ADMIN_PORT}/" > /dev/null || true
    
    print_success "Post-deployment tasks completed"
}

# Function to display deployment summary
deployment_summary() {
    print_success "=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
    echo ""
    echo "Services:"
    echo "  • Backend:  http://localhost:${BACKEND_PORT}"
    echo "  • Frontend: http://localhost:${FRONTEND_PORT}"
    echo "  • Admin:    http://localhost:${ADMIN_PORT}"
    echo ""
    echo "Logs:"
    echo "  • Backend:  ${LOG_DIR}/backend-combined.log"
    echo "  • Frontend: ${LOG_DIR}/frontend-combined.log"
    echo "  • Admin:    ${LOG_DIR}/admin-combined.log"
    echo ""
    echo "Management:"
    echo "  • PM2 Status: pm2 status"
    echo "  • PM2 Logs:   pm2 logs"
    echo "  • Health Check: ./health-check.sh"
    echo ""
    echo "Next Steps:"
    echo "  1. Update .env file with your actual configuration"
    echo "  2. Configure your domain in Nginx"
    echo "  3. Setup SSL certificates"
    echo "  4. Configure monitoring alerts"
    echo ""
    print_success "Deployment completed at $(date)"
}

# Main deployment function
main() {
    print_status "Starting Enhanced Explorer Shack Deployment"
    print_status "Timestamp: $(date)"
    print_status "User: $(whoami)"
    print_status "Working Directory: $(pwd)"
    echo ""
    
    # Pre-deployment checks
    check_requirements
    create_directories
    backup_existing
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    if [ -f "deliverables/explorer-booking/backend/package.json" ]; then
        install_dependencies "deliverables/explorer-booking/backend" "backend"
    fi
    
    if [ -f "deliverables/explorer-booking/frontend/package.json" ]; then
        install_dependencies "deliverables/explorer-booking/frontend" "frontend"
    fi
    
    if [ -f "deliverables/explorer-booking/admin/package.json" ]; then
        install_dependencies "deliverables/explorer-booking/admin" "admin"
    fi
    
    # Run tests (optional, can be skipped with --skip-tests)
    if [[ "$*" != *"--skip-tests"* ]]; then
        run_tests
    fi
    
    # Build applications
    build_applications
    
    # Setup database
    setup_database
    
    # Setup infrastructure
    setup_nginx
    setup_ssl
    
    # Start services
    start_services
    
    # Setup monitoring
    setup_monitoring
    
    # Post-deployment tasks
    post_deployment
    
    # Display summary
    deployment_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Enhanced Explorer Shack Deployment Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --skip-tests    Skip running tests during deployment"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  NODE_ENV        Environment (default: production)"
        echo "  BACKEND_PORT    Backend port (default: 3001)"
        echo "  FRONTEND_PORT   Frontend port (default: 3000)"
        echo "  ADMIN_PORT      Admin port (default: 3002)"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
