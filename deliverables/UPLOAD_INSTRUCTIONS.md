# Explorer Shack - Upload Instructions
## Multiple Methods for Deployment

---

## Overview

This document provides comprehensive instructions for uploading the Explorer Shack project to your hosting environment using various methods. Follow the method that works best for your hosting provider and technical setup.

---

## Method 1: FTP Upload using FileZilla (Recommended)

### Prerequisites
- Download and install [FileZilla Client](https://filezilla-project.org/download.php?type=client)
- Obtain FTP credentials from your hosting provider

### Step-by-Step Instructions

1. **Open FileZilla and Configure Connection**
   - Launch FileZilla
   - Go to `File > Site Manager`
   - Click `New Site` and name it "Explorer Shack"
   - Enter your hosting details:
     - **Protocol:** FTP or SFTP
     - **Host:** Your domain or server IP
     - **Port:** 21 (FTP) or 22 (SFTP)
     - **Logon Type:** Normal
     - **User:** Your FTP username
     - **Password:** Your FTP password

2. **Connect to Server**
   - Click `Connect`
   - Accept any security certificates if prompted
   - You should see your server files in the right panel

3. **Navigate to Web Root**
   - Common web root directories:
     - `public_html/`
     - `www/`
     - `htdocs/`
     - `web/`

4. **Upload Project Files**
   - In the left panel, navigate to your local `deliverables/explorer-booking/` folder
   - Select all files and folders
   - Right-click and choose `Upload`
   - Wait for upload to complete (may take 5-15 minutes depending on connection)

5. **Set Permissions**
   - Right-click on uploaded folders
   - Choose `File Permissions`
   - Set directories to `755`
   - Set files to `644`

---

## Method 2: SFTP via Command Line

### Prerequisites
- SSH/SFTP access to your server
- Terminal or Command Prompt access

### Commands

```bash
# Create a clean archive (run from project root)
cd /path/to/your/project
tar -czf explorer-shack.tar.gz deliverables/explorer-booking/ --exclude='node_modules' --exclude='.git' --exclude='*.log'

# Upload via SFTP
sftp username@your-server.com
put explorer-shack.tar.gz
quit

# SSH into server and extract
ssh username@your-server.com
cd /path/to/web/root
tar -xzf explorer-shack.tar.gz
mv deliverables/explorer-booking/* .
rm -rf deliverables/
rm explorer-shack.tar.gz

# Set proper permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
```

---

## Method 3: cPanel File Manager

### Step-by-Step Instructions

1. **Access cPanel**
   - Log into your hosting control panel
   - Look for "File Manager" icon
   - Click to open File Manager

2. **Navigate to Web Root**
   - Click on `public_html` or your domain folder
   - This is where your website files should go

3. **Create Archive Locally**
   ```bash
   # Create a clean zip file
   cd deliverables/
   zip -r explorer-shack-clean.zip explorer-booking/ -x "*/node_modules/*" "*/.git/*" "*.log" "*.tmp"
   ```

4. **Upload Archive**
   - In File Manager, click `Upload`
   - Select your `explorer-shack-clean.zip` file
   - Wait for upload to complete

5. **Extract Files**
   - Right-click on the uploaded zip file
   - Choose `Extract`
   - Select destination (usually current directory)
   - Click `Extract Files`

6. **Move Files to Root**
   - Navigate into `explorer-booking` folder
   - Select all files and folders
   - Click `Move`
   - Move to parent directory (`../`)

7. **Clean Up**
   - Delete the zip file
   - Delete the empty `explorer-booking` folder

---

## Method 4: Git Deployment (Advanced)

### Prerequisites
- Git installed on server
- SSH access to server

### Setup

```bash
# On your server
cd /path/to/web/root
git clone https://github.com/yourusername/explorer-shack.git .
cd deliverables/explorer-booking/
cp -r * ../../
cd ../../
rm -rf deliverables/

# Set up automatic deployment (optional)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Future Updates
```bash
git pull origin main
# Copy updated files as needed
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Virus Detected" or "Malicious File" Errors
**Cause:** Some hosting providers flag zip files or JavaScript files as potentially malicious.

**Solutions:**
- Use FTP/SFTP instead of zip upload
- Upload files individually rather than as an archive
- Contact hosting support to whitelist your files
- Use `.tar.gz` format instead of `.zip`

#### 2. Permission Denied Errors
**Cause:** Incorrect file permissions on server.

**Solution:**
```bash
# Set correct permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 644 *.html *.css *.js
```

#### 3. Files Not Displaying
**Cause:** Files uploaded to wrong directory.

**Solution:**
- Ensure files are in web root directory
- Check if your domain points to a subdirectory
- Verify index.html is in the correct location

#### 4. Database Connection Errors
**Cause:** Database configuration not updated for production.

**Solution:**
- Update database credentials in configuration files
- Ensure database exists on hosting server
- Import database schema if needed

#### 5. Node.js/npm Errors
**Cause:** Server doesn't support Node.js or modules not installed.

**Solution:**
- Check if hosting supports Node.js
- Install dependencies on server: `npm install`
- Use static HTML version if Node.js not supported

---

## File Integrity Verification

### Generate Checksum (Before Upload)
```bash
# Generate SHA256 checksum
sha256sum explorer-shack-clean.zip > checksum.txt
```

### Verify Checksum (After Upload)
```bash
# On server, verify integrity
sha256sum -c checksum.txt
```

---

## Post-Upload Checklist

- [ ] All files uploaded successfully
- [ ] Correct file permissions set (755 for directories, 644 for files)
- [ ] Database connection configured (if applicable)
- [ ] Environment variables set for production
- [ ] SSL certificate installed and configured
- [ ] Domain DNS pointing to correct server
- [ ] Test all major functionality
- [ ] Check mobile responsiveness
- [ ] Verify contact forms work
- [ ] Test booking system end-to-end

---

## Performance Optimization

### After Upload
1. **Enable Gzip Compression**
   - Add to `.htaccess`:
   ```apache
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

2. **Set Cache Headers**
   ```apache
   <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType image/jpg "access plus 1 month"
       ExpiresByType image/jpeg "access plus 1 month"
       ExpiresByType image/gif "access plus 1 month"
       ExpiresByType image/png "access plus 1 month"
       ExpiresByType text/css "access plus 1 month"
       ExpiresByType application/pdf "access plus 1 month"
       ExpiresByType application/javascript "access plus 1 month"
       ExpiresByType application/x-javascript "access plus 1 month"
       ExpiresByType application/x-shockwave-flash "access plus 1 month"
       ExpiresByType image/x-icon "access plus 1 year"
       ExpiresDefault "access plus 2 days"
   </IfModule>
   ```

---

## Security Considerations

### Recommended Security Headers
Add to `.htaccess`:
```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';"
```

---

## Support and Maintenance

### Regular Maintenance Tasks
- **Weekly:** Check for broken links and forms
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Review and optimize performance
- **Annually:** Renew SSL certificates and domain registration

### Getting Help
- **Hosting Support:** Contact your hosting provider for server-specific issues
- **Technical Issues:** Check browser console for JavaScript errors
- **Performance Issues:** Use tools like GTmetrix or PageSpeed Insights

---

## Contact Information

For technical support with this deployment:
- **Email:** support@explorershack.com
- **Documentation:** Check project README.md for additional details
- **Emergency:** Contact hosting provider directly for server issues

---

*Last Updated: January 2025*
*Version: 1.0*
