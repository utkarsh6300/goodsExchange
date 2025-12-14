import React, { useState } from 'react';
import { Card, CardContent, Typography, CardMedia, IconButton, Box } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import GrainIcon from '@mui/icons-material/Grain';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import EggIcon from '@mui/icons-material/Egg';
import KebabDiningIcon from '@mui/icons-material/KebabDining';
import YardIcon from '@mui/icons-material/Yard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const ProductCard = ({ product, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.imagesUrls.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.imagesUrls.length) % product.imagesUrls.length);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'grains':
        return <GrainIcon />;
      case 'vegetables':
        return <GrassIcon />;
      case 'fruits':
        return <LocalFloristIcon />;
      case 'dairy':
        return <EggIcon />;
      case 'livestock':
        return <KebabDiningIcon />;
      case 'plants/seeds':
        return <YardIcon />;
      default:
        return <HelpOutlineIcon />;
    }
  };

  return (
    <Card onClick={onClick} style={{ cursor: 'pointer', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <div style={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={product.imagesUrls[currentImageIndex]}
          alt={`Product ${product._id} Image ${currentImageIndex}`}
        />
        {product.imagesUrls.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevImage}
              style={{ position: 'absolute', top: '50%', left: '0', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <ArrowBackIos />
            </IconButton>
            <IconButton
              onClick={handleNextImage}
              style={{ position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <ArrowForwardIos />
            </IconButton>
          </>
        )}
      </div>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getCategoryIcon(product.category)}
          <Typography variant="h6" component="div">
            {product.name}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          RS. {product.price} only
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quantity: {product.quantity}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Address: {product.address}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
