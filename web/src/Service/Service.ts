import { Observable, Observer } from "rxjs";
import { PostTask, Task, TaskSummary } from "../Types/Rest";
import { LoginPageState, PageState } from "../Types/State";
import { Event, LoginPageEvent } from "../Types/Event";

export type CurrentTimeService = () => Date;

export interface StorageService {
  getNewTask(): [string, string];
  putNewTask(title: string, body: string): void;
  getPrevTasksResponse(): string | null;
  putCurrentTasksResponse(json: string): void;
}

export interface HttpService {
  message(): void;
  onMessage(): Observable<string>;

  getTaskSummaries(): Promise<TaskSummary[] | null>;
  getTask(id: string): Promise<Task | null>;
  postTask(task: PostTask): Promise<boolean>;
  putTask(task: Task): Promise<boolean>;
}

export interface User {
  userID: string;
  nickname: string;
  idToken: string;
}

export interface LoginService {
  isLoggedIn(): Promise<boolean>;
  signUp(
    mailAddr: string,
    nickname: string,
    password: string
  ): Promise<boolean>;
  login(mailAddr: string, password: string): Promise<boolean>;
  logout(): void;
  reload(): void;
  getCurrentUser(): Promise<User>;
}
