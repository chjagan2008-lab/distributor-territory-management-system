import DistributorForm from '../components/EntryForm/DistributorForm';
function FormPage() {
  return (
    // 📝 NOTE: clamp padding — tight on mobile, comfortable on desktop
    <div style={{ minHeight: '100vh', padding: 'clamp(12px,4vw,32px)', background: '#0b1a0d' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Add Distributor</h2>
        <p style={{ color: 'rgba(248,250,252,0.45)', marginTop: 4, fontSize: 13 }}>Enter new distributor territory and performance data</p>
        <div style={{ width: 36, height: 2, background: '#f59e0b', borderRadius: 2, marginTop: 8 }} />
      </div>
      <DistributorForm />
    </div>
  );
}
export default FormPage;