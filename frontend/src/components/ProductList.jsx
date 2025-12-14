import { Grid } from '@mui/material';
import ProductCard from './ProductCard';

const ProductList = ({ products, onProductClick }) => {
  return (
    <Grid container spacing={2}>
      {products.map(product => (
        <Grid item xs={12} sm={6} key={product._id} onClick={() => onProductClick(product._id)}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
