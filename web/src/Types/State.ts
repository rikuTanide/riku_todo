import {TaskSummary} from './Model';
import {Task} from "./Rest";

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
