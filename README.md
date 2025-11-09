# Project LOSight: Data-Driven Prediction of Hospital Length of Stay

A comprehensive, interactive web dashboard for exploring hospital discharge data and predicting length of stay. This dashboard provides data-driven insights through interactive visualizations and analyses, enabling healthcare professionals to identify high-risk patients and optimize resource allocation.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
# Mac/Linux
./start.sh

# Or manually
python3 server.py
```

### 3. Open in Browser
Navigate to: **http://localhost:5000**

## 📊 Features

### Interactive Visualizations
- **Overview**: LOS distribution, box plots, comprehensive statistics
- **Severity Analysis**: Median/mean LOS by severity, severity × senior interactions
- **Demographics**: Age group and gender analysis
- **Payment & Disposition**: Payment type, admission type, skilled nursing need
- **Trends**: Top DRG codes by volume
- **Outlier Analysis**: IQR-based outlier detection and statistics

### Advanced Filtering
Filter data by:
- Severity of Illness (1-4)
- Age Range
- Payment Type
- Type of Admission
- DRG Code (Top 50)
- Length of Stay Range

### Real-time Updates
- All charts update automatically when filters are applied
- Sidebar shows filtered data statistics
- Professional, responsive design

## 📁 Project Structure

```
interactive_dashboard/
├── server.py              # Flask backend server
├── static/
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Styling
│   └── app.js            # JavaScript for interactivity
├── requirements.txt       # Python dependencies
├── start.sh              # Startup script
└── README.md             # This file
```

## 🔧 Requirements

- Python 3.8+
- Flask, Flask-CORS, Pandas, NumPy
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Dataset: `hospital_data_clean_base_all_drgs.csv` (in parent directory)

## 📝 API Endpoints

The Flask server provides REST API endpoints:

- `GET /` - Main dashboard page
- `GET /api/data/overview` - Overview statistics
- `GET /api/data/los-distribution` - LOS distribution data
- `GET /api/data/severity` - Severity analysis
- `GET /api/data/severity-senior` - Severity × senior interaction
- `GET /api/data/demographics` - Age and gender analysis
- `GET /api/data/payment` - Payment type analysis
- `GET /api/data/admission` - Admission type analysis
- `GET /api/data/disposition` - Disposition analysis
- `GET /api/data/top-drgs` - Top DRG codes
- `GET /api/data/outliers` - Outlier statistics
- `GET /api/filters/options` - Available filter options

All data endpoints accept query parameters for filtering.

## 🎯 Use Cases

Perfect for:
- **Professors/Instructors**: Review all analyses in one place
- **Team Presentations**: Interactive exploration during meetings
- **Data Review**: Quick filtering and visualization
- **Report Generation**: Export insights from filtered views

## 💡 Tips

1. **Apply Filters**: Click "Apply Filters" after changing filter values
2. **Reset**: Use "Reset All" to clear all filters
3. **Tab Navigation**: Switch between tabs to see different analyses
4. **Responsive**: Works on desktop, tablet, and mobile devices

## 🐛 Troubleshooting

**Port 5000 in use?**
- Change port in `server.py`: `app.run(..., port=5001)`

**Dataset not found?**
- Ensure `hospital_data_clean_base_all_drgs.csv` is in the parent directory
- The server will try multiple paths automatically

**Charts not loading?**
- Check browser console (F12) for errors
- Ensure Flask server is running
- Verify API endpoints are accessible

## 📊 Data Source

Uses: `hospital_data_clean_base_all_drgs.csv`
- ~1.9 million rows
- All 307 DRG codes
- Adults only (>18 years)
- Cleaned and feature-engineered

## 🎨 Technology Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js 4.4.0
- **Data Processing**: Pandas, NumPy

---

**Note**: This dashboard is designed to showcase all analyses from the Jupyter notebook in an interactive, professional format suitable for academic review and presentation.

