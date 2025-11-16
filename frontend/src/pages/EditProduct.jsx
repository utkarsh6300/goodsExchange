
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { useNavigate } from 'react-router-dom'; 

import axios from 'axios';
import {
  Container, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import { api_url } from '../constants/url';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate(); 

  const { dispatch } = useAuth();

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '', 
    subCategory: '',
    price: '',
    quantity: ''
  });
  
  const categories=[ "smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting","others" ];

  useEffect(() => {
    // Fetch product details
    const config = {
      headers: {
        'token': localStorage.getItem('token'),
      },
    };
    axios.get(`${api_url}/product/get/${productId}`, config)
      .then(response => {
        setProductData(response.data);
      })
      .catch(error => {
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching product details' });
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
      
  
      axios.get(`${api_url}/product/update-quantity/${productId}`, config)
        .then(response => {
          dispatch({ type: 'SET_SUCCESS', payload: 'Product deleted successfully' });
          console.log('Product deleted successfully:', response.data);
          // Redirect to a different page or perform additional actions if needed
          navigate('/manage-products');
        })
        .catch(error => {
          if(error.response.status==400)
        { 
      dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
      return;
         }
          dispatch({ type: 'SET_ERROR', payload: 'Error deleting product' });
          console.error('Error deleting product:', error);
        });
    } else {
      // If the "Save Product Details" button is clicked
  
      // Send product data to the API for updating
      axios.put(`${api_url}/product/update/${productId}`, productData, config)
        .then(response => {
          dispatch({ type: 'SET_SUCCESS', payload: 'Product updated successfully' });
          console.log('Product updated successfully:', response.data);
          navigate('/manage-products');
        })
        .catch(error => {
          if(error.response.status==400)
         { 
            dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
            return;
         }
          dispatch({ type: 'SET_ERROR', payload: 'Error updating product' });
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
          multiline   
          rows={12}
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
