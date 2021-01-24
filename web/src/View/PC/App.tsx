import React from "react";
import { PageState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Switch, Link, Route } from "react-router-dom";
import { NewTask } from "./NewTask";

// PCの場合、編集ウィンドウと新規作成ウィンドウはモーダル形式になるので
// Routeにexactしない
export const App: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  return (
    <div>
      Hello PC!
      <Continues {...props} />
      <Completes {...props} />
      <Link to="/new">新規作成</Link>
      <Route path="/new" render={() => <NewTask {...props} />} />
    </div>
  );
};

export const Continues: React.FunctionComponent<{
  state: PageState;
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

  const tasks = props.state.taskSummaries
    .filter((t) => t.progress == "continue" && t.trash == "")
    .sort((t1, t2) => (t1.time > t2.time ? -1 : 1));
  return (
    <div style={{ border: "solid 1px black" }}>
      {props.state.newTask.submitting ? "作成中" : ""}
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
          <Link to={`/tasks/${t.id}/edit`}>編集</Link>
        </div>
      ))}
    </div>
  );
};

export const Completes: React.FunctionComponent<{
  state: PageState;
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

  const tasks = props.state.taskSummaries
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
          <Link to={`/tasks/${t.id}/edit`}>編集</Link>
        </div>
      ))}
    </div>
  );
};

export default App;
