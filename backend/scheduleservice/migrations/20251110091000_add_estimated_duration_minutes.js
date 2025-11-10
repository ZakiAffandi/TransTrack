'use strict';

/**
 * Add estimated_duration_minutes to schedules
 */

exports.up = pgm => {
  pgm.addColumn('schedules', {
    estimated_duration_minutes: {
      type: 'integer',
      notNull: false,
      comment: 'Perkiraan durasi perjalanan dalam menit untuk rute pada jadwal ini',
    },
  });

  // Optional index if we later filter by duration
  pgm.createIndex('schedules', 'estimated_duration_minutes', { ifNotExists: true });
};

exports.down = pgm => {
  pgm.dropIndex('schedules', 'estimated_duration_minutes', { ifExists: true });
  pgm.dropColumn('schedules', 'estimated_duration_minutes', { ifExists: true });
};


