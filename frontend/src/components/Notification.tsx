import { Alert, AlertPropsColorOverrides, Box, Snackbar } from "@mui/material";

export default function Notification({
  open,
  text,
  type,
  variant,
  handleClose,
}: {
  open: boolean;
  text: string;
  type: "success" | "error" | "warning" | "info";
  variant: "standard" | "filled" | "outlined";
  handleClose: () => void;
}) {
  return (
    <Box position={"absolute"} top={0} left={0} right={0}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{
          position: "absolute",
          top: 50,
        }}
      >
        <Alert
          // onClose={handleClose}
          severity={type}
          variant={variant}
          sx={{ width: "100%" }}
        >
          {text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
