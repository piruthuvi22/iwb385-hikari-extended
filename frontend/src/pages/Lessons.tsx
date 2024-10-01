import React from "react";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Article,
  Description,
  LibraryBooks,
  MenuBook,
  Send,
  StickyNote2,
} from "@mui/icons-material";

export default function Lessons() {
  const theme = useTheme();

  return (
    <Box height={"100vh"} bgcolor={theme.palette.grey[100]}>
      <Box
        sx={{
          position: "relative",
          // height: 300,
        }}
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkOaTwJnmXUjkpj62We__JoTQ2liCX2fLcHQ&s"
          alt="cover"
          style={{
            width: "100%",
            height: 300,
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,
            // bgcolor: theme.palette.primary.main,
            boxShadow: "inset 0px -100px 50px 0px rgba(0,0,0,0.85)",
          }}
        >
          <Typography
            variant="h3"
            color="white"
            position={"absolute"}
            bottom={0}
            padding={2}
          >
            Maths
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography variant="h5" color="primary" padding={2}>
          Which lesson did you study?
        </Typography>

        <Box padding={0}>
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                Choose the lesson
              </ListSubheader>
            }
          >
            {Array.from({ length: 20 }).map((_, index) => (
              <>
                <ListItemButton>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary={`Chapter ${index + 1}`} />
                </ListItemButton>
                <Divider variant="middle" component="li" />
              </>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
