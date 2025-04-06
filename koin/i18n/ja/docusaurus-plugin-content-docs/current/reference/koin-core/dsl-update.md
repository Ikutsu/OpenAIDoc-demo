---
title: Constructor DSL
---
Koinは、クラスコンストラクタを直接ターゲットにできる新しい種類のDSLキーワードを提供し、ラムダ式内で定義を入力する必要がなくなりました。

次の依存関係を持つ特定のクラス`ClassA`の場合：

```kotlin
class ClassA(val b : ClassB, val c : ClassC)
class ClassB()
class ClassC()
```

これらのコンポーネントを、`class constructor`を直接ターゲットにして宣言できます。

```kotlin
module {
    singleOf(::ClassA)
    singleOf(::ClassB)
    singleOf(::ClassC)
}
```

`get()`関数を使用してコンストラクタで依存関係を指定する必要はもうありません！ 🎉

:::info
クラスコンストラクタをターゲットにするには、クラス名の前に`::`を使用してください。
:::

:::note
コンストラクタはすべての`get()`で自動的に入力されます。 Koinが現在のグラフで検索するため、デフォルト値は使用しないでください。
:::

:::note
「named」定義を取得する必要がある場合は、修飾子（qualifier）を指定するために、ラムダと`get()`を含む標準DSLを使用する必要があります。
:::

## 利用可能なキーワード（Available Keywords）

コンストラクタから定義を構築するために、次のキーワードを使用できます。

* `factoryOf` - `factory { }`と同等 - ファクトリ定義（factory definition）
* `singleOf` - `single { }`と同等 - シングル定義（single definition）
* `scopedOf` - `scoped { }`と同等 - スコープ定義（scoped definition）

:::info
Koinはすべてのパラメーターを入力しようとするため、コンストラクタでデフォルト値を使用しないようにしてください。
:::

## DSLオプション（DSL Options）

コンストラクタDSL定義は、ラムダ内でいくつかのオプションを開くこともできます。

```kotlin
module {
    singleOf(::ClassA) { 
        // 定義オプション（definition options）
        named("my_qualifier")
        bind<InterfaceA>()
        createdAtStart()
    }
}
```

このラムダでは、通常（Usual）のオプションとDSLキーワードを使用できます。

* `named("a_qualifier")` - 定義にString修飾子（String qualifier）を与えます
* `named<MyType>()` - 定義にType修飾子（Type qualifier）を与えます
* `bind<MyInterface>()` - 指定されたBean定義（bean definition）にバインドする型を追加します
* `binds(listOf(...))` - 指定されたBean定義（bean definition）に型のリストを追加します
* `createdAtStart()` - Koinの開始時に単一のインスタンスを作成します

ラムダを必要とせずに、`bind`または`binds`演算子を使用することもできます。

```kotlin
module {
    singleOf(::ClassA) bind InterfaceA::class
}
```

## 注入されたパラメーター（Injected Parameters）

このような宣言では、注入されたパラメーター（injected parameters）を使用できます。 Koinは注入されたパラメーター（injected parameters）と現在の依存関係（current dependencies）を調べて、コンストラクタを注入しようとします。

以下のように：

```kotlin
class MyFactory(val id : String)
```

コンストラクタDSLで宣言：

```kotlin
module {
    factoryOf(::MyFactory)
}
```

次のように注入できます。

```kotlin
val id = "a_factory_id"
val factory = koin.get<MyFactory> { parametersOf(id)}
```

## リフレクションベースDSL（Reflection Based DSL）（3.2以降は非推奨）

:::caution
KoinリフレクションDSL（Koin Reflection DSL）は非推奨になりました。 上記のKoinコンストラクタDSL（Koin Constructor DSL）を使用してください
:::
