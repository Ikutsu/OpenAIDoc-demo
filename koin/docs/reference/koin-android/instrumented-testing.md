---
title: "Android 仪器化测试"
---
## 在自定义 Application 类中覆盖生产模块

与[单元测试](/docs/reference/koin-test/testing.md)不同，在单元测试中，您可以在每个测试类中有效地调用 start Koin（例如，`startKoin` 或 `KoinTestExtension`），在 Instrumented 测试中，Koin 由您的 `Application` 类启动。

对于覆盖生产 Koin 模块，`loadModules` 和 `unloadModules` 通常是不安全的，因为更改不会立即应用。相反，推荐的方法是将覆盖的 `module` 添加到 `Application` 类中 `startKoin` 使用的 `modules` 中。
如果您想保持应用程序的 `Application` 扩展类不变，您可以在 `AndroidTest` 包中创建另一个类，如下所示：

```kotlin
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            modules(productionModule, instrumentedTestModule)
        }
    }
}
```

为了在您的 Instrumentation 测试中使用此自定义 `Application`，您可能需要创建一个自定义的 [AndroidJUnitRunner](https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner)，如下所示：

```kotlin
class InstrumentationTestRunner : AndroidJUnitRunner() {
    override fun newApplication(
        classLoader: ClassLoader?,
        className: String?,
        context: Context?
    ): Application {
        return super.newApplication(classLoader, TestApplication::class.java.name, context)
    }
}
```

然后使用以下代码在您的 gradle 文件中注册它：

```groovy
testInstrumentationRunner "com.example.myapplication.InstrumentationTestRunner"
```

## 使用测试规则覆盖生产模块

如果您想要更高的灵活性，您仍然需要创建自定义的 `AndroidJUnitRunner`，但是您可以将 `startKoin { ... }` 放在自定义测试规则中，而不是放在自定义应用程序中，如下所示：

```kotlin
class KoinTestRule(
    private val modules: List<Module>
) : TestWatcher() {
    override fun starting(description: Description) {

        if (getKoinApplicationOrNull() == null) {
            startKoin {
                androidContext(InstrumentationRegistry.getInstrumentation().targetContext.applicationContext)
                modules(modules)
            }
        } else {
            loadKoinModules(modules)
        }
    }

    override fun finished(description: Description) {
        unloadKoinModules(modules)
    }
}
```

这样，我们可以直接从我们的测试类中覆盖定义，例如：

```kotlin
private val instrumentedTestModule = module {
    factory<Something> { FakeSomething() }
}

@get:Rule
val koinTestRule = KoinTestRule(
    modules = listOf(productionModule, instrumentedTestModule)
)
```