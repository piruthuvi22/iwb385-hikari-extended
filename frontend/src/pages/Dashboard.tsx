import { useAuth0 } from "@auth0/auth0-react";
import { Button, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = React.useState<string>("");

  const {
    loginWithRedirect,
    user,
    isAuthenticated,
    isLoading,
    logout,
    getIdTokenClaims,
    getAccessTokenSilently,
    error,
  } = useAuth0();

  useEffect(() => {
    getAccessToken();
  }, []);

  async function getAccessToken() {
    try {
      const token = await getAccessTokenSilently();
      console.info("AccessToken:", token);
      setAccessToken(token);
    } catch (error) {
      console.error("AccessTokenError:", error);
      navigate("/dashboard");
    }
  }

  if (isLoading) {
    return <div>Loading ...</div>;
  }
  return isAuthenticated ? (
    <div>
      <Typography>Dashboard Page</Typography>
      <img src={user?.picture} alt={user?.name} />
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <p>{accessToken}</p>
      <Button
        variant="contained"
        color="warning"
        onClick={() => {
          logout({
            logoutParams: { returnTo: window.location.origin + "/auth/login" },
          });
        }}
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
