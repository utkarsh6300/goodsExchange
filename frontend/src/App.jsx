import React, { useState } from 'react';
import './app.css';

import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';


import Products from './pages/Products';
import ManageProducts from './pages/ManageProducts';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyPhone from './pages/VerifyPhone';
import Navbar from './components/Navbar';
import AddProduct from './pages/AddProduct';
import ProductDetails from './pages/ProductDetails';
import EditProduct from './pages/EditProduct';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <div className="App">
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Products />} />
        <Route
          path="/manage-products"
          element={isLoggedIn ? <ManageProducts /> : <Navigate to="/login" />}
        />
        <Route
          path="/products"
          element={isLoggedIn ? <Products /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-product"
          element={isLoggedIn ? <AddProduct /> : <Navigate to="/login" />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/VerifyPhone"
          element={isLoggedIn ? <Navigate to="/" /> : <VerifyPhone />}
        />
         <Route path="/product/:productId" element={<ProductDetails />} />
         <Route path="/manage-product/:productId" element={<EditProduct />} />
      </Routes>
    </Router>
    </div>
  );
}
export default App;
