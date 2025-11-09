// Hospital LOS Dashboard - JavaScript
// API Base URL
// Auto-detect API base URL (works for both local and production)
const API_BASE = window.location.origin + '/api';

// Chart instances
let charts = {};

// Filter state
let filters = {
    severity: 'all',
    payment: 'all',
    admission: 'all',
    drg: 'all',
    los_min: null,
    los_max: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    
    // Wait a bit to ensure all elements are rendered
    setTimeout(() => {
        showLoadingMessage('Loading dashboard...');
        
        // Add error handler for unhandled errors
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e);
            hideLoadingMessage();
            showErrorMessage('JavaScript error: ' + e.message);
        });
        
        // Test API connection first
        testAPIConnection().then(() => {
            // Ensure overview tab is visible
            const overviewTab = document.getElementById('overview');
            if (overviewTab) {
                overviewTab.classList.add('active');
            }
            
            initializeFilters();
            setupEventListeners();
            loadInitialData();
        }).catch((error) => {
            console.error('Failed to connect to server:', error);
            hideLoadingMessage();
            showErrorMessage('Cannot connect to server. Please check your connection and try again.');
        });
    }, 100); // Small delay to ensure DOM is fully ready
});

// Test API connection
async function testAPIConnection() {
    try {
        // First verify dataset
        const datasetInfo = await fetch(`${API_BASE}/dataset-info`);
        if (!datasetInfo.ok) {
            throw new Error(`Dataset info API returned ${datasetInfo.status}`);
        }
        const info = await datasetInfo.json();
        console.log('✓ Dataset loaded:', info.dataset_name);
        console.log('✓ Rows:', info.rows.toLocaleString());
        console.log('✓ Columns:', info.columns);
        
        // Then test filters
        const response = await fetch(`${API_BASE}/filters/options`);
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }
        console.log('✓ API connection successful');
        return true;
    } catch (error) {
        console.error('✗ API connection failed:', error);
        throw error;
    }
}

