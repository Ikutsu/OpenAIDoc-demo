---
title: "Koin 组件"
---
Koin 是一个 DSL，用于帮助描述你的模块和定义，一个用于进行定义解析的容器。我们现在需要的是一个 API 来从容器外部检索我们的实例。这就是 Koin 组件的目标。

:::info
`KoinComponent` 接口可以帮助你直接从 Koin 检索实例。请注意，这会将你的类链接到 Koin 容器 API。避免在可以在 `modules` 中声明的类上使用它，并优先选择构造函数注入。
:::

## 创建一个 Koin 组件

为了给一个类使用 Koin 特性的能力，我们需要用 `KoinComponent` 接口来 *标记它*。 让我们举个例子。

一个定义 MyService 实例的模块
```kotlin
class MyService

val myModule = module {
    // 定义一个 MyService 的单例
    single { MyService() }
}
```

在使用定义之前，我们先启动 Koin。

使用 myModule 启动 Koin

```kotlin
fun main(vararg args : String){
    // 启动 Koin
    startKoin {
        modules(myModule)
    }

    // 创建 MyComponent 实例并从 Koin 容器中注入
    MyComponent()
}
```

以下是我们如何编写 `MyComponent` 以从 Koin 容器中检索实例。

使用 get() & by inject() 注入 MyService 实例

```kotlin
class MyComponent : KoinComponent {

    // 延迟注入 Koin 实例
    val myService : MyService by inject()

    // 或者
    // 立即注入 Koin 实例
    val myService : MyService = get()
}
```

## 使用 KoinComponents 解锁 Koin API

一旦你将你的类标记为 `KoinComponent`，你就可以访问：

* `by inject()` - 从 Koin 容器延迟计算的实例
* `get()` - 从 Koin 容器中立即获取实例
* `getProperty()`/`setProperty()` - 获取/设置属性

## 使用 get & inject 检索定义

Koin 提供了两种从 Koin 容器中检索实例的方法：

* `val t : T by inject()` - 延迟计算的委托实例
* `val t : T = get()` - 立即访问实例

```kotlin
// 是延迟计算的
val myService : MyService by inject()

// 直接检索实例
val myService : MyService = get()
```

:::note
延迟注入的形式更适合定义需要延迟计算的属性。
:::

## 从名称解析实例

如果需要，你可以使用 `get()` 或 `by inject()` 指定以下参数

* `qualifier` - 定义的名称（在你的定义中指定了 name 参数时）

使用定义名称的模块示例：

```kotlin
val module = module {
    single(named("A")) { ComponentA() }
    single(named("B")) { ComponentB(get()) }
}

class ComponentA
class ComponentB(val componentA: ComponentA)
```

我们可以进行以下解析：

```kotlin
// 从给定的模块检索
val a = get<ComponentA>(named("A"))
```