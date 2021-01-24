import React, { useEffect, useState } from "react";
import { LoginPageState, LoginPageState as State } from "../../Types/State";
import { LoginPageEvent } from "../../Types/Event";
import { Observable, Observer } from "rxjs";

export const LoginOrSignUpPage: React.FunctionComponent<{
  observer: Observer<LoginPageEvent>;
  observable: Observable<State>;
  defaultState: State;
}> = (props) => {
  const [state, setState] = useState<LoginPageState>(props.defaultState);

  useEffect(() => {
    const ss = props.observable.subscribe((s) => setState(s));
    return () => ss.unsubscribe();
  });

  if (state.type == "login")
    return <LoginPage observer={props.observer} state={state} />;
  else return <SignUpPage observer={props.observer} state={state} />;
};

export const LoginPage: React.FunctionComponent<{
  observer: Observer<LoginPageEvent>;
  state: State;
}> = (props) => {
  function handle(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "login / try login",
    });
  }

  function move(e: React.MouseEvent) {
    e.preventDefault();
    props.observer.next({
      type: "login / switch to sign up",
    });
  }

  return (
    <div>
      <form onSubmit={handle}>
        <fieldset disabled={props.state.loading}>
          <input
            type="email"
            value={props.state.loginMailAddr}
            placeholder="メールアドレス"
            required
            onChange={(e) =>
              props.observer.next({
                type: "login / mail addr",
                mailAddr: e.target.value,
              })
            }
          />
          <br />
          <input
            type="password"
            value={props.state.loginPassword}
            placeholder="パスワード"
            required
            onChange={(e) =>
              props.observer.next({
                type: "login / password",
                password: e.target.value,
              })
            }
          />
          <br />
          <button>送信</button>
        </fieldset>
      </form>
      {props.state.hasError ? <p>エラー</p> : ""}
      <a onClick={move} href="#">
        新規登録する
      </a>
    </div>
  );
};

export const SignUpPage: React.FunctionComponent<{
  observer: Observer<LoginPageEvent>;
  state: State;
}> = (props) => {
  function handle(e: React.FormEvent) {
    e.preventDefault();
    props.observer.next({
      type: "sign up / try sign up",
    });
  }

  function move(e: React.MouseEvent) {
    e.preventDefault();
    props.observer.next({
      type: "sing up / switch to login",
    });
  }

  return (
    <div>
      <form onSubmit={handle}>
        <fieldset disabled={props.state.loading}>
          <input
            type="email"
            value={props.state.signUpMailAddr}
            placeholder="メールアドレス"
            required
            onChange={(e) =>
              props.observer.next({
                type: "sign up / mail add",
                mailAddr: e.target.value,
              })
            }
          />
          <br />
          <input
            type="text"
            value={props.state.signUpNickname}
            placeholder="ニックネーム"
            required
            onChange={(e) =>
              props.observer.next({
                type: "sign up / nickname",
                nickname: e.target.value,
              })
            }
          />
          <br />
          <input
            type="password"
            value={props.state.signUpPassword}
            placeholder="パスワード"
            required
            onChange={(e) =>
              props.observer.next({
                type: "sign up / password",
                password: e.target.value,
              })
            }
          />
          <br />
          {props.state.hasError ? <p>エラー</p> : ""}
          <button>送信</button>
        </fieldset>
      </form>
      <a onClick={move} href="#">
        アカウントを持っている
      </a>
    </div>
  );
};
