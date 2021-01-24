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
      <Link to="/new">新規作成</Link>
      <Route path="/new" render={() => <NewTask {...props} />} />
    </div>
  );
};
export default App;
