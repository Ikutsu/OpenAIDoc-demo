---
title: Ktor & Koin Isolated Context
---
```markdown
`koin-ktor`モジュールは、Ktorに依存性注入をもたらすことに特化しています。

## Isolated Koin Context Plugin

KtorでIsolated Koinコンテナを起動するには、次のように`KoinIsolated`プラグインをインストールします。

```kotlin
fun Application.main() {
    // Install Koin plugin
    install(KoinIsolated) {
        slf4jLogger()
        modules(helloAppModule)
    }
}
```

:::warning
 Isolated Koinコンテキストを使用すると、Ktorサーバーインスタンスの外部でKoinを使用できなくなります（例：`GlobalContext`を使用するなど）。
:::
