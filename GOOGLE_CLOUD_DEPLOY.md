# Deploy to Google Cloud Platform

Google Cloud offers a free tier and supports Flask applications. Here are two options: **Cloud Run** (recommended) or **App Engine**.

## Option 1: Google Cloud Run (Recommended - Free Tier Available)

Cloud Run is serverless and charges only for what you use. The free tier includes:
- 2 million requests/month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

### Step 1: Set Up Google Cloud

1. **Create a Google Cloud account:**
   - Go to [cloud.google.com](https://cloud.google.com)
   - Sign up (get $300 free credit for 90 days)
   - Even after credits, free tier continues

2. **Install Google Cloud SDK:**
   ```bash
   # Mac
   brew install google-cloud-sdk
   
   # Or download from:
   # https://cloud.google.com/sdk/docs/install
   ```

3. **Initialize and login:**
   ```bash
   gcloud init
   gcloud auth login
   ```

### Step 2: Create a Dockerfile

Create `Dockerfile` in your `interactive_dashboard` folder:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Cloud Run uses PORT env var)
ENV PORT=8080
EXPOSE 8080

# Run the application
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 server:app
```

### Step 3: Update requirements.txt

Add `gunicorn` for production server:

```bash
echo "gunicorn>=21.2.0" >> requirements.txt
```

### Step 4: Update server.py for Cloud Run

The server already uses `PORT` environment variable, but make sure it works with Gunicorn:

```python
# At the bottom of server.py, update the run command:
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
```

### Step 5: Upload CSV to Google Cloud Storage

1. **Create a storage bucket:**
   ```bash
   gcloud storage buckets create gs://your-bucket-name --location=us-central1
   ```

2. **Upload CSV:**
   ```bash
   cd "/Users/puneeth/Downloads/DSMB EDA"
   gcloud storage cp hospital_data_clean_base_all_drgs.csv gs://your-bucket-name/
   ```

3. **Make it publicly readable (for download):**
   ```bash
   gcloud storage objects update gs://your-bucket-name/hospital_data_clean_base_all_drgs.csv --acl=public-read
   ```

4. **Get the public URL:**
   ```
   https://storage.googleapis.com/your-bucket-name/hospital_data_clean_base_all_drgs.csv
   ```

### Step 6: Set Environment Variable

Set the CSV download URL as an environment variable in Cloud Run (or use the GCS URL directly in code).

### Step 7: Deploy to Cloud Run

```bash
cd "/Users/puneeth/Downloads/DSMB EDA/interactive_dashboard"

# Build and deploy
gcloud run deploy project-losight \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars CSV_DOWNLOAD_URL=https://storage.googleapis.com/your-bucket-name/hospital_data_clean_base_all_drgs.csv
```

### Step 8: Get Your URL

After deployment, you'll get a URL like:
```
https://project-losight-xxxxx-uc.a.run.app
```

---

## Option 2: Google App Engine (Also Free Tier)

App Engine is simpler but less flexible than Cloud Run.

### Step 1: Create app.yaml

Create `app.yaml` in your `interactive_dashboard` folder:

```yaml
runtime: python311

instance_class: F1  # Free tier

automatic_scaling:
  min_instances: 0
  max_instances: 1

env_variables:
  CSV_DOWNLOAD_URL: 'https://storage.googleapis.com/your-bucket-name/hospital_data_clean_base_all_drgs.csv'

handlers:
- url: /.*
  script: auto
```

### Step 2: Upload CSV to Cloud Storage

Same as Cloud Run (Step 5 above).

### Step 3: Deploy

```bash
cd "/Users/puneeth/Downloads/DSMB EDA/interactive_dashboard"
gcloud app deploy
```

### Step 4: Get Your URL

```bash
gcloud app browse
```

---

## Using Google Cloud Storage (Best Option)

Instead of downloading on startup, you can read directly from Cloud Storage:

### Update server.py to read from GCS:

```python
from google.cloud import storage

def load_data_from_gcs():
    """Load CSV directly from Google Cloud Storage"""
    client = storage.Client()
    bucket = client.bucket('your-bucket-name')
    blob = bucket.blob('hospital_data_clean_base_all_drgs.csv')
    
    # Download to memory and read with pandas
    csv_string = blob.download_as_text()
    df = pd.read_csv(StringIO(csv_string), low_memory=False)
    return df
```

Add to requirements.txt:
```
google-cloud-storage>=2.10.0
```

### Set up authentication:

```bash
# Create service account
gcloud iam service-accounts create app-engine-sa

# Grant storage access
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:app-engine-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

# For local testing, set credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
```

---

## Free Tier Limits

### Cloud Run:
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds
- Usually enough for a project

### App Engine:
- 28 instance-hours/day (F1 instances)
- 1GB outgoing traffic/day
- 5GB storage

---

## Quick Start (Simplest)

1. **Install gcloud CLI**
2. **Create project:**
   ```bash
   gcloud projects create project-losight
   gcloud config set project project-losight
   ```

3. **Upload CSV to Cloud Storage:**
   ```bash
   gcloud storage buckets create gs://project-losight-data --location=us-central1
   gcloud storage cp hospital_data_clean_base_all_drgs.csv gs://project-losight-data/
   gcloud storage objects update gs://project-losight-data/hospital_data_clean_base_all_drgs.csv --acl=public-read
   ```

4. **Deploy to Cloud Run:**
   ```bash
   cd interactive_dashboard
   gcloud run deploy project-losight --source . --region us-central1 --allow-unauthenticated
   ```

5. **Set environment variable:**
   - Go to Cloud Run console
   - Edit service → Environment variables
   - Add: `CSV_DOWNLOAD_URL` = `https://storage.googleapis.com/project-losight-data/hospital_data_clean_base_all_drgs.csv`

---

## Advantages of Google Cloud

- **Free tier** - Generous limits
- **Fast** - Better performance than Render free tier
- **Reliable** - Google infrastructure
- **Scalable** - Auto-scales as needed
- **Storage** - Easy CSV hosting with Cloud Storage
- **No spin-down** - Unlike Render, doesn't sleep

---

## Cost Estimate

With free tier:
- **$0/month** for typical project usage
- Only pay if you exceed free tier limits
- $300 free credit for first 90 days

---

**Need help?** Check [Google Cloud documentation](https://cloud.google.com/docs) or their support.

