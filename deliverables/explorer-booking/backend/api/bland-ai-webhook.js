// Bland AI Webhook Integration API
// Handles inbound webhook events from Bland AI and triggers appropriate actions

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Mock webhook storage for tracking events
const webhookEvents = [];
const webhookSettings = {
  secretKey: process.env.BLAND_AI_WEBHOOK_SECRET || 'default_secret_key',
  enabledEvents: ['call_started', 'call_ended', 'pathway_completed', 'user_feedback', 'error_occurred'],
  retryAttempts: 3,
  timeoutMs: 30000
};

// Utility function for logging webhook actions
const logWebhookAction = (action, data, error = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    data,
    error,
    id: 'webhook_log_' + Date.now()
  };
  console.log('Bland AI Webhook Log:', logEntry);
};

// Webhook signature verification middleware
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.get('X-Bland-Signature');
  const timestamp = req.get('X-Bland-Timestamp');
  
  if (!signature || !timestamp) {
    logWebhookAction('SIGNATURE_MISSING', { headers: req.headers });
    return res.status(401).json({ 
      error: 'Missing webhook signature or timestamp',
      code: 'MISSING_SIGNATURE'
    });
  }

  // Verify timestamp is within 5 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  const webhookTime = parseInt(timestamp);
  
  if (Math.abs(currentTime - webhookTime) > 300) {
    logWebhookAction('TIMESTAMP_INVALID', { currentTime, webhookTime });
    return res.status(401).json({ 
      error: 'Webhook timestamp too old',
      code: 'TIMESTAMP_INVALID'
    });
  }

  // Verify signature
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSettings.secretKey)
    .update(timestamp + payload)
    .digest('hex');

  if (signature !== `sha256=${expectedSignature}`) {
    logWebhookAction('SIGNATURE_INVALID', { received: signature, expected: `sha256=${expectedSignature}` });
    return res.status(401).json({ 
      error: 'Invalid webhook signature',
      code: 'SIGNATURE_INVALID'
    });
  }

  next();
};

// Event validation middleware
const validateWebhookEvent = (req, res, next) => {
  const event = req.body;

  if (!event || typeof event !== 'object') {
    return res.status(400).json({ 
      error: 'Invalid webhook payload',
      code: 'INVALID_PAYLOAD'
    });
  }

  if (!event.type || typeof event.type !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid event type',
      code: 'INVALID_EVENT_TYPE'
    });
  }

  if (!webhookSettings.enabledEvents.includes(event.type)) {
    return res.status(400).json({ 
      error: `Event type '${event.type}' is not enabled`,
      code: 'EVENT_TYPE_DISABLED'
    });
  }

  if (!event.data || typeof event.data !== 'object') {
    return res.status(400).json({ 
      error: 'Missing or invalid event data',
      code: 'INVALID_EVENT_DATA'
    });
  }

  // Add event ID if not present
  if (!event.id) {
    event.id = 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  next();
};

// POST /api/bland-ai/webhook - Main webhook endpoint
router.post('/', verifyWebhookSignature, validateWebhookEvent, async (req, res) => {
  try {
    const event = req.body;
    const eventId = event.id;

    // Check for duplicate events
    const existingEvent = webhookEvents.find(e => e.id === eventId);
    if (existingEvent) {
      logWebhookAction('DUPLICATE_EVENT', { eventId, type: event.type });
      return res.status(200).json({ 
        success: true, 
        message: 'Event already processed',
        eventId 
      });
    }

    // Store event for tracking
    const webhookEvent = {
      id: eventId,
      type: event.type,
      data: event.data,
      receivedAt: new Date(),
      processed: false,
      attempts: 0,
      lastError: null
    };

    webhookEvents.push(webhookEvent);

    // Process event based on type
    let processingResult;
    switch (event.type) {
      case 'call_started':
        processingResult = await handleCallStarted(event.data, eventId);
        break;
      case 'call_ended':
        processingResult = await handleCallEnded(event.data, eventId);
        break;
      case 'pathway_completed':
        processingResult = await handlePathwayCompleted(event.data, eventId);
        break;
      case 'user_feedback':
        processingResult = await handleUserFeedback(event.data, eventId);
        break;
      case 'error_occurred':
        processingResult = await handleErrorOccurred(event.data, eventId);
        break;
      default:
        logWebhookAction('UNHANDLED_EVENT_TYPE', { type: event.type, eventId });
        processingResult = { success: false, error: 'Unhandled event type' };
    }

    // Update event status
    webhookEvent.processed = processingResult.success;
    webhookEvent.attempts = 1;
    webhookEvent.lastError = processingResult.error || null;
    webhookEvent.processedAt = new Date();

    logWebhookAction('EVENT_PROCESSED', { 
      eventId, 
      type: event.type, 
      success: processingResult.success 
    });

    res.status(200).json({ 
      success: true,
      eventId,
      message: 'Webhook event processed successfully',
      processingResult
    });

  } catch (error) {
    logWebhookAction('WEBHOOK_ERROR', { eventId: req.body.id }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while processing webhook',
      code: 'PROCESSING_FAILED'
    });
  }
});

