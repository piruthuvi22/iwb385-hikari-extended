import React, { useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Fab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Slider,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Add,
  Article,
  Description,
  Image,
  LibraryBooks,
  MenuBook,
  Send,
  StickyNote2,
} from "@mui/icons-material";
import CircularWithValueLabel, {
  CircularProgressWithLabel,
} from "../components/CircularProgress";
import DialogBox from "../components/DialogBox";

export default function RecordStudySession() {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  return (
    <Box height={"100vh"}>
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
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          py={2}
        >
          {/* <CircularWithValueLabel /> */}
          <Box sx={{ width: 150 }}>
            <CircularProgressbar
              value={66}
              strokeWidth={5}
              text="66%"
              styles={buildStyles({
                strokeLinecap: "round",
                textSize: "16px",
                pathTransitionDuration: 0.5,
                // Colors
                pathColor: theme.palette.primary.main,
                textColor: theme.palette.primary.main,
                trailColor: theme.palette.grey[100],
              })}
            />
          </Box>

          <Typography color="text.secondary">2hrs 30min / 5hrs</Typography>
        </Box>
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
                <ListItem secondaryAction={<></>}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Lesson ${index + 1}`}
                    secondary="Last studies 2 days ago"
                  />
                </ListItem>
                <Divider variant="middle" component="li" />
              </>
            ))}
          </List>
          <Fab
            sx={{ position: "fixed", bottom: 25, right: 25 }}
            color="primary"
            size="large"
            onClick={() => setOpen(true)}
          >
            <Add />
          </Fab>
        </Box>
      </Box>

      <AddSession open={open} handleClose={() => setOpen(false)} />
    </Box>
  );
}

const AddSession = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  const [hour, setHour] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);

  return (
    <DialogBox
      open={open}
      handleClose={handleClose}
      title="How long did you study?"
      actions={
        <>
          <Button variant="contained" onClick={handleClose}>
            Save
          </Button>
          <Button variant="outlined" onClick={handleClose}>
            Close
          </Button>
        </>
      }
    >
      <>
        <Box py={4}>
          <Typography>Hours</Typography>
          <Box display={"flex"} justifyContent={"space-between"} gap={2}>
            <Slider
              defaultValue={12}
              min={0}
              max={24}
              getAriaValueText={(value) => `${value}hrs`}
              value={typeof hour === "number" ? hour : 0}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChange={(e, value) => setHour(Number(value))}
            />
            <TextField
              onChange={(e) => setHour(Number(e.target.value))}
              type="number"
              size="small"
              value={hour}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 24,
                },
              }}
            />
          </Box>

          <Typography>Minutes</Typography>
          <Box display={"flex"} justifyContent={"space-between"} gap={2}>
            <Slider
              defaultValue={12}
              min={0}
              max={59}
              getAriaValueText={(value) => `${value}mins`}
              value={typeof minutes === "number" ? minutes : 0}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChange={(e, value) => setMinutes(Number(value))}
            />
            <TextField
              onChange={(e) => setMinutes(Number(e.target.value))}
              type="number"
              size="small"
              value={minutes}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 59,
                  minLength: 5,
                },
              }}
            />
          </Box>
          <Typography
            textAlign={"center"}
            variant="h6"
            mt={2}
            color="secondary"
          >
            <span
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
              }}
            >
              {hour}
            </span>
            hrs
            <span
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
              }}
            >
              {minutes}
            </span>
            mins
          </Typography>
        </Box>
      </>
    </DialogBox>
  );
};
