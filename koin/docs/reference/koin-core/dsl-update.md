---
title: "构造器 DSL (Constructor DSL)"
---
Koin 现在提供了一种新的 DSL 关键字，允许你直接定位到一个类的构造函数，避免在 lambda 表达式中编写定义。

对于一个给定的类 `ClassA`，具有以下依赖：

```kotlin
class ClassA(val b : ClassB, val c : ClassC)
class ClassB()
class ClassC()
```

你现在可以直接定位到 `class constructor`（类的构造函数）来声明这些组件：

```kotlin
module {
    singleOf(::ClassA)
    singleOf(::ClassB)
    singleOf(::ClassC)
}
```

不再需要在构造函数中使用 `get()` 函数来指定依赖了！🎉

:::info
请务必在类名前使用 `::`，以定位到你的类的构造函数。
:::

:::note
你的构造函数将自动填充所有 `get()`。避免使用任何默认值，因为 Koin 将尝试在当前 graph（图）中找到它。
:::

:::note
如果你需要检索一个 "named"（具名）的定义，你需要使用带有 lambda 和 `get()` 的标准 DSL 来指定 qualifier（限定符）。
:::

## Available Keywords（可用关键字）

以下关键字可用于从构造函数构建你的定义：

* `factoryOf` - 等同于 `factory { }` - factory（工厂）定义
* `singleOf` - 等同于 `single { }` - single（单例）定义
* `scopedOf` - 等同于 `scoped { }` - scoped（作用域）定义

:::info
请确保不要在构造函数中使用任何默认值，因为 Koin 将尝试使用它来填充每个参数。
:::

## DSL Options（DSL 选项）

任何 Constructor DSL Definition（构造函数 DSL 定义），也可以在 lambda 中打开一些选项：

```kotlin
module {
    singleOf(::ClassA) { 
        // definition options（定义选项）
        named("my_qualifier")
        bind<InterfaceA>()
        createdAtStart()
    }
}
```

常用的选项和 DSL 关键字在这个 lambda 中可用：

* `named("a_qualifier")` - 给定一个 String qualifier（字符串限定符）给定义
* `named<MyType>()` - 给定一个 Type qualifier（类型限定符）给定义
* `bind<MyInterface>()` - 为给定的 bean（Bean）定义添加要绑定的类型
* `binds(listOf(...))` - 为给定的 bean（Bean）定义添加类型列表
* `createdAtStart()` - 在 Koin 启动时创建 single（单例）实例

你也可以使用 `bind` 或 `binds` 操作符，而无需任何 lambda：

```kotlin
module {
    singleOf(::ClassA) bind InterfaceA::class
}
```

## Injected Parameters（注入的参数）

通过这种声明方式，你仍然可以使用注入的参数。Koin 将在注入的参数和当前依赖项中查找，以尝试注入你的构造函数。

像下面这样：

```kotlin
class MyFactory(val id : String)
```

使用 Constructor DSL（构造函数 DSL）声明：

```kotlin
module {
    factoryOf(::MyFactory)
}
```

可以像这样注入：

```kotlin
val id = "a_factory_id"
val factory = koin.get<MyFactory> { parametersOf(id)}
```

## Reflection Based DSL (Deprecated since 3.2)（基于反射的 DSL（自 3.2 起已弃用））

:::caution
Koin Reflection DSL（Koin 反射 DSL）现在已弃用。请使用上面的 Koin Constructor DSL（Koin 构造函数 DSL）。
:::