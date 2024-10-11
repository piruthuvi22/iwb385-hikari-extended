import React, { useState, useEffect } from "react";
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
import { CircularProgress } from "@mui/material";
import Loader from "../components/Loader";
import axios from "axios";

const ENDPOINT = "http://localhost:9094/central/api";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlNyQjE4ejFjRDB2QUticm1FamZ4diJ9.eyJpc3MiOiJodHRwczovL2hpa2FyaS51ay5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjcwNjM5MmUyNTZhN2JkZWY3N2RhZmYyIiwiYXVkIjpbImNlbnRyYWxfYXBpIiwiaHR0cHM6Ly9oaWthcmkudWsuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcyODU1MjAyMiwiZXhwIjoxNzI4NjM4NDIyLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiRWRRRUVMd0tRWVhPS2I4V2htck0zZHpPNzN0MkxyTGYifQ.CwJHCEFjMsIJP6GADhC5Q1fQY2XMHwt6b9rw2QXz1K64CDXPJrb1dZR1dEVGUExgb7DpRyz9Gq_2sv0ADIYmVohXpmwrS8KTK0b9NkAiNubvTCHLcgKoOFv2Lwv8nZvbEuQJ9evrfVAEKHjBkS3ZX8DP-2JY7-l1aqzyCcdk6ImtimbfasvajpXyVurxRtQz2_TzVmGsdksmDUFGRK5Nq-IUyJENL7C5-dc-rKtJuZHkTUv6y46SOKFuB1QEVd-FM89B1AFmbgjis9kLldEW5CMsbDmD1CbatUiykFxIlAKLc9XmUxwYFH95hSzS8RCEN_mVW-Gkid7tXZ7SdSFU7g";

const subjects = [
  "Combined Maths",
  "Physics",
  "Chemistry",
  "ICT",
  "Accouting",
  "Economics",
];

interface SubjectResponse {
  id: string;
  name: string;
}

export default function AddSubject() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectResponse[]>(
    []
  );
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects();
  }, []);

  async function getSubjects() {
    setLoading(true);
    try {
      const result = await fetch(ENDPOINT + "/subjects", {
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      });
      const data = await result.json();
      setSubjects(data);
      setFilteredSubjects(data);
      console.log(data);
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
      console.log("Subject updated:", response.data);
    } catch (error) {
      console.error("Error updating subject:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
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

  // const handleSubjectClick = (subject: SubjectResponse) => {
  //   console.log(subject);

  //   if (!selectedSubjects.includes(subject)) {
  //     setSelectedSubjects([...selectedSubjects, subject]);
  //     setFilteredSubjects(filteredSubjects.filter((s) => s !== subject));
  //     setSearchText("");
  //     setOpen(false);
  //   }
  // };

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
                  padding: "1rem",
                  borderRadius: "1.5rem",
                  backgroundColor: "#F0F0FF",
                  boxShadow: 1,
                  width: "100%",
                }}
              >
                <Typography variant="body1">{subject.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  0 hrs
                </Typography>
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
      {loading && <Loader />}
      <Menubar></Menubar>
    </Box>
  );
}
