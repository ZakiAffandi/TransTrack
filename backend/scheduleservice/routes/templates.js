const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: ScheduleTemplates
 *   description: Template waktu default jadwal per rute
 */

/**
 * @swagger
 * /api/schedule-templates:
 *   get:
 *     summary: Mendapatkan template jadwal per rute
 *     tags: [ScheduleTemplates]
 *     parameters:
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan routeId
 *     responses:
 *       200:
 *         description: Daftar template
 */
router.get('/', async (req, res) => {
  try {
    const { routeId } = req.query;
    const params = [];
    const where = [];
    if (routeId) {
      params.push(routeId);
      where.push(`route_id = $${params.length}`);
    }
    const sql = `
      SELECT id, route_id AS "routeId", times, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM schedule_templates
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
      LIMIT 1000
    `;
    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil template jadwal' });
  }
});

module.exports = router;


