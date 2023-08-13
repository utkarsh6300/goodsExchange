
import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios';

function PhoneNumberVerification() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

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
      } else {
        // Handle OTP send failure
        console.log('Failed to send OTP.');
        setSendingOtp(false);
      }
    } catch (error) {
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
        navigate('/Login');
        console.log('Phone number verified successfully.');
      } else {
        // Handle OTP verification failure
        console.log('OTP verification failed.');
      }
    } catch (error) {
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
