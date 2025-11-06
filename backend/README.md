# TransTrack Backend (Microservices)

Kumpulan service Express yang terhubung PostgreSQL dan terdokumentasi Swagger.

## Service yang tersedia

- RouteService (3000)
- DriverService (3001)
- UserService (3002)
- MaintenanceService (3003)
- TicketService (3004)

## Menjalankan semua service (via root)

Dari folder root monorepo:

```bash
npm run dev
```

Ini akan menjalankan semua service secara paralel. TicketService akan otomatis menjalankan migrasi tabel `tickets` saat start.

## Menjalankan salah satu service

```bash
cd backend/<nama-service>
npm install
cp env.example .env
npm run dev
```

Pastikan `.env` terisi koneksi PostgreSQL:

```env
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transtrack_db
DB_SSL=false
```

## Dependensi utama per service

- express, cors, dotenv
- pg, node-pg-migrate
- swagger-jsdoc, swagger-ui-express
- nodemon (dev)

## Membuat Provider/API Baru (contoh: PaymentService)

1) Buat folder baru: `backend/paymentservice/`

2) Buat file inti:

- `package.json` (sesuaikan skrip `start`, `dev`, dan dependensi di atas)
- `server.js` (Express app; daftarkan `/health`, `/api-docs`, dan router utama)
- `config/db.js` (Pool PostgreSQL)
- `config/swagger.js` (swaggerJsdoc setup)
- `routes/*.js` (endpoint bisnis)
- `env.example` (template ENV)
- `scripts/migrate.js` (buat tabel yang dibutuhkan)

3) Tambahkan ke root script supaya ikut jalan:

Di `package.json` root:

```json
{
  "scripts": {
    "dev:paymentservice": "cross-env PORT=3005 npm --prefix backend/paymentservice start",
    "dev": "concurrently \"...\" \"npm run dev:paymentservice\""
  }
}
```

4) Migrasi database

- Jalankan dari root: `npm run dev` (atau buat skrip `migrate:paymentservice` serupa TicketService)

5) Tambahkan dokumentasi Swagger

Gunakan JSDoc Swagger pada tiap route, contoh:

```js
/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: "Contoh endpoint"
 */
```

6) Uji endpoint di Swagger UI

`http://localhost:<port>/api-docs`

---

Tips:

- Gunakan parameterized queries (`$1, $2, ...`) untuk cegah SQL injection.
- Simpan secret di `.env`. Jangan commit `.env` ke repository.
- Pastikan setiap service punya `health` endpoint untuk diagnosa cepat.

