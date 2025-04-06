---
title: Koin Embedded
custom_edit_url: null
---
Koin Embedded 是一个新的 Koin 项目，目标用户是 Android/Kotlin SDK & Library （软件开发工具包和库）开发者。

该项目提供了一些脚本，以帮助使用不同的包名重建和打包 Koin 项目。这样做的目的是为了 SDK 和 Library 的开发，以避免嵌入的 Koin 版本与任何使用其他 Koin 版本的消费应用程序之间发生冲突，从而避免潜在的冲突。

需要反馈或帮助？请联系 [Koin 团队](mailto:koin@kotzilla.io)。

## 嵌入式版本（Embedded Version）

以下是 Koin 嵌入式版本的一个示例：[Kotzilla Repository](https://repository.kotzilla.io/#browse/browse:Koin-Embedded)
- 可用包：`embedded-koin-core`, `embedded-koin-android`
- 从 `org.koin.*` 迁移到 `embedded.koin.*`

使用此 Maven 仓库设置您的 Gradle 配置：
```kotlin
maven { 'https://repository.kotzilla.io/repository/kotzilla-platform/' }
```

## 迁移脚本（Relocation Scripts）

这里有一些脚本，可以帮助为给定的包名重建 Koin，从而帮助嵌入它，并避免与 Koin 框架的常规使用发生冲突。

有关更多详细信息，请关注 Koin [relocation scripts](https://github.com/InsertKoinIO/koin-embedded?tab=readme-ov-file#koin-relocation-scripts) 项目。
