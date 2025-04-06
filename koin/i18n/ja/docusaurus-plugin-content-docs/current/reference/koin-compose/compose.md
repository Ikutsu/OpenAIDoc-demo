---
title: Koin for Jetpack Compose and Compose Multiplatform
---
```markdown
このページでは、[Android Jetpack Compose](https://developer.android.com/jetpack/compose) または [Multiplaform Compose](https://www.jetbrains.com/lp/compose-mpp/) アプリケーションに依存関係を注入する方法について説明します。

## Koin Compose Multiplatform vs Koin Android Jetpack Compose

2024年中頃から、ComposeアプリケーションはKoin Multiplatform APIで記述できるようになりました。全てのAPIは、Koin Jetpack Compose (koin-androidx-compose) と Koin Compose Multiplatform (koin-compose) で同一です。

### Compose用のKoinパッケージの選択

Android Jetpack Compose APIのみを使用する純粋なAndroidアプリの場合、以下のパッケージを使用します。
- `koin-androidx-compose` - Composeの基本API + Compose ViewModel APIをアンロック
- `koin-androidx-compose-navigation` - Navigation APIとの統合によるCompose ViewModel API

Android/Multiplatformアプリの場合、以下のパッケージを使用します。
- `koin-compose` - Composeの基本API
- `koin-compose-viewmodel` - Compose ViewModel API
- `koin-compose-viewmodel-navigation` - Navigation APIとの統合によるCompose ViewModel API

## 既存のKoinコンテキストを再開する（Koinが既に開始されている場合）

アプリケーション内で `startKoin` 関数が既に使用されている場合（Androidのメインアプリクラス、Applicationクラスなど）、`KoinContext` または `KoinAndroidContext` を使用して、現在のKoinコンテキストをComposeアプリケーションに通知する必要があります。これらの関数は、現在のKoinコンテキストを再利用し、Composeアプリケーションにバインドします。

```kotlin
@Composable
fun App() {
    // 現在のKoinインスタンスをComposeコンテキストに設定
    KoinContext() {

        MyScreen()
    }
}
```

:::info
`KoinAndroidContext` と `KoinContext` の違い：
- `KoinAndroidContext` は、現在のAndroidアプリのコンテキストからKoinインスタンスを探します
- `KoinContext` は、現在の GlobalContext からKoinインスタンスを探します
:::

:::note
Composableから `ClosedScopeException` が発生する場合は、Composableで `KoinContext` を使用するか、適切なKoin開始構成を[Androidコンテキストで](/docs/reference/koin-android/start.md#from-your-application-class)設定してください。
:::

## ComposeアプリでKoinを開始する - KoinApplication

`KoinApplication` 関数は、ComposableとしてKoinアプリケーションインスタンスを作成するのに役立ちます。

```kotlin
@Composable
fun App() {
    KoinApplication(application = {
        modules(...)
    }) {
        
        // ここに画面を記述 ...
        MyScreen()
    }
}
```

`KoinApplication` 関数は、Composeコンテキストのサイクルに関して、Koinコンテキストの開始と停止を処理します。この関数は、新しいKoinアプリケーションコンテキストを開始および停止します。

:::info
Androidアプリケーションでは、`KoinApplication` は、構成の変更またはアクティビティの削除に関して、Koinコンテキストを停止/再起動する必要性をすべて処理します。
:::

:::note
これは、従来の `startKoin` アプリケーション関数の使用を置き換えます。
:::

### Koinを使用したComposeプレビュー

`KoinApplication` 関数は、プレビュー用の専用コンテキストを開始する場合に役立ちます。これは、Composeプレビューを支援するためにも使用できます。

```kotlin
@Composable
@Preview
fun App() {
    KoinApplication(application = {
        // ここにプレビュー構成を記述
        modules(previewModule)
    }) {
        // Koinを使用したプレビュー用のCompose
    }
}
```

## @Composableへの注入

Composable関数を記述する際に、次のKoin API `koinInject()` にアクセスして、Koinコンテナからインスタンスを注入できます。

'MyService' コンポーネントを宣言するモジュールの場合：

```kotlin
val androidModule = module {
    single { MyService() }
    // またはコンストラクタDSL
    singleOf(::MyService)
}
```

インスタンスは次のように取得できます。

```kotlin
@Composable
fun App() {
    val myService = koinInject<MyService>()
}
```

Jetpack Composeの関数型のアスペクトに合わせるために、最適な記述方法は、インスタンスを関数のパラメータに直接注入することです。これにより、Koinによるデフォルトの実装が可能になりますが、インスタンスを自由に注入できるようにオープンな状態を維持できます。

```kotlin
@Composable
fun App(myService: MyService = koinInject()) {

}
```

### パラメータ付きの@Composableへの注入

Koinから新しい依存関係をリクエストする際に、パラメータを注入する必要がある場合があります。これを行うには、`koinInject` 関数の `parameters` パラメータを `parametersOf()` 関数とともに使用します。

```kotlin
@Composable
fun App() {
    val myService = koinInject<MyService>(parameters = parametersOf("a_string"))
}
```

:::info
`koinInject<MyService>{ parametersOf("a_string") }` のように、ラムダ注入でパラメータを使用できますが、再構成が頻繁に行われる場合はパフォーマンスに影響を与える可能性があります。このラムダを使用したバージョンでは、パラメータを忘れないように、呼び出し時にパラメータをアンラップする必要があります。

Koinのバージョン4.0.2から、`koinInject(Qualifier,Scope,ParametersHolder)` が導入され、パラメータを最も効率的な方法で使用できるようになりました。
:::

## @ComposableのViewModel

クラシックなsingle/factoryインスタンスにアクセスできるのと同じように、次のKoin ViewModel APIにアクセスできます。

* `koinViewModel()` - ViewModelインスタンスを注入
* `koinNavViewModel()` - ViewModelインスタンス + Navigation引数データを注入（`Navigation` APIを使用している場合）

'MyViewModel' コンポーネントを宣言するモジュールの場合：

```kotlin
module {
    viewModel { MyViewModel() }
    // またはコンストラクタDSL
    viewModelOf(::MyViewModel)
}
```

インスタンスは次のように取得できます。

```kotlin
@Composable
fun App() {
    val vm = koinViewModel<MyViewModel>()
}
```

関数のパラメータでインスタンスを取得できます。

```kotlin
@Composable
fun App(vm : MyViewModel = koinViewModel()) {

}
```

:::note
Lazy APIは、Jetpack Composeのアップデートではサポートされていません。
:::

### @ComposableのViewModelとSavedStateHandle

`SavedStateHandle` コンストラクタパラメータを使用できます。これは、Compose環境（Navigation BackStackまたはViewModel）に応じて注入されます。ViewModel `CreationExtras` 経由または Navigation `BackStackEntry` 経由で注入されます。

```kotlin
// NavhostでobjectId引数を設定
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

