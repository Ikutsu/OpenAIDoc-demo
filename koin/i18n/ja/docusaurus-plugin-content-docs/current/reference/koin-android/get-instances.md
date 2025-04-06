---
title: Injecting in Android
---
モジュールを宣言し、Koin を起動したら、Android の Activity、Fragment、または Service でインスタンスを取得するにはどうすればよいでしょうか?

## Android クラスの準備

`Activity`、`Fragment`、および `Service` は、KoinComponents 拡張機能で拡張されています。`ComponentCallbacks` クラスはすべて、Koin 拡張機能にアクセスできます。

Kotlin 拡張機能にアクセスできます。

* `by inject()` - Koin コンテナから遅延評価されたインスタンス
* `get()` - Koin コンテナからインスタンスをすぐに取得

プロパティを遅延注入として宣言できます。

```kotlin
module {
    // Presenter の定義
    factory { Presenter() }
}
```

```kotlin
class DetailActivity : AppCompatActivity() {

    // Presenter を遅延注入
    override val presenter : Presenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        //...
    }
}
```

または、インスタンスを直接取得することもできます。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Presenter インスタンスを取得
    val presenter : Presenter = get()
}  
```

:::info
クラスに拡張機能がない場合は、`KoinComponent` インターフェイスを実装して、別のクラスからインスタンスを `inject()` または `get()` します。
:::

## 定義で Android Context を使用する

`Application` クラスが Koin を構成したら、`androidContext` 関数を使用して Android Context を注入できます。これにより、モジュールで必要なときに後で解決できます。

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // Android コンテキストを注入
            androidContext(this@MainApplication)
            // ...
        }
        
    }
}
```

定義では、`androidContext()` および `androidApplication()` 関数を使用すると、Koin モジュールで `Context` インスタンスを取得できるため、`Application` インスタンスを必要とする式を簡単に記述できます。

```kotlin
val appModule = module {

    // Android からの R.string.mystring リソースの注入を使用して、Presenter インスタンスを作成
    factory {
        MyPresenter(androidContext().resources.getString(R.string.mystring))
    }
}
```

## Android Scope と Android Context の解決

`Context` 型をバインドするスコープがある場合、`Context` を異なるレベルから解決する必要がある場合があります。

構成を見てみましょう。

```kotlin
class MyPresenter(val context : Context)

startKoin {
  androidContext(context)
  modules(
    module {
      scope<MyActivity> {
        scoped { MyPresenter( <get() ???> ) }
      }
    }
  )
}
```

`MyPresenter` で正しい型を解決するには、以下を使用します。
- `get()` は、最も近い `Context` 定義を解決します。ここでは、ソース スコープ `MyActivity` になります。
- `androidContext()` も、最も近い `Context` 定義を解決します。ここでは、ソース スコープ `MyActivity` になります。
- `androidApplication()` も、`Application` 定義を解決します。ここでは、Koin セットアップで定義されたソース スコープ `context` オブジェクトになります。
