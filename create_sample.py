"""
Create a sampled version of the CSV for deployment
This creates a smaller file that can be included in GitHub
"""
import pandas as pd
import os

# Paths
input_file = '../hospital_data_clean_base_all_drgs.csv'
output_file = 'hospital_data_sample.csv'
target_size_mb = 80  # Target size in MB (under GitHub's 100MB limit)

print("Creating sampled dataset for deployment...")
print(f"Reading: {input_file}")

# Read the full dataset
df = pd.read_csv(input_file, low_memory=False)

print(f"Original dataset: {len(df):,} rows")

# Calculate sample size needed (rough estimate: ~200 bytes per row)
bytes_per_row = 200
target_rows = (target_size_mb * 1024 * 1024) // bytes_per_row

# Sample the data
if len(df) > target_rows:
    df_sample = df.sample(n=target_rows, random_state=42)
    print(f"Sampling to: {len(df_sample):,} rows (~{target_size_mb}MB)")
else:
    df_sample = df
    print("Dataset is already small enough")

# Save sampled dataset
df_sample.to_csv(output_file, index=False)

# Check file size
file_size_mb = os.path.getsize(output_file) / (1024 * 1024)
print(f"\n✓ Sample created: {output_file}")
print(f"  Size: {file_size_mb:.1f} MB")
print(f"  Rows: {len(df_sample):,}")
print(f"\nYou can now add this to GitHub:")
print(f"  git add {output_file}")
print(f"  git commit -m 'Add sampled dataset for deployment'")
print(f"  git push")

