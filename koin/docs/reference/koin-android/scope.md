---
title: "管理安卓作用域 (Android Scopes)"
---
## 使用 Android 生命周期

Android 组件主要由它们的生命周期管理：我们不能直接实例化 Activity 或 Fragment。系统为我们完成所有的创建和管理，并在方法上进行回调：onCreate，onStart...

这就是为什么我们不能在 Koin 模块中描述我们的 Activity/Fragment/Service。然后我们需要将依赖项注入到属性中，并且还要尊重生命周期：与 UI 部分相关的组件必须在不再需要它们时立即释放。

然后我们有：

* 长生命周期组件（Services（服务），Data Repository（数据仓库）...） - 被多个屏幕使用，永远不会被丢弃
* 中等生命周期组件（用户会话...） - 被多个屏幕使用，必须在一段时间后被丢弃
* 短生命周期组件（视图） - 仅被一个屏幕使用，并且必须在屏幕结束时被丢弃

长生命周期组件可以很容易地被描述为 `single` 定义。对于中等和短生命周期组件，我们可以有几种方法。

在 MVP 架构风格中，`Presenter` 是一个短生命周期组件，用于帮助/支持 UI。每次显示屏幕时都必须创建 Presenter，并在屏幕消失后丢弃。

每次都会创建一个新的 Presenter

```kotlin
class DetailActivity : AppCompatActivity() {

    // 注入的 Presenter
    override val presenter : Presenter by inject()
```

我们可以在一个模块中描述它：

* 作为 `factory` - 每次调用 `by inject()` 或 `get()` 时都会生成一个新实例

```kotlin
val androidModule = module {

    // Presenter 的 Factory 实例
    factory { Presenter() }
}
```

* 作为 `scope` - 生成一个绑定到作用域的实例

```kotlin
val androidModule = module {

    scope<DetailActivity> {
        scoped { Presenter() }
    }
}
```

:::note
 大多数 Android 内存泄漏都来自从非 Android 组件引用 UI/Android 组件。系统保留对它的引用，并且无法通过垃圾回收完全删除它。
:::

## Android 组件的作用域（自 3.2.1 起）

### 声明 Android 作用域

要在 Android 组件上限定依赖项的作用域，您必须使用 `scope` 块声明一个作用域部分，如下所示：

```kotlin
class MyPresenter()
class MyAdapter(val presenter : MyPresenter)

module {
  // 声明 MyActivity 的作用域
  scope<MyActivity> {
    // 从当前作用域获取 MyPresenter 实例
    scoped { MyAdapter(get()) }
    scoped { MyPresenter() }
  }
}
```

### Android 作用域类

Koin 提供 `ScopeActivity`，`RetainedScopeActivity` 和 `ScopeFragment` 类，让您可以直接为 Activity 或 Fragment 使用声明的作用域：

```kotlin
class MyActivity : ScopeActivity() {
    
    // MyPresenter 从 MyActivity 的作用域解析
    val presenter : MyPresenter by inject()
}
```

在底层，Android 作用域需要与 `AndroidScopeComponent` 接口一起使用，以实现 `scope` 字段，如下所示：

```kotlin
abstract class ScopeActivity(
    @LayoutRes contentLayoutId: Int = 0,
) : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkNotNull(scope)
    }
}
```

我们需要使用 `AndroidScopeComponent` 接口并实现 `scope` 属性。这将设置您的类使用的默认作用域。

### Android 作用域 API

要创建一个绑定到 Android 组件的 Koin 作用域，只需使用以下函数：
- `createActivityScope()` - 为当前 Activity 创建作用域（必须声明作用域部分）
- `createActivityRetainedScope()` - 为当前 Activity 创建一个保留的作用域（由 ViewModel 生命周期支持）（必须声明作用域部分）
- `createFragmentScope()` - 为当前 Fragment 创建作用域并链接到父 Activity 作用域

这些函数可用作委托，以实现不同类型的作用域：

- `activityScope()` - 为当前 Activity 创建作用域（必须声明作用域部分）
- `activityRetainedScope()` - 为当前 Activity 创建一个保留的作用域（由 ViewModel 生命周期支持）（必须声明作用域部分）
- `fragmentScope()` - 为当前 Fragment 创建作用域并链接到父 Activity 作用域

```kotlin
class MyActivity() : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityScope()
    
}
```

我们还可以使用以下方法设置一个保留的作用域（由 ViewModel 生命周期支持）：

```kotlin
class MyActivity() : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityRetainedScope()
}
```

:::note
 如果您不想使用 Android 作用域类，您可以使用自己的类，并使用带有作用域创建 API 的 `AndroidScopeComponent`
