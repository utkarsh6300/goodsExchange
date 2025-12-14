import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AgricultureIcon from '@mui/icons-material/Agriculture';

const HeroBanner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f0f0f0',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <Box sx={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
        <NaturePeopleIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <StorefrontIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <AgricultureIcon sx={{ fontSize: 60, color: 'primary.main' }} />
      </Box>
      <Typography variant="h2" component="h1" gutterBottom>
        Buy & Sell Village Products
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        Find the best products from your local community
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <TextField
          variant="outlined"
          placeholder="Search for products..."
          sx={{ width: '400px', marginRight: '10px' }}
        />
        <Button variant="contained" startIcon={<SearchIcon />}>
          Search
        </Button>
      </Box>
    </Box>
  );
};

export default HeroBanner;
