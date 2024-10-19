import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Grid,
  Button,
  useTheme,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Banner from '../assets/addFriends.jpg';
import Menubar from '../components/Menubar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import SearchIcon from '@mui/icons-material/Search';
import DialogBox from '../components/DialogBox';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const ENDPOINT = process.env.REACT_APP_API_URI;

// const TOKEN =
//   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlNyQjE4ejFjRDB2QUticm1FamZ4diJ9.eyJpc3MiOiJodHRwczovL2hpa2FyaS51ay5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjcwNjM5MmUyNTZhN2JkZWY3N2RhZmYyIiwiYXVkIjpbImNlbnRyYWxfYXBpIiwiaHR0cHM6Ly9oaWthcmkudWsuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcyODkyNTkxNiwiZXhwIjoxNzI5MDEyMzE2LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiRWRRRUVMd0tRWVhPS2I4V2htck0zZHpPNzN0MkxyTGYifQ.gQuzdVSptX8sODa2_wUYHr7FzdiS9AQzvHbcwR3BDgq8FODYFBAzsvb-IRnjFR_ehbOyC2mG8uD6dhEZsIZ5HrhyW-LDMbRBxlkDtxxJBHZ23WLTuM7lw3-Kg0x-dEzxMrLpChc4mxy1ccB92PtFhmcgq8fyTYmqW7N4_tD89D1HF5ZSKSALdSbcVvr_I9DQkeXCKh0CJ3kITrInUr_KFxixr9mHR54FbM4n4yk8GNOjXqwtbm5liUPpU3oH-hzx-N0dwIfMow1HyDG7M_bxfYIPY3Mt10s2-kPKxIglIAml7eNXnlAhCaaBsg_DxaobMVMOEUw547WG9kpmIxmEKw";

interface FriendRequestResponse {
  id: string;
  name: string;
  email: string;
}

