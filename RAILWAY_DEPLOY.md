# Railway Deployment Guide

## Step-by-Step Instructions

### Step 1: Prepare Your Code on GitHub

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   cd interactive_dashboard
   git init
   git add .
   git commit -m "Hospital LOS Dashboard"
   ```

2. **Push to GitHub**:
   - Go to [github.com](https://github.com) and create a new repository
   - Name it: `Project-LOSight` (or `project-losight`)
   - Don't initialize with README (you already have files)
   - Copy the repository URL
   - Run:
     ```bash
     git remote add origin YOUR_GITHUB_REPO_URL
     git branch -M main
     git push -u origin main
     ```

### Step 2: Deploy on Railway

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - You should see your dashboard

2. **Create New Project**
   - Click **"New Project"** button (top right)
   - Select **"Deploy from GitHub repo"**
   - Authorize Railway to access your GitHub (if first time)
   - Select your repository: `Project-LOSight` (or `project-losight`)

3. **Configure the Service**
   - Railway will auto-detect it's a Python project
   - It should automatically:
     - Detect `requirements.txt`
     - Set build command: `pip install -r requirements.txt`
     - Set start command: `python server.py`
   
   **If it doesn't auto-detect:**
   - Click on your service
   - Go to **"Settings"** tab
   - Under **"Build & Deploy"**:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python server.py`
     - **Root Directory**: Leave blank (or `interactive_dashboard` if your repo root is the parent folder)

4. **Set Root Directory (if needed)**
   - If your repo structure is:
     ```
     your-repo/
       ├── interactive_dashboard/
       │   ├── server.py
       │   ├── requirements.txt
       │   └── static/
       └── hospital_data_clean_base_all_drgs.csv
     ```
   - Then set **Root Directory** to: `interactive_dashboard`
   
   - If your repo structure is:
     ```
     your-repo/
       ├── server.py
       ├── requirements.txt
       └── static/
     ```
   - Then leave **Root Directory** blank

5. **Add the CSV File**
   Railway needs access to your CSV file. You have a few options:

   **Option A: Include in GitHub (Recommended if < 100MB)**
   - Add the CSV to your GitHub repo:
     ```bash
     # From the parent directory
     cp hospital_data_clean_base_all_drgs.csv interactive_dashboard/
     cd interactive_dashboard
     git add hospital_data_clean_base_all_drgs.csv
     git commit -m "Add dataset CSV"
     git push
     ```
   - Railway will automatically redeploy

   **Option B: Use Railway's File System**
   - After deployment, go to your service
   - Use Railway's file browser or CLI to upload the CSV
   - Place it in the same directory as `server.py`

   **Option C: Store in Cloud Storage**
   - Upload CSV to Google Drive, Dropbox, or S3
   - Modify `server.py` to download from URL (more complex)

6. **Wait for Deployment**
   - Railway will automatically:
     - Install dependencies from `requirements.txt`
     - Start your Flask server
   - Watch the **"Deployments"** tab for progress
   - First deployment takes 3-5 minutes

7. **Get Your URL**
   - Once deployed, Railway will show your app URL
   - It will be something like: `https://your-app-name.up.railway.app`
   - Click the URL or the **"Generate Domain"** button

### Step 3: Verify Deployment

1. **Check Logs**
   - Go to **"Deployments"** tab
   - Click on the latest deployment
   - Check **"Logs"** to see if there are any errors
   - Look for: `✓ Server ready!` message

2. **Test Your Dashboard**
   - Open your Railway URL in a browser
   - The dashboard should load
   - Try applying some filters to test functionality

### Step 4: Share Your Dashboard

Your dashboard is now live! Share the Railway URL with anyone:
- Example: `https://project-losight.up.railway.app`

---

## Troubleshooting

### Issue: "Could not find hospital_data_clean_base_all_drgs.csv"

**Solution**: Make sure the CSV file is in the correct location:
- If Root Directory is blank: CSV should be in repo root
- If Root Directory is `interactive_dashboard`: CSV should be in `interactive_dashboard/` folder

### Issue: Build fails

**Solution**: 
- Check `requirements.txt`` is correct
- Check Railway logs for specific error
- Make sure Python version is compatible (Railway uses Python 3.11 by default)

### Issue: App crashes after deployment

**Solution**:
- Check logs in Railway dashboard
- Verify CSV file path is correct
- Check if memory limit is exceeded (free tier has 512MB RAM)

### Issue: Slow loading

**Solution**:
- Free tier has limited resources
- Consider sampling data for faster performance
- Or upgrade to paid plan for better performance

---

## Railway Free Tier Limits

- **512MB RAM** - Should be enough for your dataset
- **$5 free credit/month** - Usually enough for a small app
- **Auto-sleep** - Free tier apps sleep after inactivity (wakes on first request)

---

## Pro Tips

1. **Environment Variables**: You can add custom env vars in Railway Settings
2. **Custom Domain**: Railway allows custom domains (paid feature)
3. **Auto-Deploy**: Every push to GitHub auto-deploys (can disable in settings)
4. **Monitoring**: Check the "Metrics" tab to see resource usage

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] GitHub repo connected
- [ ] CSV file accessible (in repo or uploaded)
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `python server.py`
- [ ] Root directory set correctly (if needed)
- [ ] Deployment successful
- [ ] Dashboard loads at Railway URL

---

**Need help?** Check Railway's [documentation](https://docs.railway.app) or their Discord community.

