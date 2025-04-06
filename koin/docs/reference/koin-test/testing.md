---
title: Injecting in Tests
---
## 使用 KoinTest 使你的测试成为 KoinComponent

*警告*：这不适用于 Android Instrumented 测试。对于使用 Koin 的 Instrumented 测试，请参阅 [Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing.md)

通过将你的类标记为 `KoinTest`，你的类将成为 `KoinComponent`，并为你带来：

* `by inject()` & `get()` - 从 Koin 检索实例的函数
* `checkModules` - 帮助你检查配置
* `declareMock` & `declare` - 在当前上下文中声明 mock 或新定义

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
 不要犹豫重载 Koin 模块配置，以帮助你部分构建你的应用程序。
:::

## JUnit Rules

### 为你的测试创建一个 Koin 上下文

你可以使用以下 rule 轻松地为每个测试创建并持有 Koin 上下文：

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // Your KoinApplication instance here
    modules(myModule)
}
```

### 指定你的 Mock Provider

为了让你使用 `declareMock` API，你需要指定一个 rule，让 Koin 知道你如何构建 Mock 实例。这让你能够为你的需求选择正确的 mocking 框架。

使用 Mockito 创建 mocks：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    Mockito.mock(clazz.java)
}
```

使用 MockK 创建 mocks：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    mockkClass(clazz)
}
```

!> koin-test 项目不再与 mockito 绑定

## 开箱即用的 Mocking

你可以使用 `declareMock` 随时声明一个 mock，而无需每次需要 mock 时都创建一个新模块：

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
 declareMock 可以指定你想要 single 还是 factory，以及你是否想要将其放在模块路径中。
:::

## 随时声明组件

当 mock 不够用，并且不想为此创建一个模块时，你可以使用 `declare`：

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

## 检查你的 Koin 模块

Koin 提供了一种测试你的 Koin 模块是否良好的方法：`checkModules` - 遍历你的定义树，并检查每个定义是否已绑定

```kotlin
    @Test
    fun `check MVP hierarchy`() {
        checkModules {
            modules(myModule1, myModule2 ...)
        } 
    }
```

## 为你的测试启动和停止 Koin

请注意在每次测试之间停止你的 koin 实例（如果你在测试中使用 `startKoin`）。否则，请务必使用 `koinApplication` 用于本地 koin 实例，或使用 `stopKoin()` 停止当前的全局实例。

## 使用 JUnit5 进行测试
JUnit 5 支持提供 [Extensions]([url](https://junit.org/junit5/docs/current/user-guide/#extensions))，它将处理 Koin 上下文的启动和停止。这意味着，如果您使用的是扩展，则不需要使用 `AutoCloseKoinTest`。

### 依赖

对于使用 JUnit5 进行测试，您需要使用 `koin-test-junit5` 依赖项。

### 编写测试

您需要注册 `KoinTestExtension` 并提供您的模块配置。 完成此操作后，您可以获取或注入您的组件到测试中。 记得将 `@JvmField` 与 `@RegisterExtension` 一起使用。

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

### 使用 JUnit5 进行 Mocking

这与 JUnit4 中的工作方式相同，只是您需要使用 `@RegisterExtension`。

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

### 获取创建的 Koin 实例
您还可以将创建的 koin 上下文作为函数参数获取。 这可以通过向测试函数添加一个函数参数来实现。

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
