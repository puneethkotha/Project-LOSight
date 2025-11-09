"""
Create a sampled version of the dataset for deployment
This creates a smaller file that can be included in GitHub (< 100MB)
"""

import pandas as pd
import os

# Paths to check
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_paths = [
    os.path.join(base_dir, '..', 'hospital_data_clean_base_all_drgs.csv'),
    os.path.join(base_dir, 'hospital_data_clean_base_all_drgs.csv'),
    '../hospital_data_clean_base_all_drgs.csv',
    'hospital_data_clean_base_all_drgs.csv'
]

# Find the CSV file
csv_path = None
for path in csv_paths:
    if os.path.exists(path):
        csv_path = path
        print(f"Found CSV at: {path}")
        break

if csv_path is None:
    print("Error: Could not find hospital_data_clean_base_all_drgs.csv")
    print("Please ensure the file is in the parent directory or same directory as this script.")
    exit(1)

# Load and sample
print("Loading full dataset...")
df = pd.read_csv(csv_path, low_memory=False)

print(f"Original dataset: {len(df):,} rows")

# Sample 100,000 rows (stratified by key columns if possible)
# This keeps the sample representative
sample_size = 100000

if len(df) > sample_size:
    print(f"Sampling {sample_size:,} rows...")
    
    # Try to get a representative sample
    # Sample proportionally from different DRG codes
    if 'APR DRG Code' in df.columns:
        # Sample from top DRGs proportionally
        top_drgs = df['APR DRG Code'].value_counts().head(20).index
        df_top = df[df['APR DRG Code'].isin(top_drgs)]
        df_other = df[~df['APR DRG Code'].isin(top_drgs)]
        
        # Sample 80% from top DRGs, 20% from others
        n_top = int(sample_size * 0.8)
        n_other = sample_size - n_top
        
        if len(df_top) > n_top:
            df_top_sample = df_top.sample(n=n_top, random_state=42)
        else:
            df_top_sample = df_top
        
        if len(df_other) > n_other:
            df_other_sample = df_other.sample(n=n_other, random_state=42)
        else:
            df_other_sample = df_other
        
        df_sample = pd.concat([df_top_sample, df_other_sample])
    else:
        # Simple random sample
        df_sample = df.sample(n=sample_size, random_state=42)
    
    print(f"Sampled dataset: {len(df_sample):,} rows")
else:
    df_sample = df
    print("Dataset is already small enough, using full dataset")

# Save sampled file
output_path = os.path.join(base_dir, 'hospital_data_clean_base_all_drgs.csv')
df_sample.to_csv(output_path, index=False)

# Check file size
file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
print(f"\n✓ Sample file created: {output_path}")
print(f"  File size: {file_size_mb:.2f} MB")
print(f"  Rows: {len(df_sample):,}")

if file_size_mb < 100:
    print("\n✓ File is under 100MB - safe to include in GitHub!")
    print("  You can now commit and push this file to your repository.")
else:
    print(f"\n⚠️  File is {file_size_mb:.2f}MB - still too large for GitHub")
    print("  Consider reducing sample_size in this script.")

