# Cashflow Manager Ver.5-R2

GitHub Pagesで動く収支管理アプリです。Google Identity Services（OAuthトークン方式）でGoogleアカウントを接続し、Google Driveに専用スプレッドシートを自動作成します。GAS、Firebase、サーバー秘密鍵は不要です。

## 1. 新規GitHubリポジトリ

1. GitHubにログインし「New repository」を選択します。
2. 例として `cashflow-manager-v5-r2` を作成します。GitHub Freeの場合はPublicを選びます。
3. ZIPを展開し、このフォルダの **中身** をルートにアップロードします。`index.html` がリポジトリ直下に必要です。GitHub Pagesは大文字の `Index.html` ではなく小文字の `index.html` を使用します。
4. Settings → Pages → Build and deployment → Source: Deploy from a branch。
5. Branch: main、フォルダ: /(root) → Save。
6. 公開先は通常 `https://YOURNAME.github.io/cashflow-manager-v5-r2/`。Actionsで公開処理完了を確認します。

## 2. Google Cloudの設定

1. Google Cloud Consoleで新規プロジェクトを作成します。
2. APIs & Services → Libraryで **Google Drive API** と **Google Sheets API** を有効化します。
3. Google Auth Platformでアプリ名・サポートメール・連絡先を設定します。外部Googleアカウントも使う場合はAudienceをExternalにします。
4. 初回検証はTestingで、自分をTest usersに追加します。他の人が試す場合もそのGoogleアカウントを追加します。
5. Data Accessに `https://www.googleapis.com/auth/drive.file` を追加します。Drive全体への権限は不要です。
6. Clients → Create client → Web applicationを選びます。
7. Authorized JavaScript originsに `https://YOURNAME.github.io` を登録します。**末尾のリポジトリ名や `/` を含めません。** 独自ドメインを使う場合はそのoriginも登録します。
8. この実装はポップアップのトークン方式なので、リダイレクトURIやクライアントシークレットは使用しません。
9. 発行されたクライアントIDを `config.js` の `YOUR_CLIENT_ID.apps.googleusercontent.com` と置換してGitHubへ保存します。クライアントIDは公開可能です。秘密鍵・アクセストークンは絶対に置きません。
10. 公開URLで「Googleに接続」を押し、利用するアカウントを選択して許可します。

設定画面名はGoogle側の更新で変わる場合があります。Testingの利用者制限や本番公開要件はGoogle Auth Platformに表示される内容に従ってください。一般公開前にアプリの連絡先、ホームページ、プライバシー説明を整備してください。

## 3. 最初の利用と同期

最初の接続時にDrive直下へ `Cashflow Manager Ver.5-R2` が作成されます。まず1台で作成を完了してから他の端末で接続してください。同じアプリ・Googleアカウントでログインすると同じ台帳を検索します。別のGoogleアカウントには別の台帳が作られます。

保存は変更した取引・口座・予算・設定だけをEventsタブへ追記します。別端末の別取引を丸ごと消す全件上書きは行いません。同じ項目への同時編集は最後の追記が優先されます。同期は保存後、画面復帰時、約60秒ごと、および「クラウド同期」で行います。編集中や未保存の変更がある場合は自動取得を控えます。

トークンはメモリだけに保持し、ブラウザを閉じると失われます。期限切れ時は「Googleに接続／再接続」を押し、保存失敗があれば同じアカウントで再接続後に「保存を再試行」を押してください。未保存状態でタブを閉じると失われます。オフライン保存・バックグラウンド同期はありません。

専用台帳はアプリが管理します。**Eventsタブの行編集・削除・並べ替えをしないでください。** Eventsの各行は変更履歴のJSONであり、直接記入する家計簿表ではありません。履歴が非常に大きくなると全件読み込みに時間がかかります。

同じGoogleアカウントで複数の独立台帳を作る機能はありません。プロジェクトやOAuthクライアントを変更すると既存台帳を検索できなくなる場合があります。旧GAS版からの自動移行は含めていません。

## 4. 画面

