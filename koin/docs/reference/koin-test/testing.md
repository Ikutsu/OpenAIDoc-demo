---
title: 在测试中注入
---
## 使用 KoinTest 使你的测试成为 KoinComponent

*警告*：这不适用于 Android Instrumented 测试。对于使用 Koin 的 Instrumented 测试，请参阅 [Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing.md)

通过标记你的类为 `KoinTest`，你的类将成为一个 `KoinComponent`，并为你带来：

* `by inject()` & `get()` - 从 Koin 检索实例的函数
* `checkModules` - 帮助你检查配置
* `declareMock` & `declare` - 在当前上下文中声明 mock 或新的定义

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    // 延迟注入属性 (Lazy inject property)
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

        // 直接请求一个实例 (directly request an instance)
        val componentA = get<ComponentA>()

        assertNotNull(a)
        assertEquals(componentA, componentB.a)
    }
```

:::note
 不要犹豫重载 Koin 模块配置，以帮助你部分构建你的应用。
:::

## JUnit 规则

### 为你的测试创建一个 Koin 上下文

你可以使用以下规则轻松地为你的每个测试创建并保持一个 Koin 上下文：

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // 你的 KoinApplication 实例在这里 (Your KoinApplication instance here)
    modules(myModule)
}
```

### 指定你的 Mock 提供者

为了让你使用 `declareMock` API，你需要指定一个规则，让 Koin 知道你如何构建你的 Mock 实例。这让你选择适合你需求的正确的 mocking 框架。

使用 Mockito 创建 mocks：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 你的构建 Mock 的方式在这里 (Your way to build a Mock here)
    Mockito.mock(clazz.java)
}
```

使用 MockK 创建 mocks：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 你的构建 Mock 的方式在这里 (Your way to build a Mock here)
    mockkClass(clazz)
}
```

!> koin-test 项目不再与 mockito 绑定

## 开箱即用的 Mocking

与其每次需要 mock 时都创建一个新模块，不如使用 `declareMock` 动态声明一个 mock：

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
        // 用 Mock 替换当前定义 (Replace current definition by a Mock)
        val mock = declareMock<ComponentA>()

        // 检索 mock，与上面的变量相同 (retrieve mock, same as variable above)
        assertNotNull(get<ComponentA>())

        // 使用 mocked ComponentA 构建 (is built with mocked ComponentA)
        assertNotNull(get<ComponentB>())
    }
```

:::note
 declareMock 可以指定你想要 single 还是 factory，以及你是否希望将其放在模块路径中。
:::

## 动态声明一个组件

当 mock 不够用，并且不想仅仅为此创建一个模块时，你可以使用 `declare`：

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

Koin 提供了一种测试你的 Koin 模块是否良好的方法：`checkModules` - 遍历你的定义树并检查每个定义是否绑定

```kotlin
    @Test
    fun `check MVP hierarchy`() {
        checkModules {
            modules(myModule1, myModule2 ...)
        } 
    }
```

## 为你的测试启动和停止 Koin

请注意在每次测试之间停止你的 koin 实例（如果在你的测试中使用 `startKoin`）。否则，请确保使用 `koinApplication`（对于本地 koin 实例）或 `stopKoin()` 来停止当前的全局实例。

## 使用 JUnit5 进行测试
JUnit 5 支持提供 [Extensions]([url](https://junit.org/junit5/docs/current/user-guide/#extensions))，它将处理 Koin 上下文的启动和停止。这意味着，如果你正在使用扩展，你不需要使用 `AutoCloseKoinTest`。

### 依赖
为了使用 JUnit5 进行测试，你需要使用 `koin-test-junit5` 依赖。

### 编写测试
你需要注册 `KoinTestExtension` 并提供你的模块配置。完成此操作后，你可以获取或注入你的组件到测试中。记住在 `@RegisterExtension` 中使用 `@JvmField`。

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
这与 JUnit4 中的工作方式相同，除了你需要使用 `@RegisterExtension`。

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

### 获取已创建的 Koin 实例
你也可以将已创建的 koin 上下文作为函数参数获取。这可以通过向测试函数添加函数参数来实现。

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