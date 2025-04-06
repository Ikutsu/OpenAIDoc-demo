---
title: "使用 Compose 应用的隔离上下文"
---
使用 Compose 应用程序，你可以通过[隔离上下文](/docs/reference/koin-core/context-isolation.md)以相同的方式处理 SDK 或白标（white label）应用程序，以避免将你的 Koin 定义与最终用户的定义混合。

## 定义隔离上下文

首先，我们声明隔离上下文的持有者（holder），以便在内存中存储我们的隔离 Koin 实例。这可以通过一个简单的 Object 类来实现，如下所示。`MyIsolatedKoinContext` 类持有我们的 Koin 实例：

```kotlin
object MyIsolatedKoinContext {

    val koinApp = koinApplication {
        // declare used modules
        modules(sdkAppModule)
    }
}
```

:::note
根据你的初始化需求调整 `MyIsolatedKoinContext` 类。
:::

## 使用 Compose 设置隔离上下文

现在你已经定义了一个隔离的 Koin 上下文，我们可以设置它与 Compose 一起使用，并覆盖所有的 API。只需在根 Compose 函数中使用 `KoinIsolatedContext`。这将在所有子 composable 中传播你的 Koin 上下文。

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
在使用 `KoinIsolatedContext` 之后，所有 Koin Compose API 将使用你的 Koi 隔离上下文。
:::