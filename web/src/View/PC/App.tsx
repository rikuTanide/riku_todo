import React from "react";
import { PageState, Toast as ToastState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Switch, Link, Route } from "react-router-dom";
import { NewTask } from "./NewTask";
import { Board } from "./Board";
import { EditTask } from "./EditTask";
import { Toast } from "./Toast";

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
      <Board
        submitting={props.state.newTask.submitting}
        tasks={props.state.taskSummaries}
        observer={props.observer}
      />
      <Route path="/" exact render={() => <Link to="/new">新規作成</Link>}/>
      <Route path="/new" render={() => <NewTask {...props} />} />
      <Route
        path="/tasks/:taskID/edit"
        render={() => <EditTask {...props} />}
      />
      {toast ? <Toast toast={toast} observer={props.observer} /> : ""}
    </div>
  );
};

export default App;
