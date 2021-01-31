import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  CurrentTimeService,
  HttpService,
  LoginService,
  StorageService,
  User,
} from "./Service/Service";
import Axios from "axios";
import { useMediaQuery } from "react-responsive";
import { HashRouter, useHistory } from "react-router-dom";
import { setUp } from "./Model/MyPageModel";
import {
  currentTimeServiceImple,
  HttpServiceImpl,
  StorageServiceImple,
} from "./Service/ServiceImpl";
import { PageState } from "./Types/State";
import { Event } from "./Types/Event";
import { Observable, Observer } from "rxjs";
import { History } from "history";

const PC = React.lazy(() => import("./View/PC/App"));
const SP = React.lazy(() => import("./View/SP/App"));

export function showMyPage(user: User, loginService: LoginService) {
  const axios = Axios.create({
    baseURL: "https://8p31a5pvr0.execute-api.us-east-1.amazonaws.com/dev/",
    headers: { Authorization: user.idToken },
    timeout: 10000,
  });
  const httpService: HttpService = new HttpServiceImpl(axios);

  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <RouterWrapper
          user={user}
          httpService={httpService}
          loginService={loginService}
        />
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// historyを取得するため
const RouterWrapper: React.FunctionComponent<{
  user: User;
  httpService: HttpService;
  loginService: LoginService;
}> = (props) => {
  const user = props.user;

  const storageService: StorageService = new StorageServiceImple();
  const currentTimeService: CurrentTimeService = currentTimeServiceImple;
  const history = useHistory();

  const [defaultState, stateObservable, eventObserver] = setUp(
    storageService,
    props.httpService,
    currentTimeService,
    history,
    user.userID,
    user.nickname,
    props.loginService
  );

  props.httpService.onMessage().subscribe((_) =>
    eventObserver.next({
      type: "do update tasks",
    })
  );

  return (
    <QuerySelectorWrapper
      defaultState={defaultState}
      observable={stateObservable}
      observer={eventObserver}
      history={history}
    />
  );
};

const QuerySelectorWrapper: React.FunctionComponent<{
  defaultState: PageState;
  observable: Observable<PageState>;
  observer: Observer<Event>;
  history: History;
}> = (props) => {
  const isSmartPhone = useMediaQuery({ maxDeviceWidth: 768 });
  const [state, setState] = useState<PageState>(props.defaultState);

  useEffect(() => {
    const ss = props.observable.subscribe((s) => setState(s));
    return () => ss.unsubscribe();
  });

  return (
    <React.Suspense fallback={<div>loading</div>}>
      {isSmartPhone ? (
        <SP state={state} observer={props.observer} />
      ) : (
        <PC state={state} observer={props.observer} />
      )}
    </React.Suspense>
  );
};
