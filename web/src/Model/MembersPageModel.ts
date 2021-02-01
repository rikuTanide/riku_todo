import { Event } from "../Types/Event";
import { PageState } from "../Types/State";
import {
  CurrentTimeService,
  HttpService,
  LoginService,
  StorageService,
} from "../Service/Service";
import { TaskSummary } from "../Types/Model";
import * as RestType from "../Types/Rest";
import { ProgressStatus, Task, TrashStatus } from "../Types/Rest";
import { BehaviorSubject, Observable, Observer, Subject } from "rxjs";
import { History } from "history";

type GetState = () => PageState;

export function createHandler(
  storageService: StorageService,
  httpService: HttpService,
  currentTimeService: CurrentTimeService,
  history: History,
  userID: string,
  nickname: string,
  loginService: LoginService
): [PageState, Observable<PageState>, Observer<Event>] {
  const defaultState: PageState = {
    taskSummaries: [],
    newTask: {
      title: "",
      body: "",
      submitting: false,
    },
  };
  const stateSubject = new BehaviorSubject<PageState>(defaultState);
  const eventSubject = new Subject<Event>();

  const getState = () => stateSubject.getValue();

  const handler = (event: Event) => {
    openNewTaskPage(getState, event, stateSubject, storageService);
    onTitleInput(getState, event, stateSubject, storageService);
    onBodyInput(getState, event, stateSubject, storageService);
    onNewTaskSubmit(
      getState,
      event,
      stateSubject,
      storageService,
      httpService,
      currentTimeService,
      history,
      userID,
      nickname
    );
    onDetailFetch(getState, event, stateSubject, httpService);
    onEditTitle(getState, event, stateSubject);
    onEditBody(getState, event, stateSubject);
    onEditProgress(getState, event, stateSubject);
    onEditTrash(getState, event, stateSubject);
    onEditSave(
      getState,
      event,
      stateSubject,
      httpService,
      storageService,
      history
    );
    onListTaskComplete(
      getState,
      event,
      stateSubject,
      httpService,
      storageService
    );
    onListTaskContinue(
      getState,
      event,
      stateSubject,
      httpService,
      storageService
    );
    onListTaskTrash(getState, event, stateSubject, httpService, storageService);
    onListTaskRestore(
      getState,
      event,
      stateSubject,
      httpService,
      storageService
    );
    onToastUndo(getState, event, stateSubject, httpService, storageService);
    onToastClose(getState, event, stateSubject);
    onUndoProgress(getState, event, stateSubject, httpService, storageService);
    onUndoTrash(getState, event, stateSubject, httpService, storageService);
    doUpdateTasks(getState, event, stateSubject, httpService, storageService);
    logout(getState, event, loginService);
    deleteTask(
      getState,
      event,
      history,
      stateSubject,
      httpService,
      storageService
    );
  };

  eventSubject.subscribe((e) => handler(e));
  doUpdateTasks(
    getState,
    { type: "do update tasks" },
    stateSubject,
    httpService,
    storageService
  );
  return [stateSubject.value, stateSubject, eventSubject];
}

type StateObserver = Observer<PageState>;

// 新しいタスクを追加するページ
// リロードに備えて一文字入力するごとにローカルストレージに保存し
// このページを開いたときに復帰する
export function openNewTaskPage(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  storageService: StorageService
) {
  if (event.type !== "new task / open") return false;
  const [title, body] = storageService.getNewTask();
  const prev = getState();
  const next: PageState = {
    ...prev,
    newTask: {
      ...prev.newTask,
      title: title,
      body: body,
    },
  };
  observer.next(next);
}

export function onTitleInput(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  storageService: StorageService
) {
  if (event.type !== "new task / title input") return false;
  const prev = getState();
  const next: PageState = {
    ...prev,
    newTask: {
      ...prev.newTask,
      title: event.title,
    },
  };
  observer.next(next);
  storageService.putNewTask(event.title, prev.newTask.body);
}

export function onBodyInput(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  storageService: StorageService
) {
  if (event.type !== "new task / body input") return false;
  const prev = getState();
  const next: PageState = {
    ...prev,
    newTask: {
      ...prev.newTask,
      body: event.body,
    },
  };
  observer.next(next);
  storageService.putNewTask(prev.newTask.title, event.body);
}

