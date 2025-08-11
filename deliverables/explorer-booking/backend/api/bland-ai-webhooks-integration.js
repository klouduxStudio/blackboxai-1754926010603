// Bland AI Webhooks Integration API
// Handles inbound webhook events from Bland AI and triggers appropriate actions

const express = require('express');
const router = express.Router();

// POST /api/bland-ai/webhooks
router.post('/', async (req, res) => {
  try {
    const event = req.body;

    // Validate event structure
    if (!event || !event.type) {
      return res.status(400).json({ error: 'Invalid webhook event' });
    }

    // Handle different event types
    switch (event.type) {
      case 'call_started':
        await handleCallStarted(event.data);
        break;
      case 'call_ended':
        await handleCallEnded(event.data);
        break;
      case 'pathway_completed':
        await handlePathwayCompleted(event.data);
        break;
      case 'user_feedback':
        await handleUserFeedback(event.data);
        break;
      default:
        console.warn('Unhandled Bland AI webhook event type:', event.type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing Bland AI webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handleCallStarted(data) {
  // Log call start, update call status, notify admin UI, etc.
  console.log('Call started:', data);
}

async function handleCallEnded(data) {
  // Log call end, update call status, notify admin UI, etc.
  console.log('Call ended:', data);
}

async function handlePathwayCompleted(data) {
  // Log pathway completion, update analytics, notify admin UI, etc.
  console.log('Pathway completed:', data);
}

async function handleUserFeedback(data) {
  // Process user feedback, store in database, notify admin UI, etc.
  console.log('User feedback received:', data);
}

module.exports = router;
