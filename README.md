# GitHub HTML Preview

GitHub の `*.html` / `*.htm` ファイルをブラウザでレンダリングして確認する、最小構成の Chrome 拡張機能です。ログイン済みの GitHub ページに表示されているソースを使うため、トークンを設定せずに非公開リポジトリでも使えます。外部プレビュー API は使いません。

## 機能

- GitHub の HTML ファイル画面に **Preview HTML** ボタンを追加
- ボタンを押すと、新しいタブで HTML を描画
- 固定コミットの URL（例: `.../blob/<commit>/kaibou.html`）と非公開リポジトリに対応

## インストール（開発版）

1. `chrome://extensions` を開き、右上の「デベロッパー モード」を有効にします。
2. 「パッケージ化されていない拡張機能を読み込む」を選び、このフォルダを指定します。
3. GitHub の HTML ファイル（`.../blob/<ref>/example.html`）を開きます。

公開する場合は Chrome Web Store Developer Dashboard でこのフォルダを ZIP 化してアップロードしてください。表示中の HTML はプレビューを開く間だけ拡張機能の一時領域に保存され、その後削除されます。
