---
title: Koin DSL
---
由於 Kotlin 語言的強大功能，Koin 提供了一種 DSL（Domain Specific Language，領域特定語言）來幫助您描述您的應用程式，而不是使用註解或生成程式碼。憑藉其 Kotlin DSL，Koin 提供了一個聰明的函式式 API 來實現依賴注入 (Dependency Injection)。

## 應用程式 & 模組 DSL

Koin 提供了幾個關鍵字，讓您可以描述 Koin 應用程式 (Koin Application) 的元素：

- 應用程式 DSL（Application DSL），用於描述 Koin 容器 (Koin container) 的配置
- 模組 DSL（Module DSL），用於描述必須被注入的元件

## 應用程式 DSL

一個 `KoinApplication` 實例是一個 Koin 容器實例的配置。這將讓您配置日誌記錄、屬性加載和模組。

要建構一個新的 `KoinApplication`，請使用以下函式：

* `koinApplication { }` - 建立一個 `KoinApplication` 容器配置
* `startKoin { }` - 建立一個 `KoinApplication` 容器配置，並將其註冊到 `GlobalContext` 中，以允許使用 GlobalContext API

要配置您的 `KoinApplication` 實例，您可以使用以下任何函式：

* `logger( )` - 描述要使用的日誌級別和 Logger 實現（預設使用 EmptyLogger）
* `modules( )` - 設定要在容器中載入的 Koin 模組列表（列表或可變參數列表）
* `properties()` - 將 HashMap 屬性載入到 Koin 容器中
* `fileProperties( )` - 從給定的檔案載入屬性到 Koin 容器中
* `environmentProperties( )` - 從作業系統環境載入屬性到 Koin 容器中
* `createEagerInstances()` - 建立預先實例 (eager instances)（標記為 `createdAtStart` 的 Single 定義）

## KoinApplication 實例：全域 vs 區域

正如您在上面看到的，我們可以用 2 種方式描述一個 Koin 容器配置：`koinApplication` 或 `startKoin` 函式。

- `koinApplication` 描述一個 Koin 容器實例
- `startKoin` 描述一個 Koin 容器實例，並將其註冊到 Koin `GlobalContext` 中

透過將您的容器配置註冊到 `GlobalContext` 中，全域 API (Global API) 可以直接使用它。任何 `KoinComponent` 都參考一個 `Koin` 實例。預設情況下，我們使用來自 `GlobalContext` 的那個。

請查看關於自訂 Koin 實例 (Custom Koin instance) 的章節以取得更多資訊。

## 啟動 Koin

啟動 Koin 意味著在 `GlobalContext` 中執行一個 `KoinApplication` 實例。

要使用模組啟動 Koin 容器，我們可以像這樣使用 `startKoin` 函式：

```kotlin
// 在全域上下文中啟動 KoinApplication
startKoin {
    // 宣告使用的 logger
    logger()
    // 宣告使用的模組
    modules(coffeeAppModule)
}
```

## 模組 DSL

一個 Koin 模組收集了您將為您的應用程式注入/組合的定義 (definitions)。要建立一個新的模組，只需使用以下函式：

* `module { // 模組內容 }` - 建立一個 Koin 模組

要在模組中描述您的內容，您可以使用以下函式：

* `factory { //定義 }` - 提供一個 factory bean 定義
* `single { //定義  }` - 提供一個 singleton bean 定義 (也被稱為 `bean`)
* `get()` - 解析元件依賴 (component dependency)（也可以使用名稱、作用域或參數）
* `bind()` - 為給定的 bean 定義添加要綁定的類型
* `binds()` - 為給定的 bean 定義添加類型陣列
* `scope { // 作用域群組 }` - 為 `scoped` 定義定義一個邏輯群組
* `scoped { //定義 }`- 提供一個 bean 定義，它只存在於一個作用域中

注意：`named()` 函式允許您透過字串、枚舉或類型給定一個限定符 (qualifier)。它用於命名您的定義。

### 編寫一個模組

一個 Koin 模組是*宣告所有您的元件的空間*。 使用 `module` 函式來宣告一個 Koin 模組：

```kotlin
val myModule = module {
   // 您的依賴項在這裡
}
```

在這個模組中，您可以宣告如下所述的元件。

### withOptions - DSL 選項 (since 3.2)

與新的 [Constructor DSL](./dsl-update.md) 定義一樣，您可以使用 `withOptions` 運算符在“常規”定義上指定定義選項：

```kotlin
module {
    single { ClassA(get()) } withOptions { 
        named("qualifier")
        createdAtStart()
    }
}
```

在這個選項 lambda 中，您可以指定以下選項：

* `named("a_qualifier")` - 給予定義一個字串限定符 (String qualifier)
* `named<MyType>()` - 給予定義一個類型限定符 (Type qualifier)
* `bind<MyInterface>()` - 為給定的 bean 定義添加要綁定的類型
* `binds(arrayOf(...))` - 為給定的 bean 定義添加類型陣列
* `createdAtStart()` - 在 Koin 啟動時建立單例實例 (single instance)
