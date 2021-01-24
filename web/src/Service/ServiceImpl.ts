import { CurrentTimeService, HttpService, StorageService } from "./Service";
import { AxiosInstance } from "axios";
import { PostTask, Task, TaskSummary } from "../Types/Rest";

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

// 後で
function validate(data: any) {
  console.assert(true);
}

export class HttpServiceImpl implements HttpService {
  private webSocket: WebSocket;

  constructor(private axios: AxiosInstance) {
    this.webSocket = new WebSocket("");
  }

  public message(): void {
    this.webSocket.send("");
  }

  public async getTask(id: string): Promise<TaskSummary | null> {
    try {
      const res = await this.axios.get(`tasks/${id}`);
      validate(res);
      return res.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getTaskSummaries(): Promise<TaskSummary[] | null> {
    try {
      const res = await this.axios.get("tasks?summary=true");
      validate(res);
      return res.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async postTask(task: PostTask): Promise<boolean> {
    try {
      const res = await this.axios.post("tasks", task);
      return res.status == 201;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async putTask(task: Task): Promise<boolean> {
    try {
      const res = await this.axios.put(`tasks/${task.id}`, task);
      return res.status == 200;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
