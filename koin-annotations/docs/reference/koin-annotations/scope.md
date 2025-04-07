---
title: "Koin 注解中的作用域 (Scopes)"
---
使用定义和模块时，您可能需要为特定的空间和时间分辨率定义作用域（scope）。

## 使用 @Scope 定义作用域

Koin 允许使用作用域，有关基础知识的更多详细信息，请参阅 [Koin 作用域](../../../../../../../../reference/koin-core/scopes.md) 部分。

要使用注解声明作用域，只需在类上使用 `@Scope` 注解，如下所示：

```kotlin
@Scope
class MyScopeClass
```

> 这将等同于以下作用域部分：
> ```kotlin
> scope<MyScopeClass> {
>
>}
> ```

另外，如果您需要的不是类型，而是一个作用域名称，则需要使用 `name` 参数，用 `@Scope(name = )` 注解标记一个类：

```kotlin
@Scope(name = "my_scope_name")
class MyScopeClass
```

> 这将等同于
>
> ```kotlin
>scope<named("my_scope_name")> {
>
>}
>```

## 使用 @Scoped 在作用域中添加定义

要在作用域内声明定义（使用注解定义或不使用注解定义），只需使用 `@Scope` 和 `@Scoped` 注解标记一个类：

```kotlin
@Scope(name = "my_scope_name")
@Scoped
class MyScopedComponent
```

这将在作用域部分中生成正确的定义：

```kotlin
scope<named("my_scope_name")> {
  scoped { MyScopedComponent() }
}
```

:::info
您需要同时使用这两个注解，以指示所需的作用域空间（使用 `@Scope`）和要定义的组件类型（使用 `@Scoped`）。
:::

## 从作用域解析依赖项

从作用域定义中，您可以从内部作用域和父作用域解析任何定义。

例如，以下情况将有效：

```kotlin
@Single
class MySingle

@Scope(name = "my_scope_name")
@Scoped
class MyScopedComponent(
  val mySingle : MySingle,
  val myOtherScopedComponent :MyOtherScopedComponent
)

@Scope(name = "my_scope_name")
@Scoped
class MyOtherScopedComponent(
  val mySingle : MySingle
)
```

组件 `MySingle` 在根目录中定义为 `single` 定义。`MyScopedComponent` 和 `MyOtherScopedComponent` 在作用域 "my_scope_name" 中定义。
从 `MyScopedComponent` 解析依赖项时，将使用 `MySingle` 实例访问 Koin 根目录，并从当前 "my_scope_name" 作用域访问 `MyOtherScopedComponent` 作用域实例。

## 使用 @ScopeId 从作用域外部解析（自 1.3.0 起）

您可能需要从另一个作用域解析组件，该作用域无法直接访问您的作用域。为此，您需要使用 `@ScopeId` 注解标记您的依赖项，以告诉 Koin 在给定作用域 ID 的作用域中查找此依赖项。

```kotlin
@Factory
class MyFactory(
  @ScopeId("my_scope_id") val myScopedComponent :MyScopedComponent
)
```

上面的代码等同于生成的代码：

```kotlin
factory { Myfactory(getScope("my_scope_id").get()) }
```

此示例表明，`MyFactory` 组件将从 ID 为 "my_scope_id" 的作用域实例解析 `MyScopedComponent` 组件。需要使用正确的作用域定义创建使用 ID "my_scope_id" 创建的此作用域。

:::info
`MyScopedComponent` 组件需要在 Scope 部分中定义，并且需要使用 ID "my_scope_id" 创建作用域实例。
:::