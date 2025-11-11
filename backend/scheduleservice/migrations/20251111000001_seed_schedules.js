'use strict';

/**
 * Seed data: Schedules
 * Catatan: Seed schedules dihapus karena schedules akan dibuat secara otomatis
 * melalui API ensure-schedules-for-date saat user memilih tanggal.
 * Schedules akan dibuat dengan route_id yang benar dari routeservice.
 * 
 * Migration ini kosong karena kita mengandalkan ensureSchedulesForDate
 * untuk membuat schedules secara dinamis berdasarkan:
 * - Routes yang ada di routeservice
 * - Tanggal yang dipilih user
 * - Hari libur nasional (akan di-skip)
 */

exports.up = pgm => {
  // Tidak ada seed data untuk schedules
  // Schedules akan dibuat secara otomatis melalui ensureSchedulesForDate API
  // yang dipanggil saat user memilih tanggal di frontend
  pgm.sql(`-- Seed schedules dihapus, menggunakan ensureSchedulesForDate API`);
};

exports.down = pgm => {
  // Tidak ada yang perlu dihapus
  pgm.sql(`-- Seed schedules dihapus, menggunakan ensureSchedulesForDate API`);
};

