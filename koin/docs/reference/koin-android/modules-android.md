---
title: Multiple Koin Modules in Android
---
通过使用 Koin，你可以在模块中描述定义（definitions）。在本节中，我们将了解如何声明、组织和链接你的模块。

## 使用多个模块

组件不必一定在同一个模块中。模块是一个逻辑空间，可以帮助你组织你的定义（definitions），并且可以依赖于另一个模块中的定义。定义是延迟的（lazy），只有当组件请求它们时才会被解析。

让我们看一个例子，其中链接的组件位于不同的模块中：

```kotlin
// ComponentB <- ComponentA
class ComponentA()
class ComponentB(val componentA : ComponentA)

val moduleA = module {
    // Singleton ComponentA
    single { ComponentA() }
}

val moduleB = module {
    // Singleton ComponentB with linked instance ComponentA
    single { ComponentB(get()) }
}
```

当我们启动 Koin 容器时，我们只需要声明已使用的模块列表：

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // ...

            // 加载模块 (Load modules)
            modules(moduleA, moduleB)
        }
        
    }
}
```

你可以根据 Gradle 模块来组织你自己，并收集多个 Koin 模块。

> 查看 [Koin 模块章节](/docs/reference/koin-core/modules) 获取更多详情

## 模块包含 (Module Includes) (自 3.2 版本起)

`Module` 类中提供了一个新的函数 `includes()`，它允许你通过以有组织和结构化的方式包含其他模块来组合模块。

此新功能的两个主要用例是：

- 将大型模块拆分为更小、更集中的模块。
- 在模块化项目中，它允许你更好地控制模块可见性（请参见以下示例）。

它是如何工作的？ 让我们获取一些模块，并将模块包含在 `parentModule` 中：

```kotlin
// `:feature` module
val childModule1 = module {
    /* 其他定义 (Other definitions) 在这里。*/
}
val childModule2 = module {
    /* 其他定义 (Other definitions) 在这里。*/
}
val parentModule = module {
    includes(childModule1, childModule2)
}

// `:app` module
startKoin { modules(parentModule) }
```

请注意，我们不需要显式设置所有模块：通过包含 `parentModule`，在 `includes` 中声明的所有模块都将自动加载（`childModule1` 和 `childModule2`）。 换句话说，Koin 实际上加载了：`parentModule`，`childModule1` 和 `childModule2`。

需要注意的一个重要细节是，你还可以使用 `includes` 来添加 `internal` 和 `private` 模块 - 这使你可以灵活地控制在模块化项目中公开的内容。

:::info
模块加载现已优化，可以展平所有模块图，并避免模块的重复定义。
:::

最后，你可以包含多个嵌套或重复的模块，Koin 将展平所有包含的模块，并删除重复项：

```kotlin
// :feature module
val dataModule = module {
    /* 其他定义 (Other definitions) 在这里。*/
}
val domainModule = module {
    /* 其他定义 (Other definitions) 在这里。*/
}
val featureModule1 = module {
    includes(domainModule, dataModule)
}
val featureModule2 = module {
    includes(domainModule, dataModule)
}
```

```kotlin
// `:app` module
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // ...

            // 加载模块 (Load modules)
             modules(featureModule1, featureModule2)
        }
        
    }
}
```

请注意，所有模块将仅包含一次：`dataModule`，`domainModule`，`featureModule1`，`featureModule2`。

## 通过后台模块加载减少启动时间

你现在可以声明“延迟加载（lazy）” Koin 模块，以避免触发任何资源的预分配，并在 Koin 启动时在后台加载它们。 这可以通过传递要在后台加载的延迟加载模块来帮助避免阻止 Android 启动过程。

- `lazyModule` - 声明 Koin 模块的延迟 Kotlin 版本
- `Module.includes` - 允许包含延迟加载模块
- `KoinApplication.lazyModules` - 使用协程在后台加载延迟加载模块，具体取决于平台默认的 Dispatchers
- `Koin.waitAllStartJobs` - 等待启动作业完成
- `Koin.runOnKoinStarted` - 在启动完成后运行块代码

一个好的例子总是更容易理解：

```kotlin

// 延迟加载 (Lazy loaded) 模块
val m2 = lazyModule {
    singleOf(::ClassB)
}

val m1 = module {
    singleOf(::ClassA) { bind<IClassA>() }
}

startKoin {
    // 同步模块加载 (sync module loading)
    modules(m1)
    // 在后台加载延迟加载模块 (load lazy Modules in background)
    lazyModules(m2)
}

val koin = KoinPlatform.getKoin()

// 等待启动完成 (wait for start completion)
koin.waitAllStartJobs()

// 或在启动后运行代码 (or run code after start)
koin.runOnKoinStarted { koin ->
    // 在后台加载完成后运行 (run after background load complete)
}
```
