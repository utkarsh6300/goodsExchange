
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button
} from '@mui/material';
import { productService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import ProductList from '../components/ProductList';
import ProductFilterSidebar from '../components/ProductFilterSidebar';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOption, setSortOption] = useState('time'); // Default sorting by time
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const categories = ["smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting", "others"];

  const navigate = useNavigate();
  const { dispatch } = useAuth();

  useEffect(() => {
    // Fetch products from your API
    productService.getAllProducts()
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        if (error.response.status == 400) {
          dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
          return;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching products' });
        console.error('Error fetching products:', error);
      });
  }, []);

  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
    setSearchTerm('');
  };

  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product => {
    if (filterCategory === '' && searchTerm === '') {
      return true;
    }

    const categoryMatch = product.category === filterCategory || filterCategory === '';
    const searchTermMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    return categoryMatch && searchTermMatch;
  });

  const sortedProducts = filteredProducts.slice().sort((a, b) => {
    if (sortOption === 'time') {
      return b.createdAt.localeCompare(a.createdAt); // Sort by time (newest first)
    } else if (sortOption === 'price') {
      return a.price - b.price; // Sort by price (ascending)
    }
    return 0;
  });

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        All Products
      </Typography>
      <Button onClick={() => setIsFilterSidebarOpen(true)}>Filters</Button>
      <ProductFilterSidebar 
        open={isFilterSidebarOpen} 
        onClose={() => setIsFilterSidebarOpen(false)}
        handleLocationSearch={handleLocationSearch}
        setRadius={setRadius}
        radius={radius}
      />
      <ProductFilterSidebar open={isFilterSidebarOpen} onClose={() => setIsFilterSidebarOpen(false)} />
      <ProductList products={sortedProducts} onProductClick={handleProductClick} />
    </Container>
  );
}

export default ProductsPage;