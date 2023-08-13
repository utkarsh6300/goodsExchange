const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Product = require('../../models/Product');
const authMiddleware = require('../../middlewares/authMiddleware');

// Endpoint to save a new product
router.post(
  '/save',
  authMiddleware, // Protect the route with auth middleware
  [
    check('name', 'Product name is required').not().isEmpty(),
    check('category', 'Product category is required').not().isEmpty(),
    check('price', 'Product price is required').not().isEmpty(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from req body
    const { name, description, category, subCategory, price, quantity, imageUrl } = req.body;

    try {
      // Create a new product
      const newProduct = new Product({
        name,
        description,
        category,
        subCategory,
        price,
        quantity,
        imageUrl,
        owner: req.user.id,
      });

      // Save the product
      await newProduct.save();

      res.json({ msg: 'Product saved successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);




// Endpoint to update quantity of a product (only owner can update)

router.patch(
  '/update-quantity/:productId',
  authMiddleware,
  [
    check('quantity', 'Quantity must be a positive number').isInt({ min: 0 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.productId;
    const { quantity } = req.body;

    try {
      // Find the product by ID
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      // Check if the authenticated user is the owner of the product
      if (product.owner.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'You are not the owner of this product' });
      }

      // Update the quantity
      product.quantity = quantity;
      await product.save();

      res.json({ msg: 'Product quantity updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);
router.get('/get-all', async (req, res) => {
  try {
    const products = await Product.find().limit(30);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
