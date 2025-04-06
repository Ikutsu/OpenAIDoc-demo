---
title: Koin Embedded
custom_edit_url: null
---
Koin Embedded 是一個新的 Koin 專案，目標對象是 Android/Kotlin SDK & Library 開發者。

這個專案提出了腳本，以幫助使用不同的套件名稱重建和打包 Koin 專案。這樣做的目的是為了 SDK & Library 的開發，以避免嵌入式 (embedded) Koin 版本與任何使用另一個 Koin 版本的使用者應用程式 (consuming application) 之間發生衝突，因為這可能會發生衝突。

有任何回饋或需要協助嗎？請聯絡 [Koin Team](mailto:koin@kotzilla.io)。

## 嵌入式版本 (Embedded Version)

以下是 Koin 嵌入式版本 (embeded version) 的範例：[Kotzilla Repository](https://repository.kotzilla.io/#browse/browse:Koin-Embedded)
- 可用的套件 (packages)：`embedded-koin-core`, `embedded-koin-android`
- 從 `org.koin.*` 重新定位到 `embedded.koin.*`

使用此 Maven 儲存庫設定您的 Gradle 配置：
```kotlin
maven { 'https://repository.kotzilla.io/repository/kotzilla-platform/' }
```

## 重新定位腳本 (Relocation Scripts)

這裡有一些腳本可以幫助為給定的套件名稱重建 Koin，從而幫助嵌入它並避免與 Koin 框架的常規使用發生衝突。

請追蹤 Koin [relocation scripts](https://github.com/InsertKoinIO/koin-embedded?tab=readme-ov-file#koin-relocation-scripts) 專案以獲取更多詳細資訊。
