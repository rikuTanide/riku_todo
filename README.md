# Rick ToDo
ToDoアプリ

## 動作確認方法
### 公開アプリ
https://ricktodo.s3-ap-northeast-1.amazonaws.com/index.html

### ローカル
```
git clone git@github.com:rikuTanide/riku_todo.git
cd riku_todo/web
yarn install
yarn start or yarn test
```

## 仕様

### 共有範囲
 - ログイン必須
 - 全員で同じToDoリストを共有する
 - トレロのようなプロジェクトを分ける機能は作らない
 - ユーザーIDによってアクセス権限管理などもしない

### 機能

 - 会員登録
 - ログイン
 - ログアウト
 - ToDo作成
 - ToDo閲覧
 - ToDo編集
 - 一覧画面で進捗を変更
 - ToDo削除
 - 書き込みは他のブラウザに自動で反映される

### ToDoの項目
 - タイトル
 - 本文
 - 完了/未完了
 - ゴミ箱    
 - 作成者のユーザーIDとnickname
 - 作成時刻

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

## 技術選定

### サーバーサイド

|目的|技術|
|---|---|
|REST API|Amazon API GatewayとAWS Lambda|
|WebSocketエンドポイント|Amazon API GatewayとAWS Lambda|
|DB|Amazon DynamoDB|
|構成管理|Serverless Framework|


### フロントエンド

|目的|技術|
|---|---|
|ログイン|Amazon Cognito|
|言語|TypeScript|
|ビューライブラリ|React|
|HttpClient|Axios|
|UIフレームワーク|Material-UI|
|イベントハンドリング|RxJS|

### 共通

|目的|技術|
|---|---|
|テスト|Jest|
|フォーマッター|Prettier|
|JSONのバリデーション|Ajv|

### アーキテクチャ

### テーマ

 - ビューとビジネスロジックを完全に切り離す
 - ビューはStateに対する純粋関数にする
 - ビジネスロジックはPrev StateとEventを引数にNext Stateを返す純粋関数にする

### 手段

 - ビューとビジネスロジックの接続点はRxJSのSubjectのみ
   - ビュー <-- 状態 -- ビジネスロジック  
   - ビュー -- 操作イベント --> ビジネスロジック
 - 純粋関数にならない部分はサービスとして引数でいれる
     - ログイン
     - HttpClient
     - 現在時刻
     - History API
     - ローカルストレージ

### テスト戦略
#### UIのテスト
 *しない*
#### 理由
 - 手数の割に得るものが少ない
 - f(state) = UIが維持できていれば実機確認が容易

#### ビジネスロジックのテスト
##### 方針

現在の状態と操作のイベントを引数に  
次の状態を正しく返せているかと  
正しく副作用を起こせているかをテスト。

副作用のテストは各サービスのモックを作りJsetの機能でspy。
    
## 時間があれば作る
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
#### 編集
/tasks/:task_id/edit
#### 削除
/tasks/:task_id/delete
#### マイページ
/mypage

### PC
#### 未完了タスク/完了タスク/ゴミ箱
/
#### 新規作成
/new
#### 編集
/tasks/:task_id/edit
#### 削除
/tasks/:task_id/delete
#### マイページ
/mypage

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
### タスク削除
DELETE /tasks/:task_id
### WebSocketエンドポイント
何かメッセージを送ればすべてのWebSocket Connectionに空のメッセージが送られるようにする
