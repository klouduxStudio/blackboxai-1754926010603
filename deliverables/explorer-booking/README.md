# Explorer Shack - Booking System

A comprehensive booking system for adventure businesses with modern UI, video testimonials, and robust backend API.

## 🚀 Features

### Core Booking System
- **Tours & Activities**: Browse and book adventure experiences
- **Hotels**: Search and reserve accommodations
- **Transfers**: Airport and city transfers
- **Flights**: Flight booking integration
- **Car Rentals**: Vehicle rental services

### Video Testimonials (New Feature)
- **HD Video Recording**: Record testimonials directly in the browser
- **Full Recording Controls**: Record, pause, resume, stop, preview
- **Download & Share**: Download videos locally or share online
- **Recording History**: Sidebar with past recordings and metadata
- **User Authentication**: Secure access with login requirements
- **Admin Approval**: Backend moderation system for testimonials

### Admin Panel
- **Booking Management**: Comprehensive booking administration
- **Bulk Upload**: Mass import of attractions and services
- **Analytics**: Real-time reporting and insights
- **User Management**: Customer and staff administration
- **Content Management**: Tours, hotels, and service management

### Backend API
- **RESTful APIs**: Complete set of booking and management endpoints
- **File Upload**: Secure video and image upload handling
- **Authentication**: JWT-based user authentication
- **Rate Limiting**: API protection and abuse prevention
- **Logging**: Comprehensive request and error logging

## 📋 Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Database**: PostgreSQL or MySQL (optional for basic setup)
- **Web Server**: Apache/Nginx (for production deployment)
- **SSL Certificate**: For HTTPS (recommended for production)

## 🛠 Installation

### Quick Start (Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deliverables/explorer-booking
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the applications**
   ```bash
   npm run build
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Option 1: Automated Deployment Script

1. **Make deployment script executable**
   ```bash
   chmod +x scripts/deploy.sh
   ```

2. **Run deployment**
   ```bash
   ./scripts/deploy.sh
   ```

#### Option 2: Manual Deployment

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Start services**
   ```bash
   npm run start
   ```

## 🌐 UAT Environment Setup

### cPanel Deployment

Follow the comprehensive guides in the `deliverables/` directory:

- **[UPLOAD_INSTRUCTIONS.md](../UPLOAD_INSTRUCTIONS.md)**: File upload methods (FTP, SFTP, cPanel)
- **[INSTALL.md](../INSTALL.md)**: Complete installation and maintenance guide

### Key Steps for cPanel:

1. **Upload Files**
   - Use FTP/SFTP or cPanel File Manager
   - Upload entire `deliverables/explorer-booking/` directory
   - Set permissions: 755 for directories, 644 for files

2. **Database Setup**
   - Create MySQL database via cPanel
   - Import schema if available
   - Update database credentials in `.env`

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update all configuration values
   - Ensure secure API keys and secrets

4. **Install Dependencies**
   ```bash
   cd /path/to/your/project
   npm run install:all
   ```

5. **Build and Deploy**
   ```bash
   npm run build
   ./scripts/deploy.sh
   ```

## 📁 Project Structure

```
deliverables/explorer-booking/
├── frontend/                 # Frontend application
│   ├── index.html           # Main landing page
│   ├── video-testimonial.html # Video recording page
│   ├── pages/               # Page components
│   │   └── video-recording.js # Video recording functionality
│   ├── components/          # Reusable UI components
│   └── package.json         # Frontend dependencies
├── backend/                 # Backend API server
│   ├── server.js           # Main server file
│   ├── api/                # API endpoints
│   │   ├── testimonials.js # Video testimonial API
│   │   ├── bookings.js     # Booking management
│   │   └── ...             # Other API endpoints
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic services
│   └── package.json        # Backend dependencies
├── admin/                  # Admin panel
│   ├── index.html          # Admin dashboard
│   ├── *.js               # Admin functionality modules
│   └── package.json        # Admin dependencies
├── scripts/                # Deployment and utility scripts
│   ├── deploy.sh           # Automated deployment script
│   └── remote-setup.sh     # Remote server setup
├── tests/                  # Test suites
│   ├── integration/        # Integration tests
│   └── unit/              # Unit tests
├── .env.example           # Environment variables template
└── package.json           # Main project configuration
```

## 🎥 Video Testimonial Feature

### User Experience
1. **Authentication**: Users must sign in to record testimonials
2. **Camera Access**: Browser requests camera/microphone permissions
3. **Recording Controls**: Full control over recording process
4. **Preview & Download**: Review recordings before saving
5. **History Management**: Track and manage past recordings

### Technical Implementation
- **MediaRecorder API**: Browser-native video recording
- **File Upload**: Secure video upload to backend
- **Storage**: Local storage for history, server storage for approved videos
- **Streaming**: Range-request support for video playback
- **Admin Moderation**: Backend approval system

### Browser Support
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.3+)
- **Edge**: Full support

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Application
NODE_ENV=production
BACKEND_PORT=3001
FRONTEND_PORT=3000
ADMIN_PORT=3002

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/explorer_shack

# Security
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=104857600  # 100MB
UPLOAD_DIR=./uploads

# Video Testimonials
TESTIMONIAL_MAX_DURATION=300  # 5 minutes
TESTIMONIAL_AUTO_APPROVE=false
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# Integration tests
npm run test:integration
```

