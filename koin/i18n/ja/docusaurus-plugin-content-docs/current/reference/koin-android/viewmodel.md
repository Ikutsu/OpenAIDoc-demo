---
title: Android ViewModel & Navigation
---
`koin-android` Gradleモジュールは、ViewModelコンポーネントの宣言とAndroidコンポーネントのライフサイクルへのバインドを支援するために、`single`や`factory`を補完する新しい`viewModel` DSLキーワードを導入します。`viewModelOf`キーワードも利用可能で、ViewModelをそのコンストラクタとともに宣言できます。

```kotlin
val appModule = module {

    // ViewModel for Detail View
    viewModel { DetailViewModel(get(), get()) }

    // or directly with constructor
    viewModelOf(::DetailViewModel)

}
```

宣言されたコンポーネントは、少なくとも`android.arch.lifecycle.ViewModel`クラスを拡張する必要があります。クラスの*constructor（コンストラクタ）*をどのように注入するかを指定し、`get()`関数を使用して依存関係を注入できます。

:::info
`viewModel`/`viewModelOf`キーワードは、ViewModelのファクトリインスタンスを宣言するのに役立ちます。このインスタンスは内部のViewModelFactoryによって処理され、必要に応じてViewModelインスタンスを再アタッチします。また、パラメータを注入することもできます。
:::

## ViewModelの注入

`Activity`、`Fragment`、または`Service`でViewModelを注入するには、以下を使用します。

* `by viewModel()` - ViewModelをプロパティに注入する遅延デリゲートプロパティ
* `getViewModel()` - ViewModelインスタンスを直接取得

```kotlin
class DetailActivity : AppCompatActivity() {

    // Lazy inject ViewModel
    val detailViewModel: DetailViewModel by viewModel()
}
```

:::note
ViewModelキーは、Keyおよび/またはQualifierに対して計算されます。
:::

## Activity Shared ViewModel (Activity共有ViewModel)

1つのViewModelインスタンスを、FragmentとそのホストActivity間で共有できます。

`Fragment`で*shared（共有）* ViewModelを注入するには、以下を使用します。

* `by activityViewModel()` - 共有ViewModelインスタンスをプロパティに注入する遅延デリゲートプロパティ
* `getActivityViewModel()` - 共有ViewModelインスタンスを直接取得

:::note
`sharedViewModel`は非推奨となり、`activityViewModel()`関数が推奨されます。後者の命名の方がより明示的です。
:::

ViewModelは一度だけ宣言します。

```kotlin
val weatherAppModule = module {

    // WeatherViewModel declaration for Weather View components
    viewModel { WeatherViewModel(get(), get()) }
}
```

注：ViewModelのQualifierは、ViewModelのTagとして扱われます。

そして、ActivityとFragmentで再利用します。

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

## Passing Parameters to Constructor (コンストラクタへのパラメータ渡し)

`viewModel`キーワードと注入APIは、注入パラメータと互換性があります。

モジュール内：

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

注入呼び出し元：

```kotlin
class DetailActivity : AppCompatActivity() {

    val id : String // id of the view

    // Lazy inject ViewModel with id parameter
    val detailViewModel: DetailViewModel by viewModel{ parametersOf(id)}
}
```

## SavedStateHandle Injection (3.3.0) (SavedStateHandleの注入)

ViewModelの状態を処理するために、`SavedStateHandle`型の新しいプロパティをコンストラクタに追加します。

```kotlin
class MyStateVM(val handle: SavedStateHandle, val myService : MyService) : ViewModel()
```

Koinモジュールでは、`get()`またはパラメータを使用して解決します。

```kotlin
viewModel { MyStateVM(get(), get()) }
```

またはConstructor DSLを使用：

```kotlin
viewModelOf(::MyStateVM)
```

`Activity`,`Fragment`で*state（状態）* ViewModelを注入するには：

* `by viewModel()` - state ViewModelインスタンスをプロパティに注入する遅延デリゲートプロパティ
* `getViewModel()` - state ViewModelインスタンスを直接取得


```kotlin
class DetailActivity : AppCompatActivity() {

    // MyStateVM viewModel injected with SavedStateHandle
    val myStateVM: MyStateVM by viewModel()
}
```

:::info
すべての`stateViewModel`関数は非推奨です。通常の`viewModel`関数を使用してSavedStateHandleを注入できます。
:::

## Navigation Graph ViewModel (Navigation Graph ViewModel)

ViewModelインスタンスをNavigationグラフにスコープできます。`by koinNavGraphViewModel()`で取得するだけです。グラフIDが必要です。

```kotlin
class NavFragment : Fragment() {

    val mainViewModel: NavViewModel by koinNavGraphViewModel(R.id.my_graph)

}
```

## ViewModel Scope API (ViewModelスコープAPI)

ViewModelとスコープで使用できるすべてのAPIを参照してください：[ViewModel Scope](/docs/reference/koin-android/scope.md#viewmodel-scope-since-354)

## ViewModel Generic API (ViewModelジェネリックAPI)

KoinはViewModelインスタンスを直接調整するためのいくつかの「隠れた」APIを提供します。使用可能な関数は、`ComponentActivity`および`Fragment`の`viewModelForClass`です。

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
この関数はまだ`state: BundleDefinition`を使用していますが、`CreationExtras`に変換します。
:::

どこからでも呼び出し可能なトップレベルの関数にアクセスできることに注意してください。

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

## ViewModel API - Java Compat (ViewModel API - Java互換)

Java互換性を依存関係に追加する必要があります。

```groovy
// Java Compatibility
implementation "io.insert-koin:koin-android-compat:$koin_version"
```

`ViewModelCompat`の`viewModel()`または`getViewModel()` static（静的）関数を使用して、ViewModelインスタンスをJavaコードベースに注入できます。


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
