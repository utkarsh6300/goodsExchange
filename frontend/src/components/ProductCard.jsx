import { Card, CardContent, Typography, ImageList, ImageListItem } from '@mui/material';

const ProductCard = ({ product, onClick }) => {
  return (
    <Card onClick={onClick} style={{ cursor: 'pointer' }}>
      <CardContent>
        <Typography variant="subtitle1">Product Name: {product.name}</Typography>
        <Typography variant="body1">RS. {product.price} only</Typography>
        <Typography variant="body2">Quantity: {product.quantity}</Typography>
      </CardContent>
      <ImageList cols={2} rowHeight={160} style={{ padding: '16px' }}>
        {product.imagesUrls.map((imageUrl, index) => (
          <ImageListItem key={index}>
            <img src={imageUrl} alt={`Product ${product._id} Image ${index}`} />
          </ImageListItem>
        ))}
      </ImageList>
    </Card>
  );
};

export default ProductCard;