// 新規登録時にsubmittingをtrueにするとView側でローダーが表示される
// HTTP Requestが失敗したらRedo用のトーストを表示する
export async function onNewTaskSubmit(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  storageService: StorageService,
  httpService: HttpService,
  currentTimeService: CurrentTimeService,
  history: History,
  userID: string,
  nickname: string
) {
  if (event.type !== "new task / submit") return false;
  history.push("/");

  const prev = getState();
  {
    const next: PageState = {
      ...prev,
      newTask: {
        ...prev.newTask,
        submitting: true,
      },
    };
    observer.next(next);
  }
  const ok = await httpService.postTask({
    userID: userID,
    nickname: nickname,
    title: prev.newTask.title,
    body: prev.newTask.body,
    time: currentTimeService().getTime(),
    progress: "continue",
    trash: "",
  });

  if (ok) {
    httpService.message();
    storageService.putNewTask("", "");
    const nextTasks = await fetchTasks(httpService, storageService);
    const prev = getState();
    const next: PageState = {
      ...prev,
      newTask: {
        title: "",
        body: "",
        submitting: false,
      },
      taskSummaries: nextTasks,
    };
    observer.next(next);
  } else {
    const next: PageState = {
      ...prev,
      newTask: {
        title: "",
        body: "",
        submitting: false,
      },
      toast: { type: "new task submit error" },
    };
    observer.next(next);
  }
}

// RESTで取り出したデータに属性を付け足したい
async function fetchTasks(
  httpService: HttpService,
  storageService: StorageService
): Promise<TaskSummary[]> {
  const res = await httpService.getTaskSummaries();
  if (!res) {
    const data = restoreFromStorage(storageService);
    return convertTaskSummariesType(data);
  } else {
    storageService.putCurrentTasksResponse(JSON.stringify(res));
    return convertTaskSummariesType(res);
  }
}

function restoreFromStorage(
  storageService: StorageService
): RestType.TaskSummary[] {
  const j = storageService.getPrevTasksResponse();
  if (!j) return [];
  return JSON.parse(j) as RestType.TaskSummary[];
}

function convertTaskSummariesType(
  tasks: RestType.TaskSummary[]
): TaskSummary[] {
  return tasks.map(
    (t): TaskSummary => ({
      ...t,
      updating: false,
    })
  );
}

// 編集画面が開いたら編集前と編集中を別々に持って置き
// 保存時のHttpRequestの成否に応じて
// Undo/Redoができるようにする
// View側では、編集画面を開いた直後に別のタスクが表示されることがないように
// idとURLパラメータを比較する必要がある
export async function onDetailFetch(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService
) {
  if (event.type !== "detail / fetch") return false;
  const prev = getState();

  {
    const empty: Task = {
      id: event.taskID,
      title: "",
      body: "",
      time: 0,
      userID: "",
      nickname: "",
      progress: "continue",
      trash: "",
    };
    const next: PageState = {
      ...prev,
      editTask: {
        id: event.taskID,
        next: empty,
        original: empty,
        loading: true,
      },
    };
    observer.next(next);
  }
  const task = await httpService.getTask(event.taskID);

  if (!task) {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      toast: { type: "fetch detail error" },
    };
    observer.next(next);
  } else {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: {
        id: event.taskID,
        original: task,
        next: task,
        loading: false,
      },
    };
    observer.next(next);
  }
}

export function onEditTitle(
  getState: GetState,
  event: Event,
  observer: StateObserver
) {
  if (event.type !== "detail / edit title") return false;
  const prev = getState();

  const prevEdit = prev.editTask!;
  const next: PageState = {
    ...prev,
    editTask: {
      ...prevEdit,
      next: {
        ...prevEdit.next,
        title: event.title,
      },
    },
  };
  observer.next(next);
}

export function onEditBody(
  getState: GetState,
  event: Event,
  observer: StateObserver
) {
  if (event.type !== "detail / edit body") return false;
  const prev = getState();

  const prevEdit = prev.editTask!;
  const next: PageState = {
    ...prev,
    editTask: {
      ...prevEdit,
      next: {
        ...prevEdit.next,
        body: event.body,
      },
    },
  };
  observer.next(next);
}

export function onEditProgress(
  getState: GetState,
  event: Event,
  observer: StateObserver
) {
  if (event.type !== "detail / edit progress") return false;
  const prev = getState();

  const prevEdit = prev.editTask!;
  const next: PageState = {
    ...prev,
    editTask: {
      ...prevEdit,
      next: {
        ...prevEdit.next,
        progress: event.status,
      },
    },
  };
  observer.next(next);
}
export function onEditTrash(
  getState: GetState,
  event: Event,
  observer: StateObserver
) {
  if (event.type !== "detail / edit trash") return false;
  const prev = getState();

  const prevEdit = prev.editTask!;
  const next: PageState = {
    ...prev,
    editTask: {
      ...prevEdit,
      next: {
        ...prevEdit.next,
        trash: event.status,
      },
    },
  };
  observer.next(next);
}

