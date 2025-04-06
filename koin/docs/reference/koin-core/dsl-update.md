---
title: Constructor DSL
---
Koin 现在提供了一种新的 DSL 关键字，可以直接定位到类的构造函数，避免在 lambda 表达式中编写定义。

对于给定的类 `ClassA` 及其以下依赖项：

```kotlin
class ClassA(val b : ClassB, val c : ClassC)
class ClassB()
class ClassC()
```

现在可以直接定位 `class constructor` 来声明这些组件：

```kotlin
module {
    singleOf(::ClassA)
    singleOf(::ClassB)
    singleOf(::ClassC)
}
```

不再需要在构造函数中使用 `get()` 函数指定依赖项了！🎉

:::info
请务必在类名前使用 `::`，以定位到类的构造函数
:::

:::note
您的构造函数会自动填充所有 `get()`。 避免使用任何默认值，因为 Koin 会尝试在当前 graph（图）中找到它。
:::

:::note
如果需要检索 "named"（具名）的定义，则需要使用带有 lambda 和 `get()` 的标准 DSL 来指定 qualifier（限定符）
:::

## Available Keywords（可用关键字）

以下关键字可用于从构造函数构建定义：

* `factoryOf` - 相当于 `factory { }` - factory（工厂）定义
* `singleOf` - 相当于 `single { }` - single（单例）定义
* `scopedOf` - 相当于 `scoped { }` - scoped（作用域）定义

:::info
请确保不要在构造函数中使用任何默认值，因为 Koin 会尝试使用它填充每个参数。
:::

## DSL Options（DSL 选项）

任何 Constructor DSL Definition（构造函数 DSL 定义），都可以在 lambda 中打开一些选项：

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

常用的选项和 DSL 关键字在此 lambda 中可用：

* `named("a_qualifier")` - 为定义提供 String qualifier（字符串限定符）
* `named<MyType>()` - 为定义提供 Type qualifier（类型限定符）
* `bind<MyInterface>()` - 为给定 bean definition（Bean定义）添加要绑定的类型
* `binds(listOf(...))` - 为给定 bean definition（Bean定义）添加类型列表
* `createdAtStart()` - 在 Koin 启动时创建 single（单例）实例

您还可以使用 `bind` 或 `binds` 运算符，而无需任何 lambda：

```kotlin
module {
    singleOf(::ClassA) bind InterfaceA::class
}
```

## Injected Parameters（注入的参数）

使用这种声明，您仍然可以使用 injected parameters（注入的参数）。 Koin 将在 injected parameters（注入的参数）和当前依赖项中查找，以尝试注入您的构造函数。

像这样：

```kotlin
class MyFactory(val id : String)
```

使用 Constructor DSL（构造函数 DSL）声明：

```kotlin
module {
    factoryOf(::MyFactory)
}
```

可以这样注入：

```kotlin
val id = "a_factory_id"
val factory = koin.get<MyFactory> { parametersOf(id)}
```


## Reflection Based DSL (Deprecated since 3.2) （基于反射的 DSL（自 3.2 起已弃用））

:::caution
Koin Reflection DSL（Koin 反射 DSL）现在已弃用。 请使用上面的 Koin Constructor DSL（Koin 构造函数 DSL）
:::
