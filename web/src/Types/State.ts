import { TaskSummary } from "./Model";
import { Task } from "./Rest";

export interface PageState {
  taskSummaries: TaskSummary[];
  newTask: NewTask;
  editTask?: EditTask;
  toast?: Toast;
}

export interface NewTask {
  title: string;
  body: string;
}

export interface EditTask {
  id: string;
  original: Task;
  next: Task;
}

export type Toast = Event;

export type LoginPageType = "login" | "sign up";

export interface LoginPageState {
  type: LoginPageType;
  loginMailAddr: string;
  loginPassword: string;
  signUpMailAddr: string;
  signUpNickname: string;
  signUpPassword: string;

  hasError: boolean;
  loading: boolean;
}
