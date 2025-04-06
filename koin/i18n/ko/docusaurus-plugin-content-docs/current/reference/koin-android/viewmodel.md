---
title: Android ViewModel & Navigation
---
`koin-android` Gradle 모듈은 `single` 및 `factory`를 보완하는 새로운 `viewModel` DSL 키워드를 도입하여 ViewModel 컴포넌트를 선언하고 Android 컴포넌트 생명주기에 바인딩하는 데 도움을 줍니다. `viewModelOf` 키워드는 생성자를 사용하여 ViewModel을 선언할 수 있도록 지원합니다.

```kotlin
val appModule = module {

    // ViewModel for Detail View
    viewModel { DetailViewModel(get(), get()) }

    // or directly with constructor
    viewModelOf(::DetailViewModel)

}
```

선언된 컴포넌트는 최소한 `android.arch.lifecycle.ViewModel` 클래스를 확장해야 합니다. 클래스의 *생성자(constructor)*를 주입하는 방법을 지정하고 `get()` 함수를 사용하여 종속성을 주입할 수 있습니다.

:::info
`viewModel`/`viewModelOf` 키워드는 ViewModel의 팩토리 인스턴스를 선언하는 데 도움이 됩니다. 이 인스턴스는 내부 ViewModelFactory에서 처리되며 필요한 경우 ViewModel 인스턴스를 다시 연결합니다. 또한 파라미터를 주입할 수 있습니다.
:::

## ViewModel 주입하기

`Activity`, `Fragment` 또는 `Service`에서 ViewModel을 주입하려면 다음을 사용하십시오.

* `by viewModel()` - ViewModel을 속성에 주입하는 지연 델리게이트 속성
* `getViewModel()` - ViewModel 인스턴스를 직접 가져오기

```kotlin
class DetailActivity : AppCompatActivity() {

    // Lazy inject ViewModel
    val detailViewModel: DetailViewModel by viewModel()
}
```

:::note
ViewModel 키는 Key 및/또는 Qualifier에 대해 계산됩니다.
:::

## Activity 공유 ViewModel

하나의 ViewModel 인스턴스를 Fragments와 해당 호스트 Activity 간에 공유할 수 있습니다.

`Fragment`에서 *공유된* ViewModel을 주입하려면 다음을 사용하십시오.

* `by activityViewModel()` - 공유 ViewModel 인스턴스를 속성에 주입하는 지연 델리게이트 속성
* `getActivityViewModel()` - 공유 ViewModel 인스턴스를 직접 가져오기

:::note
`sharedViewModel`은 더 이상 사용되지 않으며 `activityViewModel()` 함수를 사용하는 것이 좋습니다. 후자의 이름이 더 명확합니다.
:::

ViewModel을 한 번만 선언하십시오.

```kotlin
val weatherAppModule = module {

    // WeatherViewModel declaration for Weather View components
    viewModel { WeatherViewModel(get(), get()) }
}
```

참고: ViewModel의 Qualifier는 ViewModel의 Tag로 처리됩니다.

그리고 Activity 및 Fragments에서 재사용하십시오.

```kotlin
class WeatherActivity : AppCompatActivity() {

    /*
     * Declare WeatherViewModel with Koin and allow constructor dependency injection
     */
    private val weatherViewModel by viewModel<WeatherViewModel>()
}

class WeatherHeaderFragment : Fragment() {

    /*
     * Declare shared WeatherViewModel with WeatherActivity
     */
    private val weatherViewModel by activityViewModel<WeatherViewModel>()
}

class WeatherListFragment : Fragment() {

    /*
     * Declare shared WeatherViewModel with WeatherActivity
     */
    private val weatherViewModel by activityViewModel<WeatherViewModel>()
}
```

## 생성자에 파라미터 전달하기

`viewModel` 키워드 및 주입 API는 주입 파라미터와 호환됩니다.

모듈에서:

```kotlin
val appModule = module {

    // ViewModel for Detail View with id as parameter injection
    viewModel { parameters -> DetailViewModel(id = parameters.get(), get(), get()) }
    // ViewModel for Detail View with id as parameter injection, resolved from graph
    viewModel { DetailViewModel(get(), get(), get()) }
    // or Constructor DSL
    viewModelOf(::DetailViewModel)
}
```

