import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🚌',
      title: 'Pelacakan Bus Real-time',
      description: 'Pantau posisi bus secara real-time dengan teknologi GPS dan WebSocket untuk update lokasi yang akurat dan cepat.'
    },
    {
      icon: '📅',
      title: 'Manajemen Jadwal & Rute',
      description: 'Kelola jadwal keberangkatan dan rute bus dengan mudah. Sistem otomatis mengoptimalkan waktu tempuh dan efisiensi rute.'
    },
    {
      icon: '🎫',
      title: 'Sistem Tiket Terintegrasi',
      description: 'Pembelian tiket yang seamless dengan integrasi sistem pembayaran. Dukungan untuk berbagai metode pembayaran modern.'
    },
    {
      icon: '🔔',
      title: 'Notifikasi & Peringatan',
      description: 'Dapatkan notifikasi real-time tentang kedatangan bus, delay, perubahan rute, dan informasi penting lainnya.'
    }
  ];

  return (
    <section className="features-section">
      <h2 className="section-title">Fitur Utama</h2>
      <p className="section-description">
        TransTrack API dilengkapi dengan fitur-fitur canggih untuk memberikan 
        pengalaman transportasi publik yang optimal.
      </p>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">{feature.icon}</span>
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;

