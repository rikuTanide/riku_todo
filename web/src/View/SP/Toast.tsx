import React from "react";
import { Toast as ToastState } from "../../Types/State";
import { Observer } from "rxjs";
import { Event } from "../../Types/Event";

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
      <div>
        <button onClick={close}>×</button> 保存に失敗しました。
        <button onClick={redo}>再実行</button>
      </div>
    );
  }
  if (toastType == "edit undo") {
    return (
      <div>
        <button onClick={close}>×</button> 変更にしました
        <button onClick={redo}>取り消し</button>
      </div>
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