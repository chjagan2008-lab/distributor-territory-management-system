// 📝 NOTE: FormPage.js — Redesigned to match dark glassmorphism theme
// 📝 NOTE: Logic unchanged — only background + header styling updated

import DistributorForm from '../components/EntryForm/DistributorForm';

function FormPage() {
  return (
    // 📝 NOTE: Dark background matches Dashboard + Sidebar + Login
    <div
      className="min-h-screen p-8"
      style={{ background: '#0b1a0d' }}
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: '#f8fafc' }}
        >
          Add Distributor
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Enter new distributor territory and performance data
        </p>
        {/* 📝 NOTE: Golden accent line — same signature as all other pages */}
        <div style={{
          width: 36, height: 2, background: '#f59e0b',
          borderRadius: 2, marginTop: 10,
        }} />
      </div>

      {/* 📝 NOTE: DistributorForm component handles all the form logic */}
      <DistributorForm />
    </div>
  );
}

export default FormPage;