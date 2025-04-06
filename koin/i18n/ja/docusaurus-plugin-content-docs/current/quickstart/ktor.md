---
title: Ktor
---
n
> Ktor（クトル）は、強力な Kotlin プログラミング言語を使用して、接続されたシステムで非同期サーバーとクライアントを構築するためのフレームワークです。ここでは Ktor を使用して、シンプルな Web アプリケーションを構築します。

さあ始めましょう 🚀

:::note
更新 - 2024-10-21
:::

## コードを入手する

:::info
[ソースコードは Github で入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor)
:::

## Gradle の設定

まず、以下のように Koin の依存関係を追加します。

```kotlin
dependencies {
    // Koin for Kotlin apps
    implementation("io.insert-koin:koin-ktor:$koin_version")
    implementation("io.insert-koin:koin-logger-slf4j:$koin_version")
}
```

## アプリケーションの概要

このアプリケーションのアイデアは、ユーザーのリストを管理し、`UserApplication`クラスに表示することです。

> Users -> UserRepository -> UserService -> UserApplication

## 「User」データ

User のコレクションを管理します。データクラスを以下に示します。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理するための「Repository (リポジトリ)」コンポーネントを作成します（ユーザーの追加または名前による検索）。以下に、`UserRepository`インターフェースとその実装を示します。

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

## Koin モジュール

`module`関数を使用して、Koin モジュールを宣言します。 Koin モジュールは、インジェクトされるすべてのコンポーネントを定義する場所です。

```kotlin
val appModule = module {
    
}
```

最初のコンポーネントを宣言しましょう。 `UserRepositoryImpl`のインスタンスを作成して、`UserRepository`のシングルトンが必要だとします。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## UserService コンポーネント

デフォルトユーザーをリクエストするために、UserService コンポーネントを作成しましょう。

```kotlin
class UserService(private val userRepository: UserRepository) {

    fun getDefaultUser() : User = userRepository.findUser(DefaultData.DEFAULT_USER.name) ?: error("Can't find default user")
}
```

> UserRepository は UserPresenter のコンストラクタで参照されます。

Koin モジュールで `UserService` を宣言します。 `singleOf` 定義として宣言します。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    singleOf(::UserService)
}
```

## HTTP コントローラー

最後に、HTTP ルートを作成するための HTTP Controller が必要です。 Ktor では、Ktor 拡張関数を使用して表現されます。

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

`Application.main`関数の起動に役立つように、`application.conf`が以下のように構成されていることを確認してください。

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

## 依存関係を宣言する

Koin モジュールでコンポーネントを組み立てましょう。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    singleOf(::UserService)
}
```

## 開始とインジェクト

最後に、Ktor から Koin を開始しましょう。

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

Ktor を開始しましょう。

```kotlin
fun main(args: Array<String>) {
    // Start Ktor
    embeddedServer(Netty, commandLineEnvironment(args)).start(wait = true)
}
```

以上です！ 準備が整いました。 `http://localhost:8080/hello` の URL を確認してください！