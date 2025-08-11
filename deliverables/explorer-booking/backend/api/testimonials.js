const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for video file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/testimonials');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'testimonial-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only video files
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'video/webm',
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/quicktime'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// In-memory storage for testimonials (in production, use a database)
let testimonials = [];
let testimonialIdCounter = 1;

/**
 * GET /api/testimonials
 * Retrieve all testimonials
 */
router.get('/', (req, res) => {
    try {
        // Return testimonials without file paths for security
        const publicTestimonials = testimonials.map(testimonial => ({
            id: testimonial.id,
            userId: testimonial.userId,
            userName: testimonial.userName,
            title: testimonial.title,
            description: testimonial.description,
            duration: testimonial.duration,
            createdAt: testimonial.createdAt,
            approved: testimonial.approved,
            rating: testimonial.rating
        }));
        
        res.json({
            success: true,
            data: publicTestimonials,
            count: publicTestimonials.length
        });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch testimonials'
        });
    }
});

/**
 * POST /api/testimonials
 * Upload a new video testimonial
 */
router.post('/', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No video file provided'
            });
        }

        const {
            userId = 'anonymous',
            userName = 'Anonymous User',
            title = 'My Explorer Shack Experience',
            description = '',
            duration = 0,
            rating = 5
        } = req.body;

        // Validate required fields
        if (!title.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Create testimonial record
        const testimonial = {
            id: testimonialIdCounter++,
            userId: userId,
            userName: userName,
            title: title.trim(),
            description: description.trim(),
            duration: parseInt(duration) || 0,
            rating: Math.min(Math.max(parseInt(rating) || 5, 1), 5), // Ensure rating is between 1-5
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            createdAt: new Date().toISOString(),
            approved: false, // Require admin approval
            views: 0
        };

        testimonials.push(testimonial);

        // Log the upload
        console.log(`New testimonial uploaded: ${testimonial.id} by ${userName}`);

        res.status(201).json({
            success: true,
            message: 'Testimonial uploaded successfully',
            data: {
                id: testimonial.id,
                title: testimonial.title,
                userName: testimonial.userName,
                createdAt: testimonial.createdAt,
                approved: testimonial.approved
            }
        });

    } catch (error) {
        console.error('Error uploading testimonial:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: 'Failed to upload testimonial'
        });
    }
});

/**
 * GET /api/testimonials/:id
 * Get a specific testimonial by ID
 */
router.get('/:id', (req, res) => {
    try {
        const testimonialId = parseInt(req.params.id);
        const testimonial = testimonials.find(t => t.id === testimonialId);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                error: 'Testimonial not found'
            });
        }

        // Increment view count
        testimonial.views++;

        // Return public data only
        res.json({
            success: true,
            data: {
                id: testimonial.id,
                userId: testimonial.userId,
                userName: testimonial.userName,
                title: testimonial.title,
                description: testimonial.description,
                duration: testimonial.duration,
                rating: testimonial.rating,
                createdAt: testimonial.createdAt,
                approved: testimonial.approved,
                views: testimonial.views
            }
        });

    } catch (error) {
        console.error('Error fetching testimonial:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch testimonial'
        });
    }
});

/**
 * GET /api/testimonials/:id/video
 * Stream video file for a specific testimonial
 */
router.get('/:id/video', (req, res) => {
    try {
        const testimonialId = parseInt(req.params.id);
        const testimonial = testimonials.find(t => t.id === testimonialId);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                error: 'Testimonial not found'
            });
        }

        if (!testimonial.approved) {
            return res.status(403).json({
                success: false,
                error: 'Testimonial not approved for viewing'
            });
        }

        const videoPath = testimonial.filePath;
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({
                success: false,
                error: 'Video file not found'
            });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Support for video streaming with range requests
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': testimonial.mimeType,
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': testimonial.mimeType,
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }

    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stream video'
        });
    }
});

/**
 * PUT /api/testimonials/:id/approve
 * Approve a testimonial (admin only)
 */
router.put('/:id/approve', (req, res) => {
    try {
        // In production, add proper admin authentication middleware
        const testimonialId = parseInt(req.params.id);
        const testimonial = testimonials.find(t => t.id === testimonialId);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                error: 'Testimonial not found'
            });
        }

        testimonial.approved = true;
        testimonial.approvedAt = new Date().toISOString();

        console.log(`Testimonial ${testimonialId} approved`);

        res.json({
            success: true,
            message: 'Testimonial approved successfully',
            data: {
                id: testimonial.id,
                approved: testimonial.approved,
                approvedAt: testimonial.approvedAt
            }
        });

    } catch (error) {
        console.error('Error approving testimonial:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to approve testimonial'
        });
    }
});

/**
 * DELETE /api/testimonials/:id
 * Delete a testimonial (admin only)
 */
router.delete('/:id', (req, res) => {
    try {
        // In production, add proper admin authentication middleware
        const testimonialId = parseInt(req.params.id);
        const testimonialIndex = testimonials.findIndex(t => t.id === testimonialId);

        if (testimonialIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Testimonial not found'
            });
        }

        const testimonial = testimonials[testimonialIndex];

        // Delete the video file
        if (fs.existsSync(testimonial.filePath)) {
            fs.unlinkSync(testimonial.filePath);
        }

        // Remove from array
        testimonials.splice(testimonialIndex, 1);

        console.log(`Testimonial ${testimonialId} deleted`);

        res.json({
            success: true,
            message: 'Testimonial deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting testimonial:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete testimonial'
        });
    }
});

/**
 * GET /api/testimonials/stats
 * Get testimonial statistics
 */
router.get('/admin/stats', (req, res) => {
    try {
        const stats = {
            total: testimonials.length,
            approved: testimonials.filter(t => t.approved).length,
            pending: testimonials.filter(t => !t.approved).length,
            totalViews: testimonials.reduce((sum, t) => sum + t.views, 0),
            averageRating: testimonials.length > 0 
                ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                : 0,
            totalFileSize: testimonials.reduce((sum, t) => sum + t.fileSize, 0)
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching testimonial stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 100MB.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected file field.'
            });
        }
    }
    
    if (error.message === 'Invalid file type. Only video files are allowed.') {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }

    console.error('Testimonial API error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

module.exports = router;
