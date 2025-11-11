'use strict';

/**
 * Relax NOT NULL constraints on bus/driver columns so schedules can dibuat
 * meskipun bus/driver belum ditetapkan. Hal ini diperlukan agar fitur
 * ensure jadwal untuk setiap tanggal dapat berjalan dan hanya mengecualikan
 * hari libur nasional.
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE schedules
      ALTER COLUMN bus_id DROP NOT NULL,
      ALTER COLUMN bus_plate DROP NOT NULL,
      ALTER COLUMN driver_id DROP NOT NULL,
      ALTER COLUMN driver_name DROP NOT NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE schedules
      ALTER COLUMN bus_id SET NOT NULL,
      ALTER COLUMN bus_plate SET NOT NULL,
      ALTER COLUMN driver_id SET NOT NULL,
      ALTER COLUMN driver_name SET NOT NULL;
  `);
};


