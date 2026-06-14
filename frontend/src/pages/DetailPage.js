import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, TrendingUp, 
         ShoppingBag, Star, Activity } from 'lucide-react';

function DetailPage() {

  // useParams gets the :id from the URL
  // e.g. /distributor/3 → id = "3"
  const { id } = useParams();
  const navigate = useNavigate();

  const [distributor, setDistributor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistributor = async () => {
      try {
        // Fetch ALL distributors then find the one we need
        const response = await fetch('http://localhost:5000/api/distributors');
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);

        // Find distributor with matching id
        const found = list.find(d => d.id === parseInt(id));

        if (!found) {
          setError('Distributor not found');
        } else {
          setDistributor(found);
        }
      } catch (err) {
        setError('Could not load distributor data');
      } finally {
        setLoading(false);
      }
    };

    fetchDistributor();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-800 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading distributor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-green-800 text-white rounded-xl text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Back button */}
      <motion.button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-green-800 
                   transition-colors mb-6 group"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
        Back to Dashboard
      </motion.button>

      {/* Header card */}
      <motion.div
        className="bg-green-800 rounded-2xl p-8 mb-6 text-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar circle */}
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center 
                          justify-center text-green-900 font-bold text-2xl">
            {distributor.distributor_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{distributor.distributor_name}</h2>
            <p className="text-green-200 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4"/>
              {distributor.territory}
            </p>
          </div>
          {/* Status badge */}
          <div className="ml-auto">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              distributor.status === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {distributor.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-700"/>
            </div>
            <p className="text-gray-500 text-sm font-medium">Monthly Offtake</p>
          </div>
          <p className="text-4xl font-bold text-green-800">
            {distributor.monthly_offtake?.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm mt-1">Units per month</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600"/>
            </div>
            <p className="text-gray-500 text-sm font-medium">New Outlet Additions</p>
          </div>
          <p className="text-4xl font-bold text-yellow-500">
            {distributor.new_outlet_additions ?? 0}
          </p>
          <p className="text-gray-400 text-sm mt-1">New outlets added</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600"/>
            </div>
            <p className="text-gray-500 text-sm font-medium">Coverage Metrics</p>
          </div>
          <p className="text-4xl font-bold text-blue-600">
            {distributor.coverage_metrics ?? 0}%
          </p>
          <p className="text-gray-400 text-sm mt-1">Territory coverage</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600"/>
            </div>
            <p className="text-gray-500 text-sm font-medium">Performance Ranking</p>
          </div>
          <p className="text-4xl font-bold text-purple-600">
            #{distributor.performance_ranking ?? 'N/A'}
          </p>
          <p className="text-gray-400 text-sm mt-1">Overall ranking</p>
        </motion.div>

      </div>

      {/* Additional info card */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Record Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Record ID</p>
            <p className="font-medium text-gray-700">#{distributor.id}</p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <p className="font-medium text-gray-700">{distributor.status}</p>
          </div>
          <div>
            <p className="text-gray-400">Created At</p>
            <p className="font-medium text-gray-700">
              {new Date(distributor.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Last Updated</p>
            <p className="font-medium text-gray-700">
              {new Date(distributor.updated_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default DetailPage;