---
title: Releases & API Compatibility Guide
custom_edit_url: null
---
n
:::info
このページでは、すべての Koin メインリリースに関する包括的な概要を提供し、アップグレードの計画と互換性の維持に役立つように、フレームワークの進化を詳細に説明します。
:::

各バージョンについて、ドキュメントは次のセクションに構成されています。

- `Kotlin`: リリースで使用される Kotlin のバージョンを指定します。これにより、言語の互換性が明確になり、最新の Kotlin 機能を活用できます。
- `New`: 機能と開発者エクスペリエンスを強化する、新しく導入された機能と改善点を強調表示します。
- `Experimental`: 試験段階としてマークされている API と機能をリストします。これらは活発に開発されており、コミュニティからのフィードバックに基づいて変更される可能性があります。
- `Deprecated`: 非推奨としてマークされている API と機能を、推奨される代替案に関するガイダンスとともに識別し、将来の削除に備えるのに役立ちます。
- `Breaking`: 下位互換性を損なう可能性のある変更を詳細に説明します。これにより、移行中に必要な調整を認識できます。

この構造化されたアプローチは、各リリースの段階的な変更を明確にするだけでなく、Koin プロジェクトにおける透明性、安定性、継続的な改善への取り組みを強化します。

## 4.0.3

:::note
Kotlin `2.0.21`を使用
:::

使用されているすべてのライブラリのバージョンは、[libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/main/projects/gradle/libs.versions.toml)にあります。

### New 🎉

`koin-core`
- `KoinPlatformTools.generateId()` - この新しいバージョンの Kotlin では、新しい `kotlin.uuid.uuid` APIを利用できます。`KoinPlatformTools.generateId()` Koin 関数は、この新しい API を使用して、プラットフォーム全体で実際の UUID を生成するようになりました。

`koin-viewmodel`
 - Koin 4.0 では、Google/Jetbrains KMP API を相互化する新しい ViewModel DSL & API が導入されました。コードベース全体での重複を避けるために、ViewModel API は `koin-core-viewmodel` および `koin-core-viewmodel-navigation` プロジェクトに配置されるようになりました。
 - ViewModel DSL のインポートは `org.koin.core.module.dsl.*` です。

指定されたプロジェクトの以下の API は、安定版になりました。

`koin-core-coroutines` - すべての API が安定版になりました
  - すべての `lazyModules`
  - `awaitAllStartJobs`、`onKoinStarted`、`isAllStartedJobsDone`
  - `waitAllStartJobs`、`runOnKoinStarted`
  - `KoinApplication.coroutinesEngine`
  - `Module.includes(lazy)`
  - `lazyModule()`
  - `KoinPlatformCoroutinesTools`

### Experimental 🚧

`koin-test`
- `ParameterTypeInjection` - `Verify` API の動的パラメータインジェクションの設計に役立つ新しい API

`koin-androidx-startup`
- `koin-androidx-startup` - `androidx.startup.Initializer` API を使用して、`AndroidX Startup` で Koin を開始する新しい機能。`koin-androidx-startup` 内のすべての API は Experimental です。

`koin-compose`
- `rememberKoinModules` - @Composable コンポーネントを指定して Koin モジュールをロード/アンロード
- `rememberKoinScope` - @Composable コンポーネントを指定して Koin スコープをロード/アンロード
- `KoinScope` - すべての基盤となる Composable の子に対して Koin スコープをロード

### Deprecation ⚠️

次の API は非推奨になっており、今後使用すべきではありません。

- `koin-test`
  - `checkModules` のすべての API。`Verify` API に移行します。

- `koin-android`
  - koin-core の新しい集中型 DSL を支持して、ViewModel DSL

- `koin-compose-viewmodel`
  - koin-core の新しい集中型 DSL を支持して、ViewModel DSL
  - 関数 `koinNavViewModel` は非推奨になり、`koinViewModel` を支持します。

### Breaking 💥

以下の API は、前回のマイルストーンでの非推奨のため削除されました。

:::note
`@KoinReflectAPI` でアノテーションが付けられたすべての API は削除されました
:::

`koin-core`
  - `ApplicationAlreadyStartedException` は `KoinApplicationAlreadyStartedException` に名前が変更されました
  - `KoinScopeComponent.closeScope()` は内部的に使用されなくなったため削除されました
  - 内部の `ResolutionContext` を移動して `InstanceContext` を置き換えました
  - `KoinPlatformTimeTools`、`Timer`、`measureDuration` は削除され、代わりに Kotlin Time API を使用します
  - `KoinContextHandler` は `GlobalContext` を支持して削除されました

`koin-android`
  - すべての状態 ViewModel API はエラーレベルで非推奨になりました。
    - `stateViewModel()`,`getStateViewModel()`、代わりに `viewModel()` を使用します
    - `getSharedStateViewModel()`、`sharedStateViewModel()`、共有インスタンスの場合は代わりに `viewModel()` または `activityViewModel()` を使用します
  - 関数 `fun Fragment.createScope()` が削除されました
  - ViewModel ファクトリ (主に内部) 周辺のすべての API は、新しい内部処理のために再設計されました

