// import React from 'react';
// import { Link } from 'react-router-dom';

// function Navbar() {
//   return (
//     <nav>
//       <ul>
//         <li><Link to="/">Home</Link></li>
//         <li><Link to="/products">Products</Link></li>
//         <li><Link to="/manage-products">Manage Products</Link></li>
//         <li><Link to="/signup">Sign Up</Link></li>
//         <li><Link to="/login">Login</Link></li>
//       </ul>
//     </nav>
//   );
// }

// export default Navbar;
import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function Navbar() {
  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    marginRight: '16px',
  };

  const appBarStyle = {
    marginBottom: '16px', // Adjust as needed
  };

  return (
    <AppBar position="static" style={appBarStyle}>
      <Toolbar>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          Goods Exchange
        </Typography>
        <Button color="inherit" component={Link} to="/" style={navLinkStyle}>
          Home
        </Button>
        <Button color="inherit" component={Link} to="/products" style={navLinkStyle}>
          Products
        </Button>
        <Button color="inherit" component={Link} to="/manage-products" style={navLinkStyle}>
          Manage Products
        </Button>
        <Button color="inherit" component={Link} to="/add-product" style={navLinkStyle}>
          Add Product
        </Button>
        <Button color="inherit" component={Link} to="/signup" style={navLinkStyle}>
          Sign Up
        </Button>
        <Button color="inherit" component={Link} to="/login" style={navLinkStyle}>
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;



