---
title: "JUnit 测试"
---
> 本教程将帮助您测试 Kotlin 应用程序，并使用 Koin 注入和检索组件。

## 获取代码

:::info
[源代码可在 Github 上找到](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin)
:::

## Gradle 设置

首先，添加 Koin 依赖项，如下所示：

```groovy
dependencies {
    // Koin 测试工具
    testCompile "io.insert-koin:koin-test:$koin_version"
    // 所需的 JUnit 版本
    testCompile "io.insert-koin:koin-test-junit4:$koin_version"
}
```

## 声明依赖

我们复用 `koin-core` getting-started 项目，以使用 Koin 模块：

```kotlin
val helloModule = module {
    single { HelloMessageData() }
    single { HelloServiceImpl(get()) as HelloService }
}
```

## 编写我们的第一个测试

要进行我们的第一个测试，让我们编写一个简单的 Junit 测试文件，并使用 `KoinTest` 扩展它。 然后我们将能够使用 `by inject()` 运算符。

```kotlin
class HelloAppTest : KoinTest {

    val model by inject<HelloMessageData>()
    val service by inject<HelloService>()

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        printLogger()
        modules(helloModule)
    }

    @Test
    fun `unit test`() {
        val helloApp = HelloApplication()
        helloApp.sayHello()

        assertEquals(service, helloApp.helloService)
        assertEquals("Hey, ${model.message}", service.hello())
    }
}
```

> 我们使用 Koin KoinTestRule 规则来启动/停止我们的 Koin 上下文

你甚至可以直接在 MyPresenter 中创建 Mock，或者测试 MyRepository。 这些组件与 Koin API 没有任何联系。

```kotlin
class HelloMockTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        printLogger(Level.DEBUG)
        modules(helloModule)
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun `mock test`() {
        val service = declareMock<HelloService> {
            given(hello()).willReturn("Hello Mock")
        }

        HelloApplication().sayHello()

        Mockito.verify(service,times(1)).hello()
    }
}
```