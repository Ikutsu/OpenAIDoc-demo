---
title: "Koin 嵌入式"
custom_edit_url: null
---
Koin Embedded 是一个新的 Koin 项目，目标是 Android/Kotlin SDK 和库的开发者。

这个项目提出了帮助使用不同包名重建和打包 Koin 项目的脚本。其目的是为了 SDK 和库的开发，以避免嵌入式 Koin 版本与任何使用其他 Koin 版本的消费应用程序之间发生冲突，这可能会导致冲突。

反馈或帮助？请联系 [Koin 团队](mailto:koin@kotzilla.io)。

## 嵌入式版本（Embedded Version）

这是一个 Koin 嵌入式版本的示例：[Kotzilla 仓库](https://repository.kotzilla.io/#browse/browse:Koin-Embedded)
- 可用包：`embedded-koin-core`, `embedded-koin-android`
- 从 `org.koin.*` 迁移到 `embedded.koin.*`

使用此 Maven 仓库设置您的 Gradle 配置：
```kotlin
maven { 'https://repository.kotzilla.io/repository/kotzilla-platform/' }
```

## 迁移脚本（Relocation Scripts）

这里有一些脚本，可以帮助为给定的包名重建 Koin，从而帮助嵌入它并避免与 Koin 框架的常规使用发生冲突。

有关更多详细信息，请关注 Koin [迁移脚本](https://github.com/InsertKoinIO/koin-embedded?tab=readme-ov-file#koin-relocation-scripts) 项目。