// Show loading message (without destroying existing content)
function showLoadingMessage(message) {
    // Create overlay if it doesn't exist
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); z-index: 9999;';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
    
    // Don't replace content, just show a loading indicator
    let loadingDiv = document.getElementById('loading-indicator');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; text-align: center; min-width: 200px;';
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <div style="font-size: 1.1rem; color: #667eea; font-weight: 600;">${message}</div>
        <div style="font-size: 0.9rem; color: #888; margin-top: 0.5rem;">Please wait...</div>
    `;
    loadingDiv.style.display = 'block';
    
    // Add spinner animation if not already in style
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Hide loading message
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Show error message (keeps sidebar and filters intact)
function showErrorMessage(message) {
    // Hide loading overlay first
    hideLoadingMessage();
    
    // Show error in the main content area without removing existing content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        // Find or create error container
        let errorDiv = document.getElementById('error-message-container');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message-container';
            errorDiv.style.cssText = 'text-align: center; padding: 2rem; background: #fee; border: 2px solid #fcc; border-radius: 10px; margin: 2rem;';
            // Insert at the beginning of main content
            mainContent.insertBefore(errorDiv, mainContent.firstChild);
        }
        
        errorDiv.innerHTML = `
            <h2 style="color: #c00; margin-bottom: 1rem;">Error Loading Data</h2>
            <p style="color: #666; font-size: 1.1rem; margin-bottom: 1rem;">${message}</p>
            <div style="background: #fff; padding: 1rem; border-radius: 5px; text-align: left; max-width: 600px; margin: 0 auto;">
                <strong>To fix this:</strong>
                <ol style="text-align: left; margin-top: 0.5rem;">
                    <li>Make sure the server is running</li>
                    <li>Check browser console (F12) for details</li>
                    <li>Try refreshing the page</li>
                </ol>
            </div>
        `;
        errorDiv.style.display = 'block';
    }
}

// Hide error message
function hideErrorMessage() {
    const errorDiv = document.getElementById('error-message-container');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Initialize filter options
async function initializeFilters() {
    try {
        const response = await fetch(`${API_BASE}/filters/options`);
        const options = await response.json();
        
        // Severity
        if (options.severity) {
            const select = document.getElementById('severity-filter');
            options.severity.forEach(sev => {
                const option = document.createElement('option');
                option.value = sev;
                option.textContent = `Severity ${sev}`;
                select.appendChild(option);
            });
        }
        
        // Payment
        if (options.payment) {
            const select = document.getElementById('payment-filter');
            options.payment.forEach(pay => {
                const option = document.createElement('option');
                option.value = pay;
                option.textContent = pay;
                select.appendChild(option);
            });
        }
        
        // Admission
        if (options.admission) {
            const select = document.getElementById('admission-filter');
            options.admission.forEach(adm => {
                const option = document.createElement('option');
                option.value = adm;
                option.textContent = adm;
                select.appendChild(option);
            });
        }
        
        // DRG
        if (options.drg) {
            const select = document.getElementById('drg-filter');
            options.drg.forEach(drg => {
                const option = document.createElement('option');
                option.value = drg;
                option.textContent = `DRG ${drg}`;
                select.appendChild(option);
            });
        }
        
        // LOS range
        if (options.los) {
            document.getElementById('los-min').value = options.los.min;
            document.getElementById('los-max').value = options.los.max;
            filters.los_min = options.los.min;
            filters.los_max = options.los.max;
        }
    } catch (error) {
        console.error('Error loading filter options:', error);
        alert('Failed to load filter options. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('apply-filters').addEventListener('click', async () => {
        updateFilters();
        showLoadingMessage('Applying filters and loading data...');
        try {
            await loadAllData();
            hideLoadingMessage();
        } catch (error) {
            hideLoadingMessage();
            console.error('Error applying filters:', error);
            showErrorMessage('Failed to apply filters. Please try again.');
        }
    });
    
    document.getElementById('reset-filters').addEventListener('click', async () => {
        resetFilters();
        showLoadingMessage('Resetting filters and loading data...');
        try {
            await loadAllData();
            hideLoadingMessage();
        } catch (error) {
            hideLoadingMessage();
            console.error('Error resetting filters:', error);
            showErrorMessage('Failed to reset filters. Please try again.');
        }
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
}

// Update filters from UI
function updateFilters() {
    filters.severity = document.getElementById('severity-filter').value;
    filters.payment = document.getElementById('payment-filter').value;
    filters.admission = document.getElementById('admission-filter').value;
    filters.drg = document.getElementById('drg-filter').value;
    filters.los_min = document.getElementById('los-min').value || null;
    filters.los_max = document.getElementById('los-max').value || null;
}

// Reset filters
function resetFilters() {
    document.getElementById('severity-filter').value = 'all';
    document.getElementById('payment-filter').value = 'all';
    document.getElementById('admission-filter').value = 'all';
    document.getElementById('drg-filter').value = 'all';
    
    // Reset ranges to defaults
    const losMin = document.getElementById('los-min');
    const losMax = document.getElementById('los-max');
    
    // Get defaults from initial load
    initializeFilters().then(() => {
        updateFilters();
    });
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Load data for active tab
    if (tabName === 'overview') {
        loadOverviewData();
    } else if (tabName === 'severity') {
        loadSeverityData();
    } else if (tabName === 'demographics') {
        loadDemographicsData();
    } else if (tabName === 'payment') {
        loadPaymentData();
    } else if (tabName === 'trends') {
        loadTrendsData();
    } else if (tabName === 'outliers') {
        loadOutliersData();
    }
}

// Build query string
function buildQueryString() {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
            params.append(key, filters[key]);
        }
    });
    return params.toString();
}

// Load initial data
async function loadInitialData() {
    await loadOverviewData();
}

// Load all data
async function loadAllData() {
    await Promise.all([
        loadOverviewData(),
        loadSeverityData(),
        loadDemographicsData(),
        loadPaymentData(),
        loadTrendsData(),
        loadOutliersData()
    ]);
}

// Load overview data
async function loadOverviewData() {
    try {
        const query = buildQueryString();
        console.log('Fetching overview data...');
        
        // Add timeout to fetch requests
        const fetchWithTimeout = (url, timeout = 30000) => {
            return Promise.race([
                fetch(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), timeout)
                )
            ]);
        };
        
        const [overview, losDist] = await Promise.all([
            fetchWithTimeout(`${API_BASE}/data/overview?${query}`).then(r => {
                if (!r.ok) throw new Error(`Overview API error: ${r.status}`);
                return r.json();
            }),
            fetchWithTimeout(`${API_BASE}/data/los-distribution?${query}`).then(r => {
                if (!r.ok) throw new Error(`LOS Distribution API error: ${r.status}`);
                return r.json();
            })
        ]);
        
        console.log('✓ Data fetched successfully');
        console.log('Overview data:', overview);
        console.log('LOS data points:', losDist.los ? losDist.los.length : 'missing');
        
        // Validate data
        if (!overview || !overview.total_patients) {
            throw new Error('Invalid overview data received');
        }
        if (!losDist || !losDist.los || !Array.isArray(losDist.los)) {
            throw new Error('Invalid LOS distribution data received');
        }
        
        // Helper function to safely update element
        function safeUpdate(id, value) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
            } else {
                console.warn(`Element ${id} not found`);
            }
        }
        
        // Update metrics (with safety checks)
        safeUpdate('overview-median', `${overview.median_los.toFixed(1)} days`);
        safeUpdate('overview-mean', `${overview.mean_los.toFixed(1)} days`);
        
        
        // Charts
        updateLOSHistogram(losDist.los, overview);
        updateLOSBoxPlot(overview);
        
        // Hide loading and error messages
        hideLoadingMessage();
        hideErrorMessage();
    } catch (error) {
        console.error('Error loading overview:', error);
        console.error('Error details:', error.message, error.stack);
        hideLoadingMessage();
        showErrorMessage(`Failed to load overview data: ${error.message}<br><br>Check browser console (F12) for more details.`);
    }
}

// Update LOS histogram
function updateLOSHistogram(losData, stats) {
    const ctx = document.getElementById('los-histogram');
    if (charts.losHistogram) {
        charts.losHistogram.destroy();
    }
    
    const maxLOS = Math.min(Math.max(...losData), 50);
    const binSize = Math.ceil(maxLOS / 40);
    const bins = [];
    const counts = [];
    
    for (let i = 0; i <= maxLOS; i += binSize) {
        bins.push(`${i}-${i + binSize}`);
        counts.push(0);
    }
    
    losData.forEach(los => {
        if (los <= maxLOS) {
            const binIndex = Math.floor(los / binSize);
            if (binIndex < counts.length) {
                counts[binIndex]++;
            }
        }
    });
    
    charts.losHistogram = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins,
            datasets: [{
                label: 'Number of Patients',
                data: counts,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toLocaleString()} patients`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Patients' }
                },
                x: {
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Update LOS box plot
function updateLOSBoxPlot(stats) {
    const ctx = document.getElementById('los-boxplot');
    if (charts.losBoxPlot) {
        charts.losBoxPlot.destroy();
    }
    
    charts.losBoxPlot = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Length of Stay'],
            datasets: [
                {
                    label: 'Min',
                    data: [stats.min_los],
                    backgroundColor: 'rgba(200, 200, 200, 0.6)'
                },
                {
                    label: 'Q1 (25th)',
                    data: [stats.q25],
                    backgroundColor: 'rgba(102, 126, 234, 0.6)'
                },
                {
                    label: 'Median',
                    data: [stats.median_los],
                    backgroundColor: 'rgba(102, 126, 234, 0.9)'
                },
                {
                    label: 'Q3 (75th)',
                    data: [stats.q75],
                    backgroundColor: 'rgba(102, 126, 234, 0.6)'
                },
                {
                    label: 'Max',
                    data: [Math.min(stats.max_los, 50)],
                    backgroundColor: 'rgba(200, 200, 200, 0.6)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Load severity data
async function loadSeverityData() {
    try {
        const query = buildQueryString();
        const [severityData, severitySenior] = await Promise.all([
            fetch(`${API_BASE}/data/severity?${query}`).then(r => r.json()),
            fetch(`${API_BASE}/data/severity-senior?${query}`).then(r => r.json())
        ]);
        
        if (severityData.data) {
            updateSeverityChart(severityData.data, 'median');
            updateSeverityChart(severityData.data, 'mean');
        }
        
        if (severitySenior.data) {
            updateSeveritySeniorChart(severitySenior.data);
        }
    } catch (error) {
        console.error('Error loading severity:', error);
        alert('Failed to load severity data.');
    }
}

// Update severity chart
function updateSeverityChart(data, type) {
    const canvasId = type === 'median' ? 'severity-median-chart' : 'severity-mean-chart';
    const ctx = document.getElementById(canvasId);
    const chartKey = `severity${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    if (charts[chartKey]) {
        charts[chartKey].destroy();
    }
    
    const labels = data.map(d => `Severity ${d.severity}`);
    const values = data.map(d => d[`${type}_los`]);
    
    charts[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `${type.charAt(0).toUpperCase() + type.slice(1)} LOS (days)`,
                data: values,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Update severity × senior chart
function updateSeveritySeniorChart(data) {
    const ctx = document.getElementById('severity-senior-chart');
    if (charts.severitySenior) {
        charts.severitySenior.destroy();
    }
    
    // Group by severity
    const severityGroups = {};
    data.forEach(d => {
        if (!severityGroups[d.severity]) {
            severityGroups[d.severity] = { senior: null, nonSenior: null };
        }
        if (d.is_senior === 1) {
            severityGroups[d.severity].senior = d.median_los;
        } else {
            severityGroups[d.severity].nonSenior = d.median_los;
        }
    });
    
    const severities = Object.keys(severityGroups).sort((a, b) => a - b);
    const seniorData = severities.map(s => severityGroups[s].senior || 0);
    const nonSeniorData = severities.map(s => severityGroups[s].nonSenior || 0);
    
    charts.severitySenior = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: severities.map(s => `Severity ${s}`),
            datasets: [
                {
                    label: 'Non-Senior (<70)',
                    data: nonSeniorData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Senior (70+)',
                    data: seniorData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Median LOS (days)' }
                }
            }
        }
    });
}

// Load demographics data
async function loadDemographicsData() {
    try {
        const query = buildQueryString();
        const response = await fetch(`${API_BASE}/data/demographics?${query}`);
        const data = await response.json();
        
        if (data.age) {
            updateAgeChart(data.age);
        }
        
        if (data.gender) {
            updateGenderChart(data.gender);
        }
    } catch (error) {
        console.error('Error loading demographics:', error);
        alert('Failed to load demographics data.');
    }
}

// Update age chart
function updateAgeChart(data) {
    const ctx = document.getElementById('age-chart');
    if (charts.ageChart) {
        charts.ageChart.destroy();
    }
    
    const labels = data.map(d => d.age_group);
    const medians = data.map(d => d.median_los);
    
    charts.ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Median LOS (days)',
                data: medians,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Update gender chart
function updateGenderChart(data) {
    const ctx = document.getElementById('gender-chart');
    if (charts.genderChart) {
        charts.genderChart.destroy();
    }
    
    const labels = data.map(d => d.gender);
    const medians = data.map(d => d.median_los);
    
    charts.genderChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Median LOS (days)',
                data: medians,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Load payment data
async function loadPaymentData() {
    try {
        const query = buildQueryString();
        const [paymentData, admissionData, dispositionData] = await Promise.all([
            fetch(`${API_BASE}/data/payment?${query}`).then(r => r.json()),
            fetch(`${API_BASE}/data/admission?${query}`).then(r => r.json()),
            fetch(`${API_BASE}/data/disposition?${query}`).then(r => r.json())
        ]);
        
        if (paymentData.data) {
            updatePaymentChart(paymentData.data);
        }
        
        if (admissionData.data) {
            updateAdmissionChart(admissionData.data);
        }
        
        if (dispositionData.snf) {
            updateSNFChart(dispositionData.snf);
        }
    } catch (error) {
        console.error('Error loading payment:', error);
        alert('Failed to load payment data.');
    }
}

// Update payment chart
function updatePaymentChart(data) {
    const ctx = document.getElementById('payment-chart');
    if (charts.paymentChart) {
        charts.paymentChart.destroy();
    }
    
    const labels = data.map(d => d.payment_type);
    const medians = data.map(d => d.median_los);
    
    charts.paymentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Median LOS (days)',
                data: medians,
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Update admission chart
function updateAdmissionChart(data) {
    const ctx = document.getElementById('admission-chart');
    if (charts.admissionChart) {
        charts.admissionChart.destroy();
    }
    
    const labels = data.map(d => d.admission_type);
    const medians = data.map(d => d.median_los);
    
    charts.admissionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Median LOS (days)',
                data: medians,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Update SNF chart
function updateSNFChart(data) {
    const ctx = document.getElementById('snf-chart');
    if (charts.snfChart) {
        charts.snfChart.destroy();
    }
    
    const labels = data.map(d => d.needs_snf === 1 ? 'Needs SNF' : 'No SNF');
    const medians = data.map(d => d.median_los);
    
    charts.snfChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Median LOS (days)',
                data: medians,
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Length of Stay (days)' }
                }
            }
        }
    });
}

// Load trends data
async function loadTrendsData() {
    try {
        const query = buildQueryString();
        const response = await fetch(`${API_BASE}/data/top-drgs?${query}`);
        const data = await response.json();
        
        if (data.data) {
            updateDRGChart(data.data);
        }
    } catch (error) {
        console.error('Error loading trends:', error);
        alert('Failed to load trends data.');
    }
}

// Update DRG chart
function updateDRGChart(data) {
    const ctx = document.getElementById('drg-chart');
    if (charts.drgChart) {
        charts.drgChart.destroy();
    }
    
    const labels = data.map(d => `DRG ${d.drg_code}`);
    const counts = data.map(d => d.count);
    
    charts.drgChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Cases',
                data: counts,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Cases' }
                }
            }
        }
    });
}

// Load outliers data
async function loadOutliersData() {
    try {
        const query = buildQueryString();
        const response = await fetch(`${API_BASE}/data/outliers?${query}`);
        const data = await response.json();
        
        document.getElementById('outlier-mild').textContent = data.mild_outliers.toLocaleString();
        document.getElementById('outlier-extreme').textContent = data.extreme_outliers.toLocaleString();
        document.getElementById('outlier-upper').textContent = `${data.upper_bound.toFixed(1)} days`;
        document.getElementById('outlier-extreme-upper').textContent = `${data.extreme_upper.toFixed(1)} days`;
        
        // Render scatter plot
        updateOutlierScatterPlot(data);
    } catch (error) {
        console.error('Error loading outliers:', error);
        alert('Failed to load outliers data.');
    }
}

// Update outlier scatter plot
function updateOutlierScatterPlot(data) {
    const canvas = document.getElementById('outlier-scatter');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 40;
    canvas.height = 400;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Prepare data
    const normalPoints = data.normal_points || [];
    const mildOutlierPoints = data.mild_outlier_points || [];
    const extremeOutlierPoints = data.extreme_outlier_points || [];
    
    // Find min/max for scaling
    const allPoints = [...normalPoints, ...mildOutlierPoints, ...extremeOutlierPoints];
    const maxIndex = Math.max(...allPoints.map(p => p.index), 1);
    const maxLOS = Math.max(...allPoints.map(p => p['Length of Stay']), data.upper_bound || 1);
    
    // Padding
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = canvas.width - padding.left - padding.right;
    const plotHeight = canvas.height - padding.top - padding.bottom;
    
    // Scale functions
    const scaleX = (index) => padding.left + (index / maxIndex) * plotWidth;
    const scaleY = (los) => padding.top + plotHeight - (los / maxLOS) * plotHeight;
    
    // Draw threshold lines
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, scaleY(data.upper_bound));
    ctx.lineTo(canvas.width - padding.right, scaleY(data.upper_bound));
    ctx.stroke();
    
    ctx.strokeStyle = '#f44336';
    ctx.beginPath();
    ctx.moveTo(padding.left, scaleY(data.extreme_upper));
    ctx.lineTo(canvas.width - padding.right, scaleY(data.extreme_upper));
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw points
    ctx.fillStyle = '#4caf50';
    normalPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(scaleX(point.index), scaleY(point['Length of Stay']), 2, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.fillStyle = '#ff9800';
    mildOutlierPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(scaleX(point.index), scaleY(point['Length of Stay']), 3, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.fillStyle = '#f44336';
    extremeOutlierPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(scaleX(point.index), scaleY(point['Length of Stay']), 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Patient Index', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Length of Stay (days)', 0, 0);
    ctx.restore();
    
    // Draw legend
    const legendY = padding.top + 10;
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(canvas.width - padding.right - 150, legendY, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Normal', canvas.width - padding.right - 135, legendY + 9);
    
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(canvas.width - padding.right - 150, legendY + 20, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Mild Outliers (1.5×IQR)', canvas.width - padding.right - 135, legendY + 29);
    
    ctx.fillStyle = '#f44336';
    ctx.fillRect(canvas.width - padding.right - 150, legendY + 40, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Extreme Outliers (3×IQR)', canvas.width - padding.right - 135, legendY + 49);
    
    // Draw threshold labels
    ctx.fillStyle = '#ff9800';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`1.5×IQR: ${data.upper_bound.toFixed(1)}`, canvas.width - padding.right, scaleY(data.upper_bound) - 5);
    
    ctx.fillStyle = '#f44336';
    ctx.fillText(`3×IQR: ${data.extreme_upper.toFixed(1)}`, canvas.width - padding.right, scaleY(data.extreme_upper) - 5);
}

