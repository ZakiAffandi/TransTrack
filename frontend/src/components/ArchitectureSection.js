import React from 'react';
import './ArchitectureSection.css';

const ArchitectureSection = () => {
  const services = {
    gateway: {
      title: 'API Gateway',
      description: 'Pintu Gerbang Utama ke Semua Data',
      icon: '🚪',
      color: '#2563eb'
    },
    providers: [
      { name: 'Route Service', description: 'Manajemen Rute Bus', icon: '🗺️' },
      { name: 'Bus Service', description: 'Manajemen Data Bus', icon: '🚌' },
      { name: 'Driver Service', description: 'Manajemen Pengemudi', icon: '👨‍✈️' },
      { name: 'User Service', description: 'Manajemen Pengguna', icon: '👥' },
      { name: 'Maintenance Service', description: 'Manajemen Pemeliharaan', icon: '🔧' }
    ],
    integrators: [
      { name: 'Schedule Service', description: 'Penjadwalan Bus', icon: '📅' },
      { name: 'Tracking Service', description: 'Pelacakan Real-time', icon: '📍' },
      { name: 'Ticket Service', description: 'Sistem Tiket', icon: '🎫' },
      { name: 'Notification Service', description: 'Notifikasi & Peringatan', icon: '🔔' },
      { name: 'Analytics Service', description: 'Analisis Data', icon: '📊' }
    ]
  };

  return (
    <section className="architecture-section">
      <h2 className="section-title">Arsitektur Microservice</h2>
      <p className="section-description">
        TransTrack API terdiri dari 11 layanan independen yang bekerja bersama untuk 
        menyediakan solusi transportasi publik yang komprehensif.
      </p>

      <div className="architecture-grid">
        {/* API Gateway */}
        <div className="gateway-card">
          <div className="gateway-icon">{services.gateway.icon}</div>
          <h3 className="gateway-title">{services.gateway.title}</h3>
          <p className="gateway-description">{services.gateway.description}</p>
        </div>

        {/* Provider Services */}
        <div className="services-group">
          <h3 className="group-title">
            <span className="group-icon">📦</span>
            Layanan Provider
          </h3>
          <p className="group-subtitle">Sumber Data Master Penting</p>
          <div className="services-list">
            {services.providers.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <div className="service-info">
                  <h4 className="service-name">{service.name}</h4>
                  <p className="service-desc">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrator Services */}
        <div className="services-group">
          <h3 className="group-title">
            <span className="group-icon">🧠</span>
            Layanan Integrator
          </h3>
          <p className="group-subtitle">Otak di Balik Logika Bisnis</p>
          <div className="services-list">
            {services.integrators.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <div className="service-info">
                  <h4 className="service-name">{service.name}</h4>
                  <p className="service-desc">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;

