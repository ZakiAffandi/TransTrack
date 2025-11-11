/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Template jadwal per rute (waktu default keberangkatan per hari)
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS schedule_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      route_id TEXT NOT NULL,
      times JSONB NOT NULL, -- contoh: ["08:00","12:00","16:00"]
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_schedule_templates_route_id ON schedule_templates (route_id);`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS schedule_templates;`);
};


