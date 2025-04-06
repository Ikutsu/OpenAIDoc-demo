---
title: Koin DSL
---
Kotlin 언어의 강력한 기능 덕분에 Koin은 앱을 설명하기 위해 DSL을 제공하며, 어노테이션을 사용하거나 코드를 생성하는 대신에 DSL을 사용할 수 있습니다. Koin은 Kotlin DSL을 통해 의존성 주입을 준비하기 위한 스마트한 기능 API를 제공합니다.

## Application & Module DSL

Koin은 Koin 애플리케이션의 요소를 설명할 수 있도록 다음과 같은 여러 키워드를 제공합니다.

- Application DSL: Koin 컨테이너 구성을 설명합니다.
- Module DSL: 주입해야 하는 구성 요소를 설명합니다.

## Application DSL

`KoinApplication` 인스턴스는 Koin 컨테이너 인스턴스 구성입니다. 이를 통해 로깅, 속성 로딩 및 모듈을 구성할 수 있습니다.

새로운 `KoinApplication`을 빌드하려면 다음 함수를 사용하십시오.

* `koinApplication { }` - `KoinApplication` 컨테이너 구성을 생성합니다.
* `startKoin { }` - `KoinApplication` 컨테이너 구성을 생성하고 `GlobalContext`에 등록하여 GlobalContext API를 사용할 수 있도록 합니다.

`KoinApplication` 인스턴스를 구성하려면 다음 함수 중 하나를 사용할 수 있습니다.

* `logger( )` - 사용할 로거 구현 및 수준을 설명합니다 (기본적으로 EmptyLogger 사용).
* `modules( )` - 컨테이너에 로드할 Koin 모듈 목록을 설정합니다 (목록 또는 vararg 목록).
* `properties()` - HashMap 속성을 Koin 컨테이너에 로드합니다.
* `fileProperties( )` - 지정된 파일에서 속성을 Koin 컨테이너에 로드합니다.
* `environmentProperties( )` - OS 환경에서 속성을 Koin 컨테이너에 로드합니다.
* `createEagerInstances()` - 즉시 인스턴스를 생성합니다 (`createdAtStart`로 표시된 Single 정의).

## KoinApplication 인스턴스: Global vs Local

위에서 볼 수 있듯이 Koin 컨테이너 구성은 `koinApplication` 또는 `startKoin` 함수 두 가지 방법으로 설명할 수 있습니다.

- `koinApplication`은 Koin 컨테이너 인스턴스를 설명합니다.
- `startKoin`은 Koin 컨테이너 인스턴스를 설명하고 Koin `GlobalContext`에 등록합니다.

컨테이너 구성을 `GlobalContext`에 등록하면 전역 API가 직접 사용할 수 있습니다. 모든 `KoinComponent`는 `Koin` 인스턴스를 참조합니다. 기본적으로 `GlobalContext`의 인스턴스를 사용합니다.

자세한 내용은 Custom Koin instance 장을 확인하십시오.

## Starting Koin

Koin을 시작한다는 것은 `KoinApplication` 인스턴스를 `GlobalContext`에서 실행하는 것을 의미합니다.

모듈을 사용하여 Koin 컨테이너를 시작하려면 다음과 같이 `startKoin` 함수를 사용하면 됩니다.

```kotlin
// start a KoinApplication in Global context
startKoin {
    // declare used logger
    logger()
    // declare used modules
    modules(coffeeAppModule)
}
```

## Module DSL

Koin 모듈은 애플리케이션에 주입/결합할 정의를 수집합니다. 새 모듈을 만들려면 다음 함수를 사용하십시오.

* `module { // module content }` - Koin 모듈을 생성합니다.

모듈에서 콘텐츠를 설명하려면 다음 함수를 사용할 수 있습니다.

* `factory { //definition }` - 팩토리 빈 정의를 제공합니다.
* `single { //definition  }` - 싱글톤 빈 정의를 제공합니다 (`bean`으로도 별칭이 지정됨).
* `get()` - 구성 요소 종속성을 해결합니다 (이름, 스코프 또는 매개 변수를 사용할 수도 있음).
* `bind()` - 주어진 빈 정의에 바인딩할 유형을 추가합니다.
* `binds()` - 주어진 빈 정의에 대한 유형 배열을 추가합니다.
* `scope { // scope group }` - `scoped` 정의에 대한 논리적 그룹을 정의합니다.
* `scoped { //definition }` - 스코프에만 존재하는 빈 정의를 제공합니다.

참고: `named()` 함수를 사용하면 문자열, 열거형 또는 유형으로 한정자를 지정할 수 있습니다. 정의에 이름을 지정하는 데 사용됩니다.

### Writing a module

Koin 모듈은 *모든 구성 요소를 선언하는 공간*입니다. `module` 함수를 사용하여 Koin 모듈을 선언합니다.

```kotlin
val myModule = module {
   // your dependencies here
}
```

이 모듈에서는 아래 설명된 대로 구성 요소를 선언할 수 있습니다.

### withOptions - DSL 옵션 (3.2부터)

새로운 [Constructor DSL](./dsl-update.md) 정의와 마찬가지로 `withOptions` 연산자를 사용하여 "일반" 정의에 대한 정의 옵션을 지정할 수 있습니다.

```kotlin
module {
    single { ClassA(get()) } withOptions { 
        named("qualifier")
        createdAtStart()
    }
}
```

이 옵션 람다 내에서 다음 옵션을 지정할 수 있습니다.

* `named("a_qualifier")` - 정의에 문자열 한정자를 제공합니다.
* `named<MyType>()` - 정의에 유형 한정자를 제공합니다.
* `bind<MyInterface>()` - 주어진 빈 정의에 바인딩할 유형을 추가합니다.
* `binds(arrayOf(...))` - 주어진 빈 정의에 대한 유형 배열을 추가합니다.
* `createdAtStart()` - Koin 시작 시 단일 인스턴스를 생성합니다.
