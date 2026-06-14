const pool = require('../db');

// CREATE - Add a new distributor record
const createDistributor = async (req, res) => {
  try {
    // Line 5: Unpack ALL 7 fields from the request body
    // performance_ranking is now included!
    const {
      distributor_name,
      territory,
      monthly_offtake,
      new_outlet_additions,
      coverage_metrics,
      performance_ranking,
      status
    } = req.body;

    // Validation: check required fields
    if (!distributor_name || !territory || monthly_offtake === undefined) {
      return res.status(400).json({
        success: false,
        message: 'distributor_name, territory, and monthly_offtake are required'
      });
    }

    // Line 27: SQL now includes performance_ranking as $7
    const result = await pool.query(
      `INSERT INTO distributor_records
        (distributor_name, territory, monthly_offtake, 
         new_outlet_additions, coverage_metrics, performance_ranking, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        distributor_name,
        territory,
        monthly_offtake,
        new_outlet_additions || 0,
        coverage_metrics || 0,
        performance_ranking || null,  // null is okay if not provided
        status || 'active'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Distributor added successfully',
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ - Get all distributor records
const getAllDistributors = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM distributor_records ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createDistributor, getAllDistributors };