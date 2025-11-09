# Upload CSV to Cloud Storage (Free Solution)

Since Render's persistent disk requires a paid plan, we'll use free cloud storage (Google Drive or Dropbox) and download the CSV automatically on first startup.

## Step 1: Upload CSV to Google Drive

### Option A: Google Drive (Recommended)

1. **Upload the CSV file:**
   - Go to [drive.google.com](https://drive.google.com)
   - Click "New" → "File upload"
   - Select `hospital_data_clean_base_all_drgs.csv` (368MB)
   - Wait for upload to complete

2. **Make it shareable:**
   - Right-click the file → "Share"
   - Click "Change to anyone with the link"
   - Set permission to "Viewer"
   - Click "Copy link"

3. **Get direct download link:**
   - The link will look like: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
   - Convert it to direct download format:
     - Replace `/view?usp=sharing` with `/uc?export=download&id=FILE_ID`
     - Or use: `https://drive.google.com/uc?export=download&id=FILE_ID`
   
   **To get FILE_ID:**
   - From the share link: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
   - Copy the FILE_ID part (long string between `/d/` and `/view`)

4. **Test the download link:**
   - Open the direct download URL in a new browser tab
   - It should start downloading the CSV file
   - If it works, you're good to go!

### Option B: Dropbox

1. **Upload the CSV file:**
   - Go to [dropbox.com](https://dropbox.com)
   - Upload `hospital_data_clean_base_all_drgs.csv`

2. **Get shareable link:**
   - Right-click the file → "Share" → "Create a link"
   - Copy the link

3. **Convert to direct download:**
   - The link looks like: `https://www.dropbox.com/s/FILE_ID/filename.csv?dl=0`
   - Change `?dl=0` to `?dl=1` for direct download
   - Final URL: `https://www.dropbox.com/s/FILE_ID/hospital_data_clean_base_all_drgs.csv?dl=1`

## Step 2: Set Environment Variable in Render

1. **Go to your Render service dashboard**
2. **Click "Environment" tab**
3. **Add a new environment variable:**
   - **Key**: `CSV_DOWNLOAD_URL`
   - **Value**: Your direct download URL from Step 1
   - Example: `https://drive.google.com/uc?export=download&id=YOUR_FILE_ID`
4. **Click "Save Changes"**
5. **Redeploy your service** (Render will auto-redeploy, or click "Manual Deploy")

## Step 3: How It Works

When your Render service starts:

1. It first checks for the CSV file locally (won't find it on first run)
2. If not found, it checks the `CSV_DOWNLOAD_URL` environment variable
3. If the URL is set, it downloads the CSV from cloud storage
4. Saves it locally in the app directory
5. Loads the data into memory
6. On subsequent restarts, it uses the cached local file (faster)

## Important Notes

- **First startup takes longer** (5-10 minutes to download 368MB)
- **Subsequent startups are fast** (uses cached file)
- **Free tier works** - no paid plan needed
- **Full dataset** - no data loss, uses complete 1.9M rows
- **Automatic** - downloads only if file doesn't exist locally

## Troubleshooting

### Download fails?
- Check the download URL works in a browser
- Verify the file is set to "Anyone with the link can view"
- For Google Drive: Make sure you're using the `/uc?export=download&id=FILE_ID` format
- For Dropbox: Make sure `?dl=1` is at the end

### Still can't download?
- Check Render logs for error messages
- Verify the environment variable is set correctly
- Try the URL in a browser first to confirm it works

### Slow download?
- 368MB takes time on free tier (5-10 minutes)
- This only happens on first startup
- After that, it uses the cached file

## Alternative: Use a Smaller Sample (If Needed)

If cloud storage doesn't work, you can create a sample:

```python
import pandas as pd

# Load full dataset
df = pd.read_csv('hospital_data_clean_base_all_drgs.csv')

# Sample 100K rows (or adjust as needed)
df_sample = df.sample(n=100000, random_state=42)

# Save
df_sample.to_csv('hospital_data_sample.csv', index=False)
```

Then include the sample in GitHub (if under 100MB) and update server.py to use it.

---

**This solution keeps your full dataset without requiring a paid plan!**

