'use strict';

/**
 * Migration: Add numeric_id column to routes table
 * Menambahkan kolom numeric_id untuk sequential numbering
 */

exports.up = pgm => {
  pgm.sql(`
    ALTER TABLE routes
    ADD COLUMN IF NOT EXISTS numeric_id INTEGER;
  `);

  pgm.sql(`
    WITH ordered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, route_code ASC, id ASC) AS rn
      FROM routes
    )
    UPDATE routes r
    SET numeric_id = o.rn
    FROM ordered o
    WHERE r.id = o.id
  `);

  pgm.createIndex('routes', ['numeric_id'], {
    name: 'routes_numeric_id_idx',
    ifNotExists: true,
  });
};

exports.down = pgm => {
  pgm.dropIndex('routes', 'routes_numeric_id_idx', { ifExists: true });
  pgm.sql('ALTER TABLE routes DROP COLUMN IF EXISTS numeric_id;');
};


