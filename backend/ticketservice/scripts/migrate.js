const { pool } = require('../config/db');

async function ensurePgcrypto() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
}

async function run() {
  try {
    await ensurePgcrypto();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        schedule_id TEXT NOT NULL,
        schedule_label TEXT,
        amount NUMERIC(12,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'IDR',
        status TEXT NOT NULL DEFAULT 'pending',
        payment_ref TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // In case table already existed without schedule_label
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS schedule_label TEXT;`);
    console.log('Migration selesai: tickets table siap.');
  } catch (e) {
    console.error('Migration gagal:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();


