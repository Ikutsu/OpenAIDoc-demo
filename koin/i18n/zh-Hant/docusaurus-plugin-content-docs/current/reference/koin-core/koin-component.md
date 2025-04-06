---
title: Koin Component
---
```markdown
Koin 是一個 DSL，用於描述你的模組和定義，也是一個容器，用於解析定義。現在我們需要的是一個 API 來從容器外部檢索我們的實例。這就是 Koin 組件的目標。

:::info
`KoinComponent` 介面旨在幫助你直接從 Koin 檢索實例。請注意，這會將你的類別連結到 Koin 容器 API。避免在可以在 `modules` 中宣告的類別上使用它，而應優先使用建構函式注入 (constructor injection)。
:::

## 建立 Koin 組件 (Koin Component)

為了賦予一個類別使用 Koin 功能的能力，我們需要用 `KoinComponent` 介面 *標記它 (tag it)*。 讓我們舉一個例子。

定義 MyService 實例的模組 (module)
```kotlin
class MyService

val myModule = module {
    // 定義 MyService 的單例 (singleton)
    single { MyService() }
}
```

在使用定義之前，我們啟動 Koin。

使用 myModule 啟動 Koin

```kotlin
fun main(vararg args : Array<String>){
    // 啟動 Koin
    startKoin {
        modules(myModule)
    }

    // 建立 MyComponent 實例並從 Koin 容器注入
    MyComponent()
}
```

以下是如何編寫我們的 `MyComponent` 以從 Koin 容器檢索實例。

使用 get() & by inject() 注入 MyService 實例

```kotlin
class MyComponent : KoinComponent {

    // 延遲注入 (lazy inject) Koin 實例
    val myService : MyService by inject()

    // 或
    // 立即注入 (eager inject) Koin 實例
    val myService : MyService = get()
}
```

## 使用 KoinComponents 解鎖 Koin API

一旦你將你的類別標記為 `KoinComponent`，你就可以訪問：

* `by inject()` - 從 Koin 容器延遲評估 (lazy evaluated) 的實例
* `get()` - 從 Koin 容器積極獲取 (eager fetch) 實例
* `getProperty()`/`setProperty()` - 取得/設定屬性 (property)


## 使用 get & inject 檢索定義

Koin 提供了兩種從 Koin 容器檢索實例的方法：

* `val t : T by inject()` - 延遲評估 (lazy evaluated) 的委託實例
* `val t : T = get()` - 立即存取 (eager access) 實例

```kotlin
// 是延遲評估的 (is lazy evaluated)
val myService : MyService by inject()

// 直接檢索實例 (retrieve directly the instance)
val myService : MyService = get()
```

:::note
 延遲注入形式 (lazy inject form) 更適合定義需要延遲評估 (lazy evaluation) 的屬性。
:::

## 從其名稱解析實例 (Resolving instance from its name)

如果需要，你可以使用 `get()` 或 `by inject()` 指定以下參數：

* `qualifier` - 定義的名稱（當在你的定義中指定了 name 參數時）

使用定義名稱的模組示例：

```kotlin
val module = module {
    single(named("A")) { ComponentA() }
    single(named("B")) { ComponentB(get()) }
}

class ComponentA
class ComponentB(val componentA: ComponentA)
```

我們可以進行以下解析：

```kotlin
// 從給定的模組檢索 (retrieve from given module)
val a = get<ComponentA>(named("A"))
```
```
