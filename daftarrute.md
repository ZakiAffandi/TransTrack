# Modul Pembelajaran: Daftar Rute

## 📋 Daftar Isi
1. Overview
2. Arsitektur & Komunikasi API
3. Fungsionalitas Sistem
4. Dokumentasi API (Swagger)
5. Presentasi & Pemahaman Konsep
6. Testing & Validasi

---

## Overview

Halaman **Daftar Rute** menampilkan kumpulan rute dalam bentuk kartu dengan ringkasan (nama, kode, total halte, status, estimasi durasi). Pengguna dapat membuka detail rute (stops, jadwal terkait, info bus) dan navigasi ke halaman “Daftar Halte” dengan filter `routeId`.

Lokasi file:
- Frontend page: `frontend/src/pages/RoutesPage.js`
- Gateway aggregator: `backend/gatewayservice/routes/gateway.js` (proxy/aggregator ke RouteService, BusService, ScheduleService)

---

## Arsitektur & Komunikasi API

- Lebih dari 2 layanan: RouteService, BusService, ScheduleService (min), melalui API Gateway.
- Frontend hanya memanggil Gateway: pola API Gateway diterapkan.

Alur data:
```
Frontend (RoutesPage) → Gateway → RouteService (GET /api/routes)
                                     ↳ BusService (opsional untuk info bus)
                                     ↳ ScheduleService (opsional: estimasi per rute)
```

Komunikasi dinamis:
- RoutesPage memanggil Gateway untuk mendapatkan daftar rute.
- Detail rute diambil saat user memilih kartu (lazy) dan dapat menyertakan jadwal/halte/bus terkait.

Metode REST yang digunakan:
- GET (list/detail), POST (buat rute), PUT/PATCH (ubah), DELETE (hapus) — tersedia di `RouteService`.

Integrasi lancar:
- Validasi dan normalisasi data di Gateway (mis. field nama, kode, jumlah stops).

---

## Fungsionalitas Sistem

- Card list rute (nama, kode, total halte, status).
- Pencarian cepat dan filter status.
- Modal detail rute: daftar halte, jadwal terkait, tombol navigasi ke “Daftar Halte” (query `routeId`).
- Performa: memuat list ringan, detail diambil on-demand.

Stabilitas dan kecepatan:
- Error handling ramah pengguna; indikator loading.
- Tidak ada polling agresif; data dimuat saat perlu.

Tanpa error:
- Validasi null/undefined di UI.
- Fallback deskriptif untuk data kosong.

Consumer (frontend):
- Mengkonsumsi satu endpoint Gateway untuk daftar dan detail rute.

---

## Dokumentasi API (Swagger)

Akses:
- Gateway Swagger: `/api-docs` (wajib tersedia)
- RouteService Swagger: `/api-docs` (CRUD routes & stops)

Pastikan endpoint berikut terdokumentasi jelas (parameter + contoh):
- GET `/api/routes`
- GET `/api/routes/:id`
- POST `/api/routes`
- PUT/PATCH `/api/routes/:id`
- DELETE `/api/routes/:id`

Sertakan spesifikasi OpenAPI (`openapi.json/.yaml`) di repo atau dapat diekspor dari Swagger UI.

---

## Presentasi & Pemahaman Konsep

Jelaskan:
- Peran API Gateway sebagai satu pintu untuk frontend.
- Dinamika integrasi data rute ↔ halte ↔ jadwal ↔ bus.
- Pertimbangan UX: ringkas di kartu, lengkap di modal, navigasi ke halaman halte.

---

## Testing & Validasi

1) Swagger: uji GET/POST/PUT/DELETE Routes di RouteService.
2) Frontend: buka `/routes`, cek pencarian, buka modal detail, klik ke “Daftar Halte”.
3) Error handling: matikan RouteService sementara; UI harus aman dan menampilkan pesan.

Checklist:
- [ ] Swagger `/api/routes` dapat diakses
- [ ] Kartu rute tampil dan dapat dicari/di-filter
- [ ] Modal detail memuat halte & jadwal
- [ ] Navigasi ke “Daftar Halte” bekerja (filter routeId)


