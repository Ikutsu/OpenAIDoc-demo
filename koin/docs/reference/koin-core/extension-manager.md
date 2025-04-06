---
title: 扩展管理器
---
以下是关于 `KoinExtension` 管理器的简要描述，它专门用于在 Koin 框架内部添加新特性。

## 定义一个扩展

一个 Koin 扩展包含一个继承自 `KoinExtension` 接口的类：

```kotlin
interface KoinExtension {
    
    var koin : Koin
    
    fun onClose()
}
```

这个接口确保你得到一个传入的 `Koin` 实例，并且在 Koin 关闭时调用该扩展。

## 启动一个扩展

要启动一个扩展，只需扩展系统的正确位置，并使用 `Koin.extensionManager` 注册它。

下面是我们如何定义 `coroutinesEngine` 扩展：

```kotlin
fun KoinApplication.coroutinesEngine() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<KoinCoroutinesEngine>(EXTENSION_NAME) == null) {
            registerExtension(EXTENSION_NAME, KoinCoroutinesEngine())
        }
    }
}
```

下面是我们如何调用 `coroutinesEngine` 扩展：

```kotlin
val Koin.coroutinesEngine: KoinCoroutinesEngine get() = extensionManager.getExtension(EXTENSION_NAME)
```