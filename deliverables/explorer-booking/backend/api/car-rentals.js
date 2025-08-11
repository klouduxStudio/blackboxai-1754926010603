// Car Rentals Backend API - Explorer Shack
// Handles car rental product listing, details, availability, and booking

const express = require('express');
const router = express.Router();

// Mock car rental data store
let cars = [
  {
    id: 'car_001',
    name: 'Kia Picanto or Similar',
    description: 'Compact car, ideal for city driving',
    pricePerDay: 54.66,
    rating: 3.0,
    reviews: 120,
    features: ['Automatic', 'Air Conditioning', '4 seats', '2 doors'],
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400',
    cancellationPolicy: {
      type: 'flexible',
      details: {
        daysBefore: 1,
        refundPercent: 100
      }
    }
  },
  {
    id: 'car_002',
    name: 'Suzuki Baleno or Similar',
    description: 'Economy car with great fuel efficiency',
    pricePerDay: 53.74,
    rating: 3.0,
    reviews: 95,
    features: ['Manual', 'Air Conditioning', '5 seats', '4 doors'],
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
    cancellationPolicy: {
      type: 'moderate',
      details: {
        daysBefore: 3,
        refundPercent: 50
      }
    }
  }
];

// GET /api/car-rentals - List cars with optional filters
router.get('/', (req, res) => {
  const { location, minPrice, maxPrice, minRating } = req.query;

  let filteredCars = cars;

  if (location) {
    filteredCars = filteredCars.filter(car =>
      car.description.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (minPrice) {
    filteredCars = filteredCars.filter(car => car.pricePerDay >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filteredCars = filteredCars.filter(car => car.pricePerDay <= parseFloat(maxPrice));
  }

  if (minRating) {
    filteredCars = filteredCars.filter(car => car.rating >= parseFloat(minRating));
  }

  res.json({ cars: filteredCars });
});

// GET /api/car-rentals/:id - Get car details
router.get('/:id', (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Car rental not found' });
  }
  res.json({ car });
});

// POST /api/car-rentals/:id/availability - Check availability
router.post('/:id/availability', (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Car rental not found' });
  }

  const { pickupDate, dropoffDate, driverAge } = req.body;

  // For demo, assume all cars are available
  res.json({
    available: true,
    pricePerDay: car.pricePerDay,
    cancellationPolicy: car.cancellationPolicy
  });
});

// POST /api/car-rentals/:id/book - Book a car rental
router.post('/:id/book', (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Car rental not found' });
  }

  const { pickupDate, dropoffDate, driverAge, customerInfo, paymentInfo } = req.body;

  // Validate inputs (simplified)
  if (!pickupDate || !dropoffDate || !customerInfo || !paymentInfo) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  // For demo, assume booking is successful
  const bookingReference = 'BK' + Date.now();

  res.json({
    success: true,
    bookingReference,
    message: 'Car rental booking confirmed'
  });
});

module.exports = router;
