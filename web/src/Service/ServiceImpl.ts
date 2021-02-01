import {
  CurrentTimeService,
  HttpService,
  LoginService,
  StorageService,
  User,
} from "./Service";
import { AxiosInstance } from "axios";
import {
  PostTask,
  Task,
  TaskSummary,
  PutTask,
  ProgressStatus,
  TrashStatus,
} from "../Types/Rest";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { Observable, Subject } from "rxjs";
import Ajv from "ajv";
const scheme = require("../Types/Rest.json");
const ajv = new Ajv();
const tasksValidator = ajv.compile({
  ...scheme,
  ...scheme.definitions.TaskSummaries,
});
const taskValidator = ajv.compile({ ...scheme, ...scheme.definitions.Task });

export const currentTimeServiceImple: CurrentTimeService = () => new Date();

export class StorageServiceImple implements StorageService {
  getNewTask(): [string, string] {
    const s = window.localStorage;
    return [s.getItem("title") || "", s.getItem("body") || ""];
  }

  getPrevTasksResponse(): string | null {
    const s = window.localStorage;
    return s.getItem("task-response") || null;
  }

  putCurrentTasksResponse(json: string): void {
    const s = window.localStorage;
    s.setItem("task-response", json);
  }

  putNewTask(title: string, body: string): void {
    const s = window.localStorage;
    s.setItem("title", title);
    s.setItem("body", body);
  }
}

export class HttpServiceImpl implements HttpService {
  private webSocket: WebSocket;
  private subject = new Subject<string>();

  public onMessage(): Observable<string> {
    return this.subject;
  }

  constructor(private axios: AxiosInstance) {
    this.webSocket = new WebSocket(
      "wss://ymftu3olv0.execute-api.us-east-1.amazonaws.com/dev"
    );
    this.webSocket.addEventListener("message", (e) => {
      this.subject.next(e.toString());
    });
  }

  public message(): void {
    this.webSocket.send("");
  }

  public async getTask(id: string): Promise<Task | null> {
    try {
      const res = await this.axios.get(`tasks/${id}`);
      console.assert(taskValidator(res.data));
      return res.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getTaskSummaries(): Promise<TaskSummary[] | null> {
    try {
      const res = await this.axios.get("tasks?summary=true");
      console.assert(tasksValidator(res.data));
      return res.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async postTask(task: PostTask): Promise<boolean> {
    try {
      const res = await this.axios.post("tasks", task);
      return res.status === 201;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async patchTask(
    id: string,
    title: string,
    body: string
  ): Promise<boolean> {
    try {
      const payload: PutTask = {
        title: title,
        body: body,
      };
      const res = await this.axios.patch(`tasks/${id}`, payload);
      return res.status === 200;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async deleteTask(taskID: string): Promise<boolean> {
    try {
      const res = await this.axios.delete(`tasks/${taskID}`);
      return res.status === 200;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async putTaskProgressStatus(
    id: string,
    progressStatus: ProgressStatus
  ): Promise<boolean> {
    try {
      const res = await this.axios.put(
        `tasks/${id}/progress`,
        JSON.stringify(progressStatus),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.status === 200;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async putTaskTrashStatus(
    id: string,
    trashStatus: TrashStatus
  ): Promise<boolean> {
    try {
      const res = await this.axios.put(
        `tasks/${id}/trash`,
        JSON.stringify(trashStatus),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.status === 200;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

export class LoginServiceImple implements LoginService {
  pool = new CognitoUserPool({
    UserPoolId: "us-east-1_ijq19eVV6", // User Pools の画面から取得できる User Pools ID。
    ClientId: "1188uofmn5vdg34h32tv99meji", // User Pools で発行したクライアントアプリケーションのID。
  });
  public login(mailAddr: string, password: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const user = new CognitoUser({ Username: mailAddr, Pool: this.pool });
      user.authenticateUser(
        new AuthenticationDetails({
          Username: mailAddr,
          Password: password,
        }),
        {
          onSuccess: () => resolve(true),
          onFailure: () => resolve(false),
        }
      );
    });
  }

  public logout() {
    this.pool.getCurrentUser()?.signOut();
  }

  public reload(): void {
    window.location.reload();
  }

  public signUp(
    mailAddr: string,
    nickname: string,
    password: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.pool.signUp(
        mailAddr,
        password,
        [new CognitoUserAttribute({ Name: "nickname", Value: nickname })],
        [],
        (err, res) => {
          if (err || !res) {
            resolve(false);
            return;
          }

          // sign upしただけではログインしないようだ
          const user = new CognitoUser({ Username: mailAddr, Pool: this.pool });
          user.authenticateUser(
            new AuthenticationDetails({
              Username: mailAddr,
              Password: password,
            }),
            {
              onSuccess: () => resolve(true),
              onFailure: () => resolve(false),
            }
          );
        }
      );
    });
  }

  public getCurrentUser(): Promise<User> {
    return new Promise<User>((resolve) => {
      const user: CognitoUser = this.pool.getCurrentUser()!;
      user.getSession(
        async (err: Error | null, session: CognitoUserSession | null) => {
          if (err || !session) {
            console.log(err);
            return;
          }
          const token = session.getIdToken();
          const userID = token.payload["sub"] as string;
          const nickname = token.payload["nickname"] as string;

          if (!nickname) return;
          if (!userID) return;
          if (!token) return;

          resolve({
            userID: userID,
            idToken: token.getJwtToken(),
            nickname: nickname,
          });
        },
        { clientMetadata: {} }
      );
    });
  }

  public isLoggedIn(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const user = this.pool.getCurrentUser();

      if (!user) {
        resolve(false);
        return;
      }
      user.getSession(
        (err: Error | null, session: CognitoUserSession | null) => {
          console.log(err);
          console.log(session);
          resolve(!!session);
        },
        { clientMetadata: {} }
      );
    });
  }

  public goTop(): void {
    window.location.href = "/";
  }
}
