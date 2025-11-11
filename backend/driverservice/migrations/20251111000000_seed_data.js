'use strict';

/**
 * Seed data: Drivers
 * Menambahkan data awal untuk drivers
 */

exports.up = pgm => {
  pgm.sql(`
    INSERT INTO drivers (name, license)
    VALUES 
      ('Budi Santoso', 'SIM-A-123456'),
      ('Ahmad Hidayat', 'SIM-A-234567'),
      ('Siti Nurhaliza', 'SIM-A-345678'),
      ('Dedi Kurniawan', 'SIM-A-456789'),
      ('Rina Wati', 'SIM-A-567890'),
      ('Joko Widodo', 'SIM-A-678901'),
      ('Maya Sari', 'SIM-A-789012'),
      ('Agus Prasetyo', 'SIM-A-890123')
    ON CONFLICT (license) DO NOTHING;
  `);
};

exports.down = pgm => {
  pgm.sql(`
    DELETE FROM drivers 
    WHERE license IN (
      'SIM-A-123456', 'SIM-A-234567', 'SIM-A-345678', 'SIM-A-456789',
      'SIM-A-567890', 'SIM-A-678901', 'SIM-A-789012', 'SIM-A-890123'
    );
  `);
};

