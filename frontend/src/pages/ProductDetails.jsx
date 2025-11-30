

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useParams } from 'react-router';
import { productService } from '../services';
import { userService } from '../services';
import {
  Container,
  Typography,
  Paper,
  ImageList,
  ImageListItem,
  Button,
} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({});
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState('');
  const navigate = useNavigate();

  const { dispatch } = useAuth();

//  //slideshow logic
//   const [activeSlide, setActiveSlide] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveSlide((prevSlide) => (prevSlide + 1) % product.imagesUrls.length);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [product.imagesUrls]);

//   const handleNextClick = () => {
//     setActiveSlide((prevSlide) => (prevSlide + 1) % product.imagesUrls.length);
//   };

//   const handlePrevClick = () => {
//     setActiveSlide((prevSlide) =>
//       prevSlide === 0 ? product.imagesUrls.length - 1 : prevSlide - 1
//     );
//   };

  useEffect(() => {
    // Fetch product details
    productService.getProductById(productId)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => {
        if (error.response.status == 400) {
          dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
          return;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching product details' });
        console.error('Error fetching product details:', error);
      });
  }, [productId]);

  const fetchOwnerPhoneNumber = () => {
    // Fetch owner's phone number using owner's ID
    userService.getPhoneNumber(product.owner)
      .then(response => {
        setOwnerPhoneNumber(response.data.phoneNumber);
      })
      .catch(error => {
        if (error.response.status == 400) {
          dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
          return;
        } else if (error.response.status == 401) {
          dispatch({ type: 'SET_ERROR', payload: "needs to login" });
          navigate("/login");
          return;
        } else if (error.response.status == 409) {
          dispatch({ type: 'SET_ERROR', payload: "needs to verify number" });
          navigate("/VerifyPhone");
          return;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching owner phone number' });
        console.error('Error fetching owner phone number:', error);
      });
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
       

      {/* <div className="slideshow-container">
  {product.imagesUrls &&
    product.imagesUrls.map((imageUrl, index) => (
      <div
        className={`slide ${index === activeSlide ? 'active' : ''}`}
        key={index}
      >
        <img src={imageUrl} alt={`Image ${index}`} />
      </div>
    ))}
  <button className="prev" onClick={handlePrevClick}>
    &#10094;
  </button>
  <button className="next" onClick={handleNextClick}>
    &#10095;
  </button>
</div> */}


        <Typography variant="body1" margin={8}>Description: {product.description}</Typography>


      <Typography variant="h6">Do not misuse number,we will track of who accesed whom number and will give it to police if required. </Typography>
      
        {ownerPhoneNumber ? (
          <Typography variant="body1">Owner&apos;s Phone Number: {ownerPhoneNumber}</Typography>
        ) : (
          <Button variant="contained" color="primary" onClick={fetchOwnerPhoneNumber}>
            Get Owner&apos;s Phone Number
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default ProductDetails;
