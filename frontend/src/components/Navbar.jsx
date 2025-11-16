import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  InputBase,
  Box,
  alpha,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const { dispatch, state } = useAuth();
  const { loggedIn, error, success } = state;
  const isSmallScreen = useMediaQuery('(max-width:910px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCloseSnackbar = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const handleLogout = () => {
    toggleDrawer(false)();
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    dispatch({ type: 'SET_SUCCESS', payload: 'Logged Out Successfully' });
    navigate('/login');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: 'Manage Products', to: '/manage-products', icon: <EditIcon />, auth: true },
    { text: 'Add Product', to: '/add-product', icon: <AddCircleOutlineIcon />, auth: true },
  ];

  const authLink = loggedIn
    ? { text: 'Logout', onClick: handleLogout, icon: <ExitToAppIcon /> }
    : { text: 'Login', to: '/login', icon: <LoginIcon /> };

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navLinks.map((link) => (
          <ListItem button component={Link} to={link.to} key={link.text}>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
        <ListItem button onClick={authLink.onClick} component={authLink.to ? Link : 'button'} to={authLink.to}>
          <ListItemText primary={authLink.text} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ height: '64px' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/">
              <img src={logo} alt="Goods Exchange" style={{ height: '50px', marginRight: '10px' }} />
            </Link>
          </Box>

          {!isSmallScreen && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '4px',
                  backgroundColor: alpha('#fff', 0.15),
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.25),
                  },
                  width: '100%',
                  maxWidth: '500px',
                }}
              >
                <Box
                  sx={{
                    padding: '0 16px',
                    height: '100%',
                    position: 'absolute',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search for products..."
                  sx={{
                    color: 'inherit',
                    padding: '8px 8px 8px 48px',
                    width: '100%',
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Box>
            </Box>
          )}

          {isSmallScreen ? (
            <>
              <IconButton color="inherit" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                {drawerList}
              </Drawer>
            </>
          ) : (
            <Box>
              {navLinks.map((link) => (
                <IconButton color="inherit" component={Link} to={link.to} title={link.text} key={link.text}>
                  {link.icon}
                </IconButton>
              ))}
              <IconButton color="inherit" onClick={authLink.onClick} component={authLink.to ? Link : 'button'} to={authLink.to} title={authLink.text}>
                {authLink.icon}
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        {success ? (
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        ) : (
          error && (
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )
        )}
      </Snackbar>
    </>
  );
}

export default Navbar;




