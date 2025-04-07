---
title: "验证你的 Koin 配置"
---
Koin 允许你验证配置模块，避免在运行时发现依赖注入问题。

## 使用 Verify() 进行 Koin 配置检查 - 仅限 JVM [3.3]

在 Koin 模块上使用 `verify()` 扩展函数。 就这么简单！ 在底层，它会验证所有构造函数类，并与 Koin 配置进行交叉检查，以了解是否为此依赖项声明了组件。 如果失败，该函数将抛出 `MissingKoinDefinitionException` 异常。

```kotlin
val niaAppModule = module {
    includes(
        jankStatsKoinModule,
        dataKoinModule,
        syncWorkerKoinModule,
        topicKoinModule,
        authorKoinModule,
        interestsKoinModule,
        settingsKoinModule,
        bookMarksKoinModule,
        forYouKoinModule
    )
    viewModelOf(::MainActivityViewModel)
}
```

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {

        // Verify Koin configuration
        niaAppModule.verify()
    }
}
```

运行 JUnit 测试，就完成了！ ✅

正如你可能看到的，我们使用额外的 `Types` 参数来列出 Koin 配置中使用但未直接声明的类型。 `SavedStateHandle` 和 `WorkerParameters` 类型就是这种情况，它们用作注入的参数。 `Context` 由启动时的 `androidContext()` 函数声明。

`verify()` API 运行起来非常轻量级，不需要任何类型的 mock/stub 就可以在你的配置上运行。

## 验证注入的参数 - 仅限 JVM [4.0]

当你有一个包含使用 `parametersOf` 注入对象的配置时，验证将失败，因为你的配置中没有参数类型的定义。 但是，你可以定义一个参数类型，以使用给定的定义 `definition<Type>(Class1::class, Class2::class ...)` 进行注入。

以下是具体操作：

```kotlin
class ModuleCheck {

    // 给定一个带有注入定义的定义
    val module = module {
        single { (a: Simple.ComponentA) -> Simple.ComponentB(a) }
    }

    @Test
    fun checkKoinModule() {
        
        // 验证并声明注入的参数
        module.verify(
            injections = injectedParameters(
                definition<Simple.ComponentB>(Simple.ComponentA::class)
            )
        )
    }
}
```

## 类型白名单

我们可以将类型添加为 “白名单”。 这意味着该类型被视为存在于系统中，用于任何定义。 以下是具体操作：

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {

        // Verify Koin configuration
        niaAppModule.verify(
            // 列出定义中使用但未直接声明的类型（如参数注入）
            extraTypes = listOf(MyType::class ...)
        )
    }
}
```