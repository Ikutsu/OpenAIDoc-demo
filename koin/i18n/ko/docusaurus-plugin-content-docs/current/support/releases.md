---
title: Releases & API Compatibility Guide
custom_edit_url: null
---
n
:::info
이 페이지는 모든 Koin 주요 릴리스에 대한 포괄적인 개요를 제공하며, 업그레이드를 계획하고 호환성을 유지하는 데 도움이 되도록 프레임워크의 발전을 자세히 설명합니다.
:::

각 버전별로 문서는 다음과 같은 섹션으로 구성됩니다.

- `Kotlin`: 릴리스에 사용된 Kotlin 버전을 지정하여 언어 호환성을 명확히 하고 최신 Kotlin 기능을 활용할 수 있도록 합니다.
- `New`: 새로운 기능과 개선 사항을 강조하여 기능과 개발자 경험을 향상시킵니다.
- `Experimental`: 실험적인 것으로 표시된 API 및 기능을 나열합니다. 이는 활발히 개발 중이며 커뮤니티 피드백에 따라 변경될 수 있습니다.
- `Deprecated`: 더 이상 사용되지 않도록 표시된 API 및 기능과 함께 권장되는 대체 방법에 대한 지침을 제공하여 향후 제거에 대비할 수 있도록 합니다.
- `Breaking`: 이전 버전과의 호환성이 깨질 수 있는 변경 사항을 자세히 설명하여 마이그레이션 중에 필요한 조정을 알 수 있도록 합니다.

이 구조화된 접근 방식은 각 릴리스의 점진적인 변경 사항을 명확히 할 뿐만 아니라 Koin 프로젝트의 투명성, 안정성 및 지속적인 개선에 대한 약속을 강화합니다.

## 4.0.3

:::note
Kotlin `2.0.21` 사용
:::

사용된 모든 라이브러리 버전은 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/main/projects/gradle/libs.versions.toml)에 있습니다.

### New 🎉

`koin-core`
- `KoinPlatformTools.generateId()` - 이 새로운 Kotlin 버전에서는 새로운 `kotlin.uuid.uuid` API를 활용합니다. `KoinPlatformTools.generateId()` Koin 함수는 이제 이 새로운 API를 사용하여 플랫폼 전반에서 실제 UUID를 생성합니다.

`koin-viewmodel`
 - Koin 4.0은 Google/Jetbrains KMP API를 상호 공유하는 새로운 ViewModel DSL & API를 도입합니다. 코드베이스에서 중복을 피하기 위해 ViewModel API는 이제 `koin-core-viewmodel` & `koin-core-viewmodel-navigation` 프로젝트에 있습니다.
 - ViewModel DSL에 대한 Import는 `org.koin.core.module.dsl.*`입니다.

주어진 프로젝트의 다음 API는 이제 안정적입니다.

`koin-core-coroutines` - 모든 API가 이제 안정적입니다.
  - 모든 `lazyModules`
  - `awaitAllStartJobs`, `onKoinStarted`, `isAllStartedJobsDone`
  - `waitAllStartJobs`, `runOnKoinStarted`
  - `KoinApplication.coroutinesEngine`
  - `Module.includes(lazy)`
  - `lazyModule()`
  - `KoinPlatformCoroutinesTools`

### Experimental 🚧

`koin-test`
- `ParameterTypeInjection` - `Verify` API에 대한 동적 매개변수 주입 설계를 돕는 새로운 API

`koin-androidx-startup`
- `koin-androidx-startup` - `androidx.startup.Initializer` API를 사용하여 `AndroidX Startup`으로 Koin을 시작하는 새로운 기능. `koin-androidx-startup` 내부의 모든 API는 Experimental입니다.

`koin-compose`
- `rememberKoinModules` - @Composable 컴포넌트가 주어지면 Koin 모듈을 로드/언로드합니다.
- `rememberKoinScope` - @Composable 컴포넌트가 주어지면 Koin Scope를 로드/언로드합니다.
- `KoinScope` - 모든 기본 Composable 자식에 대한 Koin scope를 로드합니다.

