import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import mathematics from "../assets/mathematics.svg";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function GetStarted() {
  const theme = useTheme();
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    // Add login logic here
    let res = await loginWithRedirect();
  };
  return (
    <Box
      height={"100vh"}
      bgcolor={theme.palette.grey[100]}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"space-between"}
    >
      <Box
        flexGrow={"1"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography variant="h2" fontWeight={"500"} color="primary">
          Studify
        </Typography>

        <Typography variant="h6" textAlign={"center"} color="text.secondary">
          Study Smarter, Not Longer!
        </Typography>
      </Box>
      <Box flexGrow={"1"} textAlign={"center"}>
        <img
          src={mathematics}
          alt="cover"
          style={{
            width: "80%",
            // height: "50%",
            objectFit: "cover",
          }}
        />
      </Box>
      <Box flexGrow={"1"} textAlign={"center"}>
        {/* <Link
          to="/auth/login"
          style={{ textDecoration: "none", color: "white" }}
        > */}
        <Button
          variant="contained"
          color="primary"
          sx={{
            width: "80%",
            fontWeight: "600",
            fontSize: "1.3rem",
            px: 2,
            py: 3,
            borderRadius: "100px",
          }}
          onClick={handleLogin}
        >
          Let's Get Started
        </Button>
        {/* </Link> */}
      </Box>
    </Box>
  );
}
