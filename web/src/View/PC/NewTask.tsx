import React, { useEffect } from "react";
import { PageState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";
export const NewTask: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const state = props.state;

  useEffect(() => {
    props.observer.next({
      type: "new task / open",
    });
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "new task / submit",
    });
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.observer.next({
      type: "new task / title input",
      title: e.target.value,
    });
  }

  function onBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.observer.next({
      type: "new task / body input",
      body: e.target.value,
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="text"
            value={state.newTask.title}
            onChange={onTitleChange}
            required
          />
        </div>
        <div>
          <textarea value={state.newTask.body} onChange={onBodyChange} />
        </div>

        <button>登録</button>
      </form>
    </div>
  );
};
