import React from "react";
import { Toast as ToastState } from "../../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../../Types/Event";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import Alert from "@material-ui/lab/Alert";
import CancelIcon from "@material-ui/icons/Cancel";
import UndoIcon from "@material-ui/icons/Undo";

export const Toast: React.FunctionComponent<{
  toast: ToastState;
  observer: Observer<Event>;
}> = (props) => {
  const close = () => props.observer.next({ type: "toast / close" });

  const toast = props.toast;

  if (toast.type === "new task submit error") {
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="error">作成できませんでした。</Alert>
      </Snackbar>
    );
  }
  if (toast.type === "fetch detail error") {
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="error">取得できませんでした。</Alert>
      </Snackbar>
    );
  }

  if (toast.type === "edit undo") {
    const undo = () => props.observer.next({ type: "toast / edit redo-undo" });
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="success">
          <IconButton onClick={close}>
            <CancelIcon />
          </IconButton>
          変更しました
          <IconButton onClick={undo}>
            <UndoIcon />
          </IconButton>
        </Alert>
      </Snackbar>
    );
  }

  if (toast.type === "edit redo") {
    const redo = () => props.observer.next({ type: "toast / edit redo-undo" });
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="error">
          保存に失敗しました。
          <button onClick={redo}>再実行</button>
        </Alert>
      </Snackbar>
    );
  }

  if (toast.type === "progress updated") {
    const undo = () => props.observer.next({ type: "toast / undo progress" });
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="success">
          変更しました。
          <button onClick={undo}>戻す</button>
        </Alert>
      </Snackbar>
    );
  }

  if (toast.type === "progress update error") {
    const taskID = toast.taskID;
    const to = toast.to;
    const redo = () => {
      if (to === "continue")
        props.observer.next({ type: "list / continue", taskID: taskID });
      else props.observer.next({ type: "list / complete", taskID: taskID });
    };
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="error">
          変更に失敗しました。
          <button onClick={redo}>再実行</button>
        </Alert>
      </Snackbar>
    );
  }

  if (toast.type === "trash updated") {
    const undo = () => props.observer.next({ type: "toast / undo trash" });
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="success">
          ゴミ箱に入れました。
          <button onClick={undo}>戻す</button>
        </Alert>
      </Snackbar>
    );
  }

  if (toast.type === "trash update error") {
    const taskID = toast.taskID;
    const to = toast.to;
    const redo = () => {
      if (to === "")
        props.observer.next({ type: "list / restore", taskID: taskID });
      else props.observer.next({ type: "list / trash", taskID: taskID });
    };
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="error">
          移動に失敗しました。
          <button onClick={redo}>再実行</button>
        </Alert>
      </Snackbar>
    );
  }

  if (toast.type === "deleted") {
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="success">削除しました。</Alert>
      </Snackbar>
    );
  }
  if (toast.type === "delete failure") {
    return (
      <Snackbar open={true} autoHideDuration={6000} onClose={close}>
        <Alert severity="error">削除に失敗しました。</Alert>
      </Snackbar>
    );
  }
  throw new Error("想定していないtoast type");
};
