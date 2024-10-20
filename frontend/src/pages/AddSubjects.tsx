import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import Menubar from '../components/Menubar';
import DialogBox from '../components/DialogBox';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAuth0 } from '@auth0/auth0-react';
import { Add, MenuBook } from '@mui/icons-material';
import Header from '../components/Header';

const ENDPOINT = process.env.REACT_APP_API_URI;

export interface Lesson {
  id: string;
  name: string;
  no: number;
}
export interface SubjectResponse {
  id: string;
  name: string;
  lessons: Lesson[];
}

export default function AddSubject() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectResponse[]>(
    []
  );
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [selectedSubject, setSelectedSubject] =
    React.useState<SubjectResponse | null>(null);
  const [studyMinutes, setStudyMinutes] = useState(0);

  const { user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    user?.sub && createUser();
    getSubjects();
  }, [user]);

  const createUser = async () => {
    if (!user) {
      return;
    }
    try {
      const TOKEN = await getAccessTokenSilently({});

      const response = await axios.post(
        ENDPOINT + '/users',
        {
          id: user.sub?.split('|')[1],
          name: user.name,
          email: user.email,
        },
        {
          headers: {
            Authorization: 'Bearer ' + TOKEN,
          },
        }
      );
      console.log('User created successfully', response.data);
    } catch (error) {
      console.error('Error creating user', error);
    }
  };

  async function getSubjects() {
    setLoading(true);

    try {
      const TOKEN = await getAccessTokenSilently({});
      const availableSubjectsResponse = await axios.get(
        ENDPOINT + '/subjects',
        {
          headers: {
            Authorization: 'Bearer ' + TOKEN,
          },
        }
      );
      const availableSubjects = availableSubjectsResponse.data;
      // setSubjects(availableSubjects);

      const enrolledSubjectsResponse = await axios.get(ENDPOINT + '/users', {
        headers: {
          Authorization: 'Bearer ' + TOKEN,
        },
      });
      const enrolledSubjects = await enrolledSubjectsResponse.data.subjects;
      setSelectedSubjects(enrolledSubjects);
      const filteredAvailableSubjects = availableSubjects.filter(
        (subject: SubjectResponse) =>
          !enrolledSubjects.some(
            (enrolled: SubjectResponse) => enrolled.id === subject.id
          )
      );
      setSubjects(filteredAvailableSubjects);
      setFilteredSubjects(filteredAvailableSubjects);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubjectClick = async (subject: SubjectResponse) => {
    setLoading(true);

    try {
      const TOKEN = await getAccessTokenSilently({});
      await axios.put(
        ENDPOINT + '/subjects',
        {
          id: subject.id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + TOKEN,
          },
        }
      );
    } catch (error) {
      console.error('Error updating subject:', error);
    } finally {
      setLoading(false);
      if (!selectedSubjects.includes(subject)) {
        setSelectedSubjects([...selectedSubjects, subject]);
        setFilteredSubjects(filteredSubjects.filter((s) => s !== subject));
        setSearchText('');
        setOpen(false);
      }
    }
  };

  // Filter subjects based on search text
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  const handleDeleteSubject = async (subject: SubjectResponse) => {
    setLoading(true);

    try {
      const TOKEN = await getAccessTokenSilently({});
      const response = await axios.delete(ENDPOINT + '/subjects', {
        data: { id: subject.id },
        headers: {
          Authorization: 'Bearer ' + TOKEN,
        },
      });

      if (response.status === 200) {
        setSelectedSubjects((prevSubjects) =>
          prevSubjects.filter((s) => s.id !== subject.id)
        );
      } else {
        console.error('Error deleting the subject');
      }
    } catch (error) {
      console.error('Error deleting the subject', error);
    } finally {
      setLoading(false);
      handleCloseMenu();
    }
  };

  const handleClickOpen = () => {
    getSubjects();
    setOpen(true);
  };

  const handleClose = () => {
    setOpenGoal(false);
    setOpen(false);
    setSearchText('');
    setFilteredSubjects(subjects);
  };

  const handleClickMenu = (
    event: React.MouseEvent<HTMLElement>,
    subject: SubjectResponse
  ) => {
    setSelectedSubject(subject);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setSelectedSubject(null);
    setAnchorEl(null);
  };

  const handleDecrease = () => {
    setStudyMinutes((prevMinutes) => Math.max(0, prevMinutes - 30));
  };

  const handleIncrease = () => {
    setStudyMinutes((prevMinutes) => prevMinutes + 30);
  };

  const goToSubjectPage = (subject: SubjectResponse) => {
    navigate(`/record-study-session`, {
      state: { subjectId: subject.id, subjectName: subject.name },
    });
  };

  const hours = Math.floor(studyMinutes / 60);
  const minutes = studyMinutes % 60;

  return (
    <Box minHeight={'100vh'}>
      <Header loading={loading} title='Subjects' />
      <Box p={2}>
        <Typography variant='h5' color='text.primary'>
          Pick a subject!
        </Typography>
      </Box>
      {/* Display selected subjects as tiles */}
      {selectedSubjects.length > 0 && (
        <Box px={2}>
          <List sx={{ width: '100%' }}>
            {selectedSubjects.map((subject, index) => {
              return (
                <>
                  <ListItem
                    disablePadding
                    sx={{
                      background: `linear-gradient(45deg, ${alpha(
                        theme.palette.secondary.light,
                        0.5
                      )} 20%, ${alpha(theme.palette.warning.light, 0.5)} 80%)`,
                      mb: 2,
                      borderRadius: '1.5rem',
                      height: '80px',
                    }}
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge='end'
                        onClick={(event) => handleClickMenu(event, subject)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      sx={{
                        height: '80px',
                      }}
                      onClick={() => goToSubjectPage(subject)}
                    >
                      <ListItemIcon>
                        <MenuBook />
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: '600',
                            fontSize: '1.5rem',
                            color: theme.palette.grey[800],
                          },
                          '& .MuiListItemText-secondary': {
                            fontSize: '1rem',
                          },
                        }}
                        primary={subject.name}
                        secondary={`${subject.lessons.length} lessons`}
                      />
                    </ListItemButton>
                  </ListItem>
                </>
              );
            })}
          </List>

          <Menu
            id='long-menu'
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => handleDeleteSubject(selectedSubject!)}>
              Delete
            </MenuItem>
          </Menu>
        </Box>
      )}
      <Box
        width={'100%'}
        display={'flex'}
        justifyContent={'center'}
        mb={3}
        mt={6}
      >
        <Fab
          sx={{ position: 'fixed', bottom: 80, right: 30 }}
          color='secondary'
          size='large'
          disabled={loading}
          onClick={handleClickOpen}
        >
          <Add />
        </Fab>
      </Box>

      {/* Dialog for Selecting a Subject */}
      <DialogBox
        open={open}
        title='Select a Subject'
        handleClose={handleClose}
        actions={
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
        }
      >
        {filteredSubjects.length > 0 ? (
          <>
            <TextField
              label='Search Subject'
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

            <List>
              {filteredSubjects.map((subject, index) => (
                <ListItem
                  key={index}
                  component='div'
                  onClick={() => handleSubjectClick(subject)}
                  sx={{
                    borderRadius: '1.5rem',
                    '&:hover': {
                      backgroundColor: '#D8D8FF',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <ListItemText primary={subject.name} />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            No subjects available to add
          </Typography>
        )}
      </DialogBox>

      <DialogBox
        open={openGoal}
        title='Set a Goal'
        handleClose={handleClose}
        actions={
          <>
            <Button onClick={handleClose} color='secondary'>
              Cancel
            </Button>
            <Button color='primary'>Set Goal</Button>
          </>
        }
      >
        <Box
          display='flex'
          alignItems='center'
          justifyItems='center'
          justifyContent='space-evenly'
          gap='1rem'
        >
          <Button
            variant='outlined'
            sx={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              minWidth: '0',
              padding: '0',
              fontSize: '1.5rem',
              border: '2px solid',
              alignItems: 'flex-end',
            }}
            onClick={handleDecrease}
          >
            -
          </Button>
          <Typography
            variant='body1'
            sx={{ fontSize: '20px', width: '40%', textAlign: 'center' }}
          >
            {hours}h {minutes}m
          </Typography>
          <Button
            variant='outlined'
            sx={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              minWidth: '0',
              padding: '0',
              fontSize: '1.5rem',
              border: '2px solid',
              alignItems: 'flex-end',
            }}
            onClick={handleIncrease}
          >
            +
          </Button>
        </Box>
      </DialogBox>
      <Menubar />
    </Box>
  );
}
