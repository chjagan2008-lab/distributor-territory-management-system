# System Architecture — Distributor Territory Management System
**Company:** Arvi Edibles  
**Developed by:** Chennam Shetti Venkat Jagan Mohan  
**Date:** June 2026

---

## Architecture Overview

This project follows a 3-Tier Architecture:

PRESENTATION LAYER
- React.js (localhost:3000)
- Dashboard | Entry Form | Detail View

BUSINESS LAYER  
- Node.js + Express.js (localhost:5000)
- GET /api/distributors
- POST /api/distributors

DATA LAYER
- PostgreSQL via Supabase (Cloud)
- distributor_records | audit_logs

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | UI components and routing |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Animation | Framer Motion | Smooth animations |
| Charts | Recharts | Data visualization |
| Icons | Lucide React | UI icons |
| Routing | React Router v6 | Client-side navigation |
| Backend | Node.js + Express.js | REST API server |
| Database | PostgreSQL (Supabase) | Cloud database |
| DB Driver | node-postgres (pg) | Database connection |
| Version Control | Git + GitHub | Source code management |

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | /dashboard | Stats, charts, distributor table |
| Add Distributor | /add-distributor | Entry form for new records |
| Detail View | /distributor/:id | Full details of one distributor |

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/distributors | Fetch all distributor records |
| POST | /api/distributors | Create new distributor record |
| GET | /health | Server health check |
| GET | /api/test-db | Database connection test |

---

## Data Flow

User fills form
→ React sends POST to Express API
→ Express validates data
→ Express saves to Supabase PostgreSQL
→ Supabase returns saved record
→ Express sends response to React
→ React shows success message
→ Dashboard fetches updated data

---

## Folder Structure

distributor-territory-management-system/
├── backend/
│   ├── controllers/distributorController.js
│   ├── routes/distributorRoutes.js
│   ├── db.js
│   └── index.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Layout/Sidebar.js
│       │   └── EntryForm/DistributorForm.js
│       └── pages/
│           ├── DashboardPage.js
│           ├── FormPage.js
│           └── DetailPage.js
├── docs/
└── README.md