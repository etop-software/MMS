const pool = require("../db");
const XLSX = require('xlsx');
const { Parser } = require('@fast-csv/format');
const jsPDF = require('jspdf');
require('jspdf-autotable');

exports.getMealHistory = async (req, res) => {
  console.log("Received request to get meal history", req.query);
  const {
    meal_type_id,
    employee_pin,
    employee_name,
    start_date,
    end_date,
    limit = 10,
    offset = 0,
    export_type // this will handle export types (csv, pdf, xlsx)
  } = req.query;

  try {
    // Fetch meal history from database
    const result = await pool.query(
      `SELECT * FROM public.get_user_meal_history($1, $2, $3, $4, $5, $6, $7)`,
      [
        meal_type_id,
        employee_pin,
        employee_name,
        start_date,
        end_date,
        parseInt(limit),
        parseInt(offset),
      ]
    );
    const data = result.rows;
    console.log("Fetched meal history:", data);
      res.json({ success: true, data });
    }
   catch (error) {
    console.error("Error fetching meal history:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
