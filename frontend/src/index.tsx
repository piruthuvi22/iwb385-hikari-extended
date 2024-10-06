import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/main";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./theme/theme";
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Auth0Provider
        domain="dev-gxh7kk7t8hc71xii.us.auth0.com"
        clientId="b7JPK0qS9iDWgpwKMrX1CEg51MflYsGj"
        authorizationParams={{
          redirect_uri: window.location.origin + "/dashboard",
        }}
      >
        <RouterProvider router={router} />
      </Auth0Provider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
/**
 * 
 * 
    <App />
  ,
 */