// 保存時
// 1. 編集画面を閉じる
// 2. taskSummariesの方のitemをupdatingにする
// 成功した場合
// 3. HTTPでタスク一覧を取得しなおす
// 4. トーストでUndoをだす
// 失敗した場合
// 3. Localからタスク一覧を読み込んで上書き
// 4. トーストでRedoをだす
export async function onEditSave(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService,
  history: History
) {
  if (event.type !== "detail / save") return false;

  const prev = getState();
  const editTask = prev.editTask!;

  const taskID = editTask.id;
  const prevTitle = editTask.original.title;
  const prevBody = editTask.original.body;

  const nextTitle = editTask.next.title;
  const nextBody = editTask.next.body;

  const updatingTaskSummaries = prev.taskSummaries.map((t) =>
    t.id === taskID ? { ...t, updating: true, title: nextTitle } : t
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);
  history.push("/");
  const ok = await httpService.patchTask(taskID, nextTitle, nextBody);
  httpService.message();
  if (ok) {
    {
      const prev = getState();
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: {
          type: "edit undo",
          taskID: taskID,
          title: prevTitle,
          body: prevBody,
        },
      };
      observer.next(next);
    }

    {
      const tasks = await fetchTasks(httpService, storageService);
      const prev = getState();
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: tasks,
      };
      observer.next(next);
    }
  } else {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: {
        type: "edit redo",
        taskID: taskID,
        title: nextTitle,
        body: nextBody,
      },
    };
    observer.next(next);
  }
}

// 一覧画面から直接変更する
// あまりアラートダイアログの類は好きではないので
// Redoしやすいようにしたうえで一回の操作で完了するようにする
export async function onListTaskComplete(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "list / complete") return false;
  const taskID = event.taskID;
  await onListTaskProgressUpdate(
    taskID,
    "continue",
    "complete",
    getState,
    observer,
    httpService,
    storageService
  );
}

export async function onListTaskContinue(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "list / continue") return false;

  const taskID = event.taskID;
  await onListTaskProgressUpdate(
    taskID,
    "complete",
    "continue",
    getState,
    observer,
    httpService,
    storageService
  );
}

async function onListTaskProgressUpdate(
  taskID: string,
  from: ProgressStatus,
  to: ProgressStatus,
  getState: GetState,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  {
    const prev = getState();
    const updatingTaskSummaries = prev.taskSummaries.map(
      (t): TaskSummary =>
        t.id === taskID ? { ...t, progress: to, updating: true } : t
    );
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: updatingTaskSummaries,
    };
    observer.next(next);
  }
  const ok = await httpService.putTaskProgressStatus(taskID, to);
  httpService.message();

  if (ok) {
    const prev = getState();
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: { type: "progress updated", taskID: taskID, from: from },
      };
      observer.next(next);
    }

    {
      const tasks = await fetchTasks(httpService, storageService);
      const prev = getState();
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: tasks,
      };
      observer.next(next);
    }
  } else {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: { type: "progress update error", taskID: taskID, to: to },
    };
    observer.next(next);
  }
}

export async function onListTaskTrash(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "list / trash") return false;
  await onListTaskTrashUpdate(
    event.taskID,
    "",
    "trash",
    getState,
    observer,
    httpService,
    storageService
  );
}

export async function onListTaskRestore(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "list / restore") return false;
  await onListTaskTrashUpdate(
    event.taskID,
    "trash",
    "",
    getState,
    observer,
    httpService,
    storageService
  );
}

async function onListTaskTrashUpdate(
  taskID: string,
  from: TrashStatus,
  to: TrashStatus,
  getState: GetState,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  {
    const prev = getState();
    const updatingTaskSummaries = prev.taskSummaries.map(
      (t): TaskSummary =>
        t.id === taskID ? { ...t, trash: to, updating: true } : t
    );
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: updatingTaskSummaries,
    };
    observer.next(next);
  }
  const ok = await httpService.putTaskTrashStatus(taskID, to);
  httpService.message();

  if (ok) {
    const prev = getState();
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: { type: "trash updated", taskID: taskID, from: from },
      };
      observer.next(next);
    }

    {
      const tasks = await fetchTasks(httpService, storageService);
      const prev = getState();
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: tasks,
      };
      observer.next(next);
    }
  } else {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: { type: "trash update error", taskID: taskID, to: to },
    };
    observer.next(next);
  }
}

