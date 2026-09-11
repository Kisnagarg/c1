const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories with product counts
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Get product counts for each category
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const result = categories.map(cat => ({
      ...cat,
      productCount: countMap[cat._id.toString()] || 0
    }));

    res.json({ success: true, categories: result });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single category with products
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('GetCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create category (admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({ name, description, image });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    console.error('CreateCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update category (admin)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { name, description, image } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    console.error('UpdateCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
  try {
    // Check if products exist in this category
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. ${productCount} product(s) are still assigned to it.` 
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('DeleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
