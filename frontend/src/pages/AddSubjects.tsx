import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  alpha,
  Box,
  Button,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Banner from "../assets/addSubjectBg.jpg";
import AddIcon from "@mui/icons-material/Add";
import Menubar from "../components/Menubar";
import DialogBox from "../components/DialogBox";
import Loader from "../components/Loader";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useAuth0 } from "@auth0/auth0-react";
import { Delete, Inbox, MenuBook } from "@mui/icons-material";
import { SubjectRecordsResponse } from "./RecordStudySession";

const ENDPOINT = "http://localhost:9094/central/api";

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
  const [searchText, setSearchText] = useState("");
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

  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    error,
    getIdTokenClaims,
    handleRedirectCallback,
  } = useAuth0();

  useEffect(() => {
    user?.sub && createUser();
    getSubjects();
  }, [user]);

  // useEffect(() => {
  //   if (selectedSubjects.length > 0) {
  //     const subjects = selectedSubjects.map((subject) => subject.id);
  //     for (const subjectId of subjects) {
  //       getSubjectInfo(subjectId).then((subject) => {
  //         setSelectedSubjects((prevSubjects) => ({
  //           ...prevSubjects,
  //           progress: 55,
  //         }));
  //       });
  //     }
  //   }
  // }, [selectedSubjects]);

  const createUser = async () => {
    if (!user) {
      return;
    }
    try {
      const TOKEN = await getAccessTokenSilently({});

      const response = await axios.post(
        ENDPOINT + "/users",
        {
          id: user.sub?.split("|")[1],
          name: user.name,
          email: user.email,
        },
        {
          headers: {
            Authorization: "Bearer " + TOKEN,
          },
        }
      );
      console.log("User created successfully", response.data);
    } catch (error) {
      console.error("Error creating user", error);
    }
  };

  async function getSubjects() {
    setLoading(true);

    try {
      const TOKEN = await getAccessTokenSilently({});
      const availableSubjectsResponse = await axios.get(
        ENDPOINT + "/subjects",
        {
          headers: {
            Authorization: "Bearer " + TOKEN,
          },
        }
      );
      const availableSubjects = availableSubjectsResponse.data;
      // setSubjects(availableSubjects);

      const enrolledSubjectsResponse = await axios.get(ENDPOINT + "/users", {
        headers: {
          Authorization: "Bearer " + TOKEN,
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
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubjectClick = async (subject: SubjectResponse) => {
    setLoading(true);

    try {
      const TOKEN = await getAccessTokenSilently({});
      const response = await axios.put(
        ENDPOINT + "/subjects",
        {
          id: subject.id,
        },
        {
          headers: {
            Authorization: "Bearer " + TOKEN,
          },
        }
      );
    } catch (error) {
      console.error("Error updating subject:", error);
    } finally {
      setLoading(false);
      if (!selectedSubjects.includes(subject)) {
        setSelectedSubjects([...selectedSubjects, subject]);
        setFilteredSubjects(filteredSubjects.filter((s) => s !== subject));
        setSearchText("");
        setOpen(false);
      }
    }
  };

  const getSubjectInfo = async (
    subjectId: string
  ): Promise<SubjectRecordsResponse | undefined> => {
    // setLoading(true);
    try {
      const TOKEN = await getAccessTokenSilently({});

      if (!subjectId) {
        console.error("Subject ID not found");
        return;
      }
      const response = await axios.get(ENDPOINT + "/subjects/" + subjectId, {
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching subject info", error);
      return undefined;
    } finally {
      // setLoading(false);
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
      const response = await axios.delete(ENDPOINT + "/subjects", {
        data: { id: subject.id },
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      });

      if (response.status === 200) {
        setSelectedSubjects((prevSubjects) =>
          prevSubjects.filter((s) => s.id !== subject.id)
        );
      } else {
        console.error("Error deleting the subject");
      }
    } catch (error) {
      console.error("Error deleting the subject", error);
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
    setSearchText("");
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

  const handleSetGoal = (subject: SubjectResponse) => {
    setOpenGoal(true);
    setStudyMinutes(0);
    handleCloseMenu();
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
    <Box minHeight={"100vh"} bgcolor={theme.palette.grey[100]}>
      <Box
        sx={{
          position: "relative",
          // height: 300,
        }}
      >
        {loading && (
          <Box position={"fixed"} top={0} left={0} right={0}>
            <LinearProgress color="secondary" sx={{ height: 6 }} />
          </Box>
        )}
        <img
          src={Banner}
          alt="Banner"
          style={{
            width: "100%",
            height: "20vh",
            objectFit: "cover",
            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,
            boxShadow: "inset 0px -100px 50px 0px rgba(0,0,0,0.85)",
            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
          }}
        >
          <Box
            display={"flex"}
            width={"100%"}
            justifyContent={"space-between"}
            gap={2}
            position={"absolute"}
            bottom={0}
          >
            <Typography variant="h3" color="white" padding={2}>
              {"StRings"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box p={2}>
        <Typography variant="h5" color="text.primary">
          Let's select your subjects!
        </Typography>
      </Box>
      {/* Display selected subjects as tiles */}
      {selectedSubjects.length > 0 && (
        <Box px={2}>
          <List sx={{ width: "100%" }}>
            {selectedSubjects.map((subject, index) => {
              return (
                <>
                  <ListItem
                    sx={{
                      background: `linear-gradient(45deg, ${alpha(
                        theme.palette.secondary.light,
                        0.5
                      )} 20%, ${alpha(theme.palette.warning.light, 0.5)} 80%)`,
                      mb: 2,
                      borderRadius: "1.5rem",
                      height: "80px",
                    }}
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={(event) => handleClickMenu(event, subject)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      sx={{
                        height: "80px",
                      }}
                      onClick={() => goToSubjectPage(subject)}
                    >
                      <ListItemIcon>
                        <MenuBook />
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: "600",
                            fontSize: "1.5rem",
                            color: theme.palette.grey[800],
                          },
                          "& .MuiListItemText-secondary": {
                            fontSize: "1rem",
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
            id="long-menu"
            MenuListProps={{
              "aria-labelledby": "long-button",
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
        width={"100%"}
        display={"flex"}
        justifyContent={"center"}
        mb={3}
        mt={6}
      >
        <Button
          variant="contained"
          color="secondary"
          disabled={loading}
          startIcon={<AddIcon sx={{ fontSize: 28, color: "white" }} />}
          onClick={handleClickOpen}
          sx={{
            width: "80%",
            fontWeight: "600",
            fontSize: "1.3rem",
            py: 2,
            borderRadius: "100px",
          }}
        >
          Add Subject
        </Button>
      </Box>

      {/* Dialog for Selecting a Subject */}
      <DialogBox
        open={open}
        title="Select a Subject"
        handleClose={handleClose}
        actions={
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        }
      >
        {filteredSubjects.length > 0 ? (
          <>
            <TextField
              label="Search Subject"
              value={searchText}
              onChange={handleSearchChange}
              fullWidth
              margin="dense"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "1.5rem",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: "1.5rem",
                },
              }}
            />

            <List>
              {filteredSubjects.map((subject, index) => (
                <ListItem
                  key={index}
                  component="div"
                  onClick={() => handleSubjectClick(subject)}
                  sx={{
                    borderRadius: "1.5rem",
                    "&:hover": {
                      backgroundColor: "#D8D8FF",
                      cursor: "pointer",
                    },
                  }}
                >
                  <ListItemText primary={subject.name} />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No subjects available to add
          </Typography>
        )}
      </DialogBox>

      <DialogBox
        open={openGoal}
        title="Set a Goal"
        handleClose={handleClose}
        actions={
          <>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button color="primary">Set Goal</Button>
          </>
        }
      >
        <Box
          display="flex"
          alignItems="center"
          justifyItems="center"
          justifyContent="space-evenly"
          gap="1rem"
        >
          <Button
            variant="outlined"
            sx={{
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              minWidth: "0",
              padding: "0",
              fontSize: "1.5rem",
              border: "2px solid",
              alignItems: "flex-end",
            }}
            onClick={handleDecrease}
          >
            -
          </Button>
          <Typography
            variant="body1"
            sx={{ fontSize: "20px", width: "40%", textAlign: "center" }}
          >
            {hours}h {minutes}m
          </Typography>
          <Button
            variant="outlined"
            sx={{
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              minWidth: "0",
              padding: "0",
              fontSize: "1.5rem",
              border: "2px solid",
              alignItems: "flex-end",
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
