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

module.exports = router;
