---
title: Android
---
```markdown
> このチュートリアルでは、Androidアプリケーションを作成し、Koinの依存性注入を使用してコンポーネントを取得する方法を説明します。
> チュートリアル完了まで約__10分__かかります。

:::note
更新 - 2024-10-21
:::

## コードを入手する

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)
:::

## Gradle の設定

Koin Android の依存関係を以下のように追加します。

```groovy
dependencies {

    // Koin for Android
    implementation("io.insert-koin:koin-android:$koin_version")
}
```

## アプリケーションの概要

このアプリケーションの目的は、ユーザーのリストを管理し、`MainActivity` クラスで Presenter または ViewModel を使用して表示することです。

> Users -> UserRepository -> (Presenter or ViewModel) -> MainActivity

## "User"データ

User のコレクションを管理します。データクラスは次のとおりです。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理するための "Repository" コンポーネントを作成します（ユーザーの追加や名前による検索など）。以下は、`UserRepository` インターフェースとその実装です。

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

最初のコンポーネントを宣言しましょう。`UserRepositoryImpl` のインスタンスを作成して、`UserRepository` の singleton（シングルトン）が必要です。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
}
```

## Presenter を使用した User の表示

ユーザーを表示するための presenter コンポーネントを作成しましょう。

```kotlin
class UserPresenter(private val repository: UserRepository) {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        return foundUser?.let { "Hello '$it' from $this" } ?: "User '$name' not found!"
    }
}
```

> UserRepository は UserPresenter のコンストラクタで参照されます。

`UserPresenter` を Koin モジュールで宣言します。メモリにインスタンスを保持しないように (Android のライフサイクルによるリークを避けるため)、`factoryOf` 定義として宣言します。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    factoryOf(::UserStateHolder)
}
```

> `get()` 関数を使用すると、Koin に必要な依存関係の解決を依頼できます。

## Android での依存性の注入

`UserPresenter` コンポーネントが作成され、`UserRepository` インスタンスが解決されます。Activity に取得するには、`by inject()` デリゲート関数を使用して注入します。

```kotlin
class MainActivity : AppCompatActivity() {

    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        //...
    }
}
```

これで、アプリの準備ができました。

:::info
`by inject()` 関数を使用すると、Android コンポーネントのランタイム（Activity, fragment, Serviceなど）で Koin インスタンスを取得できます。
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

## Koin モジュール: クラシック DSL (classic DSL) またはコンストラクタ DSL (constructor DSL)?

以下は、アプリの Koin モジュールの宣言です。

```kotlin
val appModule = module {
    single<HelloRepository> { HelloRepositoryImpl() }
    factory { MyPresenter(get()) }
}
```

コンストラクタを使用すると、よりコンパクトに記述できます。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    factoryOf(::UserPresenter)
}
```

## アプリの検証

簡単な JUnit テストで Koin の構成を検証することにより、アプリを起動する前に Koin の構成が適切であることを確認できます。

### Gradle の設定

Koin Android の依存関係を以下のように追加します。

```groovy
// Add Maven Central to your repositories if needed
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
