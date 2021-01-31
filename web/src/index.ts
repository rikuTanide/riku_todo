import "./index.css";
import { LoginServiceImple } from "./Service/ServiceImpl";
import { LoginService } from "./Service/Service";
import { showMyPage } from "./showMyPage";
import { showLoginPage } from "./shoLoginPage";

async function main() {
  const loginService: LoginService = new LoginServiceImple();
  if (await loginService.isLoggedIn()) {
    showMyPage(await loginService.getCurrentUser(), loginService);
  } else {
    showLoginPage(loginService);
  }
}

main();
