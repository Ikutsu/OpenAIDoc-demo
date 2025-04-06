---
title: Dependency Injection in Ktor
---
```markdown
`koin-ktor` 模組專門為 Ktor 引入依賴注入（Dependency Injection）。

## 安裝 Koin 插件（Plugin）

若要在 Ktor 中啟動 Koin 容器（Container），只需如下安裝 `Koin` 插件（Plugin）：

```kotlin
fun Application.main() {
    // 安裝 Koin
    install(Koin) {
        slf4jLogger()
        modules(helloAppModule)
    }

}
```

## 在 Ktor 中注入（Inject）

Koin 的 `inject()` 和 `get()` 函式可從 `Application`、`Route`、`Routing` 類別中使用：

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

### 從 Ktor 請求作用域（Request Scope）解析 (自 4.1.0 起)

您可以宣告元件存在於 Ktor 請求作用域（Request Scope）的時間軸內。為此，您只需要在 `requestScope` 區段內宣告您的元件。假設有一個 `ScopeComponent` 類別要在 ktor web 請求作用域上實例化，讓我們宣告它：

```kotlin
requestScope {
    scopedOf(::ScopeComponent)
}
```

然後從您的 http 呼叫中，只需呼叫 `call.scope.get()` 來解析正確的依賴項：

```kotlin
routing {
    get("/hello") {
        val component = call.scope.get<ScopeComponent>()
        // ... 
    }
}
```

:::note
對於每個新請求，作用域（Scope）都會被重新建立。這會為每個請求建立和丟棄作用域（Scope）實例
:::


### 從外部 Ktor 模組執行 Koin

對於 Ktor 模組，您可以載入特定的 Koin 模組。只需使用 `koin { }` 函式宣告它們：


```kotlin
fun Application.module2() {

    koin {
        // 載入 koin 模組
        modules(appModule2)
    }

}
```

### Ktor 事件（Events）

您可以監聽 KTor Koin 事件（Events）：

```kotlin
fun Application.main() {
    // ...

    // 安裝 Ktor 功能（Features）
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
