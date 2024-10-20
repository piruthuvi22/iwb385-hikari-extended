import React, { useEffect, useState } from 'react';
import {
  Box,
  Avatar,
  TextField,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import Menubar from '../components/Menubar';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ProfilePhoto from '../assets/avatar.jpg';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth0 } from '@auth0/auth0-react';
import { Logout } from '@mui/icons-material';
import axios from 'axios';
import { SubjectResponse } from './AddSubjects';
import Header from '../components/Header';
import multiavatar from '@multiavatar/multiavatar';

const ENDPOINT = process.env.REACT_APP_API_URI;

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  subjects: SubjectResponse[];
}
export default function Profile() {
  const theme = useTheme();
  const { logout, getAccessTokenSilently } = useAuth0();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      setLoading(true);
      const TOKEN = await getAccessTokenSilently({});

      const response = await axios.get(ENDPOINT + '/users', {
        headers: {
          Authorization: 'Bearer ' + TOKEN,
        },
      });
      setCurrentUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
    } catch (error) {
      console.log('Get user error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Box height={'100vh'}>
      {/* Cover Section */}
      <Header
        loading={loading}
        title={`Hi ${currentUser ? currentUser.name.split(' ')[0] : ''}!`}
      />
      {/* Profile Content */}
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        p={2}
      >
        {/* Profile Photo */}
        <Box position='relative'>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
            }}
            alt='Profile Photo'
            src={`data:image/svg+xml;base64,${btoa(multiavatar(name.split(' ')[0]))}`}
          />
        </Box>

        {/* User Name */}
        <TextField
          label='Name'
          variant='outlined'
          fullWidth
          disabled={loading}
          value={name} // Replace with the actual user name
          onChange={(e) => setName(e.target.value)}
          slotProps={{
            input: {
              readOnly: !isEditing,
            },
          }}
          sx={{
            mb: 3,
            borderRadius: '1.5rem',
            '& .MuiOutlinedInput-root': {
              borderRadius: '1.5rem',
            },
          }}
        />

        {/* User Email */}
        <TextField
          label='Email Address'
          variant='outlined'
          fullWidth
          disabled={loading}
          value={email} // Replace with the actual email
          onChange={(e) => setEmail(e.target.value)}
          slotProps={{
            input: {
              readOnly: !isEditing,
            },
          }}
          sx={{
            mb: 3,
            borderRadius: '1.5rem',
            '& .MuiOutlinedInput-root': {
              borderRadius: '1.5rem',
            },
          }}
        />

        <Button
          variant='contained'
          color='secondary'
          fullWidth
          startIcon={<Logout sx={{ fontSize: '50px', color: 'white' }} />}
          sx={{
            width: '80%',
            fontWeight: '600',
            fontSize: '1.3rem',
            py: 2,
            borderRadius: '30px',
            color: 'white',
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>

        {/* Edit Button */}
        {/* <Fab
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 30,
          }}
          color='secondary'
          size='large'
          onClick={handleEdit}
        >
          <EditIcon />
        </Fab> */}
      </Box>

      {/* Menubar at the bottom */}
      <Menubar />
    </Box>
  );
}
