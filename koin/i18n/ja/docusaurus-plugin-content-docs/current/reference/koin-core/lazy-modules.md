---
title: Lazy Modules and Background Loading
---
n
このセクションでは、Lazy Loading（遅延ロード）のアプローチでモジュールを構成する方法を見ていきます。

## Lazy Module（遅延モジュール）の定義 [実験的]

リソースの事前割り当てを避け、Koinの起動時にバックグラウンドでロードするために、Lazy Koin Module（遅延Koinモジュール）を宣言できるようになりました。

- `lazyModule` - Koin Module（Koinモジュール）のLazy Kotlin（遅延Kotlin）バージョンを宣言します
- `Module.includes` - Lazy Module（遅延モジュール）を含めることができます

理解を深めるには、常に良い例が役立ちます。

```kotlin
// いくつかのLazy Module（遅延モジュール）
val m2 = lazyModule {
    singleOf(::ClassB)
}

// m2 Lazy Module（遅延モジュール）を含める
val m1 = lazyModule {
    includes(m2)
    singleOf(::ClassA) { bind<IClassA>() }
}
```

:::info
    LazyModule（遅延モジュール）は、次のAPIでロードされるまでリソースをトリガーしません
:::

## Kotlinコルーチンによるバックグラウンドロード [実験的]

いくつかのLazy Module（遅延モジュール）を宣言したら、Koin構成からバックグラウンドでロードできます。

- `KoinApplication.lazyModules` - プラットフォームのデフォルトのDispatcher（ディスパッチャ）に関して、コルーチンを使用してバックグラウンドでLazy Module（遅延モジュール）をロードします
- `Koin.waitAllStartJobs` - 開始ジョブが完了するのを待ちます
- `Koin.runOnKoinStarted` - 開始完了後にブロックコードを実行します

理解を深めるには、常に良い例が役立ちます。

```kotlin
startKoin {
    // バックグラウンドでLazy Module（遅延モジュール）をロードする
    lazyModules(m1)
}

val koin = KoinPlatform.getKoin()

// ローディングジョブが完了するのを待つ
koin.waitAllStartJobs()

// または、ロード完了後にコードを実行する
koin.runOnKoinStarted { koin ->
    // バックグラウンドロード完了後に実行
}
```

:::note
    `lazyModules`関数を使用すると、Dispatcher（ディスパッチャ）を指定できます：`lazyModules(modules, dispatcher = Dispatcher.IO)`
:::

:::info
    コルーチンエンジンのデフォルトのDispatcher（ディスパッチャ）は`Dispatchers.Default`です
:::

### 制限事項 - Module（モジュール）/Lazy Module（遅延モジュール）の混在

今のところ、起動時にModule（モジュール）とLazy Module（遅延モジュール）を混在させないことをお勧めします。 `lazyReporter`で依存関係を必要とする`mainModule`を持たないようにしてください。

```kotlin
startKoin {
    androidLogger()
    androidContext(this@TestApp)
    modules(mainModule)
    lazyModules(lazyReporter)
}
```

:::warning
今のところ、KoinはモジュールがLazy Module（遅延モジュール）に依存しているかどうかを確認しません
:::