// Products API with Cost Price Integration
// Enhanced for profitability analysis and reporting

const express = require('express');
const router = express.Router();

// Mock product data with cost prices
let products = [
  {
    id: '1',
    name: 'Dubai Desert Safari',
    description: 'Experience the thrill of dune bashing and traditional Bedouin culture',
    category: 'Adventure',
    city: 'Dubai',
    country: 'UAE',
    countryCode: 'AE',
    sellingPrice: {
      adult: 450,
      child: 350,
      infant: 0
    },
    costPrice: {
      adult: 280,
      child: 220,
      infant: 0
    },
    currency: 'AED',
    duration: '6 hours',
    maxParticipants: 50,
    minParticipants: 1,
    supplierId: 'SUP001',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    costUpdatedAt: new Date('2024-01-10'),
    variations: [
      {
        id: 'var_1',
        name: 'Standard Safari',
        sellingPrice: { adult: 450, child: 350 },
        costPrice: { adult: 280, child: 220 },
        marginPercentage: 37.78
      },
      {
        id: 'var_2',
        name: 'Premium Safari with BBQ',
        sellingPrice: { adult: 650, child: 500 },
        costPrice: { adult: 420, child: 320 },
        marginPercentage: 35.38
      }
    ],
    addons: [
      {
        id: 'addon_1',
        name: 'Camel Ride',
        sellingPrice: 50,
        costPrice: 25,
        marginPercentage: 50
      },
      {
        id: 'addon_2',
        name: 'Quad Biking',
        sellingPrice: 150,
        costPrice: 90,
        marginPercentage: 40
      }
    ]
  }
];

// Utility function for logging product actions
const logProductAction = (action, data, error = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    data,
    error,
    id: 'product_log_' + Date.now()
  };
  console.log('Product API Log:', logEntry);
};

// Calculate profit margin
const calculateMargin = (sellingPrice, costPrice) => {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice * 100).toFixed(2);
};

// Input validation middleware
const validateProductInput = (req, res, next) => {
  const { name, sellingPrice, costPrice } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Product name is required and must be a non-empty string' 
    });
  }
  
  if (sellingPrice && typeof sellingPrice !== 'object') {
    return res.status(400).json({ 
      error: 'Selling price must be an object with adult, child, infant properties' 
    });
  }
  
  if (costPrice && typeof costPrice !== 'object') {
    return res.status(400).json({ 
      error: 'Cost price must be an object with adult, child, infant properties' 
    });
  }
  
  next();
};

// GET /api/products - List all products with cost analysis
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      city, 
      status = 'active', 
      includeCosting = false,
      limit = 50, 
      offset = 0 
    } = req.query;
    
    let filteredProducts = products;
    
    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    if (city) {
      filteredProducts = filteredProducts.filter(p => p.city === city);
    }
    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }
    
    // Paginate results
    const paginatedProducts = filteredProducts.slice(offset, offset + parseInt(limit));
    
    // Format response based on costing inclusion
    const responseProducts = paginatedProducts.map(product => {
      const baseProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        city: product.city,
        country: product.country,
        sellingPrice: product.sellingPrice,
        currency: product.currency,
        duration: product.duration,
        maxParticipants: product.maxParticipants,
        minParticipants: product.minParticipants,
        status: product.status
      };
      
      if (includeCosting === 'true') {
        return {
          ...baseProduct,
          costPrice: product.costPrice,
          costUpdatedAt: product.costUpdatedAt,
          profitMargin: {
            adult: calculateMargin(product.sellingPrice.adult, product.costPrice.adult),
            child: calculateMargin(product.sellingPrice.child, product.costPrice.child)
          },
          variations: product.variations?.map(v => ({
            ...v,
            profitMargin: calculateMargin(v.sellingPrice.adult, v.costPrice.adult)
          })),
          addons: product.addons?.map(a => ({
            ...a,
            profitMargin: calculateMargin(a.sellingPrice, a.costPrice)
          }))
        };
      }
      
      return baseProduct;
    });
    
    logProductAction('LIST_PRODUCTS', { 
      count: responseProducts.length, 
      filters: { category, city, status, includeCosting } 
    });
    
    res.json({
      success: true,
      products: responseProducts,
      total: filteredProducts.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      includedCosting: includeCosting === 'true'
    });
  } catch (error) {
    logProductAction('LIST_PRODUCTS_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error while fetching products' 
    });
  }
});

