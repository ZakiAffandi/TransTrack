'use strict';

/**
 * Initial schema: extensions, enum, routes, stops
 */

exports.up = pgm => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_status') THEN
        CREATE TYPE route_status AS ENUM ('active', 'inactive', 'maintenance');
      END IF;
    END$$;
  `);

  pgm.createTable('routes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    route_name: { type: 'text', notNull: true },
    route_code: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true, default: '' },
    status: { type: 'route_status', notNull: true, default: 'active' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'routes_route_code_unique'
          AND t.relname = 'routes'
      ) THEN
        ALTER TABLE routes
          ADD CONSTRAINT routes_route_code_unique UNIQUE (route_code);
      END IF;
    END$$;
  `);

  pgm.createTable('stops', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    route_id: {
      type: 'uuid',
      notNull: true,
      references: 'routes(id)',
      onDelete: 'CASCADE',
    },
    stop_name: { type: 'text', notNull: true },
    stop_code: { type: 'text', notNull: true },
    latitude: { type: 'numeric(10,6)', notNull: true },
    longitude: { type: 'numeric(10,6)', notNull: true },
    sequence: { type: 'integer', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  pgm.createIndex('routes', ['status'], { ifNotExists: true });
  pgm.createIndex('stops', ['route_id', 'sequence'], { ifNotExists: true });
};

exports.down = pgm => {
  pgm.dropTable('stops');
  pgm.dropConstraint('routes', 'routes_route_code_unique', { ifExists: true });
  pgm.dropTable('routes');
  pgm.dropType('route_status');
};

