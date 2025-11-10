import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiMapPin, FiSearch, FiFilter, FiArrowLeft } from 'react-icons/fi';
import Toast from '../components/Toast';
import { apiClient, getRoutes } from '../services/apiService';

const StopsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get('routeId');
  
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState(routeId || 'all');
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const notify = (type, message) => setToast({ open: true, type, message });

  // Fungsi untuk mengambil semua stops dari semua rute
  const loadAllStops = async () => {
    try {
      // Ambil semua rute terlebih dahulu
      const routesRes = await getRoutes();
      const routesData = routesRes.success && routesRes.data 
        ? routesRes.data 
        : (Array.isArray(routesRes.data) ? routesRes.data : []);

      // Ambil detail setiap rute untuk mendapatkan stops
      const allStops = [];
      const routeMap = new Map();

      await Promise.all(
        routesData.map(async (route) => {
          try {
            const detailRes = await apiClient.get(`/routes/${route.id}`).catch(() => null);
            if (detailRes?.data?.success && detailRes.data.data?.stops) {
              const routeStops = detailRes.data.data.stops.map(stop => ({
                ...stop,
                routeId: route.id,
                routeName: route.routeName || route.route_name,
                routeCode: route.routeCode || route.route_code
              }));
              allStops.push(...routeStops);
              routeMap.set(route.id, {
                name: route.routeName || route.route_name,
                code: route.routeCode || route.route_code
              });
            }
          } catch (err) {
            console.warn(`Error loading stops for route ${route.id}:`, err);
          }
        })
      );

      return allStops;
    } catch (error) {
      console.error('Error loading all stops:', error);
      return [];
    }
  };

  // Load data dari API Gateway (komunikasi antar services)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Komunikasi antar API services melalui Gateway:
        // 1. RouteService - untuk mendapatkan semua rute (untuk filter)
        // 2. RouteService - untuk mendapatkan semua stops dari semua rute
        
        const [routesRes, stopsRes] = await Promise.all([
          getRoutes().catch(err => {
            console.error('Error loading routes:', err);
            return { success: false, data: [] };
          }),
          // Ambil stops dari semua rute dengan mengambil detail setiap rute
          loadAllStops().catch(err => {
            console.error('Error loading stops:', err);
            return [];
          })
        ]);

        if (isMounted) {
          // Set routes data
          let routesData = [];
          if (routesRes.success && routesRes.data && Array.isArray(routesRes.data)) {
            routesData = routesRes.data;
          } else if (Array.isArray(routesRes.data)) {
            routesData = routesRes.data;
          }
          setRoutes(routesData);

          // Set stops data
          setStops(stopsRes);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          notify('error', 'Gagal memuat data halte. Silakan coba lagi.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function untuk mendapatkan nama rute
  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? (route.routeName || route.route_name || route.routeCode || route.route_code) : 'Unknown Route';
  };

  // Filter stops berdasarkan search query dan route filter
  const filteredStops = stops.filter(stop => {
    const matchesSearch = 
      !searchQuery ||
      (stop.stopName || stop.stop_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stop.stopCode || stop.stop_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stop.routeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stop.routeCode || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoute = 
      routeFilter === 'all' || 
      stop.routeId === routeFilter;
    
    return matchesSearch && matchesRoute;
  });

  // Group stops by route untuk tampilan yang lebih terorganisir
  const stopsByRoute = filteredStops.reduce((acc, stop) => {
    const routeId = stop.routeId || 'unknown';
    if (!acc[routeId]) {
      acc[routeId] = {
        routeId,
        routeName: stop.routeName || getRouteName(routeId),
        routeCode: stop.routeCode,
        stops: []
      };
    }
    acc[routeId].stops.push(stop);
    return acc;
  }, {});

  const groupedStops = Object.values(stopsByRoute);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Memuat data halte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/routes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={24} className="text-textSecondary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">Daftar Halte</h1>
              <p className="text-textSecondary">
                Informasi lengkap tentang semua halte bus yang tersedia
              </p>
            </div>
          </div>
          {routeId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Menampilkan halte untuk rute: <span className="font-semibold">{getRouteName(routeId)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" size={20} />
              <input
                type="text"
                placeholder="Cari halte berdasarkan nama, kode, atau rute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Route Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-textSecondary" size={20} />
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px]"
              >
                <option value="all">Semua Rute</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.routeName || route.route_name || route.routeCode || route.route_code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stops List */}
        {filteredStops.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FiMapPin className="mx-auto text-textSecondary mb-4" size={48} />
            <h3 className="text-xl font-semibold text-text mb-2">Tidak ada halte ditemukan</h3>
            <p className="text-textSecondary">
              {searchQuery || routeFilter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian Anda'
                : 'Belum ada halte yang tersedia saat ini'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedStops.map((group) => (
              <div key={group.routeId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Route Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text">
                        {group.routeName}
                      </h3>
                      <p className="text-sm text-textSecondary font-mono">
                        {group.routeCode || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-textSecondary">Total Halte</span>
                      <p className="text-xl font-bold text-primary">{group.stops.length}</p>
                    </div>
                  </div>
                </div>

                {/* Stops List */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.stops
                      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                      .map((stop, idx) => (
                        <div
                          key={stop.id || idx}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                              {stop.sequence || idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-text mb-1 truncate">
                                {stop.stopName || stop.stop_name || 'Halte'}
                              </h4>
                              <p className="text-sm text-textSecondary font-mono mb-2">
                                {stop.stopCode || stop.stop_code || 'N/A'}
                              </p>
                              {(stop.latitude && stop.longitude) && (
                                <div className="flex items-center gap-2 text-xs text-textSecondary mt-2">
                                  <FiMapPin size={12} />
                                  <span>
                                    {parseFloat(stop.latitude).toFixed(6)}, {parseFloat(stop.longitude).toFixed(6)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredStops.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-textSecondary">Total Halte: </span>
                <span className="font-semibold text-text">{filteredStops.length}</span>
              </div>
              <div>
                <span className="text-textSecondary">Total Rute: </span>
                <span className="font-semibold text-text">{groupedStops.length}</span>
              </div>
              {routeFilter !== 'all' && (
                <div>
                  <span className="text-textSecondary">Rute Terpilih: </span>
                  <span className="font-semibold text-primary">{getRouteName(routeFilter)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
};

export default StopsPage;

