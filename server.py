"""
Project LOSight: Data-Driven Prediction of Hospital Length of Stay
Flask Backend Server for Interactive Dashboard
Serves data from hospital_data_clean_base_all_drgs.csv
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json

# Setup Flask app
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='/static')
CORS(app)

# Global data cache
df = None

def load_data():
    """Load and prepare the dataset"""
    global df
    if df is not None:
        return df
    
    # Try multiple paths
    data_paths = [
        os.path.join(BASE_DIR, '..', 'hospital_data_clean_base_all_drgs.csv'),
        os.path.join(BASE_DIR, 'hospital_data_clean_base_all_drgs.csv'),
        '../hospital_data_clean_base_all_drgs.csv',
        'hospital_data_clean_base_all_drgs.csv'
    ]
    
    for path in data_paths:
        if os.path.exists(path):
            print(f"✓ Loading data from: {path}")
            df = pd.read_csv(path, low_memory=False)
            break
    
    if df is None:
        raise FileNotFoundError("Could not find hospital_data_clean_base_all_drgs.csv")
    
    # Clean LOS
    df = df[df['Length of Stay'] > 0].copy()
    
    # Create features
    create_features(df)
    
    print(f"✓ Data loaded: {len(df):,} rows × {len(df.columns)} columns")
    return df

def create_features(df):
    """
    Create derived features from original dataset columns.
    Only creates features from columns that exist in hospital_data_clean_base_all_drgs.csv.
    All features are derived from original columns, not pre-engineered.
    """
    # Age_Numeric - extract from Age Group if not already present
    if 'Age_Numeric' not in df.columns and 'Age Group' in df.columns:
        def extract_age(age_str):
            if pd.isna(age_str):
                return np.nan
            age_str = str(age_str).strip()
            if '-' in age_str:
                try:
                    return int(age_str.split('-')[0])
                except:
                    return np.nan
            elif '+' in age_str or 'or' in age_str.lower():
                import re
                numbers = re.findall(r'\d+', age_str)
                if numbers:
                    try:
                        return int(numbers[0])
                    except:
                        return np.nan
            return np.nan
        df['Age_Numeric'] = df['Age Group'].apply(extract_age)
    
    # Binary features
    if 'Is_Senior' not in df.columns and 'Age_Numeric' in df.columns:
        df['Is_Senior'] = (df['Age_Numeric'] >= 70).astype(int)
    
    if 'Is_Medicaid' not in df.columns and 'Payment_Type' in df.columns:
        df['Is_Medicaid'] = (df['Payment_Type'].str.contains('Medicaid', case=False, na=False)).astype(int)
        df['Is_Medicare'] = (df['Payment_Type'].str.contains('Medicare', case=False, na=False)).astype(int)
        df['Is_Private_Insurance'] = (df['Payment_Type'].str.contains('Private', case=False, na=False)).astype(int)
    
    if 'Needs_Skilled_Nursing' not in df.columns and 'Patient Disposition' in df.columns:
        df['Needs_Skilled_Nursing'] = (df['Patient Disposition'].str.contains('Skilled Nursing', case=False, na=False)).astype(int)
        df['Needs_Rehab'] = (df['Patient Disposition'].str.contains('Rehab', case=False, na=False)).astype(int)
        df['Discharge_Home'] = (df['Patient Disposition'].str.contains('Home', case=False, na=False)).astype(int)
    
    if 'Is_Emergency' not in df.columns and 'Type of Admission' in df.columns:
        df['Is_Emergency'] = (df['Type of Admission'].str.contains('Emergency|Trauma', case=False, na=False)).astype(int)
        df['Is_Elective'] = (df['Type of Admission'] == 'Elective').astype(int)
    
    # Ordinal risk
    if 'APR_Risk_Mortality_Ordinal' not in df.columns and 'APR Risk of Mortality' in df.columns:
        mortality_map = {'Minor': 1, 'Moderate': 2, 'Major': 3, 'Extreme': 4}
        df['APR_Risk_Mortality_Ordinal'] = df['APR Risk of Mortality'].map(mortality_map)
    
    # Interaction features
    if 'Severity_x_Senior' not in df.columns and 'APR Severity of Illness Code' in df.columns and 'Is_Senior' in df.columns:
        df['Severity_x_Senior'] = df['APR Severity of Illness Code'] * df['Is_Senior']
    
    if 'Severity_x_Risk' not in df.columns and 'APR Severity of Illness Code' in df.columns and 'APR_Risk_Mortality_Ordinal' in df.columns:
        df['Severity_x_Risk'] = df['APR Severity of Illness Code'] * df['APR_Risk_Mortality_Ordinal']
    
    if 'Severity_x_Medicaid' not in df.columns and 'APR Severity of Illness Code' in df.columns and 'Is_Medicaid' in df.columns:
        df['Severity_x_Medicaid'] = df['APR Severity of Illness Code'] * df['Is_Medicaid']
    
    # DRG features
    if 'APR DRG Code' in df.columns:
        df['DRG_freq'] = df['APR DRG Code'].map(df['APR DRG Code'].value_counts())
        _drg_median = df.groupby('APR DRG Code')['Length of Stay'].median()
        df['DRG_Median_LOS'] = df['APR DRG Code'].map(_drg_median)

def apply_filters():
    """Apply filters from request parameters"""
    df_full = load_data()
    df_filtered = df_full.copy()
    
    # Severity filter
    severity = request.args.get('severity')
    if severity and severity != 'all' and 'APR Severity of Illness Code' in df_filtered.columns:
        df_filtered = df_filtered[df_filtered['APR Severity of Illness Code'] == int(severity)]
    
    # Age filter removed - data is pre-filtered to adults (18+) only
    
    # Payment filter
    payment = request.args.get('payment')
    if payment and payment != 'all' and 'Payment_Type' in df_filtered.columns:
        df_filtered = df_filtered[df_filtered['Payment_Type'] == payment]
    
    # Admission filter
    admission = request.args.get('admission')
    if admission and admission != 'all' and 'Type of Admission' in df_filtered.columns:
        df_filtered = df_filtered[df_filtered['Type of Admission'] == admission]
    
    # DRG filter
    drg = request.args.get('drg')
    if drg and drg != 'all' and 'APR DRG Code' in df_filtered.columns:
        df_filtered = df_filtered[df_filtered['APR DRG Code'] == int(drg)]
    
    # LOS filter
    los_min = request.args.get('los_min')
    los_max = request.args.get('los_max')
    if los_min and los_max:
        df_filtered = df_filtered[
            (df_filtered['Length of Stay'] >= float(los_min)) & 
            (df_filtered['Length of Stay'] <= float(los_max))
        ]
    
    return df_filtered

# Routes
@app.route('/')
def index():
    """Serve main HTML page"""
    return send_from_directory(STATIC_DIR, 'index.html')

@app.route('/test')
def test():
    """Test page to verify server is working"""
    return send_from_directory(STATIC_DIR, 'test.html')

@app.route('/api/dataset-info')
def dataset_info():
    """Return information about the loaded dataset"""
    global df
    if df is None:
        load_data()
    return jsonify({
        'dataset_name': 'hospital_data_clean_base_all_drgs.csv',
        'rows': len(df),
        'columns': len(df.columns),
        'columns_list': list(df.columns),
        'sample_size': '1,892,838 rows (all DRGs included)'
    })

@app.route('/api/data/overview')
def get_overview():
    """Get overview statistics"""
    df_filtered = apply_filters()
    
    return jsonify({
        'total_patients': len(df_filtered),
        'median_los': float(df_filtered['Length of Stay'].median()),
        'mean_los': float(df_filtered['Length of Stay'].mean()),
        'std_los': float(df_filtered['Length of Stay'].std()),
        'min_los': float(df_filtered['Length of Stay'].min()),
        'max_los': float(df_filtered['Length of Stay'].max()),
        'q25': float(df_filtered['Length of Stay'].quantile(0.25)),
        'q75': float(df_filtered['Length of Stay'].quantile(0.75)),
        'q95': float(df_filtered['Length of Stay'].quantile(0.95)),
        'q99': float(df_filtered['Length of Stay'].quantile(0.99)),
        'skewness': float(df_filtered['Length of Stay'].skew())
    })

@app.route('/api/data/los-distribution')
def get_los_distribution():
    """Get LOS distribution for histogram"""
    df_filtered = apply_filters()
    los_data = df_filtered['Length of Stay'].values.tolist()
    # Sample if too large
    if len(los_data) > 50000:
        los_data = np.random.choice(los_data, 50000, replace=False).tolist()
    return jsonify({'los': los_data})

@app.route('/api/data/severity')
def get_severity_data():
    """Get severity analysis"""
    df_filtered = apply_filters()
    
    if 'APR Severity of Illness Code' not in df_filtered.columns:
        return jsonify({'error': 'Severity data not available'})
    
    severity_stats = df_filtered.groupby('APR Severity of Illness Code')['Length of Stay'].agg(['median', 'mean', 'count']).reset_index()
    severity_stats.columns = ['severity', 'median_los', 'mean_los', 'count']
    
    return jsonify({'data': severity_stats.to_dict('records')})

@app.route('/api/data/severity-senior')
def get_severity_senior():
    """Get severity × senior interaction"""
    df_filtered = apply_filters()
    
    if 'APR Severity of Illness Code' not in df_filtered.columns or 'Is_Senior' not in df_filtered.columns:
        return jsonify({'error': 'Data not available'})
    
    interaction = df_filtered.groupby(['APR Severity of Illness Code', 'Is_Senior'])['Length of Stay'].median().reset_index()
    interaction.columns = ['severity', 'is_senior', 'median_los']
    
    return jsonify({'data': interaction.to_dict('records')})

@app.route('/api/data/demographics')
def get_demographics():
    """Get demographic analysis"""
    df_filtered = apply_filters()
    result = {}
    
    # Age groups
    if 'Age_Numeric' in df_filtered.columns:
        age_bins = [0, 30, 50, 70, 100]
        age_labels = ['18-29', '30-49', '50-69', '70+']
        df_filtered['Age_Group'] = pd.cut(df_filtered['Age_Numeric'], bins=age_bins, labels=age_labels, right=False)
        age_stats = df_filtered.groupby('Age_Group')['Length of Stay'].agg(['median', 'mean', 'count']).reset_index()
        age_stats.columns = ['age_group', 'median_los', 'mean_los', 'count']
        result['age'] = age_stats.to_dict('records')
    
    # Gender
    if 'Gender' in df_filtered.columns:
        gender_stats = df_filtered.groupby('Gender')['Length of Stay'].agg(['median', 'mean', 'count']).reset_index()
        gender_stats.columns = ['gender', 'median_los', 'mean_los', 'count']
        result['gender'] = gender_stats.to_dict('records')
    
    return jsonify(result)

@app.route('/api/data/payment')
def get_payment_data():
    """Get payment type analysis"""
    df_filtered = apply_filters()
    
    if 'Payment_Type' not in df_filtered.columns:
        return jsonify({'error': 'Payment data not available'})
    
    payment_stats = df_filtered.groupby('Payment_Type')['Length of Stay'].agg(['median', 'mean', 'count']).reset_index()
    payment_stats.columns = ['payment_type', 'median_los', 'mean_los', 'count']
    payment_stats = payment_stats.sort_values('median_los', ascending=False).head(10)
    
    return jsonify({'data': payment_stats.to_dict('records')})

@app.route('/api/data/admission')
def get_admission_data():
    """Get admission type analysis"""
    df_filtered = apply_filters()
    
    if 'Type of Admission' not in df_filtered.columns:
        return jsonify({'error': 'Admission data not available'})
    
    admission_stats = df_filtered.groupby('Type of Admission')['Length of Stay'].agg(['median', 'mean', 'count']).reset_index()
    admission_stats.columns = ['admission_type', 'median_los', 'mean_los', 'count']
    
    return jsonify({'data': admission_stats.to_dict('records')})

@app.route('/api/data/disposition')
def get_disposition_data():
    """Get disposition analysis"""
    df_filtered = apply_filters()
    result = {}
    
    if 'Needs_Skilled_Nursing' in df_filtered.columns:
        snf_stats = df_filtered.groupby('Needs_Skilled_Nursing')['Length of Stay'].agg(['median', 'mean', 'count']).reset_index()
        snf_stats.columns = ['needs_snf', 'median_los', 'mean_los', 'count']
        result['snf'] = snf_stats.to_dict('records')
    
    return jsonify(result)

@app.route('/api/data/top-drgs')
def get_top_drgs():
    """Get top DRG codes"""
    df_filtered = apply_filters()
    
    if 'APR DRG Code' not in df_filtered.columns:
        return jsonify({'error': 'DRG data not available'})
    
    top_drgs = df_filtered.groupby('APR DRG Code').agg({
        'Length of Stay': ['median', 'mean', 'count']
    }).reset_index()
    top_drgs.columns = ['drg_code', 'median_los', 'mean_los', 'count']
    top_drgs = top_drgs.sort_values('count', ascending=False).head(20)
    
    return jsonify({'data': top_drgs.to_dict('records')})

@app.route('/api/data/outliers')
def get_outliers():
    """Get outlier analysis"""
    df_filtered = apply_filters()
    
    Q1 = df_filtered['Length of Stay'].quantile(0.25)
    Q3 = df_filtered['Length of Stay'].quantile(0.75)
    IQR = Q3 - Q1
    upper_bound = Q3 + 1.5 * IQR
    extreme_upper = Q3 + 3 * IQR
    
    mild_outliers = len(df_filtered[df_filtered['Length of Stay'] > upper_bound])
    extreme_outliers = len(df_filtered[df_filtered['Length of Stay'] > extreme_upper])
    
    # Get outlier data points for scatter plot (sample if too many for performance)
    # Create a combined dataset with all points, then sample
    df_plot = df_filtered[['Length of Stay']].copy()
    df_plot['index'] = range(len(df_plot))
    
    # Sample if too large (max 5000 points for smooth rendering)
    max_points = 5000
    if len(df_plot) > max_points:
        df_plot = df_plot.sample(n=max_points).sort_values('index')
        df_plot['index'] = range(len(df_plot))
    
    # Separate into categories
    normal_points = df_plot[df_plot['Length of Stay'] <= upper_bound][['index', 'Length of Stay']].to_dict('records')
    mild_outlier_points = df_plot[(df_plot['Length of Stay'] > upper_bound) & (df_plot['Length of Stay'] <= extreme_upper)][['index', 'Length of Stay']].to_dict('records')
    extreme_outlier_points = df_plot[df_plot['Length of Stay'] > extreme_upper][['index', 'Length of Stay']].to_dict('records')
    
    return jsonify({
        'mild_outliers': mild_outliers,
        'extreme_outliers': extreme_outliers,
        'upper_bound': float(upper_bound),
        'extreme_upper': float(extreme_upper),
        'q1': float(Q1),
        'q3': float(Q3),
        'iqr': float(IQR),
        'mild_outlier_points': mild_outlier_points,
        'extreme_outlier_points': extreme_outlier_points,
        'normal_points': normal_points
    })

@app.route('/api/filters/options')
def get_filter_options():
    """Get available filter options"""
    df_full = load_data()
    options = {}
    
    if 'APR Severity of Illness Code' in df_full.columns:
        options['severity'] = sorted(df_full['APR Severity of Illness Code'].dropna().unique().tolist())
    
    if 'Age_Numeric' in df_full.columns:
        options['age'] = {
            'min': int(df_full['Age_Numeric'].min()),
            'max': int(df_full['Age_Numeric'].max())
        }
    
    if 'Payment_Type' in df_full.columns:
        options['payment'] = sorted(df_full['Payment_Type'].dropna().unique().tolist())
    
    if 'Type of Admission' in df_full.columns:
        options['admission'] = sorted(df_full['Type of Admission'].dropna().unique().tolist())
    
    if 'APR DRG Code' in df_full.columns:
        top_drgs = df_full['APR DRG Code'].value_counts().head(50).index.tolist()
        options['drg'] = sorted([int(d) for d in top_drgs])
    
    if 'Length of Stay' in df_full.columns:
        options['los'] = {
            'min': int(df_full['Length of Stay'].min()),
            'max': int(min(df_full['Length of Stay'].max(), 50))
        }
    
    return jsonify(options)

if __name__ == '__main__':
    print("=" * 60)
    print("Project LOSight: Data-Driven Prediction of Hospital Length of Stay")
    print("=" * 60)
    print("\nLoading data...")
    try:
        load_data()
        # Use environment variable PORT if available (for production hosting)
        port = int(os.environ.get('PORT', 5002))
        debug = os.environ.get('FLASK_ENV') == 'development'
        
        print(f"\n✓ Server ready!")
        if debug:
            print(f"✓ Dashboard available at: http://localhost:{port}")
            print(f"⚠️  IMPORTANT: Use HTTP (not HTTPS) - http://localhost:{port}")
        else:
            print(f"✓ Server running on port {port}")
        print(f"✓ Press Ctrl+C to stop\n")
        app.run(debug=debug, host='0.0.0.0', port=port)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease ensure hospital_data_clean_base_all_drgs.csv is in the parent directory.")

