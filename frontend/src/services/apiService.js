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
 * Contoh fungsi untuk mengambil data routes
 */
export const getRoutes = async () => {
  try {
    const response = await apiClient.get('/routes');
    return response.data;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

/**
 * Contoh fungsi untuk mengambil data buses
 */
export const getBuses = async () => {
  try {
    const response = await apiClient.get('/buses');
    return response.data;
  } catch (error) {
    console.error('Error fetching buses:', error);
    throw error;
  }
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
  const res = await apiClient.get('http://localhost:3000/api/routes');
  const data = res.data?.data || res.data || [];
  if (!query) return data;
  const q = String(query).toLowerCase();
  return data.filter((r) => (r.route_name || r.routeName || '').toLowerCase().includes(q));
};

/**
 * Export default apiClient untuk penggunaan langsung jika diperlukan
 */
export default apiClient;

