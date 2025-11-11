const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * Helper function untuk memastikan tabel holidays ada
 */
async function ensureHolidaysTable() {
  try {
    // Pastikan extension pgcrypto ada
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    
    // Cek apakah tabel holidays ada
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'holidays'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      // Buat tabel holidays jika belum ada
      await pool.query(`
        CREATE TABLE IF NOT EXISTS holidays (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          holiday_date DATE NOT NULL,
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      
      // Buat index jika belum ada
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays (holiday_date);
      `);
      
      console.log('✅ Holidays table created automatically');
    }
  } catch (error) {
    console.error('Error ensuring holidays table:', error);
    // Jangan throw error, biarkan query berikutnya yang handle
  }
}

/**
 * @swagger
 * tags:
 *   name: Holidays
 *   description: API untuk data hari libur
 */

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     summary: Mendapatkan daftar hari libur atau cek by date
 *     tags: [Holidays]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Jika diisi (YYYY-MM-DD), hanya mengembalikan libur pada tanggal tersebut
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Daftar hari libur
 */
router.get('/', async (req, res) => {
  try {
    // Pastikan tabel holidays ada sebelum query
    await ensureHolidaysTable();
    
    const { date, limit = 100, offset = 0 } = req.query;
    let rows;
    if (date) {
      const result = await pool.query(
        `SELECT id, holiday_date AS "holidayDate", name, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM holidays WHERE holiday_date = $1::date
         ORDER BY holiday_date ASC
         LIMIT $2 OFFSET $3`,
        [date, Number(limit), Number(offset)]
      );
      rows = result.rows;
    } else {
      const result = await pool.query(
        `SELECT id, holiday_date AS "holidayDate", name, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM holidays
         ORDER BY holiday_date ASC
         LIMIT $1 OFFSET $2`,
        [Number(limit), Number(offset)]
      );
      rows = result.rows;
    }
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil data hari libur' });
  }
});

module.exports = router;


