---
title: Koin DSL
---
Kotlin 言語の強力な機能のおかげで、Koin はアプリを記述するための DSL を提供し、アノテーションを付けたり、コードを生成したりする必要はありません。Kotlin DSL により、Koin は依存性注入 (Dependency Injection) を準備するためのスマートな関数型 API を提供します。

## Application & Module DSL

Koin は、Koin Application の要素を記述するためのいくつかのキーワードを提供します。

- Application DSL: Koin コンテナの設定を記述します。
- Module DSL: 注入されるべきコンポーネントを記述します。

## Application DSL

`KoinApplication` インスタンスは、Koin コンテナのインスタンス設定です。これにより、ロギング、プロパティのロード、およびモジュールを構成できます。

新しい `KoinApplication` を構築するには、次の関数を使用します。

* `koinApplication { }` - `KoinApplication` コンテナ設定を作成します。
* `startKoin { }` - `KoinApplication` コンテナ設定を作成し、`GlobalContext` に登録して、GlobalContext API の使用を許可します。

`KoinApplication` インスタンスを構成するには、次のいずれかの関数を使用できます。

* `logger( )` - 使用するロガー (Logger) のレベルと実装を記述します (デフォルトでは EmptyLogger を使用します)。
* `modules( )` - コンテナにロードする Koin モジュールのリストを設定します (リストまたは可変長引数リスト)。
* `properties()` - HashMap プロパティを Koin コンテナにロードします。
* `fileProperties( )` - 指定されたファイルから Koin コンテナにプロパティをロードします。
* `environmentProperties( )` - OS 環境から Koin コンテナにプロパティをロードします。
* `createEagerInstances()` - eager インスタンス (Single 定義で `createdAtStart` としてマークされたもの) を作成します。

## KoinApplication インスタンス: グローバル (Global) vs ローカル (Local)

上記のように、Koin コンテナの設定は、`koinApplication` 関数または `startKoin` 関数の 2 つの方法で記述できます。

- `koinApplication` は Koin コンテナインスタンスを記述します。
- `startKoin` は Koin コンテナインスタンスを記述し、Koin の `GlobalContext` に登録します。

コンテナ設定を `GlobalContext` に登録すると、グローバル API はそれを直接使用できます。すべての `KoinComponent` は `Koin` インスタンスを参照します。デフォルトでは、`GlobalContext` からのインスタンスを使用します。

詳細については、カスタム Koin インスタンス (Custom Koin instance) に関する章を確認してください。

## Koin の起動 (Starting Koin)

Koin を起動するとは、`KoinApplication` インスタンスを `GlobalContext` で実行することを意味します。

モジュールを使用して Koin コンテナを起動するには、次のように `startKoin` 関数を使用します。

```kotlin
// start a KoinApplication in Global context
startKoin {
    // declare used logger
    logger()
    // declare used modules
    modules(coffeeAppModule)
}
```

## Module DSL

Koin モジュールは、アプリケーションのために注入/結合する定義を収集します。新しいモジュールを作成するには、次の関数を使用します。

* `module { // module content }` - Koin モジュールを作成します。

モジュールでコンテンツを記述するには、次の関数を使用できます。

* `factory { //definition }` - ファクトリ (factory) Bean 定義を提供します。
* `single { //definition  }` - シングルトン (singleton) Bean 定義を提供します (`bean` としてもエイリアス化されます)。
* `get()` - コンポーネントの依存関係を解決します (名前、スコープ (scope)、またはパラメータも使用できます)。
* `bind()` - 指定された Bean 定義にバインドする型を追加します。
* `binds()` - 指定された Bean 定義にバインドする型の配列を追加します。
* `scope { // scope group }` - `scoped` 定義の論理グループを定義します。
* `scoped { //definition }`- スコープ (scope) 内にのみ存在する Bean 定義を提供します。

注: `named()` 関数を使用すると、文字列、enum、または型によって修飾子 (qualifier) を指定できます。これは、定義に名前を付けるために使用されます。

### モジュールの作成 (Writing a module)

Koin モジュールは、*すべてのコンポーネントを宣言するスペース* です。`module` 関数を使用して Koin モジュールを宣言します。

```kotlin
val myModule = module {
   // your dependencies here
}
```

このモジュールでは、以下に説明するようにコンポーネントを宣言できます。

### withOptions - DSL オプション (Options) (3.2 以降)

新しい [Constructor DSL](./dsl-update.md) 定義と同様に、`withOptions` 演算子を使用して、「通常の」定義に定義オプション (option) を指定できます。

```kotlin
module {
    single { ClassA(get()) } withOptions { 
        named("qualifier")
        createdAtStart()
    }
}
```

このオプション (option) ラムダ内では、次のオプション (option) を指定できます。

* `named("a_qualifier")` - 定義に文字列修飾子 (String qualifier) を指定します。
* `named<MyType>()` - 定義に型修飾子 (Type qualifier) を指定します。
* `bind<MyInterface>()` - 指定された Bean 定義にバインドする型を追加します。
* `binds(arrayOf(...))` - 指定された Bean 定義にバインドする型の配列を追加します。
* `createdAtStart()` - Koin の起動時にシングル (single) インスタンスを作成します。
