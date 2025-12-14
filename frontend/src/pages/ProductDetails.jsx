

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useParams } from 'react-router';
import { productService, chatService } from '../services';
import {
  Container,
  Typography,
  Paper,
  ImageList,
  ImageListItem,
  Button,
  Box,
} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({});
  const navigate = useNavigate();

  const { dispatch, state } = useAuth();
  const currentUserId = state.user?.id || localStorage.getItem('userId');

  useEffect(() => {
    // Fetch product details
    productService.getProductById(productId)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => {
        if (error.response?.status == 400) {
          dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
          return;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching product details' });
        console.error('Error fetching product details:', error);
      });
  }, [productId, dispatch]);

  const handleContactSeller = async () => {
    // Check if user is logged in
    if (!state.loggedIn) {
      dispatch({ type: 'SET_ERROR', payload: 'Please login to contact seller' });
      navigate("/login");
      return;
    }

    // Prevent contacting yourself
    if (product.owner && product.owner === currentUserId) {
      dispatch({ type: 'SET_ERROR', payload: 'You cannot contact yourself' });
      return;
    }

    try {
      // Create or get existing conversation
      const response = await chatService.createOrGetConversation(
        product.owner,
        productId
      );
      
      // Navigate to chat page
      navigate('/chat');
    } catch (error) {
      console.error('Error initiating chat:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start conversation with seller' });
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Product Details
      </Typography>
      <Paper elevation={3} style={{ padding: '16px' }}>
        <Typography variant="h6">Name: {product.name}</Typography>
        <Typography variant="body1">Category: {product.category}</Typography>
        <Typography variant="body1">Subcategory: {product.subCategory}</Typography>
        <Typography variant="body1">Price: ₹ {product.price}</Typography>
        <Typography variant="body1">Quantity: {product.quantity}</Typography>
        {product.address && (
          <Typography variant="body1">Location: {product.address}</Typography>
        )}
        <Typography variant="h6">Images:</Typography>
        {product.imagesUrls && product.imagesUrls.length > 0 ? (
          <ImageList cols={3} rowHeight={460} style={{ padding: '16px' }}>
            {product.imagesUrls.map((imageUrl, index) => (
              <ImageListItem key={index} style={{ maxWidth: '100%' }}>
                <img src={imageUrl} alt={`Image ${index}`} style={{ maxWidth: '100%' }} />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography variant="body2" color="textSecondary">No images available</Typography>
        )}

        <Typography variant="body1" margin={8}>Description: {product.description}</Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
          {product.owner && product.owner !== state.user?.id ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleContactSeller}
            >
              Contact Seller
            </Button>
          ) : (
            <Typography variant="body2" color="textSecondary">
              This is your product
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductDetails;