### Deprecation ⚠️

다음 API는 더 이상 사용되지 않으며 사용해서는 안 됩니다.

- `koin-test`
  - `checkModules`에 대한 모든 API. `Verify` API로 마이그레이션합니다.

- `koin-android`
  - koin-core의 새로운 중앙 집중식 DSL을 선호하는 ViewModel DSL

- `koin-compose-viewmodel`
  - koin-core의 새로운 중앙 집중식 DSL을 선호하는 ViewModel DSL
  - 함수 `koinNavViewModel`은 이제 더 이상 사용되지 않으며 `koinViewModel`을 선호합니다.

### Breaking 💥

다음 API는 마지막 마일스톤에서 더 이상 사용되지 않아 제거되었습니다.

:::note
`@KoinReflectAPI`로 주석 처리된 모든 API가 제거되었습니다.
:::

`koin-core`
  - `ApplicationAlreadyStartedException`이 `KoinApplicationAlreadyStartedException`으로 이름이 변경되었습니다.
  - `KoinScopeComponent.closeScope()`가 더 이상 내부적으로 사용되지 않아 제거되었습니다.
  - 내부 `ResolutionContext`를 이동하여 `InstanceContext`를 대체했습니다.
  - `KoinPlatformTimeTools`, `Timer`, `measureDuration`이 제거되어 대신 Kotlin Time API를 사용합니다.
  - `KoinContextHandler`가 `GlobalContext`를 선호하여 제거되었습니다.

`koin-android`
  - 모든 상태 ViewModel API가 오류 수준에서 더 이상 사용되지 않습니다.
    - `stateViewModel()`,`getStateViewModel()`, 대신 `viewModel()`을 사용합니다.
    - `getSharedStateViewModel()`, `sharedStateViewModel()`, 대신 공유 인스턴스에 대해 `viewModel()` 또는 `activityViewModel()`을 사용합니다.
  - 함수 `fun Fragment.createScope()`가 제거되었습니다.
  - ViewModel 팩터리 주변의 모든 API (주로 내부)가 새로운 내부를 위해 재작업되었습니다.

`koin-compose`
  - 이전 compose API 함수는 오류 수준에서 더 이상 사용되지 않습니다.
    - 함수 `inject()`는 `koinInject()`를 선호하여 제거되었습니다.
    - 함수 `getViewModel()`은 `koinViewModel()`을 선호하여 제거되었습니다.
    - 함수 `rememberKoinInject()`가 `koinInject()`로 이동되었습니다.
  - 더 이상 내부적으로 사용되지 않으므로 `StableParametersDefinition`이 제거되었습니다.
  - 모든 Lazy ViewModel API - 이전 `viewModel()`이 제거되었습니다.
  - 더 이상 내부적으로 사용되지 않으므로 `rememberStableParametersDefinition()`이 제거되었습니다.

## 3.5.6

:::note
Kotlin `1.9.22` 사용
:::

사용된 모든 라이브러리 버전은 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml)에 있습니다.

### New 🎉

`koin-core`
  - `KoinContext`에는 이제 다음이 있습니다.
    - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
    - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
  - `koinApplication()` 함수는 이제 여러 형식을 사용합니다.
    - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
    - `koinApplication(appDeclaration: KoinAppDeclaration?)`
    - `koinApplication(createEagerInstances: Boolean)`
  - 선언 스타일을 여는 데 도움이 되는 `KoinAppDeclaration`
  - JS에 대한 API Time을 사용하는 `KoinPlatformTimeTools`
  - iOS - Touchlab Lockable API를 사용하는 `synchronized` API

`koin-androidx-compose`
  - Android 환경에서 현재 Koin 컨텍스트에 바인딩하는 새로운 `KoinAndroidContext`

