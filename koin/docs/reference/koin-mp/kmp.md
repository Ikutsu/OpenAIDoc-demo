---
title: Kotlin Multiplatform Dependency Injection
---
## 源码工程

:::info
 你可以在这里找到 Kotlin Multiplatform 工程：https://github.com/InsertKoinIO/hello-kmp
:::

## Gradle 依赖

Koin 是一个纯 Kotlin 库，可以在你共享的 Kotlin 工程中使用。只需添加核心依赖：

在 common 工程中添加 `koin-core`，声明你的依赖：[https://github.com/InsertKoinIO/hello-kmp/tree/main/buildSrc](https://github.com/InsertKoinIO/hello-kmp/blob/main/buildSrc/src/main/java/Dependencies.kt)

```kotlin
// Dependencies.kt

object Versions {
    const val koin = "3.2.0"
}

object Deps {

    object Koin {
        const val core = "io.insert-koin:koin-core:${Versions.koin}"
        const val test = "io.insert-koin:koin-test:${Versions.koin}"
        const val android = "io.insert-koin:koin-android:${Versions.koin}"
    }

}
```

## 共享的 Koin 模块

平台特定的组件可以在这里声明，并在之后在 Android 或 iOS 中使用（直接使用 actual 类或甚至是 actual 模块声明）。

你可以在这里找到共享模块的源码：https://github.com/InsertKoinIO/hello-kmp/tree/main/shared

```kotlin
// platform Module
val platformModule = module {
    singleOf(::Platform)
}

// KMP Class Definition
expect class Platform() {
    val name: String
}

// iOS
actual class Platform actual constructor() {
    actual val name: String =
        UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}

// Android
actual class Platform actual constructor() {
    actual val name: String = "Android ${android.os.Build.VERSION.SDK_INT}"
}
```

Koin 模块需要通过一个函数来收集：

```kotlin
// Common App Definitions
fun appModule() = listOf(commonModule, platformModule)
```

## Android App

你可以继续使用 `koin-android` 的特性并复用 common 模块/类。

Android App 的代码可以在这里找到：https://github.com/InsertKoinIO/hello-kmp/tree/main/androidApp

## iOS App

iOS App 的代码可以在这里找到：https://github.com/InsertKoinIO/hello-kmp/tree/main/iosApp

### 调用 Koin

让我们为 Koin 函数准备一个包装器（在我们的共享代码中）：

```kotlin
// Helper.kt

fun initKoin(){
    startKoin {
        modules(appModule())
    }
}
```

我们可以在 Main app 入口初始化它：

```kotlin
@main
struct iOSApp: App {
    
    // KMM - Koin Call
    init() {
        HelperKt.doInitKoin()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### 注入的类

让我们从 swift 调用一个 Kotlin 类实例。

我们的 Kotlin 组件：

```kotlin
// Injection Boostrap Helper
class GreetingHelper : KoinComponent {
    private val greeting : Greeting by inject()
    fun greet() : String = greeting.greeting()
}
```

在我们的 swift app 中：

```kotlin
struct ContentView: View {
        // Create helper instance
    let greet = GreetingHelper().greet()

    var body: some View {
        Text(greet)
    }
}
```

### 全新 Native 内存管理

使用 root [gradle.properties](https://kotlinlang.org/docs/native-memory-manager.html) 激活 experimental。

    ```
