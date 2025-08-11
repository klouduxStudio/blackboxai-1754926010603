// Bland AI Chat Backend API
// Handles chat session management and message processing

const express = require('express');
const router = express.Router();

// Mock session storage (in production, use Redis or database)
const activeSessions = new Map();
const chatHistory = new Map();

// Utility function for logging chat actions
const logChatAction = (action, data, error = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    data,
    error,
    id: 'chat_log_' + Date.now()
  };
  console.log('Bland AI Chat Log:', logEntry);
};

// Session validation middleware
const validateSession = (req, res, next) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ 
      error: 'Session ID is required',
      code: 'MISSING_SESSION_ID'
    });
  }
  
  if (!activeSessions.has(sessionId)) {
    return res.status(404).json({ 
      error: 'Session not found or expired',
      code: 'INVALID_SESSION'
    });
  }
  
  // Update session last activity
  const session = activeSessions.get(sessionId);
  session.lastActivity = new Date();
  activeSessions.set(sessionId, session);
  
  next();
};

// Message validation middleware
const validateMessage = (req, res, next) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Message is required and must be a non-empty string',
      code: 'INVALID_MESSAGE'
    });
  }
  
  if (message.length > 1000) {
    return res.status(400).json({ 
      error: 'Message too long. Maximum 1000 characters allowed',
      code: 'MESSAGE_TOO_LONG'
    });
  }
  
  next();
};

// Clean up expired sessions (run periodically)
const cleanupExpiredSessions = () => {
  const now = new Date();
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > sessionTimeout) {
      activeSessions.delete(sessionId);
      chatHistory.delete(sessionId);
      logChatAction('SESSION_EXPIRED', { sessionId });
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

// POST /api/bland-ai/chat/start-session
router.post('/start-session', async (req, res) => {
  try {
    const { userId, userAgent, language = 'en' } = req.body;
    
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const session = {
      id: sessionId,
      userId: userId || null,
      userAgent: userAgent || req.get('User-Agent'),
      language,
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      status: 'active'
    };
    
    activeSessions.set(sessionId, session);
    chatHistory.set(sessionId, []);
    
    logChatAction('SESSION_STARTED', { sessionId, userId, language });
    
    res.json({ 
      success: true,
      sessionId,
      message: 'Chat session started successfully',
      welcomeMessage: 'Hello! I\'m your AI assistant. How can I help you today?'
    });
  } catch (error) {
    logChatAction('SESSION_START_ERROR', req.body, error.message);
    res.status(500).json({ 
      error: 'Internal server error while starting session',
      code: 'SESSION_START_FAILED'
    });
  }
});

// POST /api/bland-ai/chat/message
router.post('/message', validateSession, validateMessage, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const session = activeSessions.get(sessionId);
    const history = chatHistory.get(sessionId) || [];
    
    // Add user message to history
    const userMessage = {
      id: 'msg_' + Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
      sessionId
    };
    
    history.push(userMessage);
    session.messageCount++;
    
    // Generate AI response based on message content and context
    const aiResponse = await generateAIResponse(message, history, session);
    
    const botMessage = {
      id: 'msg_' + (Date.now() + 1),
      type: 'bot',
      content: aiResponse,
      timestamp: new Date(),
      sessionId
    };
    
    history.push(botMessage);
    chatHistory.set(sessionId, history);
    activeSessions.set(sessionId, session);
    
    logChatAction('MESSAGE_PROCESSED', { 
      sessionId, 
      userMessage: message.substring(0, 100),
      responseLength: aiResponse.length 
    });
    
    res.json({ 
      success: true,
      reply: aiResponse,
      messageId: botMessage.id,
      sessionInfo: {
        messageCount: session.messageCount,
        sessionDuration: new Date() - session.createdAt
      }
    });
  } catch (error) {
    logChatAction('MESSAGE_ERROR', { sessionId: req.body.sessionId }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while processing message',
      code: 'MESSAGE_PROCESSING_FAILED'
    });
  }
});

// GET /api/bland-ai/chat/history/:sessionId - Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!activeSessions.has(sessionId)) {
      return res.status(404).json({ 
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    const history = chatHistory.get(sessionId) || [];
    const paginatedHistory = history.slice(offset, offset + parseInt(limit));
    
    logChatAction('HISTORY_RETRIEVED', { sessionId, count: paginatedHistory.length });
    
    res.json({ 
      success: true,
      messages: paginatedHistory,
      total: history.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logChatAction('HISTORY_ERROR', { sessionId: req.params.sessionId }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while retrieving history',
      code: 'HISTORY_RETRIEVAL_FAILED'
    });
  }
});