### Video Testimonial Tests
```bash
# Run video testimonial specific tests
cd tests/integration
npm test video-testimonial.test.js
```

## 📊 Monitoring & Logging

### Health Checks
- **Backend**: `GET /health`
- **Frontend**: Browser console for client-side errors
- **Admin**: Admin panel health indicators

### Log Files (Production)
- **Backend**: `/var/log/explorer-shack/backend-combined.log`
- **Frontend**: Browser developer tools
- **Admin**: `/var/log/explorer-shack/admin-combined.log`

### PM2 Process Management
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all
```

## 🔒 Security

### Best Practices Implemented
- **Helmet.js**: Security headers
- **CORS**: Cross-origin request protection
- **Rate Limiting**: API abuse prevention
- **File Validation**: Secure file upload handling
- **JWT Authentication**: Secure user sessions
- **Input Validation**: Request data sanitization

### File Upload Security
- **File Type Validation**: Only video files accepted
- **Size Limits**: 100MB maximum file size
- **Virus Scanning**: Recommended for production
- **Storage Isolation**: Uploaded files stored securely

## 🚀 Performance

### Optimization Features
- **Compression**: Gzip compression enabled
- **Caching**: Static asset caching
- **CDN Ready**: External asset loading
- **Lazy Loading**: On-demand resource loading
- **Video Streaming**: Range-request support

### Monitoring
- **Health Checks**: Automated system monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Comprehensive error logging
- **Resource Usage**: Memory and CPU monitoring

## 🆘 Troubleshooting

### Common Issues

#### Video Recording Not Working
- **Check Browser Support**: Ensure modern browser
- **Camera Permissions**: Allow camera/microphone access
- **HTTPS Required**: Video recording requires secure context
- **File Size**: Check if video exceeds size limits

#### Upload Failures
- **File Type**: Ensure video file format is supported
- **Network**: Check internet connection stability
- **Server Space**: Verify server has sufficient storage
- **Permissions**: Check file/directory permissions

#### Deployment Issues
- **Dependencies**: Run `npm run install:all`
- **Environment**: Verify `.env` configuration
- **Permissions**: Set correct file permissions (755/644)
- **Ports**: Ensure ports are available and not blocked

### Getting Help

1. **Check Logs**: Review application and server logs
2. **Browser Console**: Check for JavaScript errors
3. **Network Tab**: Inspect failed requests
4. **Health Endpoints**: Test API connectivity

## 📞 Support

### Documentation
- **Installation Guide**: `deliverables/INSTALL.md`
- **Upload Instructions**: `deliverables/UPLOAD_INSTRUCTIONS.md`
- **API Documentation**: Available in admin panel

### Contact
- **Technical Support**: Check project repository issues
- **Deployment Help**: Refer to deployment guides
- **Feature Requests**: Submit via project repository

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Tailwind CSS**: For modern, responsive styling
- **Font Awesome**: For comprehensive icon library
- **Google Fonts**: For beautiful typography
- **MediaRecorder API**: For browser-native video recording
- **Express.js**: For robust backend framework

---

**Explorer Shack** - Discover Amazing Adventures 🏔️✈️🏨
