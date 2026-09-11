const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with search, filter, sort, pagination
exports.getProducts = async (req, res) => {
  try {
    const { 
      search, category, minPrice, maxPrice, 
      available, sort, page = 1, limit = 12 
    } = req.query;

    const query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
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

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { ratingAvg: -1 };
    else if (sort === 'name') sortOption = { name: 1 };

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

// Create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, detailedDescription, category, price, stock, image, specifications, isAvailable } = req.body;

    // Verify category exists
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const product = await Product.create({
      name, description, detailedDescription, category, 
      price, stock, image, specifications, isAvailable
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
    }

    const fields = ['description', 'detailedDescription', 'category', 'price', 'stock', 'image', 'specifications', 'isAvailable'];
    fields.forEach(field => {
      if (updates[field] !== undefined) {
        product[field] = updates[field];
      }
    });

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
