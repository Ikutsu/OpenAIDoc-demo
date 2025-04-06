---
title: Android - Jetpack Compose
---
> このチュートリアルでは、Androidアプリケーションを作成し、Koinの依存性注入を使用してコンポーネントを取得する方法を説明します。
> チュートリアルにかかる時間は約__10分__です。

:::note
更新 - 2024-10-21
:::

## コードを取得する

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-compose)
:::

## Gradleの設定 (Setup)

以下のようにKoin Androidの依存関係を追加します。

```groovy
dependencies {

    // Koin for Android
    implementation "io.insert-koin:koin-androidx-compose:$koin_version"
}
```

## アプリケーションの概要 (Overview)

このアプリケーションの目的は、ユーザーのリストを管理し、`MainActivity`クラスでPresenterまたはViewModelを使用して表示することです。

> Users -> UserRepository -> (Presenter or ViewModel) -> Composable

## "User"データ

ユーザーのコレクションを管理します。データクラスは次のとおりです。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理する"Repository"コンポーネントを作成します（ユーザーの追加、または名前による検索）。以下に、`UserRepository`インターフェースとその実装を示します。

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

最初のコンポーネントを宣言しましょう。`UserRepositoryImpl`のインスタンスを作成して、`UserRepository`のシングルトンが必要とします。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

## UserViewModelを使用したユーザーの表示

### `UserViewModel`クラス

ユーザーを表示するためのViewModelコンポーネントを作成します。

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        return foundUser?.let { "Hello '$it' from $this" } ?: "User '$name' not found!"
    }
}
```

> UserRepositoryはUserViewModelのコンストラクタで参照されます。

`UserViewModel`をKoinモジュールで宣言します。`viewModelOf`定義として宣言して、インスタンスをメモリに保持しないようにします（Androidライフサイクルでのリークを回避するため）。

```kotlin
val appModule = module {
     singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

> `get()`関数を使用すると、Koinに必要な依存関係の解決をリクエストできます。

### ComposeでのViewModelの注入 (Injecting)

`UserViewModel`コンポーネントが作成され、`UserRepository`インスタンスが解決されます。Activityでこれを使用するには、`koinViewModel()`関数を使用して注入します。

```kotlin
@Composable
fun ViewModelInject(userName : String, viewModel: UserViewModel = koinViewModel()){
    Text(text = viewModel.sayHello(userName), modifier = Modifier.padding(8.dp))
}
```

:::info
`koinViewModel`関数を使用すると、ViewModelインスタンスを取得し、関連するViewModel Factoryを作成してライフサイクルにバインドできます
:::

## UserStateHolderを使用したユーザーの表示

### `UserStateHolder`クラス

ユーザーを表示するためのState holderコンポーネントを作成します。

```kotlin
class UserStateHolder(private val repository: UserRepository) {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        return foundUser?.let { "Hello '$it' from $this" } ?: "User '$name' not found!"
    }
}
```

> UserRepositoryはUserViewModelのコンストラクタで参照されます。

`UserStateHolder`をKoinモジュールで宣言します。`factoryOf`定義として宣言して、インスタンスをメモリに保持しないようにします（Androidライフサイクルでのリークを回避するため）。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    factoryOf(::UserStateHolder)
}
```

### ComposeでのUserStateHolderの注入 (Injecting)

`UserStateHolder`コンポーネントが作成され、`UserRepository`インスタンスが解決されます。Activityでこれを使用するには、`koinInject()`関数を使用して注入します。

```kotlin
@Composable
fun FactoryInject(userName : String, presenter: UserStateHolder = koinInject()){
    Text(text = presenter.sayHello(userName), modifier = Modifier.padding(8.dp))
}
```

:::info
`koinInject`関数を使用すると、ViewModelインスタンスを取得し、関連するViewModel Factoryを作成してライフサイクルにバインドできます
:::

## Koinの開始 (Start Koin)

AndroidアプリケーションでKoinを開始する必要があります。アプリケーションのエントリポイントである`MainApplication`クラスで`startKoin()`関数を呼び出すだけです。

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
`startKoin`の`modules()`関数は、指定されたモジュールのリストをロードします
:::

Composeアプリケーションの開始中に、`KoinAndroidContext`を使用してKoinを現在のComposeアプリケーションにリンクする必要があります。

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                KoinAndroidContext {
                    App()
                }
            }
        }
    }
}
```

## Koinモジュール：クラシックまたはコンストラクタDSL (Koin module: classic or constructor DSL?)

アプリのKoinモジュール宣言を以下に示します。

```kotlin
val appModule = module {
    single<HelloRepository> { HelloRepositoryImpl() }
    viewModel { MyViewModel(get()) }
}
```

コンストラクタを使用すると、よりコンパクトに記述できます。

```kotlin
val appModule = module {
    singleOf(::UserRepositoryImpl) { bind<UserRepository>() }
    viewModelOf(::UserViewModel)
}
```

## アプリの検証 (Verifying)

簡単なJUnitテストでKoin構成を検証することにより、アプリの起動前にKoin構成が適切であることを確認できます。

### Gradleの設定 (Setup)

以下のようにKoin Androidの依存関係を追加します。

```groovy
dependencies {
    
    // Koin for Tests
    testImplementation "io.insert-koin:koin-test-junit4:$koin_version"
}
```

### モジュールの確認 (Checking your modules)

`verify()`関数を使用すると、指定されたKoinモジュールを検証できます。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun checkAllModules() {
        appModule.verify()
    }
}
```

JUnitテストを使用するだけで、定義構成に不足がないことを確認できます。
