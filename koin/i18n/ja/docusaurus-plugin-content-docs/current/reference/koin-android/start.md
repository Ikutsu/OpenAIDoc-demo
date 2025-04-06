---
title: Start Koin on Android
---
n
`koin-android` プロジェクトは、Koin の機能を Android の世界に提供することに特化しています。詳細については、[Android のセットアップ](/docs/setup/koin#android)のセクションを参照してください。

## Application クラスから

`Application` クラスから、`startKoin` 関数を使用し、`androidContext` を使用して Android コンテキストを注入できます。以下に例を示します。

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // Android ロガーに Koin をログ出力
            androidLogger()
            // Android コンテキストを参照
            androidContext(this@MainApplication)
            // モジュールをロード
            modules(myAppModules)
        }
    }
}
```

:::info
Application クラスから開始したくない場合は、どこからでも Koin を開始できます。
:::

別の Android クラスから Koin を開始する必要がある場合は、`startKoin` 関数を使用し、次のように Android の `Context` インスタンスを提供できます。

```kotlin
startKoin {
    // Android コンテキストを注入（inject）
    androidContext(/* あなたの Android コンテキスト */)
    // ...
}
```

## 追加の構成 (Extra Configurations)

Koin の構成（`startKoin { }` ブロックコード内）から、Koin のいくつかの部分を構成することもできます。

### Android 向けの Koin ロギング (Koin Logging)

`KoinApplication` インスタンス内には、`AndroidLogger()` クラスを使用する拡張機能 `androidLogger` があります。
このロガーは、Koin ロガーの Android 実装です。

ニーズに合わない場合は、このロガーを変更できます。

```kotlin
startKoin {
    // Android ロガーを使用 - デフォルトでは Level.INFO
    androidLogger()
    // ...
}
```

### プロパティのロード (Loading Properties)

`assets/koin.properties` ファイルで Koin のプロパティを使用して、キーと値を保存できます。

```kotlin
startKoin {
    // ...
    // assets/koin.properties からプロパティを使用
    androidFileProperties()   
}
```

## Androidx Startup (4.0.1) で Koin を起動する [実験的]

Gradle パッケージ `koin-androidx-startup` を使用すると、`KoinStartup` インターフェースを使用して、Application クラスで Koin 構成を宣言できます。

```kotlin
class MainApplication : Application(), KoinStartup {

     override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }

    override fun onCreate() {
        super.onCreate()
    }
}
```

これは、通常 `onCreate` で使用される `startKoin` 関数を置き換えます。`koinConfiguration` 関数は、`KoinConfiguration` インスタンスを返します。

:::info
`KoinStartup` は起動時にメインスレッドのブロックを回避し、より優れたパフォーマンスを提供します。
:::

## Koin による起動依存関係 (Startup Dependency)

Koin をセットアップする必要があり、依存関係を注入（inject）できるようにする場合は、`Initializer` を `KoinInitializer` に依存させることができます。

```kotlin
class CrashTrackerInitializer : Initializer<Unit>, KoinComponent {

    private val crashTrackerService: CrashTrackerService by inject()

    override fun create(context: Context) {
        crashTrackerService.configure(context)
    }

    override fun dependencies(): List<Class<out Initializer<*>>> {
        return listOf(KoinInitializer::class.java)
    }

}
```