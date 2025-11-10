import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiClock, FiSearch, FiFilter, FiX, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import Toast from '../components/Toast';
import { getRoutes, getBuses, apiClient, getSchedules } from '../services/apiService';

// Custom Bus Icon Component
const BusIcon = ({ className, size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Bus Body */}
    <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor"/>
    {/* Bus Windows */}
    <rect x="4" y="8" width="3" height="2.5" rx="0.5" fill="currentColor"/>
    <rect x="8.5" y="8" width="3" height="2.5" rx="0.5" fill="currentColor"/>
    <rect x="13" y="8" width="3" height="2.5" rx="0.5" fill="currentColor"/>
    {/* Bus Door */}
    <rect x="17" y="9" width="2.5" height="5" rx="0.5" fill="currentColor"/>
    {/* Bus Wheels */}
    <circle cx="7" cy="19" r="2" fill="currentColor"/>
    <circle cx="17" cy="19" r="2" fill="currentColor"/>
    {/* Bus Front Window */}
    <rect x="20" y="8" width="1.5" height="4" rx="0.3" fill="currentColor"/>
  </svg>
);

// Route Detail Modal Component
const RouteDetailModal = ({ route, isOpen, onClose, buses }) => {
  const navigate = useNavigate();
  const [detailRoute, setDetailRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && route) {
      loadRouteDetail();
    } else {
      setDetailRoute(null);
      setSchedules([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, route]);

  const loadRouteDetail = async () => {
    if (!route?.id) return;
    
    setLoading(true);
    try {
      // Komunikasi antar API services melalui Gateway:
      // 1. RouteService - untuk mendapatkan detail rute lengkap dengan stops
      // 2. BusService - sudah ada di props (buses)
      // 3. ScheduleService - untuk mendapatkan jadwal terkait rute ini
      
      const [routeDetailRes, schedulesRes] = await Promise.all([
        apiClient.get(`/routes/${route.id}`).catch(() => null),
        getSchedules({ routeId: route.id, limit: 10 }).catch(() => ({ success: false, data: [] }))
      ]);

      if (routeDetailRes?.data?.success) {
        setDetailRoute(routeDetailRes.data.data);
      }

      if (schedulesRes?.success && Array.isArray(schedulesRes.data)) {
        setSchedules(schedulesRes.data);
      } else if (Array.isArray(schedulesRes.data)) {
        setSchedules(schedulesRes.data);
      }
    } catch (error) {
      console.error('Error loading route detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !route) return null;

  const busInfo = buses?.find(bus => bus.id === route.bus_id || bus.plate === route.bus_id);
  const stops = detailRoute?.stops || route.stops || [];
  const routeName = route.routeName || route.route_name || route.routeCode || route.route_code || `Rute ${route.id?.substring(0, 8)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text">{routeName}</h2>
            <p className="text-sm text-textSecondary font-mono mt-1">
              {route.routeCode || route.route_code || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={24} className="text-textSecondary" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-textSecondary">Memuat detail rute...</p>
            </div>
          ) : (
            <>
              {/* Route Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-textSecondary">Status</span>
                    <p className="font-semibold text-text capitalize">{route.status || 'Unknown'}</p>
                  </div>
                  {route.description && (
                    <div>
                      <span className="text-sm text-textSecondary">Deskripsi</span>
                      <p className="font-semibold text-text">{route.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bus Info */}
              {busInfo && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BusIcon className="text-primary" size={20} />
                    <h3 className="text-lg font-semibold text-text">Informasi Bus</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-textSecondary">Plat Nomor</span>
                      <p className="font-semibold text-text">{busInfo.plate || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-textSecondary">Model</span>
                      <p className="font-semibold text-text">{busInfo.model || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-textSecondary">Kapasitas</span>
                      <p className="font-semibold text-text">{busInfo.capacity || 'N/A'} penumpang</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stops */}
              {stops.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FiMapPin className="text-primary" size={20} />
                      <h3 className="text-lg font-semibold text-text">
                        Pemberhentian ({stops.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/stops?routeId=${route.id}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <span>Lihat Semua Halte</span>
                      <FiExternalLink size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {stops.slice(0, 5).map((stop, idx) => (
                      <div
                        key={stop.id || idx}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-text">
                            {stop.stopName || stop.stop_name || stop.name || 'Halte'}
                          </p>
                          {stop.stopCode || stop.stop_code ? (
                            <p className="text-sm text-textSecondary font-mono">
                              {stop.stopCode || stop.stop_code}
                            </p>
                          ) : null}
                          {(stop.latitude && stop.longitude) && (
                            <p className="text-xs text-textSecondary mt-1">
                              {typeof stop.latitude === 'number' 
                                ? stop.latitude.toFixed(6) 
                                : parseFloat(stop.latitude).toFixed(6)}, {typeof stop.longitude === 'number'
                                ? stop.longitude.toFixed(6)
                                : parseFloat(stop.longitude).toFixed(6)}
                            </p>
                          )}
                        </div>
                        {idx < Math.min(stops.length - 1, 4) && (
                          <FiChevronRight className="text-textSecondary flex-shrink-0" size={20} />
                        )}
                      </div>
                    ))}
                    {stops.length > 5 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/stops?routeId=${route.id}`);
                          }}
                          className="text-sm text-primary hover:text-primary/80 font-medium"
                        >
                          +{stops.length - 5} halte lainnya...
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Schedules */}
              {schedules.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <FiClock className="text-primary" size={20} />
                    <h3 className="text-lg font-semibold text-text">
                      Jadwal Terkait ({schedules.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {schedules.slice(0, 5).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-text">
                              {schedule.departureTime || schedule.departure_time || 'N/A'}
                            </p>
                            {schedule.arrivalTime || schedule.arrival_time ? (
                              <p className="text-sm text-textSecondary">
                                Tiba: {schedule.arrivalTime || schedule.arrival_time}
                              </p>
                            ) : null}
                          </div>
                          {schedule.status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              schedule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {schedule.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {schedules.length > 5 && (
                      <p className="text-sm text-textSecondary text-center pt-2">
                        +{schedules.length - 5} jadwal lainnya...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Route Metadata */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-textSecondary">ID Rute</span>
                    <p className="font-mono text-text">{route.id?.substring(0, 8)}...</p>
                  </div>
                  {route.createdAt || route.created_at ? (
                    <div>
                      <span className="text-textSecondary">Dibuat</span>
                      <p className="text-text">
                        {new Date(route.createdAt || route.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  ) : null}
                  {route.updatedAt || route.updated_at ? (
                    <div>
                      <span className="text-textSecondary">Diperbarui</span>
                      <p className="text-text">
                        {new Date(route.updatedAt || route.updated_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  ) : null}
                  {stops.length > 0 && (
                    <div>
                      <span className="text-textSecondary">Total Halte</span>
                      <p className="text-text font-semibold">{stops.length}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const notify = (type, message) => setToast({ open: true, type, message });

  // Load data dari API Gateway (komunikasi antar services)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Komunikasi antar API services melalui Gateway:
        // 1. RouteService - untuk mendapatkan semua rute (tanpa detail stops untuk optimasi)
        // 2. BusService - untuk mendapatkan informasi bus
        
        const [routesRes, busesRes] = await Promise.all([
          getRoutes().catch(err => {
            console.error('Error loading routes:', err);
            return { success: false, data: [] };
          }),
          getBuses().catch(err => {
            console.error('Error loading buses:', err);
            return { success: false, data: [] };
          })
        ]);

        if (isMounted) {
          // Set routes data (tanpa detail stops untuk optimasi - akan di-load saat modal dibuka)
          let routesData = [];
          if (routesRes.success && routesRes.data && Array.isArray(routesRes.data)) {
            routesData = routesRes.data;
          } else if (Array.isArray(routesRes.data)) {
            routesData = routesRes.data;
          }
          setRoutes(routesData);

          // Set buses data
          if (busesRes.success && busesRes.data && Array.isArray(busesRes.data)) {
            setBuses(busesRes.data);
          } else if (Array.isArray(busesRes.data)) {
            setBuses(busesRes.data);
          } else {
            setBuses([]);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          notify('error', 'Gagal memuat data rute. Silakan coba lagi.');
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
  }, []);

  // Helper function untuk mendapatkan informasi bus berdasarkan bus_id
  const getBusInfo = (busId) => {
    if (!busId || !buses.length) return null;
    return buses.find(bus => bus.id === busId || bus.plate === busId);
  };

  // Helper function untuk mendapatkan status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function untuk mendapatkan nama rute yang lebih baik
  const getRouteDisplayName = (route) => {
    if (route.routeName || route.route_name) {
      return route.routeName || route.route_name;
    }
    if (route.routeCode || route.route_code) {
      return `Rute ${route.routeCode || route.route_code}`;
    }
    if (route.description) {
      return route.description.length > 50 
        ? route.description.substring(0, 50) + '...' 
        : route.description;
    }
    return `Rute ${route.id?.substring(0, 8) || 'Unknown'}`;
  };

  // Handler untuk membuka modal detail
  const handleCardClick = (route) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
  };

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoute(null);
  };

  // Filter routes berdasarkan search query dan status
  const filteredRoutes = routes.filter(route => {
    const routeName = getRouteDisplayName(route);
    const routeCode = route.routeCode || route.route_code || '';
    const description = route.description || '';
    
    const matchesSearch = 
      !searchQuery ||
      routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (route.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Memuat data rute...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Daftar Rute</h1>
          <p className="text-textSecondary">
            Informasi lengkap tentang semua rute bus yang tersedia
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" size={20} />
              <input
                type="text"
                placeholder="Cari rute berdasarkan nama, kode, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-textSecondary" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Routes List - Card dengan informasi singkat */}
        {filteredRoutes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FiMapPin className="mx-auto text-textSecondary mb-4" size={48} />
            <h3 className="text-xl font-semibold text-text mb-2">Tidak ada rute ditemukan</h3>
            <p className="text-textSecondary">
              {searchQuery || statusFilter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian Anda'
                : 'Belum ada rute yang tersedia saat ini'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => {
              const busInfo = getBusInfo(route.bus_id);
              const routeName = getRouteDisplayName(route);
              const routeCode = route.routeCode || route.route_code || 'N/A';

              return (
                <div
                  key={route.id}
                  onClick={() => handleCardClick(route)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Route Header - Informasi Singkat */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text mb-1 line-clamp-2">
                          {routeName}
                        </h3>
                        <p className="text-sm text-textSecondary font-mono">
                          {routeCode}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(route.status)}`}
                      >
                        {route.status || 'Unknown'}
                      </span>
                    </div>

                    {/* Info Singkat */}
                    <div className="space-y-2 mt-4">
                      {busInfo && (
                        <div className="flex items-center gap-2 text-sm">
                          <BusIcon className="text-primary" size={14} />
                          <span className="text-textSecondary">
                            {busInfo.plate || busInfo.id?.substring(0, 8)}
                          </span>
                        </div>
                      )}
                      {route.description && (
                        <p className="text-sm text-textSecondary line-clamp-2">
                          {route.description}
                        </p>
                      )}
                    </div>

                    {/* Click Indicator */}
                    <div className="mt-4 flex items-center text-primary text-sm font-medium">
                      <span>Lihat Detail</span>
                      <FiChevronRight className="ml-1" size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filteredRoutes.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-textSecondary">Total Rute: </span>
                <span className="font-semibold text-text">{filteredRoutes.length}</span>
              </div>
              <div>
                <span className="text-textSecondary">Aktif: </span>
                <span className="font-semibold text-green-600">
                  {filteredRoutes.filter(r => r.status?.toLowerCase() === 'active').length}
                </span>
              </div>
              <div>
                <span className="text-textSecondary">Maintenance: </span>
                <span className="font-semibold text-yellow-600">
                  {filteredRoutes.filter(r => r.status?.toLowerCase() === 'maintenance').length}
                </span>
              </div>
              <div>
                <span className="text-textSecondary">Tidak Aktif: </span>
                <span className="font-semibold text-gray-600">
                  {filteredRoutes.filter(r => r.status?.toLowerCase() === 'inactive').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Route Detail Modal */}
      <RouteDetailModal
        route={selectedRoute}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        buses={buses}
      />

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

export default RoutesPage;
