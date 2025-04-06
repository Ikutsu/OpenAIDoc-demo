---
title: Start Koin
---
Koin 是一种 DSL（领域特定语言），一个轻量级的容器和一个务实的 API。一旦你在 Koin 模块中声明了你的定义，你就可以启动 Koin 容器了。

### `startKoin` 函数

`startKoin` 函数是启动 Koin 容器的主要入口点。它需要一个 *Koin 模块列表* 来运行。
模块被加载，定义可以被 Koin 容器解析。

启动 Koin
```kotlin
// 在全局上下文中启动 KoinApplication
startKoin {
    // 声明使用的模块
    modules(coffeeAppModule)
}
```

一旦 `startKoin` 被调用，Koin 将读取你所有的模块和定义。然后，Koin 就可以通过任何 `get()` 或 `by inject()` 调用来检索所需的实例。

你的 Koin 容器可以有几个选项：

* `logger` - 启用日志记录 - 参见 <<logging.adoc#_logging,logging>> 章节
* `properties()`, `fileProperties( )` 或 `environmentProperties( )` 从环境、koin.properties 文件、额外的属性中加载属性... - 参见 <<properties.adoc#_lproperties,properties>> 章节

:::info
`startKoin` 只能被调用一次。如果你需要多个加载模块的点，使用 `loadKoinModules` 函数。
:::

### 启动背后 - 底层的 Koin 实例

当我们启动 Koin 时，我们创建一个 `KoinApplication` 实例，它代表 Koin 容器的配置实例。一旦启动，它将产生一个 `Koin` 实例，它是你的模块和选项的结果。
然后，这个 `Koin` 实例被 `GlobalContext` 持有，供任何 `KoinComponent` 类使用。

`GlobalContext` 是 Koin 的默认 JVM 上下文策略。它由 `startKoin` 调用并注册到 `GlobalContext`。这将允许我们注册不同类型的上下文，从 Koin 多平台的角度来看。

### 在 startKoin 之后加载模块

你不能多次调用 `startKoin` 函数。但是你可以直接使用 `loadKoinModules()` 函数。

这个函数对于想要使用 Koin 的 SDK 开发者来说很有意思，因为他们不需要使用 `starKoin()` 函数，只需要在他们的库启动时使用 `loadKoinModules`。

```kotlin
loadKoinModules(module1,module2 ...)
```

### 卸载模块

也可以卸载一组定义，然后使用给定的函数释放它们的实例：

```kotlin
unloadKoinModules(module1,module2 ...)
```

### 停止 Koin - 关闭所有资源

你可以关闭所有的 Koin 资源，并删除实例和定义。为此，你可以从任何地方使用 `stopKoin()` 函数，来停止 Koin 的 `GlobalContext`。
否则，在 `KoinApplication` 实例上，只需调用 `close()`。

## 日志记录

Koin 有一个简单的日志记录 API，用于记录任何 Koin 活动（分配、查找...）。日志记录 API 由下面的类表示：

Koin 日志器

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

Koin 根据目标平台提供了一些日志记录的实现：

* `PrintLogger` - 直接记录到控制台（包含在 `koin-core` 中）
* `EmptyLogger` - 不记录任何内容（包含在 `koin-core` 中）
* `SLF4JLogger` - 使用 SLF4J 记录。被 ktor 和 spark 使用（`koin-logger-slf4j` 项目）
* `AndroidLogger` - 记录到 Android Logger（包含在 `koin-android` 中）

### 在启动时设置日志记录

默认情况下，Koin 使用 `EmptyLogger`。你可以直接使用 `PrintLogger`，如下所示：

```kotlin
startKoin {
    logger(LEVEL.INFO)
}
```

## 加载属性

你可以在启动时加载几种类型的属性：

* environment properties（环境变量） - 加载 *系统* 属性
* koin.properties file（koin.properties 文件） - 从 `/src/main/resources/koin.properties` 文件加载属性
* "extra" start properties（"额外" 启动属性） - 在 `startKoin` 函数中传递的值的映射

### 从模块读取属性

确保在 Koin 启动时加载属性：

```kotlin
startKoin {
    // 从默认位置加载属性
    // (例如 `/src/main/resources/koin.properties`)
    fileProperties()
}
```

在 Koin 模块中，你可以通过它的键来获取一个属性：

在 /src/main/resources/koin.properties 文件中
```java
// 键 - 值
server_url=http://service_url
```

只需使用 `getProperty` 函数加载它：

```kotlin
val myModule = module {

    // 使用 "server_url" 键来检索它的值
    single { MyService(getProperty("server_url")) }
}
```
