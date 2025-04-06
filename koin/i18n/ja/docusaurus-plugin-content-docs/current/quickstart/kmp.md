---
title: Kotlin Multiplatform - No shared UI
---
```markdown
> このチュートリアルでは、Androidアプリケーションを作成し、Koinの依存性注入を使用してコンポーネントを取得する方法を説明します。
> チュートリアル完了まで約__15分__かかります。

:::note
更新 - 2024-10-21
:::

## コードの取得

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/KotlinMultiplatform)
:::

## アプリケーションの概要

このアプリケーションの目的は、ユーザーのリストを管理し、共有Presenterを使用してネイティブUIに表示することです。

`Users -> UserRepository -> Shared Presenter -> Native UI`

## 「User」データ

> 共通/共有コードはすべて`shared` Gradleプロジェクトにあります

ここでは、ユーザーのコレクションを管理します。データクラスは次のとおりです。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理する「Repository（リポジトリ）」コンポーネントを作成します（ユーザーの追加または名前による検索）。以下に示すのは、`UserRepository`インターフェースとその実装です。

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

`module`関数を使用してKoinモジュールを宣言します。 Koinモジュールは、インジェクションされるすべてのコンポーネントを定義する場所です。

最初のコンポーネントを宣言しましょう。 `UserRepositoryImpl`のインスタンスを作成して、`UserRepository`のシングルトンが必要になります。

```kotlin
module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## 共有Presenter

ユーザーを表示するPresenterコンポーネントを作成しましょう。

```kotlin
class UserPresenter(private val repository: UserRepository) {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        val platform = getPlatform()
        return foundUser?.let { "Hello '$it' from ${platform.name}" } ?: "User '$name' not found!"
    }
}
```

> UserRepositoryはUserPresenterのコンストラクターで参照されています。

Koinモジュールで`UserPresenter`を宣言します。 `factoryOf`定義として宣言し、インスタンスをメモリに保持せず、ネイティブシステムに保持させます。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    factoryOf(::UserPresenter)
}
```

:::note
Koinモジュールは、`initKoin()`関数を使用してiOS側から簡単に実行できるように、実行する関数（ここでは`appModule`）として利用できます。
:::

## ネイティブコンポーネント

次のネイティブコンポーネントは、AndroidとiOSで定義されています。

```kotlin
interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
```

どちらもローカルプラットフォームの実装を取得します。

## Androidへのインジェクション

> すべてのAndroidアプリは、`androidApp` Gradleプロジェクトにあります

`UserPresenter`コンポーネントが作成され、`UserRepository`インスタンスが解決されます。 それをActivityに取り込むには、`koinInject`コンポーズ関数を使用して注入しましょう。

```kotlin
// in App()

val greeting = koinInject<UserPresenter>().sayHello("Koin")

Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
    Image(painterResource(Res.drawable.compose_multiplatform), null)
    Text("Compose: $greeting")
}
```

これでアプリの準備ができました。

:::info
`koinInject()`関数を使用すると、Android ComposeランタイムでKoinインスタンスを取得できます。
:::

AndroidアプリケーションでKoinを起動する必要があります。 コンポーズアプリケーション関数`App`で`KoinApplication()`関数を呼び出すだけです。

```kotlin
fun App() {
    
    KoinApplication(application = koinAndroidConfiguration(LocalContext.current)){
        // ...
    }
}
```

共有KMP構成からKoin Android構成を収集します。

```kotlin
// Android config
fun koinAndroidConfiguration(context: Context) : KoinAppDeclaration = {
    androidContext(context)
    androidLogger()
    koinSharedConfiguration()
}
```

:::note
`LocalContext.current`を使用してComposeから現在のAndroidコンテキストを取得します
:::

そして、共有KMP構成：

```kotlin
// Common config
fun koinSharedConfiguration() : KoinAppDeclaration = {
    modules(appModule)
}
```

:::info
`modules()`関数は、指定されたモジュールのリストをロードします。
:::

## iOSへのインジェクション

> すべてのiOSアプリは`iosApp`フォルダーにあります

`UserPresenter`コンポーネントが作成され、`UserRepository`インスタンスが解決されます。 それを`ContentView`に取り込むには、iOS用のKoin依存関係を取得する関数を作成する必要があります。

```kotlin
// Koin.kt

fun getUserPresenter() : UserPresenter = KoinPlatform.getKoin().get()
```

これで、iOS側から`KoinKt.getUserPresenter().sayHello()`関数を呼び出すことができます。

```swift
import Shared

struct ContentView: View {

    // ...
    let greet = KoinKt.getUserPresenter().sayHello(name: "Koin")
}
```

iOSアプリケーションでKoinを起動する必要があります。 Kotlin共有コードでは、`initKoin()`関数を使用して共有構成を使用できます。
最後に、iOSメインエントリで、上記のヘルパー関数を呼び出す`KoinAppKt.doInitKoin()`関数を呼び出すことができます。

```swift
@main
struct iOSApp: App {
    
    init() {
        KoinAppKt.doInitKoin()
    }

    //...
}
```
```
