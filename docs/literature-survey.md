# Literature Survey — Distributor Territory Management System
**Company:** Arvi Edibles  
**Developed by:** Chennam Shetti Venkat Jagan Mohan  
**Date:** June 2026

---

## 1. Introduction

Distributor Territory Management Systems (DTMS) are software solutions
used by companies to monitor and evaluate the performance of their
distribution network across geographic territories.

This survey reviews existing approaches relevant to building
a DTMS for Arvi Edibles, an edible oils company.

---

## 2. Existing Systems

### 2.1 Manual Methods (Excel)
Many small businesses use Excel spreadsheets. Problems:
- No real-time updates
- Difficult to generate reports
- No visual analytics
- Error-prone manual entry

### 2.2 Enterprise ERP Systems (SAP/Oracle)
Large companies use SAP or Oracle. Problems:
- Very expensive (50 lakhs+)
- Complex to configure
- Requires dedicated IT teams
- Overkill for SME companies like Arvi Edibles

### 2.3 Custom Web Applications
Modern companies build custom web dashboards using React,
Node.js and PostgreSQL. This is cost-effective and flexible.
This is the approach used in this project.

---

## 3. Technology Choices

### 3.1 React.js
Why chosen:
- Component-based architecture
- Large ecosystem (Recharts, Framer Motion)
- Industry standard for dashboards

### 3.2 Node.js + Express.js
Why chosen:
- JavaScript on both frontend and backend
- Fast, non-blocking API requests
- Lightweight and easy to set up

### 3.3 PostgreSQL via Supabase
Why chosen:
- Relational database for structured business data
- Free cloud hosting via Supabase
- ACID compliant for data integrity

### 3.4 Tailwind CSS
Why chosen:
- Utility-first approach speeds up development
- Consistent design system
- Responsive design built-in

---

## 4. Features Identified

| Feature | Priority | Status |
|---|---|---|
| Distributor data entry form | High | Done |
| Dashboard with KPI cards | High | Done |
| Performance charts | High | Done |
| Detail view per distributor | Medium | Done |
| Territory tracking | High | Done |
| Status management | Medium | Done |
| User authentication | Low | Future scope |
| Export to PDF/Excel | Low | Future scope |

---

## 5. Conclusion

A custom web application using React + Node.js + PostgreSQL
was chosen as the most appropriate solution for Arvi Edibles.

Benefits:
- Cost-effective development
- Scalable architecture
- Modern responsive UI
- Real-time data from cloud database

---

## 6. References

1. React.js Documentation - https://react.dev
2. Express.js Documentation - https://expressjs.com
3. Supabase Documentation - https://supabase.com/docs
4. Tailwind CSS Documentation - https://tailwindcss.com
5. Recharts Documentation - https://recharts.org
6. Framer Motion Documentation - https://www.framer.com/motion