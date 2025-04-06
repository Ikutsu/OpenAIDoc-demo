---
title: Ktor & Annotations
---
n
> Ktorは、強力なKotlinプログラミング言語を使用して、接続されたシステムで非同期サーバーとクライアントを構築するためのフレームワークです。ここではKtorを使用して、簡単なWebアプリケーションを構築します。

さあ、始めましょう🚀

:::note
更新 - 2024-10-21
:::

## コードを入手する

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor-annotations)
:::

## Gradleの設定

まず、以下のようにKoinの依存関係を追加します。

```kotlin
plugins {

    id("com.google.devtools.ksp") version kspVersion
}

dependencies {
    // Kotlinアプリ用のKoin
    implementation("io.insert-koin:koin-ktor:$koin_version")
    implementation("io.insert-koin:koin-logger-slf4j:$koin_version")

    implementation("io.insert-koin:koin-annotations:$koinAnnotationsVersion")
    ksp("io.insert-koin:koin-ksp-compiler:$koinAnnotationsVersion")
}
```

## アプリケーションの概要

このアプリケーションのアイデアは、ユーザーのリストを管理し、それを`UserApplication`クラスに表示することです。

> Users -> UserRepository -> UserService -> UserApplication

## "User"データ

Userのコレクションを管理します。データクラスを以下に示します。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理するための「Repository」コンポーネント（ユーザーの追加または名前による検索）を作成します。以下に、`UserRepository`インターフェースとその実装を示します。

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

`@Module`アノテーションを使用して、特定のKotlinクラスからKoinモジュールを宣言します。Koinモジュールは、インジェクションされるすべてのコンポーネントを定義する場所です。

```kotlin
@Module
@ComponentScan("org.koin.sample")
class AppModule
```

`@ComponentScan("org.koin.sample")`は、対象パッケージからアノテーション付きクラスをスキャンするのに役立ちます。

最初のコンポーネントを宣言しましょう。`UserRepositoryImpl`のインスタンスを作成して、`UserRepository`のシングルトンが必要になります。`@Single`でタグ付けします。

```kotlin
@Single
class UserRepositoryImpl : UserRepository
```

## UserServiceコンポーネント

UserServiceコンポーネントを作成して、デフォルトユーザーを要求してみましょう。

```kotlin
class UserService(private val userRepository: UserRepository) {

    fun getDefaultUser() : User = userRepository.findUser(DefaultData.DEFAULT_USER.name) ?: error("Can't find default user")
}
```

> UserRepositoryはUserPresenterのコンストラクタで参照されます。

Koinモジュールで`UserService`を宣言します。 `@Single`アノテーションでタグ付けします。

```kotlin
@Single
class UserService(private val userRepository: UserRepository)
```

## HTTPコントローラー

最後に、HTTPルートを作成するためにHTTPコントローラーが必要です。Ktorでは、Ktor拡張関数を介して表現されます。

```kotlin
fun Application.main() {

    // HelloServiceの遅延注入 (Lazy inject)
    val service by inject<UserService>()

    // ルーティングセクション (Routing section)
    routing {
        get("/hello") {
            call.respondText(service.sayHello())
        }
    }
}
```

`application.conf`が以下のように構成されていることを確認して、`Application.main`関数の開始を容易にします。

```kotlin
ktor {
    deployment {
        port = 8080

        // 開発目的 (For dev purpose)
        //autoreload = true
        //watch = [org.koin.sample]
    }

    application {
        modules = [ org.koin.sample.UserApplicationKt.main ]
    }
}
```

## 開始と注入

最後に、KtorからKoinを開始しましょう。

```kotlin
fun Application.main() {
    install(Koin) {
        slf4jLogger()
        modules(AppModule().module)
    }

    // HelloServiceの遅延注入 (Lazy inject)
    val service by inject<UserService>()
    service.saveDefaultUsers()

    // ルーティングセクション (Routing section)
    routing {
        get("/hello") {
            call.respondText(service.sayHello())
        }
    }
}
```

`AppModule().module`を記述することにより、`AppModule`クラスで生成された拡張機能を使用します。

Ktorを開始しましょう。

```kotlin
fun main(args: Array<String>) {
    // Ktorの起動 (Start Ktor)
    embeddedServer(Netty, commandLineEnvironment(args)).start(wait = true)
}
```

以上です！ 準備が整いました。 `http://localhost:8080/hello`のURLを確認してください！