// GET /api/products/:id - Get specific product with full costing details
router.get('/:id', async (req, res) => {
  try {
    const { includeCosting = true } = req.query;
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    let responseProduct = { ...product };
    
    if (includeCosting) {
      responseProduct.profitAnalysis = {
        adultMargin: calculateMargin(product.sellingPrice.adult, product.costPrice.adult),
        childMargin: calculateMargin(product.sellingPrice.child, product.costPrice.child),
        averageMargin: (
          parseFloat(calculateMargin(product.sellingPrice.adult, product.costPrice.adult)) +
          parseFloat(calculateMargin(product.sellingPrice.child, product.costPrice.child))
        ) / 2,
        totalProfit: {
          adult: product.sellingPrice.adult - product.costPrice.adult,
          child: product.sellingPrice.child - product.costPrice.child
        }
      };
    }
    
    logProductAction('GET_PRODUCT', { productId: req.params.id, includeCosting });
    
    res.json({
      success: true,
      product: responseProduct
    });
  } catch (error) {
    logProductAction('GET_PRODUCT_ERROR', { productId: req.params.id }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while fetching product' 
    });
  }
});

// POST /api/products - Create new product with cost pricing
router.post('/', validateProductInput, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      city,
      country,
      countryCode,
      sellingPrice,
      costPrice,
      currency = 'AED',
      duration,
      maxParticipants,
      minParticipants,
      supplierId,
      variations = [],
      addons = []
    } = req.body;
    
    // Check for duplicate names
    const existingProduct = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingProduct) {
      return res.status(409).json({ 
        error: 'Product with this name already exists' 
      });
    }
    
    const product = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      description: description?.trim() || '',
      category,
      city,
      country,
      countryCode,
      sellingPrice: sellingPrice || { adult: 0, child: 0, infant: 0 },
      costPrice: costPrice || { adult: 0, child: 0, infant: 0 },
      currency,
      duration,
      maxParticipants: maxParticipants || 999,
      minParticipants: minParticipants || 1,
      supplierId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      costUpdatedAt: new Date(),
      variations: variations.map(v => ({
        ...v,
        id: v.id || 'var_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        marginPercentage: calculateMargin(v.sellingPrice?.adult || 0, v.costPrice?.adult || 0)
      })),
      addons: addons.map(a => ({
        ...a,
        id: a.id || 'addon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        marginPercentage: calculateMargin(a.sellingPrice || 0, a.costPrice || 0)
      }))
    };
    
    products.push(product);
    
    logProductAction('CREATE_PRODUCT', { 
      productId: product.id, 
      name: product.name,
      profitMargin: calculateMargin(product.sellingPrice.adult, product.costPrice.adult)
    });
    
    res.status(201).json({
      success: true,
      product,
      profitAnalysis: {
        adultMargin: calculateMargin(product.sellingPrice.adult, product.costPrice.adult),
        childMargin: calculateMargin(product.sellingPrice.child, product.costPrice.child),
        estimatedProfit: {
          adult: product.sellingPrice.adult - product.costPrice.adult,
          child: product.sellingPrice.child - product.costPrice.child
        }
      },
      message: 'Product created successfully'
    });
  } catch (error) {
    logProductAction('CREATE_PRODUCT_ERROR', req.body, error.message);
    res.status(500).json({ 
      error: 'Internal server error while creating product' 
    });
  }
});

