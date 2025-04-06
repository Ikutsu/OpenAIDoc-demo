---
title: "Compose Multiplatform - 共享UI"
---
> 本教程将引导你编写一个 Android 应用程序，并使用 Koin 依赖注入来检索你的组件。
> 完成本教程大约需要 __15 分钟__。

:::note
更新 - 2024-10-21
:::

## 获取代码

:::info
[源代码可在 Github 上找到](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ComposeMultiplatform)
:::

## 应用概览

该应用程序的目的是管理一个用户列表，并在我们的原生 UI 中显示它，使用一个共享的 ViewModel：

`Users -> UserRepository -> Shared Presenter -> Compose UI`

## "User" 数据

> 所有 common/shared（通用/共享）代码都位于 `shared` Gradle 项目中

我们将管理一个 User 的集合。以下是数据类：

```kotlin
data class User(val name : String)
```

我们创建一个 "Repository"（仓库）组件来管理用户列表（添加用户或按名称查找用户）。下面是 `UserRepository` 接口及其实现：

```kotlin
interface UserRepository {
    fun findUser(name : String): User?
    fun addUsers(users : List<User>)
}

class UserRepositoryImpl : UserRepository {

    private val _users = arrayListOf<User>()

    override fun findUser(name: String): User? {
        return _users.firstOrNull { it.name == name }
    }

    override fun addUsers(users : List<User>) {
        _users.addAll(users)
    }
}
```

## Shared Koin Module（共享的 Koin 模块）

使用 `module` 函数来声明一个 Koin 模块。Koin 模块是我们定义所有要注入的组件的地方。

让我们声明我们的第一个组件。我们想要一个 `UserRepository` 的单例，通过创建一个 `UserRepositoryImpl` 实例

```kotlin
module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## Shared ViewModel（共享的 ViewModel）

让我们编写一个 ViewModel 组件来显示用户：

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        val platform = getPlatform()
        return foundUser?.let { "Hello '$it' from ${platform.name}" } ?: "User '$name' not found!"
    }
}
```

> UserRepository 在 UserPresenter 的构造函数中被引用

我们在 Koin 模块中声明 `UserViewModel`。我们将其声明为 `viewModelOf` 定义，以避免在内存中保留任何实例，并让原生系统持有它：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

:::note
Koin 模块可以作为一个可运行的函数（这里是 `appModule`）来使用，以便于从 iOS 端使用 `initKoin()` 函数运行。
:::

## Native Component（原生组件）

以下原生组件在 Android 和 iOS 中定义：

```kotlin
interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
```

两者都获取本地平台实现

## Injecting in Compose（在 Compose 中注入）

> 所有 Common Compose 应用都位于 `composeApp` Gradle 模块的 `commonMain` 中：

`UserViewModel` 组件将被创建，并解析 `UserRepository` 实例。为了在我们的 Activity 中获取它，让我们用 `koinViewModel` 或 `koinNavViewModel` compose 函数来注入它：

```kotlin
@Composable
fun MainScreen() {

    MaterialTheme {

        val userViewModel = koinViewModel<UserViewModel>()
        
        //...
    }
}
```

就是这样，你的应用程序准备好了。

我们需要使用我们的 Android 应用程序启动 Koin。只需在 compose 应用程序函数 `App` 中调用 `KoinApplication()` 函数：

```kotlin
fun App() {
    
    KoinApplication(
        application = {
            modules(appModule)
        }
    )
{
// Compose content
}
}
```

:::info
`modules()` 函数加载给定的模块列表
:::

## Compose app in iOS（iOS 中的 Compose 应用）

> 所有 iOS 应用都位于 `iosMain` 文件夹中

`MainViewController.kt` 已经准备好启动 iOS 的 Compose：

```kotlin
// Koin.kt

fun MainViewController() = ComposeUIViewController { App() }
```