---
title: Lazy Modules and Background Loading
---
在本節中，我們將了解如何使用延遲加載（Lazy Loading）方法來組織模組。

## 定義延遲模組 [實驗性功能]

現在您可以宣告延遲 Koin 模組，以避免觸發任何資源的預先分配，並在 Koin 啟動時在背景載入它們。

- `lazyModule` - 宣告一個 Koin 模組的延遲 Kotlin 版本
- `Module.includes` - 允許包含延遲模組

一個好的例子總是更容易理解：

```kotlin
// Some lazy modules
val m2 = lazyModule {
    singleOf(::ClassB)
}

// include m2 lazy module
val m1 = lazyModule {
    includes(m2)
    singleOf(::ClassA) { bind<IClassA>() }
}
```

:::info
    在被以下 API 載入之前，LazyModule 不會觸發任何資源
:::

## 使用 Kotlin 協程在背景載入 [實驗性功能]

一旦您宣告了一些延遲模組，您就可以從您的 Koin 配置中，甚至更多的地方，在背景載入它們。

- `KoinApplication.lazyModules` - 使用協程在背景載入延遲模組，取決於平台預設的 Dispatchers
- `Koin.waitAllStartJobs` - 等待啟動任務完成
- `Koin.runOnKoinStarted` - 在啟動完成後運行程式碼區塊

一個好的例子總是更容易理解：

```kotlin
startKoin {
    // load lazy Modules in background
    lazyModules(m1)
}

val koin = KoinPlatform.getKoin()

// wait for loading jobs to finish
koin.waitAllStartJobs()

// or run code after loading is done
koin.runOnKoinStarted { koin ->
    // run after background load complete
}
```

:::note
    `lazyModules` 函數允許您指定一個 dispatcher：`lazyModules(modules, dispatcher = Dispatcher.IO)`
:::

:::info
    coroutines 引擎的預設 dispatcher 是 `Dispatchers.Default`
:::

### 限制 - 混合模組/延遲模組

目前我們建議避免在啟動時混合使用模組和延遲模組。 避免讓 `mainModule` 需要 `lazyReporter` 中的依賴項。

```kotlin
startKoin {
    androidLogger()
    androidContext(this@TestApp)
    modules(mainModule)
    lazyModules(lazyReporter)
}
```

:::warning
目前 Koin 不會檢查您的模組是否依賴於延遲模組
:::
