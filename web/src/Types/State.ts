import { TaskSummary } from "./Model";
import { ProgressStatus, Task, TrashStatus } from "./Rest";

export interface PageState {
  taskSummaries: TaskSummary[];
  newTask: NewTask;
  editTask?: EditTask;
  toast?: Toast;
}

export interface NewTask {
  title: string;
  body: string;
  submitting: boolean;
}

export interface EditTask {
  id: string;
  original: Task;
  next: Task;
  loading: boolean;
}

export type Toast =
  | { type: "new task submit error" }
  | { type: "update task submit error" }
  | { type: "fetch detail error" }
  | { type: "edit undo"; task: Task }
  | { type: "edit redo"; task: Task }
  | {
      type: "list status change error";
      taskID: string;
      trash: TrashStatus;
      progress: ProgressStatus;
    };

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
