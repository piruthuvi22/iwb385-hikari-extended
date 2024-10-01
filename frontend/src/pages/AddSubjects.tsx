import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Banner from "../assets/addSubjectBg.jpg";
import AddIcon from "@mui/icons-material/Add";
import Menubar from "../components/Menubar";

const subjects = [
  "Combined Maths",
  "Physics",
  "Chemistry",
  "ICT",
  "Accouting",
  "Economics",
];

export default function AddSubject() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

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
      subject.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  const handleSubjectClick = (subject: string) => {
    if (!selectedSubjects.includes(subject)) {
      setOpen(false);
      setSearchText("");
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  return (
    <Box
      height={"100vh"}
      bgcolor={theme.palette.grey[100]}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <Box width={"100%"} height={"20vh"} position={"relative"}>
        <img
          src={Banner}
          alt="Top Logo Image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
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

      <Box width={"100%"} textAlign={"center"} mt={2}>
        <Typography variant="h5" color="text.primary">
          Let's select your subjects!
        </Typography>
      </Box>

      {/* Display selected subjects as tiles */}
      {selectedSubjects.length > 0 && (
        <Box mb={2} mt={2} width={"65%"}>
          <Box display="flex" flexDirection="column" gap={1.5}>
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
                <Typography variant="body1">{subject}</Typography>
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select a Subject</DialogTitle>
        <DialogContent>
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
                <ListItemText primary={subject} />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Menubar></Menubar>
    </Box>
  );
}
