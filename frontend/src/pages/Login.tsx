import { useAuth0 } from "@auth0/auth0-react";
import { Button, Typography } from "@mui/material";
import React from "react";

export default function Login() {
  const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();

  return (
    <div>
      <Typography>Login Page</Typography>
      <Button variant="contained" onClick={() => loginWithRedirect()}>
        Log In
      </Button>
    </div>
  );
}
