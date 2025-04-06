---
title: "Android ViewModel & Navigation"
---
`koin-android` Gradle 模块引入了一个新的 `viewModel` DSL 关键字，作为 `single` 和 `factory` 的补充，以帮助声明一个 ViewModel 组件并将其绑定到 Android 组件的生命周期。 `viewModelOf` 关键字也可用，可让你使用其构造函数声明 ViewModel。

```kotlin
val appModule = module {

    // Detail View 的 ViewModel
    viewModel { DetailViewModel(get(), get()) }

    // 或直接使用构造函数
    viewModelOf(::DetailViewModel)

}
```

你声明的组件必须至少继承 `android.arch.lifecycle.ViewModel` 类。你可以指定如何注入类的*构造函数*，并使用 `get()` 函数来注入依赖项。

:::info
`viewModel` / `viewModelOf` 关键字有助于声明 ViewModel 的工厂实例。此实例将由内部 ViewModelFactory 处理，并在需要时重新附加 ViewModel 实例。
它还将允许注入参数。
:::

## 注入你的 ViewModel

要在 `Activity`、`Fragment` 或 `Service` 中注入 ViewModel，请使用：

* `by viewModel()` - 延迟委托属性，用于将 ViewModel 注入到属性中
* `getViewModel()` - 直接获取 ViewModel 实例

```kotlin
class DetailActivity : AppCompatActivity() {

    // 延迟注入 ViewModel
    val detailViewModel: DetailViewModel by viewModel()
}
```

:::note
ViewModel 键是根据 Key 和/或 Qualifier 计算的
:::

## Activity 共享 ViewModel

一个 ViewModel 实例可以在 Fragments 和它们的主 Activity 之间共享。

要在 `Fragment` 中注入一个*共享的* ViewModel，请使用：

* `by activityViewModel()` - 延迟委托属性，用于将共享的 ViewModel 实例注入到属性中
* `getActivityViewModel()` - 直接获取共享的 ViewModel 实例

:::note
`sharedViewModel` 已被弃用，取而代之的是 `activityViewModel()` 函数。后者的命名更加明确。
:::

只需声明一次 ViewModel：

```kotlin
val weatherAppModule = module {

    // Weather View 组件的 WeatherViewModel 声明
    viewModel { WeatherViewModel(get(), get()) }
}
```

注意：ViewModel 的 qualifier 将被视为 ViewModel 的 Tag

并在 Activity 和 Fragments 中重复使用它：

```kotlin
class WeatherActivity : AppCompatActivity() {

    /*
     * 使用 Koin 声明 WeatherViewModel，并允许构造函数依赖注入
     */
    private val weatherViewModel by viewModel<WeatherViewModel>()
}

class WeatherHeaderFragment : Fragment() {

    /*
     * 使用 WeatherActivity 声明共享的 WeatherViewModel
     */
    private val weatherViewModel by activityViewModel<WeatherViewModel>()
}

class WeatherListFragment : Fragment() {

    /*
     * 使用 WeatherActivity 声明共享的 WeatherViewModel
     */
    private val weatherViewModel by activityViewModel<WeatherViewModel>()
}
```

## 将参数传递给构造函数

`viewModel` 关键字和注入 API 与注入参数兼容。

在模块中：

```kotlin
val appModule = module {

    // Detail View 的 ViewModel，其中 id 作为参数注入
    viewModel { parameters -> DetailViewModel(id = parameters.get(), get(), get()) }
    // Detail View 的 ViewModel，其中 id 作为参数注入，从图中解析
    viewModel { DetailViewModel(get(), get(), get()) }
    // 或构造函数 DSL
    viewModelOf(::DetailViewModel)
}
```

从注入调用站点：

```kotlin
class DetailActivity : AppCompatActivity() {

    val id : String // view 的 id

    // 使用 id 参数延迟注入 ViewModel
    val detailViewModel: DetailViewModel by viewModel{ parametersOf(id)}
}
```

## SavedStateHandle 注入 (3.3.0)

将一个类型为 `SavedStateHandle` 的新属性添加到你的构造函数，以处理你的 ViewModel 状态：

```kotlin
class MyStateVM(val handle: SavedStateHandle, val myService : MyService) : ViewModel()
```

在 Koin 模块中，只需使用 `get()` 或参数来解析它：

```kotlin
viewModel { MyStateVM(get(), get()) }
```

或使用构造函数 DSL：

```kotlin
viewModelOf(::MyStateVM)
```

要在 `Activity`，`Fragment` 中注入 *state* ViewModel，请使用：

* `by viewModel()` - 延迟委托属性，用于将 state ViewModel 实例注入到属性中
* `getViewModel()` - 直接获取 state ViewModel 实例

```kotlin
class DetailActivity : AppCompatActivity() {

    // 注入了 SavedStateHandle 的 MyStateVM viewModel
    val myStateVM: MyStateVM by viewModel()
}
```

:::info
所有 `stateViewModel` 函数都已弃用。你可以直接使用常规的 `viewModel` 函数来注入 SavedStateHandle
:::

## Navigation Graph ViewModel

你可以将 ViewModel 实例的作用域限定到你的 Navigation graph。只需使用 `by koinNavGraphViewModel()` 检索。你只需要你的 graph id。

```kotlin
class NavFragment : Fragment() {

    val mainViewModel: NavViewModel by koinNavGraphViewModel(R.id.my_graph)

}
```

## ViewModel Scope API

请参阅用于 ViewModel 和 Scopes 的所有 API：[ViewModel Scope](/docs/reference/koin-android/scope.md#viewmodel-scope-since-354)

## ViewModel Generic API

Koin 提供了一些“底层” API，可以直接调整你的 ViewModel 实例。可用的函数是 `ComponentActivity` 和 `Fragment` 的 `viewModelForClass`：

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
此函数仍在使用 `state: BundleDefinition`，但会将其转换为 `CreationExtras`
:::

请注意，你可以访问顶层函数，该函数可以从任何地方调用：

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

## ViewModel API - Java Compat

必须将 Java 兼容性添加到你的依赖项中：

```groovy
// Java Compatibility
implementation "io.insert-koin:koin-android-compat:$koin_version"
```

你可以使用 `ViewModelCompat` 中的 `viewModel()` 或 `getViewModel()` 静态函数将 ViewModel 实例注入到你的 Java 代码库中：

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