---
title: Passing Parameters - Injected Parameters
---
在任何定義中，您都可以使用注入參數 (injection parameters)：這些參數將被注入並由您的定義使用。

## 傳遞數值以進行注入

給定一個定義，您可以將參數傳遞給該定義：

```kotlin
class Presenter(val a : A, val b : B)

val myModule = module {
    single { params -> Presenter(a = params.get(), b = params.get()) }
}
```

參數會透過 `parametersOf()` 函數傳送到您的定義（每個數值以逗號分隔）：

```kotlin
class MyComponent : View, KoinComponent {

    val a : A ...
    val b : B ... 

    // 以 View 數值注入
    val presenter : Presenter by inject { parametersOf(a, b) }
}
```

## 定義一個 "注入參數"

以下是一個注入參數的範例。我們確立了需要一個 `view` 參數來建立 `Presenter` 類別。我們使用 `params` 函數引數來幫助檢索我們注入的參數：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { params -> Presenter(view = params.get()) }
}
```

您也可以直接使用參數物件 (parameters object) 寫入注入的參數，作為解構宣告 (destructured declaration)：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { (view : View) -> Presenter(view) }
}
```

:::caution
即使 "解構" 宣告更方便且更具可讀性，但它不是型別安全的 (type safe)。如果您有多個數值，Kotlin 不會檢測到傳遞的型別是否順序正確。
:::

## 依序解析注入的參數

如果您有多個相同型別的參數，您可以像以下方式使用索引 `get(index)` 來取代使用 `get()` 來解析參數（也與 `[ ]` 運算子相同）：

```kotlin
class Presenter(val view : View)

val myModule = module {
    
    single { p -> Presenter(p[0],p[1]) }
}
```

## 從圖表解析注入的參數

Koin 圖表解析 (graph resolution) （所有定義的解析的主樹狀結構）也允許您找到注入的參數。只需使用常用的 `get()` 函數：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { Presenter(get()) }
}
```

## 注入的參數：索引數值或集合 (`3.4.3`)

除了 `parametersOf` 之外，還可以使用以下 API：

- `parameterArrayOf`: 使用數值陣列，資料將依其索引使用

```kotlin
val params = parameterArrayOf(1,2,3)
params.get<Int>() == 1
params.get<Int>() == 2
params.get<Int>() == 3
params.get<Int>() == 3
```

- `parameterSetOf`: 使用數值集合，具有不同的種類。不使用索引來滾動數值。

```kotlin
val params = parameterSetOf("a_string", 42)
params.get<Int>() == 42
params.get<String>() == "a_string"
params.get<Int>() == 42
params.get<String>() == "a_string"
```

預設函數 `parametersOf` 適用於索引和數值集合：

```kotlin
val params = parametersOf(1,2,"a_string")
params.get<String>() == "a_string"
params.get<Int>() == 1
params.get<Int>() == 2
params.get<Int>() == 2
params.get<String>() == "a_string"
```

:::note
  您可以使用 `parametersOf` 或 `parameterArrayOf` "串聯" 參數注入，以基於索引來消耗數值。或者使用 `parametersOf` 或 `parameterSetOf` 根據型別進行串聯以進行解析。
:::
