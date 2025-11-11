'use strict';

/**
 * Seed data: Buses
 * Menambahkan data awal untuk buses
 */

exports.up = pgm => {
  pgm.sql(`
    INSERT INTO buses (plate, capacity, model)
    VALUES 
      ('B 1234 CD', 40, 'Mercedes-Benz OH 1526'),
      ('B 5678 EF', 45, 'Scania K360IB'),
      ('B 9012 GH', 40, 'Hino RK8 J'),
      ('B 3456 IJ', 50, 'Volvo B11R'),
      ('B 7890 KL', 45, 'Mercedes-Benz OH 1526'),
      ('B 2468 MN', 40, 'Scania K360IB'),
      ('B 1357 OP', 50, 'Hino RK8 J'),
      ('B 9753 QR', 45, 'Volvo B11R')
    ON CONFLICT (plate) DO NOTHING;
  `);
};

exports.down = pgm => {
  pgm.sql(`
    DELETE FROM buses 
    WHERE plate IN (
      'B 1234 CD', 'B 5678 EF', 'B 9012 GH', 'B 3456 IJ',
      'B 7890 KL', 'B 2468 MN', 'B 1357 OP', 'B 9753 QR'
    );
  `);
};

