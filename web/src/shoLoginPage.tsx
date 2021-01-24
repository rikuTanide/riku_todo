import { LoginService } from "./Service/Service";
import { setUp } from "./Model/LoginpageModel";
import ReactDOM from "react-dom";
import React from "react";
import { LoginOrSignUpPage } from "./View/Login/LoginPage";

export function showLoginPage(loginService: LoginService) {
  const [state, observer, observable] = setUp(loginService);

  ReactDOM.render(
    <React.StrictMode>
      <LoginOrSignUpPage
        defaultState={state}
        observable={observable}
        observer={observer}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
