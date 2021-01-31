import { ProgressStatus, TrashStatus } from "./Rest";

export type Event =
  | { type: "new task / open" }
  | { type: "new task / title input"; title: string }
  | { type: "new task / body input"; body: string }
  | { type: "new task / submit" }
  | { type: "detail / fetch"; taskID: string }
  | { type: "detail / edit title"; title: string }
  | { type: "detail / edit body"; body: string }
  | { type: "detail / edit progress"; status: ProgressStatus }
  | { type: "detail / edit trash"; status: TrashStatus }
  | { type: "detail / save" }
  | { type: "list / complete"; taskID: string }
  | { type: "list / continue"; taskID: string }
  | { type: "list / trash"; taskID: string }
  | { type: "list / restore"; taskID: string }
  | { type: "toast / close" }
  | { type: "toast / redo-undo" }
  | { type: "toast / update status" }
  | { type: "do update tasks" }
  | { type: "delete task"; taskID: string }
  | { type: "logout" };

export type LoginPageEvent =
  | { type: "login / switch to sign up" }
  | { type: "login / mail addr"; mailAddr: string }
  | { type: "login / password"; password: string }
  | { type: "login / try login" }
  | { type: "sing up / switch to login" }
  | { type: "sign up / mail add"; mailAddr: string }
  | { type: "sign up / nickname"; nickname: string }
  | { type: "sign up / password"; password: string }
  | { type: "sign up / try sign up" };
