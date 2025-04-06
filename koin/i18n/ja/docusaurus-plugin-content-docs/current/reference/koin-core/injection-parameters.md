---
title: Passing Parameters - Injected Parameters
---
n
定義では、インジェクションパラメータ（定義によってインジェクトされ、使用されるパラメータ）を使用できます。

## インジェクトする値の渡し方

定義が与えられた場合、その定義にパラメータを渡すことができます。

```kotlin
class Presenter(val a : A, val b : B)

val myModule = module {
    single { params -> Presenter(a = params.get(), b = params.get()) }
}
```

パラメータは、`parametersOf()` 関数を使用して定義に送信されます（各値はカンマで区切られます）。

```kotlin
class MyComponent : View, KoinComponent {

    val a : A ...
    val b : B ... 

    // inject this as View value
    val presenter : Presenter by inject { parametersOf(a, b) }
}
```

## 「インジェクトされたパラメータ」の定義

以下は、インジェクションパラメータの例です。 `Presenter`クラスの構築には`view`パラメータが必要であることを確立しました。 `params`関数の引数を使用して、インジェクトされたパラメータを取得します。

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { params -> Presenter(view = params.get()) }
}
```

パラメータオブジェクトで直接インジェクトされたパラメータを、分割された宣言として記述することもできます。

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { (view : View) -> Presenter(view) }
}
```

:::caution
「分割された」宣言の方が便利で読みやすい場合でも、タイプセーフではありません。 複数の値がある場合、渡された型が良い順序であるかどうかを Kotlin は検出しません。
:::

## インジェクトされたパラメータの順序での解決

パラメータを解決するために `get()` を使用する代わりに、同じ型のパラメータが複数ある場合は、インデックスを次のように使用できます `get(index)` ( `[ ]` 演算子と同じ)。

```kotlin
class Presenter(val view : View)

val myModule = module {
    
    single { p -> Presenter(p[0],p[1]) }
}
```

## グラフからのインジェクトされたパラメータの解決

Koinグラフ解決 (すべての定義の解決のメインツリー) では、インジェクトされたパラメータを見つけることもできます。 通常の `get()` 関数を使用するだけです。

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { Presenter(get()) }
}
```

## インジェクトされたパラメータ: インデックス付きの値またはセット (`3.4.3`)

`parametersOf` に加えて、次の API にアクセスできます。

- `parameterArrayOf`: 値の配列を使用し、データはそのインデックスで使用されます。

```kotlin
val params = parameterArrayOf(1,2,3)
params.get<Int>() == 1
params.get<Int>() == 2
params.get<Int>() == 3
params.get<Int>() == 3
```

- `parameterSetOf`: さまざまな種類の値のセットを使用します。 値をスクロールするためにインデックスを使用しません。

```kotlin
val params = parameterSetOf("a_string", 42)
params.get<Int>() == 42
params.get<String>() == "a_string"
params.get<Int>() == 42
params.get<String>() == "a_string"
```

デフォルト関数 `parametersOf` は、インデックスと値のセットの両方で動作します。

```kotlin
val params = parametersOf(1,2,"a_string")
params.get<String>() == "a_string"
params.get<Int>() == 1
params.get<Int>() == 2
params.get<Int>() == 2
params.get<String>() == "a_string"
```

:::note
  インデックスに基づいて値を消費するには、`parametersOf` または `parameterArrayOf` でパラメータインジェクションを「カスケード」できます。 または、解決するために型に基づいてカスケードするには、`parametersOf` または `parameterSetOf` を使用します。
:::