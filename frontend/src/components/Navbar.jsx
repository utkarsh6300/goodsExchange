
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Snackbar, Alert, useMediaQuery, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/goods-exchange-1.png';

function Navbar() {
  const navigate = useNavigate();
  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    marginRight: '16px',
  };

  const appBarStyle = {
    marginBottom: '16px', // Adjust as needed
  };

  const { dispatch, state } = useAuth();
  const { loggedIn, error, success } = state;

  const handleCloseSnackbar = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const handleLogout = () => {
    toggleDrawer(false);
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    dispatch({ type: 'SET_SUCCESS', payload: 'Logged Out Successfully' });
    navigate('/login');
  };

  // Use media query hook to check for smaller screens
  const isSmallScreen = useMediaQuery('(max-width:910px)');

  // State to control the drawer menu
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="static" style={appBarStyle}>
        <Toolbar>
          {isSmallScreen ? (
            <>
              <IconButton color="inherit" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <List>
                  <Link to="/" style={{ flexGrow: 1 }}>
                   <img src={logo} alt="Goods Exchange" style={{height: '85px' }} />
                  </Link>
                  <ListItem  component={Link} to="/home" onClick={toggleDrawer(false)}>
                    <ListItemText primary="Home" />
                  </ListItem>
                  <ListItem  component={Link} to="/products" onClick={toggleDrawer(false)}>
                    <ListItemText primary="Products" />
                  </ListItem>
                  <ListItem  component={Link} to="/manage-products" onClick={toggleDrawer(false)}>
                    <ListItemText primary="Manage Products" />
                  </ListItem>
                  <ListItem  component={Link} to="/add-product" onClick={toggleDrawer(false)}>
                    <ListItemText primary="Add Product" />
                  </ListItem>
                  <ListItem  component={Link} to="/signup" onClick={toggleDrawer(false)}>
                    <ListItemText primary="Sign Up" />
                  </ListItem>
                  { !loggedIn?   
                  (<ListItem  component={Link} to="/login" onClick={toggleDrawer(false)}>
                    <ListItemText primary="LogIn" />
                  </ListItem>):
                  (<ListItem  component={Link} to="/"  onClick={handleLogout}>
                    <ListItemText  primary="LogOut" />
                  </ListItem>)
                   }
                  
                </List>
              </Drawer>
            </>
          ) : (
            <>
           <Link to="/" style={{ flexGrow: 1 }}>
             <img src={logo} alt="Goods Exchange" style={{marginBottom: '-4px',marginLeft:'-25px',height: '85px' }} />
           </Link>
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
            { !loggedIn?    (<Button color="inherit" component={Link} to="/login" style={navLinkStyle}>
           Login
           </Button>):
            (<Button color="error" variant="contained" onClick={handleLogout}>
           LogOut
           </Button>)
           }

            </>
          )}
         
      
        </Toolbar>
      </AppBar>
           <Snackbar
         open={!!error || !!success}
         autoHideDuration={6000}
         onClose={handleCloseSnackbar}
       >
  {
  success ?(<Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
     {success}
   </Alert>) : error &&(<Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
      {error}
    </Alert>) 
   }
       </Snackbar>
    </>
  );
}

export default Navbar;





