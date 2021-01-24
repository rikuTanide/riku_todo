import React from "react";
import ReactDOM from "react-dom";
import { User } from "./Service/Service";
import Axios, { AxiosInstance } from "axios";
import { useMediaQuery } from "react-responsive";
import { HashRouter } from "react-router-dom";

const PC = React.lazy(() => import("./View/PC/App"));
const SP = React.lazy(() => import("./View/SP/App"));

export function showMyPage(user: User) {
  const axios = Axios.create({
    baseURL: "https://apx6s3pmdd.execute-api.us-east-1.amazonaws.com/dev/",
    headers: { Authorization: user.idToken },
    timeout: 10000,
  });

  ReactDOM.render(
    <React.StrictMode>
      <Wrapper />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export const Wrapper: React.FunctionComponent<{}> = () => {
  const isSmartPhone = useMediaQuery({ maxDeviceWidth: 768 });

  return (
    <HashRouter>
      <React.Suspense fallback={<div>loading</div>}>
        {isSmartPhone ? <SP /> : <PC />}
      </React.Suspense>
    </HashRouter>
  );
};
