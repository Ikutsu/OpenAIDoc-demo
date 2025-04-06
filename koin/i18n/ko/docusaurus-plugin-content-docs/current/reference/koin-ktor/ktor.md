---
title: Dependency Injection in Ktor
---
```markdown
`koin-ktor` 모듈은 Ktor를 위한 의존성 주입을 제공합니다.

## Koin 플러그인 설치

Ktor에서 Koin 컨테이너를 시작하려면 다음과 같이 `Koin` 플러그인을 설치하면 됩니다.

```kotlin
fun Application.main() {
    // Koin 설치
    install(Koin) {
        slf4jLogger()
        modules(helloAppModule)
    }

}
```

## Ktor에서 주입하기

Koin의 `inject()` 및 `get()` 함수는 `Application`, `Route`, `Routing` 클래스에서 사용할 수 있습니다.

```kotlin
fun Application.main() {

    // HelloService 주입
    val service by inject<HelloService>()

    routing {
        get("/hello") {
            call.respondText(service.sayHello())
        }
    }
}
```

### Ktor Request Scope에서 Resolve하기 (4.1.0부터)

Ktor 요청 스코프 타임라인 내에서 작동하는 컴포넌트를 선언할 수 있습니다. 이를 위해 `requestScope` 섹션 내부에 컴포넌트를 선언하기만 하면 됩니다. Ktor 웹 요청 스코프에서 인스턴스화할 `ScopeComponent` 클래스가 주어지면 다음과 같이 선언해 보겠습니다.

```kotlin
requestScope {
    scopedOf(::ScopeComponent)
}
```

그리고 HTTP 호출에서 올바른 종속성을 resolve하기 위해 `call.scope.get()`을 호출합니다.

```kotlin
routing {
    get("/hello") {
        val component = call.scope.get<ScopeComponent>()
        // ... 
    }
}
```

:::note
새로운 요청마다 스코프가 다시 생성됩니다. 이것은 각 요청마다 스코프 인스턴스를 생성하고 삭제합니다.
:::

### 외부 Ktor 모듈에서 Koin 실행

Ktor 모듈의 경우 특정 Koin 모듈을 로드할 수 있습니다. `koin { }` 함수를 사용하여 선언하십시오.

```kotlin
fun Application.module2() {

    koin {
        // koin 모듈 로드
        modules(appModule2)
    }

}
```

### Ktor 이벤트

Ktor Koin 이벤트를 수신할 수 있습니다.

```kotlin
fun Application.main() {
    // ...

    // Ktor 기능 설치
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
