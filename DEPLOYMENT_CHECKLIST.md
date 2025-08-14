# Explorer Shack - cPanel Deployment Checklist

## 📦 Production Package Information

**File**: `explorer-shack-production.zip` (356KB)
**Created**: Ready for cPanel deployment
**Excludes**: Development files (node_modules, .git, tests, archive)

## ✅ Pre-Deployment Checklist

### 1. Server Requirements
- [ ] Node.js 18.0.0+ installed on server
- [ ] MySQL 8.0+ or PostgreSQL 13+ database available
- [ ] Minimum 2GB RAM (4GB+ recommended)
- [ ] SSL certificate for HTTPS (required for video testimonials)
- [ ] Domain configured and pointing to server

### 2. cPanel Access
- [ ] cPanel login credentials ready
- [ ] File Manager access confirmed
- [ ] Database creation permissions
- [ ] Terminal/SSH access (if available)

## 🚀 Deployment Steps

### Step 1: Upload Files
1. Login to cPanel
2. Go to File Manager
3. Navigate to `public_html` directory
4. Upload `explorer-shack-production.zip`
5. Extract the zip file
6. Delete the zip file after extraction

### Step 2: Set Permissions
```bash
# Set directory permissions to 755
find /home/yourusername/public_html -type d -exec chmod 755 {} \;

# Set file permissions to 644
find /home/yourusername/public_html -type f -exec chmod 644 {} \;

# Make scripts executable
chmod +x /home/yourusername/public_html/scripts/*.sh
```

### Step 3: Database Setup
1. Go to cPanel → "MySQL Databases"
2. Create database: `yourusername_explorershack`
3. Create database user with full privileges
4. Note down credentials for .env file

### Step 4: Environment Configuration
1. Copy `.env.example` to `.env`
2. Configure all environment variables:
   ```bash
   NODE_ENV=production
   PORT=3001
   
   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=yourusername_explorershack
   DB_USER=yourusername_dbuser
   DB_PASSWORD=your_secure_password
   
   # Domain
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://yourdomain.com/api
   
   # Security
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   CORS_ORIGIN=https://yourdomain.com
   
   # Email
   SMTP_HOST=mail.yourdomain.com
   SMTP_PORT=587
   SMTP_USER=noreply@yourdomain.com
   SMTP_PASS=your_email_password
   ```

### Step 5: Install Dependencies
```bash
# Main dependencies
npm install --production

# Frontend dependencies
cd frontend && npm install --production

# Backend dependencies
cd ../backend && npm install --production

# Admin dependencies
cd ../admin && npm install --production
```

### Step 6: Build Applications
```bash
# Build frontend
cd frontend
npm run build

# Verify build
ls -la .next/
```

### Step 7: Start Services
```bash
# Install PM2 globally
npm install -g pm2

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📁 What's Included in the Package

### Core Application Files
- ✅ **Frontend** (`/frontend/`) - Next.js application
- ✅ **Backend** (`/backend/`) - Express.js API server
- ✅ **Admin Panel** (`/admin/`) - Admin interface
- ✅ **Documentation** (`/documentation/`) - Complete guides
- ✅ **Scripts** (`/scripts/`) - Deployment scripts
- ✅ **Configuration** - Package.json files and configs

### Key Features Included
- ✅ **Experience Booking System** - Complete booking functionality
- ✅ **Video Testimonials** - Post-travel review system
- ✅ **Modern Hero Banner** - GetYourGuide-style homepage
- ✅ **Order Management** - Enhanced admin order system
- ✅ **Multi-Product Support** - Hotels, flights, transfers, car rentals
- ✅ **Admin Controls** - Complete platform administration

### Documentation Included
- ✅ **README.md** - Quick start guide
- ✅ **API_DOCUMENTATION.md** - Complete API reference
- ✅ **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- ✅ **USER_GUIDE.md** - End-user documentation

## 🔧 Post-Deployment Verification

### Health Checks
1. **Backend API**: `curl https://yourdomain.com/api/health`
2. **Frontend**: Visit `https://yourdomain.com`
3. **Admin Panel**: Visit `https://yourdomain.com/admin`
4. **Database**: Test connection via admin panel

### Test Core Features
- [ ] Homepage loads correctly
- [ ] Experience search works
- [ ] Booking process functional
- [ ] Admin panel accessible
- [ ] Video testimonial recording (requires HTTPS)

## 🆘 Troubleshooting

### Common Issues
1. **Node.js not found**: Install Node.js 18+ on server
2. **Permission errors**: Check file/directory permissions
3. **Database connection**: Verify credentials in .env
4. **SSL issues**: Ensure HTTPS for video testimonials
5. **Port conflicts**: Check if ports 3000, 3001, 3002 are available

### Support Resources
- **Complete Documentation**: `/documentation/` folder
- **Deployment Guide**: Detailed step-by-step instructions
- **API Documentation**: For integrations and troubleshooting

## 📞 Need Help?

### Documentation References
1. **Deployment Guide** (`documentation/DEPLOYMENT_GUIDE.md`)
   - Complete cPanel deployment instructions
   - FileZilla upload process
   - Manual server setup

2. **API Documentation** (`documentation/API_DOCUMENTATION.md`)
   - All API endpoints and examples
   - Authentication and security details

3. **User Guide** (`documentation/USER_GUIDE.md`)
   - End-user instructions
   - Feature explanations

### Quick Commands
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Check disk space
df -h

# Check permissions
ls -la
```

---

**Explorer Shack Production Package**
*Ready for cPanel deployment - All features included*

🌍 Your complete travel booking platform is ready to go live!
