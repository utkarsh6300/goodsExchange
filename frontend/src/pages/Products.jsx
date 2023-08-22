
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
  Container, Typography, Grid, Card, CardContent, ImageList, ImageListItem, Select, MenuItem, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOption, setSortOption] = useState('time'); // Default sorting by time
  const [searchTerm, setSearchTerm] = useState('');

 const categories=[ "smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting","others" ];


  const navigate = useNavigate(); 
  const { state, dispatch } = useAuth();

 
  useEffect(() => {
    // Fetch products from your API
    const config = {
      headers: {
        'token': localStorage.getItem('token'),
        // ...formData.getHeaders(), // Include other headers from FormData
      },
    };
    axios.get('http://localhost:5000/api/product/get-all',config)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        if(error.response.status==400)
     { 
      dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
      return;
    }
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching products' });
        console.error('Error fetching products:', error);
      });
  }, []);

  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
    setSearchTerm('');
  };

  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product => {
    if (filterCategory === '' && searchTerm === '') {
      return true;
    }

    const categoryMatch = product.category === filterCategory || filterCategory === '';
    const searchTermMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    return categoryMatch && searchTermMatch;
  });

  const sortedProducts = filteredProducts.slice().sort((a, b) => {
    if (sortOption === 'time') {
      return b.createdAt.localeCompare(a.createdAt); // Sort by time (newest first)
    } else if (sortOption === 'price') {
      return a.price - b.price; // Sort by price (ascending)
    }
    return 0;
  });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        All Products
      </Typography>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Select value={filterCategory} onChange={handleFilterCategoryChange}>
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(category => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
        <Select value={sortOption} onChange={handleSortOptionChange}>
          <MenuItem value="time">Sort by Time</MenuItem>
          <MenuItem value="price">Sort by Price</MenuItem>
        </Select>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search products"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <Grid container spacing={2}>
        {sortedProducts.map(product => (
          <Grid item xs={12} sm={6} key={product._id} onClick={() => navigate(`/product/${product._id}`)}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Product Name {product.name}</Typography>
                <Typography variant="body1">RS. {product.price} only</Typography>
                <Typography variant="body2">Quantity: {product.quantity}</Typography>
              </CardContent>
              <ImageList cols={2} rowHeight={160} style={{ padding: '16px' }}>
                {product.imagesUrls.map((imageUrl, index) => (
                  <ImageListItem key={index}>
                    <img src={imageUrl} alt={`Product ${product._id} Image ${index}`} />
                  </ImageListItem>
                ))}
              </ImageList>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ProductsPage;