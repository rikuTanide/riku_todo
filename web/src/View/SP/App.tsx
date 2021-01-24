import React from "react";
import { PageState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Link, Route } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Board } from "./Board";
import { NewTask } from "./NewTask";
import { EditTask } from "./EditTask";
import { Toast } from "./Toast";

// スマホページは新規作成画面と編集画面を全画面表示するので
// RouteにExactを付ける
export const App: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const history = useHistory();
  const toast = props.state.toast;

  return (
    <div>
      <Route
        path="/"
        exact
        render={() => (
          <Board
            submitting={props.state.newTask.submitting}
            tasks={props.state.taskSummaries}
            observer={props.observer}
            query={history.location.search}
          />
        )}
      />
      <Route path="/new" exact render={() => <NewTask {...props} />} />
      <Route
        exact
        path="/tasks/:taskID/edit"
        render={() => <EditTask {...props} />}
      />
      {toast ? <Toast toast={toast} observer={props.observer} /> : ""}
      <Link to="/new">新規作成</Link>
    </div>
  );
};

export default App;
