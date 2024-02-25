const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Product = require('../../models/Product');
const User=require('../../models/User');
const authMiddleware = require('../../middlewares/authMiddleware');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const fs = require('fs').promises;
const path = require('path');

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.YOUR_CLOUD_NAME,
  api_key:process.env.YOUR_API_KEY ,
  api_secret:process.env.YOUR_API_SECRET
});

// Endpoint to save a new product (only owner can save)
router.post(
  '/save',
  authMiddleware,
  upload.array('images', 3), // This expects the form field name to be 'images'
  [
    check('name', 'Product name is required').not().isEmpty(),
    check('category', 'Product category is required').not().isEmpty(),
    check('price', 'Product price must be greater than or equal to zero').isInt({ min: 0 }),
    check('quantity', 'Quantity is required').not().isEmpty(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from req body
    const { name, description, category, subCategory, price, quantity } = req.body;

    try {
      const images = [];

     
      
        // Upload images to Cloudinary and store URLs
        for (const file of req.files) {
          // Save buffer as a temporary file on the server
          const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
          await fs.writeFile(tempFilePath, file.buffer);
  
          // Upload the temporary file to Cloudinary
          const result = await cloudinary.uploader.upload(tempFilePath);
          images.push(result.secure_url);
  
          // Delete the temporary file
          await fs.unlink(tempFilePath);
        }
     
      // Create a new product with owner reference and image URLs 
      const newProduct = new Product({
        name,
        description,
        category,
        subCategory,
        price,
        quantity,
        imagesUrls:images,
        owner: req.user.id,
      });

      // Save the product
      await newProduct.save();

      res.json({images, msg: 'Product saved successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);


// Endpoint to update product details (excluding images)
router.put(
  '/update/:productId',
  authMiddleware,
  [
    check('name', 'Product name is required').not().isEmpty(),
    check('category', 'Product category is required').not().isEmpty(),
    check('price', 'Product price is required').not().isEmpty(),
    check('quantity', 'Quantity must be greater than or equal to zero').isInt({ min: 0 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.productId;
    const { name, description, category, subCategory, price, quantity } = req.body;

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

      // Update product details (excluding images)
      product.name = name;
      product.description = description;
      product.category = category;
      product.subCategory = subCategory;
      product.price = price;
      product.quantity = quantity;
      
      await product.save();

      res.json({ msg: 'Product details updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);
// Endpoint to update quantity of a product to zero (only owner can update)

router.get(
  '/update-quantity/:productId',
  authMiddleware,
  async (req, res) => {
    
 
    const productId = req.params.productId;

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
      product.quantity = 0;
      await product.save();

      res.status(200).json({ msg: 'Product quantity updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);



router.get('/get-all', authMiddleware,async (req, res) => {
  try {
    const products = await Product.find({ quantity:{$gt:0}}).limit(50);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get a product by ID
router.get('/get/:productId', authMiddleware,async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Endpoint to get all products owned by the current user
router.get('/my-products', authMiddleware, async (req, res) => {
  try {
    // Find all products owned by the current user
    const products = await Product.find({ owner: req.user.id, quantity:{$gt:0} });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});




module.exports = router;
