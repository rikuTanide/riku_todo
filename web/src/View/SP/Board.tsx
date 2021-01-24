import React from "react";
import { PageState } from "../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Link } from "react-router-dom";
import { TaskSummary } from "../../Types/Model";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useParams,
  useHistory,
  useLocation,
} from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import { red } from "@material-ui/core/colors";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ShareIcon from "@material-ui/icons/Share";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CardActionArea } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from "@material-ui/icons/Check";
import RestoreIcon from "@material-ui/icons/Restore";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
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
    if (value == 0) history.push("?");
    else if (value == 1) history.push("?progress=complete");
    else if (value == 2) history.push("?trash=true");
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs
          value={tab}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="進行中" value={0} />
          <Tab label="完了" value={1} />
          <Tab label="ゴミ箱" value={2} />
        </Tabs>
      </AppBar>
      {type == "continue" ? <Continues {...props} /> : ""}
      {type == "complete" ? <Completes {...props} /> : ""}
      {type == "trash" ? <Trashs {...props} /> : ""}
    </div>
  );
};
export const Board = React.memo(_Board);

function checkType(query: string): ["trash" | "complete" | "continue", number] {
  const search = new URLSearchParams(query);
  if (search.get("trash") == "true") return ["trash", 2];
  if (search.get("progress") == "complete") return ["complete", 1];
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

const Continues: React.FunctionComponent<{
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
    .filter((t) => t.progress == "continue" && t.trash == "")
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
              {t.updating ? (
                  <Card elevation={3}>
                    <LinearProgress />
                  </Card>
              ) : (
                  ""
              )}
              <h2>
                {t.title}
                <EditIcon />
              </h2>
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

const Completes: React.FunctionComponent<{
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
    .filter((t) => t.progress == "complete" && t.trash == "")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div>
      <h2>完了</h2>
      {tasks.map((t) => (
        <Card elevation={3} key={t.id} className={classes.root}>
          <CardActionArea onClick={() => moveToEdit(t.id)}>
            <CardContent>
              <h2>
                {t.title}
                <EditIcon />
              </h2>
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

const Trashs: React.FunctionComponent<{
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
    .filter((t) => t.trash == "trash")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div>
      <h2>ゴミ箱</h2>
      {tasks.map((t) => (
        <Card elevation={3} key={t.id} className={classes.root}>
          <CardActionArea onClick={() => moveToEdit(t.id)}>
            <CardContent>
              <h2>
                {t.title}
                <EditIcon />
              </h2>
            </CardContent>
          </CardActionArea>
          <CardActions disableSpacing>
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
