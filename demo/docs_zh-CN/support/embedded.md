---
title: Koin Embedded
custom_edit_url: null
---
Koin Embedded 是一个新的 Koin 项目，目标是 Android/Kotlin SDK & Library 开发者。

这个项目提出了脚本来帮助使用不同的包名重建和打包 Koin 项目。其目的是为了 SDK & Library 的开发，以避免嵌入的 Koin 版本与任何使用其他 Koin 版本的消费应用程序之间发生冲突，这可能会导致冲突。

反馈或帮助？联系 [Koin Team](mailto:koin@kotzilla.io)。

## Embedded Version

这是一个 Koin 嵌入版本的例子：[Kotzilla Repository](https://repository.kotzilla.io/#browse/browse:Koin-Embedded)
- 可用包：`embedded-koin-core`, `embedded-koin-android`
- 从 `org.koin.*` 迁移到 `embedded.koin.*`

使用此 Maven 仓库设置您的 Gradle 配置：
```kotlin
maven { 'https://repository.kotzilla.io/repository/kotzilla-platform/' }
```

## Relocation Scripts

这里有一些脚本可以帮助为给定的包名重建 Koin，帮助嵌入它并避免与 Koin 框架的常规使用发生冲突。

关注 Koin [relocation scripts](https://github.com/InsertKoinIO/koin-embedded?tab=readme-ov-file#koin-relocation-scripts) 项目以获取更多详细信息。
```