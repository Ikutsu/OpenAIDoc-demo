---
title: "Android - ViewModel"
---
> 本教程将引导你编写一个 Android 应用程序，并使用 Koin 依赖注入来检索你的组件。
> 完成本教程大约需要 __10 分钟__。

:::note
更新 - 2024-10-21
:::

## 获取代码

:::info
[源代码可在 Github 上找到](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)
:::

## Gradle 设置

像下面这样添加 Koin Android 依赖项：

```groovy
dependencies {

    // Koin for Android
    implementation("io.insert-koin:koin-android:$koin_version")
}
```

## 应用概览

该应用程序的目的是管理用户列表，并在我们的 `MainActivity` 类中使用 Presenter 或 ViewModel 显示它：

> Users -> UserRepository -> (Presenter or ViewModel) -> MainActivity

## "User" 数据

我们将管理一个用户集合。 这是数据类：

```kotlin
data class User(val name : String)
```

我们创建一个 "Repository"（仓库）组件来管理用户列表（添加用户或按名称查找用户）。 以下是 `UserRepository` 接口及其实现：

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

使用 `module` 函数声明一个 Koin 模块。 Koin 模块是我们定义所有要注入的组件的地方。

```kotlin
val appModule = module {
    
}
```

让我们声明我们的第一个组件。 我们想要一个 `UserRepository` 的单例，通过创建一个 `UserRepositoryImpl` 的实例

```kotlin
val appModule = module {
   singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## 使用 ViewModel 显示用户

让我们编写一个 ViewModel 组件来显示用户：

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        return foundUser?.let { "Hello '$it' from $this" } ?: "User '$name' not found!"
    }
}
```

> UserRepository 在 UserViewModel 的构造函数中被引用

我们在 Koin 模块中声明 `UserViewModel`。 我们将其声明为 `viewModelOf` 定义，以不在内存中保留任何实例（避免 Android 生命周期中的任何泄漏）：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

## 在 Android 中注入 ViewModel

`UserViewModel` 组件将被创建，并使用它来解析 `UserRepository` 实例。 为了在我们的 Activity 中获取它，让我们使用 `by viewModel()` 委托函数注入它：

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        //...
    }
}
```

就是这样，你的应用程序已准备就绪。

:::info
`by viewModel()` 函数允许我们检索 ViewModel 实例，为你创建关联的 ViewModel 工厂，并将其绑定到生命周期
:::

## 启动 Koin

我们需要使用我们的 Android 应用程序启动 Koin。 只需在应用程序的主入口点，即我们的 `MainApplication` 类中调用 `startKoin()` 函数：

```kotlin
class MainApplication : Application(){
    override fun onCreate() {
        super.onCreate()
        
        startKoin{
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

:::info
`startKoin` 中的 `modules()` 函数加载给定的模块列表
:::

## Koin 模块：经典方式还是构造函数 DSL？

这是我们应用程序的 Koin 模块声明：

```kotlin
val appModule = module {
    single<HelloRepository> { HelloRepositoryImpl() }
    viewModel { MyViewModel(get()) }
}
```

我们可以使用构造函数以更紧凑的方式编写它：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

## 验证你的应用程序！

我们可以通过使用一个简单的 JUnit 测试验证我们的 Koin 配置来确保我们的 Koin 配置在启动我们的应用程序之前是良好的。

### Gradle 设置

像下面这样添加 Koin Android 依赖项：

```groovy
// Add Maven Central to your repositories if needed
repositories {
	mavenCentral()    
}

dependencies {
    
    // Koin for Tests
    testImplementation "io.insert-koin:koin-test-junit4:$koin_version"
}
```

### 检查你的模块

`verify()` 函数允许验证给定的 Koin 模块：

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun checkAllModules() {
        appModule.verify()
    }
}
```

只需一个 JUnit 测试，你就可以确保你的定义配置没有任何遗漏！