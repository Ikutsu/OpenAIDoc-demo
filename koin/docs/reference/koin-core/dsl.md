---
title: "Koin DSL"
---
得益于 Kotlin 语言的强大功能，Koin 提供了一种 DSL（领域特定语言）来帮助你描述你的应用程序，而不是对其进行注解或生成代码。凭借其 Kotlin DSL，Koin 提供了一个智能的函数式 API 来实现依赖注入。

## Application（应用）& Module（模块）DSL

Koin 提供了几个关键字来让你描述 Koin 应用程序的元素：

- Application DSL（应用 DSL），用于描述 Koin 容器配置
- Module DSL（模块 DSL），用于描述需要被注入的组件

## Application（应用）DSL

`KoinApplication` 实例是一个 Koin 容器实例配置。它允许你配置日志记录、属性加载和模块。

要构建一个新的 `KoinApplication`，请使用以下函数：

* `koinApplication { }` - 创建一个 `KoinApplication` 容器配置
* `startKoin { }` - 创建一个 `KoinApplication` 容器配置，并将其注册到 `GlobalContext`（全局上下文）中，以允许使用 GlobalContext API

要配置你的 `KoinApplication` 实例，你可以使用以下任何函数：

* `logger( )` - 描述要使用的日志级别和 Logger 实现（默认使用 EmptyLogger）
* `modules( )` - 设置要加载到容器中的 Koin 模块列表（列表或可变参数列表）
* `properties()` - 将 HashMap 属性加载到 Koin 容器中
* `fileProperties( )` - 从给定文件加载属性到 Koin 容器中
* `environmentProperties( )` - 从操作系统（OS）环境加载属性到 Koin 容器中
* `createEagerInstances()` - 创建预先实例化的单例（Single 定义标记为 `createdAtStart`）

## KoinApplication 实例：Global（全局）vs Local（本地）

正如你在上面看到的，我们可以用两种方式描述 Koin 容器配置：`koinApplication` 或 `startKoin` 函数。

- `koinApplication` 描述一个 Koin 容器实例
- `startKoin` 描述一个 Koin 容器实例，并将其注册到 Koin `GlobalContext` 中

通过将你的容器配置注册到 `GlobalContext` 中，全局 API 可以直接使用它。任何 `KoinComponent` 都引用一个 `Koin` 实例。默认情况下，我们使用来自 `GlobalContext` 的实例。

查看关于自定义 Koin 实例的章节以获取更多信息。

## Starting（启动）Koin

启动 Koin 意味着在 `GlobalContext` 中运行一个 `KoinApplication` 实例。

要使用模块启动 Koin 容器，我们可以像这样使用 `startKoin` 函数：

```kotlin
// 在全局上下文中启动 KoinApplication
startKoin {
    // 声明使用的 logger
    logger()
    // 声明使用的模块
    modules(coffeeAppModule)
}
```

## Module（模块）DSL

一个 Koin 模块收集你将为你的应用程序注入/组合的定义。要创建一个新模块，只需使用以下函数：

* `module { // module content }` - 创建一个 Koin 模块

要在模块中描述你的内容，你可以使用以下函数：

* `factory { //definition }` - 提供一个工厂 bean 定义
* `single { //definition  }` - 提供一个单例 bean 定义（也别名为 `bean`）
* `get()` - 解析一个组件依赖（也可以使用 name、scope 或 parameters）
* `bind()` - 为给定的 bean 定义添加类型绑定
* `binds()` - 为给定的 bean 定义添加类型数组绑定
* `scope { // scope group }` - 为 `scoped` 定义定义一个逻辑组
* `scoped { //definition }`- 提供一个只存在于 scope 中的 bean 定义

注意：`named()` 函数允许你通过字符串、枚举或类型来给出一个限定符（qualifier）。它用于命名你的定义。

### Writing（编写）一个模块

一个 Koin 模块是*声明所有组件的空间*。使用 `module` 函数来声明一个 Koin 模块：

```kotlin
val myModule = module {
   // 你的依赖在这里
}
```

在这个模块中，你可以声明如下所述的组件。

### withOptions - DSL Options（DSL 选项）（since 3.2）

与新的 [Constructor DSL](./dsl-update.md) 定义类似，你可以使用 `withOptions` 运算符在“常规”定义上指定定义选项：

```kotlin
module {
    single { ClassA(get()) } withOptions { 
        named("qualifier")
        createdAtStart()
    }
}
```

在此选项 lambda 中，你可以指定以下选项：

* `named("a_qualifier")` - 给定义一个 String 类型的限定符
* `named<MyType>()` - 给定义一个 Type 类型的限定符
* `bind<MyInterface>()` - 为给定的 bean 定义添加类型绑定
* `binds(arrayOf(...))` - 为给定的 bean 定义添加类型数组绑定
* `createdAtStart()` - 在 Koin 启动时创建单例实例