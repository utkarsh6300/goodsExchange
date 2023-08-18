
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { useNavigate } from 'react-router-dom'; 

import axios from 'axios';
import {
  Container, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate(); 

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '', 
    subCategory: '',
    price: '',
    quantity: ''
  });
  
  const categories = ["smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting"];

  useEffect(() => {
    // Fetch product details
    const config = {
      headers: {
        'token': localStorage.getItem('token'),
      },
    };
    axios.get(`http://localhost:5000/api/product/get/${productId}`, config)
      .then(response => {
        setProductData(response.data);
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
      });
  }, [productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

const handleSubmit = (event) => {
    event.preventDefault();
  
    const config = {
      headers: {
        'token': localStorage.getItem('token'),
      },
    };
  
    // If the "Delete-Product" button is clicked
    if (event.nativeEvent.submitter.name === 'deleteButton') {
      
  
      axios.get(`http://localhost:5000/api/product/update-quantity/${productId}`, config)
        .then(response => {
          console.log('Product deleted successfully:', response.data);
          // Redirect to a different page or perform additional actions if needed
          navigate('/manage-products');
        })
        .catch(error => {
          console.error('Error deleting product:', error);
        });
    } else {
      // If the "Save Product Details" button is clicked
  
      // Send product data to the API for updating
      axios.put(`http://localhost:5000/api/product/update/${productId}`, productData, config)
        .then(response => {
          console.log('Product updated successfully:', response.data);
          navigate('/manage-products');
        })
        .catch(error => {
          console.error('Error updating product:', error);
        });
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
      Edit Product
      </Typography>
      <Typography variant="h6">
        If you want to update images delete this product and create a new one
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
          fullWidth
          name="description"
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
            <MenuItem value="Electronics">Electronics</MenuItem>
            <MenuItem value="Clothing">Clothing</MenuItem>
            {/* Add more categories */
            categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))
            
            }
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
       
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }}>
         Save Product Details
        </Button>
        <Button type="submit" variant="contained" color="error" style={{ marginTop: '16px',marginLeft:'6px' }} name="deleteButton">
         Delete-Product
        </Button>   
      </form>
    </Container>


      
         
         
        
    
  );
};

export default EditProduct;
