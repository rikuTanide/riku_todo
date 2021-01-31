import "./index.css";
import { LoginServiceImple } from "./Service/ServiceImpl";
import { LoginService } from "./Service/Service";
import { showMembersPage } from "./showMembersPage";
import { showNonMembersPage } from "./showNonMembersPage";

async function main() {
  const loginService: LoginService = new LoginServiceImple();
  if (await loginService.isLoggedIn()) {
    showMembersPage(await loginService.getCurrentUser(), loginService);
  } else {
    showNonMembersPage(loginService);
  }
}

main();