// PUT /api/products/:id - Update product including cost prices
router.put('/:id', validateProductInput, async (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    const {
      name,
      description,
      category,
      city,
      country,
      sellingPrice,
      costPrice,
      duration,
      maxParticipants,
      minParticipants,
      status,
      variations,
      addons
    } = req.body;
    
    const product = products[productIndex];
    const oldCostPrice = { ...product.costPrice };
    
    // Update product fields
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (category) product.category = category;
    if (city) product.city = city;
    if (country) product.country = country;
    if (sellingPrice) product.sellingPrice = sellingPrice;
    if (costPrice) {
      product.costPrice = costPrice;
      product.costUpdatedAt = new Date();
    }
    if (duration) product.duration = duration;
    if (maxParticipants) product.maxParticipants = maxParticipants;
    if (minParticipants) product.minParticipants = minParticipants;
    if (status) product.status = status;
    if (variations) {
      product.variations = variations.map(v => ({
        ...v,
        marginPercentage: calculateMargin(v.sellingPrice?.adult || 0, v.costPrice?.adult || 0)
      }));
    }
    if (addons) {
      product.addons = addons.map(a => ({
        ...a,
        marginPercentage: calculateMargin(a.sellingPrice || 0, a.costPrice || 0)
      }));
    }
    
    product.updatedAt = new Date();
    
    logProductAction('UPDATE_PRODUCT', { 
      productId: req.params.id, 
      changes: req.body,
      costPriceChanged: JSON.stringify(oldCostPrice) !== JSON.stringify(product.costPrice)
    });
    
    res.json({
      success: true,
      product,
      profitAnalysis: {
        adultMargin: calculateMargin(product.sellingPrice.adult, product.costPrice.adult),
        childMargin: calculateMargin(product.sellingPrice.child, product.costPrice.child),
        marginChange: costPrice ? {
          adult: parseFloat(calculateMargin(product.sellingPrice.adult, product.costPrice.adult)) - 
                 parseFloat(calculateMargin(product.sellingPrice.adult, oldCostPrice.adult)),
          child: parseFloat(calculateMargin(product.sellingPrice.child, product.costPrice.child)) - 
                 parseFloat(calculateMargin(product.sellingPrice.child, oldCostPrice.child))
        } : null
      },
      message: 'Product updated successfully'
    });
  } catch (error) {
    logProductAction('UPDATE_PRODUCT_ERROR', { productId: req.params.id }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while updating product' 
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    logProductAction('DELETE_PRODUCT', { 
      productId: req.params.id, 
      name: deletedProduct.name 
    });
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logProductAction('DELETE_PRODUCT_ERROR', { productId: req.params.id }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while deleting product' 
    });
  }
});

