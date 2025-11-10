# Modul Pembelajaran: Daftar Halte

## 📋 Daftar Isi
1. Overview
2. Arsitektur & Komunikasi API
3. Fungsionalitas Sistem
4. Dokumentasi API (Swagger)
5. Presentasi & Pemahaman Konsep
6. Testing & Validasi

---

## Overview

Halaman **Daftar Halte** menampilkan daftar halte yang dikelompokkan per rute, dengan kemampuan filter berdasarkan `routeId` dan pencarian teks. Halaman ini dapat dikunjungi langsung dari navbar atau melalui tombol pada detail rute.

Lokasi file:
- Frontend page: `frontend/src/pages/StopsPage.js`
- Gateway aggregator: `backend/gatewayservice/routes/gateway.js` (proxy/aggregator ke RouteService)

---

## Arsitektur & Komunikasi API

- Layanan utama: RouteService (sumber data rute dan stops) melalui API Gateway.
- Frontend hanya memanggil Gateway sebagai single entry point.

Alur data:
```
Frontend (StopsPage) → Gateway → RouteService (GET /api/routes/:id untuk ambil stops)
                                     ↳ bisa enumerate semua routes lalu fetch detail tiap route
```

Komunikasi dinamis:
- StopsPage pertama mengambil daftar rute, lalu memuat detail per rute (stops) untuk dirender terkelompok.

Metode REST yang digunakan (RouteService):
- GET (list/detail), POST, PUT/PATCH, DELETE untuk rute dan stops.

Integrasi lancar:
- Normalisasi koordinat (lat/lng) dan urutan `sequence` sebelum render.

---

## Fungsionalitas Sistem

- List halte terkelompok per rute, menampilkan `stopName`, `stopCode`, urutan, koordinat.
- Filter rute (dropdown/param `routeId`) dan pencarian teks.
- Tautan balik ke halaman “Daftar Rute”.

Stabilitas dan kecepatan:
- Ambil data berlapis (routes→stops) dengan Promise.all untuk efisiensi.

Tanpa error:
- Validasi data kosong; tampilkan pesan ramah pengguna.

Consumer (frontend):
- Menggunakan satu endpoint Gateway sebagai pintu tunggal akses data.

---

## Dokumentasi API (Swagger)

Akses:
- Gateway Swagger: `/api-docs`
- RouteService Swagger: `/api-docs` (CRUD routes & stops)

Pastikan dokumentasi memuat:
- GET `/api/routes`
- GET `/api/routes/:id` (mengembalikan `stops` urut `sequence`)
- POST/PUT/PATCH/DELETE untuk rute dan stops

Sertakan `openapi.json/.yaml` di repo atau hasil ekspor Swagger UI.

---

## Presentasi & Pemahaman Konsep

Jelaskan:
- Alasan grouping halte per rute untuk memudahkan browsing.
- Peran API Gateway vs langsung ke RouteService.
- Penanganan koordinat dan urutan halte (`sequence`) di UI.

---

## Testing & Validasi

1) Swagger: uji endpoint routes dan detail rute mengembalikan `stops` yang benar.
2) Frontend: buka `/stops`, coba filter routeId via querystring, lakukan pencarian.
3) Error handling: bila RouteService mati, UI tidak crash dan menampilkan state aman.

Checklist:
- [ ] Swagger `/api/routes/:id` mengembalikan `stops` urut
- [ ] Halaman menampilkan halte terkelompok per rute
- [ ] Filter route & search bekerja
- [ ] Navigasi ke/dari “Daftar Rute” berfungsi


