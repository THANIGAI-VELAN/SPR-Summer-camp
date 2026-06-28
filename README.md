# 📖 Pharmacy Smart Inventory & Demand Forecasting System — User Guide

Welcome to the **Pharmacy Smart Inventory & Demand Forecasting System**. This application is a production-grade, intelligence-driven, and highly visual SaaS solution tailored for modern pharmacies, clinical distributors, and healthcare inventory managers.

---

## 🎯 What is this Application Used For?

This application serves as a comprehensive **Point of Sale (POS) Billing** and **Predictive Inventory Management Hub**. It is designed to bridge the gap between daily clinical retail sales and strategic backend supply chain operations. 

By utilizing **Machine Learning forecasting models** and **Generative AI insights**, the system empowers pharmacists and store managers to predict customer demand, prevent pharmaceutical waste, and automate procurement decisions with mathematical precision.

---

## 🧠 Key Problems Solved

Traditional pharmacy management relies heavily on manual counts and simple static reorder thresholds. This system solves critical pain points through automated statistical pipelines:

| Real-World Problem | How This System Solves It | Key Feature Applied |
| :--- | :--- | :--- |
| **Operational Stockouts** | Predicts high-velocity demand surges beforehand, ensuring critical live-saving drugs never drop to zero. | ML-Powered Forecasting |
| **Capital Lock-in** | Classifies inventory value Pareto-style (Class A, B, C) so managers don't over-purchase low-velocity drugs. | ABC Analysis Matrix |
| **Expired Drug Write-offs** | Proactively highlights batches nearing expiration within 6 months, recommending markdown triggers. | Expiry Risk Tracker |
| **Dead/Dormant Stock** | Alerts managers when specific medicine SKUs have not recorded a single sales transaction for 30+ days. | Capital Velocity alerts |
| **Manual Procurement Guesswork** | Calculates dynamic safety buffers, reorder points, and recommended order quantities based on historic velocity. | Procurement Automation |

---

## 👥 Role-Based Demo Accounts

The system supports strict security boundaries. You can log in with either of the following pre-configured credentials to experience different dashboard permissions:

*   **System Administrator** (Full Read & Write Access):
    *   **Email**: `admin@pharmacy.com`
    *   **Password**: `admin123`
*   **Inventory Manager** (Read-Only & POS Operations):
    *   **Email**: `manager@pharmacy.com`
    *   **Password**: `manager123`

---

## ⚙️ Step-by-Step Usage & Workflows

### 1. Active POS Billing Console (Sales View)
*   **Purpose**: Handle real-time patient checkouts and record transaction-level clinical data.
*   **How to Use**:
    1.  Navigate to the **POS Terminal** tab.
    2.  Select a medicine SKU from the dynamic dropdown or type/scan the barcode.
    3.  Adjust the quantity (the system prevents you from overselling beyond available physical stock limits).
    4.  Click **Add to Cart**.
    5.  Review totals, VAT, and discounts, then click **Complete Checkout** to instantly update inventory levels and capture transactional indicators.

### 2. Batch Data Upload & Inventory Logs (Inventory View)
*   **Purpose**: View active batch logs, track physical items, and import historical POS logs programmatically.
*   **How to Use**:
    1.  Navigate to the **Inventory Hub**.
    2.  View physical metrics such as Batch Numbers, Expiration Dates, and Cost vs. Selling price margins.
    3.  Use the **Drag & Drop CSV Upload** panel to import historical pharmaceutical streams. The system parses inputs, verifies column schemas, and integrates records on the fly.

### 3. ML-Powered Demand Forecasting (Forecasting View)
*   **Purpose**: Visualize projected sales trajectory with 95% Confidence Intervals (CI) to optimize purchasing timelines.
*   **How to Use**:
    1.  Open the **Demand Forecasts** tab.
    2.  Select a specific therapeutic SKU (e.g., *Amoxicillin*, *Paracetamol*) and set your horizon target (**7 Days**, **30 Days**, or **90 Days**).
    3.  Analyze the **Demand Trajectory Plot** containing solid historical markers, dashed predicted curves, and high-fidelity CI shadow bounds.
    4.  Evaluate **Regression Metrics** (R-Squared, MAPE, MAE) verifying the precision of active model curve-fitting.
    5.  Verify auto-calculated **Procurement Rules** summarizing recommended replenishment orders, safety stock floors, and lead delivery times.

### 4. Advanced Inventory Analytics (Analytics View)
*   **Purpose**: Deep-dive into financial capital health, write-off prevention, and weather-correlated trends.
*   **How to Use**:
    1.  Open the **Analytics Panel**.
    2.  **ABC Tab**: Examine cumulative capital lock-in. Prioritize management focus on Class A high-value medicines.
    3.  **Expiry Risks Tab**: Monitor near-expiry batches. Use suggested clinical mitigations (such as 30% discount clearances or partner hospital transfers) to prevent write-off losses.
    4.  **Dead Stock Tab**: Identify dormant assets locking up working capital and view actions to liquidate them.
    5.  **Seasonal Matrix Tab**: Review weather-correlated illness demand trends (such as Monsoon pathogen surges or Winter dry-throat spikes) to preemptively stock up.

### 5. Smart Copilot Insights (Dashboard View)
*   **Purpose**: View high-level metrics and context-aware business recommendations.
*   **How to Use**:
    1.  Go to the main **Dashboard**.
    2.  Observe standard key cards: Total Revenue, Gross Profit margins, Low Stock alerts, and Batch Expiries.
    3.  Read the **AI-Based Operational Copilot Insights** banner at the top. The system synthesizes active inventory parameters, near-expiry metrics, and monsoon indices to formulate natural language business recommendations.

### 6. Programmatic Integrations (Developer View)
*   **Purpose**: Programmatic sync for clinical distributors and external ERP networks.
*   **How to Use**:
    1.  Navigate to the **Demand Forecasts** tab.
    2.  Under **Forecast Swagger REST API**, view the OpenAPI compliant schema.
    3.  Click **Copy Endpoint** to programmatically target the endpoint (`GET /api/forecasting`) and sync predicted volumes in standard EAN-JSON schemas.

---

*Thank you for utilizing the Pharmacy Smart Inventory & Demand Forecasting Dashboard! For additional parameter configurations or to download the synthetic 100,000-row testing dataset, proceed to the Global Configurations tab.*
