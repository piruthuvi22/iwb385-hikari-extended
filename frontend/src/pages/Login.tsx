import { useAuth0 } from "@auth0/auth0-react";
import { Button, Typography } from "@mui/material";
import React, { useEffect } from "react";

export default function Login() {
  const {
    loginWithRedirect,
    user,
    isAuthenticated,
    isLoading,
    error,
    handleRedirectCallback,
  } = useAuth0();

  useEffect(() => {
    const processAuth = async () => {
      try {
        let res = await handleRedirectCallback();
        console.log("Response", res);

        res.appState = { targetUrl: "/dashboard" };
      } catch (error: any) {
        console.error("Authorization error: ", error);
        if (error.error === "access_denied") {
          // Handle the case where user declined the authorization
          alert("Authorization declined. Please try again.");
        }
      }
    };
    // processAuth();
  }, []);

  // console.log("Error1", error);

  return (
    <div>
      <Typography>Login Page</Typography>
      <Button variant="contained" onClick={() => loginWithRedirect()}>
        Log In
      </Button>
    </div>
  );
}
