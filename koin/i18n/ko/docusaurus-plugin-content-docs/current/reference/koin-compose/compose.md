---
title: Koin for Jetpack Compose and Compose Multiplatform
---
[Android Jetpack Compose](https://developer.android.com/jetpack/compose) 또는 [Multiplaform Compose](https://www.jetbrains.com/lp/compose-mpp/) 앱에 대한 종속성을 주입하는 방법을 설명합니다.

## Koin Compose Multiplatform vs Koin Android Jetpack Compose

2024년 중반부터 Koin Multiplatform API를 사용하여 Compose 애플리케이션을 만들 수 있습니다. 모든 API는 Koin Jetpack Compose (koin-androidx-compose)와 Koin Compose Multiplatform (koin-compose) 간에 동일합니다.

### Compose용 Koin 패키지?

Android Jetpack Compose API만 사용하는 순수 Android 앱의 경우 다음 패키지를 사용하세요.
- `koin-androidx-compose` - Compose 기본 API + Compose ViewModel API 잠금 해제
- `koin-androidx-compose-navigation` - Navigation API 통합을 사용한 Compose ViewModel API

Android/Multiplatform 앱의 경우 다음 패키지를 사용하세요.
- `koin-compose` - Compose 기본 API
- `koin-compose-viewmodel` - Compose ViewModel API
- `koin-compose-viewmodel-navigation` - Navigation API 통합을 사용한 Compose ViewModel API

## 기존 Koin 컨텍스트에서 다시 시작하기 (Koin이 이미 시작됨)

애플리케이션에서 `startKoin` 함수가 이미 사용되어 애플리케이션에서 Koin을 시작해야 하는 경우가 있습니다 (예: Android 메인 앱 클래스, Application 클래스). 이 경우 `KoinContext` 또는 `KoinAndroidContext`를 사용하여 현재 Koin 컨텍스트에 대한 Compose 애플리케이션에 알려야 합니다. 이러한 함수는 현재 Koin 컨텍스트를 재사용하고 Compose 애플리케이션에 바인딩합니다.

```kotlin
@Composable
fun App() {
    // 현재 Koin 인스턴스를 Compose 컨텍스트에 설정
    KoinContext() {

        MyScreen()
    }
}
```

:::info
`KoinAndroidContext`와 `KoinContext`의 차이점:
- `KoinAndroidContext`는 현재 Android 앱 컨텍스트에서 Koin 인스턴스를 찾습니다.
- `KoinContext`는 현재 GlobalContext에서 Koin 인스턴스를 찾습니다.
:::

:::note
Composable에서 `ClosedScopeException`이 발생하는 경우 Composable에서 `KoinContext`를 사용하거나 [Android 컨텍스트](/docs/reference/koin-android/start.md#from-your-application-class)로 적절한 Koin 시작 구성을 확인하십시오.
:::

## Compose 앱으로 Koin 시작하기 - KoinApplication

`KoinApplication` 함수는 Composable로 Koin 애플리케이션 인스턴스를 만드는 데 도움이 됩니다.

```kotlin
@Composable
fun App() {
    KoinApplication(application = {
        modules(...)
    }) {
        
        // 여기에 화면을 넣으세요 ...
        MyScreen()
    }
}
```

`KoinApplication` 함수는 Compose 컨텍스트의 주기에 따라 Koin 컨텍스트의 시작 및 중지를 처리합니다. 이 함수는 새 Koin 애플리케이션 컨텍스트를 시작하고 중지합니다.

:::info
Android 애플리케이션에서 `KoinApplication`은 구성 변경 또는 Activity 삭제와 관련된 Koin 컨텍스트 중지/다시 시작의 필요성을 처리합니다.
:::

:::note
이것은 기존의 `startKoin` 애플리케이션 함수 사용을 대체합니다.
:::

### Koin을 사용한 Compose 미리보기

`KoinApplication` 함수는 미리보기를 위한 전용 컨텍스트를 시작하는 데 유용합니다. 이것은 Compose 미리보기에 도움이 되는 데에도 사용할 수 있습니다.

```kotlin
@Composable
@Preview
fun App() {
    KoinApplication(application = {
        // 여기에 미리보기 구성을 넣으세요
        modules(previewModule)
    }) {
        // Koin을 사용하여 미리볼 Compose
    }
}
```

## @Composable에 주입하기

Composable 함수를 작성하는 동안 Koin 컨테이너에서 인스턴스를 주입하기 위해 다음 Koin API인 `koinInject()`에 액세스할 수 있습니다.

'MyService' 컴포넌트를 선언하는 모듈의 경우:

```kotlin
val androidModule = module {
    single { MyService() }
    // 또는 생성자 DSL
    singleOf(::MyService)
}
```

다음과 같이 인스턴스를 가져올 수 있습니다.

```kotlin
@Composable
fun App() {
    val myService = koinInject<MyService>()
}
```

Jetpack Compose의 기능적 측면에 맞춰 가장 좋은 작성 방법은 인스턴스를 함수 매개변수에 직접 주입하는 것입니다. 이렇게 하면 Koin으로 기본 구현을 사용할 수 있지만 인스턴스를 원하는 방식으로 주입할 수 있습니다.

```kotlin
@Composable
fun App(myService: MyService = koinInject()) {

}
```

### 매개변수를 사용하여 @Composable에 주입하기

Koin에서 새 종속성을 요청하는 동안 매개변수를 주입해야 할 수 있습니다. 이렇게 하려면 `koinInject` 함수의 `parameters` 매개변수를 `parametersOf()` 함수와 함께 다음과 같이 사용하십시오.

```kotlin
@Composable
fun App() {
    val myService = koinInject<MyService>(parameters = parametersOf("a_string"))
}
```

:::info
`koinInject<MyService>{ parametersOf("a_string") }`와 같은 람다 주입으로 매개변수를 사용할 수 있지만, 주위에서 많이 다시 구성하는 경우 성능에 영향을 미칠 수 있습니다. 람다를 사용하는 이 버전은 매개변수를 기억하지 않도록 호출 시 매개변수를 래핑 해제해야 합니다.

Koin 버전 4.0.2부터 매개변수를 가장 효율적인 방식으로 사용할 수 있도록 koinInject(Qualifier,Scope,ParametersHolder)가 도입되었습니다.
:::

## @Composable용 ViewModel

클래식 single/factory 인스턴스에 액세스할 수 있는 것과 같은 방식으로 다음 Koin ViewModel API에 액세스할 수 있습니다.

* `koinViewModel()` - ViewModel 인스턴스 주입
* `koinNavViewModel()` - ViewModel 인스턴스 + Navigation 인수 데이터 주입 ( `Navigation` API를 사용하는 경우)

'MyViewModel' 컴포넌트를 선언하는 모듈의 경우:

```kotlin
module {
    viewModel { MyViewModel() }
    // 또는 생성자 DSL
    viewModelOf(::MyViewModel)
}
```

다음과 같이 인스턴스를 가져올 수 있습니다.

```kotlin
@Composable
fun App() {
    val vm = koinViewModel<MyViewModel>()
}
```

함수 매개변수에서 인스턴스를 가져올 수 있습니다.

```kotlin
@Composable
fun App(vm : MyViewModel = koinViewModel()) {

}
```

:::note
Lazy API는 jetpack Compose 업데이트에서 지원되지 않습니다.
:::

### @Composable용 ViewModel 및 SavedStateHandle

`SavedStateHandle` 생성자 매개변수를 가질 수 있으며, Compose 환경(Navigation BackStack 또는 ViewModel)에 따라 주입됩니다.
ViewModel `CreationExtras` 또는 Navigation `BackStackEntry`를 통해 주입됩니다.

```kotlin
// Navhost에서 objectId 인수 설정
NavHost(
    navController,
    startDestination = "list"
) {
    composable("list") { backStackEntry ->
        //...
    }
    composable("detail/{objectId}") { backStackEntry ->
        val objectId = backStackEntry.arguments?.getString("objectId")?.toInt()
        DetailScreen(navController, objectId!!)
    }
}

// ViewModel에 주입된 인수
class DetailViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    init {
        println("$this - objectId: ${savedStateHandle.get<String>("objectId")}")
    }
}
```

:::note
SavedStateHandle 주입 차이점에 대한 자세한 내용: https://github.com/InsertKoinIO/koin/issues/1935#issuecomment-2362335705
:::

## Composable에 연결된 모듈 로드 및 언로드

Koin은 주어진 Composable 함수에 대한 특정 모듈을 로드하는 방법을 제공합니다. `rememberKoinModules` 함수는 Koin 모듈을 로드하고 현재 Composable에 기억합니다.

```kotlin
@Composable
@Preview
fun MyComponentComposable() {
    // 이 컴포넌트의 첫 번째 호출 시 모듈 로드
    rememberKoinModules(myModule)
}
```

포기 함수 중 하나를 사용하여 2가지 측면에서 모듈을 언로드할 수 있습니다.
- onForgotten - 구성이 삭제된 후
- onAbandoned - 구성이 실패했습니다.

이를 위해 `rememberKoinModules`에 대해 `unloadOnForgotten` 또는 `unloadOnAbandoned` 인수를 사용하십시오.

## Composable로 Koin Scope 만들기

Composable 함수 `rememberKoinScope` 및 `KoinScope`를 사용하면 Composable에서 Koin Scope를 처리하고 Composable이 끝나면 현재 스코프를 닫도록 따라갈 수 있습니다.

:::info
이 API는 아직 불안정합니다.
:::