`koin-compose`
  - 현재 기본 컨텍스트로 `KoinContext` 컨텍스트 시작기

`koin-ktor`
  - 이제 Ktor 인스턴스에 대해 격리된 컨텍스트를 사용합니다 (`Application.getKoin()`을 기본 컨텍스트 대신 사용).
  - Koin 플러그인은 새로운 모니터링을 도입합니다.
  - Ktor 요청에 scope 인스턴스를 허용하는 `RequestScope`

### Experimental 🚧

`koin-android`
  - `ViewModelScope`는 ViewModel scope에 대한 실험적 API를 도입합니다.

`koin-core-coroutines` - 백그라운드에서 모듈을 로드하는 새로운 API를 도입합니다.

### Deprecation ⚠️

`koin-android`
  - `getLazyViewModelForClass()` API는 매우 복잡하고 기본 글로벌 컨텍스트를 호출합니다. Android/Fragment API를 사용하는 것이 좋습니다.
  - `resolveViewModelCompat()`는 `resolveViewModel()`을 선호하여 더 이상 사용되지 않습니다.

`koin-compose`
  - 함수 `get()` 및 `inject()`는 `koinInject()`를 선호하여 더 이상 사용되지 않습니다.
  - 함수 `getViewModel()`은 `koinViewModel()`을 선호하여 더 이상 사용되지 않습니다.
  - 함수 `rememberKoinInject()`는 `koinInject()`에 대해 더 이상 사용되지 않습니다.

### Breaking 💥

`koin-core`
  - `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances : Boolean = false)`는 `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)`를 대체합니다.
  - 속성 `KoinExtension.koin`을 함수 `KoinExtension.onRegister()`로 이동했습니다.
  - iOS - `MutableGlobalContext`를 사용하는 `internal fun globalContextByMemoryModel(): KoinContext`

`koin-compose`
  - 함수 `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)`는 `KoinContext` 및 `KoinAndroidContext`를 선호하여 제거되었습니다.

## 3.4.3

:::note
Kotlin `1.8.21` 사용
:::

### New 🎉

`koin-core`
  - Koin에 대한 확장 엔진 작성을 돕는 새로운 ExtensionManager API - `ExtensionManager` + `KoinExtension`
  - `parameterArrayOf` & `parameterSetOf`를 사용한 Parameters API 업데이트

`koin-test`
  - 모듈에서 `verify`를 실행하는 데 도움이 되는 `Verification` API

`koin-android`
  - ViewModel 주입에 대한 내부
  - `AndroidScopeComponent.onCloseScope()` 함수 콜백 추가

`koin-android-test`
  - 모듈에서 `androidVerify()`를 실행하는 데 도움이 되는 `Verification` API

`koin-androidx-compose`
  - 새로운 `get()`
  - 새로운 `getViewModel()`
  - 새로운 Scopes `KoinActivityScope`, `KoinFragmentScope`

`koin-androidx-compose-navigation` - 탐색을 위한 새로운 모듈
  - 새로운 `koinNavViewModel()`

`koin-compose` - Compose를 위한 새로운 멀티 플랫폼 API
  - `koinInject`, `rememberKoinInject`
  - `KoinApplication`

### Experimental 🚧

`koin-compose` - Compose를 위한 새로운 Experimental 멀티 플랫폼 API
  - `rememberKoinModules`
  - `KoinScope`, `rememberKoinScope`

### Deprecation ⚠️

`koin-compose`
- Lazy 함수를 피하기 위해 `inject()` 사용을 대체하는 함수 `get()`
- Lazy 함수를 피하기 위해 `viewModel()` 함수 사용을 대체하는 함수 `getViewModel()`

### Breaking 💥

`koin-android`
  - `LifecycleScopeDelegate`가 이제 제거되었습니다.

`koin-androidx-compose`
  - `koinViewModel`을 선호하여 `getStateViewModel`이 제거되었습니다.