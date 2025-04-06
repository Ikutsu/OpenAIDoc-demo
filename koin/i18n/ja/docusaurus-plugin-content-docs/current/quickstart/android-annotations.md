---
title: Android & Annotations
---
> このチュートリアルでは、Androidアプリケーションを作成し、Koinの依存性注入を使用してコンポーネントを取得する方法を説明します。
> チュートリアル完了まで約 __10分__ かかります。

:::note
更新 - 2024-10-21
:::

## コードを入手する

:::info
[ソースコードはGithubで入手できます](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-annotations)
:::

## Gradleの設定 (Gradle Setup)

以下のようにKSP (KSP Plugin) プラグインを設定し、次の依存関係を追加しましょう。

```groovy
plugins {
    alias(libs.plugins.ksp)
}

dependencies {
    // ...

    implementation(libs.koin.annotations)
    ksp(libs.koin.ksp)
}

// コンパイル時チェック (Compile time check)
ksp {
    arg("KOIN_CONFIG_CHECK","true")
}
```

:::note
現在のバージョンについては、`libs.versions.toml`を参照してください。
:::

## アプリケーションの概要 (Application Overview)

このアプリケーションの目的は、ユーザーのリストを管理し、PresenterまたはViewModelを使用して`MainActivity`クラスに表示することです。

> Users -> UserRepository -> (Presenter or ViewModel) -> MainActivity

## "User"データ

ユーザーのコレクションを管理します。データクラスは次のとおりです。

```kotlin
data class User(val name : String)
```

ユーザーのリストを管理するための「Repository」コンポーネントを作成します（ユーザーの追加または名前による検索）。以下に、`UserRepository`インターフェースとその実装を示します。

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

## Koinモジュール (Koin module)

以下のように`AppModule`モジュールクラスを宣言しましょう。

```kotlin
@Module
@ComponentScan("org.koin.sample")
class AppModule
```

* `@Module`を使用して、クラスをKoinモジュールとして宣言します。
* `@ComponentScan("org.koin.sample")`を使用すると、`"org.koin.sample"`パッケージ内のKoin定義をスキャンできます。

`UserRepositoryImpl`クラスに`@Single`を追加して、シングルトンとして宣言しましょう。

```kotlin
@Single
class UserRepositoryImpl : UserRepository {
    // ...
}
```

## Presenterを使用したユーザーの表示

ユーザーを表示するPresenterコンポーネントを作成しましょう。

```kotlin
class UserPresenter(private val repository: UserRepository) {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        return foundUser?.let { "Hello '$it' from $this" } ?: "User '$name' not found!"
    }
}
```

> UserRepositoryはUserPresenterのコンストラクタで参照されます。

Koinモジュールで`UserPresenter`を宣言します。 `@Factory`アノテーションを使用して`factory`定義として宣言し、インスタンスをメモリに保持しないようにします（Androidのライフサイクルでのリークを回避するため）。

```kotlin
@Factory
class UserPresenter(private val repository: UserRepository) {
    // ...
}
```

## Androidでの依存性の注入 (Injecting Dependencies in Android)

`UserPresenter`コンポーネントが作成され、`UserRepository`インスタンスが解決されます。 Activityに取得するには、`by inject()`デリゲート関数を使用して注入しましょう。

```kotlin
class MainActivity : AppCompatActivity() {

    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        //...
    }
}
```

これでアプリの準備ができました。

:::info
`by inject()`関数を使用すると、Androidコンポーネントの実行時（Activity、fragment、Serviceなど）にKoinインスタンスを取得できます。
:::

## Koinの開始 (Start Koin)

AndroidアプリケーションでKoinを開始する必要があります。 アプリケーションのメインエントリポイントである`MainApplication`クラスで`startKoin()`関数を呼び出すだけです。

```kotlin
// 生成 (generated)
import org.koin.ksp.generated.*

class MainApplication : Application(){
    override fun onCreate() {
        super.onCreate()
        
        startKoin{
            androidLogger()
            androidContext(this@MainApplication)
            modules(AppModule().module)
        }
    }
}
```

Koinモジュールは、`.module`拡張子を持つ`AppModule`から生成されます。 アノテーションからKoinモジュールを取得するには、`AppModule().module`式を使用するだけです。

:::info
生成されたKoinモジュールのコンテンツを使用するには、`import org.koin.ksp.generated.*`インポートが必要です。
:::

## ViewModelを使用したユーザーの表示

ユーザーを表示するViewModelコンポーネントを作成しましょう。

```kotlin
@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    fun sayHello(name : String) : String{
        val foundUser = repository.findUser(name)
        return foundUser?.let { "Hello '$it' from $this" } ?: "User '$name' not found!"
    }
}
```

> UserRepositoryはUserViewModelのコンストラクタで参照されます。

`UserViewModel`には`@KoinViewModel`アノテーションがタグ付けされており、Koin ViewModel定義を宣言し、インスタンスをメモリに保持しないようにします（Androidのライフサイクルでのリークを回避するため）。

## AndroidでのViewModelの注入 (Injecting ViewModel in Android)

`UserViewModel`コンポーネントが作成され、`UserRepository`インスタンスが解決されます。 Activityに取得するには、`by viewModel()`デリゲート関数を使用して注入しましょう。

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        //...
    }
}
```

## コンパイル時チェック (Compile Time Checks)

Koin Annotationsを使用すると、コンパイル時にKoin構成をチェックできます。 これは、次のGradleオプションを使用することで利用できます。

```groovy
ksp {
    arg("KOIN_CONFIG_CHECK","true")
}
```

## アプリの検証！ (Verifying your App!)

JUnitテストを使用してKoin構成を検証することで、アプリを起動する前にKoin構成が適切であることを確認できます。

### Gradleの設定 (Gradle Setup)

以下のようにKoin Androidの依存関係を追加します。

```groovy
// 必要に応じてMaven Centralをリポジトリに追加します
repositories {
	mavenCentral()    
}

dependencies {
    
    // テスト用のKoin (Koin for Tests)
    testImplementation "io.insert-koin:koin-test-junit4:$koin_version"
}
```

### モジュールの確認 (Checking your modules)

`androidVerify()`関数を使用すると、指定されたKoinモジュールを検証できます。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun checkAllModules() {

        AppModule().module.androidVerify()
    }
}
```

JUnitテストだけで、定義構成に不足がないことを確認できます。
    ```