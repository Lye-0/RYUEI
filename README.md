# 留影 — RYUEI

雨の夜、閉ざされた写真館。写真と現物の食い違いを読み解き、写っていなかった部屋へ。

6つの部屋・四方と天井と床・15の主要な仕掛けを備える、一人用の固定視点脱出ゲームです。写実的な生成写真を使い、短い観察文と物の変化で進みます。

## 起動

Node と pnpm は `mise.toml` で固定しています。

```powershell
cd C:\Users\kawau\dev\Game\RYUEI
mise trust
mise install
pnpm install --frozen-lockfile
pnpm dev
```

開発用: http://127.0.0.1:5196  
本番確認: `pnpm build` → `pnpm preview` → http://127.0.0.1:4196

同じ Wi-Fi のスマホで開く場合は `pnpm dev:wifi` を実行し、この PC の LAN アドレスとポート5196を開きます。PCのファイアウォールとネットワーク設定によって接続許可が必要です。

`mise run dev` / `mise run build` / `mise run test` でも実行できます。

## 操作

- 写真の物を押して接写。矢印で向きを変え、下の戻るボタンで接写を閉じます。
- 持ち物を一度押して選び、写真内の取り付け位置や鍵穴で使用します。
- 持ち物の虫眼鏡から拡大し、裏面も調べられます。
- 解錠した収納は、自分で開けて中の物を拾います。
- 探索範囲の表示は、必要なときだけメニュー内で有効にできます。
- 記録した写真はメニューの「写真の記録」から2枚並べて比較できます。
- 訪問済みの部屋は館内メニューから移動できます。
- 任意の救済はメニューの「行き詰まったとき」にあります。通常画面から謎への直通リンクは出しません。
- 明るさ、雨音、画面の変化は設定できます。音は必須ではありません。
- キーボードは左右・上下矢印と Escape に対応します。

## 保存

進行はブラウザの localStorage に保存します。アカウント・サーバーは不要です。URLのホストやポートが違うと別の記録になります。ブラウザのデータ削除で消去されます。「はじめから」は確認画面の後に記録を消します。

## 制作と検証

- `pnpm test`: 状態遷移、取得、設置、保存復元、全仕掛けの進行。
- `pnpm build`: TypeScript 検査と Vite の本番ビルド。
- ブラウザ検証の記録: [docs/verification.md](docs/verification.md)。
- 構成と変更時の注意: [docs/architecture.md](docs/architecture.md)。
- **制作者向け・答えを含む**: [docs/walkthrough.md](docs/walkthrough.md)。
- 採用画像と生成指示: [docs/assets/manifest.json](docs/assets/manifest.json)、[docs/assets/prompts.md](docs/assets/prompts.md)。

企画の2〜3時間は制作目標で、初見の人による実測値ではありません。自動操作による通し確認は、解けること・操作できることの検証です。難易度や解けたときの納得感には、人による初見テストを別に行う必要があります。
