import React from "react";
import { PageState, Toast as ToastState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Switch, Link, Route, useHistory } from "react-router-dom";
import { NewTask } from "./NewTask";
import { Board } from "./Board";
import { EditTask } from "./EditTask";
import { Toast } from "./Toast";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import NotificationsIcon from "@material-ui/icons/Notifications";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
}));

// https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/dashboard/Dashboard.js
// PCの場合、編集ウィンドウと新規作成ウィンドウはモーダル形式になるので
// Routeにexactしない
export const App: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const toast = props.state.toast;
  const classes = useStyles();

  const history = useHistory();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, !classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            className={clsx(classes.menuButton, classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Rick Todo
          </Typography>
          <IconButton color="inherit" onClick={() => history.push("/new")}>
            <NoteAddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Board
            submitting={props.state.newTask.submitting}
            tasks={props.state.taskSummaries}
            observer={props.observer}
          />
        </Container>
      </main>
      <Route path="/new" render={() => <NewTask {...props} />} />
    </div>
  );
};

export default App;

/*
      <Board
        submitting={props.state.newTask.submitting}
        tasks={props.state.taskSummaries}
        observer={props.observer}
      />
      <Route path="/" exact render={() => <Link to="/new">新規作成</Link>} />
      <Route
        path="/tasks/:taskID/edit"
        render={() => <EditTask {...props} />}
      />
      {toast ? <Toast toast={toast} observer={props.observer} /> : ""}
 */
