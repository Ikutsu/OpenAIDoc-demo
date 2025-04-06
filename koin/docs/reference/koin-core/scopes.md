---
title: 作用域
---
Koin 提供了一个简单的 API，可以让你定义与有限生命周期绑定的实例。

## 什么是作用域 (Scope)？

作用域 (Scope) 是对象存在的固定持续时间或方法调用。
另一种看待它的方式是将作用域视为对象状态持续的时间量。
当作用域上下文结束时，绑定在该作用域下的任何对象都不能再次被注入（它们会从容器中删除）。

## 作用域定义

默认情况下，在 Koin 中，我们有 3 种作用域：

- `single` 定义，创建一个在整个容器生命周期内持续存在的对象（不能被删除）。
- `factory` 定义，每次创建一个新对象。生命周期短。在容器中没有持久性（不能被共享）。
- `scoped` 定义，创建一个与相关作用域生命周期绑定的持久对象。

要声明一个 `scoped` 定义，使用 `scoped` 函数，如下所示。一个作用域将 `scoped` 定义收集为一个逻辑时间单元。

要为一个给定的类型声明一个作用域，我们需要使用 `scope` 关键字：

```kotlin
module {
    scope<MyType>{
        scoped { Presenter() }
        // ...
    }
}
```

### 作用域 Id & 作用域名称 (Scope Name)

一个 Koin 作用域由以下定义：

- 作用域名称 (scope name) - 作用域的限定符 (qualifier)
- 作用域 id (scope id) - 作用域实例的唯一标识符

:::note
`scope<A> { }` 等价于 `scope(named<A>()){ }`，但写起来更方便。请注意，你也可以使用字符串限定符，如：`scope(named("SCOPE_NAME")) { }`
:::

从一个 `Koin` 实例，你可以访问：

- `createScope(id : ScopeID, scopeName : Qualifier)` - 使用给定的 id 和作用域名称 (scopeName) 创建一个封闭的作用域实例
- `getScope(id : ScopeID)` - 检索先前创建的具有给定 id 的作用域
- `getOrCreateScope(id : ScopeID, scopeName : Qualifier)` - 创建或检索（如果已创建）具有给定 id 和作用域名称 (scopeName) 的封闭作用域实例

:::note
默认情况下，在对象上调用 `createScope` 不会传递作用域的 "source"。你需要将其作为参数传递：`T.createScope(<source>)`
:::

### 作用域组件 (Scope Component)：将作用域与组件关联 [2.2.0]

Koin 具有 `KoinScopeComponent` 的概念，以帮助将作用域实例引入其类：

```kotlin
class A : KoinScopeComponent {
    override val scope: Scope by lazy { createScope(this) }
}

class B
```

`KoinScopeComponent` 接口带来了几个扩展：
- `createScope` 从当前组件的作用域 Id 和名称 (name) 创建作用域
- `get`, `inject` - 从作用域解析实例（等价于 `scope.get()` & `scope.inject()`）

让我们为 A 定义一个作用域，以解析 B：

```kotlin
module {
    scope<A> {
        scoped { B() } // 与 A 的作用域绑定
    }
}
```

然后，我们可以直接借助 `org.koin.core.scope` 的 `get` & `inject` 扩展来解析 `B` 的实例：

```kotlin
class A : KoinScopeComponent {
    override val scope: Scope by lazy { newScope(this) }

    // 将 B 解析为 inject
    val b : B by inject() // 从作用域注入

    // 解析 B
    fun doSomething(){
        val b = get<B>()
    }

    fun close(){
        scope.close() // 不要忘记关闭当前作用域
    }
}
```

### 在作用域内解析依赖项

要使用作用域的 `get` & `inject` 函数解析依赖项：`val presenter = scope.get<Presenter>()`

作用域的意义在于为作用域定义定义一个共同的逻辑时间单元。它也允许从给定的作用域内解析定义。

```kotlin
// 给定类
class ComponentA
class ComponentB(val a : ComponentA)

// 带有作用域的模块
module {
    
    scope<A> {
        scoped { ComponentA() }
        // 将从当前作用域实例解析
        scoped { ComponentB(get()) }
    }
}
```

依赖项解析很简单：

```kotlin
// 创建作用域
val myScope = koin.createScope<A>()

// 从同一作用域
val componentA = myScope.get<ComponentA>()
val componentB = myScope.get<ComponentB>()
```

:::info
默认情况下，如果在当前作用域中未找到定义，则所有作用域都会回退到主作用域中进行解析。
:::

### 关闭作用域

一旦你的作用域实例完成，只需使用 `close()` 函数将其关闭：

```kotlin
// 来自 KoinComponent
val scope = getKoin().createScope<A>()

// 使用它 ...

// 关闭它
scope.close()
```

:::info
请注意，你不能再从一个已关闭的作用域中注入实例。
:::

### 获取作用域的 source 值

Koin 作用域 API 在 2.1.4 中允许你在定义中传递作用域的原始 source。让我们看下面的一个例子。
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

通过创建 A 的作用域，我们可以将作用域的 source (A 实例) 的引用转发到作用域的底层定义：`scoped { BofA(getSource()) }` 甚至 `scoped { BofA(get()) }`

这是为了避免级联参数注入，并直接在作用域定义中检索我们的 source 值。

```kotlin
val a = koin.get<A>()
val b = a.scope.get<BofA>()
assertTrue(b.a == a)
```

:::note
`getSource()` 和 `get()` 之间的区别：getSource 将直接获取 source 值。Get 将尝试解析任何定义，并在可能的情况下回退到 source 值。因此，`getSource()` 在性能方面更有效。
:::

### 作用域链接 (Scope Linking)

Koin 作用域 API 在 2.1 中允许你将一个作用域链接到另一个作用域，然后允许解析连接的定义空间。让我们举个例子。
这里我们定义了 2 个作用域空间：A 的作用域和 B 的作用域。在 A 的作用域中，我们无法访问 C（在 B 的作用域中定义）。

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

使用作用域链接 API，我们可以允许直接从 A 的作用域解析 B 的作用域实例 C。为此，我们在作用域实例上使用 `linkTo()`：

```kotlin
val a = koin.get<A>()
// 让我们从 A 的作用域中获取 B
val b = a.scope.get<B>()
// 让我们将 A 的作用域链接到 B 的作用域
a.scope.linkTo(b.scope)
// 我们从 A 或 B 作用域获得了相同的 C 实例
assertTrue(a.scope.get<C>() == b.scope.get<C>())
```