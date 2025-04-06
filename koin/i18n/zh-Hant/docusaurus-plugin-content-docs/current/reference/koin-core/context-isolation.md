---
title: Context Isolation
---
## 什麼是上下文隔離 (Context Isolation)？

對於 SDK 開發者 (SDK Makers) 而言，您也可以用非全域的方式使用 Koin：將 Koin 用於您的函式庫的依賴注入 (DI)，並透過隔離您的上下文 (context)，來避免使用者使用您的函式庫和 Koin 時發生任何衝突。

通常，我們可以像這樣啟動 Koin：

```kotlin
// 啟動 KoinApplication 並將其註冊到全域上下文 (Global context) 中
startKoin {

    // 宣告使用的模組 (module)
    modules(...)
}
```

這會使用預設的 Koin 上下文 (default Koin context) 來註冊您的依賴項。

但是，如果我們想要使用隔離的 Koin 實例 (isolated Koin instance)，則需要宣告一個實例並將其儲存在類別中，以便保存您的實例。您必須使您的 Koin 應用程式實例 (Koin Application instance) 在您的函式庫中可用，並將其傳遞給您的自訂 KoinComponent 實現 (implementation)：

`MyIsolatedKoinContext` 類別在這裡持有我們的 Koin 實例：

```kotlin
// 為您的 Koin 實例獲取上下文 (Context)
object MyIsolatedKoinContext {

    private val koinApp = koinApplication {
        // 宣告使用的模組 (module)
        modules(coffeeAppModule)
    }

    val koin = koinApp.koin 
}
```

讓我們使用 `MyIsolatedKoinContext` 來定義我們的 `IsolatedKoinComponent` 類別，一個將使用我們的隔離上下文的 KoinComponent：

```kotlin
internal interface IsolatedKoinComponent : KoinComponent {

    // 覆寫 (Override) 預設的 Koin 實例
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin
}
```

一切就緒，只需使用 `IsolatedKoinComponent` 從隔離的上下文中檢索實例：

```kotlin
class MyKoinComponent : IsolatedKoinComponent {
    // 注入 (inject) & get 將以 MyKoinContext 為目標
}
```

## 測試 (Testing)

要測試使用 `by inject()` 委託檢索依賴項的類別，請覆寫 `getKoin()` 方法並定義自訂的 Koin 模組 (module)：

```kotlin
class MyClassTest : KoinTest {
    // 用於檢索依賴項的 Koin 上下文 (Context)
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin

    @Before
    fun setUp() {
       // 定義自訂的 Koin 模組 (module)
        val module = module {
            // 註冊依賴項
        }

        koin.loadModules(listOf(module))
    }
}
```
