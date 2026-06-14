import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from "recharts";

function DashboardPage() {

  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // navigate() lets us go to a different page programmatically
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/distributors");
        if (!response.ok) {
          throw new Error("Failed to fetch data from server");
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setDistributors(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDistributors();
  }, []);

  const totalDistributors = distributors.length;
  const totalOfftake = distributors.reduce((sum, d) => sum + (d.monthly_offtake || 0), 0);
  const activeCount = distributors.filter((d) => d.status === "active").length;

  const barData = distributors.map(d => ({
    name: d.distributor_name.split(' ')[0],
    offtake: d.monthly_offtake
  }));

  const pieData = [
    { name: 'Active',   value: distributors.filter(d => d.status === 'active').length },
    { name: 'Inactive', value: distributors.filter(d => d.status === 'inactive').length },
    { name: 'Pending',  value: distributors.filter(d => d.status === 'pending').length },
  ].filter(item => item.value > 0);

  const PIE_COLORS = ['#1B5E20', '#ef4444', '#F9A825'];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-800 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium">⚠️ Could not load data</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Make sure your backend is running on port 5000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Page header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Welcome to Arvi Edibles Distributor Management System
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-gray-500 text-sm font-medium">Total Distributors</p>
          <p className="text-4xl font-bold text-green-800 mt-2">{totalDistributors}</p>
          <p className="text-green-600 text-sm mt-1">
            {totalDistributors === 0 ? "↑ Add your first record" : "↑ Registered"}
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-gray-500 text-sm font-medium">Total Offtake</p>
          <p className="text-4xl font-bold text-green-800 mt-2">
            {totalOfftake.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm mt-1">Monthly units</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-gray-500 text-sm font-medium">Active Distributors</p>
          <p className="text-4xl font-bold text-yellow-500 mt-2">{activeCount}</p>
          <p className="text-gray-400 text-sm mt-1">Currently active</p>
        </motion.div>

      </div>

      {/* Charts Row */}
      {distributors.length > 0 && (
        <motion.div
          className="grid grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Monthly Offtake by Distributor
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }}/>
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }}/>
                <Tooltip contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '13px'
                }}/>
                <Bar dataKey="offtake" fill="#1B5E20" radius={[6, 6, 0, 0]} name="Monthly Offtake"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Distributor Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4} dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '13px'
                }}/>
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </motion.div>
      )}

      {/* Distributors Table */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          All Distributors
          <span className="text-sm font-normal text-gray-400 ml-2">
            (click a row to see details)
          </span>
        </h3>

        {distributors.length === 0 ? (
          <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg">📋 No distributors yet</p>
              <p className="text-gray-300 text-sm mt-1">
                Use "Add Distributor" to add your first record
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">#</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Name</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Territory</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Offtake</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Outlets</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Coverage</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {distributors.map((d, index) => (
                  <motion.tr
                    key={d.id}
                    // onClick navigates to detail page for this distributor
                    onClick={() => navigate(`/distributor/${d.id}`)}
                    className="border-b border-gray-50 hover:bg-green-50 
                               transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <td className="py-3 pr-4 text-gray-400">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium text-green-800 hover:underline">
                      {d.distributor_name}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{d.territory}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {d.monthly_offtake?.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {d.new_outlet_additions ?? 0}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {d.coverage_metrics ?? 0}%
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.status === "active"
                          ? "bg-green-100 text-green-700"
                          : d.status === "inactive"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
}

export default DashboardPage;