import React from 'react';
import { FiMapPin, FiCalendar, FiCreditCard, FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
      <Icon size={22} />
    </div>
    <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
    <p className="text-textSecondary leading-relaxed">{desc}</p>
  </div>
);

const Homepage = () => {
  return (
    <main>
      {/* Hero */}
      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="grid md:grid-cols-2 items-center gap-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-text leading-tight">
                Perjalanan Anda, Lebih Mudah dan Terprediksi
              </h1>
              <p className="mt-4 text-textSecondary text-base md:text-lg">
                Selamat datang di TransTrack. Lacak bus Anda secara real-time, beli tiket, dan cek jadwal, semua dalam satu genggaman.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/track"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-secondary text-white font-medium hover:opacity-95 transition-opacity"
                >
                  Mulai Lacak Sekarang
                </Link>
                <Link
                  to="/schedule"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
                >
                  Cari Rute Anda
                </Link>
              </div>
            </div>

            {/* Placeholder illustration block */}
            <div className="hidden md:block">
              <div className="aspect-[4/3] w-full rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                <span className="text-textSecondary">Ilustrasi penumpang (placeholder)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background" id="features">
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={FiMapPin}
              title="Lacak Lokasi Bus Langsung"
              desc="Lihat posisi bus Anda di peta secara live. Tak perlu lagi cemas menunggu di halte."
            />
            <FeatureCard
              icon={FiCalendar}
              title="Cek Jadwal Kapan Saja"
              desc="Dapatkan informasi jadwal kedatangan dan keberangkatan bus yang selalu ter-update."
            />
            <FeatureCard
              icon={FiCreditCard}
              title="Pembelian Tiket Anti Ribet"
              desc="Beli dan gunakan tiket digital Anda dengan mudah langsung dari aplikasi."
            />
            <FeatureCard
              icon={FiBell}
              title="Pengingat Perjalanan Cerdas"
              desc="Dapatkan notifikasi penting saat bus Anda akan tiba atau jika ada perubahan mendadak pada rute."
            />
          </div>
        </div>
      </section>

      {/* Halaman ini tidak memuat section lain; gunakan navigasi ke halaman terpisah */}
    </main>
  );
};

export default Homepage;

