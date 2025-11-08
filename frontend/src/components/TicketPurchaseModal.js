import React, { useState } from 'react';
import apiClient, { createSchedule, getBuses, getDrivers } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Backdrop = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/30" onClick={onClose} />
);

const Modal = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-text mb-1">{label}</span>
    {children}
  </label>
);

const TextInput = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
  />
);

const Select = ({ options = [], ...props }) => (
  <select
    {...props}
    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const SubmitButton = ({ children }) => (
  <button type="submit" className="w-full bg-secondary text-white rounded-md py-2.5 font-medium hover:opacity-95">
    {children}
  </button>
);

const TicketPurchaseModal = ({ open, onClose, scheduleId, scheduleLabel, route, date, onNotify }) => {
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState(20000);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleId) {
      alert('Pilih jadwal terlebih dahulu');
      return;
    }
    if (!user?.id) {
      alert('Anda belum login');
      return;
    }
    try {
      setSubmitting(true);
      // 1) Buat tiket pending di TicketService (port 3004)
      // scheduleId bisa berupa UUID (route.id) atau string, jadi kita gunakan langsung
      const res = await apiClient.post('http://localhost:3004/api/tickets', {
        userId: user.id,
        scheduleId: scheduleId || route?.id || 'schedule-default',
        scheduleLabel: scheduleLabel || route?.routeName || route?.route_name || 'Rute',
        amount: Number(amount),
        currency: 'IDR'
      });
      if (res.data?.success) {
        // 2) Tandai tiket sukses (tanpa payment gateway eksternal)
        await apiClient.patch(`http://localhost:3004/api/tickets/${res.data.data.id}/status`, {
          status: 'success',
          paymentRef: paymentMethod
        });
        
        // 3) Buat schedule setelah pembayaran berhasil
        if (route) {
          try {
            // Ambil bus dan driver pertama yang tersedia
            const [busesRes, driversRes] = await Promise.all([
              getBuses().catch(() => ({ success: false, data: [] })),
              getDrivers().catch(() => ({ success: false, data: [] }))
            ]);
            
            const buses = busesRes.success && busesRes.data && Array.isArray(busesRes.data) ? busesRes.data : [];
            const drivers = driversRes.success && driversRes.data && Array.isArray(driversRes.data) ? driversRes.data : [];
            
            // Gunakan bus dan driver pertama yang tersedia, atau gunakan data default
            const selectedBus = buses.length > 0 ? buses[0] : { id: 'BUS-001', plate: 'B 1234 CD' };
            const selectedDriver = drivers.length > 0 ? drivers[0] : { id: 'DRIVER-001', name: 'Driver Default' };
            
            // Format waktu: jika ada date, gunakan date + waktu default (09:00), jika tidak gunakan waktu sekarang + 1 jam
            let scheduleTime;
            if (date) {
              scheduleTime = `${date}T09:00`;
            } else {
              const now = new Date();
              now.setHours(now.getHours() + 1);
              scheduleTime = now.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:mm
            }
            
            const scheduleData = {
              routeId: route.id || scheduleId,
              routeName: route.routeName || route.route_name || scheduleLabel || 'Rute',
              busId: selectedBus.id,
              busPlate: selectedBus.plate,
              driverId: selectedDriver.id,
              driverName: selectedDriver.name,
              time: scheduleTime,
              ticketId: res.data.data.id // simpan ticket id sebagai referensi
            };
            
            await createSchedule(scheduleData);
            onNotify?.('success', 'Pembayaran berhasil dan jadwal telah ditambahkan');
          } catch (scheduleError) {
            console.error('Error creating schedule:', scheduleError);
            // Tetap tampilkan sukses karena pembayaran sudah berhasil
            onNotify?.('success', 'Pembayaran berhasil (jadwal gagal ditambahkan)');
          }
        } else {
          onNotify?.('success', 'Pembayaran berhasil');
        }
        
        onClose?.();
      } else {
        onNotify?.('error', res.data?.message || 'Gagal membuat tiket');
      }
    } catch (err) {
      onNotify?.('error', err?.response?.data?.message || err?.message || 'Gagal membuat tiket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <Modal>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-text mb-2">Form Pembelian Tiket</h3>
          <p className="text-textSecondary mb-4">Isi detail berikut untuk melanjutkan pembelian.</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Harga (IDR)">
              <TextInput type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Metode Pembayaran">
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'wallet', label: 'Dompet Digital' },
                  { value: 'card', label: 'Kartu Kredit/Debit' },
                  { value: 'transfer', label: 'Transfer Bank' },
                ]}
              />
            </Field>
            <Field label="Catatan (opsional)">
              <TextInput
                placeholder="Permintaan khusus kursi, dsb."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
            <SubmitButton>{submitting ? 'Memproses...' : 'Bayar Sekarang'}</SubmitButton>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default TicketPurchaseModal;


