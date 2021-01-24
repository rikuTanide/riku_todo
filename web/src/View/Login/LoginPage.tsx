import React, { useEffect, useState } from "react";
import { LoginPageState, LoginPageState as State } from "../../Types/State";
import { LoginPageEvent } from "../../Types/Event";
import { Observable, Observer } from "rxjs";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";

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

// https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/sign-in/SignIn.js
export const LoginOrSignUpPage: React.FunctionComponent<{
  observer: Observer<LoginPageEvent>;
  observable: Observable<State>;
  defaultState: State;
}> = (props) => {
  const [state, setState] = useState<LoginPageState>(props.defaultState);

  useEffect(() => {
    const ss = props.observable.subscribe((s) => setState(s));
    return () => ss.unsubscribe();
  });

  if (state.type == "login")
    return <LoginPage observer={props.observer} state={state} />;
  else return <SignUpPage observer={props.observer} state={state} />;
};

export const LoginPage: React.FunctionComponent<{
  observer: Observer<LoginPageEvent>;
  state: State;
}> = (props) => {
  function submit(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "login / try login",
    });
  }

  function move(e: React.MouseEvent) {
    e.preventDefault();
    props.observer.next({
      type: "login / switch to sign up",
    });
  }
  function inputMailAddr(e: React.ChangeEvent<HTMLInputElement>) {
    props.observer.next({
      type: "login / mail addr",
      mailAddr: e.target.value,
    });
  }

  function inputPassword(e: React.ChangeEvent<HTMLInputElement>) {
    props.observer.next({
      type: "login / password",
      password: e.target.value,
    });
  }
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          ログイン
        </Typography>
        <form className={classes.form} noValidate onSubmit={submit}>
          <fieldset disabled={props.state.loading}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={inputMailAddr}
              value={props.state.loginMailAddr}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={inputPassword}
              value={props.state.loginPassword}
            />
            {props.state.hasError ? <Alert severity="error">エラー</Alert> : ""}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {props.state.loading ? (
                <CircularProgress color="secondary" />
              ) : (
                ""
              )}
              ログイン
            </Button>
            <Grid container>
              <Grid item>
                <Link href="#" variant="body2" onClick={move}>
                  会員登録する
                </Link>
              </Grid>
            </Grid>
          </fieldset>
        </form>
      </div>
    </Container>
  );
};

export const SignUpPage: React.FunctionComponent<{
  observer: Observer<LoginPageEvent>;
  state: State;
}> = (props) => {
  function submit(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "sign up / try sign up",
    });
  }

  function move(e: React.MouseEvent) {
    e.preventDefault();
    props.observer.next({
      type: "sing up / switch to login",
    });
  }
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          会員登録
        </Typography>
        <form className={classes.form} noValidate onSubmit={submit}>
          <fieldset disabled={props.state.loading}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) =>
                props.observer.next({
                  type: "sign up / mail add",
                  mailAddr: e.target.value,
                })
              }
              value={props.state.signUpMailAddr}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="nickname"
              label="ニックネーム"
              type="text"
              id="nickname"
              autoComplete="current-password"
              onChange={(e) =>
                props.observer.next({
                  type: "sign up / nickname",
                  nickname: e.target.value,
                })
              }
              value={props.state.signUpNickname}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) =>
                props.observer.next({
                  type: "sign up / password",
                  password: e.target.value,
                })
              }
              value={props.state.signUpPassword}
            />
            {props.state.hasError ? <Alert severity="error">エラー</Alert> : ""}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {props.state.loading ? (
                <CircularProgress color="secondary" />
              ) : (
                ""
              )}
              会員登録
            </Button>
            <Grid container>
              <Grid item>
                <Link href="#" variant="body2" onClick={move}>
                  アカウントを持っている
                </Link>
              </Grid>
            </Grid>
          </fieldset>
        </form>
      </div>
    </Container>
  );
};
