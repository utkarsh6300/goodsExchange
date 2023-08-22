
import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';


function PhoneNumberVerification() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  const { state,dispatch} = useAuth();

  const handleSendOtp = async () => {
    setSendingOtp(true);

    try {
      const response = await axios.post('http://localhost:5000/api/verify/send-verification-code', {
        phone:phoneNumber,
      });

      if (response.status==200) {
        setSendingOtp(false);
        setSentOtp(true);
        // OTP sent successfully, keep OTP input field visible
        dispatch({ type: 'SET_SUCCESS', payload: 'OTP Sent successful' });
        
      } else {
        // Handle OTP send failure
        dispatch({ type: 'SET_ERROR', payload: 'Failed to send OTP.' });

        console.log('Failed to send OTP.');
        setSendingOtp(false);
      }
    } catch (error) {
      // customised error message
      if(error.response.status==400)
     { 
      dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
      return;
    }
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send OTP.' });

      console.error('An error occurred:', error);
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerificationInProgress(true);

    try {
      const response = await axios.post('http://localhost:5000/api/verify/verify-code', {
        phone:phoneNumber,
        code:otp,
      });

      if (response.status==200) {
        // Phone number verified successfully, proceed to next step
        dispatch({ type: 'SET_SUCCESS', payload: 'Phone number verified successfully.' });

        navigate('/Login');
        console.log('Phone number verified successfully.');
      } else {
        // Handle OTP verification failure
        dispatch({ type: 'SET_ERROR', payload: 'OTP verification failed.' });
        console.log('OTP verification failed.');
      }
    } catch (error) {
      // customised error message
      if(error.response.status==400)
     { 
      dispatch({ type: 'SET_ERROR', payload: error.response.data.errors[0].msg });
      return;
    }
      dispatch({ type: 'SET_ERROR', payload: 'OTP verification failed.' });
      console.error('An error occurred:', error);
    } finally {
      setVerificationInProgress(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          Verify Phone Number
        </Typography>
        <form>
          <TextField
            label="Phone Number"
            variant="outlined"
            margin="normal"
            fullWidth
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        { !sentOtp&&(sendingOtp ? (
            <Button fullWidth variant="contained" color="primary" disabled>
              Sending OTP...
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSendOtp}
              disabled={verificationInProgress}
            >
              Send OTP
            </Button>)
          )}
          {sentOtp && (
            <TextField
              label="OTP"
              variant="outlined"
              margin="normal"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          )}
          {sentOtp && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleVerifyOtp}
              disabled={verificationInProgress}
            >
              Verify OTP
            </Button>
          )}
        </form>
      </div>
    </Container>
  );
}

export default PhoneNumberVerification;
