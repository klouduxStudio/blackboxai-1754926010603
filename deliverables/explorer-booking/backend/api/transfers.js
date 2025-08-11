// Transfers Backend API - Explorer Shack
// Handles transfer product listing, details, availability, and booking

const express = require('express');
const router = express.Router();

// Mock transfer data store
let transfers = [
  {
    id: 'transfer_001',
    name: 'Airport to Downtown Transfer',
    description: 'Comfortable private transfer from airport to downtown',
    price: 100,
    rating: 4.8,
    reviews: 150,
    vehicleType: 'Sedan',
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    cancellationPolicy: {
      type: 'flexible',
      details: {
        daysBefore: 1,
        refundPercent: 100
      }
    }
  },
  {
    id: 'transfer_002',
    name: 'City to Airport Shuttle',
    description: 'Shared shuttle service from city to airport',
    price: 50,
    rating: 4.2,
    reviews: 80,
    vehicleType: 'Van',
    capacity: 10,
    image: 'https://images.unsplash.com/photo-1526779259212-7a0b3a0a7a0b?w=400',
    cancellationPolicy: {
      type: 'moderate',
      details: {
        daysBefore: 3,
        refundPercent: 50
      }
    }
  }
];

// GET /api/transfers - List transfers with optional filters
router.get('/', (req, res) => {
  const { pickupLocation, dropoffLocation, minPrice, maxPrice, minRating } = req.query;

  let filteredTransfers = transfers;

  if (pickupLocation) {
    filteredTransfers = filteredTransfers.filter(transfer =>
      transfer.description.toLowerCase().includes(pickupLocation.toLowerCase())
    );
  }

  if (dropoffLocation) {
    filteredTransfers = filteredTransfers.filter(transfer =>
      transfer.description.toLowerCase().includes(dropoffLocation.toLowerCase())
    );
  }

  if (minPrice) {
    filteredTransfers = filteredTransfers.filter(transfer => transfer.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filteredTransfers = filteredTransfers.filter(transfer => transfer.price <= parseFloat(maxPrice));
  }

  if (minRating) {
    filteredTransfers = filteredTransfers.filter(transfer => transfer.rating >= parseFloat(minRating));
  }

  res.json({ transfers: filteredTransfers });
});

// GET /api/transfers/:id - Get transfer details
router.get('/:id', (req, res) => {
  const transfer = transfers.find(t => t.id === req.params.id);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }
  res.json({ transfer });
});

// POST /api/transfers/:id/availability - Check availability
router.post('/:id/availability', (req, res) => {
  const transfer = transfers.find(t => t.id === req.params.id);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  const { pickupDate, passengers } = req.body;

  // For demo, assume all transfers are available
  res.json({
    available: true,
    price: transfer.price,
    cancellationPolicy: transfer.cancellationPolicy
  });
});

// POST /api/transfers/:id/book - Book a transfer
router.post('/:id/book', (req, res) => {
  const transfer = transfers.find(t => t.id === req.params.id);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  const { pickupDate, passengers, customerInfo, paymentInfo } = req.body;

  // Validate inputs (simplified)
  if (!pickupDate || !customerInfo || !paymentInfo) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  // For demo, assume booking is successful
  const bookingReference = 'BK' + Date.now();

  res.json({
    success: true,
    bookingReference,
    message: 'Transfer booking confirmed'
  });
});

module.exports = router;
