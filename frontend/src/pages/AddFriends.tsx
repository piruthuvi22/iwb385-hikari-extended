import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Grid,
  Button,
  useTheme,
} from "@mui/material";
import Banner from "../assets/addFriends.jpg";
import Menubar from "../components/Menubar";
import { useNavigate } from "react-router-dom";

const initialFriendRequests = [
  {
    id: 1,
    name: "John Doe",
    profilePicture: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Peter Nick",
    profilePicture: "https://via.placeholder.com/150",
  },
];

const initialFriendsYouMayKnow = [
  {
    id: 3,
    name: "Athma Sean",
    profilePicture: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "Lesley Park",
    profilePicture: "https://via.placeholder.com/150",
  },
];

export default function AddFriends() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [friendRequests, setFriendRequests] = useState(initialFriendRequests);
  const [friendsYouMayKnow, setFriendsYouMayKnow] = useState(
    initialFriendsYouMayKnow
  );

  const handleAccept = (event: React.MouseEvent, id: any) => {
    event.stopPropagation();
    event.preventDefault();
    setFriendRequests((prevRequests) =>
      prevRequests.filter((friend) => friend.id !== id)
    );
    console.log("Request accepted", id);
  };

  const handleDelete = (event: React.MouseEvent, id: any, isRequest: any) => {
    event.stopPropagation();
    event.preventDefault();
    if (isRequest) {
      setFriendRequests((prevRequests) =>
        prevRequests.filter((friend) => friend.id !== id)
      );
      console.log("Friend request deleted", id);
    } else {
      setFriendsYouMayKnow((prevFriends) =>
        prevFriends.filter((friend) => friend.id !== id)
      );
      console.log("The friend you may know deleted", id);
    }
  };

  const handleFollow = (event: React.MouseEvent, id: any) => {
    event.stopPropagation();
    event.preventDefault();
    setFriendsYouMayKnow((prevFriends) =>
      prevFriends.filter((friend) => friend.id !== id)
    );
    console.log("Started following friend", id);
  };

  const handleCardClick = (id: any) => {
    navigate(`/friend/${id}`);
  };
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

      <Box mt={"22vh"} width={"90%"}>
        <Typography
          variant="h5"
          color="text.primary"
          mb={2}
          textAlign={"center"}
        >
          Friend Requests
        </Typography>

        {friendRequests.length > 0 ? (
          <Grid container spacing={2}>
            {friendRequests.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <Card
                  sx={{
                    padding: "1rem",
                    borderRadius: "1.5rem",
                    backgroundColor: "#F8F7FF",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onClick={() => handleCardClick(friend.id)}
                >
                  <Avatar
                    alt={friend.name}
                    src={friend.profilePicture}
                    sx={{ width: 60, height: 60, marginRight: 2 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flexGrow: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>
                      {friend.name}
                    </Typography>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      width="80%"
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: "1.5rem",
                          flex: 1,
                        }}
                        onClick={(event) => handleAccept(event, friend.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{
                          borderRadius: "1.5rem",
                          marginLeft: 1,
                          flex: 1,
                        }}
                        onClick={(event) =>
                          handleDelete(event, friend.id, true)
                        }
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="body1"
            textAlign={"center"}
            color="text.secondary"
          >
            No friend requests to show
          </Typography>
        )}
      </Box>

      {/* Friends you may know */}
      <Box mt={4} width={"90%"}>
        <Typography
          variant="h5"
          color="text.primary"
          mb={2}
          textAlign={"center"}
        >
          Friends You May Know
        </Typography>

        {friendsYouMayKnow.length > 0 ? (
          <Grid container spacing={2}>
            {friendsYouMayKnow.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.id}>
                <Card
                  sx={{
                    padding: "1rem",
                    borderRadius: "1.5rem",
                    backgroundColor: "#F8F7FF",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onClick={() => handleCardClick(friend.id)}
                >
                  <Avatar
                    alt={friend.name}
                    src={friend.profilePicture}
                    sx={{ width: 60, height: 60, marginRight: 2 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flexGrow: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>
                      {friend.name}
                    </Typography>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      width="80%"
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: "1.5rem",
                          flex: 1,
                        }}
                        onClick={(event) => handleFollow(event, friend.id)}
                      >
                        Follow
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{
                          borderRadius: "1.5rem",
                          marginLeft: 1,
                          flex: 1,
                        }}
                        onClick={(event) =>
                          handleDelete(event, friend.id, false)
                        }
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="body1"
            textAlign={"center"}
            color="text.secondary"
          >
            No friends to show
          </Typography>
        )}
      </Box>
      <Menubar />
    </Box>
  );
}
