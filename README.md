# Distributor Territory Management & Performance System

A full-stack web application built for **Arvi Edibles** (Edible Oils Company) to manage and monitor distributor performance across territories.

**Developed by:** Chennam Shetti Venkat Jagan Mohan  
**Internship:** Arvi Edibles, June 2026  
**Role:** Full Stack Developer (Frontend + Backend + Database)

---

## 🌐 Live URLs

| Service | URL |
|---|---|
| **Frontend (Live)** | https://distributor-territory-management-sy-xi.vercel.app |
| **Backend API (Live)** | https://distributor-territory-management-system.onrender.com |
| **GitHub Repo** | https://github.com/chjagan2008-lab/distributor-territory-management-system |

---

## 📋 Project Overview

Arvi Edibles previously tracked distributor data manually using Excel spreadsheets. This system replaces that with a modern web dashboard that provides:

- Real-time distributor performance tracking
- Automated alerts for low performance
- Visual analytics with charts
- CSV data export
- Full CRUD operations (Create, Read, Update, Delete)

---

## ✨ Features Built

### Screen 1 — Dashboard
- Live statistics (Total Distributors, Offtake, Active Count)
- Count-up number animations
- Bar chart — Monthly Offtake by Distributor
- Pie/Donut chart — Distributor Status distribution
- Status filter buttons (All / Active / Inactive / Pending)
- Search by name or territory
- Sortable columns (click any header)
- Automated alert banners (Low Coverage / Low Offtake)
- Per-row alert badges

### Screen 2 — Entry Form
- Add new distributor records
- 7 input fields with validation
- Required field indicators
- Success toast with progress bar (auto-dismisses in 3s)
- Shake animation on error
- Form resets after successful submit

### Screen 3 — Detail View
- Full details of individual distributor
- Animated avatar with initials
- Coverage progress bar animation
- Star rating for performance ranking
- Edit distributor (pre-filled form)
- Delete with confirmation modal

### Screen 4 — Reports & Analytics
- 4 summary cards with count-up animation
- Top performer banner (Rank #1)
- Bar chart — Offtake vs New Outlets comparison
- Line chart — Coverage Metrics trend
- Detailed performance table sorted by ranking
- Mini progress bars for coverage
- CSV Export (downloads instantly)

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js (CRA) | UI framework |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| Recharts | Data visualization |
| Lucide React | Icons |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| node-postgres (pg) | PostgreSQL driver |
| dotenv | Environment variables |
| cors | Cross-origin requests |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Supabase | Cloud database hosting |

### Deployment & Tools
| Technology | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Git + GitHub | Version control |
| Thunder Client | API testing |
| CRACO | CRA configuration override |

---

## 🗄️ Database Schema

### Table: `distributor_records`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| distributor_name | VARCHAR(100) | Distributor full name |
| territory | VARCHAR(100) | Geographic territory |
| monthly_offtake | INTEGER | Monthly units distributed |
| new_outlet_additions | INTEGER | New outlets added |
| coverage_metrics | DECIMAL(5,2) | Territory coverage % |
| performance_ranking | INTEGER | Overall ranking |
| status | VARCHAR(20) | active/inactive/pending |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### Table: `audit_logs`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| record_id | INTEGER | FK to distributor_records |
| action | VARCHAR(50) | INSERT/UPDATE/DELETE |
| changed_by | VARCHAR(100) | Who made the change |
| changed_at | TIMESTAMP | When change was made |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Server health check |
| GET | /api/distributors | Get all distributors |
| POST | /api/distributors | Create new distributor |
| PUT | /api/distributors/:id | Update distributor |
| DELETE | /api/distributors/:id | Delete distributor |
| GET | /api/test-db | Test database connection |

---

## 📁 Folder Structure
distributor-territory-management-system/

├── backend/

│   ├── controllers/

│   │   └── distributorController.js

│   ├── routes/

│   │   └── distributorRoutes.js

│   ├── db.js

│   ├── index.js

│   ├── package.json

│   └── .env (not in GitHub)

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   │   ├── Layout/

│   │   │   │   └── Sidebar.js

│   │   │   └── EntryForm/

│   │   │       └── DistributorForm.js

│   │   ├── pages/

│   │   │   ├── DashboardPage.js

│   │   │   ├── FormPage.js

│   │   │   ├── DetailPage.js

│   │   │   ├── EditPage.js

│   │   │   └── ReportsPage.js

│   │   ├── config.js

│   │   ├── App.js

│   │   └── index.css

│   ├── public/

│   │   └── index.html

│   └── package.json

├── docs/

│   ├── architecture-diagram.md

│   ├── database-schema.md

│   └── literature-survey.md

└── README.md

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Git

### Step 1 — Clone Repository
```bash
git clone https://github.com/chjagan2008-lab/distributor-territory-management-system.git
cd distributor-territory-management-system
```

### Step 2 — Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
DB_HOST=your_supabase_host

DB_PORT=5432

DB_NAME=postgres

DB_USER=your_supabase_user

DB_PASSWORD=your_password

PORT=5000

Start backend:
```bash
node index.js
```

### Step 3 — Setup Frontend
```bash
cd frontend
npm install
npx craco start
```

### Step 4 — Open Browser
http://localhost:3000

---

## 📊 Project Stats
Total Files Created:     25+

Total Lines of Code:     2000+

API Endpoints:           6

Database Tables:         2

React Components:        10+

Features Built:          15+

Days to Build:           5 days

---

## 🎯 Project Milestones

| Milestone | Status |
|---|---|
| Database setup (Supabase) | ✅ Complete |
| Backend API (Express) | ✅ Complete |
| Frontend UI (React) | ✅ Complete |
| Dashboard with charts | ✅ Complete |
| Entry Form | ✅ Complete |
| Detail View | ✅ Complete |
| Reports & Analytics | ✅ Complete |
| Edit & Delete (CRUD) | ✅ Complete |
| Search & Filter | ✅ Complete |
| Automated Alerts | ✅ Complete |
| CSV Export | ✅ Complete |
| Deployment (Vercel+Render) | ✅ Complete |
| Login / Authentication | 🔄 In Progress |
| Pagination | 🔄 In Progress |

---

## 👨‍💻 Developer

**Chennam Shetti Venkat Jagan Mohan**  
1st Year Engineering Student  
Internship at Arvi Edibles, June 2026  
GitHub: [@chjagan2008-lab](https://github.com/chjagan2008-lab)