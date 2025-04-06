---
title: Android Instrumented Testing
---
## 在自定義的 Application 類別中覆蓋生產模組

與[單元測試](/docs/reference/koin-test/testing.md)不同，在單元測試中，你可以在每個測試類別中有效地呼叫 `startKoin` (例如 `startKoin` 或 `KoinTestExtension`)，在 Instrumented 測試中，Koin 由你的 `Application` 類別啟動。

為了覆蓋生產 Koin 模組，`loadModules` 和 `unloadModules` 通常是不安全的，因為變更不會立即應用。相反，推薦的方法是將覆蓋的 `module` 添加到 `Application` 類別中 `startKoin` 使用的 `modules` 中。如果你想保持擴展應用程式的 `Application` 的類別不變，你可以在 `AndroidTest` 套件中建立另一個類別，例如：
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
為了在你的 Instrumentation 測試中使用這個自定義的 `Application`，你可能需要建立一個自定義的 [AndroidJUnitRunner](https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner)，例如：
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
然後在你的 gradle 檔案中註冊它：
```groovy
testInstrumentationRunner "com.example.myapplication.InstrumentationTestRunner"
```

## 使用測試規則覆蓋生產模組

如果你想要更大的靈活性，你仍然需要建立自定義的 `AndroidJUnitRunner`，但不是在自定義應用程式中擁有 `startKoin { ... }`，你可以將它放在自定義測試規則中，例如：
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
這樣，我們就可以直接從我們的測試類別中覆蓋定義，例如：
```kotlin
private val instrumentedTestModule = module {
    factory<Something> { FakeSomething() }
}

@get:Rule
val koinTestRule = KoinTestRule(
    modules = listOf(productionModule, instrumentedTestModule)
)
```
