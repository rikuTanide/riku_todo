import React from "react";
import { PageState, Toast as ToastState } from "../../Types/State";
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
  const toast = props.state.toast;
  return (
    <div>
      Hello PC!
      <Continues {...props} />
      <Completes {...props} />
      <Trashs {...props} />
      <Link to="/new">新規作成</Link>
      <Route path="/new" render={() => <NewTask {...props} />} />
      {toast ? <Toast toast={toast} observer={props.observer} /> : ""}
    </div>
  );
};

const Toast: React.FunctionComponent<{
  toast: ToastState;
  observer: Observer<Event>;
}> = (props) => {
  const redo = () => props.observer.next({ type: "toast / redo-undo" });
  const listRedo = () => props.observer.next({ type: "toast / update status" });
  const close = () => props.observer.next({ type: "toast / close" });

  const toastType = props.toast.type;
  if (toastType == "edit redo") {
    return (
      <div>
        <button onClick={close}>×</button> 保存に失敗しました。
        <button onClick={redo}>再実行</button>
      </div>
    );
  }
  if (toastType == "edit undo") {
    return (
        <div>
          <button onClick={close}>×</button> 変更にしました
          <button onClick={redo}>取り消し</button>
        </div>
    );
  }
  if (toastType == "fetch detail error") {
    return (
        <div>
          <button onClick={close}>×</button>取得できませんでした。
        </div>
    );
  }
  if (toastType == "list status change error") {
      return <div>
          <button onClick={close}>×</button>保存できませんでした
          <button onClick={listRedo}>再実行</button>
      </div>
  }
  if (toastType == "new task submit error") {
    return (
        <div>
          <button onClick={close}>×</button>保存できませんでした
        </div>
    );
  }
  if (toastType == "update task submit error") {
    return (
        <div>
          <button onClick={close}>×</button>変更に失敗しました。
            <button onClick={redo}>再実行</button>
        </div>
    );
  }
  throw "ない";
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

export const Trashs: React.FunctionComponent<{
    state: PageState;
    observer: Observer<Event>;
}> = (props) => {

    function restore(id: string) {
        props.observer.next({
            type: "list / restore",
            taskID: id,
        });
    }

    const tasks = props.state.taskSummaries
        .filter((t) =>  t.trash == "trash")
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
                    <Link to={`/tasks/${t.id}/edit`}>編集</Link>
                </div>
            ))}
        </div>
    );
};

export default App;
