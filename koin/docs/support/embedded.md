---
title: "Koin 嵌入式"
custom_edit_url: null
---
Koin Embedded 是一个新的 Koin 项目，目标用户是 Android/Kotlin SDK 和库的开发者。

这个项目提供了一些脚本，帮助使用不同的包名重新构建和打包 Koin 项目。这样做的目的是为了 SDK 和库的开发，以避免嵌入的 Koin 版本与任何使用其他 Koin 版本的使用应用程序之间发生冲突。

需要反馈或帮助？请联系 [Koin Team](mailto:koin@kotzilla.io)。

## 嵌入版本 (Embedded Version)

以下是一个 Koin 嵌入版本示例：[Kotzilla Repository](https://repository.kotzilla.io/#browse/browse:Koin-Embedded)
- 可用包：`embedded-koin-core`, `embedded-koin-android`
- 从 `org.koin.*` 重定位到 `embedded.koin.*`

使用此 Maven 仓库设置您的 Gradle 配置：
```kotlin
maven { 'https://repository.kotzilla.io/repository/kotzilla-platform/' }
```

## 重定位脚本 (Relocation Scripts)

这里有一些脚本可以帮助您为给定的包名重建 Koin，从而帮助嵌入它并避免与 Koin 框架的常规使用发生冲突。

请关注 Koin [relocation scripts](https://github.com/InsertKoinIO/koin-embedded?tab=readme-ov-file#koin-relocation-scripts) 项目以获取更多详细信息。