import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTrackingData } from "../services/apiService";

const DEFAULT_DURATION_MINUTES = 120;
const ANIMATION_INTERVAL_MS = 1000;
const OSRM_MAX_CONCURRENT = 1;
const OSRM_MIN_DELAY_MS = 600;
const OSRM_RETRY_BACKOFF_MS = 1500;
const OSRM_MAX_RETRIES = 2;

const pulseStyle = `
  .bus-marker {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
  }
  .bus-marker::before {
    content: "";
    position: absolute;
    width: 40px;
    height: 40px;
    background-color: #008DA6;
    border-radius: 50%;
    animation: pulse 1.6s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.8); opacity: 0.1; }
    100% { transform: scale(1); opacity: 0.3; }
  }
`;

const busSVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16" fill="white" stroke="#e5e7eb" stroke-width="1" />
    <g transform="translate(6,8) scale(0.9)">
      <!-- Bus Body -->
      <rect x="2" y="6" width="20" height="12" rx="1" fill="#008DA6" stroke="#008DA6" stroke-width="1.5"/>
      <!-- Bus Windows -->
      <rect x="4" y="8" width="4" height="3" rx="0.5" fill="white"/>
      <rect x="9" y="8" width="4" height="3" rx="0.5" fill="white"/>
      <rect x="14" y="8" width="4" height="3" rx="0.5" fill="white"/>
      <!-- Bus Door -->
      <rect x="18" y="9" width="3" height="6" rx="0.5" fill="white"/>
      <!-- Bus Wheels -->
      <circle cx="7" cy="20" r="2.5" fill="#1a1a1a"/>
      <circle cx="17" cy="20" r="2.5" fill="#1a1a1a"/>
      <!-- Bus Front -->
      <rect x="22" y="8" width="2" height="10" fill="#008DA6"/>
    </g>
  </svg>
`);

const createBusIcon = (bearing = 0) => {
  // Ikon disetel menghadap kanan (0deg) agar konsisten
  return new L.DivIcon({
    html: `<img width="36" height="36" src="data:image/svg+xml,${busSVG}" style="display:block; transform: rotate(0deg); transform-origin: 50% 50%;" />`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});
};

const stopIconSVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="white" stroke="#10b981" stroke-width="2"/>
    <g transform="translate(8, 6)">
      <rect x="2" y="4" width="12" height="16" rx="1" fill="#10b981" stroke="#059669" stroke-width="1"/>
      <text x="8" y="16" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">H</text>
      <rect x="7" y="20" width="2" height="4" fill="#059669"/>
    </g>
  </svg>
`);

