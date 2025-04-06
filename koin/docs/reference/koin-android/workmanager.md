---
title: WorkManager
---
`koin-androidx-workmanager` 项目致力于引入 Android WorkManager 的各项功能。

## WorkManager DSL

## 设置 WorkManager

首先，在你的 KoinApplication 声明中，使用 `workManagerFactory()` 关键字来设置自定义的 WorkManager 实例：

```kotlin
class MainApplication : Application(), KoinComponent {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // 设置 WorkManager 实例
            workManagerFactory()
            modules(...)
        }

        setupWorkManagerFactory()
}
```

同样重要的是，你需要编辑你的 AndroidManifest.xml 文件，以阻止 Android 初始化其默认的 WorkManagerFactory， 参见 https://developer.android.com/topic/libraries/architecture/workmanager/advanced/custom-configuration#remove-default。 如果不这样做，应用程序将会崩溃。

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

### 创建额外的 work manager 工厂

你也可以编写一个 WorkManagerFactory 并将其交给 Koin。 它将被添加为一个委托。

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

如果 Koin 和 workFactory1 提供的 WorkManagerFactory 都可以实例化一个 ListenableWorker，那么将使用 Koin 提供的工厂。

## 一些假设

### 在 koin 库本身中添加 manifest 更改
如果 koin-androidx-workmanager 自己的 manifest 禁用了默认的 work manager，我们可以为应用程序开发人员减少一个步骤。 但是，这可能会令人困惑，因为如果应用程序开发人员没有初始化 koin 的 work manager 基础设施，那么他们最终将没有可用的 work manager 工厂。

这可以通过 checkModules 来帮助解决：如果项目中的任何类实现了 ListenableWorker，我们检查 manifest 和代码，并确保它们是有意义的？

### DSL 改进选项：
```kotlin

val workerFactoryModule = module {
   factory<WorkerFactory> { WorkerFactory1() }
   factory<WorkerFactory> { WorkerFactory2() }
}
```

然后让 koin 内部执行类似以下操作：

```kotlin
fun Application.setupWorkManagerFactory(
  // 没有 WorkerFactory 的 vararg
) {
. . .
            getKoin().getAll<WorkerFactory>()
                .forEach {
                    delegatingWorkerFactory.addFactory(it)
                }
}
```
