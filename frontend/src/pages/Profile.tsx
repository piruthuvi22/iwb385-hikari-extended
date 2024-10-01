import React from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  useTheme,
} from "@mui/material";
import Menubar from "../components/Menubar";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ProfilePhoto from "../assets/avatar.jpg";
import Fab from "@mui/material/Fab";
import EditIcon from "@mui/icons-material/Edit";

export default function Profile() {
  const theme = useTheme();

  return (
    <Box
      height={"100vh"}
      bgcolor={theme.palette.grey[100]}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      {/* Cover Section */}
      <Box
        width={"100%"}
        height={"20vh"}
        sx={{
          backgroundImage: `linear-gradient(to right bottom, #9381ff, #9b8fff, #a49dff, #adabff, #b8b8ff)`,
          borderBottomLeftRadius: "1.5rem",
          borderBottomRightRadius: "1.5rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        position={"relative"}
      >
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

      {/* Profile Content */}
      <Box
        width={"80%"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        mt={3}
        gap={2}
      >
        <Typography variant="h5" color="text.primary">
          Profile
        </Typography>

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
          defaultValue="John Doe" // Replace with the actual user name
          InputProps={{
            readOnly: true,
          }}
          sx={{
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
          defaultValue="johndoe@example.com" // Replace with the actual email
          InputProps={{
            readOnly: true,
          }}
          sx={{
            borderRadius: "1.5rem",
            "& .MuiOutlinedInput-root": {
              borderRadius: "1.5rem",
            },
          }}
        />

        {/* Edit Button */}
        <Fab
          sx={{
            position: "fixed",
            bottom: 80,
            right: 25,
          }}
          color="primary"
          size="large"
          //   onClick={}
        >
          <EditIcon />
        </Fab>
      </Box>

      {/* Menubar at the bottom */}
      <Menubar />
    </Box>
  );
}