주입 호출 사이트에서:

```kotlin
class DetailActivity : AppCompatActivity() {

    val id : String // id of the view

    // Lazy inject ViewModel with id parameter
    val detailViewModel: DetailViewModel by viewModel{ parametersOf(id)}
}
```

## SavedStateHandle 주입 (3.3.0)

ViewModel 상태를 처리하기 위해 `SavedStateHandle` 형식의 새 속성을 생성자에 추가하십시오.

```kotlin
class MyStateVM(val handle: SavedStateHandle, val myService : MyService) : ViewModel()
```

Koin 모듈에서 `get()` 또는 파라미터로 해결하십시오.

```kotlin
viewModel { MyStateVM(get(), get()) }
```

또는 Constructor DSL로:

```kotlin
viewModelOf(::MyStateVM)
```

`Activity`, `Fragment`에서 *상태(state)* ViewModel을 주입하려면 다음을 사용하십시오.

* `by viewModel()` - 상태 ViewModel 인스턴스를 속성에 주입하는 지연 델리게이트 속성
* `getViewModel()` - 상태 ViewModel 인스턴스를 직접 가져오기

```kotlin
class DetailActivity : AppCompatActivity() {

    // MyStateVM viewModel injected with SavedStateHandle
    val myStateVM: MyStateVM by viewModel()
}
```

:::info
모든 `stateViewModel` 함수는 더 이상 사용되지 않습니다. 일반 `viewModel` 함수를 사용하여 SavedStateHandle을 주입하면 됩니다.
:::

## Navigation Graph ViewModel

ViewModel 인스턴스를 Navigation 그래프로 범위를 지정할 수 있습니다. `by koinNavGraphViewModel()`로 검색하십시오. 그래프 ID만 있으면 됩니다.

```kotlin
class NavFragment : Fragment() {

    val mainViewModel: NavViewModel by koinNavGraphViewModel(R.id.my_graph)

}
```

## ViewModel Scope API

ViewModel 및 스코프에 사용되는 모든 API는 다음을 참조하십시오. [ViewModel Scope](/docs/reference/koin-android/scope.md#viewmodel-scope-since-354)

## ViewModel Generic API

Koin은 ViewModel 인스턴스를 직접 조정하기 위한 몇 가지 "내부(under the hood)" API를 제공합니다. 사용 가능한 함수는 `ComponentActivity` 및 `Fragment`에 대한 `viewModelForClass`입니다.

```kotlin
ComponentActivity.viewModelForClass(
    clazz: KClass<T>,
    qualifier: Qualifier? = null,
    owner: ViewModelStoreOwner = this,
    state: BundleDefinition? = null,
    key: String? = null,
    parameters: ParametersDefinition? = null,
): Lazy<T>
```

:::note
이 함수는 여전히 `state: BundleDefinition`을 사용하지만 `CreationExtras`로 변환합니다.
:::

어디서나 호출할 수 있는 최상위 함수에 액세스할 수 있습니다.

```kotlin
fun <T : ViewModel> getLazyViewModelForClass(
    clazz: KClass<T>,
    owner: ViewModelStoreOwner,
    scope: Scope = GlobalContext.get().scopeRegistry.rootScope,
    qualifier: Qualifier? = null,
    state: BundleDefinition? = null,
    key: String? = null,
    parameters: ParametersDefinition? = null,
): Lazy<T>
```

## ViewModel API - Java 호환성

Java 호환성을 종속성에 추가해야 합니다.

```groovy
// Java Compatibility
implementation "io.insert-koin:koin-android-compat:$koin_version"
```

`ViewModelCompat`의 `viewModel()` 또는 `getViewModel()` 정적 함수를 사용하여 ViewModel 인스턴스를 Java 코드베이스에 주입할 수 있습니다.

```kotlin
@JvmOverloads
@JvmStatic
@MainThread
fun <T : ViewModel> getViewModel(
    owner: ViewModelStoreOwner,
    clazz: Class<T>,
    qualifier: Qualifier? = null,
    parameters: ParametersDefinition? = null
)
```
