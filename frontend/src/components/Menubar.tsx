import { useState, useEffect } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import { MenuBook } from "@mui/icons-material";
import { theme } from "../theme/theme";

export default function Menubar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // Set the active tab based on the current URL path
  useEffect(() => {
    if (location.pathname === "/add-subject") {
      setValue(0);
    } else if (
      location.pathname === "/friends" ||
      location.pathname === "/add-friends" ||
      location.pathname.startsWith("/friend/")
    ) {
      setValue(1);
    } else if (location.pathname === "/profile") {
      setValue(2);
    }
  }, [location.pathname]); // Re-run this effect whenever the path changes

  const handleNavigation = (newValue: number) => {
    setValue(newValue);

    if (newValue === 0) {
      navigate("/add-subject");
    } else if (newValue === 1) {
      navigate("/friends");
    } else if (newValue === 2) {
      navigate("/profile");
    }
  };

  return (
    <Box sx={{ width: "100%", position: "fixed", bottom: 0 }}>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          handleNavigation(newValue);
        }}
        showLabels
        sx={{
          backgroundColor: theme.palette.grey[100],
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          "& .Mui-selected": {
            color: theme.palette.primary.main,
          },
        }}
      >
        <BottomNavigationAction label="Subjects" icon={<MenuBook />} />
        <BottomNavigationAction label="Friends" icon={<GroupIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Box>
  );
}
