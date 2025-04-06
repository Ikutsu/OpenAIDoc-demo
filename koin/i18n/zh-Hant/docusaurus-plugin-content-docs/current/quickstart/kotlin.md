---
title: Kotlin
---
> 本教學課程讓你編寫 Kotlin 應用程式，並使用 Koin 依賴注入來檢索你的元件。
> 你需要大約 __10 分鐘__ 來完成本教學課程。

:::note
更新 - 2024-10-21
:::

## 取得程式碼

:::info
[原始程式碼可在 Github 上找到](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin)
:::

## 設定 (Setup)

首先，確認已加入 `koin-core` 依賴項，如下所示：

```groovy
dependencies {
    
    // Koin for Kotlin apps
    compile "io.insert-koin:koin-core:$koin_version"
}
```

## 應用程式概觀 (Application Overview)

應用程式的想法是管理使用者列表，並在我們的 `UserApplication` 類別中顯示它：

> 使用者 (Users) -> 使用者儲存庫 (UserRepository) -> 使用者服務 (UserService) -> 使用者應用程式 (UserApplication)

## "使用者 (User)" 資料

我們將管理一個使用者集合。以下是資料類別：

```kotlin
data class User(val name : String)
```

我們建立一個 "Repository" 元件來管理使用者列表（新增使用者或依名稱尋找使用者）。以下是 `UserRepository` 介面及其實現：

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

## Koin 模組 (Koin module)

使用 `module` 函數來宣告 Koin 模組。Koin 模組是我們定義所有要注入的元件的地方。

```kotlin
val appModule = module {
    
}
```

讓我們宣告我們的第一個元件。我們想要一個 `UserRepository` 的單例，透過建立 `UserRepositoryImpl` 的實例。

```kotlin
val appModule = module {
    single<UserRepository> { UserRepositoryImpl() }
}
```

## UserService 元件

讓我們編寫 UserService 元件來請求預設使用者：

```kotlin
class UserService(private val userRepository: UserRepository) {

    fun getDefaultUser() : User = userRepository.findUser(DefaultData.DEFAULT_USER.name) ?: error("Can't find default user")
}
```

> UserRepository 在 UserPresenter 的建構函式中被引用

我們在 Koin 模組中宣告 `UserService`。我們將其宣告為 `single` 定義：

```kotlin
val appModule = module {
     single<UserRepository> { UserRepositoryImpl() }
     single { UserService(get()) }
}
```

> `get()` 函數允許要求 Koin 解析所需的依賴項。

## 在 UserApplication 中注入依賴項

`UserApplication` 類別將幫助從 Koin 中啟動實例。它將解析 `UserService`，這要歸功於 `KoinComponent` 介面。這允許使用 `by inject()` 委託函數注入它：

```kotlin
class UserApplication : KoinComponent {

    private val userService : UserService by inject()

    // 顯示我們的資料
    fun sayHello(){
        val user = userService.getDefaultUser()
        val message = "Hello '$user'!"
        println(message)
    }
}
```

就是這樣，你的應用程式已準備就緒。

:::info
`by inject()` 函數允許我們在任何擴展 `KoinComponent` 的類別中檢索 Koin 實例
:::

## 啟動 Koin (Start Koin)

我們需要使用我們的應用程式啟動 Koin。只需在應用程式的主要入口點呼叫 `startKoin()` 函數，即我們的 `main` 函數：

```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }

    UserApplication().sayHello()
}
```

:::info
`startKoin` 中的 `modules()` 函數加載給定的模組列表
:::

## Koin 模組：傳統還是建構函式 DSL？

這是我們應用程式的 Koin 模組宣告：

```kotlin
val appModule = module {
    single<UserRepository> { UserRepositoryImpl() }
    single { UserService(get()) }
}
```

我們可以使用建構函式以更緊湊的方式編寫它：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    singleOf(::UserService)
}
```
