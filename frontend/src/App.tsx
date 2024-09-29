import React from "react";

import { Box, Button, ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Box>
          <Button variant="contained" color="secondary">
            Hello World
          </Button>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
