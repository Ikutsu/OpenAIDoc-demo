---
title: "Android 的构造器 DSL"
---
## 新的构造器 DSL (始于 3.2 版本)

Koin 现在提供了一种新的 DSL 关键词，允许您直接指定类的构造器，避免在 Lambda 表达式中编写定义。

查看新的 [构造器 DSL](/docs/reference/koin-core/dsl-update.md#constructor-dsl-since-32) 章节获取更多详情。

对于 Android，这表示以下新的构造器 DSL 关键词：

* `viewModelOf()` - 等同于 `viewModel { }`
* `fragmentOf()` - 等同于 `fragment { }`
* `workerOf()` - 等同于 `worker { }`

:::info
请确保在类名前使用 `::`，以指定类的构造器
:::

### 一个 Android 示例

给定一个具有以下组件的 Android 应用程序：

```kotlin
// 一个简单的服务
class SimpleServiceImpl() : SimpleService

// 一个 Presenter，使用 SimpleService 并且可以接收注入的 "id" 参数
class FactoryPresenter(val id: String, val service: SimpleService)

// 一个 ViewModel，可以接收注入的 "id" 参数，使用 SimpleService 并且获取 SavedStateHandle
class SimpleViewModel(val id: String, val service: SimpleService, val handle: SavedStateHandle) : ViewModel()

// 一个作用域 Session，可以接收到 MyActivity 的链接（来自作用域）
class Session(val activity: MyActivity)

// 一个 Worker，使用 SimpleService 并且获取 Context & WorkerParameters
class SimpleWorker(
    private val simpleService: SimpleService,
    appContext: Context,
    private val params: WorkerParameters
) : CoroutineWorker(appContext, params)
```

我们可以像这样声明它们：

```kotlin
module {
    singleOf(::SimpleServiceImpl){ bind<SimpleService>() }

    factoryOf(::FactoryPresenter)

    viewModelOf(::SimpleViewModel)

    scope<MyActivity>(){
        scopedOf(::Session) 
    }

    workerOf(::SimpleWorker)
}
```

## Android 反射 DSL (自 3.2 版本起已弃用)

:::caution
Koin 反射 DSL 现在已被弃用。请使用上面的 Koin 构造器 DSL
:::