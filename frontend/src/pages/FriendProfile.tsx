import { useTheme, Typography, Box, Avatar, Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import Menubar from "../components/Menubar";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

const friendsData = [
  {
    id: 1,
    name: "John Doe",
    profilePicture: "https://via.placeholder.com/150",
    subjects: [
      { name: "Math", focus: 80 },
      { name: "Science", focus: 50 },
    ],
  },
  {
    id: 3,
    name: "Athma Nick",
    profilePicture: "https://via.placeholder.com/150",
    subjects: [
      { name: "History", focus: 70 },
      { name: "Art", focus: 60 },
    ],
  },
];

export default function FriendProfile() {
  const theme = useTheme();
  const { id } = useParams();
  const friend = friendsData.find((f) => f.id === parseInt(id!));

  if (!friend) {
    return <Typography variant="h6">Friend not found</Typography>;
  }

  return (
    <Box
      height={"100vh"}
      bgcolor={theme.palette.grey[100]}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      //   paddingBottom={5}
    >
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

      <Box
        width={"80%"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        mt={3}
        gap={2}
      >
        <Typography variant="h5" color="text.primary">
          {friend.name}
        </Typography>

        <Box position="relative" mb={4}>
          <Avatar
            alt={friend.name}
            src={friend.profilePicture}
            sx={{ width: 100, height: 100 }}
          />
        </Box>
      </Box>

      <Box>
        <Typography variant="h5" textAlign={"center"} mb={2}>
          Subjects You Both Do
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center">
          {friend.subjects.map((subject) => (
            <Box
              key={subject.name}
              display="flex"
              alignItems="center"
              mb={2}
              width="100%"
            >
              <Typography sx={{ flex: 1, textAlign: "left" }}>
                {subject.name}
              </Typography>
              <Box sx={{ width: 50, height: 50 }}>
                <CircularProgressbar
                  value={subject.focus}
                  strokeWidth={13}
                  text={`${subject.focus}%`}
                  styles={buildStyles({
                    strokeLinecap: "round",
                    textSize: "25px",
                    pathTransitionDuration: 0.5,
                    pathColor: theme.palette.primary.main,
                    textColor: theme.palette.primary.main,
                    trailColor: theme.palette.grey[100],
                  })}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Menubar />
    </Box>
  );
}