:::

### AndroidScopeComponent 和作用域关闭处理

您可以在 Koin 作用域被销毁之前运行一些代码，方法是重写 `AndroidScopeComponent` 中的 `onCloseScope` 函数：

```kotlin
class MyActivity() : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityScope()

    override fun onCloseScope() {
        // 在关闭作用域之前调用
    }
}
```

:::note
 如果您尝试从 `onDestroy()` 函数访问作用域，则作用域将已关闭。
:::

### ViewModel 作用域 (自 3.5.4 起)

ViewModel 仅针对根作用域创建，以避免任何泄漏（泄漏 Activity 或 Fragment ...）。这是为了防止可见性问题，即 ViewModel 可能有权访问不兼容的作用域。

:::warn
ViewModel 无法访问 Activity 或 Fragment 作用域。为什么？因为 ViewModel 比 Activity 和 Fragment 持续时间更长，然后它会将依赖项泄漏到适当的作用域之外。
:::

:::note
如果您 _真的_ 需要桥接 ViewModel 作用域之外的依赖项，您可以使用“注入的参数”将一些对象传递给您的 ViewModel：`viewModel { p ->  }`
:::

`ScopeViewModel` 是一个新类，用于帮助处理 ViewModel 作用域。这处理 ViewModel 的作用域创建，并提供 `scope` 属性以允许使用 `by scope.inject()` 进行注入：

```kotlin
module {
    viewModelOf(::MyScopeViewModel)
    scope<MyScopeViewModel> {
        scopedOf(::Session)
    }    
}

class MyScopeViewModel : ScopeViewModel() {

    // 在 onCleared 上，作用域关闭
    
    // 从当前 MyScopeViewModel 的作用域注入
    val session by scope.inject<Session>()

}
```

通过使用 `ScopeViewModel`，您还可以覆盖 `onCloseScope()` 函数，以便在作用域关闭之前运行代码。

:::note
 ViewModel 作用域内的所有实例都具有相同的可见性，并且将在 ViewModel 实例的整个生命周期内存在，直到调用 ViewModel 的 onCleared 函数为止
:::

例如，一旦 Activity 或 Fragment 创建了一个 ViewModel，就会创建关联的作用域：

```kotlin
class MyActivity : AppCompatActivity() {

    // 创建 ViewModel 及其作用域
    val myViewModel by viewModel<MyScopeViewModel>()

}
```

一旦创建了您的 ViewModel，就可以创建和注入来自此作用域内的所有关联依赖项。

要手动实现您的 ViewModel 作用域，而无需 `ScopeViewModel` 类，请按以下步骤操作：

```kotlin
class MyScopeViewModel : ViewModel(), KoinScopeComponent {

    override val scope: Scope = createScope(this)

    // 注入您的依赖项
    val session by scope.inject<Session>()

    // 清除作用域
    override fun onCleared() {
        super.onCleared()
        scope.close()
    }
}
```

## 作用域链接

作用域链接允许在使用自定义作用域的组件之间共享实例。

在更广泛的用法中，您可以在组件之间使用 `Scope` 实例。例如，如果我们需要共享一个 `UserSession` 实例。

首先声明一个作用域定义：

```kotlin
module {
    // 共享用户会话数据
    scope(named("session")) {
        scoped { UserSession() }
    }
}
```

当需要开始使用 `UserSession` 实例时，为其创建一个作用域：

```kotlin
val ourSession = getKoin().createScope("ourSession",named("session"))

// 将 ourSession 作用域链接到当前 `scope`，从 ScopeActivity 或 ScopeFragment
scope.linkTo(ourSession)
```

然后在任何需要它的地方使用它：

```kotlin
class MyActivity1 : ScopeActivity() {
    
    fun reuseSession(){
        val ourSession = getKoin().createScope("ourSession",named("session"))
        
        // 将 ourSession 作用域链接到当前 `scope`，从 ScopeActivity 或 ScopeFragment
        scope.linkTo(ourSession)

        // 将查看 MyActivity1 的 Scope + ourSession 作用域来解析
        val userSession = get<UserSession>()
    }
}
class MyActivity2 : ScopeActivity() {

    fun reuseSession(){
        val ourSession = getKoin().createScope("ourSession",named("session"))
        
        // 将 ourSession 作用域链接到当前 `scope`，从 ScopeActivity 或 ScopeFragment
        scope.linkTo(ourSession)

        // 将查看 MyActivity2 的 Scope + ourSession 作用域来解析
        val userSession = get<UserSession>()
    }
}
```