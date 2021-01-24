import React from "react";
import ReactDOM from "react-dom";
import { User } from "./Service/Service";
import Axios, { AxiosInstance } from "axios";

export function showMyPage(user: User) {
  const axios = Axios.create({
    baseURL: "https://apx6s3pmdd.execute-api.us-east-1.amazonaws.com/dev/",
    headers: { Authorization: user.idToken },
    timeout: 10000,
  });

  ReactDOM.render(
    <React.StrictMode></React.StrictMode>,
    document.getElementById("root")
  );
}
