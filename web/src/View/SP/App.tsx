import React from "react";
import { PageState } from "../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../Types/Event";
import { Route, useHistory } from "react-router-dom";
import { Board } from "./Board";
import { NewTask } from "./NewTask";
import { EditTask } from "./EditTask";
import { Toast } from "./Toast";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { MyPage } from "./MyPage";

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

// スマホページは新規作成画面と編集画面を全画面表示するので
// RouteにExactを付ける
export const App: React.FunctionComponent<{
  state: PageState;
  observer: Observer<Event>;
}> = (props) => {
  const history = useHistory();
  const toast = props.state.toast;
  const classes = useStyles();

  return (
    <div>
      <Route
        path="/"
        exact
        render={() => (
          <Board
            submitting={props.state.newTask.submitting}
            tasks={props.state.taskSummaries}
            observer={props.observer}
            query={history.location.search}
          />
        )}
      />
      <Route path="/new" exact render={() => <NewTask {...props} />} />
      <Route path="/mypage" exact render={() => <MyPage {...props} />} />
      <Route
        exact
        path="/tasks/:taskID/edit"
        render={() => <EditTask {...props} />}
      />
      {toast ? <Toast toast={toast} observer={props.observer} /> : ""}
      <Route path="/" exact>
        <div className={classes.fab}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => history.push("/new")}
          >
            <AddIcon />
          </Fab>
        </div>
      </Route>
    </div>
  );
};

export default App;
