---
title: Definitions
---
藉由使用 Koin，你可以在模組中描述定義。在本節中，我們將了解如何宣告、組織和連結你的模組。

## 編寫模組 (Writing a module)

Koin 模組是*宣告所有元件的空間*。使用 `module` 函數來宣告一個 Koin 模組：

```kotlin
val myModule = module {
   // 你的相依性在此
}
```

在這個模組中，你可以宣告如下所述的元件。

## 定義單例 (Defining a singleton)

宣告一個單例元件意味著 Koin 容器將保留你宣告的元件的*唯一實例*。在模組中使用 `single` 函數來宣告一個單例：

```kotlin
class MyService()

val myModule = module {

    // 宣告 MyService 類別的單例實例
    single { MyService() }
}
```

## 在 Lambda 表達式中定義你的元件 (Defining your component within a lambda)

`single`、`factory` 和 `scoped` 關鍵字幫助你透過 Lambda 表達式宣告你的元件。這個 Lambda 表達式描述了你建構元件的方式。通常我們透過它們的建構函式實例化元件，但你也可以使用任何表達式。

`single { Class 建構函式 // Kotlin 表達式 }`

你的 Lambda 表達式的結果類型是你元件的主要類型。

## 定義工廠 (Defining a factory)

工廠元件宣告是一個定義，它將*每次*在你請求此定義時提供一個*新的實例*（這個實例不會被 Koin 容器保留，因為它稍後不會將此實例注入到其他定義中）。使用帶有 Lambda 表達式的 `factory` 函數來建構一個元件。

```kotlin
class Controller()

val myModule = module {

    // 宣告 Controller 類別的工廠實例
    factory { Controller() }
}
```

:::info
 Koin 容器不保留工廠實例，因為它會在每次請求定義時給出一個新的實例。
:::

## 解析與注入相依性 (Resolving & injecting dependencies)

現在我們可以宣告元件定義了，我們想要用相依性注入來連結實例。要在 Koin 模組中*解析一個實例*，只需使用 `get()`
函數來取得請求的所需元件實例。這個 `get()` 函數通常在建構函式中使用，以注入建構函式值。

:::info
 為了使用 Koin 容器進行相依性注入，我們必須以*建構函式注入*風格編寫它：在類別建構函式中解析相依性。這樣，你的實例將會以 Koin 注入的實例建立。
:::

讓我們以幾個類別為例：

```kotlin
// Presenter <- Service
class Service()
class Controller(val view : View)

val myModule = module {

    // 宣告 Service 為單例實例
    single { Service() }
    // 宣告 Controller 為單例實例，使用 get() 解析 View 實例
    single { Controller(get()) }
}
```

## 定義：綁定介面 (Definition: binding an interface)

`single` 或 `factory` 定義使用來自它們給定的 Lambda 定義的類型，即：`single { T }`
定義的匹配類型是來自此表達式的唯一匹配類型。

讓我們以一個類別和實現的介面為例：

```kotlin
// Service 介面
interface Service{

    fun doSomething()
}

// Service 實作
class ServiceImp() : Service {

    fun doSomething() { ... }
}
```

在 Koin 模組中，我們可以如下使用 `as` 轉換 Kotlin 運算子：

```kotlin
val myModule = module {

    // 將只匹配 ServiceImp 類型
    single { ServiceImp() }

    // 將只匹配 Service 類型
    single { ServiceImp() as Service }

}
```

你也可以使用推斷類型表達式：

```kotlin
val myModule = module {

    // 將只匹配 ServiceImp 類型
    single { ServiceImp() }

    // 將只匹配 Service 類型
    single<Service> { ServiceImp() }

}
```

:::note
 這種第二種風格的宣告是首選的，並將用於本文件其餘部分。
:::

## 額外的類型綁定 (Additional type binding)

在某些情況下，我們希望從一個定義中匹配多個類型。

讓我們以一個類別和介面為例：

```kotlin
// Service 介面
interface Service{

    fun doSomething()
}

// Service 實作
class ServiceImp() : Service{

    fun doSomething() { ... }
}
```

