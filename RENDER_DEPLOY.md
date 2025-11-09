# Deploy to Render - Step by Step

Render offers a free tier that supports Flask applications. Here's how to deploy your dashboard.

## Step 1: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended - easier deployment)

## Step 2: Create a Web Service

1. Once logged in, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub account if you haven't already
4. Select your repository: `puneethkotha/Project-LOSight`

## Step 3: Configure Your Service

Fill in the configuration:

- **Name**: `project-losight` (or your choice)
- **Region**: Choose closest to you (e.g., Oregon for US West)
- **Branch**: `main`
- **Root Directory**: Leave blank (or `interactive_dashboard` if your repo root is the parent folder)
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python server.py`

**Important Settings:**
- **Plan**: Select **"Free"** (512MB RAM, spins down after 15 min inactivity)
- **Auto-Deploy**: Yes (redeploys on every GitHub push)

Click **"Create Web Service"**

## Step 4: Wait for Deployment

- Render will start building (takes 5-10 minutes first time)
- Watch the build logs in real-time
- Look for: "Your service is live at https://..."

## Step 5: Add the CSV File

The CSV file (368MB) is too large for GitHub. You need to add it to Render:

### Option A: Upload via Render Shell (Recommended)

1. After deployment, go to your service dashboard
2. Click **"Shell"** tab
3. Run these commands:
   ```bash
   # Navigate to your app directory
   cd /opt/render/project/src
   
   # Create a data directory
   mkdir -p data
   
   # You'll need to upload the file - Render doesn't have direct file upload
   # Use Option B instead
   ```

### Option B: Use Render's Persistent Disk (Better for large files)

1. Go to your service → **"Settings"**
2. Scroll to **"Persistent Disk"**
3. Click **"Mount Disk"** (free tier: 1GB)
4. Note the mount path (usually `/mnt/disk`)
5. Upload CSV via:
   - **Render CLI**: `render file upload /mnt/disk/hospital_data_clean_base_all_drgs.csv`
   - Or use SCP/SFTP if available

### Option C: Store CSV in Cloud Storage (Best for large files)

1. Upload CSV to:
   - Google Drive (make it shareable)
   - Dropbox (get direct link)
   - AWS S3 (if you have account)
2. Modify `server.py` to download from URL on startup
3. This is more complex but handles large files better

### Option D: Sample the Data (Quick Solution)

If the full dataset isn't critical for the demo:

1. Create a smaller sample (e.g., 100K rows)
2. Include it in GitHub (under 100MB)
3. Update the code to use the sampled file

## Step 6: Update CSV Path (if needed)

If you uploaded CSV to a different location, update `server.py`:

```python
# In load_data() function, add your path:
csv_paths = [
    '/mnt/disk/hospital_data_clean_base_all_drgs.csv',  # If using persistent disk
    # ... other paths
]
```

## Step 7: Test Your Dashboard

1. Your dashboard URL will be: `https://project-losight.onrender.com` (or your chosen name)
2. Open it in a browser
3. Test filters and visualizations
4. Check that data loads correctly

## Important Notes

### Free Tier Limitations:
- **512MB RAM** - Should work but may be slow with large datasets
- **Spins down after 15 min inactivity** - First request after spin-down takes ~30 seconds
- **750 hours/month free** - Usually enough for a project
- **Auto-deploy on push** - Every GitHub push triggers redeployment

### Performance Tips:
- The CSV loading takes time on first request
- Consider caching or pre-loading data
- Sample data if full dataset isn't needed for demo

### Troubleshooting:

**Build fails?**
- Check build logs for errors
- Verify `requirements.txt` is correct
- Check Python version compatibility

**CSV not found?**
- Verify CSV path in `server.py`
- Check file permissions
- Look at service logs for path errors

**App crashes?**
- Check service logs
- Verify memory limits (free tier: 512MB)
- Consider sampling data if memory issues

**Slow loading?**
- Free tier has limited resources
- First load after spin-down is slow
- Consider upgrading to paid plan for better performance

## Your Dashboard URL

Once deployed, your dashboard will be available at:
`https://your-service-name.onrender.com`

Share this URL with your professor!

---

**Need help?** Check Render's [documentation](https://render.com/docs) or their community forum.

