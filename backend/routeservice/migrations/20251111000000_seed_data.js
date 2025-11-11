'use strict';

/**
 * Seed data: Routes and Stops
 * Menambahkan data awal untuk routes dan stops
 */

exports.up = pgm => {
  // Insert routes dengan numeric_id yang dihitung
  pgm.sql(`
    WITH next_numeric AS (
      SELECT COALESCE(MAX(numeric_id), 0) + 1 AS start_val FROM routes WHERE numeric_id IS NOT NULL
    ),
    route_data AS (
      SELECT 
        'Jakarta - Bandung' AS route_name, 
        'JKT-BDG' AS route_code, 
        'Rute dari Jakarta ke Bandung melalui Tol Cipularang' AS description,
        'active'::route_status AS status
      UNION ALL SELECT 'Jakarta - Depok', 'JKT-DPK', 'Rute dari Jakarta ke Depok', 'active'::route_status
      UNION ALL SELECT 'Jakarta - Bogor', 'JKT-BGR', 'Rute dari Jakarta ke Bogor', 'active'::route_status
      UNION ALL SELECT 'Bandung - Jakarta', 'BDG-JKT', 'Rute dari Bandung ke Jakarta melalui Tol Cipularang', 'active'::route_status
      UNION ALL SELECT 'Jakarta - Bekasi', 'JKT-BKS', 'Rute dari Jakarta ke Bekasi', 'active'::route_status
    ),
    numbered_routes AS (
      SELECT 
        route_name, 
        route_code, 
        description, 
        status,
        ROW_NUMBER() OVER (ORDER BY route_code) + COALESCE((SELECT start_val FROM next_numeric), 1) - 1 AS numeric_id
      FROM route_data
    )
    INSERT INTO routes (numeric_id, route_name, route_code, description, status)
    SELECT numeric_id, route_name, route_code, description, status
    FROM numbered_routes
    ON CONFLICT (route_code) DO NOTHING;
  `);

  // Insert stops for Jakarta - Bandung route
  pgm.sql(`
    INSERT INTO stops (route_id, stop_name, stop_code, latitude, longitude, sequence)
    SELECT 
      r.id,
      s.stop_name,
      s.stop_code,
      s.latitude,
      s.longitude,
      s.sequence
    FROM routes r
    CROSS JOIN (VALUES
      ('Terminal Kota Gambir', 'GMB', -6.1751, 106.8650, 1),
      ('Terminal Pasar Senen', 'PSN', -6.1811, 106.8500, 2),
      ('Terminal Cikarang', 'CKR', -6.3572, 107.1431, 3),
      ('Terminal Cimahi', 'CMH', -6.8844, 107.5419, 4),
      ('Terminal Kota Sawangan', 'SWG', -6.9175, 107.6191, 5)
    ) AS s(stop_name, stop_code, latitude, longitude, sequence)
    WHERE r.route_code = 'JKT-BDG'
    ON CONFLICT DO NOTHING;
  `);

  // Insert stops for Jakarta - Depok route
  pgm.sql(`
    INSERT INTO stops (route_id, stop_name, stop_code, latitude, longitude, sequence)
    SELECT 
      r.id,
      s.stop_name,
      s.stop_code,
      s.latitude,
      s.longitude,
      s.sequence
    FROM routes r
    CROSS JOIN (VALUES
      ('Terminal Kota Gambir', 'GMB', -6.1751, 106.8650, 1),
      ('Terminal Pasar Senen', 'PSN', -6.1811, 106.8500, 2),
      ('Terminal Depok', 'DPK', -6.4025, 106.7942, 3)
    ) AS s(stop_name, stop_code, latitude, longitude, sequence)
    WHERE r.route_code = 'JKT-DPK'
    ON CONFLICT DO NOTHING;
  `);

  // Insert stops for Jakarta - Bogor route
  pgm.sql(`
    INSERT INTO stops (route_id, stop_name, stop_code, latitude, longitude, sequence)
    SELECT 
      r.id,
      s.stop_name,
      s.stop_code,
      s.latitude,
      s.longitude,
      s.sequence
    FROM routes r
    CROSS JOIN (VALUES
      ('Terminal Kota Gambir', 'GMB', -6.1751, 106.8650, 1),
      ('Terminal Pasar Senen', 'PSN', -6.1811, 106.8500, 2),
      ('Terminal Bogor', 'BGR', -6.5971, 106.8060, 3)
    ) AS s(stop_name, stop_code, latitude, longitude, sequence)
    WHERE r.route_code = 'JKT-BGR'
    ON CONFLICT DO NOTHING;
  `);

  // Insert stops for Bandung - Jakarta route
  pgm.sql(`
    INSERT INTO stops (route_id, stop_name, stop_code, latitude, longitude, sequence)
    SELECT 
      r.id,
      s.stop_name,
      s.stop_code,
      s.latitude,
      s.longitude,
      s.sequence
    FROM routes r
    CROSS JOIN (VALUES
      ('Terminal Kota Sawangan', 'SWG', -6.9175, 107.6191, 1),
      ('Terminal Cimahi', 'CMH', -6.8844, 107.5419, 2),
      ('Terminal Cikarang', 'CKR', -6.3572, 107.1431, 3),
      ('Terminal Pasar Senen', 'PSN', -6.1811, 106.8500, 4),
      ('Terminal Kota Gambir', 'GMB', -6.1751, 106.8650, 5)
    ) AS s(stop_name, stop_code, latitude, longitude, sequence)
    WHERE r.route_code = 'BDG-JKT'
    ON CONFLICT DO NOTHING;
  `);

  // Insert stops for Jakarta - Bekasi route
  pgm.sql(`
    INSERT INTO stops (route_id, stop_name, stop_code, latitude, longitude, sequence)
    SELECT 
      r.id,
      s.stop_name,
      s.stop_code,
      s.latitude,
      s.longitude,
      s.sequence
    FROM routes r
    CROSS JOIN (VALUES
      ('Terminal Kota Gambir', 'GMB', -6.1751, 106.8650, 1),
      ('Terminal Pasar Senen', 'PSN', -6.1811, 106.8500, 2),
      ('Terminal Bekasi', 'BKS', -6.2383, 106.9756, 3)
    ) AS s(stop_name, stop_code, latitude, longitude, sequence)
    WHERE r.route_code = 'JKT-BKS'
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = pgm => {
  // Delete stops first (due to foreign key constraint)
  pgm.sql(`
    DELETE FROM stops 
    WHERE route_id IN (
      SELECT id FROM routes 
      WHERE route_code IN ('JKT-BDG', 'JKT-DPK', 'JKT-BGR', 'BDG-JKT', 'JKT-BKS')
    );
  `);

  // Delete routes
  pgm.sql(`
    DELETE FROM routes 
    WHERE route_code IN ('JKT-BDG', 'JKT-DPK', 'JKT-BGR', 'BDG-JKT', 'JKT-BKS');
  `);
};

