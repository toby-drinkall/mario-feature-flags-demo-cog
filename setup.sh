#!/bin/bash

# Setup script for Mario Feature Flags Dashboard
# This script helps you configure your Devin API key

echo "==================================="
echo "Mario Feature Flags Dashboard Setup"
echo "==================================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "A .env file already exists."
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Setup cancelled. Your existing .env file was not modified."
        exit 0
    fi
fi

echo ""
echo "Please enter your Devin API key."
echo "(You can get this from https://app.devin.ai/settings)"
echo ""
read -p "API Key: " api_key

if [ -z "$api_key" ]; then
    echo "Error: API key cannot be empty."
    exit 1
fi

# Create .env file
echo "DEVIN_API_KEY=$api_key" > .env

echo ""
echo "Setup complete! Your API key has been saved to .env"
echo ""
echo "To start the dashboard:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:8000/cognition-dashboard-premium.html"
echo ""
