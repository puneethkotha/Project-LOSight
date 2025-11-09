# Adding CSV to Render (Free Tier)

Since Render's free tier doesn't support persistent disks, here are your options:

## Option 1: Sample the Data (Recommended for Demos)

This creates a smaller file (<100MB) that can be included in GitHub.

### Step 1: Create Sample

```bash
cd "/Users/puneeth/Downloads/DSMB EDA/interactive_dashboard"
python3 create_sample.py
```

This will create `hospital_data_sample.csv` (~80MB) with a representative sample of your data.

### Step 2: Add to GitHub

```bash
git add hospital_data_sample.csv
git commit -m "Add sampled dataset for deployment"
git push origin main
```

### Step 3: Deploy to Render

Render will automatically include the file when it deploys. The server will automatically use the sample file if the full dataset isn't available.

**Pros:**
- Works with free tier
- No additional setup needed
- Fast deployment
- Good for demos/presentations

**Cons:**
- Not the full dataset
- May miss some patterns in rare cases

---

## Option 2: Cloud Storage + Download (Best for Full Dataset)

Upload CSV to cloud storage and download on startup.

### Step 1: Upload to Cloud Storage

**Google Drive:**
1. Upload `hospital_data_clean_base_all_drgs.csv` to Google Drive
2. Right-click → Share → "Anyone with the link"
3. Get the file ID from the URL: `https://drive.google.com/file/d/FILE_ID/view`
4. Create direct download link: `https://drive.googleapis.com/uc?export=download&id=FILE_ID`

**Dropbox:**
1. Upload CSV to Dropbox
2. Right-click → Share → Copy link
3. Replace `www.dropbox.com` with `dl.dropboxusercontent.com` in the URL
4. Remove `?dl=0` and add `?dl=1` at the end

### Step 2: Update server.py

Add this function to download the CSV:

```python
import urllib.request

def download_csv_from_url(url, local_path):
    """Download CSV from cloud storage"""
    print(f"Downloading CSV from cloud storage...")
    urllib.request.urlretrieve(url, local_path)
    print(f"✓ Downloaded to: {local_path}")
```

Then in `load_data()`, add:

```python
# Try downloading from cloud storage if file doesn't exist
if not any(os.path.exists(p) for p in data_paths):
    csv_url = os.environ.get('CSV_DOWNLOAD_URL')
    if csv_url:
        local_path = os.path.join(BASE_DIR, 'hospital_data_clean_base_all_drgs.csv')
        download_csv_from_url(csv_url, local_path)
        data_paths.insert(0, local_path)
```

### Step 3: Set Environment Variable in Render

1. Go to your Render service → **Environment** tab
2. Add new variable:
   - **Key**: `CSV_DOWNLOAD_URL`
   - **Value**: Your Google Drive/Dropbox direct download URL
3. Save and redeploy

**Pros:**
- Full dataset available
- Works with free tier
- No file size limits

**Cons:**
- Slower first startup (downloads 368MB)
- Requires cloud storage account
- More setup

---

## Option 3: Use Render Shell (Manual Upload)

If Render provides shell access on free tier:

1. Go to your service → **Shell** tab
2. Navigate to project directory:
   ```bash
   cd /opt/render/project/src
   ```
3. Use `wget` or `curl` to download from cloud storage:
   ```bash
   wget "YOUR_CLOUD_STORAGE_URL" -O hospital_data_clean_base_all_drgs.csv
   ```

**Note:** Files uploaded this way may be lost on redeploy (free tier doesn't persist files outside the repo).

---

## Recommendation

**For your project presentation/demo:**
- Use **Option 1 (Sample)** - It's the easiest and works perfectly for showcasing the dashboard

**If you need the full dataset:**
- Use **Option 2 (Cloud Storage)** - More setup but gives you the complete data

---

## Quick Start (Sample Method)

```bash
# 1. Create sample
cd "/Users/puneeth/Downloads/DSMB EDA/interactive_dashboard"
python3 create_sample.py

# 2. Add to git
git add hospital_data_sample.csv .gitignore
git commit -m "Add sampled dataset for Render deployment"
git push origin main

# 3. Deploy to Render (the sample will be included automatically)
```

That's it! Render will use the sample file automatically.

