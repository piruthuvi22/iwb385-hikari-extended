import { useAuth0 } from "@auth0/auth0-react";
import { Button, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { loginWithRedirect, user, isAuthenticated, isLoading, logout } =
    useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return isAuthenticated ? (
    <div>
      <Typography>Dashboard Page</Typography>
      <img src={user?.picture} alt={user?.name} />
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <Button
        variant="contained"
        color="warning"
        onClick={() => logout({ logoutParams: { returnTo: "/auth/login" } })}
      >
        Logout
      </Button>
    </div>
  ) : (
    <div>
      <Link to={"/auth/login"}>Login Page</Link>
    </div>
  );
}
