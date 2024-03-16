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
import Home from './pages/Home';

import { useAuth } from './contexts/AuthContext';

function App() {
  const { state } = useAuth();

  return (
    <div className="App">
    <Router>
      <Navbar />
      <Routes>
        <Route path="/"  element={state.loggedIn ? <Products /> : <Home/>} />
        <Route path="/home"  element={ <Home/> } />
        <Route
          path="/manage-products"
          element={state.loggedIn ? <ManageProducts /> : <Navigate to="/login" />}
        />
        <Route
          path="/products"
          element={state.loggedIn ? <Products /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-product"
          element={state.loggedIn ? <AddProduct /> : <Navigate to="/login" />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={state.loggedIn ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/VerifyPhone"
          element={state.loggedIn ? <Navigate to="/" /> : <VerifyPhone />}
        />
         <Route path="/product/:productId" element={state.loggedIn ?<ProductDetails />: <Navigate to="/login" />} />
         <Route path="/manage-product/:productId" element={state.loggedIn ?<EditProduct />: <Navigate to="/login" />} />
      </Routes>
    </Router>
    </div>
  );
}
export default App;
