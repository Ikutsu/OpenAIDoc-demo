---
title: "Kotlin 多平台应用中定义和模块的注解"
---
## KSP 设置

请按照官方文档中的 KSP 设置进行操作：[KSP with Kotlin Multiplatform](https://kotlinlang.org/docs/ksp-multiplatform.html)

你也可以查看 [Hello Koin KMP](https://github.com/InsertKoinIO/hello-kmp/tree/annotations) 项目，其中包含 Koin Annotations 的基本设置。

添加 KSP 插件

```kotlin
plugins {
    alias(libs.plugins.ksp)
}
```

在 common API 中使用 annotations (注解) library（库）：

```kotlin
sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            api(libs.koin.annotations)
            // ...
        }
}
```

并且不要忘记在正确的 sourceSet (源集) 上配置 KSP：

```kotlin
dependencies {
    add("kspCommonMainMetadata", libs.koin.ksp.compiler)
    add("kspAndroid", libs.koin.ksp.compiler)
    add("kspIosX64", libs.koin.ksp.compiler)
    add("kspIosArm64", libs.koin.ksp.compiler)
    add("kspIosSimulatorArm64", libs.koin.ksp.compiler)
}
```

## 声明 Common Modules (通用模块) & KMP Expect Components (KMP 期望组件)

在你的 `commonMain` sourceSet (源集) 中，你只需要声明一个 Module (模块) 来扫描将包含你的 expect class (期望类) 或 function (函数) 的原生实现的 package (包)。

下面我们有一个 `PlatformModule`，在 `com.jetbrains.kmpapp.platform` package (包) 中扫描，其中我们有 `PlatformHelper` expect class (期望类)。该 module class (模块类) 使用 `@Module` 和 `@ComponentScan` annotations (注解) 进行注释。

```kotlin
// in commonMain

@Module
@ComponentScan("com.jetbrains.kmpapp.platform")
class PlatformModule

// package com.jetbrains.kmpapp.platform 

@Single
expect class PlatformHelper {
    fun getName() : String
}
```

:::note
生成的代码是在每个平台实现中完成的。Module (模块) package (包) 扫描将收集正确的平台实现。
:::

## 注解 Native Components (原生组件)

在每个 implementation sourceSet (实现源集) 中，你现在可以定义正确的平台实现。这些实现使用 `@Single` 注释（可以是其他的定义注释）：

```kotlin
// in androidMain
// package com.jetbrains.kmpapp.platform

@Single
actual class PlatformHelper(
    val context: Context
){
    actual fun getName(): String = "I'm Android - $context"
}

// in nativeMain
// package com.jetbrains.kmpapp.platform

@Single
actual class PlatformHelper(){
    actual fun getName(): String = "I'm Native"
}