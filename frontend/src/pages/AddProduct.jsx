import { useState } from 'react';
import { Container, Typography, Button, Paper, ImageList, ImageListItem } from '@mui/material';
import { productService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import ProductForm from '../components/ProductForm';

function AddProduct() {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    price: '',
    quantity: '',
    images: [],
    address: '',
  });
  const [coordinates, setCoordinates] = useState(null);
  const categories=[ "smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting","others" ];

const { dispatch } = useAuth();

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

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
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
    formData.append('address', productData.address);
    formData.append('coordinates', JSON.stringify(coordinates));
    productData.images.forEach(image => {
      formData.append('images', image);
    });

    // Send product data to the API
    productService.saveProduct(formData)
      .then(response => {
        dispatch({ type: 'SET_SUCCESS', payload: 'Product added successfully' });
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
          address: '',
        });
        setCoordinates(null);
      })
      .catch(error => {
        if(error.response.status==400)
     { 
      dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
      return;
    }
        dispatch({ type: 'SET_ERROR', payload: 'Error adding product' });
        console.error('Error adding product:', error);
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <ProductForm
          productData={productData}
          handleChange={handleChange}
          categories={categories}
          handleLocation={handleLocation}
          coordinates={coordinates}
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
