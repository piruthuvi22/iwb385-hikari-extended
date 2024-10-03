import React from "react";
import { Box, Typography, Card, Avatar, Grid, useTheme } from "@mui/material";
import Banner from "../assets/friends.jpg";
import Menubar from "../components/Menubar";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

const friends = [
  {
    id: 1,
    name: "Rashmi",
    profilePicture: "https://via.placeholder.com/150",
    focusRings: [
      { subject: "Math", progress: 85 },
      { subject: "Science", progress: 70 },
    ],
  },
  {
    id: 2,
    name: "Haritha",
    profilePicture: "https://via.placeholder.com/150",
    focusRings: [
      { subject: "Biology", progress: 65 },
      { subject: "Chemistry", progress: 90 },
    ],
  },
  {
    id: 3,
    name: "Sagini",
    profilePicture: "https://via.placeholder.com/150",
    focusRings: [
      { subject: "Physics", progress: 50 },
      { subject: "English", progress: 95 },
    ],
  },
  {
    id: 4,
    name: "Piruthuvi",
    profilePicture: "https://via.placeholder.com/150",
    focusRings: [
      { subject: "Art", progress: 40 },
      { subject: "Music", progress: 75 },
    ],
  },
];

export default function Friends() {
  const theme = useTheme();

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

        <Box position="absolute" top={16} right={16}>
          <GroupAddIcon
            sx={{ color: "white" }}
            onClick={() => console.log("Add Friends clicked")}
          />
        </Box>
      </Box>

      <Box mt={"22vh"} width={"100%"} textAlign={"center"}>
        <Typography variant="h5" color="text.primary">
          Sharing
        </Typography>
      </Box>

      {/* Grid of friend cards */}
      <Box mt={2} width={"90%"} flexGrow={1}>
        <Grid container spacing={2}>
          {friends.map((friend) => (
            <Grid item xs={12} sm={6} md={4} key={friend.id}>
              <Card
                sx={{
                  padding: "1rem",
                  borderRadius: "1.5rem",
                  backgroundColor: "#F8F7FF",
                  display: "flex",
                  flexDirection: "column",
                  height: "auto",
                  justifyContent: "flex-start",
                }}
              >
                {/* Box for Avatar and Name */}
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ marginBottom: "0.5rem" }}
                >
                  <Avatar
                    alt={friend.name}
                    src={friend.profilePicture}
                    sx={{ width: 60, height: 60, marginRight: 2 }}
                  />
                  <Typography variant="h6" sx={{ marginTop: 0 }}>
                    {friend.name}
                  </Typography>
                </Box>

                {/* Additional content below the name */}
                <Box>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    sx={{ marginTop: 1, gap: 2 }}
                  >
                    {/* Display focus rings for each subject */}
                    {friend.focusRings.map((ring, index) => (
                      <Box
                        key={index}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <Box sx={{ width: 50 }}>
                          <CircularProgressbar
                            value={ring.progress}
                            strokeWidth={12}
                            text={`${ring.progress}%`}
                            styles={buildStyles({
                              strokeLinecap: "round",
                              textSize: "30px",
                              pathTransitionDuration: 0.5,
                              // Colors
                              pathColor: theme.palette.primary.main,
                              textColor: theme.palette.primary.main,
                              trailColor: theme.palette.grey[100],
                            })}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ marginTop: 1 }}>
                          {ring.subject}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Menubar />
    </Box>
  );
}
