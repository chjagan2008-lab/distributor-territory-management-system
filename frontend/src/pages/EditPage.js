import API_BASE from '../config';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';


const inputClass = `
  w-full px-4 py-3 border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-green-400
  focus:border-green-400
  hover:border-gray-300
  transition-all duration-200 bg-white text-gray-800
  placeholder-gray-300
`;

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    distributor_name: '',
    territory: '',
    monthly_offtake: '',
    new_outlet_additions: '',
    coverage_metrics: '',
    performance_ranking: '',
    status: 'active'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load existing data
  useEffect(() => {
    const fetchDistributor = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        const found = list.find(d => d.id === parseInt(id));

        if (!found) {
          setError('Distributor not found');
        } else {
          // Pre-fill form with existing data
          setFormData({
            distributor_name: found.distributor_name || '',
            territory: found.territory || '',
            monthly_offtake: found.monthly_offtake || '',
            new_outlet_additions: found.new_outlet_additions || '',
            coverage_metrics: found.coverage_metrics || '',
            performance_ranking: found.performance_ranking || '',
            status: found.status || 'active'
          });
        }
      } catch (err) {
        setError('Could not load distributor data');
      } finally {
        setLoading(false);
      }
    };
    fetchDistributor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/distributors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthly_offtake: parseInt(formData.monthly_offtake),
          new_outlet_additions: parseInt(formData.new_outlet_additions) || 0,
          coverage_metrics: parseFloat(formData.coverage_metrics) || 0,
          performance_ranking: parseInt(formData.performance_ranking) || null,
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Go back to detail page after 1.5 seconds
        setTimeout(() => navigate(`/distributor/${id}`), 1500);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-800 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-500">Loading distributor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 60%)" }}>

      {/* Back button */}
      <motion.button
        onClick={() => navigate(`/distributor/${id}`)}
        className="flex items-center gap-2 text-gray-500
                   hover:text-green-800 transition-colors mb-6 font-medium text-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Detail View
      </motion.button>

      {/* Page header */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-gray-800">Edit Distributor</h2>
        <p className="text-gray-500 mt-1">
          Update distributor #{id} information
        </p>
      </motion.div>

      <div className="max-w-2xl">

        {/* Success / Error messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                border: "1px solid #86efac"
              }}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-semibold text-sm">
                Updated successfully! Redirecting...
              </p>
            </motion.div>
          )}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border border-red-200
                         rounded-xl flex items-center gap-3"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Form Card */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 4px 32px rgba(27,94,32,0.07)" }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Green→Amber top bar */}
          <div className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #1B5E20, #F9A825)"
            }} />

          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                Distributor Details
              </h3>
              <p className="text-gray-400 text-sm mt-0.5">
                Fields marked with{' '}
                <span className="text-green-600 font-medium">*</span>
                {' '}are required
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Row 1: Name + Territory */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    Distributor Name
                    <span className="text-green-600"> *</span>
                  </label>
                  <input type="text" name="distributor_name"
                    value={formData.distributor_name}
                    onChange={handleChange} required
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    Territory
                    <span className="text-green-600"> *</span>
                  </label>
                  <input type="text" name="territory"
                    value={formData.territory}
                    onChange={handleChange} required
                    className={inputClass} />
                </div>
              </div>

              {/* Row 2: Offtake + Outlets */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    Monthly Offtake (units)
                    <span className="text-green-600"> *</span>
                  </label>
                  <input type="number" name="monthly_offtake"
                    value={formData.monthly_offtake}
                    onChange={handleChange} required min="0"
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    New Outlet Additions
                  </label>
                  <input type="number" name="new_outlet_additions"
                    value={formData.new_outlet_additions}
                    onChange={handleChange} min="0"
                    className={inputClass} />
                </div>
              </div>

              {/* Row 3: Coverage + Ranking */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    Coverage Metrics (%)
                  </label>
                  <input type="number" name="coverage_metrics"
                    value={formData.coverage_metrics}
                    onChange={handleChange} min="0" max="100" step="0.01"
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    Performance Ranking
                  </label>
                  <input type="number" name="performance_ranking"
                    value={formData.performance_ranking}
                    onChange={handleChange} min="1"
                    className={inputClass} />
                </div>
              </div>

              {/* Row 4: Status */}
              <div className="mb-8">
                <label className="block text-sm font-semibold
                                  text-gray-700 mb-2">
                  Status
                </label>
                <select name="status" value={formData.status}
                  onChange={handleChange} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Buttons Row */}
              <div className="flex gap-3">
                {/* Cancel */}
                <motion.button
                  type="button"
                  onClick={() => navigate(`/distributor/${id}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 border border-gray-200
                             text-gray-600 font-semibold rounded-xl
                             hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>

                {/* Save */}
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.97 }}
                  className="flex-2 flex-1 py-4 text-white font-semibold
                             rounded-xl flex items-center justify-center
                             gap-2 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #1B5E20, #2e7d32)",
                    boxShadow: "0 4px 16px rgba(27,94,32,0.30)"
                  }}
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EditPage;