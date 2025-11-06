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

1) Buat folder: `backend/paymentservice/`

2) package.json

Contoh minimal (samakan versi dependensi dengan service lain):

```json
{
  "name": "paymentservice",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node scripts/migrate.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "node-pg-migrate": "^8.0.3",
    "pg": "^8.16.3",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": { "nodemon": "^3.0.2" }
}
```

3) Struktur file inti

- `server.js` (Express + swagger + routes)
- `config/db.js` (Pool PostgreSQL)
- `config/swagger.js` (swaggerJsdoc setup)
- `routes/*.js` (endpoint bisnis)
- `env.example` (PORT, DB_*)
- `scripts/migrate.js` (DDL tabel)

Contoh `server.js`:

```js
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes/payment');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.get('/health', (req,res)=>res.json({status:'OK',service:'PaymentService'}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/payment', routes);
app.listen(PORT, ()=>console.log(`PaymentService :${PORT}`));
```

Contoh `config/db.js`:

```js
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'transtrack_db',
  ssl: String(process.env.DB_SSL || 'false') === 'true' ? { rejectUnauthorized:false } : false
});
module.exports = { pool };
```

Contoh `config/swagger.js`:

```js
const swaggerJsdoc = require('swagger-jsdoc');
const options = { definition: { openapi:'3.0.0', info:{ title:'PaymentService', version:'1.0.0' } }, apis:['./routes/*.js'] };
module.exports = swaggerJsdoc(options);
```

Contoh `routes/payment.js` dengan Swagger JSDoc:

```js
const router = require('express').Router();
const { pool } = require('../config/db');
/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: "Contoh proses pembayaran"
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId: { type: string }
 *               amount: { type: number }
 *     responses:
 *       201:
 *         description: Dibuat
 */
router.post('/', async (req,res)=>{
  const { orderId, amount } = req.body;
  // contoh simpan ke DB
  await pool.query('SELECT 1');
  res.status(201).json({ success:true, message:'ok' });
});
module.exports = router;
```

4) `env.example`

```env
PORT=3005
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transtrack_db
DB_SSL=false
```

5) `scripts/migrate.js` (DDL)

```js
const { pool } = require('../config/db');
(async ()=>{
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await pool.query('CREATE TABLE IF NOT EXISTS payments (id uuid primary key default gen_random_uuid(), order_id text, amount numeric(12,2), created_at timestamptz default now());');
    console.log('Migration OK');
  } catch(e){ console.error(e); process.exit(1); } finally { await pool.end(); }
})();
```

6) Wire ke root monorepo

- `package.json` (root) → tambahkan skrip:

```json
{
  "scripts": {
    "dev:paymentservice": "cross-env PORT=3005 npm --prefix backend/paymentservice start",
    "dev": "concurrently \"...service lain...\" \"npm run dev:paymentservice\""
  }
}
```

Opsional: tambahkan `migrate:paymentservice` di root dan panggil dari `predev` jika perlu.

7) Jalankan & uji

```bash
npm run dev
# Swagger: http://localhost:3005/api-docs
```

---

Tips:

- Gunakan parameterized queries (`$1, $2, ...`) untuk cegah SQL injection.
- Simpan secret di `.env`. Jangan commit `.env` ke repository.
- Pastikan setiap service punya `health` endpoint untuk diagnosa cepat.

