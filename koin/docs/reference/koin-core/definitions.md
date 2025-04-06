---
title: Definitions
---
通过使用 Koin，你可以在模块中描述定义。在本节中，我们将了解如何声明、组织和链接你的模块。

## 编写模块

Koin 模块是*声明所有组件的空间*。使用 `module` 函数来声明一个 Koin 模块：

```kotlin
val myModule = module {
   // 你的依赖项在这里
}
```

在此模块中，你可以声明如下所述的组件。

## 定义单例

声明单例组件意味着 Koin 容器将保留你声明的组件的*唯一实例*。在模块中使用 `single` 函数来声明单例：

```kotlin
class MyService()

val myModule = module {

    // 为 MyService 类声明单例实例
    single { MyService() }
}
```

## 在 Lambda 表达式中定义组件

`single`、`factory` 和 `scoped` 关键字可帮助你通过 Lambda 表达式声明组件。此 Lambda 表达式描述了你构建组件的方式。通常，我们通过构造函数实例化组件，但你也可以使用任何表达式。

`single { Class constructor // Kotlin 表达式 }`

Lambda 表达式的结果类型是组件的主要类型。

## 定义工厂

工厂组件声明是一个定义，它将*每次*在你请求此定义时提供一个*新实例*（此实例不会被 Koin 容器保留，因为它不会在以后将此实例注入到其他定义中）。使用带有 Lambda 表达式的 `factory` 函数来构建组件。

```kotlin
class Controller()

val myModule = module {

    // 为 Controller 类声明工厂实例
    factory { Controller() }
}
```

:::info
Koin 容器不保留工厂实例，因为它会在每次请求定义时提供一个新实例。
:::

## 解析和注入依赖项

现在我们可以声明组件定义，我们希望将实例与依赖注入链接起来。要在 Koin 模块中*解析实例*，只需使用 `get()` 函数来获取所请求的所需组件实例。`get()` 函数通常在构造函数中使用，以注入构造函数值。

:::info
为了使用 Koin 容器进行依赖注入，我们必须以*构造函数注入*风格编写它：在类构造函数中解析依赖项。这样，你的实例将通过从 Koin 注入的实例来创建。
:::

让我们以几个类为例：

```kotlin
// Presenter <- Service
class Service()
class Controller(val view : View)

val myModule = module {

    // 声明 Service 作为单例实例
    single { Service() }
    // 声明 Controller 作为单例实例，使用 get() 解析 View 实例
    single { Controller(get()) }
}
```

## 定义：绑定接口

`single` 或 `factory` 定义使用来自其给定 Lambda 表达式的类型，即：`single { T }`。定义的匹配类型是此表达式中唯一匹配的类型。

让我们以一个类和实现的接口为例：

```kotlin
// Service 接口
interface Service{

    fun doSomething()
}

// Service 实现
class ServiceImp() : Service {

    fun doSomething() { ... }
}
```

在 Koin 模块中，我们可以使用 `as` 类型转换 Kotlin 运算符，如下所示：

```kotlin
val myModule = module {

    // 将只匹配 ServiceImp 类型
    single { ServiceImp() }

    // 将只匹配 Service 类型
    single { ServiceImp() as Service }

}
```

你也可以使用推断类型表达式：

```kotlin
val myModule = module {

    // 将只匹配 ServiceImp 类型
    single { ServiceImp() }

    // 将只匹配 Service 类型
    single<Service> { ServiceImp() }

}
```

:::note
此第二种声明样式是首选的，并将用于文档的其余部分。
:::

## 额外的类型绑定

在某些情况下，我们希望从一个定义中匹配多种类型。

让我们以一个类和接口为例：

```kotlin
// Service 接口
interface Service{

    fun doSomething()
}

// Service 实现
class ServiceImp() : Service{

    fun doSomething() { ... }
}
```

要使定义绑定其他类型，我们使用带有类的 `bind` 运算符：

```kotlin
val myModule = module {

    // 将匹配 ServiceImp 和 Service 类型
    single { ServiceImp() } bind Service::class
}
```

请注意，我们将使用 `get()` 直接解析 `Service` 类型。但是，如果我们有多个定义绑定 `Service`，我们必须使用 `bind<>()` 函数。

## 定义：命名和默认绑定

你可以为你的定义指定一个名称，以帮助你区分关于同一类型的两个定义：

只需使用其名称请求你的定义：

```kotlin
val myModule = module {
    single<Service>(named("default")) { ServiceImpl() }
    single<Service>(named("test")) { ServiceImpl() }
}

val service : Service by inject(qualifier = named("default"))
```

如果需要，`get()` 和 `by inject()` 函数允许你指定定义名称。此名称是由 `named()` 函数生成的 `qualifier`（限定符）。

默认情况下，如果类型已绑定到定义，Koin 将按其类型或名称绑定定义。

```kotlin
val myModule = module {
    single<Service> { ServiceImpl1() }
    single<Service>(named("test")) { ServiceImpl2() }
}
```

然后：

- `val service : Service by inject()` 将触发 `ServiceImpl1` 定义
- `val service : Service by inject(named("test"))` 将触发 `ServiceImpl2` 定义

## 声明注入参数

在任何定义中，你都可以使用注入参数：将由你的定义注入和使用的参数：

```kotlin
class Presenter(val view : View)

val myModule = module {
    single{ (view : View) -> Presenter(view) }
}
```

与已解析的依赖项（使用 `get()` 解析）相反，注入参数是*通过解析 API 传递的参数*。
这意味着这些参数是使用 `parametersOf` 函数通过 `get()` 和 `by inject()` 传递的值：

```kotlin
val presenter : Presenter by inject { parametersOf(view) }
```

更多信息请参阅[注入参数部分](/docs/reference/koin-core/injection-parameters)。

## 定义终止 - OnClose

你可以使用 `onClose` 函数，在定义上添加回调，一旦调用定义关闭：

```kotlin
class Presenter(val view : View)

val myModule = module {
    factory { (view : View) -> Presenter(view) } onClose { // 关闭回调 - 它是 Presenter }
}
```

## 使用定义标志

Koin DSL 还提出了一些标志。

### 启动时创建实例

一个定义或一个模块可以被标记为 `CreatedAtStart`，以便在启动时（或在你想要时）创建。首先在你的模块或定义上设置 `createdAtStart` 标志。

在定义上设置 CreatedAtStart 标志：

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module {

    // 渴望创建此定义
    single<Service>(createdAtStart=true) { TestServiceImp() }
}
```

在模块上设置 CreatedAtStart 标志：

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module(createdAtStart=true) {

    single<Service>{ TestServiceImp() }
}
```

`startKoin` 函数将自动创建标记为 `createdAtStart` 的定义实例。

```kotlin
// 启动 Koin 模块
startKoin {
    modules(myModuleA,myModuleB)
}
```

:::info
如果你需要在特定时间加载某些定义（例如，在后台线程中而不是在 UI 中），只需获取/注入所需的组件即可。
:::

### 处理泛型

Koin 定义不考虑泛型类型参数。例如，下面的模块尝试定义 List 的 2 个定义：

```kotlin
module {
    single { ArrayList<Int>() }
    single { ArrayList<String>() }
}
```

Koin 不会使用此类定义启动，因为它理解你要覆盖一个定义以用于另一个定义。

为了允许你使用这 2 个定义，你必须通过它们的名称或位置（模块）来区分它们。例如：

```kotlin
module {
    single(named("Ints")) { ArrayList<Int>() }
    single(named("Strings")) { ArrayList<String>() }
}
```
