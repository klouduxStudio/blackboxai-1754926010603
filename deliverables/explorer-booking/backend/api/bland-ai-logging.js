// Bland AI Logging and Audit Trails API
// Handles logging of AI interactions, errors, and audit trails

const express = require('express');
const router = express.Router();

// Mock logs storage
let logs = [];

// POST /api/bland-ai/logs - Add a new log entry
router.post('/', (req, res) => {
  const logEntry = req.body;
  logEntry.id = 'log_' + Date.now();
  logEntry.timestamp = new Date().toISOString();
  logs.push(logEntry);
  res.status(201).json({ log: logEntry });
});

// GET /api/bland-ai/logs - Retrieve logs with optional filters
router.get('/', (req, res) => {
  const { type, startDate, endDate } = req.query;
  let filteredLogs = logs;

  if (type) {
    filteredLogs = filteredLogs.filter(log => log.type === type);
  }

  if (startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
  }

  if (endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
  }

  res.json({ logs: filteredLogs });
});

// DELETE /api/bland-ai/logs/:id - Delete a log entry
router.delete('/:id', (req, res) => {
  const index = logs.findIndex(log => log.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Log entry not found' });
  }
  logs.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
