const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const ticketsRouter = require('./routes/tickets');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'TicketService', pesan: 'Layanan berjalan dengan baik', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Dokumentasi API TicketService'
}));

app.use('/api/tickets', ticketsRouter);

app.get('/', (req, res) => {
  res.json({ pesan: 'TicketService API - TransTrack', documentation: '/api-docs', health: '/health' });
});

app.listen(PORT, () => {
  console.log(`TicketService berjalan pada port ${PORT}`);
  console.log(`Dokumentasi API tersedia di http://localhost:${PORT}/api-docs`);
  console.log(`Health check tersedia di http://localhost:${PORT}/health`);
});

module.exports = app;


