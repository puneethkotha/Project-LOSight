#!/usr/bin/env python3
"""
Simple server startup script with error handling
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("=" * 60)
    print("Starting Hospital LOS Dashboard Server")
    print("=" * 60)
    print()
    
    from server import app, load_data
    
    print("Loading data...")
    load_data()
    print()
    print("✓ Server ready!")
    print("✓ Dashboard available at: http://localhost:5000")
    print("✓ Make sure to use HTTP (not HTTPS)")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
    
except KeyboardInterrupt:
    print("\n\nServer stopped by user")
    sys.exit(0)
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