export default function AddFriends() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<
    FriendRequestResponse[]
  >([]);

  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>(
    []
  );
  const [followingFriends, setFollowingFriends] = useState<
    FriendRequestResponse[]
  >([]);
  const [requestedFriends, setRequestedFriends] = useState<
    FriendRequestResponse[]
  >([]);
  const [followers, setFollowers] = useState<
    FriendRequestResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    getFriends();
  }, []);

  async function getFriends() {
    setLoading(true);
    try {
      const TOKEN = await getAccessTokenSilently({});
      const friends = await axios.get(ENDPOINT + '/users/friends', {
        headers: {
          Authorization: 'Bearer ' + TOKEN,
        },
      });
      setFriendRequests(friends.data.requestedBy);
      setFollowingFriends(friends.data.following);
      setRequestedFriends(friends.data.requested);
      setFollowers(friends.data.followers);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const fetchFriends = async (query: string) => {
      try {
        const TOKEN = await getAccessTokenSilently({});
        const response = await axios.get(ENDPOINT + '/users/search/' + query, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        const filtered = response.data.filter(
          (friend: { id: string }) =>
            !followingFriends.some(
              (following: { id: string }) => following.id === friend.id
            )
        );
        setFilteredFriends(filtered);
      } catch (error) {
        console.error('Error fetching friends', error);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      if (searchText) {
        setHasSearched(true);
        fetchFriends(searchText);
      } else {
        setHasSearched(false);
        setFilteredFriends([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [followingFriends, getAccessTokenSilently, searchText]);

 

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchText('');
    setFilteredFriends([]);
    setHasSearched(false);
  };

  const handleAccept = async (event: React.MouseEvent, id: String) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      const TOKEN = await getAccessTokenSilently({});
      await axios.put(
        ENDPOINT + '/users/accept-friend-request',
        { id: id },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      getFriends();
    } catch (error) {
      console.error('Error accepting friend request', error);
    }
  };

  const handleRejectFriendRequest = async (
    event: React.MouseEvent,
    id: string
  ) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      const TOKEN = await getAccessTokenSilently({});
      await axios.delete(ENDPOINT + '/users/reject-friend-request', {
        data: { id: id },
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
    } catch (error) {
      console.error('Error deleting friend request', error);
    }
    getFriends();
  };

  const handleRemoveFollower = async (
    event: React.MouseEvent,
    id: string
  ) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      const TOKEN = await getAccessTokenSilently({});
      await axios.delete(ENDPOINT + '/users/friend-follower', {
        data: { id: id },
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
    } catch (error) {
      console.error('Error deleting friend request', error);
    }
    getFriends();
  };


  const handleCancelRequest = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      const TOKEN = await getAccessTokenSilently({});
      await axios.delete(ENDPOINT + '/users/friend-request', {
        data: { id: id },
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
    } catch (error) {
      console.error('Error deleting friend request', error);
    }
    getFriends();
  };

  const handleAddFriend = async (id: any) => {
    try {
      const TOKEN = await getAccessTokenSilently({});
      const response = await axios.put(
        ENDPOINT + '/users/friend-request',
        {
          id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (response.status === 200) {
        setFilteredFriends((prevFriends) =>
          prevFriends.filter((friend) => friend.id !== id)
        );
      } else {
        console.error('Failed to send friend request');
      }
      getFriends();
    } catch (error) {
      console.error('Error sending friend request', error);
    }
  };

  return (
    <Box
      minHeight={'100vh'}
      bgcolor={theme.palette.grey[100]}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      paddingBottom={10}
    >
      <Box
        width={'100%'}
        height={'20vh'}
        position={'fixed'}
        top={0}
        zIndex={1000}
      >
        <img
          src={Banner}
          alt='Banner'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderBottomLeftRadius: '1.5rem',
            borderBottomRightRadius: '1.5rem',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          }}
        />
        <Typography
          variant='h4'
          color='white'
          position='absolute'
          top={16}
          left={16}
        >
          StRings
        </Typography>

        <Box position='absolute' top={16} right={16}>
          <SearchIcon
            sx={{ color: 'white', cursor: 'pointer', fontSize: '30px' }}
            onClick={() => setOpen(true)}
          />
        </Box>
      </Box>
      {friendRequests.length > 0 && (
        <Box mt={'22vh'} width={'90%'}>
          <Typography
            variant='h5'
            color='text.primary'
            mb={2}
            textAlign={'center'}
          >
            Friend Requests
          </Typography>
          <Grid container spacing={2}>
            {friendRequests.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <Card
                  sx={{
                    padding: '1rem',
                    borderRadius: '1.5rem',
                    backgroundColor: '#F8F7FF',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    alt={friend.name}
                    // src={friend.profilePicture}
                    sx={{ width: 60, height: 60, marginRight: 2 }}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flexGrow: 1,
                    }}
                  >
                    <Typography variant='h6'>
                      {friend.name}
                    </Typography>
                    <Typography sx={{ marginBottom: '0.5rem', fontSize:'12px' }}>
                      {friend.email}
                    </Typography>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      width='80%'
                    >
                      <Button
                        variant='contained'
                        color='primary'
                        sx={{
                          borderRadius: '1.5rem',
                          flex: 1,
                        }}
                        onClick={(event) => handleAccept(event, friend.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant='outlined'
                        color='secondary'
                        sx={{
                          borderRadius: '1.5rem',
                          marginLeft: 1,
                          flex: 1,
                        }}
                        onClick={(event) =>
                          handleRejectFriendRequest(event, friend.id)
                        }
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {requestedFriends.length > 0 && (
        <Box mt={'22vh'} width={'90%'}>
          <Typography
            variant='h5'
            color='text.primary'
            mb={2}
            textAlign={'center'}
          >
            Pending Requests
          </Typography>
          <Grid container spacing={2}>
            {requestedFriends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <Card
                  sx={{
                    padding: '1rem',
                    borderRadius: '1.5rem',
                    backgroundColor: '#F8F7FF',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    alt={friend.name}
                    // src={friend.profilePicture}
                    sx={{ width: 60, height: 60, marginRight: 2 }}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flexGrow: 1,
                    }}
                  >
                    <Typography variant='h6'>
                      {friend.name}
                    </Typography>
                    <Typography sx={{ marginBottom: '0.5rem', fontSize:'12px' }}>
                      {friend.email}
                    </Typography>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      width='80%'
                    >
                      <Button
                        variant='outlined'
                        color='secondary'
                        sx={{
                          borderRadius: '1.5rem',
                          marginLeft: 1,
                          flex: 1,
                        }}
                        onClick={(event) =>
                          handleCancelRequest(event, friend.id)
                        }
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
        <Box mt={'22vh'} width={'90%'}>
          <Typography
            variant='h5'
            color='text.primary'
            mb={2}
            textAlign={'center'}
          >
            Your Followers
          </Typography>
          {followers.length > 0 ? (
          <Grid container spacing={2}>
            {followers.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <Card
                  sx={{
                    padding: '1rem',
                    borderRadius: '1.5rem',
                    backgroundColor: '#F8F7FF',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    alt={friend.name}
                    // src={friend.profilePicture}
                    sx={{ width: 60, height: 60, marginRight: 2 }}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flexGrow: 1,
                    }}
                  >
                    <Typography variant='h6'>
                      {friend.name}
                    </Typography>
                    <Typography sx={{ marginBottom: '0.5rem', fontSize:'12px' }}>
                      {friend.email}
                    </Typography>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      width='80%'
                    >
                      <Button
                        variant='outlined'
                        color='secondary'
                        sx={{
                          borderRadius: '1.5rem',
                          marginLeft: 1,
                          flex: 1,
                        }}
                        onClick={(event) =>
                          handleRemoveFollower(event, friend.id)
                        }
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          ): (
            <Typography variant='body2' color='text.secondary' align='center' sx={{ mt: 2 }}>
              You have no followers yet
            </Typography>
          )}
        </Box>

      <DialogBox
        open={open}
        title='Select a Friend'
        handleClose={handleClose}
        actions={
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
        }
      >
        <Box mt={2}>
          <TextField
            label='Search Friend'
            value={searchText}
            onChange={handleSearchChange}
            fullWidth
            margin='dense'
            variant='outlined'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '1.5rem',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '1.5rem',
              },
            }}
          />

          {filteredFriends.length > 0 ? (
            <List>
              {filteredFriends.map((friend) => (
                <ListItem
                  key={friend.id}
                  component='div'
                  sx={{
                    borderRadius: '1.5rem',
                    '&:hover': {
                      backgroundColor: '#D8D8FF',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <ListItemText primary={friend.name} secondary={friend.email} />
                  <PersonAddIcon
                    sx={{ cursor: 'pointer' }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddFriend(friend.id);
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            hasSearched && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                No friends to add
              </Typography>
            )
          )}
        </Box>
      </DialogBox>

      {loading && <Loader />}
      <Menubar />
    </Box>
  );
}
