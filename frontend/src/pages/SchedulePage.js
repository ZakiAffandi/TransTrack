import React, { useState } from 'react';
import Toast from '../components/Toast';

const SchedulePage = () => {
  // Data statis dummy
  const routes = [
    { id: 1, name: 'Jakarta - Bandung' },
    { id: 2, name: 'Bandung - Surabaya' },
  ];

  const buses = [
    { id: 1, plate: 'B 1234 CD', capacity: 40, status: 'available' },
    { id: 2, plate: 'B 9876 EF', capacity: 35, status: 'maintenance' },
  ];

  const drivers = [
    { id: 1, name: 'Andi', license: 'A12345' },
    { id: 2, name: 'Rudi', license: 'B54321' },
  ];

  const maintenance = [
    { id: 1, bus_id: 2, status: 'ongoing' },
  ];

  const [schedules, setSchedules] = useState([
    { id: 1, route: 'Jakarta - Bandung', bus: 'B 1234 CD', driver: 'Andi', time: '2025-11-07 09:00' },
  ]);

  const [form, setForm] = useState({
    routeId: '',
    busId: '',
    driverId: '',
    time: '',
  });

  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  const notify = (type, message) => setToast({ open: true, type, message });

  // Validasi & tambah jadwal
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.routeId || !form.busId || !form.driverId || !form.time) {
      notify('error', 'Semua field harus diisi!');
      return;
    }

    const selectedBus = buses.find(b => b.id === Number(form.busId));
    const isUnderMaintenance = maintenance.some(m => m.bus_id === selectedBus.id && m.status === 'ongoing');

    if (selectedBus.status === 'maintenance' || isUnderMaintenance) {
      notify('error', `Bus ${selectedBus.plate} sedang dalam perbaikan!`);
      return;
    }

    const route = routes.find(r => r.id === Number(form.routeId));
    const driver = drivers.find(d => d.id === Number(form.driverId));

    const newSchedule = {
      id: schedules.length + 1,
      route: route.name,
      bus: selectedBus.plate,
      driver: driver.name,
      time: form.time,
    };

    setSchedules([...schedules, newSchedule]);
    notify('success', 'Jadwal berhasil ditambahkan!');
    setForm({ routeId: '', busId: '', driverId: '', time: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">Cek Jadwal</h1>
        <p className="text-textSecondary mt-2">
          Dapatkan informasi jadwal kedatangan dan keberangkatan bus yang selalu ter-update.
        </p>
      </div>

      {/* Jadwal Aktif */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Daftar Jadwal Aktif</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm text-textSecondary border-b">
              <th className="py-2">Rute</th>
              <th className="py-2">Bus</th>
              <th className="py-2">Pengemudi</th>
              <th className="py-2">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length > 0 ? (
              schedules.map((s) => (
                <tr key={s.id} className="border-b last:border-none">
                  <td className="py-2">{s.route}</td>
                  <td className="py-2">{s.bus}</td>
                  <td className="py-2">{s.driver}</td>
                  <td className="py-2">{s.time?.replace('T', ' ')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">Belum ada jadwal</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Tambah Jadwal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Tambah Jadwal Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-textSecondary mb-1">Rute</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={form.routeId}
              onChange={(e) => setForm({ ...form, routeId: e.target.value })}
            >
              <option value="">Pilih Rute</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-textSecondary mb-1">Bus</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={form.busId}
              onChange={(e) => setForm({ ...form, busId: e.target.value })}
            >
              <option value="">Pilih Bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.plate} {b.status === 'maintenance' ? '(Maintenance)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-textSecondary mb-1">Pengemudi</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            >
              <option value="">Pilih Pengemudi</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-textSecondary mb-1">Waktu Berangkat</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
};

export default SchedulePage;
