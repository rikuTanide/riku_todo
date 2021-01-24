import React, { useEffect } from "react";
import { PageState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useParams,
  useHistory,
  useLocation,
} from "react-router-dom";

export const EditTask: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const state = props.state;

  const { taskID } = useParams<{ taskID: string }>();

  useEffect(() => {
    props.observer.next({
      type: "detail / fetch",
      taskID: taskID,
    });
  }, []);

  const editTask = state.editTask;

  if (!editTask) return <div>loading</div>;
  if (editTask.id != taskID) return <div>loading</div>;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "detail / save",
    });
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.observer.next({
      type: "detail / edit title",
      title: e.target.value,
    });
  }

  function onBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.observer.next({
      type: "detail / edit body",
      body: e.target.value,
    });
  }

  return (
    <div style={{ border: "solid 1px black" }}>
      詳細
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="text"
            value={editTask.next.title}
            onChange={onTitleChange}
            required
          />
        </div>
        <div>
          <textarea value={editTask.next.body} onChange={onBodyChange} />
        </div>
        <p>
          <cite>{editTask.next.nickname}</cite>
        </p>
        <button>登録</button>
      </form>
    </div>
  );
};
