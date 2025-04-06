---
title: Start Koin on Android
---
```markdown
`koin-android` 프로젝트는 Koin의 기능을 Android 세계에 제공하는 데 전념하고 있습니다. 자세한 내용은 [Android 설정](/docs/setup/koin#android) 섹션을 참조하십시오.

## Application 클래스에서

`Application` 클래스에서 `startKoin` 함수를 사용하고 다음과 같이 `androidContext`로 Android 컨텍스트를 주입할 수 있습니다.

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // Android logger에 Koin 로깅
            androidLogger()
            // Android 컨텍스트 참조
            androidContext(this@MainApplication)
            // 모듈 로드
            modules(myAppModules)
        }
    }
}
```

:::info
Application 클래스에서 시작하고 싶지 않은 경우, 어디에서든 Koin을 시작할 수도 있습니다.
:::

다른 Android 클래스에서 Koin을 시작해야 하는 경우, 다음과 같이 `startKoin` 함수를 사용하고 Android `Context` 인스턴스를 제공할 수 있습니다.

```kotlin
startKoin {
    // Android 컨텍스트 주입
    androidContext(/* your android context */)
    // ...
}
```

## 추가 구성

Koin 구성 ( `startKoin { }` 블록 코드)에서 Koin의 여러 부분을 구성할 수도 있습니다.

### Android용 Koin 로깅

`KoinApplication` 인스턴스 내에서 `AndroidLogger()` 클래스를 사용하는 `androidLogger` 확장 함수가 있습니다.
이 로거는 Koin 로거의 Android 구현입니다.

필요에 따라 이 로거를 변경할 수 있습니다.

```kotlin
startKoin {
    // Android 로거 사용 - 기본적으로 Level.INFO
    androidLogger()
    // ...
}
```

### Properties 로딩

`assets/koin.properties` 파일에서 Koin 프로퍼티를 사용하여 키/값을 저장할 수 있습니다.

```kotlin
startKoin {
    // ...
    // assets/koin.properties에서 프로퍼티 사용
    androidFileProperties()   
}
```

## Androidx Startup (4.0.1)으로 Koin 시작 [Experimental]

Gradle 패키지 `koin-androidx-startup`을 사용하여 `KoinStartup` 인터페이스를 사용하여 Application 클래스에서 Koin 구성을 선언할 수 있습니다.

```kotlin
class MainApplication : Application(), KoinStartup {

     override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }

    override fun onCreate() {
        super.onCreate()
    }
}
```

이것은 `onCreate`에서 일반적으로 사용되는 `startKoin` 함수를 대체합니다. `koinConfiguration` 함수는 `KoinConfiguration` 인스턴스를 반환합니다.

:::info
`KoinStartup`은 시작 시 기본 스레드 (main thread) 차단을 피하고 더 나은 성능을 제공합니다.
:::

## Koin으로 시작 종속성 (Startup Dependency)

Koin이 설정되어야 하고 의존성을 주입할 수 있도록 하려면 `Initializer`가 `KoinInitializer`에 의존하도록 할 수 있습니다.

```kotlin
class CrashTrackerInitializer : Initializer<Unit>, KoinComponent {

    private val crashTrackerService: CrashTrackerService by inject()

    override fun create(context: Context) {
        crashTrackerService.configure(context)
    }

    override fun dependencies(): List<Class<out Initializer<*>>> {
        return listOf(KoinInitializer::class.java)
    }

}
```
