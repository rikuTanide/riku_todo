import { Event } from "../Types/Event";
import { PageState } from "../Types/State";
import {
  CurrentTimeService,
  HttpService,
  StorageService,
} from "../Service/Service";
import { TaskSummary } from "../Types/Model";
import * as RestType from "../Types/Rest";
import { ProgressStatus, Task, TrashStatus } from "../Types/Rest";
import { BehaviorSubject, Observable, Observer, Subject } from "rxjs";
import { History } from "history";

type GetState = () => PageState;

export function setUp(
  storageService: StorageService,
  httpService: HttpService,
  currentTimeService: CurrentTimeService,
  history: History,
  userID: string,
  nickname: string
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
    onEditSave(getState, event, stateSubject, httpService, storageService);
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
    onUpdateStatus(getState, event, stateSubject, httpService, storageService);
    onToastClose(getState, event, stateSubject);
    doUpdateTasks(getState, event, stateSubject, httpService, storageService);
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
  if (event.type != "new task / open") return false;
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
  if (event.type != "new task / title input") return false;
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
  if (event.type != "new task / body input") return false;
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
  if (event.type != "new task / submit") return false;
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
  if (event.type != "detail / fetch") return false;
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
  if (event.type != "detail / edit title") return false;
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
  if (event.type != "detail / edit body") return false;
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
  if (event.type != "detail / edit progress") return false;
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
  if (event.type != "detail / edit trash") return false;
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
  storageService: StorageService
) {
  if (event.type != "detail / save") return false;
  const prev = getState();

  const prevEdit = prev.editTask!;
  const updatingTaskSummaries = prev.taskSummaries.map((t) =>
    t.id == prevEdit.id ? { ...t, updating: true } : t
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);

  const ok = httpService.putTask(prevEdit.next);
  httpService.message();
  if (ok) {
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: { type: "edit undo", task: prevEdit.original },
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
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: convertTaskSummariesType(
          restoreFromStorage(storageService)
        ),
        toast: { type: "edit redo", task: prevEdit.original },
      };
      observer.next(next);
    }
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
  if (event.type != "list / complete") return false;
  const prev = getState();

  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary =>
      t.id == event.taskID ? { ...t, progress: "complete", updating: true } : t
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);

  // ここはしょうがない
  const prevTask = await httpService.getTask(event.taskID);
  if (!prevTask) {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      toast: {
        type: "list status change error",
        taskID: event.taskID,
        progress: "complete",
        trash: "",
      },
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
    };
    observer.next(next);
    return;
  }

  const nextTask: Task = { ...prevTask, progress: "complete" };
  const ok = await httpService.putTask(nextTask);
  httpService.message();

  if (ok) {
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: { type: "edit undo", task: prevTask },
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
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: convertTaskSummariesType(
          restoreFromStorage(storageService)
        ),
        toast: { type: "edit redo", task: nextTask },
      };
      observer.next(next);
    }
  }
}

export async function onListTaskContinue(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type != "list / continue") return false;
  const prev = getState();

  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary =>
      t.id == event.taskID ? { ...t, progress: "continue", updating: true } : t
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);

  // ここはしょうがない
  const prevTask = await httpService.getTask(event.taskID);
  if (!prevTask) {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      toast: {
        type: "list status change error",
        taskID: event.taskID,
        progress: "continue",
        trash: "",
      },
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
    };
    observer.next(next);
    return;
  }

  const nextTask: Task = { ...prevTask, progress: "continue" };
  const ok = await httpService.putTask(nextTask);
  httpService.message();

  if (ok) {
    {
      const prev = getState();
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: { type: "edit undo", task: prevTask },
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
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: convertTaskSummariesType(
          restoreFromStorage(storageService)
        ),
        toast: { type: "edit redo", task: nextTask },
      };
      observer.next(next);
    }
  }
}

export async function onListTaskTrash(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type != "list / trash") return false;
  const prev = getState();

  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary =>
      t.id == event.taskID ? { ...t, trash: "trash", updating: true } : t
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);

  // ここはしょうがない
  const prevTask = await httpService.getTask(event.taskID);
  if (!prevTask) {
    const prev = getState();
    const nextProgress = prev.taskSummaries.find((t) => t.id == event.taskID)!
      .progress;
    const next: PageState = {
      ...prev,
      editTask: undefined,
      toast: {
        type: "list status change error",
        taskID: event.taskID,
        progress: nextProgress,
        trash: "trash",
      },
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
    };
    observer.next(next);
    return;
  }

  const nextTask: Task = { ...prevTask, trash: "trash" };
  const ok = await httpService.putTask(nextTask);
  httpService.message();

  if (ok) {
    {
      const prev = getState();
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: { type: "edit undo", task: prevTask },
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
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: convertTaskSummariesType(
          restoreFromStorage(storageService)
        ),
        toast: { type: "edit redo", task: nextTask },
      };
      observer.next(next);
    }
  }
}

