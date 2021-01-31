import React from "react";
import { PageState } from "../../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../../Types/Event";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Avatar from "@material-ui/core/Avatar";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

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

export const MyPage: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const classes = useStyles();

  function logout(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "logout",
    });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <AccountCircleIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          マイページ
        </Typography>
        <div className={classes.form}>
          <fieldset>
            <h2>ログアウト</h2>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={logout}
            >
              ログアウト
            </Button>
          </fieldset>
        </div>
      </div>
    </Container>
  );
};
