import React from "react";
import { Observer } from "rxjs";
import { Event } from "../../../Types/Event";
import { useHistory } from "react-router-dom";
import { TaskSummary } from "../../../Types/Model";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import { CardActionArea } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import CheckIcon from "@material-ui/icons/Check";
import RestoreIcon from "@material-ui/icons/Restore";
import LinearProgress from "@material-ui/core/LinearProgress";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Toolbar from "@material-ui/core/Toolbar";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    flexGrow: 1,
  },
}));

// 各ボードはタスク一覧に対して冪等なので、これをメモ化の単位とする。
const _Board: React.FunctionComponent<{
  submitting: boolean;
  tasks: TaskSummary[];
  query: string;
  observer: Observer<Event>;
}> = (props) => {
  const [type, tab] = checkType(props.query);
  const classes = useStyles();

  const history = useHistory();
  function handleChange(e: any, value: any) {
    if (value === 0) history.push("?");
    else if (value === 1) history.push("?progress=complete");
    else if (value === 2) history.push("?trash=true");
  }

  const pc = props.tasks.filter(
    (t) => t.progress === "continue" && t.trash === ""
  ).length;
  const cc = props.tasks.filter(
    (t) => t.progress === "complete" && t.trash === ""
  ).length;
  const tc = props.tasks.filter((t) => t.trash === "trash").length;

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Tabs
            value={tab}
            onChange={handleChange}
            aria-label="simple tabs example"
            className={classes.title}
          >
            <Tab label={`進行中(${pc})`} value={0} />
            <Tab label={`完了(${cc})`} value={1} />
            <Tab label={`ゴミ箱(${tc})`} value={2} />
          </Tabs>
          <IconButton color="inherit" onClick={() => history.push("/mypage")}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {type === "continue" ? <Continues {...props} /> : ""}
      {type === "complete" ? <Completes {...props} /> : ""}
      {type === "trash" ? <Trashs {...props} /> : ""}
    </div>
  );
};
export const Board = React.memo(_Board);

function checkType(query: string): ["trash" | "complete" | "continue", number] {
  const search = new URLSearchParams(query);
  if (search.get("trash") === "true") return ["trash", 2];
  if (search.get("progress") === "complete") return ["complete", 1];
  return ["continue", 0];
}

const useCardStyles = makeStyles({
  root: {
    marginTop: "20px",
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
  },
});

export const Continues: React.FunctionComponent<{
  submitting: boolean;
  tasks: TaskSummary[];
  observer: Observer<Event>;
}> = (props) => {
  const history = useHistory();

  function complete(id: string) {
    props.observer.next({
      type: "list / complete",
      taskID: id,
    });
  }

  function trash(id: string) {
    props.observer.next({
      type: "list / trash",
      taskID: id,
    });
  }

  function moveToEdit(id: string) {
    history.push(`/tasks/${id}/edit`);
  }

  const classes = useCardStyles();

  const tasks = props.tasks
    .filter((t) => t.progress === "continue" && t.trash === "")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div>
      <h2>進行中</h2>
      {props.submitting ? (
        <Card elevation={3}>
          <LinearProgress />
        </Card>
      ) : (
        ""
      )}
      {tasks.map((t) => (
        <Card elevation={3} key={t.id} className={classes.root}>
          <CardActionArea onClick={() => moveToEdit(t.id)}>
            <CardContent>
              {t.updating ? <LinearProgress /> : ""}
              <h2>
                {t.title}
                <EditIcon />
              </h2>
              <time>{new Date(t.time).toLocaleString()}</time>
            </CardContent>
          </CardActionArea>
          <CardActions disableSpacing>
            <IconButton onClick={() => trash(t.id)}>
              <DeleteIcon />
            </IconButton>
            <IconButton
              className={classes.expand}
              onClick={() => complete(t.id)}
            >
              <CheckIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export const Completes: React.FunctionComponent<{
  tasks: TaskSummary[];
  observer: Observer<Event>;
}> = (props) => {
  const classes = useCardStyles();
  const history = useHistory();

  function toContinue(id: string) {
    props.observer.next({
      type: "list / continue",
      taskID: id,
    });
  }

  function trash(id: string) {
    props.observer.next({
      type: "list / trash",
      taskID: id,
    });
  }

  function moveToEdit(id: string) {
    history.push(`/tasks/${id}/edit`);
  }

  const tasks = props.tasks
    .filter((t) => t.progress === "complete" && t.trash === "")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div>
      <h2>完了</h2>
      {tasks.map((t) => (
        <Card elevation={3} key={t.id} className={classes.root}>
          <CardActionArea onClick={() => moveToEdit(t.id)}>
            <CardContent>
              {t.updating ? <LinearProgress /> : ""}
              <h2>
                {t.title}
                <EditIcon />
              </h2>
              <time>{new Date(t.time).toLocaleString()}</time>
            </CardContent>
          </CardActionArea>
          <CardActions disableSpacing>
            <IconButton onClick={() => trash(t.id)}>
              <DeleteIcon />
            </IconButton>
            <IconButton
              className={classes.expand}
              onClick={() => toContinue(t.id)}
            >
              <RestoreIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export const Trashs: React.FunctionComponent<{
  tasks: TaskSummary[];
  observer: Observer<Event>;
}> = (props) => {
  const classes = useCardStyles();
  const history = useHistory();

  function restore(id: string) {
    props.observer.next({
      type: "list / restore",
      taskID: id,
    });
  }

  function moveToEdit(id: string) {
    history.push(`/tasks/${id}/edit`);
  }

  const tasks = props.tasks
    .filter((t) => t.trash === "trash")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div>
      <h2>ゴミ箱</h2>
      {tasks.map((t) => (
        <Card elevation={3} key={t.id} className={classes.root}>
          <CardActionArea onClick={() => moveToEdit(t.id)}>
            <CardContent>
              {t.updating ? <LinearProgress /> : ""}
              <h2>
                {t.title}
                <EditIcon />
              </h2>
              <time>{new Date(t.time).toLocaleString()}</time>
            </CardContent>
          </CardActionArea>
          <CardActions disableSpacing>
            <IconButton onClick={() => history.push(`/tasks/${t.id}/delete`)}>
              <DeleteForeverIcon color="secondary" />
            </IconButton>
            <IconButton
              className={classes.expand}
              onClick={() => restore(t.id)}
            >
              <RestoreIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};
