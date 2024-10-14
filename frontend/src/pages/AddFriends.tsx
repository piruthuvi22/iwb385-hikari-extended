import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Grid,
  Button,
  useTheme,
  TextField,
} from "@mui/material";
import Banner from "../assets/addFriends.jpg";
import Menubar from "../components/Menubar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import SearchIcon from "@mui/icons-material/Search";
import DialogBox from "../components/DialogBox";

const ENDPOINT = "http://localhost:9094/central/api";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlNyQjE4ejFjRDB2QUticm1FamZ4diJ9.eyJpc3MiOiJodHRwczovL2hpa2FyaS51ay5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjcwNjM5MmUyNTZhN2JkZWY3N2RhZmYyIiwiYXVkIjpbImNlbnRyYWxfYXBpIiwiaHR0cHM6Ly9oaWthcmkudWsuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcyODg5MjA4OSwiZXhwIjoxNzI4OTc4NDg5LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiRWRRRUVMd0tRWVhPS2I4V2htck0zZHpPNzN0MkxyTGYifQ.CQmr6tT3H81JFHDonTyvUMqCRLqoe1fmOm2u5gVlDdQbdXiEWyLB-bwGciPP3M6fPXtqhFCjG3FHFkHl1pBR6cGE-RZNyRFrfsMZU7lfi-XweVZINfy-1EWp2_gtMqVD4-sfVGnp89w4bDBvoSBUppR6YkCgjJVyLtnz81MybLs-pQEIBGV26IozWK8nAJL9d_9XXHiTjLy_peQO5ufD7NQNcnH0gPPYQLPr0xMwYXJwsix5XU7JTC_Ueg4Xu1pQOWvL_ODb_Ipm-LU_XS15morO_wNqRYKVv2w6qwlFlIVzKJyISJSCivsjt0HbXY8sfUqMucn5U1ZJY0H7lGNs7A";

interface FriendRequestResponse {
  id: string;
  name: string;
}

export default function AddFriends() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>(
    []
  );
  // const [friendsYouMayKnow, setFriendsYouMayKnow] = useState(
  //   initialFriendsYouMayKnow
  // );
  const [loading, setLoading] = useState(true);

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

      setFriendRequests(friends.data.requestedBy);
      // console.log(friends.data.requestedBy);
      console.log(friends.data);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleAccept = async (event: React.MouseEvent, id: any) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      const response = await axios.put(
        ENDPOINT + "/users/accept-friend-request",
        {
          id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      setFriendRequests((prevRequests) =>
        prevRequests.filter((friend) => friend.id !== id)
      );
      console.log("Request accepted", response.data);
    } catch (error) {
      console.error("Error accepting friend request", error);
    }
  };

  const handleDelete = async (
    event: React.MouseEvent,
    id: string,
    isRequest: boolean
  ) => {
    event.stopPropagation();
    event.preventDefault();

    try {
      const response = await axios.delete(
        ENDPOINT + "/users/reject-friend-request",
        {
          data: { id: id },
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error deleting friend request", error);
    }

    if (isRequest) {
      setFriendRequests((prevRequests) =>
        prevRequests.filter((friend) => friend.id !== id)
      );
      console.log("Friend request deleted", id);
    } else {
      // Uncomment and use this if needed
      // setFriendsYouMayKnow((prevFriends) =>
      //   prevFriends.filter((friend) => friend.id !== id)
      // );
      console.log("The friend you may know deleted", id);
    }
  };

  const handleFollow = (event: React.MouseEvent, id: any) => {
    event.stopPropagation();
    event.preventDefault();
    // setFriendsYouMayKnow((prevFriends) =>
    //   prevFriends.filter((friend) => friend.id !== id)
    // );
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

        <Box position="absolute" top={16} right={16}>
          <SearchIcon
            sx={{ color: "white", cursor: "pointer", fontSize: "30px" }}
            onClick={() => setOpen(true)}
          />
        </Box>
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
                    // src={friend.profilePicture}
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
          {/* Friends You May Know */}
        </Typography>

        {/* {friendsYouMayKnow.length > 0 ? (
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
        )} */}
      </Box>
      <DialogBox
        open={open}
        title="Search a Friend"
        handleClose={handleClose}
        actions={
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        }
      >
        <TextField
          label="Search Friend"
          // value={searchText}
          // onChange={handleSearchChange}
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
      </DialogBox>
      {loading && <Loader />}
      <Menubar />
    </Box>
  );
}
