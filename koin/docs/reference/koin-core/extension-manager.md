---
title: 扩展管理器
---
以下是对 `KoinExtension` 管理器的简要描述，它专门用于在 Koin 框架内添加新功能。

## 定义扩展

Koin 扩展包含一个继承自 `KoinExtension` 接口的类：

```kotlin
interface KoinExtension {
    
    var koin : Koin
    
    fun onClose()
}
```

此接口允许确保传递一个 `Koin` 实例，并在 Koin 关闭时调用该扩展。

## 启动扩展

要启动扩展，只需扩展系统的正确位置，并使用 `Koin.extensionManager` 注册它。

以下是我们如何定义 `coroutinesEngine` 扩展：

```kotlin
fun KoinApplication.coroutinesEngine() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<KoinCoroutinesEngine>(EXTENSION_NAME) == null) {
            registerExtension(EXTENSION_NAME, KoinCoroutinesEngine())
        }
    }
}
```

以下是我们如何调用 `coroutinesEngine` 扩展：

```kotlin
val Koin.coroutinesEngine: KoinCoroutinesEngine get() = extensionManager.getExtension(EXTENSION_NAME)
```