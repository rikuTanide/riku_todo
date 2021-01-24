import React, { useEffect } from "react";
import { PageState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useParams,
  useHistory,
  useLocation,
} from "react-router-dom";
import { EditTask as EditTaskInner } from "../SP/EditTask";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 300,
    flexGrow: 1,
    minWidth: 300,
    transform: "translateZ(0)",
    // The position fixed scoping doesn't work in IE 11.
    // Disable this demo to preserve the others.
    "@media all and (-ms-high-contrast: none)": {
      display: "none",
    },
  },
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export const EditTask: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Modal
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      open
      aria-labelledby="server-modal-title"
      aria-describedby="server-modal-description"
      className={classes.modal}
      onClose={() => history.push("/")}
    >
      <div className={classes.paper}>
        <EditTaskInner {...props} />
      </div>
    </Modal>
  );
};
