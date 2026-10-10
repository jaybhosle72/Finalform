# 🌾 AgriSure FIN-03: Climate-Aware Agricultural Credit Risk Assessment System

An institution-grade, full-stack web application for evaluating **Climate-Aware Credit Risk**, **Farmer Repayment Capacity**, **Earth Observation Telemetry**, and **Loan Decisioning** tailored for agricultural lending in India.

![AgriSure Climate Credit Risk Banner](https://img.shields.io/badge/AgriSure-FIN--03_Specification-0d9488?style=for-the-badge)
![FastAPI Backend](https://img.shields.io/badge/FastAPI-v2.1_Production-009688?style=for-the-badge&logo=fastapi)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-2.0_Integrated-4285F4?style=for-the-badge&logo=google)
![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel_Ready-000000?style=for-the-badge&logo=vercel)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
- [Dual-Pillar Climate-Credit Risk Engine](#-dual-pillar-climate-credit-risk-engine)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Environment Configuration & Google OAuth](#-environment-configuration--google-oauth)
- [Deployment (Vercel)](#-deployment-vercel)
- [Local Installation & Setup](#-local-installation--setup)
- [Automated Verification & Test Suites](#-automated-verification--test-suites)
- [Dataset Disclaimer](#-dataset-disclaimer)

---

## 🌐 Overview

Traditional agricultural credit evaluation relies heavily on static financial history (CIBIL) and manual asset inspection. **AgriSure FIN-03** introduces a **Dual-Pillar Risk Engine** that synthesizes real-time climate telemetry (Open-Meteo, Landsat-8/9 optical vegetation data, ISRIC SoilGrids) with borrower credit histories, debt service ratios (DSCR), and crop agronomics.

The platform provides role-based interfaces for **Farmers** (loan application & tracking) and **Bank Officers** (credit evaluation, SHAP explainability, and decision audit logs).

---

## 🚀 Key Features & Modules

### 🔐 1. Full-Screen Dual-Role Authentication (`#/login` & `#/register`)
- **Single Unified Login**: Farmers and Bank Officers toggle roles dynamically on one full-screen interface (`#/login`).
- **Administrative Invite Code Protection**: Officer registration (`#/register`) requires the administrative passcode `OFFICER_2026_ADMIN`.
- **Google OAuth 2.0 Integration**: One-click Google Sign-In with automated role assignment via server-side officer email allowlist (`GOOGLE_OFFICER_EMAILS`).

### 🌾 2. Farmer Portal (`#/dashboard`)
- **Personalized Farmer Dashboard**: Displays linked KCC account details, masked financial information, and application tracking.
- **Interactive Loan Application**: 10-field submission form auto-generates unique application codes (e.g., `APP-2026-8404`) and places applications into the Bank Officer review queue.

### 🏛️ 3. Bank Officer Review Desk (`#/officer`)
- **10-Section Comprehensive Review File**: Unmasked financial records, 7/12 land registry status, soil NPK analysis, climate stress scores, and audit history.
- **Mandatory Rationale Enforcement**: Prevents un-justified approvals or rejections by validating officer decision notes.
- **Audit Trail Persistence**: Logs officer decisions, timestamps, and comments in a permanent historical record.

### 🛡️ 4. Climate-Aware Credit Risk Assessment (`#/risk`)
- **Dynamic Borrower Evaluation**: Real-time credit risk scoring across 145+ borrower loan application records (`DEMO001` to `DEMO145`).
- **Interactive Farmer Switcher**: Selecting any borrower dynamically re-evaluates credit scores, repayment probabilities, expected losses, and SHAP charts in real-time.
- **Portfolio Batch Evaluation**: Evaluates 100+ borrowers simultaneously, summarizing total loan exposure, approved/conditional counts, and portfolio Expected Loss (EL ₹).

---

## 📊 Dual-Pillar Climate-Credit Risk Engine

The risk engine computes a **Climate-Credit Rating Score (300 to 900 scale)** by evaluating two independent risk pillars:

$$\text{Combined Risk Score} = (0.55 \times \text{Climate Risk Score}) + (0.45 \times \text{Financial Risk Score})$$

$$\text{Climate-Credit Score} = \max\left(300, \min\left(900, 900 - (\text{Combined Risk Score} \times 6.0)\right)\right)$$

### 1️⃣ Climate Risk Pillar (0 – 100 Risk Score)
- **Monsoon Rainfall Anomaly**: Drought deficit vs. flood excess tracking.
- **Thermal & Heatwave Stress**: Evapotranspiration acceleration metrics.
- **Soil Moisture & pH**: Root-zone moisture saturation from ISRIC SoilGrids.
- **Satellite NDVI**: Vegetation health index from Landsat-8/9 & Copernicus Sentinel-2 telemetry.
- **Irrigation Buffer Mitigation**: Drip irrigation reduces climate risk by up to **55%**, while rainfed cultivation applies a risk multiplier.

### 2️⃣ Financial Repayment Pillar (0 – 100 Risk Score)
- **Credit Score (CIBIL)**: Historical repayment track record.
- **Debt Service Coverage Ratio (DSCR)**: Net farm income vs. annual EMI commitments.
- **Days Past Due (DPD)** & Overdue loan obligations.

### 🔮 SHAP Explainability (XAI) & Plain Language Narrative
- **SHAP Waterfall / Bar Chart**: Visualizes point contributions (+ / - score impact) of key drivers (CIBIL, Irrigation, Heatwave, DSCR).
- **Plain Language Risk Summary**: Generates automated narrative explanations for decision support.
- **Institutional Compliance**: Outputs are explicitly labeled with `PROTOTYPE_RISK_SCORE` (UNCALIBRATED) pending historical loss calibration.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+ SPA architecture), Lucide Icons, Chart.js.
- **Backend API**: Python 3.11+, FastAPI, Pydantic, PyJWT authentication, Uvicorn server.
- **Analytics & ML**: NumPy, SciPy, custom Dual-Pillar Risk Engine & SHAP Explainability module.
- **Integrations**: Open-Meteo Weather API, ISRIC SoilGrids API, Kaggle 12 Agricultural Datasets Catalog, Google OAuth 2.0 API.

---

## 📁 Project Architecture & Directory Structure

```
finalform/
├── index.html                  # Main SPA HTML container & view components
├── css/
│   └── styles.css              # Agricultural finance design system & CSS design tokens
├── js/
│   ├── app.js                  # Client hash router & view switching controller
│   ├── auth_controller.js      # Auth forms, Google OAuth & JWT token session state
│   ├── risk_controller.js      # Risk UI controller, borrower dropdown & SHAP rendering
│   ├── officer_controller.js   # Bank officer queue, search/filter & 10-section file viewer
│   ├── climate_controller.js   # Landsat satellite & telemetry dashboard controller
│   └── crop_insights_controller.js # Kaggle 12 crop catalog & yield benchmark controller
├── backend/
│   ├── main.py                 # FastAPI application entry point & router mounting
│   ├── auth_service.py         # Authentication service, JWT issuance & Google OAuth
│   ├── risk_service.py         # Dual-Pillar risk assessment REST endpoints
│   ├── officer_service.py      # Officer application queue & decision endpoints
│   ├── farmer_data_service.py  # Farmer dashboard & application submission API
│   ├── crop_data_service.py    # Kaggle dataset catalog lookup service
│   ├── analytics/
│   │   ├── risk_engine.py      # Core Dual-Pillar Risk Engine implementation
│   │   ├── shap_explainability.py # SHAP waterfall & recommendation generator
│   │   └── pdf_generator.py    # AgriSure risk evaluation PDF report generator
│   └── data/
│       └── synthetic_agricultural_loan_repayment_100_farmers.csv  # 145 borrower dataset
├── scratch/                    # Automated test suites & verification scripts
├── .env.example                # Environment variables template
└── README.md                   # Project documentation
```

---

## 🔑 Environment Configuration & Google OAuth

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Populate your `.env` configuration:

```env
# Google OAuth 2.0 Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=301915111750-7m7jhmpon7bt7i8jpcsirvcr80gujdsb.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v2/auth/google/callback

# Security & Base Application URL
SESSION_SECRET_KEY=agri_credit_risk_session_secret_2026_prod
APP_BASE_URL=http://localhost:8000

# Server-Side Bank Officer Email Allowlist
GOOGLE_OFFICER_EMAILS=officer1@bank.org,officer2@bank.org,credit.officer@agrisure.in
```

### 🌐 Google Cloud Console Setup for Production / Vercel
In Google Cloud Console (**APIs & Services** $\rightarrow$ **Credentials** $\rightarrow$ **OAuth 2.0 Client IDs**):
- **Authorized JavaScript origins**: `https://finalform-orcin.vercel.app`
- **Authorized redirect URIs**: `https://finalform-orcin.vercel.app/api/v2/auth/google/callback`

---

## ☁️ Deployment (Vercel)

The application is fully compatible with Vercel deployment (`finalform-orcin.vercel.app`):
1. Import this repository into Vercel.
2. Set Environment Variables in the Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI = https://finalform-orcin.vercel.app/api/v2/auth/google/callback`
   - `APP_BASE_URL = https://finalform-orcin.vercel.app`
3. Deploy!

---

## 🚀 Local Installation & Setup

### 1. Start the FastAPI Backend (Port 8000)
From the root directory:

```bash
# Install Python dependencies
pip install fastapi uvicorn pydantic pyjwt requests matplotlib

# Start FastAPI Uvicorn Server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API Interactive Documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 2. Serve the Static Web Frontend (Port 8080 or Live Server)
In a separate terminal window:

```bash
python -m http.server 8080
```
Open your browser to: **[http://localhost:8080](http://localhost:8080)** (or access via FastAPI at `http://localhost:8000`).

---

## 🧪 Automated Verification & Test Suites

The codebase includes 5 automated test scripts in `scratch/`:

```bash
# 1. Test Dual-Pillar Risk Engine & Extreme Climate Rules
python scratch/test_risk_engine.py

# 2. Test Farmer Portal & Loan Application Submission
python scratch/test_phase9.py

# 3. Test Bank Officer Review File & Audit Logging
python scratch/test_officer_dashboard.py

# 4. Test Google OAuth 2.0 Integration & Token Flow
python scratch/test_google_auth.py

# 5. Execute Complete End-to-End System Scenario (13 Scenario Checks)
python scratch/test_e2e_full_scenario.py
```

---

## 📊 Dataset Disclaimer

> **IMPORTANT NOTICE**:
> The primary dataset (`data/synthetic_agricultural_loan_repayment_100_farmers.csv`) consists of **synthetic demonstration data** generated for testing algorithms, risk engines, and UI capabilities. It does **NOT** contain actual confidential borrower records.
