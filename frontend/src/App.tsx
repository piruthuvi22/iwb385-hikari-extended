import React from "react";

import { ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import "./App.css";
import GetStarted from "./pages/GetStarted";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <GetStarted />
      </div>
    </ThemeProvider>
  );
}

export default App;
