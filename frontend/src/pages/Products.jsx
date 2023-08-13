import React, { useState, useEffect } from 'react';
import { Grid, Container, Typography, Paper } from '@mui/material';
import axios from 'axios';

function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products from your API
    axios.get('http://localhost:5000/api/product/get-all')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        All Products
      </Typography>
      <Grid container spacing={2}>
        {products.map(product => (
          <Grid item xs={4} key={product._id}>
            <Paper elevation={2} style={{ padding: '16px' }}>
              <Typography variant="subtitle1">{product.name}</Typography>
              <Typography variant="body2">{product.description}</Typography>
              <Typography variant="body1">${product.price}</Typography>
              <Typography variant="body2">Quantity: {product.quantity}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ProductsPage;
