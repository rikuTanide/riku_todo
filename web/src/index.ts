import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { LoginServiceImple } from "./Service/ServiceImpl";
import { LoginService } from "./Service/Service";
import { showMyPage } from "./showMyPage";
import { showLoginPage } from "./shoLoginPage";

async function main() {
  const loginService: LoginService = new LoginServiceImple();
  if (await loginService.isLoggedIn()) {
    showMyPage(await loginService.getCurrentUser());
  } else {
    showLoginPage(loginService);
  }
}

main();
