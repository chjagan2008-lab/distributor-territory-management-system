const pool = require('../db');

// CREATE
const createDistributor = async (req, res) => {
  try {
    const {
      distributor_name, territory, monthly_offtake,
      new_outlet_additions, coverage_metrics,
      performance_ranking, status
    } = req.body;

    if (!distributor_name || !territory || monthly_offtake === undefined) {
      return res.status(400).json({
        success: false,
        message: 'distributor_name, territory, and monthly_offtake are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO distributor_records
        (distributor_name, territory, monthly_offtake,
         new_outlet_additions, coverage_metrics,
         performance_ranking, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        distributor_name, territory, monthly_offtake,
        new_outlet_additions || 0, coverage_metrics || 0,
        performance_ranking || null, status || 'active'
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

// READ ALL
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

// UPDATE
const updateDistributor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      distributor_name, territory, monthly_offtake,
      new_outlet_additions, coverage_metrics,
      performance_ranking, status
    } = req.body;

    // Check if record exists first
    const existing = await pool.query(
      'SELECT * FROM distributor_records WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found'
      });
    }

    const result = await pool.query(
      `UPDATE distributor_records SET
        distributor_name   = $1,
        territory          = $2,
        monthly_offtake    = $3,
        new_outlet_additions = $4,
        coverage_metrics   = $5,
        performance_ranking = $6,
        status             = $7,
        updated_at         = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        distributor_name, territory, monthly_offtake,
        new_outlet_additions || 0, coverage_metrics || 0,
        performance_ranking || null, status || 'active',
        id
      ]
    );

    res.json({
      success: true,
      message: 'Distributor updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
const deleteDistributor = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT * FROM distributor_records WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found'
      });
    }

    await pool.query(
      'DELETE FROM distributor_records WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Distributor deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createDistributor,
  getAllDistributors,
  updateDistributor,
  deleteDistributor
};