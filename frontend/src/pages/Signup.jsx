import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';
import { authService } from '../services';

import { useAuth } from '../contexts/AuthContext';

function Signup() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { dispatch} = useAuth();


  const handleSignup = async () => {
    try {
      const response = await authService.signup(username, name, phone, email, password);
      if (response.status==200) {
        dispatch({ type: 'SET_SUCCESS', payload: 'SignUp successful now verify phone' });
        navigate('/login'); // Redirect to login page after successful signup
      } else {
        // Handle signup failure
        dispatch({ type: 'SET_ERROR', payload: 'SigUp failed' });
        console.log('Signup failed.');
      }
    } catch (error) {
      if(error.response.status==400)
     { 
      dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
      return;
    }
      dispatch({ type: 'SET_ERROR', payload: 'SigUp failed' });
      // dispatch customised error message
      console.error('An error occurred:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <form>
          <TextField
            label="Username"
            variant="outlined"
            margin="normal"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Name"
            variant="outlined"
            margin="normal"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Phone"
            variant="outlined"
            margin="normal"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            margin="normal"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </form>
      </div>
    </Container>
  );
}

export default Signup;
