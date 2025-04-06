---
title: Context Isolation
---
## 什么是上下文隔离？

对于 SDK 的开发者来说，你也可以用非全局的方式使用 Koin：使用 Koin 来为你的库做依赖注入（DI），通过隔离你的上下文，来避免你的库的使用者使用 Koin 时发生任何冲突。

通常，我们可以像这样启动 Koin：

```kotlin
// 启动一个 KoinApplication 并在全局上下文中注册它
startKoin {

    // 声明使用的模块
    modules(...)
}
```

这会使用默认的 Koin 上下文来注册你的依赖。

但是如果我们想要使用一个隔离的 Koin 实例，你需要声明一个实例，并将它存储在一个类中来持有你的实例。
你需要在你的库中保持你的 Koin Application 实例可用，并将它传递给你的自定义 KoinComponent 实现：

`MyIsolatedKoinContext` 类在这里持有我们的 Koin 实例：

```kotlin
// 为你的 Koin 实例获取一个上下文
object MyIsolatedKoinContext {

    private val koinApp = koinApplication {
        // 声明使用的模块
        modules(coffeeAppModule)
    }

    val koin = koinApp.koin 
}
```

让我们使用 `MyIsolatedKoinContext` 来定义我们的 `IsolatedKoinComponent` 类，一个会使用我们的隔离上下文的 KoinComponent：

```kotlin
internal interface IsolatedKoinComponent : KoinComponent {

    // 覆盖默认的 Koin 实例
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin
}
```

一切就绪，只需使用 `IsolatedKoinComponent` 从隔离的上下文中检索实例：

```kotlin
class MyKoinComponent : IsolatedKoinComponent {
    // inject & get 将会指向 MyKoinContext
}
```

## 测试

要测试使用 `by inject()` 委托来检索依赖的类，请覆盖 `getKoin()` 方法并定义自定义 Koin 模块：

```kotlin
class MyClassTest : KoinTest {
    // 用于检索依赖的 Koin 上下文
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin

    @Before
    fun setUp() {
       // 定义自定义 Koin 模块
        val module = module {
            // 注册依赖
        }

        koin.loadModules(listOf(module))
    }
}
```
