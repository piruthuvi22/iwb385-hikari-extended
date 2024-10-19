import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  useTheme,
  LinearProgress,
} from "@mui/material";
import Menubar from "../components/Menubar";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ProfilePhoto from "../assets/avatar.jpg";
import Fab from "@mui/material/Fab";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth0 } from "@auth0/auth0-react";
import { Logout } from "@mui/icons-material";
import axios from "axios";
import { SubjectResponse } from "./AddSubjects";

const ENDPOINT = process.env.REACT_APP_API_URI

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      setLoading(true);
      const TOKEN = await getAccessTokenSilently({});

      const response = await axios.get(ENDPOINT + "/users", {
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      });
      setCurrentUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
    } catch (error) {
      console.log("Get user error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    logout({
      logoutParams: {
        returnTo: window.location.origin,
        // federated: true,
      },
    });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Box height={"100vh"} bgcolor={theme.palette.grey[100]}>
      {/* Cover Section */}
      <Box
        sx={{
          position: "relative",
        }}
      >
        {loading && (
          <Box position={"fixed"} top={0} left={0} right={0}>
            <LinearProgress color="secondary" sx={{ height: 6 }} />
          </Box>
        )}

        <Box
          sx={{
            height: "20vh",
            backgroundImage: `linear-gradient(to right bottom, ${theme.palette.primary.main},  ${theme.palette.secondary.main})`,
            boxShadow: "inset 0px -80px 80px 0px rgba(0,0,0,0.3)",
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
            {currentUser && (
              <Typography variant="h3" color="white" padding={2}>
                <span
                  style={{
                    fontWeight: "600",
                    // fontSize: "1.5rem",
                  }}
                >
                  Hi
                </span>{" "}
                {currentUser.name.split(" ")[0]}!
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Profile Content */}
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        p={2}
      >
        {/* Profile Photo */}
        <Box position="relative">
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
            }}
            alt="Profile Photo"
            src={ProfilePhoto}
          />
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "5px",
            }}
          >
            <input hidden accept="image/*" type="file" />
            <PhotoCamera />
          </IconButton>
        </Box>

        {/* User Name */}
        <TextField
          label="Name"
          variant="outlined"
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
            borderRadius: "1.5rem",
            "& .MuiOutlinedInput-root": {
              borderRadius: "1.5rem",
            },
          }}
        />

        {/* User Email */}
        <TextField
          label="Email Address"
          variant="outlined"
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
            borderRadius: "1.5rem",
            "& .MuiOutlinedInput-root": {
              borderRadius: "1.5rem",
            },
          }}
        />

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<Logout sx={{ fontSize: "50px", color: "white" }} />}
          sx={{
            width: "80%",
            fontWeight: "600",
            fontSize: "1.3rem",
            py: 2,
            borderRadius: "100px",
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>

        {/* Edit Button */}
        <Fab
          sx={{
            position: "fixed",
            bottom: 80,
            right: 30,
          }}
          color="secondary"
          size="large"
          onClick={handleEdit}
        >
          <EditIcon />
        </Fab>
      </Box>

      {/* Menubar at the bottom */}
      <Menubar />
    </Box>
  );
}
