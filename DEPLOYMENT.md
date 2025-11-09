# Deployment Guide - Hospital LOS Dashboard

This guide explains how to deploy the dashboard to various hosting platforms.

## Option 1: Render (Recommended - Free & Easy)

### Steps:

1. **Create a GitHub Repository**
   - Go to GitHub and create a new repository
   - Push your `interactive_dashboard` folder to GitHub
   - Make sure `hospital_data_clean_base_all_drgs.csv` is in the parent directory (or adjust paths)

2. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign up (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch
   - Configure:
     - **Name**: `hospital-los-dashboard` (or your choice)
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python server.py`
     - **Root Directory**: `interactive_dashboard` (if your repo root is the parent folder)
   - Click "Create Web Service"
   - Wait for deployment (first time takes ~5-10 minutes)

3. **Upload CSV File**
   - The CSV file needs to be accessible. Options:
     - **Option A**: Include it in the GitHub repo (if under 100MB)
     - **Option B**: Use Render's file system (upload via dashboard)
     - **Option C**: Store in cloud storage (S3, etc.) and load from URL

4. **Your dashboard will be live at**: `https://your-app-name.onrender.com`

---

## Option 2: Railway (Free Tier Available)

1. **Sign up at [railway.app](https://railway.app)**
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Configure**:
   - Root Directory: `interactive_dashboard`
   - Start Command: `python server.py`
5. **Add the CSV file** to your repository or use Railway's file system
6. **Deploy** - Railway auto-detects Python and installs dependencies

---

## Option 3: PythonAnywhere (Free Tier)

1. **Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)** (free tier available)
2. **Upload your files**:
   - Go to "Files" tab
   - Upload `interactive_dashboard` folder
   - Upload `hospital_data_clean_base_all_drgs.csv` to the same directory
3. **Create a Web App**:
   - Go to "Web" tab → "Add a new web app"
   - Choose "Flask" → Python 3.10
   - Set source code path: `/home/yourusername/interactive_dashboard`
4. **Configure WSGI file**:
   - Edit the WSGI file to point to your Flask app
   - Example: `from interactive_dashboard.server import app`
5. **Reload** the web app

---

## Option 4: Heroku (Paid, but has free alternatives)

1. **Install Heroku CLI**
2. **Create `Procfile`** (already created)
3. **Deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

---

## Important Notes:

### File Size Considerations:
- The CSV file is ~1.9M rows, which may be large for some free tiers
- **Render**: Free tier has 512MB RAM, should work but may be slow
- **Railway**: Free tier has 512MB RAM, similar to Render
- **PythonAnywhere**: Free tier has 512MB storage, may need to compress or sample data

### Performance Tips:
1. **Sample the data** for faster loading (already implemented in some endpoints)
2. **Use caching** (already implemented with global cache)
3. **Consider data compression** or using a database instead of CSV

### Environment Variables:
- `PORT`: Automatically set by hosting platforms
- `FLASK_ENV`: Set to `production` for production (debug=False)

### CSV File Location:
Make sure the CSV file path matches your deployment structure. The current code looks for:
- `../hospital_data_clean_base_all_drgs.csv` (parent directory)
- `hospital_data_clean_base_all_drgs.csv` (same directory)

Adjust paths in `server.py` if needed for your deployment structure.

---

## Quick Start (Render):

1. Push code to GitHub
2. Connect to Render
3. Deploy
4. Share your URL!

Your dashboard will be accessible at: `https://your-app-name.onrender.com`

