import * as RestType from "./Rest";

export interface TaskSummary extends RestType.TaskSummary {
  updating: boolean;
}
