---
title: "Ktor & Koin 隔离上下文"
---
`koin-ktor` 模块专门为 Ktor 带来依赖注入功能。

## 隔离的 Koin 上下文插件 (Isolated Koin Context Plugin)

要在 Ktor 中启动一个隔离的 Koin 容器 (Isolated Koin container)，只需安装 `KoinIsolated` 插件，如下所示：

```kotlin
fun Application.main() {
    // 安装 Koin 插件
    install(KoinIsolated) {
        slf4jLogger()
        modules(helloAppModule)
    }
}
```

:::warning
通过使用隔离的 Koin 上下文 (Isolated Koin context)，你将无法在 Ktor 服务器实例之外使用 Koin （例如：通过使用 `GlobalContext`）
:::