const stopIcon = new L.DivIcon({
  html: `<img src="data:image/svg+xml,${stopIconSVG}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const routePathCache = new Map(); // key -> { path: LatLng[], durationSec: number|null }
let osrmActive = 0;
const osrmQueue = [];

function scheduleNext() {
  if (osrmActive >= OSRM_MAX_CONCURRENT) return;
  const next = osrmQueue.shift();
  if (!next) return;
  osrmActive++;
  const { fn } = next;
  fn().finally(() => {
    setTimeout(() => {
      osrmActive = Math.max(0, osrmActive - 1);
      scheduleNext();
    }, OSRM_MIN_DELAY_MS);
  });
}

function enqueueOsrm(taskFn) {
  return new Promise((resolve, reject) => {
    osrmQueue.push({
      fn: () =>
        taskFn().then(resolve).catch(reject),
    });
    scheduleNext();
  });
}

function getRouteCoordinates(stops) {
  if (!stops || stops.length === 0) return [];
  return stops.map((stop) => [parseFloat(stop.latitude), parseFloat(stop.longitude)]);
}

function getRouteName(stops) {
  if (!stops || stops.length < 2) return "-";
  const firstStop = stops[0].stopName || stops[0].stop_name || "Unknown";
  const lastStop = stops[stops.length - 1].stopName || stops[stops.length - 1].stop_name || "Unknown";
  return `${firstStop} → ${lastStop}`;
}

function buildCacheKey(coords) {
  return JSON.stringify(
    coords.map(([lat, lng]) => [Number(lat.toFixed(5)), Number(lng.toFixed(5))])
  );
}

const toRadians = (deg) => (deg * Math.PI) / 180;
const toDegrees = (rad) => (rad * 180) / Math.PI;

const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371000;
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateBearing = ([lat1, lon1], [lat2, lon2]) => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const λ1 = toRadians(lon1);
  const λ2 = toRadians(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

const interpolateAlongPath = (path, progress) => {
  if (!path || path.length < 2) {
    return { position: path && path[0] ? path[0] : null, bearing: 0 };
  }
  const clamped = Math.min(Math.max(progress, 0), 1);
  if (clamped === 0) {
    return { position: path[0], bearing: calculateBearing(path[0], path[1]) };
  }
  if (clamped === 1) {
    const a = path[path.length - 2];
    const b = path[path.length - 1];
    return { position: b, bearing: calculateBearing(a, b) };
  }
  let total = 0;
  const segments = [];
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const dist = haversineDistance(start, end);
    segments.push({ start, end, dist });
    total += dist;
  }
  if (total === 0) return { position: path[0], bearing: 0 };
  const target = total * clamped;
  let acc = 0;
  for (const { start, end, dist } of segments) {
    if (dist === 0) continue;
    if (acc + dist >= target) {
      const remain = target - acc;
      const ratio = remain / dist;
      const lat = start[0] + (end[0] - start[0]) * ratio;
      const lng = start[1] + (end[1] - start[1]) * ratio;
      return { position: [lat, lng], bearing: calculateBearing(start, end) };
    }
    acc += dist;
  }
  const a = path[path.length - 2];
  const b = path[path.length - 1];
  return { position: b, bearing: calculateBearing(a, b) };
};

async function requestRouteFromOSRM(coordinates, signal) {
  const coordsString = coordinates.map((coord) => `${coord[1]},${coord[0]}`).join(";");
  // Use simplified overview to reduce payload and load
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=simplified&geometries=geojson&steps=false&alternatives=false&continue_straight=false`;

  let attempt = 0;
  const doFetch = async () => {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
    if (response.status === 429 && attempt < OSRM_MAX_RETRIES) {
      attempt++;
      await new Promise((r) => setTimeout(r, OSRM_RETRY_BACKOFF_MS * attempt));
      return doFetch();
    }
    if (!response.ok) {
      throw new Error(`OSRM routing failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      if (route.geometry && route.geometry.coordinates && route.geometry.coordinates.length > 0) {
        const path = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const durationSec = Number.isFinite(route.duration) ? route.duration : null;
        return { path, durationSec };
      }
    }
    throw new Error(`OSRM route unavailable: ${data.code || "unknown"}`);
  };

  // Rate-limit via queue
  return enqueueOsrm(doFetch);
}

const RoutePolyline = ({ stops, busId, onPathReady }) => {
  const [routePath, setRoutePath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // durationSec handled via cache/callback; no local state needed

  const coordinates = useMemo(() => getRouteCoordinates(stops), [stops]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadRoute() {
      setLoading(true);
      setError(false);

      const validCoordinates = coordinates.filter(
        (coord) =>
          coord &&
          typeof coord[0] === "number" &&
          typeof coord[1] === "number" &&
          !Number.isNaN(coord[0]) &&
          !Number.isNaN(coord[1]) &&
          coord[0] >= -90 &&
          coord[0] <= 90 &&
          coord[1] >= -180 &&
          coord[1] <= 180
      );

      if (validCoordinates.length < 2) {
        if (isMounted) {
          setRoutePath(validCoordinates);
          setLoading(false);
        }
        return;
      }

      const cacheKey = buildCacheKey(validCoordinates);
      if (routePathCache.has(cacheKey)) {
        if (isMounted) {
          const cached = routePathCache.get(cacheKey);
          setRoutePath(cached.path);
          setLoading(false);
        }
        if (onPathReady) onPathReady(busId, routePathCache.get(cacheKey));
        return;
      }

      try {
        const result = await requestRouteFromOSRM(validCoordinates, controller.signal);
        if (isMounted && result && result.path && result.path.length > 1) {
          routePathCache.set(cacheKey, result);
          setRoutePath(result.path);
          if (onPathReady) onPathReady(busId, result);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn(`OSRM routing fallback for bus ${busId}:`, err.message);
          if (isMounted) {
            setError(true);
            setRoutePath(validCoordinates);
            if (onPathReady) onPathReady(busId, { path: validCoordinates, durationSec: null });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRoute();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [coordinates, busId, onPathReady]);

  if (!stops || stops.length < 2) return null;

  if (loading) {
    if (!coordinates || coordinates.length < 2) return null;
    return (
      <Polyline
        key={`route-loading-${busId}`}
        positions={coordinates}
        color="#008DA6"
        weight={2}
        opacity={0.25}
        dashArray="6,6"
      />
    );
  }

  if (error || !routePath || routePath.length < 2) {
    return (
      <Polyline
        key={`route-fallback-${busId}`}
        positions={coordinates}
        color="#008DA6"
        weight={3}
        opacity={0.6}
        dashArray="4,8"
      />
    );
  }

  return (
    <Polyline
      key={`route-${busId}`}
      positions={routePath}
      color="#008DA6"
      weight={4}
      opacity={0.85}
      smoothFactor={1}
    />
  );
};

const FlyToBus = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 8, { duration: 1.5 });
    }
  }, [map, position]);
  return null;
};

const TrackingPage = () => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [rawBuses, setRawBuses] = useState([]);
  const [routePaths, setRoutePaths] = useState({}); // busId -> { path, durationSec }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const response = await getTrackingData();
      if (response.success && response.data) {
        setRawBuses(response.data);
        setError(null);
      } else {
        setRawBuses([]);
      }
    } catch (err) {
      console.error("Error fetching tracking data:", err);
      setError("Gagal memuat data tracking");
      setRawBuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), ANIMATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // helpers moved to module scope

  const normalizeDuration = (value) => {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_DURATION_MINUTES;
    return parsed;
  };

  const handlePathReady = React.useCallback((busId, routeInfo) => {
    setRoutePaths((prev) => ({ ...prev, [busId]: routeInfo }));
  }, []);

  const animatedBuses = React.useMemo(() => {
    return rawBuses.map((bus) => {
      const schedule = bus.schedule || {};
      const startMs = schedule.time ? new Date(schedule.time).getTime() : null;
      // Prefer schedule duration; fallback to OSRM route duration if present
      let durationMinutes = normalizeDuration(schedule.estimatedDurationMinutes);
      const routeInfo = routePaths[bus.busId];
      if ((!Number.isFinite(durationMinutes) || durationMinutes === DEFAULT_DURATION_MINUTES) && routeInfo && Number.isFinite(routeInfo.durationSec)) {
        const osrmMinutes = Math.max(1, Math.round(routeInfo.durationSec / 60));
        durationMinutes = osrmMinutes;
      }
      const durationMs = durationMinutes * 60 * 1000;
      let progress = 0;
      if (durationMs > 0) {
        const base = startMs ?? 0;
        const elapsed = (currentTime - base);
        const mod = ((elapsed % durationMs) + durationMs) % durationMs; // always positive
        progress = mod / durationMs;
      }
      const clamped = Math.min(Math.max(progress, 0), 1);
      // Ping-pong progress: 0 -> 1 (forward), then 1 -> 0 (backward)
      const pathProgress = clamped <= 0.5 ? clamped * 2 : (1 - clamped) * 2;
      const routeStops = bus.route?.stops || [];
      const defaultPath = getRouteCoordinates(routeStops);
      const effectivePath =
        (routeInfo && routeInfo.path && routeInfo.path.length > 1
          ? routeInfo.path
          : defaultPath) || [];
      const { position } = interpolateAlongPath(effectivePath, pathProgress);
      const fallbackPosition =
        bus.position || (effectivePath && effectivePath[0]) || null;
      const remainingMs =
        durationMs > 0
          ? durationMs * (1 - progress)
          : null;
      const remainingMinutes = remainingMs != null ? Math.max(0, Math.round(remainingMs / 60000)) : null;
      // Hitung kecepatan rata-rata (km/jam) berdasarkan panjang polyline dan durasi
      let totalMeters = 0;
      for (let i = 0; i < effectivePath.length - 1; i++) {
        totalMeters += haversineDistance(effectivePath[i], effectivePath[i + 1]);
      }
      const speedKmh =
        durationMinutes > 0 ? Math.round(((totalMeters / 1000) / (durationMinutes / 60)) * 10) / 10 : null;
      return {
        ...bus,
        position: position || fallbackPosition,
        // Ikon selalu menghadap kanan; tidak pakai bearing per-segmen
        bearing: 0,
        durationMinutes,
        progress: clamped,
        etaIso:
          startMs !== null && durationMs > 0
            ? new Date(startMs + durationMs).toISOString()
            : null,
        remainingMinutes,
        speedKmh,
      };
    });
  }, [rawBuses, routePaths, currentTime]);
  // Sinkronkan panel detail dengan data bus terbaru (ETA, sisa, kecepatan)
  useEffect(() => {
    if (!selectedBus) return;
    const updated = animatedBuses.find((b) => b.busId === selectedBus.busId);
    if (updated) setSelectedBus(updated);
  }, [animatedBuses, selectedBus]); 
  const getMapCenter = () => {
    if (animatedBuses.length === 0) return [-7.0, 110.0];
    const positions = animatedBuses.filter((b) => b.position).map((b) => b.position);
    if (positions.length === 0) return [-7.0, 110.0];
    const avgLat = positions.reduce((sum, p) => sum + p[0], 0) / positions.length;
    const avgLng = positions.reduce((sum, p) => sum + p[1], 0) / positions.length;
    return [avgLat, avgLng];
  };

  if (loading) {
    return (
      <div className="relative h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-textSecondary">Memuat data tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <style>{pulseStyle}</style>

      <MapContainer
        center={getMapCenter()}
        zoom={animatedBuses.length > 0 ? 8 : 6.5}
        scrollWheelZoom
        className="absolute inset-0 z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {animatedBuses
          .filter((bus) => bus.route && bus.route.stops && bus.route.stops.length >= 2)
          .map((bus) => (
            <RoutePolyline
              key={`route-polyline-${bus.busId}`}
              stops={bus.route.stops}
              busId={bus.busId}
              onPathReady={handlePathReady}
          />
        ))}

        {animatedBuses
          .filter((bus) => bus.route && bus.route.stops && bus.route.stops.length > 0)
          .map((bus) =>
            bus.route.stops.map((stop, idx) => (
              <Marker
                key={`stop-${bus.busId}-${stop.id || idx}`}
                position={[parseFloat(stop.latitude), parseFloat(stop.longitude)]}
                icon={stopIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-text mb-1">
                      {stop.stopName || stop.stop_name || "Halte"}
                    </p>
                    {stop.stopCode || stop.stop_code ? (
                      <p className="text-textSecondary font-mono text-xs mb-1">
                        {stop.stopCode || stop.stop_code}
                      </p>
                    ) : null}
                    <p className="text-textSecondary text-xs">
                      Urutan: {stop.sequence || idx + 1}
                    </p>
                    {bus.route && bus.route.routeName && (
                      <p className="text-textSecondary text-xs mt-1">
                        Rute: {bus.route.routeName}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))
          )}

        {animatedBuses
          .filter((bus) => bus.position)
          .map((bus) => (
          <Marker
              key={bus.busId}
            position={bus.position}
            icon={createBusIcon(0)}
            eventHandlers={{
              click: () => setSelectedBus(bus),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-text mb-1">{bus.bus}</p>
                {bus.route && (
                  <p className="text-textSecondary mb-1">
                    Rute: {bus.route.routeName || getRouteName(bus.route.stops)}
                  </p>
                )}
                {Number.isFinite(bus.speedKmh) && (
                  <p className="text-textSecondary">
                    Pergerakan: {bus.speedKmh} km/jam
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedBus && selectedBus.position && <FlyToBus position={selectedBus.position} />}
      </MapContainer>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-4xl">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-md rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-left">
          <h1 className="text-3xl font-bold text-text tracking-tight">
                Tracking Bus
          </h1>
          <p className="text-textSecondary mt-2 text-base">
                Lihat posisi bus dan halte. Klik ikon di peta untuk melihat detail.
              </p>
              {animatedBuses.length > 0 && (
                <p className="text-textSecondary mt-1 text-sm">
                  {animatedBuses.length} bus sedang beroperasi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedBus && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-lg">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg rounded-2xl p-6 animate-fadeIn transform transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-text">{selectedBus.bus}</h2>
              <button
                onClick={() => setSelectedBus(null)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-white hover:opacity-90 transition"
              >
                Tutup
              </button>
            </div>

            <div className="border-t border-gray-200 mb-3"></div>

            <div className="space-y-2 text-base text-textSecondary leading-relaxed">
              <p>
                <strong>Model:</strong> {selectedBus.model}
              </p>
              <p>
                <strong>Kapasitas:</strong> {selectedBus.capacity} penumpang
              </p>
              {selectedBus.route && (
                <>
                  <p>
                    <strong>Rute:</strong> {selectedBus.route.routeName || getRouteName(selectedBus.route.stops)}
                  </p>
                  {selectedBus.route.routeCode && (
                    <p>
                      <strong>Kode Rute:</strong> {selectedBus.route.routeCode}
                    </p>
                  )}
                  {selectedBus.route.stops && selectedBus.route.stops.length > 0 && (
                    <p>
                      <strong>Total Halte:</strong> {selectedBus.route.stops.length} halte
                    </p>
                  )}
                </>
              )}
              {selectedBus.driver && (
                <>
                  <p>
                    <strong>Supir:</strong> {selectedBus.driver.name}
                  </p>
                  {selectedBus.driver.contact && (
                    <p>
                      <strong>Kontak:</strong> {selectedBus.driver.contact}
                    </p>
                  )}
                </>
              )}
              {selectedBus.schedule && (
                <>
                  <p>
                    <strong>Jadwal:</strong> {new Date(selectedBus.schedule.time).toLocaleString("id-ID")}
                  </p>
                  {Number.isFinite(selectedBus.durationMinutes) && (
                    <p>
                      <strong>Durasi Estimasi:</strong> {selectedBus.durationMinutes} menit
                    </p>
                  )}
                  {selectedBus.etaIso && (
                    <p>
                      <strong>Estimasi Tiba:</strong>{" "}
                      {new Date(selectedBus.etaIso).toLocaleString("id-ID")}
                    </p>
                  )}
                  {Number.isFinite(selectedBus.remainingMinutes) && (
                    <p>
                      <strong>Sisa Waktu:</strong> {selectedBus.remainingMinutes} menit
                    </p>
                  )}
                  <p className="text-xs text-textSecondary">
                    Sumber estimasi: {selectedBus.schedule?.estimatedDurationMinutes ? "Jadwal (DB)" : "OSRM (fallback)"}
                  </p>
                </>
              )}
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    selectedBus.status === "Beroperasi" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {selectedBus.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;
