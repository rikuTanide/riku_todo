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
  | { type: "fetch detail error" }
  | { type: "edit undo"; taskID: string; title: string; body: string }
  | { type: "edit redo"; taskID: string; title: string; body: string }
  | { type: "progress updated"; taskID: string; from: ProgressStatus }
  | { type: "progress update error"; taskID: string; to: ProgressStatus }
  | { type: "trash updated"; taskID: string; from: TrashStatus }
  | { type: "trash update error"; taskID: string; to: TrashStatus }
  | { type: "delete failure" }
  | { type: "deleted" };

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
