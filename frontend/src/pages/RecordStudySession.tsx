import React, { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Fab,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
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
  MoreVert,
  Send,
  StickyNote2,
} from "@mui/icons-material";
import CircularWithValueLabel, {
  CircularProgressWithLabel,
} from "../components/CircularProgress";
import DialogBox from "../components/DialogBox";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import Notification from "../components/Notification";

const ENDPOINT = "http://localhost:9094/central/api";

interface Lesson {
  id: string;
  name: string;
  no: number;
}
interface SubjectResponse {
  studentId: string;
  subjectId: string;
  weekNo: number;
  year: number;
  actualHours: number;
  goalHours: number;
  lessonDates: {};
  studiedLessons: [];
  lessons: Lesson[];
}

export default function RecordStudySession() {
  const theme = useTheme();
  const location = useLocation();
  const { subjectId, subjectName } = location.state;
  const { getAccessTokenSilently } = useAuth0();

  const [open, setOpen] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<SubjectResponse | null>(null);

  const getSubjectInfo = async () => {
    setLoading(true);
    try {
      const TOKEN = await getAccessTokenSilently({});

      if (!subjectId) {
        console.error("Subject ID not found");
        return;
      }
      const response = await axios.get(ENDPOINT + "/subjects/" + subjectId, {
        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      });
      console.log("Subject Info", response.data);
      setSubject(response.data);
      setOpenGoal(response.data.goalHours === 0);
    } catch (error) {
      console.error("Error fetching subject info", error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateGoalHours = async (goalHours: number) => {
    setLoading(true);
    try {
      const TOKEN = await getAccessTokenSilently({});

      if (!subjectId) {
        console.error("Subject ID not found");
        return;
      }
      const response = await axios.put(
        ENDPOINT + "/subjects/goals",
        {
          subjectId: subjectId,
          goalHours: goalHours,
        },
        {
          headers: {
            Authorization: "Bearer " + TOKEN,
          },
        }
      );
      console.log("Subject Info", response.data);
      getSubjectInfo();
      setOpenGoal(response.data.goalHours === 0);
    } catch (error) {
      console.error("Error update goal hrs", error);
    } finally {
      setLoading(false);
    }
  };

  const onRecordStudySession = async (
    lessonId: string,
    totalMinutes: number
  ) => {
    try {
      const response = await axios.post(ENDPOINT + "/study", {});
    } catch (error) {
      console.error("Error recording study session", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubjectInfo();
  }, []);

  const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // if (loading) {
  //   return <Loader />;
  // }

  // Convert goal total minutes to hours and minutes
  let goalHours = 0;
  let goalMins = 0;
  if (subject?.goalHours) {
    goalHours = Math.floor(subject?.goalHours / 60);
    goalMins = subject?.goalHours % 60;
  }

  // Convert goal total minutes to hours and minutes
  let actualHours = 0;
  let actualMins = 0;
  if (subject?.actualHours) {
    actualHours = Math.floor(subject?.actualHours / 60);
    actualMins = subject?.actualHours % 60;
  }

  let progress = (subject?.actualHours ?? 0 / (subject?.goalHours ?? 1)) * 100;

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
          <Box
            display={"flex"}
            width={"100%"}
            justifyContent={"space-between"}
            gap={2}
            position={"absolute"}
            bottom={0}
          >
            <Typography variant="h3" color="white" padding={2}>
              {subjectName}
            </Typography>
            <Box sx={{ alignSelf: "center" }}>
              <IconButton
                title="Add goal hours"
                size="large"
                edge="start"
                color="secondary"
                disabled={loading}
                onClick={(event) => handleClickMenu(event)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
            <MenuItem
              onClick={() => {
                setOpenGoal(true);
                handleCloseMenu();
              }}
            >
              {subject?.goalHours === 0 ? "Add Goal Hours" : "Edit Goal Hours"}
            </MenuItem>
          </Menu>
        </Box>
        {loading && <LinearProgress color="secondary" />}
      </Box>
      {!loading && (
        <Box>
          {subject?.goalHours != 0 && (
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
                  value={progress}
                  strokeWidth={5}
                  text={progress.toFixed(2) + "%"}
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

              <Typography color="text.secondary">
                {actualHours + "hrs " + actualMins + " mins"} /{" "}
                {goalHours + "hrs " + goalMins + " mins"}
              </Typography>
            </Box>
          )}
          <Box padding={0}>
            <List
              sx={{ width: "100%", bgcolor: "background.paper" }}
              component="nav"
              aria-labelledby="nested-list-subheader"
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  Lessons
                </ListSubheader>
              }
            >
              {subject?.lessons.map((lesson, index) => (
                <div key={lesson.id}>
                  <ListItem secondaryAction={<></>}>
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText
                      primary={lesson.name}
                      secondary="Last studies 2 days ago"
                    />
                  </ListItem>
                  <Divider variant="middle" component="li" />
                </div>
              ))}
            </List>
            <Fab
              sx={{ position: "fixed", bottom: 25, right: 25 }}
              color="primary"
              size="large"
              disabled={subject?.goalHours === 0}
              onClick={() => {
                if (subject?.goalHours === 0) {
                  setOpenGoal(true);
                  return;
                }
                setOpen(true);
              }}
            >
              <Add />
            </Fab>
          </Box>
        </Box>
      )}

      <AddSession
        open={open}
        lessons={subject?.lessons}
        onSave={onRecordStudySession}
        handleClose={() => setOpen(false)}
      />
      <AddGoalHrs
        open={openGoal}
        goalHours={subject?.goalHours}
        handleClose={() => setOpenGoal(false)}
        onSave={onUpdateGoalHours}
      />

      <Notification
        type="info"
        variant="standard"
        open={subject?.goalHours === 0}
        text="Set goal hours before recording study session"
        handleClose={() => {}}
      />
    </Box>
  );
}

const AddSession = ({
  open,
  lessons,
  handleClose,
  onSave,
}: {
  open: boolean;
  lessons: Lesson[] | undefined;
  handleClose: () => void;
  onSave: (lessonId: string, totalMinutes: number) => void;
}) => {
  const [hour, setHour] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [lessonId, setLessonId] = useState<string | undefined>(undefined);

  const handleSave = () => {
    if (!lessonId) return;
    let totalMinutes = hour * 60 + minutes;
    onSave(lessonId, totalMinutes);
    handleClose();
  };

  return (
    <DialogBox
      open={open}
      handleClose={handleClose}
      title="How long did you study?"
      actions={
        <>
          <Button variant="contained" onClick={handleSave}>
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
          <TextField
            select
            label="Lesson"
            fullWidth
            sx={{
              mb: 3,
            }}
            onChange={(e) => setLessonId(e.target.value)}
          >
            {lessons?.map((lesson, index) => (
              <MenuItem key={lesson.id} value={lesson.id}>
                {lesson.name}
              </MenuItem>
            ))}
          </TextField>
          <Typography gutterBottom>Hours</Typography>
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

          <Typography gutterBottom>Minutes</Typography>
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

const AddGoalHrs = ({
  open,
  goalHours,
  handleClose,
  onSave,
}: {
  open: boolean;
  goalHours: number | undefined;
  handleClose: () => void;
  onSave: (totalMinutes: number) => void;
}) => {
  const [hour, setHour] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);

  console.log("Goal Hours", goalHours);
  useEffect(() => {
    if (goalHours) {
      let hours = Math.floor(goalHours / 60);
      let mins = goalHours % 60;
      setHour(hours);
      setMinutes(mins);
    }
  }, [open]);

  const handleSave = () => {
    let totalMinutes = hour * 60 + minutes;
    onSave(totalMinutes);
    handleClose();
  };
  return (
    <DialogBox
      open={open}
      handleClose={handleClose}
      title="Add your goal hours"
      actions={
        <>
          <Button variant="contained" onClick={handleSave}>
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
