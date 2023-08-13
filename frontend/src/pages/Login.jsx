import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios'; 

function Login({ setIsLoggedIn }) {
  const [phone, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        phone,
        password,
      });

      if (response.status==200) {
        
        //set token in local storage
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        navigate('/');
      } else {
        // Handle login failure
        console.log('Login failed.');
      }
    } catch (error) {
      if (error.response.status==401) {
        navigate('/VerifyPhone');
        return;
      }
      console.error('An error occurred:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form>
          <TextField
            label="Phone Number"
            variant="outlined"
            margin="normal"
            fullWidth
            value={phone}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            margin="normal"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </form>
      </div>
    </Container>
  );
}

export default Login;
