---
title: Kotlin
---
> 本教程将引导你编写一个 Kotlin 应用程序，并使用 Koin 依赖注入来检索你的组件。
> 完成本教程大约需要 __10 分钟__。


:::note
更新 - 2024-10-21
:::


## 获取代码 - 最后片段测试


:::info
[源代码可在 Github 上找到](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin)
:::


## 设置


首先，请检查是否已添加 `koin-core` 依赖项，如下所示：

```groovy
dependencies {
    
    // Koin for Kotlin apps
    compile "io.insert-koin:koin-core:$koin_version"
}
```


## 应用概览


这个应用程序的目的是管理一个用户列表，并在我们的 `UserApplication` 类中显示它：


> 用户 -> UserRepository -> UserService -> UserApplication


## “用户”数据

```markdown
我们将管理一个 User 的集合。以下是数据类：
```

```kotlin
data class User(val name : String)
```
```


我们创建一个 “Repository” 组件来管理用户列表（添加用户或按名称查找）。下面是 `UserRepository` 接口及其实现：

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


## Koin 模块


使用 `module` 函数来声明一个 Koin 模块。Koin 模块是我们定义所有要注入的组件的地方。

```kotlin
val appModule = module {
    
}
```


让我们声明我们的第一个组件。我们想要一个 `UserRepository` 的单例，通过创建一个 `UserRepositoryImpl` 的实例。

```kotlin
val appModule = module {
    single<UserRepository> { UserRepositoryImpl() }
}
```


## UserService 组件


让我们编写 UserService 组件来请求默认用户：

```kotlin
class UserService(private val userRepository: UserRepository) {

    fun getDefaultUser() : User = userRepository.findUser(DefaultData.DEFAULT_USER.name) ?: error("Can't find default user")
}
```


> UserRepository 在 UserPresenter 的构造函数中被引用


我们在 Koin 模块中声明 `UserService`。我们将其声明为 `single` 定义：

```kotlin
val appModule = module {
     single<UserRepository> { UserRepositoryImpl() }
     single { UserService(get()) }
}
```


> `get()` 函数允许请求 Koin 解析所需的依赖项。


## 在 UserApplication 中注入依赖


`UserApplication` 类将帮助从 Koin 中引导实例。由于 `KoinComponent` 接口，它将解析 `UserService`。这允许使用 `by inject()` 委托函数注入它：

```kotlin
class UserApplication : KoinComponent {

    private val userService : UserService by inject()

    // 显示我们的数据
    fun sayHello(){
        val user = userService.getDefaultUser()
        val message = "Hello '$user'!"
        println(message)
    }
}
```


就这样，你的应用就准备好了。


:::info
`by inject()` 函数允许我们在任何继承自 `KoinComponent` 的类中检索 Koin 实例。
:::


## 启动 Koin


我们需要用我们的应用程序启动 Koin。只需在应用程序的主入口点，也就是我们的 `main` 函数中调用 `startKoin()` 函数：

```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }

    UserApplication().sayHello()
}
```


:::info
`startKoin` 中的 `modules()` 函数用于加载给定的模块列表。
:::


## Koin 模块：经典 DSL 还是构造器 DSL？


这是我们应用的 Koin 模块声明：

```kotlin
val appModule = module {
    single<UserRepository> { UserRepositoryImpl() }
    single { UserService(get()) }
}
```

我们可以用更紧凑的方式来编写它，通过使用构造函数：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    singleOf(::UserService)
}
```
