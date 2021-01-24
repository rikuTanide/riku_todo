import React from "react";
import { PageState } from "../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Link } from "react-router-dom";
import { TaskSummary } from "../../Types/Model";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { Completes, Continues, Trashs } from "../SP/Board";

// 各ボードはタスク一覧に対して冪等なので、これをメモ化の単位とする。

const _Board: React.FunctionComponent<{
  submitting: boolean;
  tasks: TaskSummary[];
  observer: Observer<Event>;
}> = (props) => {
  return (
    <Grid container spacing={3}>
      {/* Chart */}
      <Grid item xs={4}>
        <Continues {...props} />
      </Grid>
      {/* Recent Deposits */}
      <Grid item xs={4}>
        <Completes {...props} />
      </Grid>
      {/* Recent Orders */}
      <Grid item xs={4}>
        <Trashs {...props} />
      </Grid>
    </Grid>
  );
};
export const Board = React.memo(_Board);
