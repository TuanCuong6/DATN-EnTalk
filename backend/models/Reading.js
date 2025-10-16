// backend/models/Reading.js
const db = require("../config/db"); // file kết nối database

async function getReadingById(id) {
  const [rows] = await db.execute("SELECT * FROM readings WHERE id = ?", [id]);
  return rows[0] || null;
}

module.exports = { getReadingById };
