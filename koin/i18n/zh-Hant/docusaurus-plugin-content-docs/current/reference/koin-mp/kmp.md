---
title: Kotlin Multiplatform Dependency Injection
---
## 原始碼專案 (Source Project)

:::info
你可以在這裡找到 Kotlin Multiplatform 專案：https://github.com/InsertKoinIO/hello-kmp
:::

## Gradle 依賴 (Gradle Dependencies)

Koin 是一個純 Kotlin 函式庫，可以用於你共用的 Kotlin 專案中。只需要加入核心依賴 `koin-core` 即可：

在 common 專案中加入 `koin-core`，宣告你的依賴：[https://github.com/InsertKoinIO/hello-kmp/tree/main/buildSrc](https://github.com/InsertKoinIO/hello-kmp/blob/main/buildSrc/src/main/java/Dependencies.kt)

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

## 共用 Koin 模組 (Shared Koin Module)

平台特定的元件可以在這裡宣告，並且稍後在 Android 或 iOS 中使用（直接用 actual 類別甚至 actual 模組宣告）。

你可以在這裡找到共用模組的原始碼：https://github.com/InsertKoinIO/hello-kmp/tree/main/shared

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

Koin 模組需要透過一個函式 (function) 收集：

```kotlin
// Common App Definitions
fun appModule() = listOf(commonModule, platformModule)
```

## Android 應用程式 (Android App)

你可以繼續使用 `koin-android` 的功能，並重複使用通用的模組/類別。

Android 應用程式的程式碼可以在這裡找到：https://github.com/InsertKoinIO/hello-kmp/tree/main/androidApp

## iOS 應用程式 (iOS App)

iOS 應用程式的程式碼可以在這裡找到：https://github.com/InsertKoinIO/hello-kmp/tree/main/iosApp

### 呼叫 Koin (Calling Koin)

讓我們準備一個 Koin 函式（在我們的共用程式碼中）的包裝器：

```kotlin
// Helper.kt

fun initKoin(){
    startKoin {
        modules(appModule())
    }
}
```

我們可以在主應用程式入口點 (Main app entry) 初始化它：

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

### 注入的類別 (Injected Classes)

讓我們從 swift 呼叫 Kotlin 類別的實例 (instance)。

我們的 Kotlin 元件：

```kotlin
// Injection Boostrap Helper
class GreetingHelper : KoinComponent {
    private val greeting : Greeting by inject()
    fun greet() : String = greeting.greeting()
}
```

在我們的 swift 應用程式中：

```kotlin
struct ContentView: View {
        // Create helper instance
    let greet = GreetingHelper().greet()

    var body: some View {
        Text(greet)
    }
}
```

### 全新原生記憶體管理 (New Native Memory Management)

使用根 [gradle.properties](https://kotlinlang.org/docs/native-memory-manager.html) 啟用實驗性功能 (Activate experimental)。

    ```
    