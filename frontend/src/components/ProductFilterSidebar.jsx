import React from 'react';
import { Drawer, List, ListItem, Typography, Slider, Button } from '@mui/material';

const ProductFilterSidebar = ({ open, onClose, handleLocationSearch, setRadius, radius }) => {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <div style={{ width: '250px', padding: '16px' }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <List>
          <ListItem>
            <Button variant="contained" color="primary" onClick={handleLocationSearch}>
              Find Nearby Products
            </Button>
          </ListItem>
          <ListItem>
            <Typography gutterBottom>Radius (in km)</Typography>
            <Slider
              defaultValue={10}
              aria-labelledby="range-slider"
              valueLabelDisplay="auto"
              onChange={(e, val) => setRadius(val)}
              value={radius}
              max={100}
            />
            <Typography variant="body2">{radius} km</Typography>
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default ProductFilterSidebar;
