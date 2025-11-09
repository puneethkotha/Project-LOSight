#!/bin/bash

# Quick deployment script for Google Cloud Run
# Make sure you've set up gcloud CLI and are logged in

echo "Deploying Project LOSight to Google Cloud Run..."

# Set your project ID (change this)
PROJECT_ID="your-project-id"
BUCKET_NAME="project-losight-data"
REGION="us-central1"

# Set the project
gcloud config set project $PROJECT_ID

# Create storage bucket if it doesn't exist
echo "Creating storage bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME 2>/dev/null || echo "Bucket may already exist"

# Upload CSV to Cloud Storage
echo "Uploading CSV to Cloud Storage..."
cd ..
gsutil cp hospital_data_clean_base_all_drgs.csv gs://$BUCKET_NAME/

# Make CSV publicly readable
echo "Making CSV publicly readable..."
gsutil acl ch -u AllUsers:R gs://$BUCKET_NAME/hospital_data_clean_base_all_drgs.csv

# Get the public URL
CSV_URL="https://storage.googleapis.com/$BUCKET_NAME/hospital_data_clean_base_all_drgs.csv"
echo "CSV URL: $CSV_URL"

# Deploy to Cloud Run
cd interactive_dashboard
echo "Deploying to Cloud Run..."
gcloud run deploy project-losight \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars CSV_DOWNLOAD_URL=$CSV_URL \
  --memory 2Gi \
  --timeout 900

echo "Deployment complete!"
echo "Your dashboard URL will be shown above."

