---
title: Constructor DSL
---
Koin 現在提供了一種新的 DSL 關鍵字，允許你直接針對類別建構子（class constructor），並避免在 Lambda 表達式中輸入你的定義。

對於給定的類別 `ClassA` 及其以下依賴項：

```kotlin
class ClassA(val b : ClassB, val c : ClassC)
class ClassB()
class ClassC()
```

你現在可以直接針對 `class constructor` 宣告這些元件（components）：

```kotlin
module {
    singleOf(::ClassA)
    singleOf(::ClassB)
    singleOf(::ClassC)
}
```

不再需要在建構子中使用 `get()` 函數指定依賴項了！🎉

:::info
請務必在類別名稱之前使用 `::`，以指定你的類別建構子。
:::

:::note
你的建構子會自動填入所有的 `get()`。避免使用任何預設值，因為 Koin 會嘗試在目前的依賴圖（graph）中尋找它。
:::

:::note
如果你需要檢索一個「具名」的定義（"named" definition），你需要使用帶有 Lambda 表達式的標準 DSL 和 `get()` 來指定限定符（qualifier）。
:::

## 可用的關鍵字（Available Keywords）

以下關鍵字可用於從建構子建構你的定義：

* `factoryOf` - 等同於 `factory { }` - 工廠定義（factory definition）
* `singleOf` - 等同於 `single { }` - 單例定義（single definition）
* `scopedOf` - 等同於 `scoped { }` - 作用域定義（scoped definition）

:::info
請確保不要在建構子中使用任何預設值，因為 Koin 會嘗試使用它來填入每個參數。
:::

## DSL 選項（DSL Options）

任何建構子 DSL 定義，也可以在 Lambda 表達式中打開一些選項：

```kotlin
module {
    singleOf(::ClassA) { 
        // 定義選項（definition options）
        named("my_qualifier")
        bind<InterfaceA>()
        createdAtStart()
    }
}
```

常用的選項和 DSL 關鍵字在這個 Lambda 表達式中都是可用的：

* `named("a_qualifier")` - 給予定義一個字串限定符（String qualifier）
* `named<MyType>()` - 給予定義一個類型限定符（Type qualifier）
* `bind<MyInterface>()` - 為給定的 Bean 定義添加要綁定的類型
* `binds(listOf(...))` - 為給定的 Bean 定義添加類型列表
* `createdAtStart()` - 在 Koin 啟動時建立單例實例

你也可以使用 `bind` 或 `binds` 運算符，而無需任何 Lambda 表達式：

```kotlin
module {
    singleOf(::ClassA) bind InterfaceA::class
}
```

## 注入的參數（Injected Parameters）

透過這種宣告方式，你仍然可以使用注入的參數（injected parameters）。 Koin 將在注入的參數和目前的依賴項中尋找，以嘗試注入你的建構子。

如下所示：

```kotlin
class MyFactory(val id : String)
```

使用建構子 DSL 宣告：

```kotlin
module {
    factoryOf(::MyFactory)
}
```

可以像這樣注入：

```kotlin
val id = "a_factory_id"
val factory = koin.get<MyFactory> { parametersOf(id)}
```

## 基於反射的 DSL（Reflection Based DSL）（自 3.2 起已棄用）

:::caution
Koin 反射 DSL 現在已棄用。請使用上面的 Koin 建構子 DSL。
:::