// ViewModelに注入された引数
class DetailViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    init {
        println("$this - objectId: ${savedStateHandle.get<String>("objectId")}")
    }
}
```

:::note
SavedStateHandleの注入の違いに関する詳細：https://github.com/InsertKoinIO/koin/issues/1935#issuecomment-2362335705
:::

## Composableに関連付けられたモジュールのロードとアンロード

Koinは、特定のComposable関数に特定のモジュールをロードする方法を提供します。`rememberKoinModules` 関数は、Koinモジュールをロードし、現在のComposableに記憶します。

```kotlin
@Composable
@Preview
fun MyComponentComposable() {
    // このコンポーネントの最初の呼び出しでモジュールをロード
    rememberKoinModules(myModule)
}
```

破棄関数（abandon function）のいずれかを使用して、モジュールを2つの側面でアンロードできます。
- onForgotten - コンポジションが削除された後
- onAbandoned - コンポジションが失敗した場合

これには、`rememberKoinModules` の `unloadOnForgotten` または `unloadOnAbandoned` 引数を使用します。

## Composableを使用したKoinスコープの作成

Composable関数 `rememberKoinScope` と `KoinScope` を使用すると、ComposableでKoinスコープを処理し、Composableが終了するとスコープを閉じることができます。

:::info
このAPIは現在も不安定です。
:::
```
