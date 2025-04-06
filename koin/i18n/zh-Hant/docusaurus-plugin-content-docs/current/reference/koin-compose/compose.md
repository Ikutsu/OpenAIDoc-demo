---
title: Koin for Jetpack Compose and Compose Multiplatform
---
n
本頁面描述如何為你的 [Android Jetpack Compose](https://developer.android.com/jetpack/compose) 或 [Multiplaform Compose](https://www.jetbrains.com/lp/compose-mpp/) 應用程式注入依賴項 (dependencies)。

## Koin Compose Multiplatform vs Koin Android Jetpack Compose

自 2024 年中以來，Compose 應用程式可以使用 Koin Multiplatform API 來完成。 Koin Jetpack Compose (koin-androidx-compose) 和 Koin Compose Multiplatform (koin-compose) 之間的所有 API 都是相同的。

### Compose 應該使用哪個 Koin 套件？

對於僅使用 Android Jetpack Compose API 的純 Android 應用程式，請使用以下套件：
- `koin-androidx-compose` - 用於解鎖 Compose 基礎 API + Compose ViewModel API
- `koin-androidx-compose-navigation` - 具有 Navigation API 集成的 Compose ViewModel API

對於 Android/Multiplatform 應用程式，請使用以下套件：
- `koin-compose` - Compose 基礎 API
- `koin-compose-viewmodel` - Compose ViewModel API
- `koin-compose-viewmodel-navigation` - 具有 Navigation API 集成的 Compose ViewModel API

## 重新啟動現有的 Koin context (Koin 已經啟動)

有時 `startKoin` 函數已經在應用程式中使用，以便在你的應用程式中啟動 Koin（例如在 Android 主應用程式類別 Application class 中）。在這種情況下，你需要使用 `KoinContext` 或 `KoinAndroidContext` 來告知你的 Compose 應用程式當前的 Koin context。這些函數會重複使用當前的 Koin context 並將其綁定到 Compose 應用程式。

```kotlin
@Composable
fun App() {
    // 將當前的 Koin 實例設定到 Compose context
    KoinContext() {

        MyScreen()
    }
}
```

:::info
`KoinAndroidContext` 和 `KoinContext` 之間的差異：
- `KoinAndroidContext` 在當前的 Android 應用程式 context 中尋找 Koin 實例
- `KoinContext` 在當前的 GlobalContext 中尋找 Koin 實例
:::

:::note
如果你從 Composable 收到一些 `ClosedScopeException`，請在你的 Composable 上使用 `KoinContext`，或者確保有正確的 Koin 啟動配置 [使用 Android context](/docs/reference/koin-android/start.md#from-your-application-class)
:::

## 使用 Compose App 啟動 Koin - KoinApplication

`KoinApplication` 函數有助於建立 Koin 應用程式實例，作為一個 Composable：

```kotlin
@Composable
fun App() {
    KoinApplication(application = {
        modules(...)
    }) {
        
        // 你的螢幕在這裡 ...
        MyScreen()
    }
}
```

`KoinApplication` 函數將處理你的 Koin context 的啟動和停止，並考量 Compose context 的週期。此函數會啟動和停止一個新的 Koin 應用程式 context。

:::info
在 Android 應用程式中，`KoinApplication` 將處理任何關於配置更改或 Activities 丟棄而需要停止/重新啟動 Koin context 的情況。
:::

:::note
這取代了使用傳統的 `startKoin` 應用程式函數。
:::

### 使用 Koin 進行 Compose 預覽

`KoinApplication` 函數可用於為預覽啟動專用 context。這也可以用於協助 Compose 預覽：

```kotlin
@Composable
@Preview
fun App() {
    KoinApplication(application = {
        // 你的預覽配置在這裡
        modules(previewModule)
    }) {
        // 使用 Koin 進行 Compose 預覽
    }
}
```

## 注入到 @Composable

在編寫你的 composable 函數時，你可以存取以下 Koin API：`koinInject()`，用於從 Koin 容器注入實例。

對於宣告 'MyService' 元件的模組：

```kotlin
val androidModule = module {
    single { MyService() }
    // 或 constructor DSL
    singleOf(::MyService)
}
```

我們可以這樣獲取你的實例：

```kotlin
@Composable
fun App() {
    val myService = koinInject<MyService>()
}
```

為了與 Jetpack Compose 的函數式方面保持一致，最好的編寫方法是將實例直接注入到函數參數中。這樣可以允許使用 Koin 進行預設實作，但保持開放以你想要的方式注入實例。

```kotlin
@Composable
fun App(myService: MyService = koinInject()) {

}
```

### 將參數注入到 @Composable

當你從 Koin 請求一個新的依賴項時，你可能需要注入參數。為此，你可以使用 `koinInject` 函數的 `parameters` 參數，以及 `parametersOf()` 函數，如下所示：

```kotlin
@Composable
fun App() {
    val myService = koinInject<MyService>(parameters = parametersOf("a_string"))
}
```

:::info
你可以將參數與 lambda 注入一起使用，例如 `koinInject<MyService>{ parametersOf("a_string") }`，但如果你的大量重新組合，這可能會對效能產生影響。這個帶有 lambda 的版本需要在呼叫時解包你的參數，以幫助避免記住你的參數。

從 Koin 的 4.0.2 版本開始，引入了 koinInject(Qualifier,Scope,ParametersHolder)，讓你以最有效的方式使用參數
:::

## @Composable 的 ViewModel

與你可以存取經典的 single/factory 實例的方式相同，你可以存取以下 Koin ViewModel API：

* `koinViewModel()` - 注入 ViewModel 實例
* `koinNavViewModel()` - 注入 ViewModel 實例 + Navigation 參數資料（如果你正在使用 `Navigation` API）

對於宣告 'MyViewModel' 元件的模組：

```kotlin
module {
    viewModel { MyViewModel() }
    // 或 constructor DSL
    viewModelOf(::MyViewModel)
}
```

我們可以這樣獲取你的實例：

```kotlin
@Composable
fun App() {
    val vm = koinViewModel<MyViewModel>()
}
```

我們可以在函數參數中獲取你的實例：

```kotlin
@Composable
fun App(vm : MyViewModel = koinViewModel()) {

}
```

:::note
Jetpack Compose 的更新不支援 Lazy API
:::

### @Composable 的 ViewModel 和 SavedStateHandle

你可以有一個 `SavedStateHandle` 建構子參數，它將根據 Compose 環境（Navigation BackStack 或 ViewModel）注入。它將透過 ViewModel `CreationExtras` 或透過 Navigation `BackStackEntry` 注入：

```kotlin
// 在 Navhost 中設定 objectId 參數
NavHost(
    navController,
    startDestination = "list"
) {
    composable("list") { backStackEntry ->
        //...
    }
    composable("detail/{objectId}") { backStackEntry ->
        val objectId = backStackEntry.arguments?.getString("objectId")?.toInt()
        DetailScreen(navController, objectId!!)
    }
}

// 在 ViewModel 中注入的參數
class DetailViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    init {
        println("$this - objectId: ${savedStateHandle.get<String>("objectId")}")
    }
}
```

:::note
關於 SavedStateHandle 注入差異的更多詳細資訊：https://github.com/InsertKoinIO/koin/issues/1935#issuecomment-2362335705
:::

## 與 Composable 綁定的模組加載和卸載

Koin 為你提供了一種為給定的 Composable 函數載入特定模組的方法。 `rememberKoinModules` 函數載入 Koin 模組並記住在當前的 Composable 上：

```kotlin
@Composable
@Preview
fun MyComponentComposable() {
    // 在此元件的第一次呼叫時載入模組
    rememberKoinModules(myModule)
}
```

你可以使用其中一個放棄函數，以在兩個方面卸載模組：
- onForgotten - 在組合物 (composition) 掉出後
- onAbandoned - 組合物失敗

為此，請對 `rememberKoinModules` 使用 `unloadOnForgotten` 或 `unloadOnAbandoned` 參數。

## 使用 Composable 建立 Koin Scope

Composable 函數 `rememberKoinScope` 和 `KoinScope` 允許在 Composable 中處理 Koin Scope，跟進當前 Composable 結束後關閉 scope。

:::info
此 API 目前仍不穩定
:::