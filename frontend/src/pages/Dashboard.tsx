import { useAuth0 } from "@auth0/auth0-react";
import { Button, Typography } from "@mui/material";
import React from "react";
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

  React.useEffect(() => {
    getAccessToken();
  }, []);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  async function logoutSession() {
    // const id = await getIdTokenClaims();
    await logout({
      logoutParams: { returnTo: "http://localhost:3000/auth/login" },
    });
  }

  async function getAccessToken() {
    try {
      const token = await getAccessTokenSilently();
      console.log("Token", token);

      setAccessToken(token);
    } catch (error) {
      console.error("Error", error);
      // await logout();
      navigate("/dashboard");
    }
  }
  console.log("Error2", error);

  return isAuthenticated ? (
    <div>
      <Typography>Dashboard Page</Typography>
      <img src={user?.picture} alt={user?.name} />
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <p>{accessToken}</p>
      <Button variant="contained" color="warning" onClick={logoutSession}>
        Logout
      </Button>
    </div>
  ) : (
    <div>
      <Link to={"/auth/login"}>Login Page</Link>
    </div>
  );
}
