# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
cd interactive_dashboard
pip3 install -r requirements.txt
```

Or if you prefer pip:
```bash
pip install -r requirements.txt
```

## Step 2: Start the Server

**Option A: Using the startup script (Mac/Linux)**
```bash
./start.sh
```

**Option B: Manual start**
```bash
python3 server.py
```

## Step 3: Open in Browser

Once the server starts, you'll see:
```
✓ Server ready!
✓ Dashboard available at: http://localhost:5000
```

Open your browser and go to: **http://localhost:5000**

## ✅ That's It!

The dashboard will load with all visualizations from your notebook.

### What You'll See:

1. **Sidebar Filters** - Filter by severity, age, payment type, etc.
2. **Overview Tab** - LOS distribution and statistics
3. **Severity Tab** - Severity analysis and interactions
4. **Demographics Tab** - Age and gender analysis
5. **Payment Tab** - Payment type and disposition
6. **Trends Tab** - Top DRG codes
7. **Outliers Tab** - Outlier detection and statistics

### How to Use:

1. **Apply Filters**: Select filter values and click "Apply Filters"
2. **View Charts**: Switch between tabs to see different analyses
3. **Reset**: Click "Reset All" to clear filters

## 🐛 Troubleshooting

**"ModuleNotFoundError: No module named 'flask'"**
- Run: `pip3 install -r requirements.txt`

**"Dataset not found"**
- Make sure `hospital_data_clean_base_all_drgs.csv` is in the parent directory
- The server will try to find it automatically

**"Port 5000 already in use"**
- Change the port in `server.py` (line at the bottom)
- Change `port=5000` to `port=5001` (or any other port)

**Nothing loads in browser**
- Make sure the server is running (you should see "✓ Server ready!")
- Check the terminal for any error messages
- Try refreshing the page (Ctrl+R or Cmd+R)

## 📞 Need Help?

Check the full README.md for more details!

