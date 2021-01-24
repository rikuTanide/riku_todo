import React from "react";
import { PageState } from "../../Types/State";
import { Observable, Observer } from "rxjs";
import { Event } from "../../Types/Event";

export const App: React.FunctionComponent<{
  defaultState: PageState;
  observable: Observable<PageState>;
  observer: Observer<Event>;
}> = (props) => {
  return <div>Hello PC!</div>;
};
export default App;
