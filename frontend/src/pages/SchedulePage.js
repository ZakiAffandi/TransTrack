import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import { getSchedules } from '../services/apiService';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  const notify = (type, message) => setToast({ open: true, type, message });

  // Load data dari API
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        
        // Load schedules
        const schedulesRes = await getSchedules().catch(err => {
          console.error('Error loading schedules:', err);
          return { success: false, data: [] };
        });

        // Set schedules
        if (isMounted && schedulesRes.success && schedulesRes.data && Array.isArray(schedulesRes.data)) {
          setSchedules(schedulesRes.data);
        }

      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted && showLoading) {
          notify('error', 'Gagal memuat data. Silakan refresh halaman.');
        }
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
        }
      }
    };

    // Load pertama kali dengan loading indicator
    loadData(true);
    
    // Refresh schedules setiap 5 detik untuk update real-time (tanpa loading indicator)
    const interval = setInterval(() => {
      loadData(false);
    }, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          <p className="mt-4 text-textSecondary">Memuat data...</p>
        </div>
      </div>
    );
  }

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
        <div className="overflow-x-auto">
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
                    <td className="py-2">{s.route || s.routeName}</td>
                    <td className="py-2">{s.bus || s.busPlate}</td>
                    <td className="py-2">{s.driver || s.driverName}</td>
                    <td className="py-2">{s.time?.replace('T', ' ') || s.time}</td>
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
