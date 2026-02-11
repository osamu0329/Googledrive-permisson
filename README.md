
+# Drive Permission Manager
 
+Google ドライブ上の **共有リスクを可視化し、権限を素早く整理するための Google Apps Script (GAS) Web アプリ**です。  
+`Code.gs`（サーバー側）と `index.html`（UI）で構成され、3 ペインでファイル一覧・共有ユーザー・セキュリティ状態を同時に確認できます。
+
+## できること
+
+- ドライブ内の対象ファイルを一覧表示（Spreadsheet / Document / Presentation / PDF）。
+- 「自分がオーナーのファイルのみ」「公開リスクありのみ」で絞り込み。
+- 共有設定を判定して、`公開中` / `リンク共有` / `安全` を視覚表示。
+- ファイルごとの共有ユーザー（Owner / Editor / Viewer）を一覧表示。
+- ユーザー権限の追加（Viewer / Editor）・削除。
+- 公開状態のファイルをワンクリックで非公開（招待制）に変更。
+
+## 画面構成（3-Pane View）
+
+1. **左ペイン（Files）**
+   - ファイル種別タブ（すべて / Sheet / Doc / Slide / PDF）
+   - `My Own` と `⚠️ Risky` のチェックボックス
+   - 無限スクロールで次ページ読み込み
+2. **中央ペイン**
+   - 選択ファイルの共有ユーザー一覧（役割順）
+3. **右ペイン**
+   - セキュリティ状態（危険 / 注意 / 安全）
+   - 非公開化ボタン
+   - ユーザー追加フォーム、ファイルへのクイックリンク
+
+## 技術構成
+
+- **フロントエンド**: `index.html`（HTML/CSS/Vanilla JS）
+- **バックエンド**: `Code.gs`（GAS）
+- **利用 API/サービス**:
+  - `Drive API v2`（Advanced Google services）
+  - `DriveApp`（GAS 標準サービス）
+
+## セットアップ
+
+1. Google Apps Script プロジェクトを作成し、`Code.gs` と `index.html` を配置。
+2. Apps Script エディタの **サービス追加** から **Drive API** を有効化。
+3. 必要なスコープ許可を与える。
+4. 「デプロイ」→「ウェブアプリ」として公開。
+
+> `Drive API` が有効化されていない場合、画面に案内メッセージが表示されます。
+
+## 主なサーバー関数
+
+- `getDriveFiles(pageToken, category, onlyOwner, onlyRisky)`  
+  条件に一致するファイルを取得し、アクセス状態を付与して返却。
+- `getFilePermissions(fileId)`  
+  Owner/Editor/Viewer と共有状態を取得。
+- `setFilePrivate(fileId)`  
+  共有設定を `PRIVATE` に変更。
+- `addUserPermission(fileId, email, role)` / `removeUserPermission(fileId, email)`  
+  ユーザー権限の追加・削除。
+
+## 想定ユースケース
+
+- 組織内で「意図せず公開されているドライブファイル」を棚卸ししたい
+- オーナー視点で、共有ユーザーを短時間で整理したい
+- 監査前に共有設定を一括確認したい
+
+## 注意点
+
+- 本アプリは Drive 上の共有設定を変更するため、運用前に対象範囲で十分テストしてください。
+- 大量ファイル環境では API 制限・実行時間制限に注意してください。
+- 共有状態の判定は Drive API の permission/visibility 情報に依存します。
+
+## ライセンス
+
+ライセンス情報は未設定です。必要に応じて追加してください。
 
EOF
)
