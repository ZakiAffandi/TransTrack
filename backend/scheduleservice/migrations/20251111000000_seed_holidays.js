'use strict';

/**
 * Seed data: Holidays
 * Menambahkan data awal untuk holidays (hari libur nasional Indonesia 2025)
 */

exports.up = pgm => {
  // Pastikan tabel holidays ada (jika migration create holidays belum dijalankan)
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS holidays (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      holiday_date DATE NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Buat index jika belum ada
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays (holiday_date);`);

  // Insert data holidays
  pgm.sql(`
    INSERT INTO holidays (holiday_date, name)
    VALUES 
      ('2025-01-01', 'Tahun Baru 2025'),
      ('2025-01-29', 'Tahun Baru Imlek 2576 Kongzili'),
      ('2025-03-11', 'Isra Mikraj Nabi Muhammad SAW'),
      ('2025-03-29', 'Hari Raya Nyepi Tahun Baru Saka 1947'),
      ('2025-03-31', 'Wafat Isa Almasih'),
      ('2025-04-18', 'Hari Raya Idul Fitri 1446 Hijriyah'),
      ('2025-04-19', 'Hari Raya Idul Fitri 1446 Hijriyah'),
      ('2025-05-01', 'Hari Buruh Internasional'),
      ('2025-05-09', 'Kenaikan Isa Almasih'),
      ('2025-05-29', 'Hari Raya Waisak 2569 BE'),
      ('2025-06-01', 'Hari Lahir Pancasila'),
      ('2025-06-17', 'Hari Raya Idul Adha 1446 Hijriyah'),
      ('2025-07-07', 'Tahun Baru Islam 1447 Hijriyah'),
      ('2025-08-17', 'Hari Kemerdekaan Republik Indonesia'),
      ('2025-09-16', 'Maulid Nabi Muhammad SAW'),
      ('2025-12-25', 'Hari Raya Natal')
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = pgm => {
  pgm.sql(`
    DELETE FROM holidays 
    WHERE holiday_date IN (
      '2025-01-01', '2025-01-29', '2025-03-11', '2025-03-29', '2025-03-31',
      '2025-04-18', '2025-04-19', '2025-05-01', '2025-05-09', '2025-05-29',
      '2025-06-01', '2025-06-17', '2025-07-07', '2025-08-17', '2025-09-16', '2025-12-25'
    );
  `);
};

