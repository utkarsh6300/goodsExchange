import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { productService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import ProductList from '../components/ProductList';
import HeroBanner from '../components/HeroBanner';

const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  useEffect(() => {
    // Fetch products from your API
    productService.getAllProducts()
      .then(response => {
        setProducts(response.data.slice(0, 6)); // Displaying only 6 products on the home page
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
          return;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching products' });
        console.error('Error fetching products:', error);
      });
  }, [dispatch]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <HeroBanner />
      <Container>
        <Typography variant="h4" gutterBottom style={{ marginTop: '40px' }}>
          Featured Products
        </Typography>
        <ProductList products={products} onProductClick={handleProductClick} />
      </Container>
    </>
  );
};

export default Home;
