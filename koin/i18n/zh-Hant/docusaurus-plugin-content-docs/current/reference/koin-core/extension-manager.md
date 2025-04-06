---
title: Extension Manager
---
```markdown
以下是有關 `KoinExtension` 管理器的簡要說明，它專用於在 Koin 框架中新增功能。

## 定義擴展

Koin 擴展包含一個繼承自 `KoinExtension` 介面的類別：

```kotlin
interface KoinExtension {
    
    var koin : Koin
    
    fun onClose()
}
```

此介面可確保您獲得傳遞的 `Koin` 實例，並在 Koin 關閉時呼叫擴展。

## 啟動擴展

要啟動擴展，只需擴展系統的正確位置，並使用 `Koin.extensionManager` 註冊它。

以下是如何定義 `coroutinesEngine` 擴展：

```kotlin
fun KoinApplication.coroutinesEngine() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<KoinCoroutinesEngine>(EXTENSION_NAME) == null) {
            registerExtension(EXTENSION_NAME, KoinCoroutinesEngine())
        }
    }
}
```

以下是如何呼叫 `coroutinesEngine` 擴展：

```kotlin
val Koin.coroutinesEngine: KoinCoroutinesEngine get() = extensionManager.getExtension(EXTENSION_NAME)
```
