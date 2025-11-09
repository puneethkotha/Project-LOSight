# Fix: CSV File Not Found on Render

The CSV file (368MB) is too large for GitHub. Here are solutions:

## Solution 1: Create Sample Data (Quickest - Recommended)

This creates a smaller sample that can be included in GitHub:

1. **Run the sampling script locally:**
   ```bash
   cd "/Users/puneeth/Downloads/DSMB EDA/interactive_dashboard"
   python3 create_sample_data.py
   ```

2. **This creates `hospital_data_clean_base_all_drgs.csv` in the dashboard folder** (sampled to ~100K rows, < 100MB)

3. **Add it to git:**
   ```bash
   git add hospital_data_clean_base_all_drgs.csv
   git commit -m "Add sampled dataset for deployment"
   git push origin main
   ```

4. **Render will auto-redeploy** and the file will be available

## Solution 2: Upload via Render Shell

1. **Go to your Render service dashboard**
2. **Click "Shell" tab**
3. **Run these commands:**
   ```bash
   # Navigate to your app directory
   cd /opt/render/project/src
   
   # Check current directory
   pwd
   ls -la
   ```

4. **Upload CSV using one of these methods:**

   **Option A: Using wget/curl (if you host CSV online)**
   - Upload CSV to Google Drive, make it shareable, get direct link
   - Or use Dropbox direct link
   - Then in Render shell:
     ```bash
     wget "YOUR_CSV_URL" -O hospital_data_clean_base_all_drgs.csv
     ```

   **Option B: Using Render CLI**
   ```bash
   # Install Render CLI locally
   npm i -g render-cli
   
   # Login
   render login
   
   # Upload file
   render file upload /path/to/hospital_data_clean_base_all_drgs.csv
   ```

   **Option C: Use Render Persistent Disk**
   - Go to Settings → Mount Disk
   - Mount a 1GB disk
   - Upload CSV to `/mnt/disk/`
   - Update server.py to look there

## Solution 3: Modify Server to Download from URL

If you upload CSV to cloud storage (Google Drive, Dropbox, S3):

1. **Get a direct download link** to your CSV
2. **Update `server.py`** to download on startup:

```python
import urllib.request

def load_data():
    global df
    if df is not None:
        return df
    
    # Try local paths first
    data_paths = [
        os.path.join(BASE_DIR, '..', 'hospital_data_clean_base_all_drgs.csv'),
        os.path.join(BASE_DIR, 'hospital_data_clean_base_all_drgs.csv'),
        '../hospital_data_clean_base_all_drgs.csv',
        'hospital_data_clean_base_all_drgs.csv'
    ]
    
    csv_path = None
    for path in data_paths:
        if os.path.exists(path):
            csv_path = path
            break
    
    # If not found locally, download from URL
    if csv_path is None:
        csv_url = os.environ.get('CSV_URL', 'YOUR_CSV_DOWNLOAD_URL')
        csv_path = os.path.join(BASE_DIR, 'hospital_data_clean_base_all_drgs.csv')
        
        if not os.path.exists(csv_path):
            print(f"Downloading CSV from {csv_url}...")
            urllib.request.urlretrieve(csv_url, csv_path)
            print("✓ CSV downloaded")
    
    df = pd.read_csv(csv_path, low_memory=False)
    # ... rest of your code
```

3. **Set environment variable in Render:**
   - Go to Settings → Environment
   - Add: `CSV_URL` = your download link

## Recommended: Solution 1 (Sample Data)

For a class project/demo, a 100K row sample is usually sufficient and much easier to deploy. The sampling script creates a representative sample that maintains the key patterns in your data.

## After Fixing

1. **Redeploy on Render** (or wait for auto-deploy)
2. **Check logs** to verify CSV loads
3. **Test dashboard** to ensure it works

---

**Quick Command Summary:**
```bash
# Create sample
python3 create_sample_data.py

# Add to git
git add hospital_data_clean_base_all_drgs.csv
git commit -m "Add sampled dataset"
git push origin main

# Render auto-deploys - wait 5-10 minutes
```

