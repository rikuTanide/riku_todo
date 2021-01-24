import { Observer } from "rxjs";
import { PostTask, Task, TaskSummary } from "../Types/Rest";
import { PageState } from "../Types/State";
import { Event } from "../Types/Event";

export type CurrentTimeService = () => Date;

export interface StorageService {
  getNewTask(): [string, string];
  putNewTask(title: string, body: string): void;
  getPrevTasksResponse(): string;
  putCurrentTasksResponse(json: string): void;
}

export interface HttpService {
  message(): void;

  getTaskSummaries(): Promise<TaskSummary[] | null>;
  getTask(id: string): Promise<TaskSummary | null>;
  postTask(task: PostTask): Promise<boolean>;
  putTask(task: Task): Promise<boolean>;
}

export type StateObserver = Observer<PageState>;
export type EventEmitter = (event: Event) => void;
export type EventStream = Observer<Event>;

export interface LoginService {
  signUp(
    mailAddr: string,
    nickname: string,
    password: string
  ): Promise<boolean>;
  login(mailAddr: string, password: string): Promise<boolean>;
  logout(): void;
}
