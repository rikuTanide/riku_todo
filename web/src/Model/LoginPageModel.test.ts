import { LoginPageEvent as Event } from "../Types/Event";
import { LoginPageState as State } from "../Types/State";
import { onLoginPageMailAddr, onTryLogin, onTrySignUp } from "./LoginpageModel";
import { Subject } from "rxjs";
import { map, toArray } from "rxjs/operators";
import { LoginService } from "../Service/Service";

const defaultState: State = {
  type: "login",
  loginMailAddr: "",
  loginPassword: "",
  signUpMailAddr: "",
  signUpNickname: "",
  signUpPassword: "",
  hasError: false,
  loading: false,
};

describe("ログインページ", () => {
  it("メールアドレスを入力", async () => {
    const event: Event = {
      type: "login / mail addr",
      mailAddr: "mail@example.com",
    };

    const observer = new Subject<State>();
    const s = observer.pipe(
      map((t) => t.loginMailAddr),
      toArray()
    );
    const p = s.toPromise();
    onLoginPageMailAddr(defaultState, event, observer);
    observer.complete();
    expect(await p).toStrictEqual(["mail@example.com"]);
  });

  describe("ログイン", () => {
    const event: Event = {
      type: "login / try login",
    };
    it("ログイン成功", async () => {
      const reloadSpy = jest.fn(() => {}) as () => void;
      const loginService = jest.fn<LoginService, []>().mockImplementation(
        () =>
          <LoginService>{
            login: async (mailAddr, password) => true,
            reload: reloadSpy,
          }
      );

      const observer = new Subject<State>();
      const s = observer.pipe(
        map((t) => t.loading),
        toArray()
      );
      const p = s.toPromise();
      await onTryLogin(defaultState, event, observer, new loginService());
      observer.complete();
      expect(await p).toStrictEqual([true]);
      expect(reloadSpy).toBeCalled();
    });
    it("ログイン失敗", async () => {
      const loginService = jest.fn<LoginService, []>().mockImplementation(
        () =>
          <LoginService>{
            login: async (mailAddr, password) => false,
          }
      );

      const observer = new Subject<State>();
      const s = observer.pipe(
        map((t) => ({ loading: t.loading, hasError: t.hasError })),
        toArray()
      );
      const p = s.toPromise();
      await onTryLogin(defaultState, event, observer, new loginService());
      observer.complete();
      expect(await p).toStrictEqual([
        { loading: true, hasError: false },
        { loading: false, hasError: true },
      ]);
    });
  });
});

describe("会員登録", () => {
  const event: Event = {
    type: "sign up / try sign up",
  };
  it("登録成功", async () => {
    const reloadSpy = jest.fn(() => {}) as () => void;
    const loginService = jest.fn<LoginService, []>().mockImplementation(
      () =>
        <LoginService>{
          signUp: async (mailAddr, signUp, password) => true,
          reload: reloadSpy,
        }
    );

    const observer = new Subject<State>();
    const s = observer.pipe(
      map((t) => t.loading),
      toArray()
    );
    const p = s.toPromise();
    await onTrySignUp(defaultState, event, observer, new loginService());
    observer.complete();
    expect(await p).toStrictEqual([true]);
    expect(reloadSpy).toBeCalled();
  });
  it("登録失敗", async () => {
    const loginService = jest.fn<LoginService, []>().mockImplementation(
      () =>
        <LoginService>{
          signUp: async (mailAddr, nickname, password) => false,
        }
    );

    const observer = new Subject<State>();
    const s = observer.pipe(
      map((t) => ({ loading: t.loading, hasError: t.hasError })),
      toArray()
    );
    const p = s.toPromise();
    await onTrySignUp(defaultState, event, observer, new loginService());
    observer.complete();
    expect(await p).toStrictEqual([
      { loading: true, hasError: false },
      { loading: false, hasError: true },
    ]);
  });
});
