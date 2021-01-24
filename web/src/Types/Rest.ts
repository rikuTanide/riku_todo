export type ProgressStatus = "continue" | "complete";
export type TrashStatus = "trash" | "";

export interface Task {
  id: string;
  title: string;
  body: string;
  time: number;
  userID: string;
  nickname: string;
  progress: ProgressStatus;
  trash: TrashStatus;
}

export interface TaskSummary {
  id: string;
  title: string;
  time: number;
  progress: ProgressStatus;
  trash: TrashStatus;
}

export type PostTask = Omit<Task, "id">;