export async function onListTaskRestore(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type != "list / restore") return false;
  const prev = getState();

  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary =>
      t.id == event.taskID ? { ...t, trash: "", updating: true } : t
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);

  // ここはしょうがない
  const prevTask = await httpService.getTask(event.taskID);
  if (!prevTask) {
    const prev = getState();
    const nextProgress = prev.taskSummaries.find((t) => t.id == event.taskID)!
      .progress;
    const next: PageState = {
      ...prev,
      editTask: undefined,
      toast: {
        type: "list status change error",
        taskID: event.taskID,
        progress: nextProgress,
        trash: "",
      },
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
    };
    observer.next(next);
    return;
  }

  const nextTask: Task = { ...prevTask, trash: "" };
  const ok = await httpService.putTask(nextTask);
  httpService.message();

  if (ok) {
    {
      const prev = getState();
      const next: PageState = {
        ...prev,
        editTask: undefined,
        toast: { type: "edit undo", task: prevTask },
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
    {
      const next: PageState = {
        ...prev,
        editTask: undefined,
        taskSummaries: convertTaskSummariesType(
          restoreFromStorage(storageService)
        ),
        toast: { type: "edit redo", task: nextTask },
      };
      observer.next(next);
    }
  }
}

export async function onToastUndo(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type != "toast / redo-undo") return false;
  const prev = getState();

  // undoコマンドが打てるということはここにデータがあるはず
  const nextTask: Task = (prev.toast! as { task: Task }).task;
  const taskID = nextTask.id;
  const nextTaskSummary: TaskSummary = {
    id: nextTask.id,
    title: nextTask.title,
    trash: nextTask.trash,
    updating: true,
    progress: nextTask.progress,
    time: nextTask.time,
  };
  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary => (t.id == taskID ? nextTaskSummary : t)
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);

  // ここはしょうがない
  const prevTask = await httpService.getTask(taskID);
  if (!prevTask) {
    return;
  }

  const ok = await httpService.putTask(nextTask);
  httpService.message();

  if (ok) {
    const tasks = await fetchTasks(httpService, storageService);
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: tasks,
    };
    observer.next(next);
  } else {
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
      toast: { type: "edit redo", task: nextTask },
    };
    observer.next(next);
  }
}

export async function onToastClose(
  getState: GetState,
  event: Event,
  observer: StateObserver
) {
  if (event.type != "toast / close") return false;
  const prev = getState();
  const next: PageState = { ...prev, toast: undefined };
  observer.next(next);
}

export async function onUpdateStatus(
  getState: GetState,
  event: Event,
  observer: StateObserver,
  httpService: HttpService,
  storageService: StorageService
) {
  if (event.type != "toast / update status") return false;
  const prev = getState();

  // undoコマンドが打てるということはここにデータがあるはず
  const nextTask = prev.toast! as {
    taskID: string;
    progress: ProgressStatus;
    trash: TrashStatus;
  };
  const updatingTaskSummaries = prev.taskSummaries.map(
    (t): TaskSummary =>
      t.id == nextTask.taskID
        ? { ...t, trash: nextTask.trash, progress: nextTask.progress }
        : t
  );
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: updatingTaskSummaries,
  };
  observer.next(next);

  // ここはしょうがない
  const prevTask = await httpService.getTask(nextTask.taskID);
  if (!prevTask) {
    const prev = getState();
    const next: PageState = {
      ...prev,
      editTask: undefined,
      taskSummaries: convertTaskSummariesType(
        restoreFromStorage(storageService)
      ),
    };
    observer.next(next);
    return;
  }

  const ok = await httpService.putTask({
    ...prevTask,
    trash: nextTask.trash,
    progress: nextTask.progress,
  });
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
  if (event.type != "do update tasks") return false;

  const tasks = await fetchTasks(httpService, storageService);
  const prev = getState();
  const next: PageState = {
    ...prev,
    editTask: undefined,
    taskSummaries: tasks,
  };
  observer.next(next);
}
