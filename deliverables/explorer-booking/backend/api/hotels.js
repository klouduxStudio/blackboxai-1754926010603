// Hotels Backend API - Explorer Shack
// Handles hotel product listing, details, availability, and booking

const express = require('express');
const router = express.Router();

// Mock hotel data store
let hotels = [
  {
    id: 'hotel_001',
    name: 'Grand Palace Hotel Paris',
    location: 'Paris, France',
    price: 250,
    rating: 4.5,
    reviews: 2341,
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    roomTypes: [
      { id: 'standard', name: 'Standard Room', price: 250, capacity: 2 },
      { id: 'deluxe', name: 'Deluxe Room', price: 350, capacity: 2 },
      { id: 'suite', name: 'Executive Suite', price: 550, capacity: 4 }
    ],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400'
    ],
    cancellationPolicy: {
      type: 'custom',
      details: {
        daysBefore: 3,
        refundPercent: 80
      }
    }
  },
  {
    id: 'hotel_002',
    name: 'Tokyo Bay Resort',
    location: 'Tokyo, Japan',
    price: 180,
    rating: 4.6,
    reviews: 1876,
    amenities: ['Ocean View', 'Free WiFi', 'Restaurant', 'Bar', 'Concierge'],
    roomTypes: [
      { id: 'city', name: 'City View Room', price: 180, capacity: 2 },
      { id: 'ocean', name: 'Ocean View Room', price: 280, capacity: 2 },
      { id: 'suite', name: 'Ocean Suite', price: 450, capacity: 4 }
    ],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
    ],
    cancellationPolicy: {
      type: 'flexible',
      details: {
        daysBefore: 1,
        refundPercent: 100
      }
    }
  }
];

// GET /api/hotels - List hotels with optional filters
router.get('/', (req, res) => {
  const { city, minPrice, maxPrice, minRating } = req.query;

  let filteredHotels = hotels;

  if (city) {
    filteredHotels = filteredHotels.filter(hotel =>
      hotel.location.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (minPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price <= parseFloat(maxPrice));
  }

  if (minRating) {
    filteredHotels = filteredHotels.filter(hotel => hotel.rating >= parseFloat(minRating));
  }

  res.json({ hotels: filteredHotels });
});

// GET /api/hotels/:id - Get hotel details
router.get('/:id', (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);
  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found' });
  }
  res.json({ hotel });
});

// POST /api/hotels/:id/availability - Check room availability
router.post('/:id/availability', (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);
  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found' });
  }

  const { roomTypeId, checkInDate, checkOutDate, guests } = req.body;

  // For demo, assume all rooms are available
  const roomType = hotel.roomTypes.find(rt => rt.id === roomTypeId);
  if (!roomType) {
    return res.status(400).json({ error: 'Invalid room type' });
  }

  // Simple capacity check
  if (guests > roomType.capacity) {
    return res.status(400).json({ error: 'Guest count exceeds room capacity' });
  }

  res.json({
    available: true,
    roomType,
    price: roomType.price,
    cancellationPolicy: hotel.cancellationPolicy
  });
});

// POST /api/hotels/:id/book - Book a hotel room
router.post('/:id/book', (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);
  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found' });
  }

  const { roomTypeId, checkInDate, checkOutDate, guests, customerInfo, paymentInfo } = req.body;

  // Validate inputs (simplified)
  if (!roomTypeId || !checkInDate || !checkOutDate || !customerInfo || !paymentInfo) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  // For demo, assume booking is successful
  const bookingReference = 'BK' + Date.now();

  res.json({
    success: true,
    bookingReference,
    message: 'Hotel booking confirmed'
  });
});

module.exports = router;
