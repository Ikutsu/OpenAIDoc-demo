---
title: Multiple Koin Modules in Android
---
藉由使用 Koin，你可以在模組中描述定義（definitions）。在本節中，我們將了解如何宣告、組織和連結你的模組（modules）。

## 使用多個模組（Using several modules）

元件（Components）不一定需要在同一個模組中。模組是一個邏輯空間，可以幫助你組織你的定義，並且可以依賴另一個模組中的定義。定義是延遲的（lazy），只有在元件請求它們時才會被解析。

讓我們舉一個例子，在不同的模組中連結元件：

```kotlin
// ComponentB <- ComponentA
class ComponentA()
class ComponentB(val componentA : ComponentA)

val moduleA = module {
    // Singleton ComponentA
    single { ComponentA() }
}

val moduleB = module {
    // Singleton ComponentB with linked instance ComponentA
    single { ComponentB(get()) }
}
```

我們只需要在啟動 Koin 容器時宣告使用的模組列表：

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // ...

            // 載入模組（Load modules）
            modules(moduleA, moduleB)
        }
        
    }
}
```
你可以根據你的 Gradle 模組自行組織，並收集多個 Koin 模組。

> 更多詳細資訊請查看 [Koin 模組章節](/docs/reference/koin-core/modules)

## 模組包含（Module Includes）（自 3.2 版本起）

`Module` 類別中提供了一個新的函式 `includes()`，它允許你透過包含其他模組，以有組織和結構化的方式組合一個模組。

此新功能的主要用途有兩個：
- 將大型模組拆分為更小且更集中的模組。
- 在模組化專案中，它可以讓你更精確地控制模組的可見性（請參閱下面的範例）。

它是如何運作的？ 讓我們採用一些模組，然後我們在 `parentModule` 中包含模組：

```kotlin
// `:feature` module
val childModule1 = module {
    /* Other definitions here. */
}
val childModule2 = module {
    /* Other definitions here. */
}
val parentModule = module {
    includes(childModule1, childModule2)
}

// `:app` module
startKoin { modules(parentModule) }
```

請注意，我們不需要明確地設定所有模組：透過包含 `parentModule`，所有在 `includes` 中宣告的模組都將自動載入（`childModule1` 和 `childModule2`）。 換句話說，Koin 實際上載入的是：`parentModule`、`childModule1` 和 `childModule2`。

一個需要觀察的重要細節是，你也可以使用 `includes` 來新增 `internal` 和 `private` 模組 - 這使你可以靈活地控制在模組化專案中要公開的內容。

:::info
模組載入現在經過優化，可以展平所有模組圖，並避免重複定義模組。
:::

最後，你可以包含多個巢狀或重複的模組，Koin 將展平所有包含的模組，並移除重複項：

```kotlin
// :feature module
val dataModule = module {
    /* Other definitions here. */
}
val domainModule = module {
    /* Other definitions here. */
}
val featureModule1 = module {
    includes(domainModule, dataModule)
}
val featureModule2 = module {
    includes(domainModule, dataModule)
}
```

```kotlin
// `:app` module
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // ...

            // 載入模組（Load modules）
             modules(featureModule1, featureModule2)
        }
        
    }
}
```

請注意，所有模組只會被包含一次：`dataModule`、`domainModule`、`featureModule1`、`featureModule2`。

## 使用背景模組載入減少啟動時間

你現在可以宣告 "延遲"（lazy）的 Koin 模組，以避免觸發任何資源的預先分配，並在 Koin 啟動時在背景載入它們。 這可以幫助避免阻止 Android 啟動過程，方法是傳遞延遲模組以在背景載入。

- `lazyModule` - 宣告一個延遲的 Kotlin 版本的 Koin 模組
- `Module.includes` - 允許包含延遲模組
- `KoinApplication.lazyModules` - 使用協程在背景載入延遲模組，關於平台預設的分配器（Dispatchers）
- `Koin.waitAllStartJobs` - 等待啟動工作完成
- `Koin.runOnKoinStarted` - 在啟動完成後執行程式碼塊

一個好的範例總是更容易理解：

```kotlin

// 延遲載入的模組（Lazy loaded module）
val m2 = lazyModule {
    singleOf(::ClassB)
}

val m1 = module {
    singleOf(::ClassA) { bind<IClassA>() }
}

startKoin {
    // 同步模組載入（sync module loading）
    modules(m1)
    // 在背景載入延遲模組（load lazy Modules in background）
    lazyModules(m2)
}

val koin = KoinPlatform.getKoin()

// 等待啟動完成（wait for start completion）
koin.waitAllStartJobs()

// 或在啟動後執行程式碼（or run code after start）
koin.runOnKoinStarted { koin ->
    // 在背景載入完成後執行（run after background load complete）
}
```
    ```