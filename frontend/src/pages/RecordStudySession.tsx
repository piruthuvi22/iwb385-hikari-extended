import React, { useEffect, useState } from "react";
import {
  alpha,
  Avatar,
  Badge,
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
import moment from "moment";
import Menubar from "../components/Menubar";
import { theme } from "../theme/theme";
import ProgressMeter from "../components/ProgressMeter";

const ENDPOINT = process.env.REACT_APP_API_URI;

interface Lesson {
  id: string;
  name: string;
  no: number;
}
export interface SubjectRecordsResponse {
  studentId: string;
  subjectId: string;
  weekNo: number;
  year: number;
  actualHours: number;
  goalHours: number;
  lastStudiedDates: {
    [key: string]: string;
  };
  studiedWithinTheWeek: string[];
  allLessons: Lesson[];
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
  const [subject, setSubject] = useState<SubjectRecordsResponse | null>(null);

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

  const onRecordStudySession = async (lessonId: string, totalMins: number) => {
    try {
      setLoading(true);
      const TOKEN = await getAccessTokenSilently({});

      const response = await axios.post(
        ENDPOINT + "/study",
        {
          subjectId: subjectId,
          lessonId: lessonId,
          noMins: totalMins,
        },
        {
          headers: {
            Authorization: "Bearer " + TOKEN,
          },
        }
      );
    } catch (error) {
      console.error("Error recording study session", error);
    } finally {
      getSubjectInfo();
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

  const formatLastStudied = (dateTime: string): string => {
    let duration = "";
    let diff = moment()
      .startOf("day")
      .diff(moment(dateTime).startOf("day"), "day");
    if (diff == 0) duration = "today";
    else if (diff == 1) duration = "yesterday";
    else duration = moment(dateTime).format("MMM DD");

    return duration;
  };

  // Convert goal hours to hours and minutes
  let goalHours = 0;
  let goalMins = 0;
  if (subject?.goalHours) {
    goalHours = Math.floor(subject?.goalHours);
    goalMins = Math.round((subject?.goalHours - goalHours) * 60);
  }

  // Convert actual hours to hours and minutes
  let actualHours = 0;
  let actualMins = 0;
  if (subject?.actualHours) {
    actualHours = Math.floor(subject?.actualHours);
    actualMins = Math.round((subject?.actualHours - actualHours) * 60);
  }

  let progress =
    ((subject?.actualHours ?? 0) / (subject?.goalHours ?? 1)) * 100;

  return (
    <Box height={"100vh"} bgcolor={theme.palette.grey[100]}>
      <Box
        sx={{
          position: "relative",
          // height: 300,
        }}
      >
        {loading && (
          <Box position={"fixed"} top={0} left={0} right={0}>
            <LinearProgress color="secondary" sx={{ height: 6 }} />
          </Box>
        )}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkOaTwJnmXUjkpj62We__JoTQ2liCX2fLcHQ&s"
          alt="cover"
          style={{
            width: "100%",
            height: "20vh",
            objectFit: "cover",
            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
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

            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
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
              <Box sx={{ width: 150 }}>
                <ProgressMeter
                  progress={parseFloat(progress.toFixed(1))}
                  showMiniCircle={false}
                  sx={{
                    strokeColor: theme.palette.primary.main,
                    bgStrokeColor: theme.palette.grey[300],
                    barWidth: 9,
                    valueSize: 25,
                    valueWeight: "bolder",
                    valueColor: theme.palette.secondary.main,
                    textColor: theme.palette.secondary.main,
                    loadingTime: 1500,
                    shape: "threequarters",
                    textFamily: "Fredoka",
                    valueFamily: "Fredoka",
                  }}
                />
              </Box>

              <Typography color="text.secondary">
                {actualHours + "hrs " + actualMins + "mins"} /{" "}
                {goalHours + "hrs " + goalMins + "mins"}
              </Typography>
            </Box>
          )}
          <Box px={2}>
            <List
              sx={{ width: "100%" }}
              subheader={
                <ListSubheader sx={{ backgroundColor: "transparent" }}>
                  Lessons
                </ListSubheader>
              }
            >
              {subject?.allLessons.map((lesson, index) => {
                let lessonId = lesson.id;
                let key = Object.keys(subject?.lastStudiedDates).filter(
                  (key) => key === lessonId
                );

                let dateTime = subject?.lastStudiedDates[key[0]];
                let duration = formatLastStudied(dateTime);
                let noOfWeeks = moment().diff(dateTime, "week");
                let badgeColor = "default";
                if (noOfWeeks === 0) badgeColor = "success";
                else if (noOfWeeks === 1) badgeColor = "warning";
                else badgeColor = "error";

                return (
                  <ListItem
                    key={lesson.id}
                    sx={{
                      background: `linear-gradient(45deg, ${alpha(
                        theme.palette.secondary.light,
                        0.5
                      )} 20%, ${alpha(theme.palette.warning.light, 0.5)} 80%)`,
                      mb: 2,
                      borderRadius: "1.5rem",
                      height: "80px",
                    }}
                    secondaryAction={<></>}
                  >
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontWeight: "600",
                          fontSize: "1.3rem",
                          color: theme.palette.grey[800],
                        },
                        "& .MuiListItemText-secondary": {
                          fontSize: "1rem",
                        },
                      }}
                      primary={lesson.name}
                      {...(dateTime && {
                        secondary: (
                          <Box
                            display={"flex"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                          >
                            Last studied {duration} at{" "}
                            {moment(dateTime).format("h:mm A")}
                            <Badge
                              color={badgeColor as any}
                              variant="dot"
                              sx={{
                                "& .MuiBadge-badge": {
                                  height: 10, // Adjust height
                                  width: 10, // Adjust width
                                  borderRadius: "50%",
                                },
                              }}
                            />
                          </Box>
                        ),
                      })}
                    />
                  </ListItem>
                );
              })}
            </List>
            <Fab
              sx={{ position: "fixed", bottom: 80, right: 30 }}
              color="secondary"
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
        lessons={subject?.allLessons}
        goal={subject?.goalHours}
        onSave={onRecordStudySession}
        handleClose={() => setOpen(false)}
      />
      <AddGoalHrs
        open={openGoal}
        goalHours={subject?.goalHours}
        actualGoal={subject?.actualHours}
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
      <Menubar />
    </Box>
  );
}

const AddSession = ({
  open,
  lessons,
  goal,
  handleClose,
  onSave,
}: {
  open: boolean;
  lessons: Lesson[] | undefined;
  goal: number | undefined;
  handleClose: () => void;
  onSave: (lessonId: string, totalMins: number) => void;
}) => {
  const [hour, setHour] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [lessonId, setLessonId] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleSave = () => {
    if (!lessonId) {
      setError(true);
      return;
    }
    let totalMinutes = hour * 60 + minutes;
    onSave(lessonId, totalMinutes);
    setLessonId("");
    handleClose();
  };

  // useEffect(() => {
  //   console.log("Study record");
  //   if (!goal) return;
  //   let hours = Math.floor(goal / 60);
  //   let mins = goal % 60;
  //   setHour(hours);
  //   setMinutes(mins);
  // }, [open]);

  // useEffect(() => {

  // }, [hour, minutes]);

  return (
    <DialogBox
      open={open}
      handleClose={handleClose}
      title="How long did you study?"
      actions={
        <>
          <Button
            variant="contained"
            sx={{
              width: "50%",
              fontWeight: "600",
              fontSize: "1.3rem",
              py: 2,
              borderRadius: "100px",
            }}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{
              width: "50%",
              fontWeight: "600",
              fontSize: "1.3rem",
              py: 2,
              borderRadius: "100px",
            }}
            onClick={() => {
              setLessonId("");
              setError(false);
              handleClose();
            }}
          >
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
              "& .MuiOutlinedInput-root": {
                borderRadius: "1.5rem",
              },
            }}
            helperText={error && "Choose the lesson"}
            error={error}
            value={lessonId}
            onChange={(e) => {
              setLessonId(e.target.value);
              setError(false);
            }}
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
              min={0}
              max={24}
              sx={{
                "& .MuiSlider-track": {
                  background: "transparent",
                  height: 15,
                },
                "& .MuiSlider-rail": {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 40%, ${theme.palette.secondary.main} 60%)`,
                  height: 15,
                },
                "& .MuiSlider-thumb": {
                  backgroundColor: theme.palette.secondary.main,
                  height: 24,
                  width: 24,
                  "&:hover": {
                    boxShadow: "0px 0px 0px 8px rgba(0,0,0,0.16)",
                  },
                },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "1.5rem",
                },
              }}
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
              min={0}
              max={59}
              step={5}
              sx={{
                "& .MuiSlider-track": {
                  background: "transparent",
                  height: 15,
                },
                "& .MuiSlider-rail": {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 40%, ${theme.palette.secondary.main} 60%)`,
                  height: 15,
                },
                "& .MuiSlider-thumb": {
                  backgroundColor: theme.palette.secondary.main,
                  height: 24,
                  width: 24,
                  "&:hover": {
                    boxShadow: "0px 0px 0px 8px rgba(0,0,0,0.16)",
                  },
                },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "1.5rem",
                },
              }}
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
  actualGoal,
  handleClose,
  onSave,
}: {
  open: boolean;
  goalHours: number | undefined;
  actualGoal: number | undefined;
  handleClose: () => void;
  onSave: (totalHr: number) => void;
}) => {
  const [hour, setHour] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [openNotification, setOpenNotification] = useState(false);

  const totalGoalTime = (goalHours ?? 0) * 60;
  const totalActualTime = (actualGoal ?? 0) * 60;

  useEffect(() => {
    // Edit goal hour
    if (!goalHours || !actualGoal) return;
    let hours = Math.floor(goalHours);
    let mins = Math.round((goalHours - hours) * 60);
    setHour(hours);
    setMinutes(mins);
  }, [open]);

  const handleSave = () => {
    const selectedTime = hour * 60 + minutes;
    if (selectedTime < totalActualTime) {
      setOpenNotification(true);
      return;
    }
    let totalHr = hour + minutes / 60;
    onSave(totalHr);
    handleClose();
  };
  return (
    <>
      <DialogBox
        open={open}
        handleClose={handleClose}
        title="Add your goal hours"
        actions={
          <>
            <Button
              variant="contained"
              sx={{
                width: "50%",
                fontWeight: "600",
                fontSize: "1.3rem",
                py: 2,
                borderRadius: "100px",
              }}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              sx={{
                width: "50%",
                fontWeight: "600",
                fontSize: "1.3rem",
                py: 2,
                borderRadius: "100px",
              }}
              onClick={handleClose}
            >
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
                sx={{
                  "& .MuiSlider-track": {
                    background: "transparent",
                    height: 15,
                  },
                  "& .MuiSlider-rail": {
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 40%, ${theme.palette.secondary.main} 60%)`,
                    height: 15,
                  },
                  "& .MuiSlider-thumb": {
                    backgroundColor: theme.palette.secondary.main,
                    height: 24,
                    width: 24,
                    "&:hover": {
                      boxShadow: "0px 0px 0px 8px rgba(0,0,0,0.16)",
                    },
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "1.5rem",
                  },
                }}
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
                step={5}
                max={59}
                sx={{
                  "& .MuiSlider-track": {
                    background: "transparent",
                    height: 15,
                  },
                  "& .MuiSlider-rail": {
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 40%, ${theme.palette.secondary.main} 60%)`,
                    height: 15,
                  },
                  "& .MuiSlider-thumb": {
                    backgroundColor: theme.palette.secondary.main,
                    height: 24,
                    width: 24,
                    "&:hover": {
                      boxShadow: "0px 0px 0px 8px rgba(0,0,0,0.16)",
                    },
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "1.5rem",
                  },
                }}
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

      <Notification
        open={openNotification}
        text="Goal time should be greater than studied hours"
        type="error"
        variant="standard"
        handleClose={() => setOpenNotification(false)}
      />
    </>
  );
};
