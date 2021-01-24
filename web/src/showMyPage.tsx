import React from "react";
import ReactDOM from "react-dom";
import { CurrentTimeService, StorageService, User } from "./Service/Service";
import Axios, { AxiosInstance } from "axios";
import { useMediaQuery } from "react-responsive";
import { HashRouter } from "react-router-dom";
import { setUp } from "./Model/MyPageModel";
import {
  currentTimeServiceImple,
  HttpServiceImpl,
  StorageServiceImple,
} from "./Service/ServiceImpl";
import { PageState } from "./Types/State";
import { Event } from "./Types/Event";
import { Observable, Observer } from "rxjs";

const PC = React.lazy(() => import("./View/PC/App"));
const SP = React.lazy(() => import("./View/SP/App"));

export function showMyPage(user: User) {
  const axios = Axios.create({
    baseURL: "https://apx6s3pmdd.execute-api.us-east-1.amazonaws.com/dev/",
    headers: { Authorization: user.idToken },
    timeout: 10000,
  });

  const storageService: StorageService = new StorageServiceImple();
  const httpService = new HttpServiceImpl(axios);
  const currentTimeService: CurrentTimeService = currentTimeServiceImple;

  const [defaultState, stateObservable, eventObserver] = setUp(
    storageService,
    httpService,
    currentTimeService,
    user.userID,
    user.nickname
  );

  ReactDOM.render(
    <React.StrictMode>
      <Wrapper
        defaultState={defaultState}
        observable={stateObservable}
        observer={eventObserver}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export const Wrapper: React.FunctionComponent<{
  defaultState: PageState;
  observable: Observable<PageState>;
  observer: Observer<Event>;
}> = (props) => {
  const isSmartPhone = useMediaQuery({ maxDeviceWidth: 768 });

  return (
    <HashRouter>
      <React.Suspense fallback={<div>loading</div>}>
        {isSmartPhone ? <SP {...props} /> : <PC {...props} />}
      </React.Suspense>
    </HashRouter>
  );
};
