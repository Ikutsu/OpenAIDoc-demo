---
title: Context Isolation
---
## 컨텍스트 격리란 무엇인가?

SDK 제작자의 경우, 글로벌 방식이 아닌 방식으로 Koin을 사용할 수도 있습니다. 라이브러리의 DI에 Koin을 사용하고 컨텍스트를 격리하여 라이브러리 및 Koin을 사용하는 사람들의 충돌을 방지할 수 있습니다.

일반적인 방법으로는 다음과 같이 Koin을 시작할 수 있습니다.

```kotlin
// KoinApplication을 시작하고 글로벌 컨텍스트에 등록합니다.
startKoin {

    // 사용된 모듈을 선언합니다.
    modules(...)
}
```

이렇게 하면 기본 Koin 컨텍스트를 사용하여 종속성을 등록합니다.

그러나 격리된 Koin 인스턴스를 사용하려면 인스턴스를 선언하고 해당 인스턴스를 보관할 클래스에 저장해야 합니다. 라이브러리에서 Koin Application 인스턴스를 사용할 수 있도록 유지하고 사용자 정의 KoinComponent 구현에 전달해야 합니다.

`MyIsolatedKoinContext` 클래스는 여기서 Koin 인스턴스를 보유합니다.

```kotlin
// Koin 인스턴스에 대한 컨텍스트 가져오기
object MyIsolatedKoinContext {

    private val koinApp = koinApplication {
        // 사용된 모듈을 선언합니다.
        modules(coffeeAppModule)
    }

    val koin = koinApp.koin 
}
```

`MyIsolatedKoinContext`를 사용하여 격리된 컨텍스트를 사용할 `IsolatedKoinComponent` 클래스를 정의해 보겠습니다.

```kotlin
internal interface IsolatedKoinComponent : KoinComponent {

    // 기본 Koin 인스턴스 재정의
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin
}
```

모든 준비가 완료되었습니다. `IsolatedKoinComponent`를 사용하여 격리된 컨텍스트에서 인스턴스를 검색하기만 하면 됩니다.

```kotlin
class MyKoinComponent : IsolatedKoinComponent {
    // inject & get은 MyKoinContext를 대상으로 합니다.
}
```

## 테스팅

`by inject()` delegate(위임)를 사용하여 종속성을 검색하는 클래스를 테스트하려면 `getKoin()` 메서드를 재정의하고 사용자 정의 Koin 모듈을 정의합니다.

```kotlin
class MyClassTest : KoinTest {
    // 종속성을 검색하는 데 사용되는 Koin 컨텍스트
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin

    @Before
    fun setUp() {
       // 사용자 정의 Koin 모듈 정의
        val module = module {
            // 종속성 등록
        }

        koin.loadModules(listOf(module))
    }
}
```
