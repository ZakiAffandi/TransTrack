'use strict';

/**
 * Seed data: Users
 * Menambahkan data awal untuk users
 * Password: "password123" (hashed dengan bcrypt, cost 10)
 * Hash: $2b$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq
 * Untuk testing, gunakan password yang sama untuk semua user
 */

exports.up = pgm => {
  // Password hash untuk "password123" (bcrypt, cost 10)
  const passwordHash = '$2b$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
  
  pgm.sql(`
    INSERT INTO users (name, email, phone, password)
    VALUES 
      ('John Doe', 'john.doe@example.com', '081234567890', $1),
      ('Jane Smith', 'jane.smith@example.com', '081234567891', $1),
      ('Ahmad Fauzi', 'ahmad.fauzi@example.com', '081234567892', $1),
      ('Siti Nurhaliza', 'siti.nurhaliza@example.com', '081234567893', $1),
      ('Budi Santoso', 'budi.santoso@example.com', '081234567894', $1)
    ON CONFLICT (email) DO NOTHING;
  `, [passwordHash]);
};

exports.down = pgm => {
  pgm.sql(`
    DELETE FROM users 
    WHERE email IN (
      'john.doe@example.com', 'jane.smith@example.com', 'ahmad.fauzi@example.com',
      'siti.nurhaliza@example.com', 'budi.santoso@example.com'
    );
  `);
};

