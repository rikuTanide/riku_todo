import { Observable } from "rxjs";
import {
  PostTask,
  ProgressStatus,
  Task,
  TaskSummary,
  TrashStatus,
} from "../Types/Rest";

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
  patchTask(id: string, title: string, body: string): Promise<boolean>;
  putTaskProgressStatus(
    id: string,
    progressStatus: ProgressStatus
  ): Promise<boolean>;
  putTaskTrashStatus(id: string, trashStatus: TrashStatus): Promise<boolean>;
  deleteTask(taskID: string): Promise<boolean>;
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
  goTop(): void;
  getCurrentUser(): Promise<User>;
}
