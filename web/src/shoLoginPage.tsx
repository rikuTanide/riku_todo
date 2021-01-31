import { LoginService } from "./Service/Service";
import { createHandler } from "./Model/NonMembersPageModel";
import ReactDOM from "react-dom";
import React from "react";
import { NonMembersPage } from "./View/NonMembers/NonMembersPage";

export function showLoginPage(loginService: LoginService) {
  const [state, observer, observable] = createHandler(loginService);

  ReactDOM.render(
    <React.StrictMode>
      <NonMembersPage
        defaultState={state}
        observable={observable}
        observer={observer}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
