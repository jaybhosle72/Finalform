// NABARD FIN-03 Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initFormListeners();
  initCharts();
  initMap();
  initPresets();
  populateDistrictTable();
  populateRawDatasetTable();
  
  // Initial Assessment Calculation
  runAssessment();
  runSimulator();
});

// 1. Tab Navigation Controller
function initTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');

      // Trigger Leaflet map resize if satellite tab opened
      if (targetId === 'tab-satellite' && window.leafletMap) {
        setTimeout(() => { window.leafletMap.invalidateSize(); }, 200);
      }
    });
  });
}

// 2. Range Slider Sync & Form Handlers
function initFormListeners() {
  const sliders = [
    { id: 'fertilizer', valId: 'valFert', suffix: '' },
    { id: 'temp', valId: 'valTemp', suffix: '°C' },
    { id: 'rainfallDeficitPct', valId: 'valRain', suffix: '%' },
    { id: 'inputN', valId: 'valN', suffix: '' },
    { id: 'inputP', valId: 'valP', suffix: '' },
    { id: 'inputK', valId: 'valK', suffix: '' },
    // Simulator Sliders
    { id: 'simTemp', valId: 'simValTemp', suffix: '°C' },
    { id: 'simRain', valId: 'simValRain', suffix: '%' },
    { id: 'simSoil', valId: 'simValSoil', suffix: '' },
    { id: 'simPrice', valId: 'simValPrice', suffix: '%' }
  ];

  sliders.forEach(item => {
    const el = document.getElementById(item.id);
    const valEl = document.getElementById(item.valId);
    if (el && valEl) {
      el.addEventListener('input', (e) => {
        valEl.textContent = `${e.target.value}${item.suffix}`;
        if (item.id.startsWith('sim')) {
          runSimulator();
        }
      });
    }
  });

  const btnCalc = document.getElementById('btnCalculateRisk');
  if (btnCalc) {
    btnCalc.addEventListener('click', runAssessment);
  }

  const districtSelect = document.getElementById('districtSelect');
  if (districtSelect) {
    DISTRICT_PROFILES.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.name} (${d.crop})`;
      districtSelect.appendChild(opt);
    });

    districtSelect.addEventListener('change', (e) => {
      const selected = DISTRICT_PROFILES.find(d => d.id === e.target.value);
      if (selected) {
        document.getElementById('fertilizer').value = selected.avgFertilizer;
        document.getElementById('temp').value = selected.avgTemp;
        document.getElementById('inputN').value = selected.avgN;
        document.getElementById('inputP').value = selected.avgP;
        document.getElementById('inputK').value = selected.avgK;
        document.getElementById('rainfallDeficitPct').value = Math.round(selected.rainfallDeficitPct);
        document.getElementById('apmcPrice').value = selected.apmcPricePerQuintal;

        // Trigger updates
        document.getElementById('fertilizer').dispatchEvent(new Event('input'));
        document.getElementById('temp').dispatchEvent(new Event('input'));
        document.getElementById('rainfallDeficitPct').dispatchEvent(new Event('input'));
        document.getElementById('inputN').dispatchEvent(new Event('input'));
        document.getElementById('inputP').dispatchEvent(new Event('input'));
        document.getElementById('inputK').dispatchEvent(new Event('input'));
        runAssessment();
      }
    });
  }
}

// 3. Run Primary Borrower Risk Assessment
function runAssessment() {
  const appData = {
    applicantName: document.getElementById('applicantName').value,
    district: document.getElementById('districtSelect').options[document.getElementById('districtSelect').selectedIndex]?.text || "Vidarbha",
    cropType: document.getElementById('cropType').value,
    loanAmount: document.getElementById('loanAmount').value,
    landAcres: document.getElementById('landAcres').value,
    cibilScore: document.getElementById('cibilScore').value,
    irrigationType: document.getElementById('irrigationType').value,
    collateralValue: document.getElementById('collateralValue').value,
    apmcPrice: document.getElementById('apmcPrice').value,
    fertilizer: document.getElementById('fertilizer').value,
    temp: document.getElementById('temp').value,
    rainfallDeficitPct: document.getElementById('rainfallDeficitPct').value,
    N: document.getElementById('inputN').value,
    P: document.getElementById('inputP').value,
    K: document.getElementById('inputK').value
  };

  const result = riskEngine.assessCreditRisk(appData);

  // Update UI Elements
  document.getElementById('resultScore').textContent = result.climateCreditScore;
  
  const badge = document.getElementById('resultBadge');
  badge.className = `badge ${result.badgeClass}`;
  badge.textContent = result.decision;

  document.getElementById('resultReason').textContent = result.decisionReason;
  document.getElementById('resultYield').textContent = `${result.predictedYield} t/ha`;
  document.getElementById('resultRevenue').textContent = `₹ ${result.grossFarmRevenue.toLocaleString('en-IN')}`;
  document.getElementById('resultDSCR').textContent = `${result.dscr}x`;
  document.getElementById('resultPD').textContent = `${result.pdClimatePct}%`;
  document.getElementById('resultLGD').textContent = `${result.lgdPct}%`;

  drawScoreGauge(result.climateCreditScore);
}

// 4. Run Interactive Stress Test Simulator & SHAP XAI
function runSimulator() {
  const simTemp = parseFloat(document.getElementById('simTemp').value);
  const simRain = parseFloat(document.getElementById('simRain').value);
  const simSoil = parseFloat(document.getElementById('simSoil').value);
  const simPriceDrop = parseFloat(document.getElementById('simPrice').value);

  const basePrice = parseFloat(document.getElementById('apmcPrice').value || 4500);
  const adjustedPrice = basePrice * (1 + simPriceDrop / 100);

  const simInput = {
    applicantName: document.getElementById('applicantName').value,
    cibilScore: document.getElementById('cibilScore').value,
    loanAmount: document.getElementById('loanAmount').value,
    landAcres: document.getElementById('landAcres').value,
    irrigationType: document.getElementById('irrigationType').value,
    collateralValue: document.getElementById('collateralValue').value,
    apmcPrice: adjustedPrice,
    fertilizer: document.getElementById('fertilizer').value,
    temp: simTemp,
    rainfallDeficitPct: simRain,
    soilMoisture: simSoil,
    ndvi: Math.max(0.2, 0.65 + (simRain / 150)),
    N: document.getElementById('inputN').value,
    P: document.getElementById('inputP').value,
    K: document.getElementById('inputK').value
  };

  const riskResult = riskEngine.assessCreditRisk(simInput);
  const explanation = explainabilityEngine.generateExplanation(riskResult);

  // Update Scenario Text
  document.getElementById('simScenarioText').innerHTML = 
    `Under <strong>${simTemp}°C heat</strong>, <strong>${simRain}% rainfall deficit</strong> & <strong>${simPriceDrop}% price drop</strong>:<br>` +
    `Forecasted Yield: <strong>${riskResult.predictedYield} t/ha</strong> | Default Prob (PD): <strong style="color:${riskResult.pdClimatePct > 15 ? '#f43f5e' : '#10b981'}">${riskResult.pdClimatePct}%</strong> | Climate Score: <strong>${riskResult.climateCreditScore}</strong>`;

  // Render SHAP Waterfall List
  const container = document.getElementById('shapContainer');
  container.innerHTML = '';

  explanation.shapValues.forEach(item => {
    const div = document.createElement('div');
    div.className = 'shap-item';
    div.innerHTML = `
      <div class="shap-info">
        <span class="shap-feature-name">${item.feature}: ${item.value}</span>
        <span class="shap-desc">${item.description}</span>
      </div>
      <div class="shap-points ${item.type}">
        ${item.impactPoints >= 0 ? '+' : ''}${item.impactPoints} pts
      </div>
    `;
    container.appendChild(div);
  });

  // Render Actionable Recommendations
  const recBox = document.getElementById('simRecommendations');
  recBox.innerHTML = `
    <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; color: #fff;">💡 NABARD Policy & Risk Mitigation Recommendations:</div>
    <ul style="padding-left: 1.2rem; margin: 0;">
      ${explanation.recommendations.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join('')}
    </ul>
  `;
}

// 5. Draw Canvas Circular Score Gauge
function drawScoreGauge(score) {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 75;

  // Background Arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Progress Arc
  const minScore = 300;
  const maxScore = 900;
  const pct = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));
  const endAngle = (0.75 + (1.5 * pct)) * Math.PI;

  let strokeColor = '#10b981'; // Green
  if (score < 610) strokeColor = '#ef4444'; // Red
  else if (score < 720) strokeColor = '#f59e0b'; // Amber

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, endAngle);
  ctx.lineWidth = 14;
  ctx.strokeStyle = strokeColor;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// 6. Initialize Chart.js Visualizations
function initCharts() {
  // Chart 1: Portfolio Distribution Doughnut
  const ctxDoughnut = document.getElementById('chartPortfolioDistribution').getContext('2d');
  new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: ['Low Risk (Approved)', 'Moderate (Conditional)', 'High Climate Risk (Rejected)'],
      datasets: [{
        data: [62, 24, 14],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } }
      },
      cutout: '70%'
    }
  });

  // Chart 2: District Exposure Bar Chart
  const ctxDistrict = document.getElementById('chartDistrictExposure').getContext('2d');
  new Chart(ctxDistrict, {
    type: 'bar',
    data: {
      labels: DISTRICT_PROFILES.map(d => d.name.split(',')[0]),
      datasets: [{
        label: 'Active Loan Exposure (₹ Cr)',
        data: DISTRICT_PROFILES.map(d => d.portfolioExposureCr),
        backgroundColor: '#6366f1',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      },
      plugins: { legend: { labels: { color: '#94a3b8' } } }
    }
  });

  // Chart 3: Fertilizer vs Yield Scatter
  const ctxFert = document.getElementById('chartFertVsYield').getContext('2d');
  new Chart(ctxFert, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Dataset Observations (Fertilizer vs Yield)',
        data: RAW_AGRICULTURAL_DATASET.map(d => ({ x: d.fertilizer, y: d.yield })),
        backgroundColor: '#06b6d4',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Fertilizer Application (kg/ha)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } },
        y: { title: { display: true, text: 'Crop Yield (t/ha)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
      }
    }
  });

  // Chart 4: Temperature vs Yield Scatter
  const ctxTemp = document.getElementById('chartTempVsYield').getContext('2d');
  new Chart(ctxTemp, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Dataset Heat Stress Curve (Temp vs Yield)',
        data: RAW_AGRICULTURAL_DATASET.map(d => ({ x: d.temp, y: d.yield })),
        backgroundColor: '#f43f5e',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Temperature (°C)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } },
        y: { title: { display: true, text: 'Crop Yield (t/ha)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// 7. Initialize Leaflet Map
function initMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  const map = L.map('map').setView([20.5937, 78.9629], 5);
  window.leafletMap = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 18
  }).addTo(map);

  DISTRICT_PROFILES.forEach(dist => {
    let circleColor = '#10b981';
    if (dist.riskLevel.includes('High')) circleColor = '#ef4444';
    else if (dist.riskLevel.includes('Moderate')) circleColor = '#f59e0b';

    const circle = L.circleMarker([dist.lat, dist.lng], {
      radius: 12,
      fillColor: circleColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);

    const popupContent = `
      <div style="color: #0f172a; font-family: Inter, sans-serif; min-width: 200px;">
        <h3 style="margin:0 0 6px; font-size:1rem; font-weight:700;">${dist.name}</h3>
        <p style="margin:0 0 4px; font-size:0.8rem; color:#475569;">Crop: <strong>${dist.crop}</strong></p>
        <p style="margin:0 0 4px; font-size:0.8rem; color:#475569;">Irrigation: <strong>${dist.irrigationType}</strong></p>
        <p style="margin:0 0 4px; font-size:0.8rem;">Satellite NDVI: <strong>${dist.ndvi}</strong></p>
        <p style="margin:0 0 4px; font-size:0.8rem;">Soil Moisture: <strong>${dist.soilMoisture}</strong></p>
        <p style="margin:0 0 4px; font-size:0.8rem;">Rainfall Anomaly: <strong style="color:${dist.rainfallDeficitPct < 0 ? '#dc2626' : '#16a34a'}">${dist.rainfallDeficitPct}%</strong></p>
        <p style="margin:0; font-size:0.8rem; font-weight:700;">Active Exposure: ₹ ${dist.portfolioExposureCr} Cr</p>
      </div>
    `;

    circle.bindPopup(popupContent);
  });
}

// 8. Preset Loaders
function initPresets() {
  const btnVidarbha = document.getElementById('btnLoadPresetVidarbha');
  if (btnVidarbha) {
    btnVidarbha.addEventListener('click', () => {
      document.getElementById('applicantName').value = "Vijay Deshmukh";
      document.getElementById('cropType').value = "Cotton";
      document.getElementById('loanAmount').value = 320000;
      document.getElementById('cibilScore').value = 650;
      document.getElementById('irrigationType').value = "Rainfed";
      document.getElementById('fertilizer').value = 62;
      document.getElementById('temp').value = 35;
      document.getElementById('rainfallDeficitPct').value = -32;
      document.getElementById('inputN').value = 68;
      document.getElementById('inputP').value = 20;
      document.getElementById('inputK').value = 17;

      document.getElementById('fertilizer').dispatchEvent(new Event('input'));
      document.getElementById('temp').dispatchEvent(new Event('input'));
      document.getElementById('rainfallDeficitPct').dispatchEvent(new Event('input'));
      document.getElementById('inputN').dispatchEvent(new Event('input'));
      document.getElementById('inputP').dispatchEvent(new Event('input'));
      document.getElementById('inputK').dispatchEvent(new Event('input'));

      runAssessment();
    });
  }

  const btnPunjab = document.getElementById('btnLoadPresetPunjab');
  if (btnPunjab) {
    btnPunjab.addEventListener('click', () => {
      document.getElementById('applicantName').value = "Gurpreet Singh";
      document.getElementById('cropType').value = "Wheat";
      document.getElementById('loanAmount').value = 450000;
      document.getElementById('cibilScore').value = 780;
      document.getElementById('irrigationType').value = "Canal & Tube-well";
      document.getElementById('fertilizer').value = 80;
      document.getElementById('temp').value = 27;
      document.getElementById('rainfallDeficitPct').value = 4;
      document.getElementById('inputN').value = 80;
      document.getElementById('inputP').value = 24;
      document.getElementById('inputK').value = 20;

      document.getElementById('fertilizer').dispatchEvent(new Event('input'));
      document.getElementById('temp').dispatchEvent(new Event('input'));
      document.getElementById('rainfallDeficitPct').dispatchEvent(new Event('input'));
      document.getElementById('inputN').dispatchEvent(new Event('input'));
      document.getElementById('inputP').dispatchEvent(new Event('input'));
      document.getElementById('inputK').dispatchEvent(new Event('input'));

      runAssessment();
    });
  }
}

// 9. Render Tables
function populateDistrictTable() {
  const tbody = document.getElementById('districtTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  DISTRICT_PROFILES.forEach(d => {
    let badgeClass = 'badge-success';
    if (d.riskLevel.includes('High')) badgeClass = 'badge-danger';
    else if (d.riskLevel.includes('Moderate')) badgeClass = 'badge-warning';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${d.name}</strong></td>
      <td>${d.crop}</td>
      <td>${d.irrigationType}</td>
      <td>${d.avgTemp}°C</td>
      <td style="color:${d.rainfallDeficitPct < 0 ? '#f43f5e' : '#10b981'}">${d.rainfallDeficitPct}%</td>
      <td>${d.historicalYield} t/ha</td>
      <td>₹ ${d.portfolioExposureCr} Cr</td>
      <td><span class="badge ${badgeClass}">${d.riskLevel}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function populateRawDatasetTable() {
  const tbody = document.getElementById('rawDatasetBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  // Show first 15 sample rows from the dataset
  RAW_AGRICULTURAL_DATASET.slice(0, 15).forEach(row => {
    let stressCat = 'Optimal';
    let catClass = 'badge-success';
    if (row.temp > 34 || row.fertilizer < 65) {
      stressCat = 'Heat / Deficit Stress';
      catClass = 'badge-danger';
    } else if (row.yield < 10.5) {
      stressCat = 'Moderate Yield';
      catClass = 'badge-warning';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.fertilizer}</td>
      <td>${row.temp}°C</td>
      <td>${row.N}</td>
      <td>${row.P}</td>
      <td>${row.K}</td>
      <td><strong>${row.yield}</strong></td>
      <td><span class="badge ${catClass}">${stressCat}</span></td>
    `;
    tbody.appendChild(tr);
  });
}
