---
title: Lazy Modules and Background Loading
---
이 섹션에서는 지연 로딩 방식을 사용하여 모듈을 구성하는 방법을 알아봅니다.

## 지연 모듈 정의 [Experimental]

이제 지연 Koin 모듈을 선언하여 리소스의 사전 할당을 방지하고 Koin 시작과 함께 백그라운드에서 로드할 수 있습니다.

- `lazyModule` - Koin 모듈의 지연 Kotlin 버전을 선언합니다.
- `Module.includes` - 지연 모듈을 포함할 수 있습니다.

다음은 이해를 돕기 위한 좋은 예입니다.

```kotlin
// 일부 지연 모듈
val m2 = lazyModule {
    singleOf(::ClassB)
}

// m2 지연 모듈 포함
val m1 = lazyModule {
    includes(m2)
    singleOf(::ClassA) { bind<IClassA>() }
}
```

:::info
    LazyModule은 다음 API에 의해 로드될 때까지 리소스를 트리거하지 않습니다.
:::

## Kotlin 코루틴을 사용한 백그라운드 로딩 [Experimental]

일부 지연 모듈을 선언한 후에는 Koin 구성 등에서 백그라운드에서 로드할 수 있습니다.

- `KoinApplication.lazyModules` - 플랫폼 기본 Dispatchers를 고려하여 코루틴을 사용하여 백그라운드에서 지연 모듈을 로드합니다.
- `Koin.waitAllStartJobs` - 시작 작업이 완료될 때까지 기다립니다.
- `Koin.runOnKoinStarted` - 시작 완료 후 블록 코드를 실행합니다.

다음은 이해를 돕기 위한 좋은 예입니다.

```kotlin
startKoin {
    // 백그라운드에서 지연 모듈 로드
    lazyModules(m1)
}

val koin = KoinPlatform.getKoin()

// 로딩 작업이 완료될 때까지 기다립니다.
koin.waitAllStartJobs()

// 또는 로딩이 완료된 후 코드 실행
koin.runOnKoinStarted { koin ->
    // 백그라운드 로드 완료 후 실행
}
```

:::note
    `lazyModules` 함수를 사용하면 디스패처를 지정할 수 있습니다. `lazyModules(modules, dispatcher = Dispatcher.IO)`
:::

:::info
    코루틴 엔진의 기본 디스패처는 `Dispatchers.Default`입니다.
:::

### 제한 사항 - 모듈/지연 모듈 혼합

현재 시작 시 모듈과 지연 모듈을 혼합하는 것을 권장하지 않습니다. `lazyReporter`에서 `mainModule`에 종속성이 필요한 것을 피하십시오.

```kotlin
startKoin {
    androidLogger()
    androidContext(this@TestApp)
    modules(mainModule)
    lazyModules(lazyReporter)
}
```

:::warning
현재 Koin은 모듈이 지연 모듈에 의존하는지 확인하지 않습니다.
:::
