import React, { useState } from 'react';
import { Container, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Input, Paper, ImageList, ImageListItem } from '@mui/material';
import axios from 'axios';

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImagesChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      setProductData(prevData => ({
        ...prevData,
        images: Array.from(files),
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create FormData for sending files
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('subCategory', productData.subCategory);
    formData.append('price', productData.price);
    formData.append('quantity', productData.quantity);
    productData.images.forEach(image => {
      formData.append('images', image);
    });

    // Send product data to the API
    axios.post('http://localhost:5000/api/product/save', formData)
      .then(response => {
        console.log('Product added successfully:', response.data);
        // Reset form fields after successful submission
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
      .catch(error => {
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
          label="Name"
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
          fullWidth
          name="description"
          value={productData.description}
          onChange={handleChange}
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={productData.category}
            onChange={handleChange}
            required
          >
            <MenuItem value="Electronics">Electronics</MenuItem>
            <MenuItem value="Clothing">Clothing</MenuItem>
            {/* Add more categories */}
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
          label="Price"
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
          type="number"
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
           {productData.images.length > 0 && (
          <Paper elevation={3} style={{ marginTop: '16px', padding: '16px' }}>
            <Typography variant="subtitle1">Uploaded Images:</Typography>
            <ImageList cols={4} rowHeight={160} gap={16}>
              {productData.images.map((image, index) => (
                <ImageListItem key={index}>
                  <img src={URL.createObjectURL(image)} alt={`Image ${index}`} style={{ maxWidth: '100%' }} />
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
