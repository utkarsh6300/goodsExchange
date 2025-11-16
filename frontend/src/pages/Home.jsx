import { Link } from 'react-router-dom';
import { Container, Typography, Button, Grid, Card, CardContent, CardActions } from '@mui/material';

const Home = () => {
  return (
    <Container>
      <Typography variant="h2" align="center" gutterBottom>Welcome to our Village Marketplace</Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        A platform where villagers can buy and sell locally produced goods
      </Typography>
      <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ marginTop: '40px' }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Sell Locally Produced Goods
              </Typography>
              <Typography variant="body1" color="textSecondary">
                List your locally produced goods like milk, grains, maize, wheat, and more for sale on our platform.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/add-product" variant="contained" color="primary">
                Add Product
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Buy Local Products
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Explore locally produced goods listed by other villagers and purchase what you need. Enjoy exploring.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/products" variant="contained" color="primary">
                View Products
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
