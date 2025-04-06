---
title: Isolated Context with Compose Applications
---
Compose 애플리케이션을 사용하면 SDK 또는 화이트 라벨 애플리케이션을 처리하기 위해 [격리된 컨텍스트](/docs/reference/koin-core/context-isolation.md)(isolated context)와 동일한 방식으로 작업하여 Koin 정의를 최종 사용자 정의와 혼합하지 않도록 할 수 있습니다.

## 격리된 컨텍스트 정의

먼저 격리된 Koin 인스턴스를 메모리에 저장하기 위해 격리된 컨텍스트 홀더를 선언해 보겠습니다. 이는 다음과 같은 간단한 Object 클래스로 수행할 수 있습니다. `MyIsolatedKoinContext` 클래스는 Koin 인스턴스를 보유하고 있습니다.

```kotlin
object MyIsolatedKoinContext {

    val koinApp = koinApplication {
        // declare used modules
        modules(sdkAppModule)
    }
}
```

:::note
`MyIsolatedKoinContext` 클래스를 초기화 요구 사항에 따라 조정하십시오.
:::

## Compose를 사용하여 격리된 컨텍스트 설정

이제 격리된 Koin 컨텍스트를 정의했으므로 이를 Compose에 설정하여 사용하고 모든 API를 재정의할 수 있습니다. 루트 Compose 함수에서 `KoinIsolatedContext`를 사용하기만 하면 됩니다. 이렇게 하면 Koin 컨텍스트가 모든 하위 컴포저블로 전파됩니다.

```kotlin
@Composable
fun App() {
    // Set current Koin instance to Compose context
    KoinIsolatedContext(context = MyIsolatedKoinContext.koinApp) {

        MyScreen()
    }
}
```

:::info
모든 Koin Compose API는 `KoinIsolatedContext`를 사용한 후 Koi 격리된 컨텍스트를 사용합니다.
:::
