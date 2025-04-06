---
title: Isolated Context with Compose Applications
---
使用 Compose 應用程式，你可以使用相同的 [隔離上下文](/docs/reference/koin-core/context-isolation.md) 來處理 SDK 或白標（white label）應用程式，以避免將你的 Koin 定義與最終使用者的定義混淆。

## 定義隔離上下文

首先，宣告我們的隔離上下文持有者（isolated context holder），以便在記憶體中儲存我們的隔離 Koin 實例。這可以使用一個簡單的 Object 類別來完成，如下所示。`MyIsolatedKoinContext` 類別持有我們的 Koin 實例：

```kotlin
object MyIsolatedKoinContext {

    val koinApp = koinApplication {
        // declare used modules
        modules(sdkAppModule)
    }
}
```

:::note
根據你的初始化需求調整 `MyIsolatedKoinContext` 類別
:::

## 使用 Compose 設定隔離上下文

現在你已經定義了一個隔離的 Koin 上下文，我們可以將其設定到 Compose 中以使用它並覆蓋所有 API。只需在根 Compose 函數中使用 `KoinIsolatedContext` 即可。這將在所有子 composable 中傳播你的 Koin 上下文。

```kotlin
@Composable
fun App() {
    // Set current Koin instance to Compose context
    KoinIsolatedContext(context = MyIsolatedKoinContext.koinApp) {

        MyScreen()
    }
}
```

:::info
在使用 `KoinIsolatedContext` 後，所有 Koin Compose API 都將使用你的 Koin 隔離上下文
:::
