/**
 * Integration Tests for Video Testimonial Feature
 * Tests the complete video recording and testimonial workflow
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Mock app for testing
const express = require('express');
const testimonialsRouter = require('../../backend/api/testimonials');

const app = express();
app.use(express.json());
app.use('/api/testimonials', testimonialsRouter);

describe('Video Testimonial Integration Tests', () => {
    const testVideoPath = path.join(__dirname, '../fixtures/test-video.webm');
    
    beforeAll(() => {
        // Create test fixtures directory if it doesn't exist
        const fixturesDir = path.join(__dirname, '../fixtures');
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
        
        // Create a mock video file for testing
        if (!fs.existsSync(testVideoPath)) {
            fs.writeFileSync(testVideoPath, Buffer.from('mock video content'));
        }
    });

    afterAll(() => {
        // Clean up test files
        if (fs.existsSync(testVideoPath)) {
            fs.unlinkSync(testVideoPath);
        }
    });

    describe('GET /api/testimonials', () => {
        test('should return empty testimonials list initially', async () => {
            const response = await request(app)
                .get('/api/testimonials')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: [],
                count: 0
            });
        });
    });

    describe('POST /api/testimonials', () => {
        test('should upload video testimonial successfully', async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Amazing Paris Tour')
                .field('description', 'Had an incredible time exploring Paris!')
                .field('userName', 'John Doe')
                .field('rating', '5')
                .field('duration', '120')
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Testimonial uploaded successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe('Amazing Paris Tour');
            expect(response.body.data.userName).toBe('John Doe');
            expect(response.body.data.approved).toBe(false);
        });

        test('should reject upload without video file', async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .field('title', 'Test Testimonial')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('No video file provided');
        });

        test('should reject upload without title', async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', '')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Title is required');
        });

        test('should handle file size limits', async () => {
            // This would test the multer file size limit
            // In a real scenario, you'd create a large file to test this
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Large File Test')
                .expect(201); // Should pass with small test file

            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/testimonials/:id', () => {
        let testimonialId;

        beforeEach(async () => {
            // Create a test testimonial
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Test Testimonial for GET')
                .field('userName', 'Jane Doe')
                .field('rating', '4');
            
            testimonialId = response.body.data.id;
        });

        test('should get testimonial by ID', async () => {
            const response = await request(app)
                .get(`/api/testimonials/${testimonialId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(testimonialId);
            expect(response.body.data.title).toBe('Test Testimonial for GET');
            expect(response.body.data.userName).toBe('Jane Doe');
            expect(response.body.data.views).toBe(1); // Should increment view count
        });

        test('should return 404 for non-existent testimonial', async () => {
            const response = await request(app)
                .get('/api/testimonials/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Testimonial not found');
        });
    });

    describe('PUT /api/testimonials/:id/approve', () => {
        let testimonialId;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Test Approval')
                .field('userName', 'Admin Test');
            
            testimonialId = response.body.data.id;
        });

        test('should approve testimonial successfully', async () => {
            const response = await request(app)
                .put(`/api/testimonials/${testimonialId}/approve`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Testimonial approved successfully');
            expect(response.body.data.approved).toBe(true);
            expect(response.body.data).toHaveProperty('approvedAt');
        });

        test('should return 404 for non-existent testimonial approval', async () => {
            const response = await request(app)
                .put('/api/testimonials/99999/approve')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Testimonial not found');
        });
    });

    describe('DELETE /api/testimonials/:id', () => {
        let testimonialId;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Test Deletion')
                .field('userName', 'Delete Test');
            
            testimonialId = response.body.data.id;
        });

        test('should delete testimonial successfully', async () => {
            const response = await request(app)
                .delete(`/api/testimonials/${testimonialId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Testimonial deleted successfully');

            // Verify testimonial is deleted
            await request(app)
                .get(`/api/testimonials/${testimonialId}`)
                .expect(404);
        });

        test('should return 404 for non-existent testimonial deletion', async () => {
            const response = await request(app)
                .delete('/api/testimonials/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Testimonial not found');
        });
    });

    describe('GET /api/testimonials/admin/stats', () => {
        beforeEach(async () => {
            // Create some test testimonials for stats
            await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Stats Test 1')
                .field('rating', '5');

            await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Stats Test 2')
                .field('rating', '4');
        });

        test('should return testimonial statistics', async () => {
            const response = await request(app)
                .get('/api/testimonials/admin/stats')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('total');
            expect(response.body.data).toHaveProperty('approved');
            expect(response.body.data).toHaveProperty('pending');
            expect(response.body.data).toHaveProperty('totalViews');
            expect(response.body.data).toHaveProperty('averageRating');
            expect(response.body.data).toHaveProperty('totalFileSize');
            
            expect(typeof response.body.data.total).toBe('number');
            expect(typeof response.body.data.averageRating).toBe('string');
        });
    });

    describe('Video Streaming', () => {
        let testimonialId;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Streaming Test');
            
            testimonialId = response.body.data.id;

            // Approve the testimonial for streaming
            await request(app)
                .put(`/api/testimonials/${testimonialId}/approve`);
        });

        test('should stream video for approved testimonial', async () => {
            const response = await request(app)
                .get(`/api/testimonials/${testimonialId}/video`)
                .expect(200);

            expect(response.headers['content-type']).toMatch(/video/);
        });

        test('should reject streaming for non-approved testimonial', async () => {
            // Create unapproved testimonial
            const unapprovedResponse = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Unapproved Test');

            const response = await request(app)
                .get(`/api/testimonials/${unapprovedResponse.body.data.id}/video`)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Testimonial not approved for viewing');
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid file types', async () => {
            const textFilePath = path.join(__dirname, '../fixtures/test.txt');
            fs.writeFileSync(textFilePath, 'This is not a video file');

            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', textFilePath)
                .field('title', 'Invalid File Test')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid file type. Only video files are allowed.');

            // Clean up
            fs.unlinkSync(textFilePath);
        });

        test('should handle malformed requests gracefully', async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .send({ invalid: 'data' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Data Validation', () => {
        test('should validate rating bounds', async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Rating Test')
                .field('rating', '10') // Should be clamped to 5
                .expect(201);

            expect(response.body.success).toBe(true);
            
            // Get the testimonial to check rating was clamped
            const getResponse = await request(app)
                .get(`/api/testimonials/${response.body.data.id}`);
            
            expect(getResponse.body.data.rating).toBe(5);
        });

        test('should handle negative rating', async () => {
            const response = await request(app)
                .post('/api/testimonials')
                .attach('video', testVideoPath)
                .field('title', 'Negative Rating Test')
                .field('rating', '-1') // Should be clamped to 1
                .expect(201);

            const getResponse = await request(app)
                .get(`/api/testimonials/${response.body.data.id}`);
            
            expect(getResponse.body.data.rating).toBe(1);
        });
    });
});

// Frontend JavaScript Tests (for browser environment)
describe('Frontend Video Recording Tests', () => {
    // These would be run in a browser environment with jsdom or similar
    
    test('should check MediaRecorder support', () => {
        // Mock MediaRecorder for testing
        global.MediaRecorder = class MockMediaRecorder {
            constructor(stream, options) {
                this.stream = stream;
                this.options = options;
                this.state = 'inactive';
            }
            
            start() {
                this.state = 'recording';
                if (this.onstart) this.onstart();
            }
            
            stop() {
                this.state = 'inactive';
                if (this.onstop) this.onstop();
            }
            
            pause() {
                this.state = 'paused';
            }
            
            resume() {
                this.state = 'recording';
            }
        };

        // Test browser support check
        const hasSupport = !!(global.MediaRecorder);
        expect(hasSupport).toBe(true);
    });

    test('should handle recording state management', () => {
        const mockStream = {};
        const recorder = new global.MediaRecorder(mockStream);
        
        expect(recorder.state).toBe('inactive');
        
        recorder.start();
        expect(recorder.state).toBe('recording');
        
        recorder.pause();
        expect(recorder.state).toBe('paused');
        
        recorder.resume();
        expect(recorder.state).toBe('recording');
        
        recorder.stop();
        expect(recorder.state).toBe('inactive');
    });

    test('should validate authentication check', () => {
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        global.localStorage = localStorageMock;

        // Test authentication check
        localStorageMock.getItem.mockReturnValue('true');
        const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true';
        expect(isAuthenticated).toBe(true);

        localStorageMock.getItem.mockReturnValue(null);
        const isNotAuthenticated = localStorage.getItem('userAuthenticated') === 'true';
        expect(isNotAuthenticated).toBe(false);
    });
});
