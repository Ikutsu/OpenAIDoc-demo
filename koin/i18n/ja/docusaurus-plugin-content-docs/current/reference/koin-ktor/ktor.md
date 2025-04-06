---
title: Dependency Injection in Ktor
---
n
`koin-ktor` モジュールは、Ktor に依存性注入 (Dependency Injection) を提供することに特化しています。

## Koin プラグインのインストール

Ktor で Koin コンテナを開始するには、次のように `Koin` プラグインをインストールします。

```kotlin
fun Application.main() {
    // Koin のインストール
    install(Koin) {
        slf4jLogger()
        modules(helloAppModule)
    }

}
```

## Ktor での注入 (Inject)

Koin の `inject()` および `get()` 関数は、`Application`、`Route`、`Routing` クラスから利用できます。

```kotlin
fun Application.main() {

    // HelloService の注入
    val service by inject<HelloService>()

    routing {
        get("/hello") {
            call.respondText(service.sayHello())
        }
    }
}
```

### Ktor Request Scope からの解決 (Resolve) (4.1.0 以降)

Ktor リクエストスコープのタイムライン内で生存するコンポーネントを宣言できます。 これを行うには、`requestScope` セクション内でコンポーネントを宣言するだけです。 Ktor Web リクエストスコープでインスタンス化する `ScopeComponent` クラスを指定して、それを宣言しましょう。

```kotlin
requestScope {
    scopedOf(::ScopeComponent)
}
```

そして、HTTP 呼び出しから、`call.scope.get()` を呼び出して、適切な依存関係を解決します。

```kotlin
routing {
    get("/hello") {
        val component = call.scope.get<ScopeComponent>()
        // ... 
    }
}
```

:::note
新しいリクエストごとに、スコープが再作成されます。 これにより、リクエストごとにスコープインスタンスが作成およびドロップされます。
:::

### 外部の Ktor モジュールから Koin を実行する

Ktor モジュールの場合、特定の Koin モジュールをロードできます。 `koin { }` 関数でそれらを宣言するだけです。

```kotlin
fun Application.module2() {

    koin {
        // koin モジュールのロード
        modules(appModule2)
    }

}
```

### Ktor イベント

KTor Koin イベントをリッスンできます。

```kotlin
fun Application.main() {
    // ...

    // Ktor features のインストール
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