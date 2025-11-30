import { TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';

const ProductForm = ({ productData, handleChange, categories, handleLocation, coordinates }) => {
  return (
    <>
      <TextField
        label="Name of product"
        variant="outlined"
        fullWidth
        name="name"
        value={productData.name}
        onChange={handleChange}
        required
        margin="normal"
      />
      <TextField
        label="Description"
        variant="outlined"
        name="description"
        fullWidth
        multiline
        rows={12}
        value={productData.description}
        onChange={handleChange}
        required
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Category*</InputLabel>
        <Select
          name="category"
          value={productData.category}
          onChange={handleChange}
          required
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Subcategory"
        variant="outlined"
        fullWidth
        name="subCategory"
        value={productData.subCategory}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        label="Price per unit In Rupees"
        variant="outlined"
        fullWidth
        type="number"
        name="price"
        value={productData.price}
        onChange={handleChange}
        required
        margin="normal"
      />
      <TextField
        label="Quantity"
        variant="outlined"
        fullWidth
        name="quantity"
        type="number"
        value={productData.quantity}
        onChange={handleChange}
        required
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLocation}
        style={{ marginTop: '1rem' }}
      >
        Get My Location
      </Button>
      {coordinates && (
        <Typography variant="body2" style={{ marginTop: '0.5rem' }}>
          {`Latitude: ${coordinates[1]}, Longitude: ${coordinates[0]}`}
        </Typography>
      )}
      <TextField
        label="Address"
        variant="outlined"
        fullWidth
        name="address"
        value={productData.address}
        onChange={handleChange}
        margin="normal"
      />
    </>
  );
};

export default ProductForm;
