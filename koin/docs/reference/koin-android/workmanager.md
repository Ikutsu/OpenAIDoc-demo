---
title: WorkManager
---
`koin-androidx-workmanager` 项目致力于引入 Android WorkManager 的相关特性。

## WorkManager DSL

## 设置 WorkManager

首先，在你的 KoinApplication 声明中，使用 `workManagerFactory()` 关键字来设置自定义的 WorkManager 实例：

```kotlin
class MainApplication : Application(), KoinComponent {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // 设置一个 WorkManager 实例
            workManagerFactory()
            modules(...)
        }

        setupWorkManagerFactory()
}
```

同样重要的是，你需要编辑你的 AndroidManifest.xml 文件，以阻止 Android 初始化其默认的 WorkManagerFactory，如 https://developer.android.com/topic/libraries/architecture/workmanager/advanced/custom-configuration#remove-default 所示。否则会导致应用崩溃。

```xml
    <application . . .>
        . . .
        <provider
            android:name="androidx.startup.InitializationProvider"
            android:authorities="${applicationId}.androidx-startup"
            android:exported="false"
            tools:node="merge">
            <meta-data
                android:name="androidx.work.WorkManagerInitializer"
                android:value="androidx.startup"
                tools:node="remove" />
        </provider>
    </application>
```

## 声明 ListenableWorker

```kotlin
val appModule = module {
    single { MyService() }
    worker { MyListenableWorker(get()) }
}
```

### 创建额外的工作管理器工厂 (work manager factories)

你也可以编写一个 WorkManagerFactory 并将其传递给 Koin。它将被添加为一个委托 (delegate)。

```kotlin
class MainApplication : Application(), KoinComponent {

    override fun onCreate() {
        super.onCreate()

        startKoin {
           workManagerFactory(workFactory1, workFactory2)
           . . .
        }

        setupWorkManagerFactory()
    }
}
```

如果 Koin 和 workFactory1 提供的 WorkManagerFactory 都可以实例化一个 ListenableWorker，则将使用 Koin 提供的工厂。

## 一些假设

### 在 koin 库本身中添加 manifest 更改
如果我们 koin-androidx-workmanager 自己的 manifest 禁用默认的工作管理器 (work manager)，我们可以为应用开发者减少一个步骤。但是，这可能会令人困惑，因为如果应用开发者没有初始化 koin 的工作管理器基础设施 (work manager infrastructure)，他最终将没有可用的工作管理器工厂 (work manager factories)。

这可以通过 checkModules 来帮助解决：如果项目中的任何类实现了 ListenableWorker，我们检查 manifest 和代码，并确保它们有意义吗？

### DSL 改进选项：

```kotlin

val workerFactoryModule = module {
   factory<WorkerFactory> { WorkerFactory1() }
   factory<WorkerFactory> { WorkerFactory2() }
}
```

然后让 koin 内部做一些类似的事情

```kotlin
fun Application.setupWorkManagerFactory(
  // no vararg for WorkerFactory
) {
. . .
            getKoin().getAll<WorkerFactory>()
                .forEach {
                    delegatingWorkerFactory.addFactory(it)
                }
}
```