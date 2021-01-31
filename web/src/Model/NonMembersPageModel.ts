import { LoginPageEvent, LoginPageEvent as Event } from "../Types/Event";
import { LoginPageState, LoginPageState as State } from "../Types/State";
import { LoginService } from "../Service/Service";
import {
  BehaviorSubject,
  Observable,
  Observer as RxObserver,
  Subject,
} from "rxjs";

export function createHandler(
  loginService: LoginService
): [State, RxObserver<LoginPageEvent>, Observable<LoginPageState>] {
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
  const stateSubject = new BehaviorSubject<State>(defaultState);
  const subject = new Subject<LoginPageEvent>();

  const emitter = (event: Event) => {
    switchToSignUp(stateSubject.value, event, stateSubject);
    onLoginPageMailAddr(stateSubject.value, event, stateSubject);
    onLoginPagePassword(stateSubject.value, event, stateSubject);
    onTryLogin(stateSubject.value, event, stateSubject, loginService);
    switchToLogin(stateSubject.value, event, stateSubject);
    onSignUpPageMailAddr(stateSubject.value, event, stateSubject);
    onSignUpPageNickname(stateSubject.value, event, stateSubject);
    onSignUpPagePassword(stateSubject.value, event, stateSubject);
    onTrySignUp(stateSubject.value, event, stateSubject, loginService);
  };

  subject.subscribe(emitter);

  return [defaultState, subject, stateSubject];
}
type Observer = RxObserver<LoginPageState>;

export function switchToSignUp(prev: State, event: Event, observer: Observer) {
  if (event.type !== "login / switch to sign up") return false;
  const next: State = {
    ...prev,
    type: "sign up",
  };
  observer.next(next);
}

export function onLoginPageMailAddr(
  prev: State,
  event: Event,
  observer: Observer
) {
  if (event.type !== "login / mail addr") return;
  const next: State = {
    ...prev,
    loginMailAddr: event.mailAddr,
  };
  observer.next(next);
}

export function onLoginPagePassword(
  prev: State,
  event: Event,
  observer: Observer
) {
  if (event.type !== "login / password") return;
  const next: State = {
    ...prev,
    loginPassword: event.password,
  };
  observer.next(next);
}

export async function onTryLogin(
  prev: State,
  event: Event,
  observer: Observer,
  loginService: LoginService
) {
  if (event.type !== "login / try login") return;
  {
    const next: State = {
      ...prev,
      loading: true,
    };
    observer.next(next);
  }
  const ok = await loginService.login(prev.loginMailAddr, prev.loginPassword);
  if (ok) {
    loginService.reload();
    return;
  }
  {
    const next: State = {
      ...prev,
      loading: false,
      hasError: true,
    };
    observer.next(next);
  }
}

export function switchToLogin(prev: State, event: Event, observer: Observer) {
  if (event.type !== "sing up / switch to login") return false;
  const next: State = {
    ...prev,
    type: "login",
  };
  observer.next(next);
}

export function onSignUpPageMailAddr(
  prev: State,
  event: Event,
  observer: Observer
) {
  if (event.type !== "sign up / mail add") return;
  const next: State = {
    ...prev,
    signUpMailAddr: event.mailAddr,
  };
  observer.next(next);
}

export function onSignUpPageNickname(
  prev: State,
  event: Event,
  observer: Observer
) {
  if (event.type !== "sign up / nickname") return;
  const next: State = {
    ...prev,
    signUpNickname: event.nickname,
  };
  observer.next(next);
}

export function onSignUpPagePassword(
  prev: State,
  event: Event,
  observer: Observer
) {
  if (event.type !== "sign up / password") return;
  const next: State = {
    ...prev,
    signUpPassword: event.password,
  };
  observer.next(next);
}

export async function onTrySignUp(
  prev: State,
  event: Event,
  observer: Observer,
  loginService: LoginService
) {
  if (event.type !== "sign up / try sign up") return;
  {
    const next: State = {
      ...prev,
      loading: true,
    };
    observer.next(next);
  }
  const ok = await loginService.signUp(
    prev.signUpMailAddr,
    prev.signUpNickname,
    prev.signUpPassword
  );
  if (ok) {
    loginService.reload();
    return;
  }
  {
    const next: State = {
      ...prev,
      loading: false,
      hasError: true,
    };
    observer.next(next);
  }
}