- 月次: 太い収入・支出バーを表示、月末残高グラフの枠は非表示です。残高の数値は表示します。
- 6ヶ月・1年・5年: 収支と残高を別グラフで表示します。
- 収入・支出カードまたはバーを押すと項目別の円グラフを開きます。
- 基準通貨はメイン画面で変更できます。4通貨を維持し、言語は日本語・英語・タイ語です。
- 日付表示は日本語の年・月表記、英語の月名、タイ語の月名・仏暦です。入力用date欄は端末の標準UIに従います。
- 予算は選択月の明細別に登録します。同じ明細を再登録すると更新されます。予算残額は `予算－支出`、残額比率は `(予算－支出)÷予算×100`。ゼロ予算は「—」です。予算未登録でも実支出の内訳を表示します。
- 口座数のアプリ上限はありません。口座残高の基準通貨値は開始日・取引日の換算額を積み上げた帳簿値で、月末時価評価ではありません。開始残高は口座開始日から残高に含まれ、収入とは扱いません。
- 基準通貨変更時は元の取引金額を発生日で再換算します。予算は対象月1日の参考レートで換算します。レートが取得できない場合は変更を中止します。
- Frankfurterの参考レートを使用します。休日等は直近の公表日になる場合があり、実際の銀行手数料込みレートとは異なります。取引の外貨レートは手入力可能でManualと記録します。基準通貨変更時は参考レートで再計算するため、手入力値の換算結果も変わります。
- 設定の「保存」は画面を閉じません。「完了」で閉じます。

## 5. カメラ・OCR

「レシート・請求書を撮影」でスマホカメラまたは画像選択を開きます。PCは画像ファイルを選べます。ブラウザ内のTesseract.jsで画像を読み取り、テキストを確認後に支出フォームへ移します。合計・日付・通貨は推定なので必ず確認し、明細・口座を指定して保存してください。読み取りだけでは支出は確定しません。

画像は15MB以下。JPG/PNGなどブラウザが読める画像を使います。PDF直接読取、手書き保証、複数明細の自動分割、OCR精度保証は含みません。HEICが読めない場合はJPEGに変換してください。初回はOCRのプログラム・言語データのダウンロードに時間がかかります。

「画像を保存して支出入力へ」で原本を自分のDriveへ保存します。支出をキャンセルしてもアップロード済み画像は残ります。登録後の📎リンクで閲覧できます。画像そのものをOCRサーバーへ送る実装ではなく、OCRは端末で処理します。プログラム・辞書は外部CDNから取得します。

## 6. PC・スマホから開く

Windows/macOS/iOS/Androidの現行ブラウザを想定したレスポンシブWebアプリです。GitHub PagesのURLをブックマークするかホーム画面に追加してください。Google Drive上の台帳の **Launchタブ B1** にアプリURLも保存されます。台帳をDriveのスター付きにすると見つけやすくなります。

## 7. バックアップ・削除・他の人への提供

JSONバックアップは端末にダウンロードします。自動定時バックアップ、JSONの画面からの復元は未実装です。DriveのEventsに履歴を残しますが、それ自体は独立バックアップではありません。

全クリアは確認後、現在の有効データを空にする変更を記録します。過去のEvents行、Google側の変更履歴、画像は削除しません。完全削除したい場合はDriveで台帳・Receipt画像を削除し、ごみ箱を空にしてください。その後アプリを再読み込みすると次回接続で空の台帳を作ります。

同僚には同じ公開URLを案内できます。Testing時は先にTest usersに追加します。それぞれ自分のGoogleアカウントで接続すればデータは別のDriveに保存されます。あなたの台帳を共有設定にする必要はありません。この実装は共同家計簿向けの複数アカウント共同編集には対応していません。

## 8. 検証と制約

`tests.cjs` は Node.js で変更差分・追記の再現・競合・削除を検証します。実行: `node tests.cjs`。
Google OAuth、実Drive/Sheetsへの書込、実機カメラ/OCRは、利用者のOAuth設定・許可後に動作確認が必要です。GitHubへのアップロードとGoogle Cloudの設定はまだ実行されていません。

初回確認: ログイン → 台帳作成 → 口座登録 → 収入/支出登録 → 再読込 → 別端末で同期 → 予算登録 → OCR確認 → 編集 → 基準通貨変更の順に少額のテストデータで試してください。

## 公式資料

- [GitHub Pagesの公開設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Google Identity Servicesのトークン方式](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Sheetsへの追記API](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append)
- [DriveのファイルAPI](https://developers.google.com/workspace/drive/api/reference/rest/v3/files)
- [Frankfurter](https://frankfurter.dev/)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
