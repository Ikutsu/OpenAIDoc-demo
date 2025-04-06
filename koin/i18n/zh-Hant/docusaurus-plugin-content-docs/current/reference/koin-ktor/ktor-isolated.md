---
title: Ktor & Koin Isolated Context
---
```markdown
`koin-ktor` 模組專門為 Ktor 帶來依賴注入（dependency injection）。

## 獨立的 Koin Context Plugin

若要在 Ktor 中啟動獨立的 Koin 容器（Isolated Koin container），只需安裝 `KoinIsolated` 外掛程式，如下所示：

```kotlin
fun Application.main() {
    // 安裝 Koin 外掛程式
    install(KoinIsolated) {
        slf4jLogger()
        modules(helloAppModule)
    }
}
```

:::warning
透過使用獨立的 Koin context，您將無法在 Ktor 伺服器實例之外使用 Koin (例如：透過使用 `GlobalContext`)
:::
