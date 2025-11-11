/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Buat tabel holidays jika belum ada
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS holidays (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      holiday_date DATE NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Index pada holiday_date
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays (holiday_date);`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS holidays;`);
};