// GET /api/products/analytics/profitability - Get profitability analytics
router.get('/analytics/profitability', async (req, res) => {
  try {
    const { category, city, dateRange } = req.query;
    
    let filteredProducts = products;
    if (category) filteredProducts = filteredProducts.filter(p => p.category === category);
    if (city) filteredProducts = filteredProducts.filter(p => p.city === city);
    
    const analytics = {
      totalProducts: filteredProducts.length,
      averageMargin: 0,
      highestMarginProduct: null,
      lowestMarginProduct: null,
      categoryBreakdown: {},
      marginDistribution: {
        high: 0, // >40%
        medium: 0, // 20-40%
        low: 0 // <20%
      },
      costAnalysis: {
        totalSellingValue: 0,
        totalCostValue: 0,
        totalPotentialProfit: 0
      }
    };
    
    let totalMargin = 0;
    let highestMargin = -1;
    let lowestMargin = 101;
    
    filteredProducts.forEach(product => {
      const adultMargin = parseFloat(calculateMargin(product.sellingPrice.adult, product.costPrice.adult));
      
      // Update totals
      totalMargin += adultMargin;
      analytics.costAnalysis.totalSellingValue += product.sellingPrice.adult;
      analytics.costAnalysis.totalCostValue += product.costPrice.adult;
      analytics.costAnalysis.totalPotentialProfit += (product.sellingPrice.adult - product.costPrice.adult);
      
      // Track highest/lowest margin products
      if (adultMargin > highestMargin) {
        highestMargin = adultMargin;
        analytics.highestMarginProduct = {
          id: product.id,
          name: product.name,
          margin: adultMargin
        };
      }
      
      if (adultMargin < lowestMargin) {
        lowestMargin = adultMargin;
        analytics.lowestMarginProduct = {
          id: product.id,
          name: product.name,
          margin: adultMargin
        };
      }
      
      // Category breakdown
      if (!analytics.categoryBreakdown[product.category]) {
        analytics.categoryBreakdown[product.category] = {
          count: 0,
          averageMargin: 0,
          totalMargin: 0
        };
      }
      analytics.categoryBreakdown[product.category].count++;
      analytics.categoryBreakdown[product.category].totalMargin += adultMargin;
      
      // Margin distribution
      if (adultMargin > 40) {
        analytics.marginDistribution.high++;
      } else if (adultMargin >= 20) {
        analytics.marginDistribution.medium++;
      } else {
        analytics.marginDistribution.low++;
      }
    });
    
    // Calculate averages
    analytics.averageMargin = filteredProducts.length > 0 ? (totalMargin / filteredProducts.length).toFixed(2) : 0;
    
    Object.keys(analytics.categoryBreakdown).forEach(category => {
      const cat = analytics.categoryBreakdown[category];
      cat.averageMargin = (cat.totalMargin / cat.count).toFixed(2);
      delete cat.totalMargin;
    });
    
    logProductAction('PROFITABILITY_ANALYTICS', { 
      filters: { category, city },
      productsAnalyzed: filteredProducts.length 
    });
    
    res.json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logProductAction('PROFITABILITY_ANALYTICS_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error while generating profitability analytics' 
    });
  }
});

// POST /api/products/bulk-update-costs - Bulk update cost prices
router.post('/bulk-update-costs', async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, costPrice}
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ 
        error: 'Updates must be an array of cost price updates' 
      });
    }
    
    const results = {
      successful: [],
      failed: [],
      summary: {
        totalUpdated: 0,
        totalFailed: 0,
        averageMarginChange: 0
      }
    };
    
    let totalMarginChange = 0;
    
    updates.forEach(update => {
      const productIndex = products.findIndex(p => p.id === update.id);
      
      if (productIndex === -1) {
        results.failed.push({
          id: update.id,
          error: 'Product not found'
        });
        return;
      }
      
      const product = products[productIndex];
      const oldMargin = parseFloat(calculateMargin(product.sellingPrice.adult, product.costPrice.adult));
      
      product.costPrice = update.costPrice;
      product.costUpdatedAt = new Date();
      product.updatedAt = new Date();
      
      const newMargin = parseFloat(calculateMargin(product.sellingPrice.adult, product.costPrice.adult));
      const marginChange = newMargin - oldMargin;
      totalMarginChange += marginChange;
      
      results.successful.push({
        id: update.id,
        name: product.name,
        oldMargin,
        newMargin,
        marginChange
      });
    });
    
    results.summary.totalUpdated = results.successful.length;
    results.summary.totalFailed = results.failed.length;
    results.summary.averageMarginChange = results.successful.length > 0 ? 
      (totalMarginChange / results.successful.length).toFixed(2) : 0;
    
    logProductAction('BULK_COST_UPDATE', { 
      totalUpdates: updates.length,
      successful: results.summary.totalUpdated,
      failed: results.summary.totalFailed
    });
    
    res.json({
      success: true,
      results,
      message: `Successfully updated ${results.summary.totalUpdated} products`
    });
  } catch (error) {
    logProductAction('BULK_COST_UPDATE_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error during bulk cost update' 
    });
  }
});

module.exports = router;
