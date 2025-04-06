---
title: Ktor
---
> Ktor 是一個框架，用於在使用強大的 Kotlin 程式語言的連接系統中構建非同步伺服器和客戶端。我們將在此處使用 Ktor 來構建一個簡單的 Web 應用程式 (Web application)。

Let's go 🚀

:::note
update - 2024-10-21
:::

## Get the code

:::info
[原始程式碼可在 Github 上取得](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor)
:::

## Gradle 設定 (Setup)

首先，如下所示新增 Koin 依賴項 (dependency)：

```kotlin
dependencies {
    // Koin for Kotlin apps
    implementation("io.insert-koin:koin-ktor:$koin_version")
    implementation("io.insert-koin:koin-logger-slf4j:$koin_version")
}
```

## 應用程式 (Application) 概述 (Overview)

該應用程式的想法是管理一個使用者列表，並在我們的 `UserApplication` 類別中顯示它：

> Users -> UserRepository -> UserService -> UserApplication

## "User" 資料

我們將管理一個 User 集合。 這是資料類別：

```kotlin
data class User(val name : String)
```

我們創建一個 "Repository" 組件來管理使用者列表（新增使用者或按名稱查找一個）。 下面是 `UserRepository` 介面及其實現：

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

## Koin 模組 (module)

使用 `module` 函數宣告一個 Koin 模組。 Koin 模組是我們定義所有要注入的元件的地方。

```kotlin
val appModule = module {
    
}
```

讓我們宣告我們的第一個元件。 我們想要一個 `UserRepository` 的單例，透過創建 `UserRepositoryImpl` 的一個實例

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## UserService 組件

讓我們編寫 UserService 組件來請求預設使用者：

```kotlin
class UserService(private val userRepository: UserRepository) {

    fun getDefaultUser() : User = userRepository.findUser(DefaultData.DEFAULT_USER.name) ?: error("Can't find default user")
}
```

> UserRepository 在 UserPresenter 的建構函式中被引用

我們在 Koin 模組中宣告 `UserService`。 我們將其宣告為 `singleOf` 定義：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    singleOf(::UserService)
}
```

## HTTP 控制器 (Controller)

最後，我們需要一個 HTTP 控制器來創建 HTTP 路由 (Route)。 在 Ktor 中，它將透過 Ktor 擴充函數來表達：

```kotlin
fun Application.main() {

    // Lazy inject HelloService
    val service by inject<UserService>()

    // Routing section
    routing {
        get("/hello") {
            call.respondText(service.sayHello())
        }
    }
}
```

檢查您的 `application.conf` 是否配置如下，以幫助啟動 `Application.main` 函數：

```kotlin
ktor {
    deployment {
        port = 8080

        // For dev purpose
        //autoreload = true
        //watch = [org.koin.sample]
    }

    application {
        modules = [ org.koin.sample.UserApplicationKt.main ]
    }
}
```

## 宣告您的依賴項

讓我們用一個 Koin 模組組裝我們的元件：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    singleOf(::UserService)
}
```

## 啟動 (Start) 和注入 (Inject)

最後，讓我們從 Ktor 啟動 Koin：

```kotlin
fun Application.main() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }

    // Lazy inject HelloService
    val service by inject<UserService>()
    service.saveDefaultUsers()

    // Routing section
    routing {
        get("/hello") {
            call.respondText(service.sayHello())
        }
    }
}
```

讓我們啟動 Ktor：

```kotlin
fun main(args: Array<String>) {
    // Start Ktor
    embeddedServer(Netty, commandLineEnvironment(args)).start(wait = true)
}
```

就是這樣！ 您已準備好開始。 檢查 `http://localhost:8080/hello` 網址！
