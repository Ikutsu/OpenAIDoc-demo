---
title: Injecting in Tests
---
## KoinTest でテストを KoinComponent にする

*警告*: これは Android の Instrumented テストには適用されません。Koin を使用した Instrumented テストについては、[Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing.md)を参照してください。

クラスに `KoinTest` のタグを付けると、クラスは `KoinComponent` になり、次の機能が提供されます。

* `by inject()` & `get()` - Koin からインスタンスを取得する関数
* `checkModules` - 設定の確認に役立ちます
* `declareMock` & `declare` - 現在のコンテキストでモックまたは新しい定義を宣言します

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
 アプリケーションを部分的に構築するために、Koin モジュールの構成を遠慮なくオーバーロードしてください。
:::

## JUnit Rules

### テスト用の Koin コンテキストを作成する

次のルールを使用すると、テストごとに Koin コンテキストを簡単に作成および保持できます。

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // Your KoinApplication instance here
    modules(myModule)
}
```

### Mock プロバイダーを指定する

`declareMock` APIを使用できるようにするには、Koin に Mock インスタンスの構築方法を知らせるルールを指定する必要があります。これにより、ニーズに合った適切なモックフレームワークを選択できます。

Mockito を使用してモックを作成します。

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    Mockito.mock(clazz.java)
}
```

MockK を使用してモックを作成します。

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    mockkClass(clazz)
}
```

!> koin-test プロジェクトは Mockito に関連付けられなくなりました。

## 既製のモック

モックが必要になるたびに新しいモジュールを作成する代わりに、`declareMock` を使用してその場でモックを宣言できます。

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
 declareMock は、single か factory か、モジュールパスに含めるかどうかを指定できます。
:::

## コンポーネントをその場で宣言する

モックでは不十分で、このためだけにモジュールを作成したくない場合は、`declare` を使用できます。

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

## Koin モジュールのチェック

Koin には、Koin モジュールが適切かどうかをテストする方法が用意されています:`checkModules` - 定義ツリーを調べて、各定義がバインドされているかどうかを確認します。

```kotlin
    @Test
    fun `check MVP hierarchy`() {
        checkModules {
            modules(myModule1, myModule2 ...)
        } 
    }
```

## テストのための Koin の開始と停止

各テストの間に、koin インスタンスを停止することに注意してください（テストで `startKoin` を使用する場合）。そうでない場合は、ローカルの koin インスタンスの場合は `koinApplication`、現在のグローバルインスタンスを停止する場合は `stopKoin()` を必ず使用してください。

## JUnit5 でのテスト
JUnit 5 のサポートは、Koin コンテキストの開始と停止を処理する[Extensions]([url](https://junit.org/junit5/docs/current/user-guide/#extensions))を提供します。つまり、拡張機能を使用している場合は、`AutoCloseKoinTest` を使用する必要はありません。

### 依存関係
JUnit5 でテストするには、`koin-test-junit5` 依存関係を使用する必要があります。

### テストの作成
`KoinTestExtension` を登録し、モジュール構成を提供する必要があります。これが完了すると、コンポーネントをテストに取得または注入できます。`@RegisterExtension` で `@JvmField` を使用することを忘れないでください。

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

### JUnit5 でのモック
これは JUnit4 と同じように機能しますが、`@RegisterExtension` を使用する必要があります。

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

### 作成された Koin インスタンスの取得
作成された koin コンテキストを関数パラメータとして取得することもできます。これは、テスト関数に関数パラメータを追加することで実現できます。

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
