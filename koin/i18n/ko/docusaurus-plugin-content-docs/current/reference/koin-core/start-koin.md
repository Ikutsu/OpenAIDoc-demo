---
title: Start Koin
---
```markdown
Koin은 DSL(Domain Specific Language), 경량 컨테이너 및 실용적인 API입니다. Koin 모듈 내에서 정의를 선언했으면 Koin 컨테이너를 시작할 준비가 된 것입니다.

### startKoin 함수

`startKoin` 함수는 Koin 컨테이너를 시작하는 주요 진입점입니다. 실행하려면 *Koin 모듈 목록*이 필요합니다.
모듈이 로드되고 정의는 Koin 컨테이너에 의해 해석될 준비가 됩니다.

.Koin 시작
```kotlin
// Global context에서 KoinApplication 시작
startKoin {
    // 사용된 모듈 선언
    modules(coffeeAppModule)
}
```

`startKoin`이 호출되면 Koin은 모든 모듈 및 정의를 읽습니다. 그런 다음 Koin은 필요한 인스턴스를 검색하기 위해 `get()` 또는 `by inject()` 호출을 할 준비가 됩니다.

Koin 컨테이너에는 다음과 같은 여러 옵션이 있습니다.

* `logger` - 로깅을 활성화하려면 - <<logging.adoc#_logging,logging>> 섹션을 참조하십시오.
* `properties()`, `fileProperties()` 또는 `environmentProperties()` - 환경, koin.properties 파일, 추가 속성에서 속성을 로드하려면 ... - <<properties.adoc#_lproperties,properties>> 섹션을 참조하십시오.


:::info
`startKoin`은 두 번 이상 호출할 수 없습니다. 모듈을 로드하기 위해 여러 지점이 필요한 경우 `loadKoinModules` 함수를 사용하십시오.
:::

### 시작 뒤에 숨겨진 것 - 내부의 Koin 인스턴스

Koin을 시작할 때 Koin 컨테이너 구성 인스턴스를 나타내는 `KoinApplication` 인스턴스를 만듭니다. 시작되면 모듈 및 옵션의 결과인 `Koin` 인스턴스가 생성됩니다.
이 `Koin` 인스턴스는 `KoinComponent` 클래스에서 사용하기 위해 `GlobalContext`에 의해 유지됩니다.

`GlobalContext`는 Koin의 기본 JVM 컨텍스트 전략입니다. `startKoin`에 의해 호출되고 `GlobalContext`에 등록됩니다. 이를 통해 Koin Multiplatform의 관점에서 다른 종류의 컨텍스트를 등록할 수 있습니다.

### startKoin 이후 모듈 로드

`startKoin` 함수를 두 번 이상 호출할 수 없습니다. 그러나 `loadKoinModules()` 함수를 직접 사용할 수 있습니다.

이 함수는 Koin을 사용하려는 SDK 제작자에게 유용합니다. `starKoin()` 함수를 사용할 필요 없이 라이브러리 시작 시 `loadKoinModules`를 사용할 수 있기 때문입니다.

```kotlin
loadKoinModules(module1,module2 ...)
```

### 모듈 언로드

일련의 정의를 언로드한 다음 지정된 함수를 사용하여 해당 인스턴스를 해제할 수도 있습니다.

```kotlin
unloadKoinModules(module1,module2 ...)
```


### Koin 중지 - 모든 리소스 닫기

모든 Koin 리소스를 닫고 인스턴스 및 정의를 삭제할 수 있습니다. 이를 위해 어디에서나 `stopKoin()` 함수를 사용하여 Koin `GlobalContext`를 중지할 수 있습니다.
또는 `KoinApplication` 인스턴스에서 `close()`를 호출하십시오.


## 로깅 (Logging)

Koin에는 모든 Koin 활동(할당, 조회 등)을 기록하는 간단한 로깅 API가 있습니다. 로깅 API는 아래 클래스로 표시됩니다.

Koin 로거 (Logger)

```kotlin
abstract class Logger(var level: Level = Level.INFO) {

    abstract fun log(level: Level, msg: MESSAGE)

    fun debug(msg: MESSAGE) {
        log(Level.DEBUG, msg)
    }

    fun info(msg: MESSAGE) {
        log(Level.INFO, msg)
    }

    fun error(msg: MESSAGE) {
        log(Level.ERROR, msg)
    }
}
```

Koin은 대상 플랫폼에 따라 몇 가지 로깅 구현을 제안합니다.

* `PrintLogger` - 콘솔에 직접 기록합니다(`koin-core`에 포함됨).
* `EmptyLogger` - 아무것도 기록하지 않습니다(`koin-core`에 포함됨).
* `SLF4JLogger` - SLF4J로 기록합니다. ktor 및 spark에서 사용됩니다(`koin-logger-slf4j` 프로젝트).
* `AndroidLogger` - Android Logger에 기록합니다(`koin-android`에 포함됨).

### 시작 시 로깅 설정

기본적으로 Koin은 `EmptyLogger`를 사용합니다. 다음과 같이 `PrintLogger`를 직접 사용할 수 있습니다.

```kotlin
startKoin {
    logger(LEVEL.INFO)
}
```


## 속성 (Properties) 로드

시작 시 여러 유형의 속성을 로드할 수 있습니다.

* 환경 속성 - *시스템* 속성을 로드합니다.
* koin.properties 파일 - `/src/main/resources/koin.properties` 파일에서 속성을 로드합니다.
* "추가" 시작 속성 - `startKoin` 함수에 전달된 값의 맵입니다.

### 모듈에서 속성 읽기

Koin 시작 시 속성을 로드해야 합니다.

```kotlin
startKoin {
    // 기본 위치에서 속성 로드
    // (예: `/src/main/resources/koin.properties`)
    fileProperties()
}
```

Koin 모듈에서 키로 속성을 가져올 수 있습니다.

/src/main/resources/koin.properties 파일에서
```java
// 키 (Key) - 값 (Value)
server_url=http://service_url
```

`getProperty` 함수로 로드하십시오.

```kotlin
val myModule = module {

    // "server_url" 키를 사용하여 해당 값을 검색합니다.
    single { MyService(getProperty("server_url")) }
}
```
