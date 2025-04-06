---
title: Kotlin
---
> このチュートリアルでは、Kotlinアプリケーションを作成し、Koinの依存性注入を利用してコンポーネントを取得する方法を学びます。
> チュートリアル完了まで__10分__程度かかります。

:::note
更新 - 2024-10-21
:::

## コードを取得する

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin)
:::

## セットアップ

まず、`koin-core`依存関係が以下のように追加されていることを確認してください。

```groovy
dependencies {
    
    // Koin for Kotlin apps
    compile "io.insert-koin:koin-core:$koin_version"
}
```

## アプリケーションの概要

このアプリケーションの目的は、ユーザーのリストを管理し、それを`UserApplication`クラスに表示することです。

> Users -> UserRepository -> UserService -> UserApplication

## "User"データ

ユーザーのコレクションを管理します。以下はデータクラスです。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理（ユーザーの追加や名前による検索）するための"Repository"コンポーネントを作成します。以下は、`UserRepository`インターフェースとその実装です。

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

## Koinモジュール

`module`関数を使用してKoinモジュールを宣言します。Koinモジュールは、注入されるすべてのコンポーネントを定義する場所です。

```kotlin
val appModule = module {
    
}
```

最初のコンポーネントを宣言しましょう。`UserRepositoryImpl`のインスタンスを作成して、`UserRepository`のシングルトンが必要になります。

```kotlin
val appModule = module {
    single<UserRepository> { UserRepositoryImpl() }
}
```

## UserServiceコンポーネント

デフォルトユーザーをリクエストするUserServiceコンポーネントを作成しましょう。

```kotlin
class UserService(private val userRepository: UserRepository) {

    fun getDefaultUser() : User = userRepository.findUser(DefaultData.DEFAULT_USER.name) ?: error("Can't find default user")
}
```

> UserRepositoryはUserPresenterのコンストラクタで参照されています

`UserService`をKoinモジュールで宣言します。`single`定義として宣言します。

```kotlin
val appModule = module {
     single<UserRepository> { UserRepositoryImpl() }
     single { UserService(get()) }
}
```

> `get()`関数を使用すると、Koinに必要な依存関係を解決するように要求できます。

## UserApplicationへの依存性の注入

`UserApplication`クラスは、Koinからインスタンスをブートストラップするのに役立ちます。`KoinComponent`インターフェースのおかげで、`UserService`を解決します。これにより、`by inject()`デリゲート関数を使用して注入できます。

```kotlin
class UserApplication : KoinComponent {

    private val userService : UserService by inject()

    // display our data
    fun sayHello(){
        val user = userService.getDefaultUser()
        val message = "Hello '$user'!"
        println(message)
    }
}
```

これで、アプリの準備ができました。

:::info
`by inject()`関数を使用すると、`KoinComponent`を拡張する任意のクラスでKoinインスタンスを取得できます。
:::

## Koinを開始する

アプリケーションでKoinを開始する必要があります。アプリケーションのエントリポイントである`main`関数で、`startKoin()`関数を呼び出すだけです。

```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }

    UserApplication().sayHello()
}
```

:::info
`startKoin`の`modules()`関数は、指定されたモジュールのリストをロードします
:::

## Koinモジュール：従来型またはコンストラクタDSL？

以下は、アプリのKoinモジュール宣言です。

```kotlin
val appModule = module {
    single<UserRepository> { UserRepositoryImpl() }
    single { UserService(get()) }
}
```

コンストラクタを使用すると、よりコンパクトな方法で記述できます。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    singleOf(::UserService)
}
```
