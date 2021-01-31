import React, { useEffect } from "react";
import { PageState } from "../../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../../Types/Event";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import PostAddIcon from "@material-ui/icons/PostAdd";

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

export const NewTask: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const state = props.state;
  const classes = useStyles();

  useEffect(() => {
    props.observer.next({
      type: "new task / open",
    });
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "new task / submit",
    });
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.observer.next({
      type: "new task / title input",
      title: e.target.value,
    });
  }

  function onBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.observer.next({
      type: "new task / body input",
      body: e.target.value,
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className={classes.formRoot}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              新規作成
            </Typography>

            <Button color="inherit" onClick={onSubmit}>
              <PostAddIcon />
              作成
            </Button>
          </Toolbar>
        </AppBar>

        <div>
          <TextField
            required
            label="タイトル"
            value={state.newTask.title}
            onChange={onTitleChange}
            variant="outlined"
            fullWidth
          />
        </div>

        <div>
          <TextField
            label="本文"
            value={state.newTask.body}
            onChange={onBodyChange}
            variant="outlined"
            multiline={true}
            rows={5}
            fullWidth
          />
        </div>
      </form>
    </div>
  );
};
