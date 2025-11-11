import React, { useEffect, useState } from 'react';
import { FiSearch, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import TicketPurchaseModal from './TicketPurchaseModal';
import Toast from './Toast';
import { getRoutes, getSchedules, getUserTickets, validateTicket, ensureSchedulesForDate } from '../services/apiService';

const Section = ({ title, description, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
    {description && <p className="text-textSecondary mb-4">{description}</p>}
    {children}
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

const ActionButton = ({ children, variant = 'primary', ...props }) => {
  const classes = variant === 'primary'
    ? 'bg-secondary text-white hover:opacity-95'
    : 'border border-primary text-primary hover:bg-primary/10';
  return (
    <button
      {...props}
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${classes}`}
    >
      {children}
    </button>
  );
};

const TicketingPage = () => {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  // Rute
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routesMsg, setRoutesMsg] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedRouteData, setSelectedRouteData] = useState(null);
  // Jadwal
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState('');

  const [ticketCode, setTicketCode] = useState('');
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [validating, setValidating] = useState(false);
  const { isAuthenticated, user, openLogin, isAuthModalOpen } = useAuth();
  const [pendingOpenPurchase, setPendingOpenPurchase] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const notify = (type, message) => setToast({ open: true, type, message });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const handleSearchRoutes = async () => {
    if (!query || query.trim().length < 2) {
      setRoutesMsg('Masukkan minimal 2 karakter untuk pencarian rute.');
      setRoutes([{ value: '', label: '-- pilih rute --' }]);
      setSelectedRouteId('');
      setSelectedRouteData(null);
      setSelectedSchedule('');
      return;
    }
    try {
      setLoadingRoutes(true);
      setRoutesMsg('');
      const res = await getRoutes();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const q = query.trim().toLowerCase();
      const filtered = data.filter((r) => {
        const name = (r.routeName || r.route_name || '').toLowerCase();
        const code = (r.routeCode || r.route_code || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        return name.includes(q) || code.includes(q) || desc.includes(q);
      });
      const opts = [{ value: '', label: '-- pilih rute --', route: null }].concat(
        filtered.map((r) => ({
          value: r.id,
          label: `${r.routeName || r.route_name || 'Rute'}${r.routeCode ? ` (${r.routeCode})` : ''}`,
          route: r,
        }))
      );
      setRoutes(opts);
      if (opts.length > 1) {
        setRoutesMsg(`Ditemukan ${opts.length - 1} rute.`);
        notify('success', `Berhasil menemukan ${opts.length - 1} rute`);
      } else {
        setRoutesMsg('Tidak ada rute yang cocok.');
        notify('warning', 'Tidak ada rute yang cocok');
      }
    } catch (e) {
      const msg = e?.message || 'Gagal mencari rute';
      setRoutesMsg(msg);
      notify('error', msg);
      setRoutes([{ value: '', label: '-- pilih rute --', route: null }]);
      setSelectedRouteId('');
      setSelectedRouteData(null);
      setSelectedSchedule('');
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Helper untuk normalisasi tanggal (YYYY-MM-DD)
  const toYMD = (d) => {
    if (!d) return '';
    const dt = typeof d === 'string' ? new Date(d) : d;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper untuk normalisasi tanggal dari ISO UTC (YYYY-MM-DD, UTC)
  const toYMDUTC = (iso) => {
    if (!iso) return '';
    const dt = new Date(iso);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper untuk normalisasi tanggal dari ISO ke tanggal lokal (YYYY-MM-DD, Local Time)
  const toYMDLocal = (iso) => {
    if (!iso) return '';
    const dt = new Date(iso); // gunakan zona waktu lokal
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const loadSchedulesForRoute = async (routeId, routeDetails = null) => {
    if (!routeId) {
      setSelectedSchedule('');
      setSelectedScheduleLabel('');
      setScheduleMsg('');
      return;
    }
    try {
      setLoadingSchedules(true);
      setScheduleMsg('');
      let ensureInfo = null;
      let ensureMessage = '';
      
      // Tentukan tanggal target: gunakan tanggal yang dipilih, atau hari ini jika belum dipilih
      const targetDate = date || toYMD(new Date());
      
      // Pastikan jadwal tersedia untuk tanggal target (hari ini, besok, lusa jika belum ada tanggal)
      if (!date) {
        // Jika belum ada tanggal dipilih, buat jadwal untuk hari ini, besok, dan lusa
        const today = new Date();
        const dates = [
          toYMD(today),
          toYMD(new Date(today.getTime() + 24 * 60 * 60 * 1000)), // besok
          toYMD(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)) // lusa
        ];
        
        for (const d of dates) {
          const info = await ensureSchedulesForDate({ date: d, routeId }).catch(() => null);
          if (info?.message && !ensureMessage) {
            ensureMessage = info.message;
          }
        }
        // Beri jeda lebih lama untuk multiple requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        // Jika tanggal sudah dipilih, buat jadwal untuk tanggal tersebut
        ensureInfo = await ensureSchedulesForDate({ date: targetDate, routeId }).catch(() => null);
        if (ensureInfo?.message) {
          ensureMessage = ensureInfo.message;
        }
        // Beri jeda singkat agar schedule service menyelesaikan insert
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const fetchSchedules = async () => {
        // Pertama: minta langsung ke server dengan routeId (lebih efisien)
        let res = await getSchedules({ routeId, limit: 1000 });
        let raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

        // Fallback: jika kosong, ambil semua lalu filter di sisi klien berdasarkan nama/kode rute
        if (!raw || raw.length === 0) {
          const all = await getSchedules({ limit: 1000 });
          raw = Array.isArray(all?.data) ? all.data : Array.isArray(all) ? all : [];
        }

        // Nilai rute terpilih (fallback untuk kasus data jadwal tidak punya routeId tapi punya routeName/routeCode)
        const routeInfo = routeDetails || selectedRouteData;
        const selectedName = (routeInfo?.routeName || routeInfo?.route_name || '').toLowerCase();
        const selectedCode = (routeInfo?.routeCode || routeInfo?.route_code || '').toLowerCase();

        // Filter jadwal agar sesuai rute pilihan
        let data = raw.filter((s) => {
          const sid = String(s.routeId || s.route_id || '').toLowerCase();
          const sName = String(s.routeName || s.route_name || '').toLowerCase();
          const sCode = String(s.routeCode || s.route_code || '').toLowerCase();
          const matchId = sid && sid === String(routeId).toLowerCase();
          const matchName = selectedName && sName && sName.includes(selectedName);
          const matchCode = selectedCode && sCode && sCode === selectedCode;
          return matchId || matchName || matchCode;
        });

        // Filter berdasarkan tanggal (gunakan format YYYY-MM-DD agar tidak bermasalah dengan timezone)
        if (date) {
          const target = typeof date === 'string' ? date : toYMD(date);
          // Utama: bandingkan menggunakan tanggal lokal agar tidak bergeser karena UTC offset
          let filtered = data.filter((s) => s.time && toYMDLocal(s.time) === target);
          // Fallback: jika kosong (kemungkinan perbedaan zona/konversi), coba pakai perbandingan UTC
          if (filtered.length === 0) {
            filtered = data.filter((s) => s.time && toYMDUTC(s.time) === target);
          }
          data = filtered;
        }

        return data.sort((a, b) => {
          const ta = a.time ? new Date(a.time).getTime() : 0;
          const tb = b.time ? new Date(b.time).getTime() : 0;
          return ta - tb;
        });
      };

      let data = await fetchSchedules();

      // Jika baru saja memastikan jadwal dibuat tapi data belum muncul, coba ulang beberapa kali
      let retryCount = 0;
      while (data.length === 0 && retryCount < 3) {
        if (retryCount > 0) {
          setScheduleMsg(`Menunggu jadwal baru diproses... mencoba lagi (${retryCount + 1}/3).`);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        data = await fetchSchedules();
        retryCount++;
      }

      const routeInfo = routeDetails || selectedRouteData;
      const buildLabel = (schedule) => {
        return `${schedule.time ? new Date(schedule.time).toLocaleString('id-ID') : 'Jadwal'} — ${(schedule.routeName || schedule.route_name || routeInfo?.routeName || 'Rute')} — ${schedule.busPlate || schedule.bus || 'Bus'} — ${schedule.driverName || schedule.driver || 'Driver'}`;
      };

      if (data.length > 0) {
        // Auto-pilih jadwal pertama yang cocok
        const first = data[0];
        setSelectedSchedule(first.id);
        setSelectedScheduleLabel(buildLabel(first));
        const infoMessage = ensureMessage ? `${ensureMessage} ` : '';
        setScheduleMsg(`${infoMessage}Ditemukan ${data.length} jadwal untuk rute ini. Jadwal pertama dipilih otomatis.`.trim());
      } else {
        setSelectedSchedule('');
        setSelectedScheduleLabel('');
        // Detailkan alasan jika kosong
        if (ensureInfo?.skipped === 'holiday') {
          setScheduleMsg(ensureMessage || 'Tanggal yang dipilih adalah hari libur, jadwal tidak tersedia.');
        } else if (ensureMessage) {
          setScheduleMsg(`${ensureMessage} Tidak ada jadwal yang cocok untuk rute dan tanggal yang dipilih.`.trim());
        } else {
          setScheduleMsg('Belum ada jadwal yang tersedia dari server untuk rute ini.');
        }
      }
    } catch (e) {
      const msg = e?.message || 'Gagal memuat jadwal untuk rute';
      setSelectedSchedule('');
      setSelectedScheduleLabel('');
      setScheduleMsg(msg);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Reload jadwal saat tanggal berubah untuk rute yang sudah dipilih
  React.useEffect(() => {
    if (selectedRouteId) {
      // Pastikan schedules dibuat untuk tanggal yang dipilih
      loadSchedulesForRoute(selectedRouteId, selectedRouteData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleOpenPurchase = () => {
    if (!selectedRouteId) {
      notify('warning', 'Silakan cari dan pilih rute terlebih dahulu');
      return;
    }
    if (!selectedSchedule) {
      notify('warning', 'Keberangkatan untuk rute ini belum tersedia. Coba ubah tanggal atau tunggu sejenak.');
      return;
    }
    if (!isAuthenticated) {
      setPendingOpenPurchase(true);
      openLogin();
      return;
    }
    setPurchaseOpen(true);
  };

  const handleValidate = async () => {
    if (!ticketCode) { notify('warning', 'Masukkan kode tiket'); return; }
    try {
      setValidating(true);
      const res = await validateTicket(ticketCode.trim());
      if (res?.success) {
        notify(res.valid ? 'success' : 'warning', res.valid ? 'Tiket valid' : 'Tiket tidak valid / belum dibayar');
      } else {
        notify('error', res?.message || 'Validasi gagal');
      }
    } catch (e) {
      notify('error', e?.response?.data?.message || e?.message || 'Validasi gagal');
    } finally {
      setValidating(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.id) return setHistory([]);
    try {
      setLoadingHistory(true);
      const res = await getUserTickets(user.id);
      if (res?.success) setHistory(res.data || []);
      else setHistory([]);
    } catch (e) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Buka modal pembelian otomatis setelah login jika user sebelumnya mencoba membeli
  useEffect(() => {
    if (isAuthenticated && pendingOpenPurchase) {
      setPendingOpenPurchase(false);
      setPurchaseOpen(true);
    }
  }, [isAuthenticated, pendingOpenPurchase]);

  // Jika user menutup modal login dengan klik di luar (tanpa login), batalkan niat beli
  useEffect(() => {
    if (!isAuthenticated && !isAuthModalOpen && pendingOpenPurchase) {
      setPendingOpenPurchase(false);
    }
  }, [isAuthModalOpen, isAuthenticated, pendingOpenPurchase]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-text">Pembelian & Validasi Tiket</h2>
        <p className="text-textSecondary mt-1">Kelola pembelian tiket dan validasi penggunaan tiket Anda.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cari Jadwal */}
        <Section
          title="Cari Rute"
          description="Temukan rute yang tersedia di database."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Kota / Rute">
              <TextInput
                placeholder="cth: Jakarta - Depok"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Field>
            <Field label="Tanggal Keberangkatan">
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ActionButton onClick={handleSearchRoutes} disabled={loadingRoutes}>
              <FiSearch /> {loadingRoutes ? 'Mencari...' : 'Cari Rute'}
            </ActionButton>
            {routesMsg && <span className="text-sm text-textSecondary">{routesMsg}</span>}
          </div>
        </Section>

        {/* Pilih Jadwal & Pengguna */}
        <Section
          title="Detail Pembelian"
          description="Tinjau rute, jadwal, dan akun sebelum melanjutkan."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Pilih Rute">
              <Select
                value={selectedRouteId}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedRouteId(v);
                  const found = routes.find(r => r.value === v);
                  setSelectedRouteData(found?.route || null);
                  // reset jadwal saat rute ganti
                  setSelectedSchedule('');
                  setSelectedScheduleLabel('');
                  if (v) loadSchedulesForRoute(v, found?.route || null);
                }}
                options={routes.length ? routes : [{ value: '', label: '-- pilih rute --' }]}
              />
            </Field>
            <Field label="Pengguna">
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-textSecondary">
                {isAuthenticated ? (user?.name || user?.email || user?.phone || 'Pengguna') : 'Belum masuk'}
              </div>
            </Field>
          </div>
          <div className="mt-2 text-sm text-textSecondary space-y-1">
            {loadingSchedules ? (
              <p>Memuat jadwal...</p>
            ) : (
              <>
                {selectedScheduleLabel && (
                  <p className="text-text">
                    <span className="font-medium text-textSecondary">Keberangkatan terpilih:</span>{' '}
                    {selectedScheduleLabel}
                  </p>
                )}
                {scheduleMsg && <p>{scheduleMsg}</p>}
              </>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <ActionButton onClick={handleOpenPurchase} disabled={loadingSchedules}>
              <FiCreditCard /> Beli Tiket
            </ActionButton>
          </div>
        </Section>

        {/* Validasi Tiket */}
        <Section
          title="Validasi Tiket"
          description="Masukkan kode tiket Anda untuk validasi."
        >
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <Field label="Kode Tiket">
              <TextInput
                placeholder="cth: UUID tiket"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
              />
            </Field>
            <div>
              <ActionButton onClick={handleValidate}>
                <FiCheckCircle /> {validating ? 'Memeriksa...' : 'Validasi'}
              </ActionButton>
            </div>
          </div>
        </Section>

        {/* Riwayat */}
        <Section
          title="Riwayat Tiket"
          description="Lihat pembelian terakhir Anda."
        >
          {loadingHistory ? (
            <p className="text-textSecondary">Memuat riwayat...</p>
          ) : !isAuthenticated ? (
            <p className="text-textSecondary">Masuk untuk melihat riwayat pembelian Anda.</p>
          ) : history.length === 0 ? (
            <p className="text-textSecondary">Anda belum membeli tiket.</p>
          ) : (
            <div className="border border-gray-100 rounded-lg divide-y">
              {history.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary">Kode</p>
                    <p className="font-medium text-text">{t.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-textSecondary">Jadwal</p>
                    <p className="font-medium text-text">{t.schedule_label || `schedule-${t.schedule_id}`}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs ${t.status === 'success' ? 'bg-green-100 text-green-700' : t.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                    <p className="text-xs text-textSecondary mt-1">Rp {Number(t.amount).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
      {/* Modal Pembelian */}
      <TicketPurchaseModal
        open={purchaseOpen}
        onClose={() => { setPurchaseOpen(false); if (isAuthenticated) loadHistory(); }}
        scheduleId={selectedSchedule}
        scheduleLabel={selectedScheduleLabel}
        route={selectedRouteData}
        date={date}
        onNotify={notify}
      />
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={closeToast} />
    </div>
  );
};

export default TicketingPage;


