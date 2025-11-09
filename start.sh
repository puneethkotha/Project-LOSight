#!/bin/bash

echo "=========================================="
echo "Hospital LOS Dashboard - Starting Server"
echo "=========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -q -r requirements.txt

# Check dataset
if [ ! -f "../hospital_data_clean_base_all_drgs.csv" ]; then
    echo "⚠️  Warning: Dataset not found at ../hospital_data_clean_base_all_drgs.csv"
    echo "   The server will try to find it automatically."
    echo ""
fi

# Start server
echo "🚀 Starting Flask server..."
echo "📊 Dashboard will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

python3 server.py

