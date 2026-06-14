import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  Legend
} from 'recharts';

function ReportsPage() {

  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/distributors');
        const data = await response.json();
        const list = Array.isArray(data) ? data
          : (Array.isArray(data.data) ? data.data : []);
        setDistributors(list);
      } catch (err) {
        setError('Could not load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Calculated Stats ─────────────────────────────────────
  const totalDistributors = distributors.length;
  const activeCount = distributors.filter(d => d.status === 'active').length;
  const totalOfftake = distributors.reduce((s, d) => s + (d.monthly_offtake || 0), 0);
  const avgCoverage = distributors.length
    ? (distributors.reduce((s, d) => s + (parseFloat(d.coverage_metrics) || 0), 0) / distributors.length).toFixed(1)
    : 0;
  const topPerformer = distributors.find(d => d.performance_ranking === 1);

  // ── Chart Data ───────────────────────────────────────────
  // Bar chart: offtake per distributor
  const offtakeData = distributors.map(d => ({
    name: d.distributor_name.split(' ')[0],
    offtake: d.monthly_offtake,
    outlets: d.new_outlet_additions || 0,
  }));

  // Line chart: coverage per distributor
  const coverageData = distributors.map(d => ({
    name: d.distributor_name.split(' ')[0],
    coverage: parseFloat(d.coverage_metrics) || 0,
  }));

  // ── CSV Export ───────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      'ID', 'Name', 'Territory', 'Monthly Offtake',
      'New Outlets', 'Coverage %', 'Ranking', 'Status'
    ];
    const rows = distributors.map(d => [
      d.id,
      d.distributor_name,
      d.territory,
      d.monthly_offtake,
      d.new_outlet_additions || 0,
      d.coverage_metrics || 0,
      d.performance_ranking || 'N/A',
      d.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arvi-edibles-distributors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-800 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <p className="text-gray-400 text-sm mt-1">
            Make sure backend is running on port 5000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 60%)" }}>

      {/* ── Page Header ───────────────────────────────── */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Reports & Analytics
          </h2>
          <p className="text-gray-500 mt-1">
            Performance overview for all distributors
          </p>
        </div>

        {/* CSV Export Button */}
        <motion.button
          onClick={exportCSV}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl
                     text-white font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, #1B5E20, #2e7d32)",
            boxShadow: "0 4px 16px rgba(27,94,32,0.25)",
          }}
        >
          ⬇ Export CSV
        </motion.button>
      </motion.div>

      {/* ── Summary Cards ─────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5 mb-8">

        {[
          { label: 'Total Distributors', value: totalDistributors, color: '#1B5E20', icon: '▤' },
          { label: 'Active Distributors', value: activeCount, color: '#F9A825', icon: '◉' },
          { label: 'Total Offtake', value: totalOfftake.toLocaleString(), color: '#1565C0', icon: '◈' },
          { label: 'Avg Coverage', value: `${avgCoverage}%`, color: '#7B1FA2', icon: '◎' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 relative overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.07)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            {/* Colored top border */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: card.color }} />
            <div className="flex items-center justify-between mb-2 mt-1">
              <p className="text-gray-500 text-xs font-medium">{card.label}</p>
              <span className="text-sm font-bold"
                style={{ color: card.color }}>{card.icon}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
          </motion.div>
        ))}

      </div>

      {/* ── Top Performer Banner ───────────────────────── */}
      {topPerformer && (
        <motion.div
          className="rounded-2xl p-5 mb-8 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, #1B5E20, #2e7d32)",
            boxShadow: "0 4px 24px rgba(27,94,32,0.2)",
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center
                          justify-center text-green-900 font-bold text-lg">
            {topPerformer.distributor_name.charAt(0)}
          </div>
          <div>
            <p className="text-green-200 text-xs font-medium uppercase tracking-wide">
              Top Performer — Rank #1
            </p>
            <p className="text-white font-bold text-lg">
              {topPerformer.distributor_name}
            </p>
            <p className="text-green-300 text-sm">
              {topPerformer.territory} · {topPerformer.monthly_offtake} units
            </p>
          </div>
          <div className="ml-auto text-4xl">🏆</div>
        </motion.div>
      )}

      {/* ── Charts Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mb-8">

        {/* Bar Chart — Offtake */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-100"
          style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.06)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            Monthly Offtake vs New Outlets
          </h3>
          <p className="text-gray-400 text-xs mb-4">
            Comparing offtake units and new outlet additions
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={offtakeData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '12px',
              }} />
              <Legend />
              <Bar dataKey="offtake" fill="#1B5E20"
                radius={[4, 4, 0, 0]} name="Offtake"
                animationDuration={1200} />
              <Bar dataKey="outlets" fill="#F9A825"
                radius={[4, 4, 0, 0]} name="New Outlets"
                animationDuration={1400} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line Chart — Coverage */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-100"
          style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.06)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            Coverage Metrics Trend
          </h3>
          <p className="text-gray-400 text-xs mb-4">
            Territory coverage percentage per distributor
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={coverageData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '12px',
              }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="coverage"
                stroke="#1565C0"
                strokeWidth={2.5}
                dot={{ fill: '#1565C0', r: 5 }}
                activeDot={{ r: 7 }}
                name="Coverage %"
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* ── Full Data Table ───────────────────────────── */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-100"
        style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.06)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-700">
            Detailed Performance Table
          </h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            {distributors.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Rank', 'Name', 'Territory', 'Offtake',
                  'Outlets', 'Coverage', 'Status'].map(h => (
                  <th key={h}
                    className="text-left text-gray-400 font-medium pb-3 pr-4 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distributors
                .sort((a, b) => (a.performance_ranking || 99) - (b.performance_ranking || 99))
                .map((d, i) => (
                  <motion.tr
                    key={d.id}
                    className="border-b border-gray-50 hover:bg-green-50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.07 }}
                  >
                    <td className="py-3 pr-4">
                      <span className="font-bold text-green-800">
                        #{d.performance_ranking || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {d.distributor_name}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{d.territory}</td>
                    <td className="py-3 pr-4 font-medium text-gray-700">
                      {d.monthly_offtake?.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {d.new_outlet_additions || 0}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${d.coverage_metrics || 0}%` }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs">
                          {d.coverage_metrics || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : d.status === 'inactive'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}

export default ReportsPage;