// Security Middleware for Explorer Shack
// Comprehensive security implementation with vulnerability protection

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Security configuration
const securityConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  bcryptRounds: 12,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  csrfTokenExpiry: 60 * 60 * 1000, // 1 hour
};

// Rate limiting configurations
const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path
      });
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
      error: 'Too many login attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email: req.body.email
      });
      res.status(429).json({
        error: 'Too many login attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
      });
    }
  }),

  // API key rate limiting
  apiKey: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute for API keys
    keyGenerator: (req) => req.get('X-API-Key') || req.ip,
    message: {
      error: 'API rate limit exceeded.',
      code: 'API_RATE_LIMIT_EXCEEDED'
    }
  })
};

// Helmet security configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdn.tailwindcss.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "https://images.pexels.com"
      ],
      scriptSrc: [
        "'self'",
        "https://cdn.tailwindcss.com"
      ],
      connectSrc: [
        "'self'",
        "wss:",
        "ws:"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
});

// Input validation and sanitization
const inputValidation = {
  // Sanitize string input
  sanitizeString: (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return validator.escape(sanitized);
  },

  // Validate email
  validateEmail: (email) => {
    return validator.isEmail(email) && email.length <= 254;
  },

  // Validate phone number
  validatePhone: (phone) => {
    return validator.isMobilePhone(phone, 'any', { strictMode: false });
  },

  // Validate URL
  validateURL: (url) => {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true
    });
  },

  // Validate numeric input
  validateNumeric: (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // Validate date
  validateDate: (date) => {
    return validator.isISO8601(date);
  }
};

// CSRF Protection
const csrfProtection = {
  generateToken: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  validateToken: (req, res, next) => {
    const token = req.get('X-CSRF-Token') || req.body._csrf;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      logSecurityEvent('CSRF_TOKEN_INVALID', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path
      });
      return res.status(403).json({
        error: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      });
    }

    next();
  },

  setupToken: (req, res, next) => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = csrfProtection.generateToken();
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
  }
};

// Authentication middleware
const authentication = {
  // Verify JWT token
  verifyToken: (req, res, next) => {
    const token = req.get('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.authToken ||
                  req.session?.authToken;

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    try {
      const decoded = jwt.verify(token, securityConfig.jwtSecret);
      
      // Check token expiration
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      logSecurityEvent('INVALID_TOKEN', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message
      });
      
      return res.status(401).json({
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
  },

  // Generate JWT token
  generateToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      securityConfig.jwtSecret
    );
  },

  // Check user permissions
  requireRole: (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!roles.includes(req.user.role)) {
        logSecurityEvent('INSUFFICIENT_PERMISSIONS', {
          userId: req.user.id,
          requiredRoles: roles,
          userRole: req.user.role,
          endpoint: req.path
        });
        
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    };
  }
};

// SQL Injection Prevention
const sqlInjectionPrevention = {
  // Validate and sanitize SQL parameters
  sanitizeParams: (params) => {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // Remove SQL injection patterns
        sanitized[key] = value
          .replace(/('|(\\')|(;)|(\\)|(--)|(\s*(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+))/gi, '')
          .trim();
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  },

  // Validate SQL query parameters
  validateQueryParams: (req, res, next) => {
    if (req.query) {
      req.query = sqlInjectionPrevention.sanitizeParams(req.query);
    }
    if (req.body) {
      req.body = sqlInjectionPrevention.sanitizeParams(req.body);
    }
    next();
  }
};

// File upload security
const fileUploadSecurity = {
  // Validate file type and size
  validateFile: (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} not allowed`);
    }

    // Check for executable files
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push('Executable files are not allowed');
    }

    return errors;
  },

  // Scan file content for malicious patterns
  scanFileContent: (buffer) => {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }
};

// Security logging
const logSecurityEvent = (event, data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    data,
    severity: getSeverityLevel(event),
    id: crypto.randomUUID()
  };

  console.log('SECURITY EVENT:', JSON.stringify(logEntry));
  
  // In production, send to security monitoring service
  // Example: sendToSecurityService(logEntry);
};

const getSeverityLevel = (event) => {
  const highSeverityEvents = [
    'SQL_INJECTION_ATTEMPT',
    'XSS_ATTEMPT',
    'BRUTE_FORCE_ATTACK',
    'UNAUTHORIZED_ACCESS_ATTEMPT'
  ];
  
  const mediumSeverityEvents = [
    'RATE_LIMIT_EXCEEDED',
    'INVALID_TOKEN',
    'CSRF_TOKEN_INVALID'
  ];
  
  if (highSeverityEvents.includes(event)) return 'HIGH';
  if (mediumSeverityEvents.includes(event)) return 'MEDIUM';
  return 'LOW';
};

// Session security
const sessionSecurity = {
  // Configure secure session settings
  sessionConfig: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS
      maxAge: securityConfig.sessionTimeout,
      sameSite: 'strict' // CSRF protection
    },
    name: 'sessionId' // Don't use default session name
  },

  // Regenerate session ID on login
  regenerateSession: (req, res, next) => {
    req.session.regenerate((err) => {
      if (err) {
        logSecurityEvent('SESSION_REGENERATION_FAILED', {
          error: err.message,
          ip: req.ip
        });
        return next(err);
      }
      next();
    });
  }
};

// API Key validation
const apiKeyValidation = {
  validateApiKey: (req, res, next) => {
    const apiKey = req.get('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        code: 'API_KEY_REQUIRED'
      });
    }

    // In production, validate against database
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
      logSecurityEvent('INVALID_API_KEY', {
        apiKey: apiKey.substring(0, 8) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }

    next();
  }
};

// Error handling that doesn't leak information
const secureErrorHandler = (err, req, res, next) => {
  // Log the full error for debugging
  logSecurityEvent('APPLICATION_ERROR', {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    endpoint: req.path,
    method: req.method
  });

  // Don't expose internal error details to client
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack })
  });
};

// Export all security middleware
module.exports = {
  // Core security
  helmet: helmetConfig,
  rateLimiters,
  
  // Input validation
  inputValidation,
  sqlInjectionPrevention,
  
  // Authentication & Authorization
  authentication,
  csrfProtection,
  sessionSecurity,
  apiKeyValidation,
  
  // File security
  fileUploadSecurity,
  
  // Error handling
  secureErrorHandler,
  
  // Logging
  logSecurityEvent,
  
  // Utility functions
  generateSecureId: () => crypto.randomUUID(),
  hashPassword: (password) => {
    const bcrypt = require('bcrypt');
    return bcrypt.hashSync(password, securityConfig.bcryptRounds);
  },
  verifyPassword: (password, hash) => {
    const bcrypt = require('bcrypt');
    return bcrypt.compareSync(password, hash);
  }
};
