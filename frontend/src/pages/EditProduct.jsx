
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
        <ProductForm
          productData={productData}
          handleChange={handleChange}
          categories={categories}
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
