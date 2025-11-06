const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransTrack - TicketService API',
      version: '1.0.0',
      description: 'API untuk mengelola pembelian dan validasi tiket',
    },
  },
  apis: ['./routes/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;


