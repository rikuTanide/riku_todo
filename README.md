# riku_todo
ToDoアプリ

## 動作確認方法
### 公開アプリ
https://ricktodo.s3-ap-northeast-1.amazonaws.com/index.html#/

### ローカル
```
git clone git@github.com:rikuTanide/riku_todo.git
cd rick_todo/web
yarn install
yarn start or yarn test
```

## 技術選定と全体のアーキテクチャ

 - ログイン機能はCognito
 - REST APIはAmazon API GatewayとAWS Lambda (Node.js)
 - DBはAmazon DynamoDB
 - クラウドの設定はServerless Framework 
 - WebSocketのエンドポイントも同上
 - WebフロントエンドはReact/TypeScript
 - formatはPrettier
 - テストはJest
 - HttpClientはAuthorizationの設定やTimeoutの設定を共通化しやすい
   Axiosを使う
 - AjvでサーバーからのJSONをバリデーションする
 - 状態管理・イベントハンドリングはRxJS

### フロントエンドのアーキテクチャ

 - UIはstate(src/Types/State.ts)に対して参照等価である
 - ビジネスロジックはRxJSを使って最新のstateをobserveする
 - UIはReact Hooksを使いビジネスロジックからstateをsubscribeする
 - UIは操作に応じてEvent(src/Types/Event.ts)を発出する
 - ビジネスロジック(src/Types/Model.ts)は現在のstateとeventをもとに次のstateを作成しUIに送信する
 - Model.tsはすべてのハンドラにイベントを送り、各ハンドラは自分宛ての場合にのみ処理をする
   （自分のプロダクトではよりここを抽象化しているが、今回は見た目がわかりやすいようにこうした）


## 仕様

### 機能

 - 会員登録
 - ログイン
 - ToDo作成
 - ToDo閲覧
 - ToDo編集
 - 一覧画面で進捗を変更

### ToDoの項目
 - タイトル
 - 本文
 - 完了/未完了
 - ゴミ箱    
 - 作成者のユーザーIDとnickname
 - 作成時刻

### 共有範囲
 - ログインしているすべての人で同じToDoリストを見る
 - トレロのようなプロジェクトを分ける機能は作らない
 - ユーザーIDによってアクセス権限管理などもしない

### UI
 - レスポンシブ
   - PC版
   - スマホ版
   - PC版とスマホ版のUIのコードは別々に用意しcode splitする
   - PC版でもスマホ版でも同じURLは同じ意味のページを指すようにする
 - 極力楽観的UIを使う事で書き込み系の操作はUIをロックしない
 - 書き込み系の操作でネットワークエラーが起きた場合は  
   再実行できる
 - トーストでUndoできるようにする事で
   極力ダイアログは出さないようにする
 - 更新はWebSocketでほかのブラウザに通知され  
   自動更新する

### Validation/エラーハンドル
 - サーバーから来たデータをajvで検証
 - ネットワークは10秒でタイムアウトとする
 - 書き込み中の文章はlocalStorageに保存し  
   リロードしても残るようにする

### テスト戦略
RxJSを使いUIとビジネスロジックを完全に分ける。  
UIはstateのみに依存する。  
UIのテストはしない。  
UIからビジネスロジックへはコマンドオブジェクトのみで通信する。  
ビジネスロジックがprev stateとeventから正しいnext stateを作成できたかをテストする。
乱数や現在時刻などはすべてサービス化しモックしやすくする
    
## 時間があれば作る
 - ゴミ箱からさらに削除する機能
 - puppeteerでe2eテストをする
 - PCとスマホのコードをmedia queryで先読み
 
## ページ
URLはハッシュURLを使う。
理由：キャッシュ効率とサーバー側の設定項目削減のため

### スマホ
#### 未完了タスク
/
#### 完了タスク
/?progress=complete
#### ゴミ箱
/?trash=true
#### 新規作成
/new
#### 詳細
/tasks/:task_id

### PC
#### 未完了タスク/完了タスク/ゴミ箱
/
#### 新規作成
/new
#### 詳細
/tasks/:task_id

## REST API Endpoint

### タスク一覧
GET /tasks?summary=true
この項目だけ取得される
 - タイトル
 - 完了/未完了
 - ゴミ箱    
 - 作成時刻
 
### タスク作成
POST /tasks
成功した場合は201

### タスク詳細
GET /tasks/:task_id

### タスク編集
PUT /tasks/:task_id
タイトル・本文・進捗変更などは同じAPIを使う
成功した場合は200

### WebSocketエンドポイント
何かメッセージを送ればすべてのWebSocket Connectionに空のメッセージが送られるようにする
