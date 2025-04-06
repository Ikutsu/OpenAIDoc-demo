---
title: "启动 Koin"
---
Koin 是一个 DSL（领域特定语言），一个轻量级的容器和一个实用的 API。一旦你在 Koin 模块中声明了你的定义，你就可以启动 Koin 容器了。

### `startKoin` 函数

`startKoin` 函数是启动 Koin 容器的主要入口点。它需要一个 *Koin 模块列表* 来运行。
模块被加载后，定义就可以被 Koin 容器解析了。

.启动 Koin
```kotlin
// 在全局上下文中启动一个 KoinApplication
startKoin {
    // 声明使用的模块
    modules(coffeeAppModule)
}
```

一旦 `startKoin` 被调用，Koin 将读取你所有的模块和定义。然后 Koin 就可以通过 `get()` 或 `by inject()` 调用来检索所需的实例了。

你的 Koin 容器可以有几个选项：

*   `logger` - 启用日志 - 参见 <<logging.adoc#_logging,logging>> 章节
*   `properties()`、`fileProperties( )` 或 `environmentProperties( )` - 从环境变量、koin.properties 文件、额外的属性等加载属性 - 参见 <<properties.adoc#_lproperties,properties>> 章节

:::info
`startKoin` 只能被调用一次。如果你需要多个点来加载模块，请使用 `loadKoinModules` 函数。
:::

### 启动背后 - 底层的 Koin 实例

当我们启动 Koin 时，我们创建一个 `KoinApplication` 实例，它代表 Koin 容器的配置实例。一旦启动，它将产生一个 `Koin` 实例，这是你的模块和选项的结果。
然后，这个 `Koin` 实例被 `GlobalContext` 持有，供任何 `KoinComponent` 类使用。

`GlobalContext` 是 Koin 的默认 JVM 上下文策略。它被 `startKoin` 调用并注册到 `GlobalContext`。这将允许我们注册不同类型的上下文，从 Koin Multiplatform 的角度来看。

### 在 startKoin 之后加载模块

你不能多次调用 `startKoin` 函数。但是你可以直接使用 `loadKoinModules()` 函数。

这个函数对于想要使用 Koin 的 SDK 开发者来说非常有用，因为他们不需要使用 `starKoin()` 函数，只需在他们的库启动时使用 `loadKoinModules` 即可。

```kotlin
loadKoinModules(module1,module2 ...)
```

### 卸载模块

也可以卸载一批定义，然后使用以下函数释放它们的实例：

```kotlin
unloadKoinModules(module1,module2 ...)
```

### 停止 Koin - 关闭所有资源

你可以关闭所有 Koin 资源并删除实例和定义。为此，你可以从任何地方使用 `stopKoin()` 函数来停止 Koin `GlobalContext`。
否则，在 `KoinApplication` 实例上，只需调用 `close()` 即可。

## 日志

Koin 有一个简单的日志 API 来记录任何 Koin 活动（分配、查找等）。日志 API 由以下类表示：

Koin Logger

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

Koin 根据目标平台提供了一些日志实现：

*   `PrintLogger` - 直接记录到控制台（包含在 `koin-core` 中）
*   `EmptyLogger` - 不记录任何内容（包含在 `koin-core` 中）
*   `SLF4JLogger` - 使用 SLF4J 记录。被 ktor 和 spark 使用（`koin-logger-slf4j` 项目）
*   `AndroidLogger` - 记录到 Android Logger（包含在 `koin-android` 中）

### 在启动时设置日志

默认情况下，Koin 使用 `EmptyLogger`。你可以直接使用 `PrintLogger`，如下所示：

```kotlin
startKoin {
    logger(LEVEL.INFO)
}
```

## 加载属性

你可以在启动时加载几种类型的属性：

*   环境变量 - 加载 *系统* 属性
*   koin.properties 文件 - 从 `/src/main/resources/koin.properties` 文件加载属性
*   "extra" 启动属性 - 在 `startKoin` 函数中传递的值的映射

### 从模块读取属性

确保在 Koin 启动时加载属性：

```kotlin
startKoin {
    // 从默认位置加载属性
    // (例如 `/src/main/resources/koin.properties`)
    fileProperties()
}
```

在 Koin 模块中，你可以通过其键获取属性：

在 /src/main/resources/koin.properties 文件中
```java
// 键 - 值
server_url=http://service_url
```

只需使用 `getProperty` 函数加载它：

```kotlin
val myModule = module {

    // 使用 "server_url" 键来检索其值
    single { MyService(getProperty("server_url")) }
}
```