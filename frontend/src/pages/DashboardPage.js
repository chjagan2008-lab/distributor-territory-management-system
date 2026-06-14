// DashboardPage.js
// This is the main dashboard — shows summary stats from real database data

import React, { useState, useEffect } from "react";
// useState  → stores data (like a variable that re-renders the page when it changes)
// useEffect → runs code AFTER the page loads (perfect for API calls)

function DashboardPage() {

  // STATE 1: distributors — stores the array of distributors from backend
  // Starts as empty array [] because we haven't fetched yet
  const [distributors, setDistributors] = useState([]);

  // STATE 2: loading — true while waiting for API response
  // Starts as true because we fetch immediately on page load
  const [loading, setLoading] = useState(true);

  // STATE 3: error — stores error message if API call fails
  const [error, setError] = useState(null);

  // ---- useEffect: runs ONCE when the page first loads ----
  // The [] at the end means "only run once" (not on every re-render)
  useEffect(() => {

    // We define the fetch function INSIDE useEffect
    const fetchDistributors = async () => {
      try {
  const response = await fetch("http://localhost:5000/api/distributors");
  if (!response.ok) {
    throw new Error("Failed to fetch data from server");
  }
  const data = await response.json();

  // This handles BOTH cases safely:
  const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  setDistributors(list);          // ✅ INSIDE try block

} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
    };

    // Call the function we just defined
    fetchDistributors();

  }, []); // ← empty array = run only once on mount

  // ---- CALCULATED STATS from real data ----
  // These recalculate automatically whenever `distributors` state changes

  // Count total distributors (just the array length)
  const totalDistributors = distributors.length;

  // Add up all monthly_offtake values using reduce()
  // reduce() loops through array and accumulates a total
  // sum starts at 0, then adds each distributor's monthly_offtake
  const totalOfftake = distributors.reduce(
    (sum, d) => sum + (d.monthly_offtake || 0), 0
  );

  // Count only distributors where status === "active"
  const activeCount = distributors.filter(
    (d) => d.status === "active"
  ).length;

  // ---- LOADING STATE ----
  // Show this while waiting for API response
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          {/* Simple CSS spinner using border trick */}
          <div className="w-10 h-10 border-4 border-green-800 border-t-transparent 
                          rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // ---- ERROR STATE ----
  // Show this if API call failed
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

  // ---- MAIN RENDER ----
  // This shows after data loads successfully
  return (
    <div className="p-8">

      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Welcome to Arvi Edibles Distributor Management System
        </p>
      </div>

      {/* Stats cards row — now showing REAL numbers */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        {/* Card 1: Total Distributors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Distributors</p>
          {/* totalDistributors comes from our calculated variable above */}
          <p className="text-4xl font-bold text-green-800 mt-2">
            {totalDistributors}
          </p>
          <p className="text-green-600 text-sm mt-1">
            {totalDistributors === 0 ? "↑ Add your first record" : "↑ Registered"}
          </p>
        </div>

        {/* Card 2: Total Offtake */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Offtake</p>
          {/* toLocaleString() formats big numbers with commas: 5000 → "5,000" */}
          <p className="text-4xl font-bold text-green-800 mt-2">
            {totalOfftake.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm mt-1">Monthly units</p>
        </div>

        {/* Card 3: Active Distributors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Active Distributors</p>
          <p className="text-4xl font-bold text-yellow-500 mt-2">
            {activeCount}
          </p>
          <p className="text-gray-400 text-sm mt-1">Currently active</p>
        </div>

      </div>

      {/* Distributors Table — shows all records */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          All Distributors
        </h3>

        {/* If no distributors yet, show empty state */}
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
          /* Table showing all distributor records */
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
                {/* .map() loops through each distributor and creates a <tr> row */}
                {distributors.map((d, index) => (
                  <tr
                    key={d.id}  /* key helps React track each row uniquely */
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-gray-400">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium text-gray-800">
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
                      {/* Color-coded status badge */}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardPage;