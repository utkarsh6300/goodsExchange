import React from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Slider, TextField, Checkbox, FormControlLabel } from '@mui/material';

const ProductFilterSidebar = ({ open, onClose }) => {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <div style={{ width: '250px', padding: '16px' }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <List>
          <ListItem>
            <TextField label="Location" variant="outlined" fullWidth />
          </ListItem>
          <ListItem>
            <Typography gutterBottom>Price Range</Typography>
            <Slider
              defaultValue={[0, 1000]}
              aria-labelledby="range-slider"
              valueLabelDisplay="auto"
            />
          </ListItem>
          <ListItem>
            <Typography gutterBottom>Category</Typography>
            <FormControlLabel control={<Checkbox />} label="Electronics" />
            <FormControlLabel control={<Checkbox />} label="Clothing" />
            <FormControlLabel control={<Checkbox />} label="Home Goods" />
          </ListItem>
          <ListItem>
            <Typography gutterBottom>Sort By</Typography>
            <FormControlLabel control={<Checkbox />} label="Freshness" />
            <FormControlLabel control={<Checkbox />} label="Time" />
          </ListItem>
          <ListItem>
            <FormControlLabel control={<Checkbox />} label="In Stock" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default ProductFilterSidebar;
