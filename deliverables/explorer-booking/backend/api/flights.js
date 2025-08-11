// Flights Backend API - Explorer Shack
// Handles flight product listing, details, availability, and booking

const express = require('express');
const router = express.Router();

// Mock flight data store
let flights = [
  {
    id: 'flight_001',
    airline: 'Emirates',
    flightNumber: 'EK202',
    departure: 'Dubai International Airport (DXB)',
    arrival: 'London Heathrow Airport (LHR)',
    departureTime: '2025-07-13T10:00:00',
    arrivalTime: '2025-07-13T14:00:00',
    price: 1500,
    rating: 4.7,
    reviews: 1200,
    amenities: ['In-flight WiFi', 'Entertainment', 'Meals'],
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400'
    ],
    cancellationPolicy: {
      type: 'moderate',
      details: {
        daysBefore: 7,
        refundPercent: 50
      }
    }
  },
  {
    id: 'flight_002',
    airline: 'Etihad Airways',
    flightNumber: 'EY101',
    departure: 'Abu Dhabi International Airport (AUH)',
    arrival: 'New York JFK Airport (JFK)',
    departureTime: '2025-07-14T08:00:00',
    arrivalTime: '2025-07-14T18:00:00',
    price: 2000,
    rating: 4.5,
    reviews: 900,
    amenities: ['In-flight WiFi', 'Premium Seating', 'Meals'],
    images: [
      'https://images.unsplash.com/photo-1526779259212-7a0b3a0a7a0b?w=400'
    ],
    cancellationPolicy: {
      type: 'strict',
      details: {
        daysBefore: 14,
        refundPercent: 25
      }
    }
  }
];

// GET /api/flights - List flights with optional filters
router.get('/', (req, res) => {
  const { from, to, minPrice, maxPrice, minRating } = req.query;

  let filteredFlights = flights;

  if (from) {
    filteredFlights = filteredFlights.filter(flight =>
      flight.departure.toLowerCase().includes(from.toLowerCase())
    );
  }

  if (to) {
    filteredFlights = filteredFlights.filter(flight =>
      flight.arrival.toLowerCase().includes(to.toLowerCase())
    );
  }

  if (minPrice) {
    filteredFlights = filteredFlights.filter(flight => flight.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filteredFlights = filteredFlights.filter(flight => flight.price <= parseFloat(maxPrice));
  }

  if (minRating) {
    filteredFlights = filteredFlights.filter(flight => flight.rating >= parseFloat(minRating));
  }

  res.json({ flights: filteredFlights });
});

// GET /api/flights/:id - Get flight details
router.get('/:id', (req, res) => {
  const flight = flights.find(f => f.id === req.params.id);
  if (!flight) {
    return res.status(404).json({ error: 'Flight not found' });
  }
  res.json({ flight });
});

// POST /api/flights/:id/availability - Check seat availability
router.post('/:id/availability', (req, res) => {
  const flight = flights.find(f => f.id === req.params.id);
  if (!flight) {
    return res.status(404).json({ error: 'Flight not found' });
  }

  const { seatClass, departureDate, passengers } = req.body;

  // For demo, assume all seats are available
  res.json({
    available: true,
    seatClass,
    price: flight.price,
    cancellationPolicy: flight.cancellationPolicy
  });
});

// POST /api/flights/:id/book - Book a flight
router.post('/:id/book', (req, res) => {
  const flight = flights.find(f => f.id === req.params.id);
  if (!flight) {
    return res.status(404).json({ error: 'Flight not found' });
  }

  const { seatClass, departureDate, passengers, customerInfo, paymentInfo } = req.body;

  // Validate inputs (simplified)
  if (!seatClass || !departureDate || !customerInfo || !paymentInfo) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  // For demo, assume booking is successful
  const bookingReference = 'BK' + Date.now();

  res.json({
    success: true,
    bookingReference,
    message: 'Flight booking confirmed'
  });
});

module.exports = router;
