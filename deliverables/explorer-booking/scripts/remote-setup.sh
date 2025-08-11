#!/bin/bash

# Set up Node.js environment
source ~/.nvm/nvm.sh
nvm use 16

# Extract deployment packages
cd $CPANEL_PATH
unzip -o backend.zip -d backend
unzip -o frontend.zip -d frontend
unzip -o admin.zip -d admin

# Install PM2 if not present
npm install -g pm2

# Start applications using PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set up startup script
pm2 startup

echo "Remote setup completed successfully!"