// GET /api/bland-ai/webhook/events - List webhook events (admin only)
router.get('/events', async (req, res) => {
  try {
    const { type, processed, limit = 50, offset = 0 } = req.query;
    let filteredEvents = webhookEvents;

    if (type) {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }

    if (processed !== undefined) {
      const isProcessed = processed === 'true';
      filteredEvents = filteredEvents.filter(e => e.processed === isProcessed);
    }

    const paginatedEvents = filteredEvents
      .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
      .slice(offset, offset + parseInt(limit));

    logWebhookAction('EVENTS_LISTED', { count: paginatedEvents.length });

    res.json({
      success: true,
      events: paginatedEvents,
      total: filteredEvents.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logWebhookAction('EVENTS_LIST_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error while listing events',
      code: 'EVENTS_LIST_FAILED'
    });
  }
});

// GET /api/bland-ai/webhook/settings - Get webhook settings
router.get('/settings', async (req, res) => {
  try {
    logWebhookAction('SETTINGS_RETRIEVED', null);
    
    res.json({
      success: true,
      settings: {
        enabledEvents: webhookSettings.enabledEvents,
        retryAttempts: webhookSettings.retryAttempts,
        timeoutMs: webhookSettings.timeoutMs,
        hasSecretKey: !!webhookSettings.secretKey
      }
    });
  } catch (error) {
    logWebhookAction('SETTINGS_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error while retrieving settings',
      code: 'SETTINGS_RETRIEVAL_FAILED'
    });
  }
});

// POST /api/bland-ai/webhook/settings - Update webhook settings
router.post('/settings', async (req, res) => {
  try {
    const { enabledEvents, retryAttempts, timeoutMs, secretKey } = req.body;

    if (enabledEvents && Array.isArray(enabledEvents)) {
      webhookSettings.enabledEvents = enabledEvents;
    }

    if (retryAttempts && typeof retryAttempts === 'number' && retryAttempts > 0) {
      webhookSettings.retryAttempts = retryAttempts;
    }

    if (timeoutMs && typeof timeoutMs === 'number' && timeoutMs > 0) {
      webhookSettings.timeoutMs = timeoutMs;
    }

    if (secretKey && typeof secretKey === 'string') {
      webhookSettings.secretKey = secretKey;
    }

    logWebhookAction('SETTINGS_UPDATED', req.body);

    res.json({
      success: true,
      message: 'Webhook settings updated successfully',
      settings: {
        enabledEvents: webhookSettings.enabledEvents,
        retryAttempts: webhookSettings.retryAttempts,
        timeoutMs: webhookSettings.timeoutMs,
        hasSecretKey: !!webhookSettings.secretKey
      }
    });
  } catch (error) {
    logWebhookAction('SETTINGS_UPDATE_ERROR', req.body, error.message);
    res.status(500).json({ 
      error: 'Internal server error while updating settings',
      code: 'SETTINGS_UPDATE_FAILED'
    });
  }
});

// Event handler functions
async function handleCallStarted(data, eventId) {
  try {
    logWebhookAction('CALL_STARTED', { eventId, callId: data.callId });
    
    // Update call status in database
    // Notify real-time dashboard
    // Send notifications to relevant users
    
    return { success: true, message: 'Call started event processed' };
  } catch (error) {
    logWebhookAction('CALL_STARTED_ERROR', { eventId }, error.message);
    return { success: false, error: error.message };
  }
}

async function handleCallEnded(data, eventId) {
  try {
    logWebhookAction('CALL_ENDED', { 
      eventId, 
      callId: data.callId, 
      duration: data.duration,
      status: data.status 
    });
    
    // Update call status and metrics
    // Calculate call analytics
    // Trigger follow-up actions if needed
    
    return { success: true, message: 'Call ended event processed' };
  } catch (error) {
    logWebhookAction('CALL_ENDED_ERROR', { eventId }, error.message);
    return { success: false, error: error.message };
  }
}

async function handlePathwayCompleted(data, eventId) {
  try {
    logWebhookAction('PATHWAY_COMPLETED', { 
      eventId, 
      pathwayId: data.pathwayId,
      outcome: data.outcome 
    });
    
    // Update pathway analytics
    // Log completion metrics
    // Trigger any post-completion workflows
    
    return { success: true, message: 'Pathway completed event processed' };
  } catch (error) {
    logWebhookAction('PATHWAY_COMPLETED_ERROR', { eventId }, error.message);
    return { success: false, error: error.message };
  }
}

async function handleUserFeedback(data, eventId) {
  try {
    logWebhookAction('USER_FEEDBACK', { 
      eventId, 
      rating: data.rating,
      hasComment: !!data.comment 
    });
    
    // Store feedback in database
    // Update satisfaction metrics
    // Notify relevant team members
    
    return { success: true, message: 'User feedback event processed' };
  } catch (error) {
    logWebhookAction('USER_FEEDBACK_ERROR', { eventId }, error.message);
    return { success: false, error: error.message };
  }
}

async function handleErrorOccurred(data, eventId) {
  try {
    logWebhookAction('ERROR_OCCURRED', { 
      eventId, 
      errorType: data.errorType,
      severity: data.severity 
    });
    
    // Log error details
    // Alert monitoring systems
    // Trigger error recovery procedures if applicable
    
    return { success: true, message: 'Error event processed' };
  } catch (error) {
    logWebhookAction('ERROR_OCCURRED_ERROR', { eventId }, error.message);
    return { success: false, error: error.message };
  }
}

// Cleanup old webhook events (run periodically)
const cleanupOldEvents = () => {
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const initialCount = webhookEvents.length;
  
  for (let i = webhookEvents.length - 1; i >= 0; i--) {
    if (new Date(webhookEvents[i].receivedAt) < cutoffDate) {
      webhookEvents.splice(i, 1);
    }
  }
  
  const removedCount = initialCount - webhookEvents.length;
  if (removedCount > 0) {
    logWebhookAction('EVENTS_CLEANUP', { removedCount, remainingCount: webhookEvents.length });
  }
};

// Run cleanup daily
setInterval(cleanupOldEvents, 24 * 60 * 60 * 1000);

module.exports = router;
