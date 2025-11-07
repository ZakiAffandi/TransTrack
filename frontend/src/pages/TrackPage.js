import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const truckSVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16" fill="white" stroke="#e5e7eb" stroke-width="1" />
    <g transform="translate(8.2,8) scale(0.85)">
      <path stroke="#008DA6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M1 3h15v13H1zM16 8h5l2 5v3h-7zM5 18a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z" />
    </g>
  </svg>
`);

const BusIcon = new L.DivIcon({
  html: `<div class='bus-marker'><img src="data:image/svg+xml,${truckSVG}" /></div>`,
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Fungsi untuk posisi acak di antara dua titik
function randomPositionBetween(start, end, factor) {
  return [
    start[0] + (end[0] - start[0]) * factor,
    start[1] + (end[1] - start[1]) * factor,
  ];
}

// Data rute antar kota
const routes = [
  {
    id: 1,
    from: "Jakarta",
    to: "Bandung",
    start: [-6.2, 106.816],
    end: [-6.9175, 107.6191],
  },
  {
    id: 2,
    from: "Surabaya",
    to: "Malang",
    start: [-7.2504, 112.7688],
    end: [-7.9666, 112.6326],
  },
  {
    id: 3,
    from: "Semarang",
    to: "Yogyakarta",
    start: [-6.9667, 110.4167],
    end: [-7.7956, 110.3695],
  },
];

// Data bus statis di rute
const dummyBuses = [
  {
    id: 1,
    name: "Bus 01",
    plate: "B 1234 CD",
    driver: "Ahmad Yusuf",
    contact: "0812-3456-7890",
    route: routes[0],
    position: randomPositionBetween(routes[0].start, routes[0].end, 0.3),
  },
  {
    id: 2,
    name: "Bus 02",
    plate: "L 5678 EF",
    driver: "Budi Setiawan",
    contact: "0813-6543-2190",
    route: routes[1],
    position: randomPositionBetween(routes[1].start, routes[1].end, 0.6),
  },
  {
    id: 3,
    name: "Bus 03",
    plate: "H 9123 GH",
    driver: "Siti Nurhaliza",
    contact: "0812-9988-1122",
    route: routes[2],
    position: randomPositionBetween(routes[2].start, routes[2].end, 0.4),
  },
];

const FlyToBus = ({ position }) => {
  const map = useMap();
  if (position) map.flyTo(position, 8, { duration: 1.5 });
  return null;
};

const TrackingPage = () => {
  const [selectedBus, setSelectedBus] = useState(null);

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <style>{pulseStyle}</style>

      <MapContainer
        center={[-7.0, 110.0]}
        zoom={6.5}
        scrollWheelZoom={true}
        className="absolute inset-0 z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Garis antar kota */}
        {routes.map((r) => (
          <Polyline
            key={r.id}
            positions={[r.start, r.end]}
            color="#008DA6"
            weight={4}
            opacity={0.7}
          />
        ))}

        {/* Bus marker */}
        {dummyBuses.map((bus) => (
          <Marker
            key={bus.id}
            position={bus.position}
            icon={BusIcon}
            eventHandlers={{
              click: () => setSelectedBus(bus),
            }}
          />
        ))}

        {selectedBus && <FlyToBus position={selectedBus.position} />}
      </MapContainer>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-4xl">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-md rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-lg">
          <h1 className="text-3xl font-bold text-text tracking-tight">
            Tracking Bus Antar Kota
          </h1>
          <p className="text-textSecondary mt-2 text-base">
            Lihat posisi bus antar kota secara real-time. Klik ikon di peta
            untuk melihat detail bus.
          </p>
        </div>
      </div>

      {selectedBus && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-lg">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg rounded-2xl p-6 animate-fadeIn transform transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-text">
                {selectedBus.name}
              </h2>
              <button
                onClick={() => setSelectedBus(null)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-white hover:opacity-90 transition"
              >
                Tutup
              </button>
            </div>

            <div className="border-t border-gray-200 mb-3"></div>

            <div className="space-y-1 text-base text-textSecondary leading-relaxed">
              <p>
                <strong>Plat:</strong> {selectedBus.plate}
              </p>
              <p>
                <strong>Rute:</strong> {selectedBus.route.from} →{" "}
                {selectedBus.route.to}
              </p>
              <p>
                <strong>Supir:</strong> {selectedBus.driver}
              </p>
              <p>
                <strong>Kontak:</strong> {selectedBus.contact}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;