// DELETE /api/bland-ai/chat/session/:sessionId - End chat session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!activeSessions.has(sessionId)) {
      return res.status(404).json({ 
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    const session = activeSessions.get(sessionId);
    activeSessions.delete(sessionId);
    chatHistory.delete(sessionId);
    
    logChatAction('SESSION_ENDED', { 
      sessionId, 
      duration: new Date() - session.createdAt,
      messageCount: session.messageCount 
    });
    
    res.json({ 
      success: true,
      message: 'Session ended successfully',
      sessionSummary: {
        duration: new Date() - session.createdAt,
        messageCount: session.messageCount
      }
    });
  } catch (error) {
    logChatAction('SESSION_END_ERROR', { sessionId: req.params.sessionId }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while ending session',
      code: 'SESSION_END_FAILED'
    });
  }
});

// GET /api/bland-ai/chat/sessions - List active sessions (admin only)
router.get('/sessions', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const sessions = Array.from(activeSessions.values());
    const paginatedSessions = sessions.slice(offset, offset + parseInt(limit));
    
    logChatAction('SESSIONS_LISTED', { count: paginatedSessions.length });
    
    res.json({ 
      success: true,
      sessions: paginatedSessions.map(session => ({
        id: session.id,
        userId: session.userId,
        language: session.language,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        messageCount: session.messageCount,
        status: session.status
      })),
      total: sessions.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logChatAction('SESSIONS_LIST_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error while listing sessions',
      code: 'SESSIONS_LIST_FAILED'
    });
  }
});

// AI Response Generation Function
async function generateAIResponse(message, history, session) {
  const lowerMessage = message.toLowerCase();
  
  // Intent detection and response generation
  if (lowerMessage.includes('booking') || lowerMessage.includes('reservation')) {
    return generateBookingResponse(message, history);
  } else if (lowerMessage.includes('product') || lowerMessage.includes('tour') || lowerMessage.includes('activity')) {
    return generateProductResponse(message, history);
  } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
    return generateCancellationResponse(message, history);
  } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return generateHelpResponse(message, history);
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return generateGreetingResponse(message, history, session);
  } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with today?";
  } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return "Thank you for chatting with us! Have a wonderful day and we look forward to helping you with your next adventure!";
  } else {
    return generateGenericResponse(message, history);
  }
}

function generateBookingResponse(message, history) {
  const responses = [
    "I'd be happy to help you with your booking! Could you please provide me with your booking reference number?",
    "For booking assistance, I can help you check your reservation status, modify dates, or answer questions about your upcoming experience. What would you like to know?",
    "Let me assist you with your booking. Are you looking to make a new reservation or need help with an existing one?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateProductResponse(message, history) {
  const responses = [
    "I can help you find the perfect experience! What type of activity are you interested in? We offer desert safaris, city tours, water sports, and much more.",
    "Our products include amazing tours and activities in Dubai and the UAE. Are you looking for adventure activities, cultural experiences, or family-friendly tours?",
    "I'd love to help you discover our exciting offerings! What destination or type of experience interests you most?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateCancellationResponse(message, history) {
  return "I understand you need help with a cancellation or refund. Please provide your booking reference number, and I'll check our cancellation policy for your specific booking. Most of our experiences offer flexible cancellation options.";
}

function generateHelpResponse(message, history) {
  return "I'm here to help! I can assist you with:\n• Booking new experiences\n• Checking existing reservations\n• Product information and recommendations\n• Cancellation and refund policies\n• General questions about our services\n\nWhat would you like help with?";
}

function generateGreetingResponse(message, history, session) {
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  return `Good ${timeOfDay}! Welcome to Explorer Shack. I'm your AI assistant, ready to help you discover amazing experiences in Dubai and the UAE. How can I assist you today?`;
}

function generateGenericResponse(message, history) {
  const responses = [
    "Thank you for your message. I'm here to help you with bookings, product information, and any questions about our services. Could you please provide more details about what you're looking for?",
    "I'd be happy to assist you! Could you please clarify what you need help with? I can help with bookings, tour information, or general inquiries.",
    "I'm here to help make your experience with Explorer Shack amazing! Please let me know what specific information or assistance you need."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = router;
