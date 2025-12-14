
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button
} from '@mui/material';
import { productService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import ProductList from '../components/ProductList';
import ProductFilterSidebar from '../components/ProductFilterSidebar';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [radius, setRadius] = useState(10);

  const navigate = useNavigate();
  const { dispatch } = useAuth();

  useEffect(() => {
    const fetchAllProducts = () => {
      productService.getAllProducts()
        .then(response => {
          setProducts(response.data);
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
            return;
          }
          dispatch({ type: 'SET_ERROR', payload: 'Error fetching products' });
          console.error('Error fetching products:', error);
        });
    };

    const fetchInitialProducts = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            productService.getAllProducts(latitude, longitude, 10) // default radius 10km
              .then(response => {
                setProducts(response.data);
              })
              .catch(error => {
                console.error('Error fetching nearby products, falling back to all products:', error);
                fetchAllProducts(); // fallback
              });
          },
          (err) => {
            console.warn(`Geolocation error: ${err.message}. Fetching all products.`);
            fetchAllProducts(); // fallback
          }
        );
      } else {
        console.warn('Geolocation not supported. Fetching all products.');
        fetchAllProducts(); // fallback
      }
    };

    fetchInitialProducts();
  }, [dispatch]);

  const handleLocationSearch = () => {
    if (!navigator.geolocation) {
      dispatch({ type: 'SET_ERROR', payload: 'Geolocation is not supported by your browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        productService.getAllProducts(latitude, longitude, radius)
          .then(response => {
            setProducts(response.data);
          })
          .catch(error => {
            dispatch({ type: 'SET_ERROR', payload: 'Error fetching nearby products' });
            console.error('Error fetching nearby products:', error);
          });
      },
      (err) => {
        dispatch({ type: 'SET_ERROR', payload: 'Unable to retrieve your location.' });
        console.error('Geolocation error:', err);
      }
    );
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        All Products
      </Typography>
      <Button onClick={() => setIsFilterSidebarOpen(true)}>Filters</Button>
      <ProductFilterSidebar
        open={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        handleLocationSearch={handleLocationSearch}
        setRadius={setRadius}
        radius={radius}
      />
      <ProductList products={products} onProductClick={handleProductClick} />
    </Container>
  );
}

export default ProductsPage;