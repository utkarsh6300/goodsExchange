
import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';



import { Container, Typography } from '@mui/material';

import { productService } from '../services';

import { useAuth } from '../contexts/AuthContext';

import ProductList from '../components/ProductList';

import ProductFilter from '../components/ProductFilter';



function ManageProducts() {

  const [products, setProducts] = useState([]);

  const [filterCategory, setFilterCategory] = useState('');

  const [sortOption, setSortOption] = useState('time'); // Default sorting by time



  const categories=[ "smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting","others" ];



  const navigate = useNavigate();



  const { dispatch } = useAuth();



  useEffect(() => {

    // Fetch products from your API

    productService.getMyProducts()

      .then(response => {

        setProducts(response.data);

      })

      .catch(error => {

        if(error.response.status==400)

     { 

      dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });

      return;

    }

        dispatch({ type: 'SET_ERROR', payload: 'Error fetching products' });

        console.error('Error fetching products:', error);

      });

  }, []);



  const handleFilterCategoryChange = (event) => {

    setFilterCategory(event.target.value);

  };



  const handleSortOptionChange = (event) => {

    setSortOption(event.target.value);

  };



  const filteredProducts = products.filter(product => {

    if (filterCategory === '') {

      return true;

    }

    return product.category === filterCategory;

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

    navigate(`/manage-product/${productId}`);

  };



  return (

    <Container>

      <Typography variant="h4" gutterBottom>

        All Products

      </Typography>

      <ProductFilter

        filterCategory={filterCategory}

        handleFilterCategoryChange={handleFilterCategoryChange}

        sortOption={sortOption}

        handleSortOptionChange={handleSortOptionChange}

        categories={categories}

        showSearch={false}

      />

      <ProductList products={sortedProducts} onProductClick={handleProductClick} />

    </Container>

  );

}



export default ManageProducts;  
