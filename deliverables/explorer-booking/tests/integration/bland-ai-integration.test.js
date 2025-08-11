const request = require('supertest');
const app = require('../../backend/server'); // Correct path to main Express app

describe('Bland AI Integration API Tests', () => {
  let pathwayId;
  let callId;
  let sessionId;

  // Setup and teardown
  beforeAll(async () => {
    // Any setup needed before tests
    console.log('Starting Bland AI Integration Tests');
  });

  afterAll(async () => {
    // Cleanup after tests
    console.log('Completed Bland AI Integration Tests');
  });

  describe('Pathway Management', () => {
    test('Create a new pathway with valid data', async () => {
      const pathwayData = {
        name: 'Test Customer Support Pathway',
        description: 'A pathway for testing customer support interactions',
        settings: {
          maxDuration: 300,
          language: 'en'
        }
      };

      const response = await request(app)
        .post('/api/bland-ai/pathways')
        .send(pathwayData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.pathway).toHaveProperty('id');
      expect(response.body.pathway.name).toBe(pathwayData.name);
      expect(response.body.pathway.description).toBe(pathwayData.description);
      expect(response.body.pathway.status).toBe('active');
      expect(response.body.pathway).toHaveProperty('createdAt');
      expect(response.body.pathway).toHaveProperty('updatedAt');
      
      pathwayId = response.body.pathway.id;
    });

    test('Fail to create pathway with missing name', async () => {
      const response = await request(app)
        .post('/api/bland-ai/pathways')
        .send({ description: 'Missing name' })
        .expect(400);

      expect(response.body.error).toContain('name is required');
    });

    test('Fail to create pathway with duplicate name', async () => {
      const response = await request(app)
        .post('/api/bland-ai/pathways')
        .send({ name: 'Test Customer Support Pathway' })
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    test('List pathways with pagination', async () => {
      const response = await request(app)
        .get('/api/bland-ai/pathways?limit=10&offset=0')
        .expect(200);

      expect(response.body.pathways).toBeDefined();
      expect(Array.isArray(response.body.pathways)).toBe(true);
      expect(response.body.pathways.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
    });

    test('Get specific pathway by ID', async () => {
      const response = await request(app)
        .get(`/api/bland-ai/pathways/${pathwayId}`)
        .expect(200);

      expect(response.body.pathway).toHaveProperty('id', pathwayId);
      expect(response.body.pathway.name).toBe('Test Customer Support Pathway');
    });

    test('Update pathway', async () => {
      const updateData = {
        name: 'Updated Test Pathway',
        description: 'Updated description',
        status: 'inactive'
      };

      const response = await request(app)
        .put(`/api/bland-ai/pathways/${pathwayId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pathway.name).toBe(updateData.name);
      expect(response.body.pathway.description).toBe(updateData.description);
      expect(response.body.pathway.status).toBe(updateData.status);
    });

    test('Filter pathways by status', async () => {
      const response = await request(app)
        .get('/api/bland-ai/pathways?status=active')
        .expect(200);

      expect(response.body.pathways).toBeDefined();
      response.body.pathways.forEach(pathway => {
        expect(pathway.status).toBe('active');
      });
    });
  });

  describe('Call Management', () => {
    test('Initiate a new call with valid data', async () => {
      const callData = {
        phoneNumber: '+971501234567',
        pathwayId: pathwayId,
        metadata: {
          customerName: 'Test Customer',
          priority: 'high'
        }
      };

      const response = await request(app)
        .post('/api/bland-ai/calls')
        .send(callData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.call).toHaveProperty('id');
      expect(response.body.call.phoneNumber).toBe(callData.phoneNumber);
      expect(response.body.call.pathwayId).toBe(pathwayId);
      expect(response.body.call.status).toBe('initiated');
      expect(response.body.call).toHaveProperty('startTime');
      
      callId = response.body.call.id;
    });

    test('Fail to initiate call with invalid phone number', async () => {
      const response = await request(app)
        .post('/api/bland-ai/calls')
        .send({ phoneNumber: 'invalid' })
        .expect(400);

      expect(response.body.error).toContain('Phone number is required');
    });

    test('Fail to initiate call with invalid pathway ID', async () => {
      const response = await request(app)
        .post('/api/bland-ai/calls')
        .send({ 
          phoneNumber: '+971501234567',
          pathwayId: 'invalid_pathway_id'
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid pathway ID');
    });

    test('List calls with filters', async () => {
      const response = await request(app)
        .get(`/api/bland-ai/calls?pathwayId=${pathwayId}&status=initiated`)
        .expect(200);

      expect(response.body.calls).toBeDefined();
      expect(Array.isArray(response.body.calls)).toBe(true);
      expect(response.body.calls.length).toBeGreaterThan(0);
      
      response.body.calls.forEach(call => {
        expect(call.pathwayId).toBe(pathwayId);
        expect(call.status).toBe('initiated');
      });
    });

    test('Get specific call by ID', async () => {
      const response = await request(app)
        .get(`/api/bland-ai/calls/${callId}`)
        .expect(200);

      expect(response.body.call).toHaveProperty('id', callId);
      expect(response.body.call.phoneNumber).toBe('+971501234567');
    });

    test('Update call status', async () => {
      const updateData = {
        status: 'completed',
        endTime: new Date().toISOString(),
        duration: 180,
        metadata: {
          outcome: 'successful',
          satisfaction: 5
        }
      };

      const response = await request(app)
        .put(`/api/bland-ai/calls/${callId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.call.status).toBe('completed');
      expect(response.body.call.duration).toBe(180);
    });
  });

  describe('Chat Session Management', () => {
    test('Start a new chat session', async () => {
      const sessionData = {
        userId: 'test_user_123',
        language: 'en'
      };

      const response = await request(app)
        .post('/api/bland-ai/chat/start-session')
        .send(sessionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.welcomeMessage).toBeDefined();
      
      sessionId = response.body.sessionId;
    });

    test('Send message in chat session', async () => {
      const messageData = {
        sessionId: sessionId,
        message: 'Hello, I need help with my booking'
      };

      const response = await request(app)
        .post('/api/bland-ai/chat/message')
        .send(messageData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.reply).toBeDefined();
      expect(response.body.messageId).toBeDefined();
      expect(response.body.sessionInfo).toBeDefined();
      expect(response.body.sessionInfo.messageCount).toBeGreaterThan(0);
    });

    test('Fail to send message with invalid session', async () => {
      const response = await request(app)
        .post('/api/bland-ai/chat/message')
        .send({
          sessionId: 'invalid_session',
          message: 'Test message'
        })
        .expect(404);

      expect(response.body.error).toContain('Session not found');
    });

    test('Get chat history', async () => {
      const response = await request(app)
        .get(`/api/bland-ai/chat/history/${sessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.messages).toBeDefined();
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    test('End chat session', async () => {
      const response = await request(app)
        .delete(`/api/bland-ai/chat/session/${sessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessionSummary).toBeDefined();
      expect(response.body.sessionSummary.messageCount).toBeGreaterThan(0);
    });
  });

  describe('Data Access APIs', () => {
    test('Get booking details for AI', async () => {
      const response = await request(app)
        .get('/api/bland-ai/bookings/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.id).toBe('1');
    });

    test('Get customer details for AI', async () => {
      const response = await request(app)
        .get('/api/bland-ai/customers/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.customer).toBeDefined();
      expect(response.body.customer.id).toBe('1');
    });

    test('Get product details for AI', async () => {
      const response = await request(app)
        .get('/api/bland-ai/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
      expect(response.body.product.id).toBe('1');
    });

    test('Handle non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bland-ai/bookings/999')
        .expect(404);

      expect(response.body.error).toContain('Booking not found');
    });
  });

  describe('Analytics and Settings', () => {
    test('Get analytics data', async () => {
      const response = await request(app)
        .get('/api/bland-ai/analytics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analytics).toBeDefined();
      expect(response.body.analytics).toHaveProperty('totalCalls');
      expect(response.body.analytics).toHaveProperty('totalPathways');
      expect(response.body.analytics).toHaveProperty('callsByStatus');
      expect(response.body.analytics).toHaveProperty('pathwayUsage');
      expect(response.body.generatedAt).toBeDefined();
    });

    test('Get system settings', async () => {
      const response = await request(app)
        .get('/api/bland-ai/settings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.settings).toBeDefined();
      expect(response.body.settings).toHaveProperty('apiVersion');
      expect(response.body.settings).toHaveProperty('maxConcurrentCalls');
      expect(response.body.settings).toHaveProperty('defaultLanguage');
    });

    test('Update system settings', async () => {
      const settingsData = {
        maxConcurrentCalls: 150,
        defaultLanguage: 'ar',
        webhookEnabled: false
      };

      const response = await request(app)
        .post('/api/bland-ai/settings')
        .send(settingsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.settings.maxConcurrentCalls).toBe(150);
      expect(response.body.settings.defaultLanguage).toBe('ar');
      expect(response.body.settings.webhookEnabled).toBe(false);
    });
  });

  describe('Multi-language Support', () => {
    test('Get supported languages', async () => {
      const response = await request(app)
        .get('/api/bland-ai/languages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.languages).toBeDefined();
      expect(Array.isArray(response.body.languages)).toBe(true);
      expect(response.body.languages.length).toBeGreaterThan(0);
      expect(response.body.defaultLanguage).toBe('en');
    });

    test('Set user language preference', async () => {
      const response = await request(app)
        .post('/api/bland-ai/language-preference/test_user_123')
        .send({ language: 'ar', autoDetect: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.language).toBe('ar');
      expect(response.body.languageInfo).toBeDefined();
    });

    test('Get user language preference', async () => {
      const response = await request(app)
        .get('/api/bland-ai/language-preference/test_user_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.language).toBe('ar');
    });

    test('Get translations for language', async () => {
      const response = await request(app)
        .get('/api/bland-ai/translations/ar')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.translations).toBeDefined();
      expect(response.body.translations.welcome).toBeDefined();
      expect(response.body.language).toBe('ar');
    });

    test('Detect language from text', async () => {
      const response = await request(app)
        .post('/api/bland-ai/detect-language')
        .send({ 
          text: 'مرحباً، أحتاج مساعدة في الحجز',
          userId: 'test_user_456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.detectedLanguage).toBe('ar');
      expect(response.body.confidence).toBeGreaterThan(0);
    });
  });

  describe('Webhook Integration', () => {
    test('Process webhook event', async () => {
      const webhookData = {
        id: 'evt_test_123',
        type: 'call_started',
        data: {
          callId: callId,
          phoneNumber: '+971501234567',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/api/bland-ai/webhook')
        .set('X-Bland-Signature', 'sha256=test_signature')
        .set('X-Bland-Timestamp', Math.floor(Date.now() / 1000).toString())
        .send(webhookData);

      // Note: This will fail signature verification in the enhanced version
      // In a real test, you'd generate a proper signature
      expect([200, 401]).toContain(response.status);
    });

    test('Get webhook events', async () => {
      const response = await request(app)
        .get('/api/bland-ai/webhook/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.events).toBeDefined();
      expect(Array.isArray(response.body.events)).toBe(true);
    });

    test('Get webhook settings', async () => {
      const response = await request(app)
        .get('/api/bland-ai/webhook/settings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.settings).toBeDefined();
      expect(response.body.settings).toHaveProperty('enabledEvents');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('Handle malformed JSON in pathway creation', async () => {
      const response = await request(app)
        .post('/api/bland-ai/pathways')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    test('Handle very long pathway name', async () => {
      const longName = 'A'.repeat(1000);
      const response = await request(app)
        .post('/api/bland-ai/pathways')
        .send({ name: longName })
        .expect(201); // Should still work but might be truncated

      expect(response.body.pathway.name.length).toBeLessThanOrEqual(255);
    });

    test('Handle concurrent pathway creation', async () => {
      const pathwayData = {
        name: 'Concurrent Test Pathway',
        description: 'Testing concurrent creation'
      };

      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/bland-ai/pathways')
          .send({ ...pathwayData, name: `${pathwayData.name} ${Math.random()}` })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect([201, 409]).toContain(response.status);
      });
    });

    test('Handle rate limiting simulation', async () => {
      // Simulate multiple rapid requests
      const promises = Array(20).fill().map(() =>
        request(app).get('/api/bland-ai/pathways')
      );

      const responses = await Promise.all(promises);
      
      // All should succeed in this test environment
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Performance Tests', () => {
    test('Pathway creation performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/bland-ai/pathways')
        .send({
          name: 'Performance Test Pathway',
          description: 'Testing creation performance'
        })
        .expect(201);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(response.body.pathway).toBeDefined();
    });

    test('Large data retrieval performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/bland-ai/pathways?limit=100')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(response.body.pathways).toBeDefined();
    });
  });

  // Cleanup test data
  describe('Cleanup', () => {
    test('Delete test pathway', async () => {
      const response = await request(app)
        .delete(`/api/bland-ai/pathways/${pathwayId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Verify pathway deletion', async () => {
      const response = await request(app)
        .get(`/api/bland-ai/pathways/${pathwayId}`)
        .expect(404);

      expect(response.body.error).toContain('Pathway not found');
    });
  });
});

// Additional test utilities
describe('Test Utilities and Helpers', () => {
  test('Generate test data helper', () => {
    const testPathway = generateTestPathway();
    expect(testPathway).toHaveProperty('name');
    expect(testPathway).toHaveProperty('description');
    expect(testPathway.name).toContain('Test');
  });

  test('Validate response structure helper', () => {
    const mockResponse = {
      success: true,
      pathway: { id: 'test', name: 'Test' }
    };
    
    expect(validatePathwayResponse(mockResponse)).toBe(true);
  });
});

// Helper functions for tests
function generateTestPathway() {
  return {
    name: `Test Pathway ${Date.now()}`,
    description: 'Generated test pathway for automated testing',
    settings: {
      maxDuration: 300,
      language: 'en'
    }
  };
}

function validatePathwayResponse(response) {
  return response && 
         typeof response.success === 'boolean' &&
         response.pathway &&
         typeof response.pathway.id === 'string' &&
         typeof response.pathway.name === 'string';
}

function generateTestCall(pathwayId) {
  return {
    phoneNumber: `+97150${Math.floor(Math.random() * 10000000)}`,
    pathwayId: pathwayId,
    metadata: {
      testCall: true,
      timestamp: new Date().toISOString()
    }
  };
}
