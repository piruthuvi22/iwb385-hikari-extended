import { CircularProgress, Box } from "@mui/material";

export default function Loader() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      position="fixed"
      top={0}
      left={0}
      width="100%"
      zIndex={2000}
      sx={{
        backdropFilter: "blur(5px)",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
