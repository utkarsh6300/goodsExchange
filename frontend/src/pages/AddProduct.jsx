import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  ImageList,
  ImageListItem,
} from '@mui/material';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';
import { api_url } from '../constants/url';

function AddProduct() {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    price: '',
    quantity: '',
    images: [],
  });
  const [imageError, setImageError] = useState('');
  const categories = [
    'smartphones',
    'laptops',
    'fragrances',
    'skincare',
    'groceries',
    'home-decoration',
    'furniture',
    'tops',
    'womens-dresses',
    'womens-shoes',
    'mens-shirts',
    'mens-shoes',
    'mens-watches',
    'womens-watches',
    'womens-bags',
    'womens-jewellery',
    'sunglasses',
    'automotive',
    'motorcycle',
    'lighting',
    'others',
  ];

  const { state, dispatch } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImagesChange = (event) => {
    const files = event.target.files;
    const maxFiles = 3;
    const maxSize = 1 * 1024 * 1024; // 1MB

    if (files.length > maxFiles) {
      setImageError(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    const oversizedFiles = Array.from(files).filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setImageError('Each image must be smaller than 1MB.');
      return;
    }

    setImageError('');
    setProductData((prevData) => ({
      ...prevData,
      images: Array.from(files),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('subCategory', productData.subCategory);
    formData.append('price', productData.price);
    formData.append('quantity', productData.quantity);

    productData.images.forEach((image) => {
      formData.append('images', image);
    });

    const config = {
      headers: {
        token: localStorage.getItem('token'),
      },
    };

    axios
      .post(`${api_url}/product/save`, formData, config)
      .then((response) => {
        dispatch({ type: 'SET_SUCCESS', payload: 'Product added successfully' });
        console.log('Product added successfully:', response.data);
        setProductData({
          name: '',
          description: '',
          category: '',
          subCategory: '',
          price: '',
          quantity: '',
          images: [],
        });
      })
      .catch((error) => {
        if (error.response.status === 400) {
          dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
          return;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Error adding product' });
        console.error('Error adding product:', error);
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name of product"
          variant="outlined"
          fullWidth
          name="name"
          value={productData.name}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          label="Description"
          variant="outlined"
          name="description"
          fullWidth
          multiline
          rows={12}
          value={productData.description}
          onChange={handleChange}
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Category*</InputLabel>
          <Select
            name="category"
            value={productData.category}
            onChange={handleChange}
            required
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Subcategory"
          variant="outlined"
          fullWidth
          name="subCategory"
          value={productData.subCategory}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Price per unit In Rupees"
          variant="outlined"
          fullWidth
          type="number"
          name="price"
          value={productData.price}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          label="Quantity"
          variant="outlined"
          fullWidth
          name="quantity"
          value={productData.quantity}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          style={{ marginTop: '16px' }}
        />
        {imageError && (
          <Typography color="error" variant="subtitle2" style={{ marginTop: '8px' }}>
            {imageError}
          </Typography>
        )}
        {productData.images.length > 0 && (
          <Paper elevation={3} style={{ marginTop: '16px', padding: '16px' }}>
            <Typography variant="subtitle1">Uploaded Images:</Typography>
            <ImageList cols={4} rowHeight={160} gap={16}>
              {productData.images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Image ${index}`}
                    style={{ maxWidth: '100%' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        )}
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }}>
          Add Product
        </Button>
      </form>
    </Container>
  );
}

export default AddProduct;
