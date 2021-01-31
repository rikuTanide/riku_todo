import React from "react";
import { PageState } from "../../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../../Types/Event";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Avatar from "@material-ui/core/Avatar";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export const DeleteTask: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const { taskID } = useParams<{ taskID: string }>();
  const classes = useStyles();

  function handle(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "delete task",
      taskID: taskID,
    });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <DeleteForeverIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          削除しますか？
        </Typography>
        <div className={classes.form}>
          <fieldset>
            <h2>削除する</h2>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handle}
            >
              削除する
            </Button>
          </fieldset>
        </div>
      </div>
    </Container>
  );
};
