---
title: Start Koin on Android
---
n
`koin-android` 專案致力於將 Koin 的強大功能帶入 Android 世界。 有關更多詳細資訊，請參閱 [Android 設定](/docs/setup/koin#android) 區段。

## 從您的 Application 類別

從您的 `Application` 類別中，您可以使用 `startKoin` 函式，並使用 `androidContext` 注入 Android context (上下文)，如下所示：

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // Log Koin into Android logger
            androidLogger()
            // Reference Android context
            androidContext(this@MainApplication)
            // Load modules
            modules(myAppModules)
        }
    }
}
```

:::info
如果您不想從 Application 類別啟動 Koin，您也可以從任何地方啟動 Koin。
:::

如果您需要從另一個 Android 類別啟動 Koin，您可以使用 `startKoin` 函式並提供您的 Android `Context` 實例，如下所示：

```kotlin
startKoin {
    //inject Android context
    androidContext(/* your android context */)
    // ...
}
```

## 額外設定 (Extra Configurations)

從您的 Koin 設定 (在 `startKoin { }` 程式碼區塊中)，您還可以設定 Koin 的幾個部分。

### Koin 記錄 (Logging) 用於 Android

在您的 `KoinApplication` 實例中，我們有一個擴展 `androidLogger`，它使用 `AndroidLogger()` 類別。
此記錄器是 Koin 記錄器的 Android 實現。

您可以根據自己的需求更改此記錄器。

```kotlin
startKoin {
    // use Android logger - Level.INFO by default
    androidLogger()
    // ...
}
```

### 載入屬性 (Loading Properties)

您可以在 `assets/koin.properties` 檔案中使用 Koin 屬性來儲存鍵/值：

```kotlin
startKoin {
    // ...
    // use properties from assets/koin.properties
    androidFileProperties()   
}
```

## 使用 Androidx Startup 啟動 Koin (4.0.1) [實驗性]

透過使用 Gradle 套件 `koin-androidx-startup`，我們可以使用 `KoinStartup` 介面在您的 Application 類別中宣告您的 Koin 設定：

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

這取代了通常在 `onCreate` 中使用的 `startKoin` 函式。 `koinConfiguration` 函式正在傳回一個 `KoinConfiguration` 實例。

:::info
`KoinStartup` 避免在啟動時阻塞主線程，並提供更好的效能。
:::

## 具有 Koin 的 Startup 依賴關係

如果您需要設定 Koin，並允許注入依賴項，您可以使您的 `Initializer` 依賴於 `KoinInitializer`：

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