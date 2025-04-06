---
title: "Ktor 中的依赖注入 (Dependency Injection)"
---
`koin-ktor` 模块专门为 Ktor 带来依赖注入功能。

## 安装 Koin 插件

要在 Ktor 中启动 Koin 容器，只需像下面这样安装 `Koin` 插件：

```kotlin
fun Application.main() {
    // 安装 Koin
    install(Koin) {
        slf4jLogger()
        modules(helloAppModule)
    }

}
```

## 在 Ktor 中注入

Koin 的 `inject()` 和 `get()` 函数可以从 `Application`、`Route`、`Routing` 类中使用：

```kotlin
fun Application.main() {

    // 注入 HelloService
    val service by inject<HelloService>()

    routing {
        get("/hello") {
            call.respondText(service.sayHello())
        }
    }
}
```

### 从 Ktor 请求作用域解析 (自 4.1.0 起)

你可以声明组件存在于 Ktor 请求作用域时间线内。 为此，你只需要在 `requestScope` 部分声明你的组件。 给定一个 `ScopeComponent` 类在 ktor web 请求作用域上实例化，让我们声明它：

```kotlin
requestScope {
    scopedOf(::ScopeComponent)
}
```

从你的 http 调用中，只需调用 `call.scope.get()` 即可解析正确的依赖项：

```kotlin
routing {
    get("/hello") {
        val component = call.scope.get<ScopeComponent>()
        // ... 
    }
}
```

:::note
对于每个新请求，作用域将被重新创建。 这会为每个请求创建和删除作用域实例
:::

### 从外部 Ktor 模块运行 Koin

对于 Ktor 模块，你可以加载特定的 Koin 模块。 只需使用 `koin { }` 函数声明它们：

```kotlin
fun Application.module2() {

    koin {
        // 加载 koin 模块
        modules(appModule2)
    }

}
```

### Ktor 事件

你可以监听 KTor Koin 事件：

```kotlin
fun Application.main() {
    // ...

    // 安装 Ktor 功能
    environment.monitor.subscribe(KoinApplicationStarted) {
        log.info("Koin started.")
    }

    environment.monitor.subscribe(KoinApplicationStopPreparing) {
        log.info("Koin stopping...")
    }

    environment.monitor.subscribe(KoinApplicationStopped) {
        log.info("Koin stopped.")
    }

    //...
}
```