export async function onToastUndo(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "toast / edit redo-undo") return false;

  // undoコマンドが打てるということはここにデータがあるはず
  const prevToast = getState().toast;
  const { taskID, title, body } = prevToast! as {
    taskID: string;
    title: string;
    body: string;
  };
  {
    const prev = getState();
    const updatingTaskSummaries = prev.taskSummaries.map(
      (t): TaskSummary =>
        t.id === taskID ? { ...t, title: title, updating: true } : t
    );
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: updatingTaskSummaries,
      toast: undefined,
    };
    observer.next(next);
  }

  const ok = await httpService.patchTask(taskID, title, body);
  httpService.message();

  if (ok) {
    const tasks = await fetchTasks(httpService, storageService);
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: tasks,
      toast: undefined,
    };
    observer.next(next);
  } else {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: prevToast,
    };
    observer.next(next);
  }
}

export async function onToastClose(
  getState: GetState,
  event: Event,
  observer: StateObserver
) {
  if (event.type !== "toast / close") return false;
  const prev = getState();
  const next: PageState = { ...prev, toast: undefined };
  observer.next(next);
}

export async function onUndoProgress(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "toast / undo progress") return false;
  const prev = getState();

  // undoコマンドが打てるということはここにデータがあるはず
  const prevToast = prev.toast;
  const { taskID, from } = prevToast! as {
    taskID: string;
    from: ProgressStatus;
  };

  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary =>
      t.id === taskID ? { ...t, progress: from, updating: true } : t
  );

  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
    toast: undefined,
  };
  observer.next(next);

  const ok = await httpService.putTaskProgressStatus(taskID, from);
  httpService.message();

  if (ok) {
    const tasks = await fetchTasks(httpService, storageService);
    const prev = getState();
    const next: PageState = {
      ...prev,
      taskSummaries: tasks,
      toast: undefined,
    };
    observer.next(next);
  } else {
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: prevToast,
    };
    observer.next(next);
  }
}

export async function onUndoTrash(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "toast / undo trash") return false;
  const prev = getState();

  // undoコマンドが打てるということはここにデータがあるはず
  const prevToast = prev.toast;
  const { taskID, from } = prevToast! as {
    taskID: string;
    from: TrashStatus;
  };

  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary =>
      t.id === taskID ? { ...t, trash: from, updating: true } : t
  );

  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
    toast: undefined,
  };
  observer.next(next);

  const ok = await httpService.putTaskTrashStatus(taskID, from);
  httpService.message();

  if (ok) {
    const tasks = await fetchTasks(httpService, storageService);
    const prev = getState();
    const next: PageState = {
      ...prev,
      taskSummaries: tasks,
      toast: undefined,
    };
    observer.next(next);
  } else {
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: prevToast,
    };
    observer.next(next);
  }
}

// ページ初期ロード時とWebSocket時
export async function doUpdateTasks(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "do update tasks") return false;

  const tasks = await fetchTasks(httpService, storageService);
  const prev = getState();
  const next: PageState = {
    ...prev,
    taskSummaries: tasks,
  };
  observer.next(next);
}

export async function deleteTask(
  getState: GetState,
  event: Event,
  history: History,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type !== "delete task") return false;
  history.push("/");
  {
    const state = getState();
    const nextState: PageState = {
      ...state,
      taskSummaries: state.taskSummaries.map((t) =>
        t.id === event.taskID ? { ...t, updating: true } : t
      ),
    };
    observer.next(nextState);
  }

  const ok = await httpService.deleteTask(event.taskID);

  if (ok) {
    httpService.message();
    const tasks = await fetchTasks(httpService, storageService);
    const prev = getState();
    const next: PageState = {
      ...prev,
      taskSummaries: tasks,
      toast: { type: "deleted" },
    };
    observer.next(next);
  } else {
    const prev = getState();
    const next: PageState = {
      ...prev,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: { type: "delete failure" },
    };
    observer.next(next);
  }
}

export async function logout(
  getState: GetState,
  event: Event,
  loginService: LoginService
) {
  if (event.type !== "logout") return false;
  loginService.logout();
  loginService.goTop();
}
