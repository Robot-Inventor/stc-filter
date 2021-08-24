# STC Filter

[English](README.md)

[Robot-Inventor/spam-tweets-compressor](https://github.com/Robot-Inventor/spam-tweets-compressor)の高度なスパム判定用のフィルターデータです。

Spam Tweets Compressorはこのリポジトリー内の必要なデータをCDN経由で取得します。

## フィルターのフォーマット

フィルターのデータはJSON形式です。詳しいフォーマットはSpam Tweets Compressorのリポジトリー内の[高度なスパム判定について](https://github.com/Robot-Inventor/spam-tweets-compressor/blob/main/docs/ja/advanced_spam_detection.md)を参照してください。

## フィルターの作成・編集方法

### 1. ディレクトリーを追加

新規でフィルターを作成する場合は[src/filter/](https://github.com/Robot-Inventor/stc-filter/tree/main/src/filter)に新しいディレクトリーを作成してください。

既存のフィルターを編集する場合はステップ3に飛んでください。

### 2. filter_list.jsonに追記

[src/filter/filter_list.json](https://github.com/Robot-Inventor/stc-filter/blob/main/src/filter/filter_list.json)にディレクトリー名とフィルター名を追加します。filter_list.jsonは次のような形式になっています。

```json
{
    "filter": [
        {
            "dir": "フィルターのディレクトリー名",
            "name": "フィルター名",
            "id": "一度設定したら変更しないID"
        }
    ]
}
```

### 3. JSONファイルを作成

作成または編集したいフィルターのディレクトリーに、[高度なスパム判定について](https://github.com/Robot-Inventor/spam-tweets-compressor/blob/main/docs/ja/advanced_spam_detection.md)を参考にして任意のファイル名でJSONファイルまたはJSONCファイルを作成するか既存のJSONファイルを編集します。

保守管理の観点から、内容ごとにJSONファイルを分割することをオススメします。作成するJSONファイルの個数やファイル名に指定はありません。

また、[高度なスパム判定について](https://github.com/Robot-Inventor/spam-tweets-compressor/blob/main/docs/ja/advanced_spam_detection.md)に書かれているフォーマットには記載されていませんが、各JSONファイルについての説明を``description``プロパティーに任意で記載できます。

### 4. ビルド

次のコマンドを実行すると[dist/filter/](https://github.com/Robot-Inventor/stc-filter/tree/main/dist/filter)内に、[src/filter/](https://github.com/Robot-Inventor/stc-filter/tree/main/src/filter)の各ディレクトリー内のJSONファイルを統合した新しい1つのJSONファイルが作成されます。

```powershell
npm run build
```

また、上記のコマンドを実行するとフィルターの名前とCDNのURLの情報が保存されている[dist/advanced_filter.json](https://github.com/Robot-Inventor/stc-filter/blob/main/dist/advanced_filter.json)が自動で更新されます。

## フィルターのアップデートの配信

フィルターのデータは自動でCDN経由で配信されています。フィルターのアップデートを配信するために必要な特別な手順はありません。CDNのキャッシュは24時間ごとに更新されるため、フィルターの更新のマージ後、更新されたフィルターが配信されるまで最大で24時間かかります。
