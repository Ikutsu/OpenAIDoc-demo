---
title: Injecting in Jetpack Compose
---
n
このページでは、Jetpack Composeアプリに依存関係を注入する方法について説明します - https://developer.android.com/jetpack/compose

## @Composableへの注入

Composable関数を作成する際、以下のKoin APIにアクセスできます。

* `get()` - Koinコンテナからインスタンスを取得
* `getKoin()` - 現在のKoinインスタンスを取得

'MyService'コンポーネントを宣言するモジュールの場合：

```kotlin
val androidModule = module {

    single { MyService() }
}
```

次のようにインスタンスを取得できます。

```kotlin
@Composable
fun App() {
    val myService = get<MyService>()
}
```

:::note 
Jetpack Composeの関数型という側面に合わせるため、最適な記述方法は、インスタンスを関数プロパティに直接注入することです。これにより、Koinによるデフォルトの実装が可能になりますが、インスタンスをどのように注入するかは自由に選択できます。
:::

```kotlin
@Composable
fun App(myService: MyService = get()) {
}
```

## @ComposableのためのViewModel

従来のsingle/factoryインスタンスにアクセスできるのと同じように、以下のKoin ViewModel APIにアクセスできます。

* `getViewModel()` または `koinViewModel()` - インスタンスを取得

'MyViewModel'コンポーネントを宣言するモジュールの場合：

```kotlin
module {
    viewModel { MyViewModel() }
    // or constructor DSL
    viewModelOf(::MyViewModel)
}
```

次のようにインスタンスを取得できます。

```kotlin
@Composable
fun App() {
    val vm = koinViewModel<MyViewModel>()
}
```

関数パラメータでインスタンスを取得できます。

```kotlin
@Composable
fun App(vm : MyViewModel = koinViewModel()) {

}
```

:::warning
Lazy APIはJetpack Compose 1.1以降のアップデートではサポートされていません。
:::