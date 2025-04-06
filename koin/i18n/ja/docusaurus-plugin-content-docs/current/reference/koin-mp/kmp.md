---
title: Kotlin Multiplatform Dependency Injection
---
## ソースプロジェクト

:::info
 Kotlin Multiplatform プロジェクトはこちらにあります: https://github.com/InsertKoinIO/hello-kmp
:::

## Gradle 依存関係

Koin は純粋な Kotlin ライブラリであり、共有 Kotlin プロジェクトで使用できます。コアの依存関係を追加するだけです。

共通プロジェクトに `koin-core` を追加し、依存関係を宣言します: [https://github.com/InsertKoinIO/hello-kmp/tree/main/buildSrc](https://github.com/InsertKoinIO/hello-kmp/blob/main/buildSrc/src/main/java/Dependencies.kt)

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

## 共有 Koin モジュール

プラットフォーム固有のコンポーネントはここに宣言でき、Android または iOS で後で使用できます (実際のクラスまたは実際のモジュールで直接宣言)。

共有モジュールのソースはここにあります: https://github.com/InsertKoinIO/hello-kmp/tree/main/shared

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

Koin モジュールは関数を介して収集する必要があります。

```kotlin
// Common App Definitions
fun appModule() = listOf(commonModule, platformModule)
```

## Android アプリ

`koin-android` の機能を引き続き使用し、共通のモジュール/クラスを再利用できます。

Android アプリのコードはここにあります: https://github.com/InsertKoinIO/hello-kmp/tree/main/androidApp

## iOS アプリ

iOS アプリのコードはここにあります: https://github.com/InsertKoinIO/hello-kmp/tree/main/iosApp

### Koin の呼び出し

Koin 関数 (共有コード内) へのラッパーを準備しましょう:

```kotlin
// Helper.kt

fun initKoin(){
    startKoin {
        modules(appModule())
    }
}
```

メインアプリのエントリで初期化できます:

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

### インジェクトされたクラス

Swift から Kotlin クラスのインスタンスを呼び出しましょう。

Kotlin コンポーネント:

```kotlin
// Injection Boostrap Helper
class GreetingHelper : KoinComponent {
    private val greeting : Greeting by inject()
    fun greet() : String = greeting.greeting()
}
```

Swift アプリ内:

```kotlin
struct ContentView: View {
        // Create helper instance
    let greet = GreetingHelper().greet()

    var body: some View {
        Text(greet)
    }
}
```

### 新しいネイティブメモリ管理 (New Native Memory Management)

ルートの [gradle.properties](https://kotlinlang.org/docs/native-memory-manager.html) で実験的機能をアクティブ化します。

    ```
