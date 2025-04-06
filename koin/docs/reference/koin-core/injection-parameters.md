---
title: "传递参数 - 注入参数"
---
在任何定义中，你都可以使用注入参数（injection parameters）：这些参数将被注入并被你的定义使用。

## 传递值以进行注入

给定一个定义，你可以将参数传递给该定义：

```kotlin
class Presenter(val a : A, val b : B)

val myModule = module {
    single { params -> Presenter(a = params.get(), b = params.get()) }
}
```

参数通过 `parametersOf()` 函数（每个值用逗号分隔）发送到你的定义中：

```kotlin
class MyComponent : View, KoinComponent {

    val a : A ...
    val b : B ... 

    // inject this as View value
    val presenter : Presenter by inject { parametersOf(a, b) }
}
```

## 定义一个 "注入参数"

以下是一个注入参数的示例。我们确定需要一个 `view` 参数来构建 `Presenter` 类。我们使用 `params` 函数参数来帮助检索我们注入的参数：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { params -> Presenter(view = params.get()) }
}
```

你也可以使用参数对象，以解构声明的形式直接编写注入的参数：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { (view : View) -> Presenter(view) }
}
```

:::caution
即使 "解构" 声明更方便和可读，但它不是类型安全的。如果你有多个值，Kotlin 不会检测到传递的类型顺序是否正确
:::

## 按顺序解析注入的参数

如果你有几个相同类型的参数，你可以使用索引 `get(index)`（与 `[ ]` 运算符相同）来代替使用 `get()` 来解析参数：

```kotlin
class Presenter(val view : View)

val myModule = module {
    
    single { p -> Presenter(p[0],p[1]) }
}
```

## 从图中解析注入的参数

Koin 图解析（所有定义解析的主树）也允许你找到注入的参数。只需使用常用的 `get()` 函数：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single { Presenter(get()) }
}
```

## 注入参数：索引值或集合 (`3.4.3`)

除了 `parametersOf`，以下 API 也可以访问：

- `parameterArrayOf`：使用一个值数组，数据将通过其索引使用

```kotlin
val params = parameterArrayOf(1,2,3)
params.get<Int>() == 1
params.get<Int>() == 2
params.get<Int>() == 3
params.get<Int>() == 3
```

- `parameterSetOf`：使用一组具有不同种类的值。不使用索引来滚动值。

```kotlin
val params = parameterSetOf("a_string", 42)
params.get<Int>() == 42
params.get<String>() == "a_string"
params.get<Int>() == 42
params.get<String>() == "a_string"
```

默认函数 `parametersOf` 同时使用索引和值集：

```kotlin
val params = parametersOf(1,2,"a_string")
params.get<String>() == "a_string"
params.get<Int>() == 1
params.get<Int>() == 2
params.get<Int>() == 2
params.get<String>() == "a_string"
```

:::note
你可以使用 `parametersOf` 或 `parameterArrayOf` "级联" 参数注入，以基于索引使用值。或者使用 `parametersOf` 或 `parameterSetOf` 基于类型级联以进行解析。
:::