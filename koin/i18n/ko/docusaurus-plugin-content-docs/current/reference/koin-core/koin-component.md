---
title: Koin Component
---
```markdown
Koin은 모듈 및 정의를 설명하는 DSL이며, 정의 해결을 수행하는 컨테이너입니다. 이제 컨테이너 외부에서 인스턴스를 검색하는 API가 필요합니다. 이것이 Koin 컴포넌트의 목표입니다.

:::info
 `KoinComponent` 인터페이스는 Koin에서 직접 인스턴스를 검색하는 데 도움을 주기 위해 존재합니다. 이 인터페이스를 사용하면 클래스가 Koin 컨테이너 API에 연결되므로 주의해야 합니다. `modules`에서 선언할 수 있는 클래스에서는 사용하지 말고 생성자 주입을 사용하는 것이 좋습니다.
:::

## Koin 컴포넌트 생성

클래스에 Koin 기능을 사용할 수 있는 기능을 부여하려면 `KoinComponent` 인터페이스로 *태그 지정*해야 합니다. 예를 들어 보겠습니다.

MyService 인스턴스를 정의하는 모듈
```kotlin
class MyService

val myModule = module {
    // MyService에 대한 싱글톤 정의
    single { MyService() }
}
```

정의를 사용하기 전에 Koin을 시작합니다.

myModule로 Koin 시작

```kotlin
fun main(vararg args : String){
    // Koin 시작
    startKoin {
        modules(myModule)
    }

    // MyComponent 인스턴스 생성 및 Koin 컨테이너에서 주입
    MyComponent()
}
```

다음은 Koin 컨테이너에서 인스턴스를 검색하기 위해 `MyComponent`를 작성하는 방법입니다.

get() 및 by inject()를 사용하여 MyService 인스턴스 주입

```kotlin
class MyComponent : KoinComponent {

    // Koin 인스턴스를 지연 주입
    val myService : MyService by inject()

    // 또는
    // Koin 인스턴스를 즉시 주입
    val myService : MyService = get()
}
```

## KoinComponents로 Koin API 잠금 해제

클래스를 `KoinComponent`로 태그하면 다음과 같은 기능에 액세스할 수 있습니다.

* `by inject()` - Koin 컨테이너에서 지연 평가된 인스턴스
* `get()` - Koin 컨테이너에서 즉시 가져온 인스턴스
* `getProperty()`/`setProperty()` - 속성 가져오기/설정


## get 및 inject를 사용하여 정의 검색

Koin은 Koin 컨테이너에서 인스턴스를 검색하는 두 가지 방법을 제공합니다.

* `val t : T by inject()` - 지연 평가된 위임된 인스턴스
* `val t : T = get()` - 인스턴스에 대한 즉시 액세스

```kotlin
// 지연 평가됩니다.
val myService : MyService by inject()

// 인스턴스를 직접 검색합니다.
val myService : MyService = get()
```

:::note
 지연 주입 방식은 지연 평가가 필요한 속성을 정의하는 데 더 좋습니다.
:::

## 이름으로 인스턴스 확인

필요한 경우 `get()` 또는 `by inject()`로 다음 매개변수를 지정할 수 있습니다.

* `qualifier` - 정의 이름 (정의에서 name 매개변수를 지정한 경우)

정의 이름을 사용하는 모듈의 예:

```kotlin
val module = module {
    single(named("A")) { ComponentA() }
    single(named("B")) { ComponentB(get()) }
}

class ComponentA
class ComponentB(val componentA: ComponentA)
```

다음과 같은 해결 방법을 만들 수 있습니다.

```kotlin
// 주어진 모듈에서 검색
val a = get<ComponentA>(named("A"))
```
