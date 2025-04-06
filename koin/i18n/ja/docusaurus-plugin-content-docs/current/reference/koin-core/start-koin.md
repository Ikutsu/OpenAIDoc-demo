---
title: Start Koin
---
```markdown
Koinは、DSLであり、軽量コンテナであり、実用的なAPIです。Koinモジュール内で定義を宣言したら、Koinコンテナを起動する準備ができています。

### `startKoin`関数

`startKoin`関数は、Koinコンテナを起動するための主要なエントリポイントです。実行するには、*Koinモジュールのリスト*が必要です。
モジュールがロードされ、定義はKoinコンテナによって解決される準備ができています。

Koinの開始
```kotlin
// グローバルコンテキストでKoinApplicationを開始する
startKoin {
    // 使用するモジュールを宣言する
    modules(coffeeAppModule)
}
```

`startKoin`が呼び出されると、Koinはすべてのモジュールと定義を読み取ります。Koinは、必要なインスタンスを取得するために、`get()`または`by inject()`呼び出しを行う準備ができています。

Koinコンテナには、いくつかのオプションがあります。

* `logger` - ロギングを有効にする - <<logging.adoc#_logging,logging>> セクションを参照
* `properties()`, `fileProperties( )` または `environmentProperties( )` - 環境、koin.propertiesファイル、追加のプロパティからプロパティをロードする ... - <<properties.adoc#_lproperties,properties>> セクションを参照

:::info
 `startKoin`は複数回呼び出すことはできません。モジュールをロードするポイントが複数必要な場合は、`loadKoinModules`関数を使用してください。
:::

### 開始の裏側 - 水面下のKoinインスタンス

Koinを開始すると、Koinコンテナ設定インスタンスを表す`KoinApplication`インスタンスを作成します。起動されると、モジュールとオプションの結果である`Koin`インスタンスが生成されます。
この`Koin`インスタンスは、`KoinComponent`クラスで使用されるように、`GlobalContext`によって保持されます。

`GlobalContext`は、KoinのデフォルトのJVMコンテキスト戦略です。`startKoin`によって呼び出され、`GlobalContext`に登録されます。これにより、Koin Multiplatformの観点から、異なる種類のコンテキストを登録できます。

### startKoin後のモジュールのロード

`startKoin`関数を複数回呼び出すことはできません。ただし、`loadKoinModules()`関数を直接使用できます。

この関数は、Koinを使用したいSDKメーカーにとって興味深いものです。なぜなら、`starKoin()`関数を使用する必要はなく、ライブラリの開始時に`loadKoinModules`を使用するだけで済むからです。

```kotlin
loadKoinModules(module1,module2 ...)
```

### モジュールのアンロード

一連の定義をアンロードし、与えられた関数でそのインスタンスを解放することも可能です。

```kotlin
unloadKoinModules(module1,module2 ...)
```

### Koinの停止 - すべてのリソースを閉じる

すべてのKoinリソースを閉じ、インスタンスと定義を削除できます。このためには、Koinの`GlobalContext`を停止するために、どこからでも`stopKoin()`関数を使用できます。
それ以外の場合は、`KoinApplication`インスタンスで、`close()`を呼び出すだけです。

## ロギング

Koinには、Koinのアクティビティ（割り当て、ルックアップなど）をログに記録するためのシンプルなロギングAPIがあります。ロギングAPIは、以下のクラスで表されます。

Koinロガー

```kotlin
abstract class Logger(var level: Level = Level.INFO) {

    abstract fun log(level: Level, msg: MESSAGE)

    fun debug(msg: MESSAGE) {
        log(Level.DEBUG, msg)
    }

    fun info(msg: MESSAGE) {
        log(Level.INFO, msg)
    }

    fun error(msg: MESSAGE) {
        log(Level.ERROR, msg)
    }
}
```

Koinは、ターゲットプラットフォームに応じて、いくつかのロギングの実装を提供します。

* `PrintLogger` - コンソールに直接ログを記録します（`koin-core`に含まれています）
* `EmptyLogger` - 何もログに記録しません（`koin-core`に含まれています）
* `SLF4JLogger` - SLF4Jでログを記録します。ktorおよびsparkで使用されます（`koin-logger-slf4j`プロジェクト）
* `AndroidLogger` - Android Loggerにログを記録します（`koin-android`に含まれています）

### 開始時にロギングを設定する

デフォルトでは、Koinは`EmptyLogger`を使用します。`PrintLogger`を次のように直接使用できます。

```kotlin
startKoin {
    logger(LEVEL.INFO)
}
```

## プロパティのロード

開始時にいくつかのタイプのプロパティをロードできます。

* 環境プロパティ - *システム*プロパティをロードします
* koin.propertiesファイル - `/src/main/resources/koin.properties`ファイルからプロパティをロードします
* 「追加の」開始プロパティ - `startKoin`関数で渡される値のマップ

### モジュールからプロパティを読み取る

Koinの開始時にプロパティをロードするようにしてください。

```kotlin
startKoin {
    // デフォルトの場所からプロパティをロードする
    // （つまり、`/src/main/resources/koin.properties`）
    fileProperties()
}
```

Koinモジュールでは、キーによってプロパティを取得できます。

/src/main/resources/koin.properties ファイル内
```java
// キー - 値
server_url=http://service_url
```

`getProperty`関数でロードするだけです。

```kotlin
val myModule = module {

    // "server_url"キーを使用してその値を取得する
    single { MyService(getProperty("server_url")) }
}
```
```
