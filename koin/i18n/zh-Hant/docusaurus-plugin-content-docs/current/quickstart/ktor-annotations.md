---
title: Ktor & Annotations
---
> Ktor 是一個框架，用於使用強大的 Kotlin 程式語言在連接的系統中構建非同步伺服器和客戶端。 我們將在此處使用 Ktor 來構建一個簡單的 Web 應用程式。

讓我們開始吧 🚀

:::note
更新 - 2024-10-21
:::

## 取得程式碼

:::info
[原始碼可在 Github 上取得](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor-annotations)
:::

## Gradle 設定

首先，加入 Koin 相依性，如下所示：

```kotlin
plugins {

    id("com.google.devtools.ksp") version kspVersion
}

dependencies {
    // Koin for Kotlin apps
    implementation("io.insert-koin:koin-ktor:$koin_version")
    implementation("io.insert-koin:koin-logger-slf4j:$koin_version")

    implementation("io.insert-koin:koin-annotations:$koinAnnotationsVersion")
    ksp("io.insert-koin:koin-ksp-compiler:$koinAnnotationsVersion")
}
```

## 應用程式概觀

應用程式的想法是管理使用者列表，並在我們的 `UserApplication` 類別中顯示它：

> Users -> UserRepository -> UserService -> UserApplication

## "User" 資料

我們將管理一個 Users 的集合。 這是資料類別 (data class)：

```kotlin
data class User(val name : String)
```

我們創建一個 "Repository" 元件來管理使用者列表（新增使用者或依名稱尋找使用者）。 以下是 `UserRepository` 介面及其實現：

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

## Koin 模組

使用 `@Module` 註解從給定的 Kotlin 類別中宣告一個 Koin 模組 (module)。 Koin 模組是我們定義所有要注入的元件的地方。

```kotlin
@Module
@ComponentScan("org.koin.sample")
class AppModule
```

`@ComponentScan("org.koin.sample")` 將有助於掃描目標套件 (package) 中帶註解的類別。

讓我們宣告我們的第一個元件。 我們想要一個 `UserRepository` 的單例 (singleton)，方法是創建一個 `UserRepositoryImpl` 的實例。 我們使用 `@Single` 標記它。

```kotlin
@Single
class UserRepositoryImpl : UserRepository
```

## UserService 元件

讓我們編寫 UserService 元件來請求預設使用者：

```kotlin
class UserService(private val userRepository: UserRepository) {

    fun getDefaultUser() : User = userRepository.findUser(DefaultData.DEFAULT_USER.name) ?: error("Can't find default user")
}
```

> UserRepository 在 UserPresenter 的建構子 (constructor) 中被引用

我們在 Koin 模組中宣告 `UserService`。 我們用 `@Single` 註解標記：

```kotlin
@Single
class UserService(private val userRepository: UserRepository)
```

## HTTP 控制器

最後，我們需要一個 HTTP 控制器來創建 HTTP 路由 (Route)。 在 Ktor 中，它將透過 Ktor 擴展函數 (extension function) 來表達：

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

## 啟動並注入

最後，讓我們從 Ktor 啟動 Koin：

```kotlin
fun Application.main() {
    install(Koin) {
        slf4jLogger()
        modules(AppModule().module)
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

透過編寫 `AppModule().module`，我們在 `AppModule` 類別上使用一個產生的擴展 (extension)。

讓我們啟動 Ktor：

```kotlin
fun main(args: Array<String>) {
    // Start Ktor
    embeddedServer(Netty, commandLineEnvironment(args)).start(wait = true)
}
```

就是這樣！ 您已準備好出發。 檢查 `http://localhost:8080/hello` 網址！
