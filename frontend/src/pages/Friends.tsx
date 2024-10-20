import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Grid,
  useTheme,
  IconButton,
  LinearProgress,
} from "@mui/material";
import Banner from "../assets/friends.jpg";
import Menubar from "../components/Menubar";
import GroupIcon from "@mui/icons-material/Group";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { useAuth0 } from "@auth0/auth0-react";
import ProgressMeter from "../components/ProgressMeter";
import CloseIcon from "@mui/icons-material/Close";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";

const ENDPOINT = process.env.REACT_APP_API_URI;

interface Subject {
  id: string;
  name: string;
  actualHours: number;
  goalHours: number;
}
interface FriendResponse {
  id: string;
  name: string;
  subjects: Subject[];
  email: string;
}

export default function Friends() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const { getAccessTokenSilently } = useAuth0();
  console.log(friends);

  useEffect(() => {
    getFriends();
  }, []);

  async function getFriends() {
    setLoading(true);
    try {
      const TOKEN = await getAccessTokenSilently({});

      const friends = await axios.get(ENDPOINT + "/users/friends", {
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      });

      setFriends(friends.data.following);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  }

  async function unfollowFriend(friendId: string) {
    setLoading(true);
    try {
      const TOKEN = await getAccessTokenSilently({});
      const response = await axios.delete(ENDPOINT + "/users/follow-friend", {
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
        data: { id: friendId },
      });

      if (response.status === 200) {
        setFriends((prevFriends) =>
          prevFriends.filter((friend) => friend.id !== friendId)
        );
      } else {
        console.error("Error deleting the subject");
      }
    } catch (error) {
      console.error("Failed to unfollow friend", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box minHeight={"100vh"} bgcolor={theme.palette.grey[100]}>
      <Box sx={{ position: "relative" }}>
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
            alignItems={"center"}
            gap={2}
            position={"absolute"}
            bottom={0}
          >
            <Typography variant="h3" color="white" padding={2}>
              Studify
            </Typography>

            <Box pr={2}>
              <Link to="/add-friends">
                <IconButton>
                  <GroupIcon sx={{ color: "white", cursor: "pointer" }} />
                </IconButton>
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Grid of friend cards */}
      <Box mt={2} px={2} flexGrow={1}>
        {!loading && friends.length === 0 && (
          <Typography
            variant="body2"
            color="textSecondary"
            mt={4}
            textAlign="center"
          >
            You are not following any friends.
          </Typography>
        )}
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
                  position: "relative",
                }}
              >
                <IconButton
                  aria-label="unfollow"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() => unfollowFriend(friend.id)}
                >
                  <PersonRemoveRoundedIcon />
                </IconButton>

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
                  <div>
                    <Typography variant="h6" sx={{ marginTop: 0 }}>
                      {friend.name}
                    </Typography>
                    <Typography sx={{ fontSize: "12px" }}>
                      {friend.email}
                    </Typography>
                  </div>
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
                          <ProgressMeter
                            progress={
                              progress.goalHours > 0 && progress.actualHours > 0
                                ? parseFloat(
                                    (
                                      (progress.actualHours /
                                        progress.goalHours) *
                                      100
                                    ).toFixed(1)
                                  )
                                : 0
                            }
                            showMiniCircle={false}
                            sx={{
                              strokeColor: theme.palette.primary.main,
                              bgStrokeColor: theme.palette.grey[300],
                              barWidth: 12,
                              valueSize: 30,
                              valueWeight: "normal",
                              valueColor: theme.palette.secondary.main,
                              textColor: theme.palette.secondary.main,
                              loadingTime: 1500,
                              shape: "threequarters",
                              textFamily: "Fredoka",
                              valueFamily: "Fredoka",
                            }}
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
      <Menubar />
    </Box>
  );
}
