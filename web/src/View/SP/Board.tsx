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

const Continues: React.FunctionComponent<{
  submitting: boolean;
  tasks: TaskSummary[];
  observer: Observer<Event>;
}> = (props) => {
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

  const tasks = props.tasks
    .filter((t) => t.progress == "continue" && t.trash == "")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div style={{ border: "solid 1px black" }}>
      {props.submitting ? "作成中" : ""}
      <h2>進行中</h2>
      {tasks.map((t) => (
        <div key={t.id} style={{ border: "solid 1px black" }}>
          {t.updating ? <div>保存中</div> : ""}
          <p>{t.title}</p>
          <time>{new Date(t.time).toLocaleString()}</time>
          <div>
            <button onClick={() => complete(t.id)}>完了</button>
            <button onClick={() => trash(t.id)}>削除</button>
          </div>
          <Link to={`/tasks/${t.id}/edit`}>詳細</Link>
        </div>
      ))}
    </div>
  );
};

const Completes: React.FunctionComponent<{
  tasks: TaskSummary[];
  observer: Observer<Event>;
}> = (props) => {
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

  const tasks = props.tasks
    .filter((t) => t.progress == "complete" && t.trash == "")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div style={{ border: "solid 1px black" }}>
      <h2>完了</h2>
      {tasks.map((t) => (
        <div key={t.id} style={{ border: "solid 1px black" }}>
          {t.updating ? <div>保存中</div> : ""}
          <p>{t.title}</p>
          <time>{new Date(t.time).toLocaleString()}</time>
          <div>
            <button onClick={() => toContinue(t.id)}>未完了</button>
            <button onClick={() => trash(t.id)}>削除</button>
          </div>
          <Link to={`/tasks/${t.id}/edit`}>詳細</Link>
        </div>
      ))}
    </div>
  );
};

const Trashs: React.FunctionComponent<{
  tasks: TaskSummary[];
  observer: Observer<Event>;
}> = (props) => {
  function restore(id: string) {
    props.observer.next({
      type: "list / restore",
      taskID: id,
    });
  }

  const tasks = props.tasks
    .filter((t) => t.trash == "trash")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div style={{ border: "solid 1px black" }}>
      <h2>ゴミ箱</h2>
      {tasks.map((t) => (
        <div key={t.id} style={{ border: "solid 1px black" }}>
          {t.updating ? <div>保存中</div> : ""}
          <p>{t.title}</p>
          <time>{new Date(t.time).toLocaleString()}</time>
          <div>
            <button onClick={() => restore(t.id)}>元に戻す</button>
          </div>
          <Link to={`/tasks/${t.id}/edit`}>詳細</Link>
        </div>
      ))}
    </div>
  );
};
