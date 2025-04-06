---
title: Injecting in Tests
---
## 使用 KoinTest 讓你的測試成為 KoinComponent

*警告*：這不適用於 Android Instrumented 測試。 如需使用 Koin 進行 Instrumented 測試，請參閱 [Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing.md)

透過將您的類別標記為 `KoinTest`，您的類別會變成 `KoinComponent` 並為您帶來：

* `by inject()` & `get()` - 從 Koin 檢索您的實例的函式
* `checkModules` - 幫助您檢查您的配置
* `declareMock` & `declare` - 在目前上下文中宣告 Mock 或新的定義

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    // Lazy inject property
    val componentB : ComponentB by inject()

    @Test
    fun `should inject my components`() {
        startKoin {
            modules(
                module {
                    single { ComponentA() }
                    single { ComponentB(get()) }
                })
        }

        // directly request an instance
        val componentA = get<ComponentA>()

        assertNotNull(a)
        assertEquals(componentA, componentB.a)
    }
```

:::note
 不要猶豫是否要重載 Koin 模組配置，以幫助您部分構建您的應用程式。
:::

## JUnit Rules (規則)

### 為您的測試建立 Koin context (上下文)

您可以使用以下規則，輕鬆地為您的每個測試建立和持有 Koin context：

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // Your KoinApplication instance here
    modules(myModule)
}
```

### 指定您的 Mock Provider (提供者)

為了讓您可以使用 `declareMock` API，您需要指定一個規則，讓 Koin 知道您如何構建您的 Mock 實例。 這讓您可以為您的需求選擇正確的 mocking framework (Mock 框架)。

使用 Mockito 建立 mocks：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    Mockito.mock(clazz.java)
}
```

使用 MockK 建立 mocks：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    mockkClass(clazz)
}
```

!> koin-test 專案不再與 mockito 綁定

## 開箱即用的 Mocking

您可以隨時使用 `declareMock` 宣告一個 mock，而不是每次需要 mock 時都建立一個新模組：

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(
            module {
                single { ComponentA() }
                single { ComponentB(get()) }
            })
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }
    
    @Test
    fun `should inject my components`() {
    
    }
        // Replace current definition by a Mock
        val mock = declareMock<ComponentA>()

        // retrieve mock, same as variable above 
        assertNotNull(get<ComponentA>())

        // is built with mocked ComponentA
        assertNotNull(get<ComponentB>())
    }
```

:::note
 declareMock 可以指定您想要 single (單例) 還是 factory (工廠)，以及您是否想要將其放在 module path (模組路徑) 中。
:::

## 隨時宣告 component (元件)

當 mock 不夠用並且不想僅為此建立模組時，您可以使用 `declare`：

```kotlin
    @Test
    fun `successful declare an expression mock`() {
        startKoin { }

        declare {
            factory { ComponentA("Test Params") }
        }

        Assert.assertNotEquals(get<ComponentA>(), get<ComponentA>())
    }
```

## 檢查您的 Koin 模組

Koin 提供了一種方法來測試您的 Koin 模組是否良好：`checkModules` - 遍歷您的定義樹，並檢查每個定義是否已綁定

```kotlin
    @Test
    fun `check MVP hierarchy`() {
        checkModules {
            modules(myModule1, myModule2 ...)
        } 
    }
```

## 為您的測試啟動和停止 Koin

請注意在每次測試之間停止您的 koin 實例（如果您在測試中使用 `startKoin`）。 否則，請務必使用 `koinApplication` (用於本地 koin 實例) 或 `stopKoin()` 來停止當前的全域實例。

## 使用 JUnit5 進行測試
JUnit 5 支援提供 [Extensions]([url](https://junit.org/junit5/docs/current/user-guide/#extensions))，它將處理 Koin context 的啟動和停止。 這表示如果您使用擴展，則不需要使用 `AutoCloseKoinTest`。

### Dependency (依賴)
為了使用 JUnit5 進行測試，您需要使用 `koin-test-junit5` 依賴。

### Writing tests (編寫測試)
您需要 Register (註冊) `KoinTestExtension` 並提供您的模組配置。 完成此操作後，您可以 get (取得) 或 inject (注入) 您的 components 到測試中。 請記住將 `@JvmField` 與 `@RegisterExtension` 一起使用。

```kotlin
class ExtensionTests: KoinTest {

    private val componentB by inject<Simple.ComponentB>()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
            single { Simple.ComponentA() }
            single { Simple.ComponentB(get()) }
        })
    }

    @Test
    fun contextIsCreatedForTheTest() {
        Assertions.assertNotNull(get<Simple.ComponentA>())
        Assertions.assertNotNull(componentB)
    }
}

```

### Mocking with JUnit5
這與 JUnit4 中的工作方式相同，只是您需要使用 `@RegisterExtension`。

```kotlin
class MockExtensionTests: KoinTest {

    val mock: Simple.UUIDComponent by inject()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.UUIDComponent() }
                })
    }

    @JvmField
    @RegisterExtension
    val mockProvider = MockProviderExtension.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun mockProviderTest() {
        val uuidValue = "UUID"
        declareMock<Simple.UUIDComponent> {
            BDDMockito.given(getUUID()).will { uuidValue }
        }

        Assertions.assertEquals(uuidValue, mock.getUUID())
    }
}
```

### Getting the created Koin instances (取得已建立的 Koin 實例)
您還可以將建立的 koin context 作為函式參數取得。 這可以透過將函式參數新增到測試函式來實現。

```kotlin
class ExtensionTests: KoinTest {
    
    @RegisterExtension
    @JvmField
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.ComponentA() }
                })
    }

    @Test
    fun contextIsCreatedForTheTest(koin: Koin) {
        // get<SimpleComponentA>() == koin.get<Simple.ComponentA>()
        Assertions.assertNotNull(koin.get<Simple.ComponentA>())
    }
}
```
