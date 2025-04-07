---
title: "Kotlin 多平台依赖注入"
---
## 源码项目

:::info
您可以在这里找到 Kotlin Multiplatform 项目：https://github.com/InsertKoinIO/hello-kmp
:::

## Gradle 依赖

Koin 是一个纯 Kotlin 库，可以在您共享的 Kotlin 项目中使用。只需添加核心依赖：

在公共项目（common project）中添加 `koin-core`，声明您的依赖：[https://github.com/InsertKoinIO/hello-kmp/tree/main/buildSrc](https://github.com/InsertKoinIO/hello-kmp/blob/main/buildSrc/src/main/java/Dependencies.kt)

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

## 共享 Koin 模块

平台特定的组件（platform specific components）可以在这里声明，并在 Android 或 iOS 中稍后使用（直接使用 actual 类甚至 actual 模块声明）。

您可以在这里找到共享模块的源码：https://github.com/InsertKoinIO/hello-kmp/tree/main/shared

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

您可以继续使用 `koin-android` 的功能，并复用公共模块/类（common modules/classes）。

Android 应用程序的代码可以在这里找到：https://github.com/InsertKoinIO/hello-kmp/tree/main/androidApp

## iOS App

iOS 应用程序的代码可以在这里找到：https://github.com/InsertKoinIO/hello-kmp/tree/main/iosApp

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

我们可以在我们的主应用程序入口（Main app entry）中初始化它：

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

### 注入类

让我们从 swift 调用一个 Kotlin 类实例。

我们的 Kotlin 组件：

```kotlin
// Injection Boostrap Helper
class GreetingHelper : KoinComponent {
    private val greeting : Greeting by inject()
    fun greet() : String = greeting.greeting()
}
```

在我们的 swift 应用程序中：

```kotlin
struct ContentView: View {
        // Create helper instance
    let greet = GreetingHelper().greet()

    var body: some View {
        Text(greet)
    }
}
```

### 新的原生内存管理（Native Memory Management）

使用根 [gradle.properties](https://kotlinlang.org/docs/native-memory-manager.html) 激活实验性功能。

    ```