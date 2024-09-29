import { Box, Button, Typography, useTheme } from "@mui/material";
import mathematics from "../assets/mathematics.svg";
import { Link } from "react-router-dom";

export default function GetStarted() {
  const theme = useTheme();
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
          StRing
        </Typography>

        <Typography variant="h4" color="text.secondary">
          Welcome Piruthuvi
        </Typography>
      </Box>
      <Box flexGrow={"1"}>
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
      <Box flexGrow={"1"}>
        <Link
          to="/dashboard"
          style={{ textDecoration: "none", color: "white" }}
        >
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
          >
            Let's Get Started
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
