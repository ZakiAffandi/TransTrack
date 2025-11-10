'use strict';

/**
 * Migration: Add bus_id column to routes table
 * Menambahkan kolom bus_id untuk menghubungkan route dengan bus
 */

exports.up = pgm => {
  pgm.sql(`
    ALTER TABLE routes
    ADD COLUMN IF NOT EXISTS bus_id TEXT;
  `);

  pgm.createIndex('routes', ['bus_id'], {
    name: 'routes_bus_id_idx',
    ifNotExists: true,
  });
};

exports.down = pgm => {
  pgm.dropIndex('routes', 'routes_bus_id_idx', { ifExists: true });
  pgm.sql('ALTER TABLE routes DROP COLUMN IF EXISTS bus_id;');
};

