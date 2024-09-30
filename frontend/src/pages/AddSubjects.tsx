import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Banner from "../assets/addSubjectBg.jpg";
import AddIcon from "@mui/icons-material/Add";

export default function AddSubject() {
  const theme = useTheme();

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

        <MenuIcon
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            fontSize: "2rem",
            cursor: "pointer",
          }}
        />
      </Box>

      <Box width={"100%"} textAlign={"center"} mt={2}>
        <Typography variant="h5" color="text.primary">
          Let's select your subjects!
        </Typography>
      </Box>

      <Box
        width={"100%"}
        display={"flex"}
        justifyContent={"center"}
        mb={3}
        mt={6}
      >
        <Link to="/dashboard" style={{ textDecoration: "none", width: "80%" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              width: "100%",
              fontWeight: "600",
              fontSize: "1.3rem",
              py: 2,
              borderRadius: "50px",
            }}
          >
            <AddIcon
              sx={{
                fontSize: "1.5rem",
                stroke: "white",
                strokeWidth: "1",
                mr: 1,
              }}
            ></AddIcon>
            Add Subject
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
