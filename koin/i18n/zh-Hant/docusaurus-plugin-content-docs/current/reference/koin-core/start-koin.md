---
title: Start Koin
---
Koin 是一個 DSL（領域特定語言）、輕量級容器和務實的 API。一旦你在 Koin 模組中宣告了你的定義，你就可以開始 Koin 容器了。

### `startKoin` 函式

`startKoin` 函式是啟動 Koin 容器的主要入口點。 它需要一個 *Koin 模組列表* 來執行。
模組被載入，定義準備好被 Koin 容器解析。

.啟動 Koin
```kotlin
// 在全域上下文中啟動 KoinApplication
startKoin {
    // 宣告使用的模組
    modules(coffeeAppModule)
}
```

一旦 `startKoin` 被呼叫，Koin 將讀取你所有的模組 & 定義。 然後 Koin 準備好透過任何 `get()` 或 `by inject()` 呼叫來檢索所需的實例。

你的 Koin 容器可以有幾個選項：

* `logger` - 啟用日誌記錄 - 參見 <<logging.adoc#_logging,logging>> 章節
* `properties()`, `fileProperties( )` 或 `environmentProperties( )` 從環境變數、koin.properties 檔案、額外屬性等載入屬性 - 參見 <<properties.adoc#_lproperties,properties>> 章節

:::info
`startKoin` 不能被多次呼叫。 如果你需要多個點來載入模組，請使用 `loadKoinModules` 函式。
:::

### 啟動背後 - 底層的 Koin 實例

當我們啟動 Koin 時，我們建立一個 `KoinApplication` 實例，它代表 Koin 容器的配置實例。 一旦啟動，它將產生一個 `Koin` 實例，這是你的模組和選項的結果。
然後，這個 `Koin` 實例由 `GlobalContext` 持有，供任何 `KoinComponent` 類別使用。

`GlobalContext` 是 Koin 的預設 JVM 上下文策略。 它由 `startKoin` 呼叫並註冊到 `GlobalContext`。 這將允許我們註冊不同種類的上下文，從 Koin Multiplatform 的角度來看。

### 在 startKoin 之後載入模組

你不能多次呼叫 `startKoin` 函式。 但是你可以直接使用 `loadKoinModules()` 函式。

這個函式對於想要使用 Koin 的 SDK 製造商來說很有趣，因為他們不需要使用 `starKoin()` 函式，只需在他們的程式庫啟動時使用 `loadKoinModules`。

```kotlin
loadKoinModules(module1,module2 ...)
```

### 卸載模組

也可以卸載一堆定義，然後使用給定的函式釋放它們的實例：

```kotlin
unloadKoinModules(module1,module2 ...)
```

### 停止 Koin - 關閉所有資源

你可以關閉所有 Koin 資源並丟棄實例 & 定義。 為此，你可以從任何地方使用 `stopKoin()` 函式來停止 Koin 的 `GlobalContext`。
否則，在 `KoinApplication` 實例上，只需呼叫 `close()`

## 日誌記錄 (Logging)

Koin 有一個簡單的日誌記錄 API，用於記錄任何 Koin 活動（分配、查找...）。 日誌記錄 API 由以下類別表示：

Koin 日誌器 (Logger)

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

Koin 提出了日誌記錄的一些實作，取決於目標平台：

* `PrintLogger` - 直接記錄到控制台（包含在 `koin-core` 中）
* `EmptyLogger` - 不記錄任何內容（包含在 `koin-core` 中）
* `SLF4JLogger` - 使用 SLF4J 記錄。 由 ktor 和 spark 使用（`koin-logger-slf4j` 專案）
* `AndroidLogger` - 記錄到 Android Logger（包含在 `koin-android` 中）

### 在啟動時設定日誌記錄

預設情況下，Koin 使用 `EmptyLogger`。 你可以直接使用 `PrintLogger`，如下所示：

```kotlin
startKoin {
    logger(LEVEL.INFO)
}
```

## 載入屬性 (Properties)

你可以在啟動時載入幾種類型的屬性：

* 環境變數屬性 (environment properties) - 載入 *系統* 屬性
* koin.properties 檔案 - 從 `/src/main/resources/koin.properties` 檔案載入屬性
* "額外" 啟動屬性 - 在 `startKoin` 函式中傳遞的數值映射

### 從模組讀取屬性

請務必在 Koin 啟動時載入屬性：

```kotlin
startKoin {
    // 從預設位置載入屬性
    // (即 `/src/main/resources/koin.properties`)
    fileProperties()
}
```

在 Koin 模組中，你可以透過其鍵取得屬性：

在 /src/main/resources/koin.properties 檔案中
```java
// 鍵 - 值 (Key - value)
server_url=http://service_url
```

只需使用 `getProperty` 函式載入它：

```kotlin
val myModule = module {

    // 使用 "server_url" 鍵來檢索其值
    single { MyService(getProperty("server_url")) }
}
```
