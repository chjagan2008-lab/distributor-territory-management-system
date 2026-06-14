# Database Schema — Distributor Territory Management System
**Company:** Arvi Edibles  
**Database:** PostgreSQL via Supabase  
**Developed by:** Chennam Shetti Venkat Jagan Mohan

---

## Database Details
- Host: aws-1-ap-southeast-1.pooler.supabase.com
- Connection: Session Pooler
- Region: Asia Pacific Southeast

---

## Table 1: distributor_records

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique ID |
| distributor_name | VARCHAR(100) | NOT NULL | Full name of distributor |
| territory | VARCHAR(100) | NOT NULL | Geographic territory |
| monthly_offtake | INTEGER | NOT NULL | Monthly units distributed |
| new_outlet_additions | INTEGER | DEFAULT 0 | New outlets added |
| coverage_metrics | DECIMAL(5,2) | DEFAULT 0 | Coverage percentage |
| performance_ranking | INTEGER | NULL allowed | Performance rank |
| status | VARCHAR(20) | DEFAULT active | active/inactive/pending |
| created_at | TIMESTAMP | AUTO | Record creation time |
| updated_at | TIMESTAMP | AUTO | Last update time |

### SQL:
CREATE TABLE distributor_records (
  id                   SERIAL PRIMARY KEY,
  distributor_name     VARCHAR(100) NOT NULL,
  territory            VARCHAR(100) NOT NULL,
  monthly_offtake      INTEGER NOT NULL,
  new_outlet_additions INTEGER DEFAULT 0,
  coverage_metrics     DECIMAL(5,2) DEFAULT 0,
  performance_ranking  INTEGER,
  status               VARCHAR(20) DEFAULT 'active',
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

## Table 2: audit_logs

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| record_id | INTEGER | FK to distributor_records | Which record changed |
| action | VARCHAR(50) | NOT NULL | INSERT/UPDATE/DELETE |
| changed_by | VARCHAR(100) | DEFAULT system | Who changed it |
| changed_at | TIMESTAMP | AUTO | When it changed |

### SQL:
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  record_id   INTEGER REFERENCES distributor_records(id),
  action      VARCHAR(50) NOT NULL,
  changed_by  VARCHAR(100) DEFAULT 'system',
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

## Relationship

distributor_records (1) → (Many) audit_logs
One distributor can have many audit log entries.

---

## Sample Data

INSERT INTO distributor_records
(distributor_name, territory, monthly_offtake,
 new_outlet_additions, coverage_metrics,
 performance_ranking, status)
VALUES
('Ravi Kumar',  'Hyderabad North', 450, 12, 87.50, 1, 'active'),
('Suresh Babu', 'Hyderabad South', 380, 8,  75.50, 2, 'active');