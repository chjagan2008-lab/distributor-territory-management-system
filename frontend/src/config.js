const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://distributor-territory-management-system.onrender.com'
  : 'http://localhost:5000';

export default API_BASE;