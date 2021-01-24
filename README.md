# riku_todo
ToDoアプリ

## 仕様

### 機能

 - 会員登録
 - ログイン
 - ToDo作成
 - ToDo閲覧
 - ToDo編集

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
 - 書き込み系の操作はUIをロックしない
 - 書き込み系の操作でネットワークエラーが起きた場合は  
   再実行できる
 - 極力ダイアログは出さず  
   トーストでUndoできるようにする
 - 更新はWebSocketでほかのブラウザに通知され  
   自動更新する

### Validation/エラーハンドル
 - サーバーから来たデータをajvで検証
 - ネットワークのタイムアウト処理
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

### タスク詳細
GET /tasks/:task_id

### タスク編集
PUT /tasks/:task_id
タイトル・本文・進捗変更などは同じAPIを使う

### WebSocketエンドポイント
何かメッセージを送ればすべてのWebSocket Connectionに空のメッセージが送られるようにする