為了使定義綁定額外的類型，我們使用帶有類別的 `bind` 運算子：

```kotlin
val myModule = module {

    // 將匹配 ServiceImp & Service 類型
    single { ServiceImp() } bind Service::class
}
```

請注意，我們可以直接使用 `get()` 解析 `Service` 類型。但是如果我們有多個定義綁定 `Service`，我們必須使用 `bind<>()` 函數。

## 定義：命名和預設綁定 (Definition: naming & default bindings)

你可以為你的定義指定一個名稱，以幫助你區分關於相同類型的兩個定義：

只需使用其名稱請求你的定義：

```kotlin
val myModule = module {
    single<Service>(named("default")) { ServiceImpl() }
    single<Service>(named("test")) { ServiceImpl() }
}

val service : Service by inject(qualifier = named("default"))
```

如果需要，`get()` 和 `by inject()` 函數允許你指定一個定義名稱。這個名稱是由 `named()` 函數產生的 `qualifier`（限定詞）。

預設情況下，如果類型已經綁定到一個定義，Koin 將按其類型或按其名稱綁定一個定義。

```kotlin
val myModule = module {
    single<Service> { ServiceImpl1() }
    single<Service>(named("test")) { ServiceImpl2() }
}
```

然後：

- `val service : Service by inject()` 將觸發 `ServiceImpl1` 定義
- `val service : Service by inject(named("test"))` 將觸發 `ServiceImpl2` 定義

## 宣告注入參數 (Declaring injection parameters)

在任何定義中，你都可以使用注入參數（injection parameters）：將被注入並由你的定義使用的參數：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single{ (view : View) -> Presenter(view) }
}
```

與已解析的相依性（使用 `get()` 解析）相反，注入參數是*透過解析 API 傳遞的參數*。
這意味著這些參數是使用 `get()` 和 `by inject()` 傳遞的值，並使用 `parametersOf` 函數：

```kotlin
val presenter : Presenter by inject { parametersOf(view) }
```

更多資訊請參閱 [注入參數章節](/docs/reference/koin-core/injection-parameters)

## 定義終止 - OnClose

你可以使用 `onClose` 函數，在定義上添加一個回呼，一旦呼叫定義關閉：

```kotlin
class Presenter(val view : View)

val myModule = module {
    factory { (view : View) -> Presenter(view) } onClose { // 關閉回呼 - 它是 Presenter }
}
```

## 使用定義標誌 (Using definition flags)

Koin DSL 還提出了一些標誌（flags）。

### 在啟動時建立實例 (Create instances at start)

一個定義或一個模組可以被標記為 `CreatedAtStart`，以便在啟動時（或在你想要時）建立。首先在你的模組或你的定義上設定 `createdAtStart` 標誌。

在定義上使用 CreatedAtStart 標誌：

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module {

    // 為這個定義進行渴望建立（eager creation）
    single<Service>(createdAtStart=true) { TestServiceImp() }
}
```

在模組上使用 CreatedAtStart 標誌：

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module(createdAtStart=true) {

    single<Service>{ TestServiceImp() }
}
```

`startKoin` 函數將自動建立標記有 `createdAtStart` 的定義實例。

```kotlin
// 啟動 Koin 模組
startKoin {
    modules(myModuleA,myModuleB)
}
```

:::info
如果你需要在一個特殊的時間載入一些定義（例如在一個背景執行緒而不是 UI 中），只需 get/inject 所需的元件。
:::

### 處理泛型 (Dealing with generics)

Koin 定義不考慮泛型類型參數。例如，下面的模組試圖定義 2 個 List 的定義：

```kotlin
module {
    single { ArrayList<Int>() }
    single { ArrayList<String>() }
}
```

Koin 不會啟動這樣的定義，它會理解你想要覆蓋一個定義用於另一個定義。

為了允許你使用這 2 個定義，你必須透過它們的名稱或位置（模組）來區分它們。例如：

```kotlin
module {
    single(named("Ints")) { ArrayList<Int>() }
    single(named("Strings")) { ArrayList<String>() }
}
```
