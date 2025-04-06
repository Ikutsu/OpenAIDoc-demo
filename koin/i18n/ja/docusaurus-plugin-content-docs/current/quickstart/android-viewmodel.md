---
title: Android - ViewModel
---
> このチュートリアルでは、Androidアプリケーションを作成し、Koinの依存性注入を使用してコンポーネントを取得する方法を説明します。
> チュートリアルに必要な時間は約__10分__です。

:::note
更新 - 2024-10-21
:::

## コードを入手する

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)
:::

## Gradle の設定

以下のように Koin Android の依存関係を追加します。

```groovy
dependencies {

    // Koin for Android
    implementation("io.insert-koin:koin-android:$koin_version")
}
```

## アプリケーションの概要

このアプリケーションのアイデアは、ユーザーのリストを管理し、`MainActivity` クラスで Presenter または ViewModel を使用して表示することです。

> Users -> UserRepository -> (Presenter or ViewModel) -> MainActivity

## "User" データ

ユーザーのコレクションを管理します。以下にデータクラスを示します。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理する（ユーザーを追加したり、名前で検索したりする）ための "Repository" コンポーネントを作成します。以下に、`UserRepository` インターフェースとその実装を示します。

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

`module` 関数を使用して Koin モジュールを宣言します。Koin モジュールは、注入されるすべてのコンポーネントを定義する場所です。

```kotlin
val appModule = module {
    
}
```

最初のコンポーネントを宣言しましょう。`UserRepositoryImpl` のインスタンスを作成して、`UserRepository` のシングルトンが必要になります。

```kotlin
val appModule = module {
   singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## ViewModel を使用したユーザーの表示

ユーザーを表示するための ViewModel コンポーネントを作成しましょう。

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        return foundUser?.let { "Hello '$it' from $this" } ?: "User '$name' not found!"
    }
}
```

> UserRepository は UserViewModel`s コンストラクタで参照されます。

`UserViewModel` を Koin モジュールで宣言します。`viewModelOf` 定義として宣言し、メモリにインスタンスを保持しないようにします（Android ライフサイクルでのリークを回避するため）。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```


## Android での ViewModel の注入

`UserViewModel` コンポーネントが作成され、`UserRepository` インスタンスが解決されます。Activity で取得するには、`by viewModel()` デリゲート関数を使用して注入します。

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        //...
    }
}
```

これで、アプリの準備ができました。

:::info
`by viewModel()` 関数を使用すると、ViewModel インスタンスを取得し、関連付けられた ViewModel Factory を作成して、ライフサイクルにバインドできます。
:::

## Koin の開始

Android アプリケーションで Koin を開始する必要があります。アプリケーションのメインエントリポイントである `MainApplication` クラスで `startKoin()` 関数を呼び出すだけです。

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
`startKoin` の `modules()` 関数は、指定されたモジュールのリストをロードします。
:::

## Koin モジュール: クラシックまたはコンストラクタ DSL?

アプリの Koin モジュール宣言を次に示します。

```kotlin
val appModule = module {
    single<HelloRepository> { HelloRepositoryImpl() }
    viewModel { MyViewModel(get()) }
}
```

コンストラクタを使用すると、よりコンパクトな方法で記述できます。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

## アプリの検証！

簡単な JUnit テストで Koin 構成を検証することにより、アプリを起動する前に Koin 構成が良好であることを確認できます。

### Gradle の設定

以下のように Koin Android の依存関係を追加します。

```groovy
// 必要に応じて、Maven Central をリポジトリに追加します
repositories {
	mavenCentral()    
}

dependencies {
    
    // Koin for Tests
    testImplementation "io.insert-koin:koin-test-junit4:$koin_version"
}
```

### モジュールの確認

`verify()` 関数を使用すると、指定された Koin モジュールを検証できます。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun checkAllModules() {
        appModule.verify()
    }
}
```

JUnit テストだけで、定義の構成に不足がないことを確認できます。
    ```