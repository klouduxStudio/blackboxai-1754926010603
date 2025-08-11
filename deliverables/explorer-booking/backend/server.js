const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import API routes
const blandAiRoutes = require('./api/bland-ai');
const blandAiChatRoutes = require('./api/bland-ai-chat');
const blandAiWebhookRoutes = require('./api/bland-ai-webhook');
const blandAiMultilanguageRoutes = require('./api/bland-ai-multilanguage');
const productsRoutes = require('./api/products');
const availabilityRoutes = require('./api/availability');
const reservationsRoutes = require('./api/reservations');
const bookingsRoutes = require('./api/bookings');
const hotelsRoutes = require('./api/hotels');
const carRentalsRoutes = require('./api/car-rentals');
const transfersRoutes = require('./api/transfers');
const testimonialsRoutes = require('./api/testimonials');
const searchBarConfigRoutes = require('./api/admin/search-bar-config');

// Register routes
app.use('/api/bland-ai', blandAiRoutes);
app.use('/api/bland-ai/chat', blandAiChatRoutes);
app.use('/api/bland-ai/webhook', blandAiWebhookRoutes);
app.use('/api/bland-ai/multilanguage', blandAiMultilanguageRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/car-rentals', carRentalsRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/admin/search-bar-config', searchBarConfigRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Explorer Shack backend server running on port ${PORT}`);
});

module.exports = app;
