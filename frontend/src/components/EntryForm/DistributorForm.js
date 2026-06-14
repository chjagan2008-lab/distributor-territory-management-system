import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

function DistributorForm() {

  // formData holds all the input values
  // Each key matches exactly the database column name
  const [formData, setFormData] = useState({
    distributor_name: '',
    territory: '',
    monthly_offtake: '',
    new_outlet_additions: '',
    coverage_metrics: '',
    performance_ranking: '',
    status: 'active'
  });

  // These control what message to show after submit
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // This runs every time user types in ANY input field
  // 'name' comes from the input's name attribute
  // 'value' is what the user typed
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,      // keep all existing values
      [name]: value // update only the changed field
    }));
  };

  // This runs when user clicks Submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload (default form behavior)

    setLoading(true);  // show spinner
    setError('');      // clear old errors
    setSuccess(false); // clear old success

    try {
      // Send POST request to our backend API
      const response = await fetch('http://localhost:5000/api/distributors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // tell server we're sending JSON
        },
        body: JSON.stringify({
          ...formData,
          // Convert string inputs to numbers where needed
          monthly_offtake: parseInt(formData.monthly_offtake),
          new_outlet_additions: parseInt(formData.new_outlet_additions) || 0,
          coverage_metrics: parseFloat(formData.coverage_metrics) || 0,
          performance_ranking: parseInt(formData.performance_ranking) || null,
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true); // show success message
        // Reset form to empty
        setFormData({
          distributor_name: '',
          territory: '',
          monthly_offtake: '',
          new_outlet_additions: '',
          coverage_metrics: '',
          performance_ranking: '',
          status: 'active'
        });
      } else {
        setError(data.message || 'Something went wrong');
      }

    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false); // hide spinner always
    }
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-medium">
            Distributor added successfully!
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* The Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        <form onSubmit={handleSubmit}>

          {/* Row 1: Name + Territory */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distributor Name *
              </label>
              <input
                type="text"
                name="distributor_name"
                value={formData.distributor_name}
                onChange={handleChange}
                required
                placeholder="e.g. Ravi Kumar"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Territory *
              </label>
              <input
                type="text"
                name="territory"
                value={formData.territory}
                onChange={handleChange}
                required
                placeholder="e.g. Hyderabad North"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

          </div>

          {/* Row 2: Offtake + New Outlets */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Offtake (units) *
              </label>
              <input
                type="number"
                name="monthly_offtake"
                value={formData.monthly_offtake}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 450"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Outlet Additions
              </label>
              <input
                type="number"
                name="new_outlet_additions"
                value={formData.new_outlet_additions}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 12"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

          </div>

          {/* Row 3: Coverage + Ranking */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coverage Metrics (%)
              </label>
              <input
                type="number"
                name="coverage_metrics"
                value={formData.coverage_metrics}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 87.50"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Performance Ranking
              </label>
              <input
                type="number"
                name="performance_ranking"
                value={formData.performance_ranking}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

          </div>

          {/* Row 4: Status dropdown */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 active:bg-green-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Add Distributor'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default DistributorForm;