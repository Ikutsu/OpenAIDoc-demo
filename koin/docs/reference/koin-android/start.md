---
title: "在 Android 上启动 Koin"
---
`koin-android` 项目致力于为 Android 世界提供 Koin 的强大功能。有关更多详细信息，请参见 [Android 设置](../../../../../../../../setup/koin#android) 部分。

## 从您的 Application 类

从您的 `Application` 类中，您可以使用 `startKoin` 函数，并使用 `androidContext` 注入 Android 上下文，如下所示：

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // 将 Koin 日志记录到 Android logger 中
            androidLogger()
            // 引用 Android 上下文
            androidContext(this@MainApplication)
            // 加载模块
            modules(myAppModules)
        }
    }
}
```

:::info
如果您不想从 Application 类启动 Koin，也可以从任何地方启动 Koin。
:::

如果您需要从另一个 Android 类启动 Koin，您可以使用 `startKoin` 函数，并提供您的 Android `Context` 实例，如下所示：

```kotlin
startKoin {
    // 注入 Android 上下文
    androidContext(/* your android context */)
    // ...
}
```

## 额外配置

从您的 Koin 配置（在 `startKoin { }` 代码块中），您还可以配置 Koin 的几个部分。

### Koin Android 日志

在您的 `KoinApplication` 实例中，我们有一个扩展 `androidLogger`，它使用 `AndroidLogger()` 类。这个 logger 是 Koin logger 的 Android 实现。

您可以根据需要更改此 logger，如果它不符合您的需求。

```kotlin
startKoin {
    // 使用 Android logger - 默认为 Level.INFO
    androidLogger()
    // ...
}
```

### 加载属性

您可以在 `assets/koin.properties` 文件中使用 Koin 属性来存储键/值：

```kotlin
startKoin {
    // ...
    // 使用 assets/koin.properties 中的属性
    androidFileProperties()   
}
```

## 使用 Androidx Startup 启动 Koin (4.0.1) [实验性]

通过使用 Gradle 包 `koin-androidx-startup`，我们可以使用 `KoinStartup` 接口在您的 Application 类中声明您的 Koin 配置：

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

这取代了通常在 `onCreate` 中使用的 `startKoin` 函数。 `koinConfiguration` 函数返回一个 `KoinConfiguration` 实例。

:::info
`KoinStartup` 避免了在启动时阻塞主线程，并提供了更好的性能。
:::

## 启动依赖与 Koin

如果需要设置 Koin 并允许注入依赖项，您可以使您的 `Initializer` 依赖于 `KoinInitializer`：

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