#!/bin/bash
# MIS School System - Netlify Deployment Script

echo "🚀 Deploying MIS School System to Netlify..."
echo ""

# Check if files exist
if [ ! -f "index.html" ] || [ ! -f "styles.css" ] || [ ! -f "script.js" ]; then
    echo "❌ Error: Required files not found!"
    echo "Make sure you have: index.html, styles.css, script.js"
    exit 1
fi

echo "📁 Files found:"
ls -la index.html styles.css script.js
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
rm -f mis-school-system.zip
zip -r mis-school-system.zip index.html styles.css script.js

echo "✅ Deployment package created: mis-school-system.zip"
echo ""
echo "🌐 To deploy:"
echo "1. Go to https://netlify.com"
echo "2. Sign in or create account"
echo "3. Drag 'mis-school-system.zip' to the deployment area"
echo "4. Your site will be live in seconds!"
echo ""
echo "🎉 Deployment ready!"