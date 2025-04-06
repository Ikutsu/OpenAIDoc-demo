---
title: Definitions
---
Koinを使用することで、モジュール内で定義を記述します。このセクションでは、モジュールの宣言、構成、およびリンク方法について説明します。

## モジュールの作成

Koinモジュールは、*すべてのコンポーネントを宣言するスペース*です。 Koinモジュールを宣言するには、`module`関数を使用します。

```kotlin
val myModule = module {
   // ここに依存関係を記述します
}
```

このモジュールでは、以下に示すようにコンポーネントを宣言できます。

## シングルトンの定義

シングルトンコンポーネントを宣言するということは、Koinコンテナが宣言されたコンポーネントの*一意のインスタンス*を保持することを意味します。モジュールで`single`関数を使用して、シングルトンを宣言します。

```kotlin
class MyService()

val myModule = module {

    // MyServiceクラスの単一のインスタンスを宣言します
    single { MyService() }
}
```

## ラムダ内でのコンポーネントの定義

`single`、`factory`、`scoped`キーワードは、ラムダ式を通してコンポーネントを宣言するのに役立ちます。このラムダは、コンポーネントの構築方法を記述します。通常、コンポーネントをコンストラクタ経由でインスタンス化しますが、任意の式を使用することもできます。

`single { Class constructor // Kotlinの式 }`

ラムダの結果型は、コンポーネントのメインタイプです。

## ファクトリの定義

ファクトリコンポーネントの宣言は、この定義を要求する*たびに新しいインスタンスを提供する*定義です（このインスタンスはKoinコンテナによって保持されません。後で他の定義にこのインスタンスを注入しないためです）。コンポーネントを構築するには、ラムダ式とともに`factory`関数を使用します。

```kotlin
class Controller()

val myModule = module {

    // Controllerクラスのファクトリインスタンスを宣言します
    factory { Controller() }
}
```

:::info
 Koinコンテナは、定義が要求されるたびに新しいインスタンスを提供するので、ファクトリインスタンスを保持しません。
:::

## 依存関係の解決と注入

コンポーネントの定義を宣言できるようになったので、依存性注入を使用してインスタンスをリンクします。 Koinモジュールで*インスタンスを解決する*には、要求された必要なコンポーネントインスタンスに`get()`関数を使用します。この`get()`関数は通常、コンストラクタ値を注入するために、コンストラクタで使用されます。

:::info
 Koinコンテナで依存性注入を行うには、*コンストラクタインジェクション*スタイルで記述する必要があります。つまり、クラスコンストラクタで依存関係を解決します。これにより、インスタンスはKoinから注入されたインスタンスとともに作成されます。
:::

いくつかのクラスの例を見てみましょう。

```kotlin
// Presenter <- Service
class Service()
class Controller(val view : View)

val myModule = module {

    // Serviceを単一のインスタンスとして宣言します
    single { Service() }
    // Controllerを単一のインスタンスとして宣言し、get()でViewインスタンスを解決します
    single { Controller(get()) }
}
```

## 定義：インターフェースのバインド

`single`または`factory`定義は、与えられたラムダ定義からの型を使用します。つまり、`single { T }`
定義の一致する型は、この式からの一致する型のみです。

クラスと実装されたインターフェースの例を見てみましょう。

```kotlin
// Serviceインターフェース
interface Service{

    fun doSomething()
}

// Serviceの実装
class ServiceImp() : Service {

    fun doSomething() { ... }
}
```

Koinモジュールでは、次のように`as`キャストKotlin演算子を使用できます。

```kotlin
val myModule = module {

    // ServiceImp型のみに一致します
    single { ServiceImp() }

    // Service型のみに一致します
    single { ServiceImp() as Service }

}
```

推論された型式を使用することもできます。

```kotlin
val myModule = module {

    // ServiceImp型のみに一致します
    single { ServiceImp() }

    // Service型のみに一致します
    single<Service> { ServiceImp() }

}
```

:::note
 この2番目のスタイルの宣言が推奨され、ドキュメントの残りの部分で使用されます。
:::

## 追加の型バインディング

場合によっては、1つの定義から複数の型を照合したい場合があります。

クラスとインターフェースの例を見てみましょう。

