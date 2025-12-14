
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { api_url } from '../constants/url';
import ProductForm from '../components/ProductForm';

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
    quantity: '',
    address: ''
  });
  const [coordinates, setCoordinates] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({ loading: false, message: '', isError: false });
  
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
        if (response.data.location) {
          setCoordinates(response.data.location.coordinates);
        }
      })
      .catch(error => {
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching product details' });
        console.error('Error fetching product details:', error);
      });
  }, [productId, dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setVerificationStatus({ loading: false, message: 'Location fetched successfully!', isError: false });
        },
        (error) => {
          console.error(error);
          dispatch({ type: 'SET_ERROR', payload: 'Error getting location' });
        }
      );
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Geolocation is not supported by this browser.' });
    }
  };

  const handleVerifyAddress = async () => {
    setVerificationStatus({ loading: true, message: '', isError: false });
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(productData.address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates([parseFloat(lon), parseFloat(lat)]);
        setVerificationStatus({ loading: false, message: 'Address verified successfully!', isError: false });
      } else {
        setCoordinates(null);
        setVerificationStatus({ loading: false, message: 'Address not found. Please try again.', isError: true });
      }
    } catch (error) {
      console.error('Error verifying address:', error);
      setCoordinates(null);
      setVerificationStatus({ loading: false, message: 'Failed to verify address.', isError: true });
    }
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
            navigate('/manage-products');
          })
          .catch(error => {
            if(error.response && error.response.status === 400) {
              dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
            } else {
              dispatch({ type: 'SET_ERROR', payload: 'Error deleting product' });
            }
            console.error('Error deleting product:', error);
          });
      } else {
        // If the "Save Product Details" button is clicked
        if (!coordinates) {
          dispatch({ type: 'SET_ERROR', payload: 'Please set a location for the product.' });
          return;
        }
    
        const updatedProductData = {
          ...productData,
          coordinates: JSON.stringify(coordinates),
        };
        axios.put(`${api_url}/product/update/${productId}`, updatedProductData, config)
          .then(response => {
            dispatch({ type: 'SET_SUCCESS', payload: 'Product updated successfully' });
            navigate('/manage-products');
          })
          .catch(error => {
            if(error.response && error.response.status === 400) {
              dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
            } else {
              dispatch({ type: 'SET_ERROR', payload: 'Error updating product' });
            }
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
        <ProductForm
          productData={productData}
          handleChange={handleChange}
          categories={categories}
          handleLocation={handleLocation}
          handleVerifyAddress={handleVerifyAddress}
          coordinates={coordinates}
          verificationStatus={verificationStatus}
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }} disabled={!coordinates}>
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
