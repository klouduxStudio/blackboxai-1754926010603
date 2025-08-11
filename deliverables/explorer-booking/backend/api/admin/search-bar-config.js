const express = require('express');
const router = express.Router();

// In-memory config store (replace with DB in production)
let searchBarConfig = {
  defaultSelectedTab: 'attractions',
  colors: {
    background: '#ffffff',
    primary: '#ef4444',
    secondary: '#1f2937',
    hover: '#f87171'
  },
  labels: {
    destinationPlaceholder: 'Where to?',
    checkInLabel: 'Check-in',
    guestsLabel: 'Guests',
    searchButtonLabel: 'Search'
  },
  icons: {
    attractions: 'fa-mountain',
    hotels: 'fa-bed',
    flights: 'fa-plane',
    transfers: 'fa-car',
    carRentals: 'fa-key'
  }
};

// GET search bar config
router.get('/', (req, res) => {
  res.json(searchBarConfig);
});

// POST update search bar config
router.post('/', (req, res) => {
  const newConfig = req.body;
  if (!newConfig) {
    return res.status(400).json({ error: 'Invalid config data' });
  }

  searchBarConfig = { ...searchBarConfig, ...newConfig };
  res.json({ message: 'Search bar config updated', config: searchBarConfig });
});

module.exports = router;
