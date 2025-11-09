# 🚀 START HERE - How to Run the Dashboard

## ⚠️ IMPORTANT: Use HTTP (not HTTPS)

**The "connection is not private" error means you're using HTTPS.**
- ❌ **WRONG**: `https://localhost:5000`
- ✅ **CORRECT**: `http://localhost:5000`

## Step-by-Step Instructions

### Step 1: Open Terminal
Open Terminal (or iTerm) on your Mac.

### Step 2: Navigate to the Dashboard Folder
```bash
cd "/Users/puneeth/Downloads/DSMB EDA/interactive_dashboard"
```

### Step 3: Start the Server
```bash
python3 run_server.py
```

**OR** use the original:
```bash
python3 server.py
```

### Step 4: Wait for This Message
You should see:
```
============================================================
Starting Hospital LOS Dashboard Server
============================================================

Loading data...
✓ Loading data from: [path]
✓ Data loaded: [number] rows × [number] columns

✓ Server ready!
✓ Dashboard available at: http://localhost:5000
```

### Step 5: Open Browser
**IMPORTANT**: Use `http://` (NOT `https://`)

Open your browser and go to:
```
http://localhost:5000
```

## ✅ What You Should See

- A purple gradient header saying "Hospital Length of Stay Dashboard"
- A sidebar with filters on the left
- Charts and visualizations on the right
- Multiple tabs at the top (Overview, Severity, Demographics, etc.)

## 🐛 Troubleshooting

### "Connection refused" or "Can't connect"
- Make sure the server is running (you should see "✓ Server ready!" in terminal)
- Check that you're using `http://localhost:5000` (not https://)

### "Connection is not private"
- You're using `https://` instead of `http://`
- Change `https://localhost:5000` to `http://localhost:5000`

### "ModuleNotFoundError"
- Run: `pip3 install --break-system-packages flask flask-cors pandas numpy`

### Port 5000 already in use
- Kill the process: `lsof -ti:5000 | xargs kill -9`
- Or change port in `server.py` (last line): `port=5001`
- Then use: `http://localhost:5001`

### Nothing loads / blank page
- Check browser console (Press F12, go to Console tab)
- Look for errors in the terminal where server is running
- Make sure you clicked "Apply Filters" button

## 📞 Still Having Issues?

1. **Check Terminal Output**: Look for any error messages in red
2. **Check Browser Console**: Press F12 → Console tab → Look for errors
3. **Verify Dataset**: Make sure `hospital_data_clean_base_all_drgs.csv` exists in parent directory

## 🎯 Quick Test

To test if server works, try this in terminal:
```bash
curl http://localhost:5000/
```

If you see HTML output, the server is working! Just open it in a browser using `http://localhost:5000`

