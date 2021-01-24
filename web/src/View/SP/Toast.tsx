import React from "react";
import { Toast as ToastState } from "../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../Types/Event";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Alert from "@material-ui/lab/Alert";
import CancelIcon from "@material-ui/icons/Cancel";
import UndoIcon from "@material-ui/icons/Undo";
export const Toast: React.FunctionComponent<{
  toast: ToastState;
  observer: Observer<Event>;
}> = (props) => {
  const redo = () => props.observer.next({ type: "toast / redo-undo" });
  const listRedo = () => props.observer.next({ type: "toast / update status" });
  const close = () => props.observer.next({ type: "toast / close" });

  const toastType = props.toast.type;
  if (toastType == "edit redo") {
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="success">
          保存に失敗しました。
          <button onClick={redo}>再実行</button>
        </Alert>
      </Snackbar>
    );
  }
  if (toastType == "edit undo") {
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="success">
          <IconButton onClick={close}>
            <CancelIcon />
          </IconButton>
          変更しました
          <IconButton onClick={redo}>
            <UndoIcon />
          </IconButton>
        </Alert>
      </Snackbar>
    );
  }
  if (toastType == "fetch detail error") {
    return (
      <div>
        <button onClick={close}>×</button>取得できませんでした。
      </div>
    );
  }
  if (toastType == "list status change error") {
    return (
      <div>
        <button onClick={close}>×</button>保存できませんでした
        <button onClick={listRedo}>再実行</button>
      </div>
    );
  }
  if (toastType == "new task submit error") {
    return (
      <div>
        <button onClick={close}>×</button>保存できませんでした
      </div>
    );
  }
  if (toastType == "update task submit error") {
    return (
      <div>
        <button onClick={close}>×</button>変更に失敗しました。
        <button onClick={redo}>再実行</button>
      </div>
    );
  }
  throw "ない";
};
