import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { theme } from "../theme/theme";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DialogBox({
  open,
  title,
  handleClose,
  children,
  actions,
}: {
  open: boolean;
  title: string;
  handleClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Dialog
      fullWidth
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle sx={{
        color: theme.palette.grey[600],
        borderBottom: "1px solid #ddd",
        padding: "10px 20px",
        fontSize: "1.5rem",
        fontWeight: 600,
      }}>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
}
