# CSV File Setup

## Important: CSV File Not Included in Repository

The `hospital_data_clean_base_all_drgs.csv` file is **368MB** and is too large for GitHub (100MB file size limit).

## How to Add the CSV File

### For Local Development:
1. Place `hospital_data_clean_base_all_drgs.csv` in the parent directory:
   ```
   DSMB EDA/
     ├── interactive_dashboard/
     │   ├── server.py
     │   └── ...
     └── hospital_data_clean_base_all_drgs.csv
   ```

### For Railway/Production Deployment:

**Option 1: Upload via Railway Dashboard (Recommended)**
1. Deploy your app to Railway
2. Go to Railway dashboard → Your service → "Files" tab
3. Upload `hospital_data_clean_base_all_drgs.csv` to the root directory
4. Restart the service

**Option 2: Use Railway CLI**
```bash
railway login
railway link
railway upload hospital_data_clean_base_all_drgs.csv
```

**Option 3: Store in Cloud Storage**
- Upload CSV to Google Drive, Dropbox, or AWS S3
- Modify `server.py` to download from URL (requires code changes)

### For Other Hosting Platforms:
- **Render**: Upload via dashboard or use file system
- **Heroku**: Use Heroku CLI or add-on storage
- **PythonAnywhere**: Upload via Files tab

## File Location

The server looks for the CSV file in these locations (in order):
1. `../hospital_data_clean_base_all_drgs.csv` (parent directory)
2. `./hospital_data_clean_base_all_drgs.csv` (same directory as server.py)
3. `hospital_data_clean_base_all_drgs.csv` (current working directory)

Make sure the CSV is in one of these locations for the dashboard to work.

