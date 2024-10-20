import { Box, Button, Typography } from '@mui/material';
import mathematics from '../assets/mathematics.svg';
import studifylogo from '../assets/logo.svg';
import { useAuth0 } from '@auth0/auth0-react';

export default function GetStarted() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    await loginWithRedirect();
  };

  return (
    <Box
      height={'100vh'}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
    >
      <Box
        flexGrow={'1'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        {/* <img src={studifylogo} alt='cover' style={{ width: '60%' }} /> */}
      </Box>
      <Box flexGrow={'1'} textAlign={'center'}>
        <img
          src={studifylogo}
          alt='cover'
          style={{
            width: '60%',
            marginBottom: '2rem',
            objectFit: 'cover',
          }}
        />
        <Typography textAlign={'center'} variant='h5' color='text.secondary' mt={2}>
          Study Smarter, Not Longer!
        </Typography>
      </Box>
      <Box flexGrow={'1'} textAlign={'center'}>
        {/* <Link
          to="/auth/login"
          style={{ textDecoration: "none", color: "white" }}
        > */}
        <Button
          variant='contained'
          color='primary'
          sx={{
            width: '80%',
            fontWeight: '600',
            fontSize: '1.3rem',
            px: 2,
            py: 3,
            borderRadius: '30px',
          }}
          onClick={handleLogin}
        >
          Let's Get Started
        </Button>
        {/* </Link> */}
      </Box>
    </Box>
  );
}
