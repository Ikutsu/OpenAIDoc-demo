---
title: Compose Multiplatform - Shared UI
---
> このチュートリアルでは、Androidアプリケーションを作成し、Koinの依存性注入を使用してコンポーネントを取得する方法を説明します。
> チュートリアル完了まで約__15分__かかります。

:::note
更新 - 2024-10-21
:::

## コードの取得

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ComposeMultiplatform)
:::

## アプリケーションの概要

このアプリケーションのアイデアは、ユーザーのリストを管理し、共有のViewModelを使用してネイティブUIに表示することです。

`Users -> UserRepository -> Shared Presenter -> Compose UI`

## 「ユーザー」データ

> すべての共通/共有コードは、`shared` Gradleプロジェクトにあります。

ユーザーのコレクションを管理します。以下にデータクラスを示します。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理（ユーザーの追加または名前による検索）するための「Repository（リポジトリ）」コンポーネントを作成します。以下に、`UserRepository`インターフェースとその実装を示します。

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

## 共有Koinモジュール

`module`関数を使用してKoinモジュールを宣言します。Koinモジュールは、注入されるすべてのコンポーネントを定義する場所です。

最初のコンポーネントを宣言しましょう。`UserRepository`のシングルトンが必要なため、`UserRepositoryImpl`のインスタンスを作成します。

```kotlin
module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## 共有ViewModel

ユーザーを表示するViewModelコンポーネントを作成しましょう。

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        val platform = getPlatform()
        return foundUser?.let { "Hello '$it' from ${platform.name}" } ?: "User '$name' not found!"
    }
}
```

> UserRepositoryはUserPresenterのコンストラクタで参照されています。

`UserViewModel`をKoinモジュールで宣言します。メモリにインスタンスを保持せず、ネイティブシステムに保持させるために、`viewModelOf`定義として宣言します。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

:::note
Koinモジュールは、`initKoin()`関数を使用して、iOS側から簡単に実行できるように、実行する関数（ここでは`appModule`）として利用できます。
:::

## ネイティブコンポーネント

以下のネイティブコンポーネントは、AndroidとiOSで定義されています。

```kotlin
interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
```

どちらもローカルプラットフォームの実装を取得します。

## Composeでの注入

> すべてのCommon Composeアプリは、`composeApp` Gradleモジュールの`commonMain`にあります。

`UserViewModel`コンポーネントが作成され、それとともに`UserRepository`インスタンスが解決されます。Activityに取得するには、`koinViewModel`または`koinNavViewModel`のCompose関数を使用して注入します。

```kotlin
@Composable
fun MainScreen() {

    MaterialTheme {

        val userViewModel = koinViewModel<UserViewModel>()
        
        //...
    }
}
```

これで、アプリケーションの準備が整いました。

AndroidアプリケーションでKoinを起動する必要があります。Composeアプリケーション関数`App`で`KoinApplication()`関数を呼び出すだけです。

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
`modules()`関数は、指定されたモジュールのリストをロードします。
:::

## iOSでのComposeアプリ

> すべてのiOSアプリは、`iosMain`フォルダーにあります。

`MainViewController.kt`は、iOS向けのComposeを起動する準備ができています。

```kotlin
// Koin.kt

fun MainViewController() = ComposeUIViewController { App() }
```
