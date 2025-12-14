import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { TextField, Button, Container, Typography } from '@mui/material';
import { authService } from '../services';

import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { dispatch} = useAuth();

  const [phone, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const response = await authService.login(phone, password);

      if (response.status == 200) {
        
        //set token in local storage
        localStorage.setItem('token', response.data.token);
        // store logged-in user's id for frontend features (chat)
        if (response.data.id) {
          localStorage.setItem('userId', response.data.id);
          dispatch({ type: 'SET_USER', payload: { id: response.data.id } });
        } else {
          dispatch({ type: 'LOGIN' });
        }
        dispatch({ type: 'SET_SUCCESS', payload: 'Login successful' });
        navigate('/');
      } else {
        // Handle login failure
        dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
        console.log('Login failed.');
      }
    } catch (error) {
      if (error.response.status == 401) {
        dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
        navigate('/VerifyPhone');
        return;
      }
      if (error.response.status == 400) {
        dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
        return;
      }
      dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
      // dispatch customised error message
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
            type='number'
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