`koin-compose`
  - 古い compose API 関数はエラーレベルで非推奨になりました。
    - 関数 `inject()` は `koinInject()` を支持して削除されました
    - 関数 `getViewModel()` は `koinViewModel()` を支持して削除されました
    - 関数 `rememberKoinInject()` は `koinInject()` に移動されました
  - 内部で不要になったため、`StableParametersDefinition` を削除しました
  - すべての Lazy ViewModel API - 古い `viewModel()` を削除しました
  - 内部で不要になったため、`rememberStableParametersDefinition()` を削除しました

## 3.5.6

:::note
Kotlin `1.9.22`を使用
:::

使用されているすべてのライブラリのバージョンは、[libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml)にあります。

### New 🎉

`koin-core`
  - `KoinContext` には次のものが含まれるようになりました。
    - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
    - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
  - `koinApplication()` 関数は、複数の形式を使用するようになりました。
    - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
    - `koinApplication(appDeclaration: KoinAppDeclaration?)`
    - `koinApplication(createEagerInstances: Boolean)`
  - 宣言スタイルを開くのに役立つ `KoinAppDeclaration`
  - JS に API Time を使用する `KoinPlatformTimeTools`
  - iOS - Touchlab Lockable API を使用する `synchronized` API

`koin-androidx-compose`
  - Android 環境から現在の Koin コンテキストにバインドする新しい `KoinAndroidContext`

`koin-compose`
  - 現在のデフォルトコンテキストでコンテキストを開始する新しい `KoinContext`

`koin-ktor`
  - Ktor インスタンスに分離されたコンテキストを使用するようになりました (`Application.getKoin()` をデフォルトのコンテキストの代わりに使用)。
  - Koin プラグインは新しい監視を導入します
  - スコープインスタンスを Ktor リクエストに許可する `RequestScope`

### Experimental 🚧

`koin-android`
  - `ViewModelScope` は ViewModel スコープの実験的な API を導入します

`koin-core-coroutines` - バックグラウンドでモジュールをロードする新しい API を導入

### Deprecation ⚠️

`koin-android`
  - `getLazyViewModelForClass()` API は非常に複雑で、デフォルトのグローバルコンテキストを呼び出します。Android/Fragment API に固執することをお勧めします
  - `resolveViewModelCompat()` は `resolveViewModel()` を支持して非推奨になりました

`koin-compose`
  - 関数 `get()` および `inject()` は `koinInject()` を支持して非推奨になりました
  - 関数 `getViewModel()` は `koinViewModel()` を支持して非推奨になりました
  - 関数 `rememberKoinInject()` は `koinInject()` に対して非推奨になりました

### Breaking 💥

`koin-core`
  - `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances : Boolean = false)` は `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)` を置き換えます
  - プロパティ `KoinExtension.koin` を関数 `KoinExtension.onRegister()` に移動しました
  - iOS - `MutableGlobalContext` を使用する `internal fun globalContextByMemoryModel(): KoinContext`

`koin-compose`
  - 関数 `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)` は `KoinContext` および `KoinAndroidContext` を支持して削除されました

## 3.4.3

:::note
Kotlin `1.8.21`を使用
:::

### New 🎉

`koin-core`
  - Koin の拡張エンジンを作成するのに役立つ新しい ExtensionManager API - `ExtensionManager` + `KoinExtension`
  - `parameterArrayOf` および `parameterSetOf` によるパラメータ API の更新

`koin-test`
  - モジュールで `verify` を実行するのに役立つ `Verification` API。

`koin-android`
  - ViewModel インジェクションの内部
  - `AndroidScopeComponent.onCloseScope()` 関数コールバックを追加

`koin-android-test`
  - モジュールで `androidVerify()` を実行するのに役立つ `Verification` API。

`koin-androidx-compose`
  - 新しい `get()`
  - 新しい `getViewModel()`
  - 新しいスコープ `KoinActivityScope`、`KoinFragmentScope`

`koin-androidx-compose-navigation` - ナビゲーション用の新しいモジュール
  - 新しい `koinNavViewModel()`

`koin-compose` - Compose の新しいマルチプラットフォーム API
  - `koinInject`、`rememberKoinInject`
  - `KoinApplication`

### Experimental 🚧

`koin-compose` - Compose の新しい実験的なマルチプラットフォーム API
  - `rememberKoinModules`
  - `KoinScope`、`rememberKoinScope`

### Deprecation ⚠️

`koin-compose`
- Lazy 関数を回避する `inject()` の使用法を置き換える関数 `get()`
- Lazy 関数を回避する `viewModel()` 関数の使用法を置き換える関数 `getViewModel()`

### Breaking 💥

`koin-android`
  - `LifecycleScopeDelegate` は削除されました

`koin-androidx-compose`
  - `koinViewModel` を支持して `getStateViewModel` を削除しました