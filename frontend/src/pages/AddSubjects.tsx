import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  List,
  ListItem,
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

const ENDPOINT = "http://localhost:9094/central/api";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlNyQjE4ejFjRDB2QUticm1FamZ4diJ9.eyJpc3MiOiJodHRwczovL2hpa2FyaS51ay5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjcwNjM5MmUyNTZhN2JkZWY3N2RhZmYyIiwiYXVkIjpbImNlbnRyYWxfYXBpIiwiaHR0cHM6Ly9oaWthcmkudWsuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcyODk3OTM1NCwiZXhwIjoxNzI5MDY1NzU0LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiRWRRRUVMd0tRWVhPS2I4V2htck0zZHpPNzN0MkxyTGYifQ.dEGd3FgmvhQ2GrcjNwIIwhBe5QCBBmXumVe7-gk4QmJHTgHU2sXf4A9u9qymSGouH_qSJ535wCj1s2fwejqtDsQzlICH4SgdBxVTMZ1Agu_pNWQgjs5IIhEawU_vI-nu9_s04JNY06QCCbvQu3fN2H4MX03Oqoj58srALDDNpMELa_SN8JPUVeirDMQi_d3e_u1teG9aiQ2zdZyw8wIRx82_pRqQqQcni9UtrNaEu4HlU9ICntefwMH7Ogqaq8mZEk1CElMLKxGV1afBhRH8Z0WfijNg_yIOqml3nrs5EmbYCOpztynfQMCEPXqek1gB5eK2mNj7GM9573_ge7l25w";

interface SubjectResponse {
  id: string;
  name: string;
  goalHours: number;
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

  useEffect(() => {
    getSubjects();
  }, []);

  async function getSubjects() {
    setLoading(true);
    try {
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

  // Filter subjects based on search text
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSubjects(filtered);
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

  const handleDeleteSubject = async (subject: SubjectResponse) => {
    setLoading(true);
    try {
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
    navigate(`/record-study-session`, { state: { subjectId: subject.id } });
  };

  const hours = Math.floor(studyMinutes / 60);
  const minutes = studyMinutes % 60;

  return (
    <Box
      minHeight={"100vh"}
      bgcolor={theme.palette.grey[100]}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      paddingBottom={10}
    >
      <Box
        width={"100%"}
        height={"20vh"}
        position={"fixed"}
        top={0}
        zIndex={1000}
      >
        <img
          src={Banner}
          alt="Banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        />

        <Typography
          variant="h4"
          color="white"
          position="absolute"
          top={16}
          left={16}
        >
          StRings
        </Typography>
      </Box>
      <Box width={"100%"} textAlign={"center"} mt={"22vh"}>
        <Typography variant="h5" color="text.primary">
          Let's select your subjects!
        </Typography>
      </Box>
      {/* Display selected subjects as tiles */}
      {selectedSubjects.length > 0 && (
        <Box
          mb={2}
          mt={2}
          width={"100%"}
          display="flex"
          justifyContent="center"
          mr={3}
        >
          <Box display="flex" flexDirection="column" gap={1.5} width={"65%"}>
            {selectedSubjects.map((subject, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingRight: "0.25rem",
                  paddingLeft: "1rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  borderRadius: "1.5rem",
                  backgroundColor: "#F0F0FF",
                  boxShadow: 1,
                  width: "100%",
                }}
                onClick={() => goToSubjectPage(subject)}
              >
                <Typography variant="body1">{subject.name}</Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  {subject.goalHours} hrs
                </Typography> */}
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={open ? "long-menu" : undefined}
                  aria-expanded={open ? "true" : undefined}
                  aria-haspopup="true"
                  onClick={(event) => handleClickMenu(event, subject)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="long-menu"
                  MenuListProps={{
                    "aria-labelledby": "long-button",
                  }}
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleCloseMenu}
                  slotProps={{
                    paper: {
                      style: {
                        width: "15ch",
                        borderRadius: "1.5rem",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                      },
                    },
                  }}
                >
                  {/* <MenuItem onClick={() => handleSetGoal(selectedSubject!)}>
                    Set Goal
                  </MenuItem> */}

                  <MenuItem
                    onClick={() => handleDeleteSubject(selectedSubject!)}
                  >
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            ))}
          </Box>
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
          color="primary"
          onClick={handleClickOpen}
          sx={{
            width: "80%",
            fontWeight: "600",
            fontSize: "1.3rem",
            py: 2,
            borderRadius: "50px",
          }}
        >
          <AddIcon style={{ color: "white", marginRight: "8px" }} />
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
      {loading && <Loader />}
      <Menubar></Menubar>
    </Box>
  );
}
