import React from "react";
import { PageState } from "../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Link } from "react-router-dom";
import { TaskSummary } from "../../Types/Model";

// 各ボードはタスク一覧に対して冪等なので、これをメモ化の単位とする。

const _Board: React.FunctionComponent<{
  submitting: boolean;
  tasks: TaskSummary[];
  query: string;
  observer: Observer<Event>;
}> = (props) => {
  const [type, tab] = checkType(props.query);

  return (
    <div>
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
