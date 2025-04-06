---
title: Compose Multiplatform - Shared UI
---
> 本教學將引導您編寫一個 Android 應用程式，並使用 Koin 依賴注入來取得您的元件。
> 完成本教學大約需要 __15 分鐘__。

:::note
更新 - 2024-10-21
:::

## 取得程式碼

:::info
[原始碼可在 Github 上取得](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ComposeMultiplatform)
:::

## 應用程式概觀

此應用程式的目的是管理一個使用者列表，並在我們的原生 UI 中顯示它，使用一個共享的 ViewModel：

`Users -> UserRepository -> Shared Presenter -> Compose UI`

## "User" 資料

> 所有 common/shared 程式碼都位於 `shared` Gradle 專案中

我們將管理一個使用者集合。以下是資料類別：

```kotlin
data class User(val name : String)
```

我們建立一個 "Repository"（倉庫）元件來管理使用者列表（新增使用者或依名稱尋找使用者）。以下是 `UserRepository` 介面及其實現：

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

## 共享的 Koin 模組

使用 `module` 函數來宣告一個 Koin 模組。Koin 模組是我們定義所有要注入的元件的地方。

讓我們宣告我們的第一個元件。我們想要一個 `UserRepository` 的單例，透過建立一個 `UserRepositoryImpl` 的實例。

```kotlin
module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## 共享的 ViewModel

讓我們編寫一個 ViewModel 元件來顯示一個使用者：

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        val platform = getPlatform()
        return foundUser?.let { "Hello '$it' from ${platform.name}" } ?: "User '$name' not found!"
    }
}
```

> UserRepository 在 `UserPresenter` 的建構子中被引用

我們在我們的 Koin 模組中宣告 `UserViewModel`。我們將它宣告為一個 `viewModelOf` 定義，以避免在記憶體中保留任何實例，並讓原生系統持有它：

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

:::note
Koin 模組可以作為一個函數 (`appModule` 在此) 執行，以便於從 iOS 端使用 `initKoin()` 函數執行。
:::

## 原生元件

以下原生元件在 Android 和 iOS 中定義：

```kotlin
interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
```

兩者都取得本地平台實現

## 在 Compose 中注入

> 所有 Common Compose 應用程式都位於 `composeApp` Gradle 模組的 `commonMain` 中：

`UserViewModel` 元件將被建立，解析其中的 `UserRepository` 實例。為了將其放入我們的 Activity 中，讓我們使用 `koinViewModel` 或 `koinNavViewModel` compose 函數注入它：

```kotlin
@Composable
fun MainScreen() {

    MaterialTheme {

        val userViewModel = koinViewModel<UserViewModel>()
        
        //...
    }
}
```

就是這樣，您的應用程式已準備就緒。

我們需要使用我們的 Android 應用程式啟動 Koin。只需在 compose 應用程式函數 `App` 中呼叫 `KoinApplication()` 函數：

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
`modules()` 函數載入給定的模組列表
:::

## iOS 中的 Compose 應用程式

> 所有 iOS 應用程式都位於 `iosMain` 資料夾中

`MainViewController.kt` 已準備好啟動 iOS 的 Compose：

```kotlin
// Koin.kt

fun MainViewController() = ComposeUIViewController { App() }
```
