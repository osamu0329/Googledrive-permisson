# Spreadsheet Permission Manager

Google Drive 上の Google スプレッドシートだけを対象に、共有状況を確認・整理するための Google Apps Script (GAS) Web アプリです。

## できること

- スプレッドシートのみを一覧表示
- `My Own`（自分がオーナー）と `Risky`（公開中）の絞り込み
- 共有状態を `公開中` / `リンク共有` / `安全` で表示
- 共有ユーザー（Owner / Editor / Viewer）の一覧表示
- ユーザー権限の追加・削除
- 公開状態のファイルを非公開（招待制）へ変更

## 画面構成

1. 左ペイン: スプレッドシート一覧とフィルタ
2. 中央ペイン: 選択ファイルの共有ユーザー一覧
3. 右ペイン: セキュリティ状態、ユーザー追加、ファイルリンク

## 技術構成

- フロントエンド: `index.html`（HTML/CSS/Vanilla JS）
- バックエンド: `Code.gs`（GAS）
- API: `Drive API v2`（Advanced Google services）、`DriveApp`

## セットアップ

1. Google Apps Script プロジェクトを作成し、`Code.gs` と `index.html` を配置
2. Apps Script エディタの「サービス」から `Drive API` を有効化
3. 必要な権限を許可
4. ウェブアプリとしてデプロイ

## 主なサーバー関数

- `getDriveFiles(pageToken, onlyOwner, onlyRisky)`
- `getFilePermissions(fileId)`
- `setFilePrivate(fileId)`
- `addUserPermission(fileId, email, role)`
- `removeUserPermission(fileId, email)`

## 注意点

- このアプリは共有設定を変更します。運用前に必ずテストしてください。
- ファイル数が多い環境では API 制限と実行時間制限に注意してください。