```kotlin
// Serviceインターフェース
interface Service{

    fun doSomething()
}

// Serviceの実装
class ServiceImp() : Service{

    fun doSomething() { ... }
}
```

定義に追加の型をバインドするには、クラスとともに`bind`演算子を使用します。

```kotlin
val myModule = module {

    // ServiceImp型とService型に一致します
    single { ServiceImp() } bind Service::class
}
```

ここでは、`get()`を使用して`Service`型を直接解決することに注意してください。ただし、`Service`をバインドする複数の定義がある場合は、`bind<>()`関数を使用する必要があります。

## 定義：名前付けとデフォルトのバインディング

同じ型に関する2つの定義を区別するために、定義に名前を指定できます。

名前で定義をリクエストするだけです。

```kotlin
val myModule = module {
    single<Service>(named("default")) { ServiceImpl() }
    single<Service>(named("test")) { ServiceImpl() }
}

val service : Service by inject(qualifier = named("default"))
```

`get()`関数と`by inject()`関数を使用すると、必要に応じて定義名を指定できます。この名前は、`named()`関数によって生成される`qualifier`（修飾子）です。

デフォルトでは、Koinは型または名前によって定義をバインドします。型がすでに定義にバインドされている場合。

```kotlin
val myModule = module {
    single<Service> { ServiceImpl1() }
    single<Service>(named("test")) { ServiceImpl2() }
}
```

次に：

- `val service : Service by inject()`は`ServiceImpl1`定義をトリガーします
- `val service : Service by inject(named("test"))`は`ServiceImpl2`定義をトリガーします

## インジェクションパラメータの宣言

任意の定義では、インジェクションパラメータを使用できます。これは、定義によって注入および使用されるパラメータです。

```kotlin
class Presenter(val view : View)

val myModule = module {
    single{ (view : View) -> Presenter(view) }
}
```

解決された依存関係（`get()`で解決）とは対照的に、インジェクションパラメータは*解決APIを介して渡されるパラメータ*です。
これは、これらのパラメータが`get()`および`by inject()`で渡される値であり、`parametersOf`関数を使用することを意味します。

```kotlin
val presenter : Presenter by inject { parametersOf(view) }
```

詳細については、[インジェクションパラメータセクション](/docs/reference/koin-core/injection-parameters)をお読みください。

## 定義の終了 - OnClose

`onClose`関数を使用して、定義のクローズが呼び出されたときにコールバックを定義に追加できます。

```kotlin
class Presenter(val view : View)

val myModule = module {
    factory { (view : View) -> Presenter(view) } onClose { // closing callback - it is Presenter }
}
```

## 定義フラグの使用

Koin DSLはいくつかのフラグも提案します。

### 開始時にインスタンスを作成

定義またはモジュールに`CreatedAtStart`のフラグを立てて、開始時（または必要なとき）に作成されるようにすることができます。最初に、モジュールまたは定義に`createdAtStart`フラグを設定します。

定義のCreatedAtStartフラグ

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module {

    // この定義をすぐに作成します
    single<Service>(createdAtStart=true) { TestServiceImp() }
}
```

モジュールのCreatedAtStartフラグ：

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module(createdAtStart=true) {

    single<Service>{ TestServiceImp() }
}
```

`startKoin`関数は、`createdAtStart`のフラグが立てられた定義インスタンスを自動的に作成します。

```kotlin
// Koinモジュールを開始します
startKoin {
    modules(myModuleA,myModuleB)
}
```

:::info
（たとえば、UIではなくバックグラウンドスレッドで）特別な時間にいくつかの定義をロードする必要がある場合は、目的のコンポーネントを取得/注入するだけです。
:::

### ジェネリクスの処理

Koinの定義は、ジェネリック型引数を考慮しません。たとえば、以下のモジュールは、Listの2つの定義を定義しようとしています。

```kotlin
module {
    single { ArrayList<Int>() }
    single { ArrayList<String>() }
}
```

Koinは、そのような定義では開始されず、ある定義を別の定義で上書きしようとしていることを理解します。

許可するには、2つの定義を使用するには、名前または場所（モジュール）で区別する必要があります。例えば：

```kotlin
module {
    single(named("Ints")) { ArrayList<Int>() }
    single(named("Strings")) { ArrayList<String>() }
}
```
