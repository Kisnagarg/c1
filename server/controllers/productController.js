const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with search, filter, sort, pagination
exports.getProducts = async (req, res) => {
  try {
    const { 
      search, category, minPrice, maxPrice, 
      available, status, stockStatus, includeInactive,
      sort, page = 1, limit = 12 
    } = req.query;

    const query = {};

    // Only filter active products for public users
    if (includeInactive !== 'true') {
      query.isActive = { $ne: false };
      query.isAvailable = { $ne: false };
    } else if (status === 'active') {
      query.isActive = true;
      query.isAvailable = true;
    } else if (status === 'inactive') {
      query.$or = [{ isActive: false }, { isAvailable: false }];
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category (accepts slug or ObjectId)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) query.category = cat._id;
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by availability
    if (available === 'true') {
      query.isAvailable = true;
      query.stock = { $gt: 0 };
    }

    // Filter by stock status
    if (stockStatus === 'low') {
      query.stock = { $gt: 0, $lte: 5 };
    } else if (stockStatus === 'out') {
      query.stock = { $lte: 0 };
    } else if (stockStatus === 'in') {
      query.stock = { $gt: 0 };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { ratingAvg: -1 };
    else if (sort === 'name') sortOption = { name: 1 };
    else if (sort === 'stock_asc') sortOption = { stock: 1 };
    else if (sort === 'stock_desc') sortOption = { stock: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('GetProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single product by slug
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('GetProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single product by ID (for admin editing)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('GetProductById error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, description, detailedDescription, category, 
      price, stock, image, images, specifications, isAvailable, isActive 
    } = req.body;

    // Verify category exists
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    // Set primary thumbnail image if not provided but images array exists
    let primaryImage = image;
    if (!primaryImage && Array.isArray(images) && images.length > 0) {
      primaryImage = images[0];
    }

    const product = await Product.create({
      name, 
      description, 
      detailedDescription, 
      category, 
      price: Number(price), 
      stock: Number(stock), 
      image: primaryImage || '', 
      images: Array.isArray(images) ? images : (primaryImage ? [primaryImage] : []),
      specifications: Array.isArray(specifications) ? specifications : [], 
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A product with this name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updates = req.body;
    
    // If name changes, regenerate slug
    if (updates.name && updates.name !== product.name) {
      product.name = updates.name;
      product.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (updates.description !== undefined) product.description = updates.description;
    if (updates.detailedDescription !== undefined) product.detailedDescription = updates.detailedDescription;
    if (updates.category !== undefined) product.category = updates.category;
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.stock !== undefined) {
      product.stock = Number(updates.stock);
      if (product.stock === 0) product.isAvailable = false;
    }
    if (updates.image !== undefined) product.image = updates.image;
    if (updates.images !== undefined && Array.isArray(updates.images)) {
      product.images = updates.images;
      if (!product.image && updates.images.length > 0) {
        product.image = updates.images[0];
      }
    }
    if (updates.specifications !== undefined) product.specifications = updates.specifications;
    if (updates.isAvailable !== undefined) product.isAvailable = Boolean(updates.isAvailable);
    if (updates.isActive !== undefined) product.isActive = Boolean(updates.isActive);

    await product.save();
    await product.populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
