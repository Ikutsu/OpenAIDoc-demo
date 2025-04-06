---
title: Context Isolation
---
```markdown
## Context Isolation（コンテキスト分離）とは？

SDK メーカー向けに、グローバルではない方法で Koin を使用することもできます。ライブラリの DI に Koin を使用し、コンテキストを分離することで、ライブラリと Koin を使用するユーザー間の競合を回避できます。

通常の方法では、次のように Koin を開始できます。

```kotlin
// KoinApplication を開始し、グローバルコンテキストに登録します
startKoin {

    // 使用するモジュールを宣言
    modules(...)
}
```

これは、デフォルトの Koin コンテキストを使用して依存関係を登録します。

ただし、分離された Koin インスタンスを使用する場合は、インスタンスを宣言し、インスタンスを保持するクラスに保存する必要があります。Koin Application インスタンスをライブラリで使用できるようにし、カスタム KoinComponent の実装に渡す必要があります。

`MyIsolatedKoinContext` クラスは、ここで Koin インスタンスを保持しています。

```kotlin
// Koin インスタンスのコンテキストを取得します
object MyIsolatedKoinContext {

    private val koinApp = koinApplication {
        // 使用するモジュールを宣言
        modules(coffeeAppModule)
    }

    val koin = koinApp.koin 
}
```

`MyIsolatedKoinContext` を使用して、分離されたコンテキストを使用する KoinComponent である `IsolatedKoinComponent` クラスを定義しましょう。

```kotlin
internal interface IsolatedKoinComponent : KoinComponent {

    // デフォルトの Koin インスタンスをオーバーライド
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin
}
```

これで準備完了です。`IsolatedKoinComponent` を使用して、分離されたコンテキストからインスタンスを取得します。

```kotlin
class MyKoinComponent : IsolatedKoinComponent {
    // inject & get は MyKoinContext をターゲットにします
}
```

## テスト

`by inject()` デリゲートを使用して依存関係を取得するクラスをテストするには、`getKoin()` メソッドをオーバーライドし、カスタム Koin モジュールを定義します。

```kotlin
class MyClassTest : KoinTest {
    // 依存関係の取得に使用する Koin コンテキスト
    override fun getKoin(): Koin = MyIsolatedKoinContext.koin

    @Before
    fun setUp() {
       // カスタム Koin モジュールを定義
        val module = module {
            // 依存関係を登録
        }

        koin.loadModules(listOf(module))
    }
}
```
