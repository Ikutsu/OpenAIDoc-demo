---
title: Scopes
---
Koin 提供了一个简单的 API，允许你定义与有限生命周期绑定的实例。

## 什么是 scope (作用域)？

Scope (作用域) 是一个对象存在的固定持续时间或方法调用的集合。
另一种看待它的方式是将 scope (作用域) 视为对象状态持续存在的时间量。
当 scope (作用域) 上下文结束时，任何绑定在该 scope (作用域) 下的对象都不能再次被注入（它们会从容器中删除）。

## Scope (作用域) 定义

默认情况下，在 Koin 中，我们有 3 种 scope (作用域)：

- `single` 定义，创建一个在整个容器生命周期内持久存在的对象（不能被删除）。
- `factory` 定义，每次创建一个新对象。生命周期短。在容器中没有持久性（不能被共享）。
- `scoped` 定义，创建一个与关联的 scope (作用域) 生命周期绑定的持久对象。

要声明一个 scoped (作用域) 定义，请使用 `scoped` 函数，如下所示。一个 scope (作用域) 将 scoped (作用域) 定义收集为一个逻辑时间单元。

要为给定类型声明 scope (作用域)，我们需要使用 `scope` 关键字：

```kotlin
module {
    scope<MyType>{
        scoped { Presenter() }
        // ...
    }
}
```

### Scope Id (作用域 Id) & Scope Name (作用域名称)

Koin Scope (作用域) 由以下内容定义：

- scope name (作用域名称) - scope (作用域) 的 qualifier (限定符)
- scope id (作用域 id) - scope (作用域) 实例的唯一标识符

:::note
`scope<A> { }` 等同于 `scope(named<A>()){ }`，但写起来更方便。请注意，你也可以使用字符串 qualifier (限定符)，例如：`scope(named("SCOPE_NAME")) { }`
:::

从 `Koin` 实例，你可以访问：

- `createScope(id : ScopeID, scopeName : Qualifier)` - 使用给定的 id 和 scopeName (作用域名称) 创建一个 closed scope (已关闭的作用域) 实例
- `getScope(id : ScopeID)` - 检索先前使用给定 id 创建的 scope (作用域)
- `getOrCreateScope(id : ScopeID, scopeName : Qualifier)` - 创建或检索（如果已创建）具有给定 id 和 scopeName (作用域名称) 的 closed scope (已关闭的作用域) 实例

:::note
默认情况下，在对象上调用 `createScope` 不会传递 scope (作用域) 的 "source (来源)"。你需要将其作为参数传递：`T.createScope(<source>)`
:::

### Scope Component (作用域组件): 将 scope (作用域) 与组件关联 [2.2.0]

Koin 具有 `KoinScopeComponent` 的概念，以帮助将 scope (作用域) 实例引入其类：

```kotlin
class A : KoinScopeComponent {
    override val scope: Scope by lazy { createScope(this) }
}

class B
```

`KoinScopeComponent` 接口带来了几个扩展：
- `createScope` - 从当前组件的 scope Id (作用域 Id) & name (名称) 创建 scope (作用域)
- `get`, `inject` - 从 scope (作用域) 解析实例（等同于 `scope.get()` & `scope.inject()`）

让我们为 A 定义一个 scope (作用域)，以解析 B：

```kotlin
module {
    scope<A> {
        scoped { B() } // 与 A 的 scope (作用域) 绑定
    }
}
```

然后，我们可以直接通过 `org.koin.core.scope` `get` & `inject` 扩展来解析 `B` 的实例：

```kotlin
class A : KoinScopeComponent {
    override val scope: Scope by lazy { newScope(this) }

    // 将 B 解析为 inject
    val b : B by inject() // 从 scope (作用域) 注入

    // 解析 B
    fun doSomething(){
        val b = get<B>()
    }

    fun close(){
        scope.close() // 不要忘记关闭当前 scope (作用域)
    }
}
```

### Resolving dependencies within a scope (在 scope (作用域) 内解析依赖项)

