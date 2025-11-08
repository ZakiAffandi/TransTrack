import axios from 'axios';

/**
 * Service untuk melakukan panggilan API ke API Gateway
 * 
 * Menggunakan variabel REACT_APP_API_GATEWAY_URL dari .env.development
 * Default: http://localhost:8000/api
 */

// Resolver base URL: jika ENV kosong atau masih mengarah ke localhost:8000 (gateway mati), pakai UserService (3002)
const ENV_URL = process.env.REACT_APP_API_GATEWAY_URL;
const API_GATEWAY_URL = (!ENV_URL || /localhost:8000/i.test(ENV_URL))
  ? 'http://localhost:3002/api'
  : ENV_URL;

// Buat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk request (opsional: tambahkan auth token di sini)
apiClient.interceptors.request.use(
  (config) => {
    // Contoh: tambahkan token jika diperlukan
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response (opsional: handle error global di sini)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error global (contoh: redirect ke login jika 401)
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

/**
 * Fungsi untuk mengambil data routes dari RouteService
 */
export const getRoutes = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/routes');
    return response.data;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mengambil data drivers dari DriverService
 */
export const getDrivers = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/drivers');
    return response.data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mengambil data maintenance berdasarkan bus ID
 */
export const getMaintenanceByBusId = async (busId, status = null) => {
  try {
    const params = {};
    if (status) {
      params.status = status;
    }
    const response = await axios.get(`http://localhost:3003/api/maintenance/bus/${busId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mengecek apakah bus sedang dalam maintenance
 */
export const checkBusMaintenance = async (busId) => {
  try {
    // Cek maintenance dengan status scheduled atau in_progress
    const [scheduledResponse, inProgressResponse] = await Promise.all([
      axios.get(`http://localhost:3003/api/maintenance/bus/${busId}`, {
        params: { status: 'scheduled', limit: 1 }
      }).catch(() => ({ data: { data: [] } })),
      axios.get(`http://localhost:3003/api/maintenance/bus/${busId}`, {
        params: { status: 'in_progress', limit: 1 }
      }).catch(() => ({ data: { data: [] } }))
    ]);
    
    const scheduled = scheduledResponse.data?.data || [];
    const inProgress = inProgressResponse.data?.data || [];
    return scheduled.length > 0 || inProgress.length > 0;
  } catch (error) {
    console.error('Error checking bus maintenance:', error);
    return false;
  }
};

/**
 * Fungsi untuk mengambil data buses (mock data karena belum ada API khusus)
 * Dalam implementasi nyata, ini bisa diambil dari service khusus atau dari maintenance
 */
export const getBuses = async () => {
  // Untuk sementara, return mock data
  // Di production, ini harus diambil dari API bus service
  return {
    success: true,
    data: [
      { id: 'BUS-001', plate: 'B 1234 CD', capacity: 40, status: 'available' },
      { id: 'BUS-002', plate: 'B 5678 EF', capacity: 35, status: 'available' },
      { id: 'BUS-003', plate: 'B 9012 GH', capacity: 45, status: 'available' },
    ]
  };
};

/**
 * Contoh fungsi untuk mengambil data tracking real-time
 */
export const getTrackingData = async (busId) => {
  try {
    const response = await apiClient.get(`/tracking/${busId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    throw error;
  }
};

// TicketService helpers
export const createTicket = async ({ userId, scheduleId, amount, currency = 'IDR' }) => {
  const res = await apiClient.post('http://localhost:3004/api/tickets', { userId, scheduleId, amount, currency });
  return res.data;
};

export const updateTicketStatus = async (ticketId, { status, paymentRef }) => {
  const res = await apiClient.patch(`http://localhost:3004/api/tickets/${ticketId}/status`, { status, paymentRef });
  return res.data;
};

export const getUserTickets = async (userId) => {
  const res = await apiClient.get('http://localhost:3004/api/tickets', { params: { userId } });
  return res.data;
};

export const validateTicket = async (code) => {
  const res = await apiClient.post('http://localhost:3004/api/tickets/validate', { code });
  return res.data;
};

// Schedules (use RouteService as basic listing placeholder)
export const searchSchedules = async (query) => {
  const res = await axios.get('http://localhost:3000/api/routes');
  const data = res.data?.data || res.data || [];
  if (!query) return data;
  const q = String(query).toLowerCase();
  return data.filter((r) => (r.route_name || r.routeName || '').toLowerCase().includes(q));
};

/**
 * Fungsi untuk membuat schedule baru
 * Karena belum ada API khusus untuk schedules, kita simpan di localStorage sementara
 */
export const createSchedule = async (scheduleData) => {
  try {
    // Untuk sementara, simpan di localStorage
    // Di production, ini harus dikirim ke API schedule service
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const newSchedule = {
      id: Date.now().toString(),
      ...scheduleData,
      createdAt: new Date().toISOString()
    };
    schedules.push(newSchedule);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    return { success: true, data: newSchedule };
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mengambil semua schedules
 */
export const getSchedules = async () => {
  try {
    // Untuk sementara, ambil dari localStorage
    // Di production, ini harus diambil dari API schedule service
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    return { success: true, data: schedules };
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

/**
 * Export default apiClient untuk penggunaan langsung jika diperlukan
 */
export default apiClient;

