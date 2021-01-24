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
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  formRoot: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "80%",
    },
  },
}));

export const EditTask: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const state = props.state;

  const { taskID } = useParams<{ taskID: string }>();
  const classes = useStyles();

  useEffect(() => {
    props.observer.next({
      type: "detail / fetch",
      taskID: taskID,
    });
  }, []);

  const editTask = state.editTask;

  if (!editTask) return <div>loading</div>;
  if (editTask.id != taskID) return <div>loading</div>;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "detail / save",
    });
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.observer.next({
      type: "detail / edit title",
      title: e.target.value,
    });
  }

  function onBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.observer.next({
      type: "detail / edit body",
      body: e.target.value,
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className={classes.formRoot}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              詳細
            </Typography>
            <Button color="inherit" onClick={onSubmit}>
              保存
            </Button>
          </Toolbar>
        </AppBar>

        <div>
          <TextField
            required
            label="タイトル"
            value={editTask.next.title}
            onChange={onTitleChange}
            variant="outlined"
            fullWidth
          />
        </div>

        <div>
          <TextField
            label="本文"
            value={editTask.next.title}
            onChange={onTitleChange}
            variant="outlined"
            multiline={true}
            rows={5}
            fullWidth
          />
        </div>
        <p>
          <cite>{editTask.next.nickname}</cite>
        </p>
      </form>
    </div>
  );
};
