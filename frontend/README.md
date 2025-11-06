# TransTrack Frontend (React + Tailwind)

Aplikasi React untuk penumpang: homepage, lacak bus, jadwal, beli tiket, dan akun.

## Color Palette (Tailwind Theme)

- Primary (Brand): `#008DA6`
- Secondary (Aksen/Tombol): `#FF7A59`
- Background: `#F8F8F8`
- Text Utama: `#333333`
- Text Sekunder: `#757575`

Konfigurasi ada di `tailwind.config.js` (extend colors) dan utility siap dipakai di seluruh komponen.

## Struktur Halaman

- `/` Home (informasi dan CTA)
- `/track` Lacak Bus (placeholder peta real-time)
- `/schedule` Jadwal (placeholder jadwal)
- `/ticket` Pembelian & Validasi Tiket (terintegrasi ke TicketService)
- `/account` Akun pengguna

Navbar menggunakan `react-router-dom` `NavLink`; state aktif diberi warna aksen.

## Menambah Halaman Baru

1) Buat file di `src/pages/YourPage.js`:

```jsx
export default function YourPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">Halaman Baru</div>
  );
}
```

2) Daftarkan route di `src/App.js`:

```jsx
import YourPage from './pages/YourPage';
// ...
<Routes>
  {/* routes lain */}
  <Route path="/your-page" element={<YourPage />} />
</Routes>
```

3) Tambah link di `src/components/Navbar.js` (array navItems):

```js
{ label: 'Your Page', to: '/your-page' }
```

## Integrasi API (Best Practice)

- Semua panggilan HTTP gunakan `src/services/apiService.js` agar terpusat.
- Base URL default: fallback otomatis ke `http://localhost:3002/api` bila ENV gateway kosong/8000.
- Tambahkan helper baru (contoh):

```js
export const getSomething = async () => {
  const res = await apiClient.get('/something');
  return res.data;
};
```

- Contoh pemakaian di komponen:

```js
import { getSomething } from '../services/apiService';

useEffect(() => {
  (async () => {
    const data = await getSomething();
    setState(data);
  })();
}, []);
```

## Jalankan Frontend Saja

```bash
cd frontend
npm install
npm start
```

Saat menjalankan monorepo dari root `npm run dev`, frontend otomatis di port `4000` dan membaca API lokal sesuai fallback/env.

