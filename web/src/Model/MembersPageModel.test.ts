import { Event } from "../Types/Event";
import { PageState } from "../Types/State";
import { HttpService, StorageService } from "../Service/Service";
import { Subject } from "rxjs";
import { map, toArray } from "rxjs/operators";
import {
  onListTaskComplete,
  onNewTaskSubmit,
  onTitleInput,
  openNewTaskPage,
} from "./MembersPageModel";
import { PostTask, ProgressStatus, TaskSummary } from "../Types/Rest";
import { createMemoryHistory } from "history";

describe("新規タスク作成ページ", () => {
  const defaultState: PageState = {
    taskSummaries: [],
    newTask: {
      title: "",
      body: "",
      submitting: false,
    },
  };

  const createDefaultState = () => defaultState;

  it("ページを開いた", async () => {
    const event: Event = {
      type: "new task / open",
    };
    const storageService = jest.fn<StorageService, []>().mockImplementation(
      () =>
        <StorageService>{
          getNewTask: (): [string, string] => ["タイトル", "本文"],
        }
    );
    const observer = new Subject<PageState>();
    const s = observer.pipe(
      map((t) => ({ title: t.newTask.title, body: t.newTask.body })),
      toArray()
    );
    const p = s.toPromise();
    openNewTaskPage(createDefaultState, event, observer, new storageService());
    observer.complete();
    expect(await p).toStrictEqual([
      {
        title: "タイトル",
        body: "本文",
      },
    ]);
  });
  it("タイトルを入力するとストレージに保存される", async () => {
    const event: Event = {
      type: "new task / title input",
      title: "タイトルA",
    };
    const putNewTaskSpy = jest.fn((title, body) => ({}));
    const storageService = jest.fn<StorageService, []>().mockImplementation(
      () =>
        <StorageService>{
          putNewTask: putNewTaskSpy as (title: string, body: string) => void,
        }
    );
    const observer = new Subject<PageState>();
    const s = observer.pipe(
      map((t) => t.newTask.title),
      toArray()
    );
    const p = s.toPromise();
    onTitleInput(createDefaultState, event, observer, new storageService());
    observer.complete();
    expect(await p).toStrictEqual(["タイトルA"]);
    expect(putNewTaskSpy.mock.calls[0][0]).toBe("タイトルA");
  });

  describe("新規タスク", () => {
    function createHttpServiceMock(success: boolean): HttpService {
      const messageSpy = jest.fn(() => {});
      const Class = jest.fn<HttpService, []>().mockImplementation(
        () =>
          <HttpService>{
            message: messageSpy as () => void,
            postTask: async (task: PostTask) => {
              return success;
            },
            getTaskSummaries: async (): Promise<TaskSummary[]> => [],
          }
      );
      return new Class();
    }

    function getStorageServiceMock() {
      const putNewTaskSpy = jest.fn((title, body) => ({}));
      const Class = jest.fn<StorageService, []>().mockImplementation(
        () =>
          <StorageService>{
            putNewTask: putNewTaskSpy as (title: string, body: string) => void,
            putCurrentTasksResponse: (json: string) => {},
          }
      );
      return new Class();
    }

    const history = createMemoryHistory();

    it("保存成功", async () => {
      const event: Event = {
        type: "new task / submit",
      };

      const observer = new Subject<PageState>();
      const s = observer.pipe(
        map((t) => t.newTask.submitting),
        toArray()
      );
      const p = s.toPromise();
      await onNewTaskSubmit(
        createDefaultState,
        event,
        observer,
        getStorageServiceMock(),
        createHttpServiceMock(true),
        () => new Date(2020, 0, 1),
        history,
        "user1",
        "nickname"
      );
      observer.complete();
      expect(await p).toStrictEqual([true, false]);
    });
    it("保存失敗", async () => {
      const event: Event = {
        type: "new task / submit",
      };

      const observer = new Subject<PageState>();
      const s = observer.pipe(
        map((t) => t.toast || null),
        toArray()
      );
      const p = s.toPromise();
      await onNewTaskSubmit(
        createDefaultState,
        event,
        observer,
        getStorageServiceMock(),
        createHttpServiceMock(false),
        () => new Date(2020, 0, 1),
        history,
        "user1",
        "nickname"
      );
      observer.complete();
      expect(await p).toStrictEqual([null, { type: "new task submit error" }]);
    });
  });
});

describe("進捗変更", () => {
  const defaultState: PageState = {
    taskSummaries: [
      {
        id: "task1",
        updating: false,
        trash: "",
        title: "タスク１",
        time: 0,
        progress: "continue",
      },
    ],
    newTask: {
      title: "",
      body: "",
      submitting: false,
    },
  };

  const createDefaultState = () => defaultState;

  function getStorageServiceMock(): StorageService {
    const Class = jest.fn<StorageService, []>().mockImplementation(
      () =>
        <StorageService>{
          putCurrentTasksResponse(json: string) {},
          getPrevTasksResponse(): string | null {
            return JSON.stringify(defaultState.taskSummaries);
          },
        }
    );
    return new Class();
  }

  function createHttpServiceMock(success: boolean): HttpService {
    const messageSpy = jest.fn(() => {});
    const Class = jest.fn<HttpService, []>().mockImplementation(
      () =>
        <HttpService>{
          message: messageSpy as () => void,
          putTaskProgressStatus: async (
            taskID: string,
            status: ProgressStatus
          ) => {
            return success;
          },
          getTaskSummaries: async (): Promise<TaskSummary[]> => [],
        }
    );
    return new Class();
  }

  it("完了にする　成功", async () => {
    const event: Event = {
      type: "list / complete",
      taskID: "task1",
    };
    const observer = new Subject<PageState>();
    const s = observer.pipe(toArray());
    const p = s.toPromise();
    await onListTaskComplete(
      createDefaultState,
      event,
      observer,
      createHttpServiceMock(true),
      getStorageServiceMock()
    );
    observer.complete();
    const resList = await p;
    expect(resList[0].taskSummaries[0].updating).toBeTruthy();
    expect(resList[0].taskSummaries[0].progress).toBe("complete");
    expect(resList[1].toast).toStrictEqual({
      type: "progress updated",
      taskID: "task1",
      from: "continue",
    });
  });

  it("完了にする　失敗", async () => {
    const event: Event = {
      type: "list / complete",
      taskID: "task1",
    };
    const observer = new Subject<PageState>();
    const s = observer.pipe(toArray());
    const p = s.toPromise();
    await onListTaskComplete(
      createDefaultState,
      event,
      observer,
      createHttpServiceMock(false),
      getStorageServiceMock()
    );
    observer.complete();
    const resList = await p;
    expect(resList[0].taskSummaries[0].updating).toBeTruthy();
    expect(resList[0].taskSummaries[0].progress).toBe("complete");
    expect(resList[1].taskSummaries).toStrictEqual(defaultState.taskSummaries);
    expect(resList[1].toast).toStrictEqual({
      type: "progress update error",
      taskID: "task1",
      to: "complete",
    });
  });
});
