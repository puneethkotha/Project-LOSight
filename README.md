# Project LOSight: Data-Driven Prediction of Hospital Length of Stay

An interactive web dashboard for analyzing hospital discharge data and predicting patient length of stay. The dashboard provides data-driven insights through interactive visualizations, helping healthcare professionals identify high-risk patients and optimize hospital resource allocation.

## Quick Start

First, install the required dependencies:

```bash
pip install -r requirements.txt
```

Then start the server. On Mac or Linux, you can use the provided script:

```bash
./start.sh
```

Or run it manually:

```bash
python3 server.py
```

Once the server is running, open your browser and navigate to http://localhost:5002. The dashboard should load automatically.

## Features

The dashboard includes several analysis sections accessible through tabs at the top of the page.

**Overview** provides a high-level view of the data including length of stay distribution histograms, box plots, and key statistics like median and mean LOS.

**Severity Analysis** breaks down length of stay by severity of illness codes (1-4), showing how patient severity correlates with extended stays. It also includes analysis of severity interactions with senior patients.

**Demographics** examines how age groups and gender relate to length of stay, with median and mean statistics for each category.

**Payment & Disposition** analyzes how payment types (Medicare, Medicaid, Private, etc.) and admission types affect stay duration. It also tracks patients requiring skilled nursing facilities.

**Trends** displays the top DRG codes by volume, showing which diagnosis-related groups are most common in the dataset.

**Outlier Analysis** identifies and visualizes outliers using the IQR method, with scatter plots showing mild outliers (1.5×IQR) and extreme outliers (3×IQR).

## Filtering

The sidebar includes filters that let you narrow down the data in real-time. You can filter by:

- Severity of Illness (1-4)
- Payment Type (Medicare, Medicaid, Private, etc.)
- Type of Admission (Emergency, Elective, etc.)
- DRG Code (top 50 by volume)
- Length of Stay Range (min and max days)

After selecting your filters, click "Apply Filters" to update all charts and statistics. Use "Reset All" to clear all filters and return to the full dataset.

All visualizations update automatically when filters are applied, and the sidebar displays statistics for the currently filtered data.

## Project Structure

The project is organized as follows:

```
interactive_dashboard/
├── server.py              # Flask backend server
├── static/
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Styling
│   └── app.js            # JavaScript for interactivity
├── requirements.txt       # Python dependencies
├── Procfile              # For deployment platforms
├── start.sh              # Startup script
└── README.md             # This file
```

## Requirements

The dashboard requires Python 3.8 or higher. All dependencies are listed in requirements.txt and include Flask, Flask-CORS, Pandas, and NumPy.

You'll also need the dataset file `hospital_data_clean_base_all_drgs.csv` placed in the parent directory. The server will automatically search for it in several common locations.

A modern web browser is required (Chrome, Firefox, Safari, or Edge).

## API Endpoints

The Flask server exposes several REST API endpoints for data access:

- `GET /` - Serves the main dashboard page
- `GET /api/data/overview` - Returns overview statistics including median, mean, and distribution data
- `GET /api/data/los-distribution` - Provides length of stay distribution data for histograms
- `GET /api/data/severity` - Severity analysis by illness code
- `GET /api/data/severity-senior` - Interaction analysis between severity and senior status
- `GET /api/data/demographics` - Age group and gender statistics
- `GET /api/data/payment` - Payment type analysis
- `GET /api/data/admission` - Admission type statistics
- `GET /api/data/disposition` - Patient disposition analysis
- `GET /api/data/top-drgs` - Top DRG codes by volume
- `GET /api/data/outliers` - Outlier detection statistics and data points
- `GET /api/filters/options` - Returns available options for each filter

All data endpoints accept query parameters for filtering. For example, you can add `?severity=4&payment=Medicaid` to filter results.

## Use Cases

This dashboard is useful for several scenarios:

- **Academic Review**: Professors and instructors can review all analyses in one place without needing to run the Jupyter notebook
- **Team Presentations**: Interactive exploration during meetings allows for on-the-fly data investigation
- **Data Review**: Quick filtering and visualization for exploring specific patient populations
- **Report Generation**: Export insights from filtered views for documentation

## Tips

When using the dashboard, remember to click "Apply Filters" after changing any filter values. The charts won't update until you click this button.

If you want to start fresh, use the "Reset All" button to clear all filters and return to the full dataset view.

You can switch between tabs at any time to view different analyses. The filters you've applied will remain active across all tabs.

The dashboard is responsive and works on desktop, tablet, and mobile devices, though the full experience is best on larger screens.

## Troubleshooting

If you encounter issues with port 5002 being in use, you can change the port in server.py. Look for the line with `app.run()` and modify the port parameter.

If you get an error about the dataset not being found, ensure that `hospital_data_clean_base_all_drgs.csv` is in the parent directory. The server tries multiple paths automatically, so check the console output for the exact path it's looking for.

If charts aren't loading, open your browser's developer console (F12) to check for JavaScript errors. Make sure the Flask server is running and that API endpoints are accessible. You can test the API by visiting `http://localhost:5002/api/dataset-info` directly in your browser.

## Data Source

The dashboard uses the `hospital_data_clean_base_all_drgs.csv` dataset, which contains approximately 1.9 million rows of hospital discharge records. The dataset includes all 307 DRG codes, is filtered to adults only (age 18+), and has been cleaned and feature-engineered for analysis.

## Technology Stack

The dashboard is built with:

- **Backend**: Python Flask for the API server
- **Frontend**: HTML5, CSS3, and vanilla JavaScript (ES6+)
- **Charts**: Chart.js 4.4.0 for visualizations
- **Data Processing**: Pandas and NumPy for data manipulation

The code is designed to be straightforward and maintainable, with clear separation between frontend and backend components.

---

This dashboard was created to showcase analyses from the Jupyter notebook in an interactive format suitable for academic review and presentation. It replicates all visualizations and insights from the notebook while providing a more accessible interface for non-technical users.
