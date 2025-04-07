---
title: "上下文隔离 (Context Isolation)"
---
## 什么是上下文隔离?

对于SDK开发者，您也可以以非全局的方式使用 Koin：将 Koin 用于您的库的依赖注入（DI），并通过隔离您的上下文，避免使用您的库和 Koin 的人之间的任何冲突。

通常，我们可以这样启动 Koin：

```kotlin
// 启动一个 KoinApplication 并在全局上下文中注册它
startKoin {

    // 声明使用的模块
    modules(...)
}
```

这使用默认的 Koin 上下文来注册您的依赖项。

但是，如果我们想要使用隔离的 Koin 实例，您需要声明一个实例并将其存储在一个类中，以保存您的实例。您将必须使您的 Koin Application 实例在您的库中可用，并将其传递给您的自定义 KoinComponent 实现：

`MyIsolatedKoinContext` 类在这里持有我们的 Koin 实例：

```kotlin
// 获取 Koin 实例的上下文
object MyIsolatedKoinContext {

    private val koinApp = koinApplication {
        // 声明使用的模块
        modules(coffeeAppModule)
    }

    val koin = koinApp.koin 
}
```

让我们使用 `MyIsolatedKoinContext` 来定义我们的 `IsolatedKoinComponent` 类，这是一个将使用我们的隔离上下文的 KoinComponent：

```kotlin
internal interface IsolatedKoinComponent : KoinComponent {

    // 重写默认的 Koin 实例
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin
}
```

一切就绪，只需使用 `IsolatedKoinComponent` 从隔离的上下文中检索实例：

```kotlin
class MyKoinComponent : IsolatedKoinComponent {
    // 注入 & 获取 将以 MyKoinContext 为目标
}
```

## 测试

要测试通过 `by inject()` 委托检索依赖项的类，请重写 `getKoin()` 方法并定义自定义 Koin 模块：

```kotlin
class MyClassTest : KoinTest {
    // 用于检索依赖项的 Koin 上下文
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin

    @Before
    fun setUp() {
       // 定义自定义 Koin 模块
        val module = module {
            // 注册依赖项
        }

        koin.loadModules(listOf(module))
    }
}
```