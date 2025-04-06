---
title: Isolated Context with Compose Applications
---
Composeアプリケーションを使用すると、[分離されたコンテキスト](/docs/reference/koin-core/context-isolation.md)を同じように操作して、SDKまたはホワイトラベルアプリケーションを処理できます。これは、Koinの定義をエンドユーザーの定義と混同しないようにするためです。

## 分離されたコンテキストを定義する

まず、分離されたKoinインスタンスをメモリに格納するために、分離されたコンテキストホルダーを宣言します。これは、次のような単純なObjectクラスで行うことができます。`MyIsolatedKoinContext`クラスは、Koinインスタンスを保持しています。

```kotlin
object MyIsolatedKoinContext {

    val koinApp = koinApplication {
        // declare used modules
        modules(sdkAppModule)
    }
}
```

:::note
初期化の必要性に応じて`MyIsolatedKoinContext`クラスを調整します。
:::

## Composeで分離されたコンテキストをセットアップする

分離されたKoinコンテキストを定義したので、Composeで使用するためにセットアップし、すべてのAPIをオーバーライドできます。ルートのCompose関数で`KoinIsolatedContext`を使用するだけです。これにより、Koinコンテキストがすべての子composableに伝播されます。

```kotlin
@Composable
fun App() {
    // Set current Koin instance to Compose context
    KoinIsolatedContext(context = MyIsolatedKoinContext.koinApp) {

        MyScreen()
    }
}
```

:::info
すべてのKoin Compose APIは、`KoinIsolatedContext`の使用後、Koi分離コンテキストを使用します。
:::
