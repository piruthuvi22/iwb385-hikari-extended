import React, { useState, useEffect } from "react";
import { Box, Typography, Card, Avatar, Grid, useTheme } from "@mui/material";
import Banner from "../assets/friends.jpg";
import Menubar from "../components/Menubar";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import GroupIcon from "@mui/icons-material/Group";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

const ENDPOINT = "http://localhost:9094/central/api";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlNyQjE4ejFjRDB2QUticm1FamZ4diJ9.eyJpc3MiOiJodHRwczovL2hpa2FyaS51ay5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjcwNjM5MmUyNTZhN2JkZWY3N2RhZmYyIiwiYXVkIjpbImNlbnRyYWxfYXBpIiwiaHR0cHM6Ly9oaWthcmkudWsuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcyODY0MDQxNywiZXhwIjoxNzI4NzI2ODE3LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiRWRRRUVMd0tRWVhPS2I4V2htck0zZHpPNzN0MkxyTGYifQ.Ap0AhkYe_V6e8TyRBIAIB4RyuLK6DxgTx6AmbmDTYkbVjOWEEujC8OD419VUVgmKh-W6_5SpwR2LlT5SWSn5i_67pMSawvfcw0sxri9QNgtOQmYnbpbWhCvAEVPw1TDDtZdDtU5hSeXl3PCzwMgupENNiheXRqyjQUDYU0-8N14Fd2hPrxKjO_SgDeF6HkiVAAccZUpLPfQ472bR5fvZalQuz0RI2ZYaMNcLQHJsVUpaGNhYL2jizcQ1Iiz48tz58ddW8UZfWDqGh968iirFKkwyMSQt32m1oXQkVWKsuxAK-x9DLdJeIXub9bx32wr8g-dNcZxujuI0LWFy7XwR6Q";

interface Subject {
  id: string;
  name: string;
  actualGoalHours: number;
  goalHours: number;
}
interface FriendResponse {
  id: string;
  name: string;
  subjects: Subject[];
}

export default function Friends() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendResponse[]>([]);

  useEffect(() => {
    getFriends();
  }, []);

  async function getFriends() {
    setLoading(true);
    try {
      const friends = await axios.get(ENDPOINT + "/users/friends", {
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      });

      console.log(friends.data.following);
      setFriends(friends.data.following);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  }

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

        <Box position="absolute" top={16} right={16}>
          <Link to="/add-friends">
            <GroupIcon sx={{ color: "white", cursor: "pointer" }} />
          </Link>
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
                    // src={friend.profilePicture}
                    sx={{ width: 50, height: 50, marginRight: 2 }}
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
                    {/* Display progress for each subject */}
                    {friend.subjects.map((progress, index) => (
                      <Box
                        key={index}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <Box sx={{ width: 50 }}>
                          <CircularProgressbar
                            value={
                              progress.goalHours > 0 &&
                              progress.actualGoalHours > 0
                                ? (progress.actualGoalHours /
                                    progress.goalHours) *
                                  100
                                : 0
                            }
                            strokeWidth={12}
                            text={
                              progress.goalHours > 0 &&
                              progress.actualGoalHours > 0
                                ? `${Math.round(
                                    (progress.actualGoalHours /
                                      progress.goalHours) *
                                      100
                                  )}%`
                                : `0%`
                            }
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
                          {progress.name}
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
      {loading && <Loader />}
      <Menubar />
    </Box>
  );
}