要使用 scope (作用域) 的 `get` & `inject` 函数解析依赖项：`val presenter = scope.get<Presenter>()`

scope (作用域) 的意义在于为 scoped (作用域) 定义定义一个通用的逻辑时间单位。它还允许从给定的 scope (作用域) 中解析定义

```kotlin
// 给定类
class ComponentA
class ComponentB(val a : ComponentA)

// 带有 scope (作用域) 的模块
module {
    
    scope<A> {
        scoped { ComponentA() }
        // 将从当前 scope (作用域) 实例解析
        scoped { ComponentB(get()) }
    }
}
```

依赖项解析然后变得简单：

```kotlin
// 创建 scope (作用域)
val myScope = koin.createScope<A>()

// 从同一个 scope (作用域)
val componentA = myScope.get<ComponentA>()
val componentB = myScope.get<ComponentB>()
```

:::info
默认情况下，如果在当前 scope (作用域) 中找不到定义，则所有 scope (作用域) 都会回退到主 scope (作用域) 中进行解析
:::

### Close a scope (关闭 scope (作用域))

一旦你的 scope (作用域) 实例完成，只需使用 `close()` 函数将其关闭：

```kotlin
// 从 KoinComponent
val scope = getKoin().createScope<A>()

// 使用它 ...

// 关闭它
scope.close()
```

:::info
请注意，你不能再从 closed scope (已关闭的 scope (作用域)) 注入实例。
:::

### Getting scope's source value (获取 scope (作用域) 的 source (来源) 值)

Koin Scope (作用域) API 在 2.1.4 中允许你在定义中传递 scope (作用域) 的原始 source (来源)。让我们看下面的一个例子。
让我们有一个单例实例 `A`：

```kotlin
class A
class BofA(val a : A)

module {
    single { A() }
    scope<A> {
        scoped { BofA(getSource() /* or even get() */) }

    }
}
```

通过创建 A 的 scope (作用域)，我们可以将 scope (作用域) 的 source (来源)（A 实例）的引用转发到 scope (作用域) 的底层定义：`scoped { BofA(getSource()) }` 甚至 `scoped { BofA(get()) }`

这为了避免级联参数注入，并直接在 scoped (作用域) 定义中检索我们的 source (来源) 值。

```kotlin
val a = koin.get<A>()
val b = a.scope.get<BofA>()
assertTrue(b.a == a)
```

:::note
`getSource()` 和 `get()` 之间的区别：getSource 将直接获取 source (来源) 值。Get 将尝试解析任何定义，并在可能的情况下回退到 source (来源) 值。因此，`getSource()` 在性能方面更有效率。
:::

### Scope Linking (scope (作用域) 链接)

Koin Scope (作用域) API 在 2.1 中允许你将一个 scope (作用域) 链接到另一个 scope (作用域)，然后允许解析已加入的定义空间。让我们看一个例子。
这里我们定义了 2 个 scope (作用域) 空间：A 的 scope (作用域) 和 B 的 scope (作用域)。在 A 的 scope (作用域) 中，我们无法访问 C（在 B 的 scope (作用域) 中定义）。

```kotlin
module {
    single { A() }
    scope<A> {
        scoped { B() }
    }
    scope<B> {
        scoped { C() }
    }
}
```

使用 scope (作用域) 链接 API，我们可以允许直接从 A 的 scope (作用域) 解析 B 的 scope (作用域) 实例 C。为此，我们在 scope (作用域) 实例上使用 `linkTo()`：

```kotlin
val a = koin.get<A>()
// 让我们从 A 的 scope (作用域) 中获取 B
val b = a.scope.get<B>()
// 让我们将 A 的 scope (作用域) 链接到 B 的 scope (作用域)
a.scope.linkTo(b.scope)
// 我们从 A 或 B 的 scope (作用域) 获得了相同的 C 实例
assertTrue(a.scope.get<C>() == b.scope.get<C>())
```
