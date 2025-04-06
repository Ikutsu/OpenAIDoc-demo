---
title: CheckModules - Check Koin configuration (Deprecated)
---
```markdown
:::warning
このAPIは非推奨となりました - Koin 4.0 以降
:::

Koinを使用すると、構成モジュールを検証し、実行時に依存性注入（Dependency Injection）の問題を発見することを回避できます。

### Koin Dynamic Check - CheckModules()

JUnitテスト内で`checkModules()`関数を呼び出します。これにより、モジュールが起動され、可能な定義が実行されます。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        
        koinApplication {
            modules(module1,module2)
            checkModules()
        }
    }
}
```

`checkKoinModules`を使用することも可能です。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        
        checkKoinModules(listOf(module1,module2))
    }
}
```

#### CheckModule DSL

インジェクトされたパラメータ、プロパティ、または動的なインスタンスを使用する定義の場合、`checkModules` DSLを使用すると、次のケースでの動作を指定できます。

* `withInstance(value)` - `value`インスタンスをKoinグラフに追加します（依存関係またはパラメータで使用できます）。

* `withInstance<MyType>()` - `MyType`のモックインスタンスを追加します。MockProviderRuleを使用します（依存関係またはパラメータで使用できます）。

* `withParameter<Type>(qualifier){ qualifier -> value }` - `value`インスタンスをパラメータとしてインジェクトされるように追加します。

* `withParameter<Type>(qualifier){ qualifier -> parametersOf(...) }` - `value`インスタンスをパラメータとしてインジェクトされるように追加します。

* `withProperty(key,value)` - プロパティをKoinに追加します。

#### Junitルールによるモックの許可

`checkModules`でモックを使用するには、`MockProviderRule`を提供する必要があります。

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Mock with your framework here given clazz 
}
```

#### 動的な振る舞いを持つモジュールの検証 (3.1.3+)

次のような動的な振る舞いを検証するには、CheckKoinModules DSLを使用して、テストに必要なインスタンスデータを提供しましょう。

```kotlin
val myModule = module {
    factory { (id: String) -> FactoryPresenter(id) }
}
```

以下のように検証できます。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        
        koinApplication {
            modules(myModule)
            checkModules(){
                // Koinに追加される値、定義で使用されます
                withInstance("_my_id_value")
            }
        }
    }
}
```

このようにして、`FactoryPresenter`の定義には、上記で定義された`"_my_id_value"`がインジェクトされます。

モックインスタンスを使用してグラフを埋めることもできます。Koinがインジェクトされた定義をモックできるようにするには、`MockProviderRule`の宣言が必要であることに注意してください。

```kotlin
val myModule1 = module {
    factory { (a : ComponentA) -> ComponentB(a) }
}
// or
val myModule2 = module {
    factory { ComponentB(get()) }
}
```

```kotlin
class CheckModulesTest : KoinTest {
    
    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        // Setup your nock framework
        Mockito.mock(clazz.java)
    }

    @Test
    fun verifyKoinApp() {
        
        koinApplication {
            modules(myModule1)
            checkModules(){
                // ComponentAのモックをKoinに追加します
                withInstance<ComponentA>()
            }
        }
    }
}
```

#### Android用モジュールのチェック (3.1.3)

以下に、典型的なAndroidアプリのグラフをテストする方法を示します。

```kotlin
class CheckModulesTest {

    @get:Rule
    val rule: TestRule = InstantTaskExecutorRule()

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun `test DI modules`(){
        koinApplication {
            modules(allModules)
            checkModules(){
                withInstance<Context>()
                withInstance<Application>()
                withInstance<SavedStateHandle>()
                withInstance<WorkerParameters>()
            }
        }
    }
}
```

`checkKoinModules`を使用することも可能です。

```kotlin
class CheckModulesTest {

    @get:Rule
    val rule: TestRule = InstantTaskExecutorRule()

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun `test DI modules`(){
        checkKoinModules(allModules) {
            withInstance<Context>()
            withInstance<Application>()
            withInstance<SavedStateHandle>()
            withInstance<WorkerParameters>()
        }
    }
}
```

#### デフォルト値の提供 (3.1.4)

必要に応じて、チェックされたモジュールのすべてのタイプのデフォルト値を設定できます。たとえば、インジェクトされたすべての文字列値をオーバーライドできます。

`checkModules`ブロックで`withInstance()`関数を使用して、すべての定義のデフォルト値を定義しましょう。

```kotlin
@Test
fun `test DI modules`(){
    koinApplication {
        modules(allModules)
        checkModules(){
            withInstance("_ID_")
        }
    }
}
```

インジェクトされた`String`パラメータを使用しているすべてのインジェクトされた定義は、`"_ID_"`を受け取ります。

```kotlin
module {
    single { (i: String) -> Simple.ComponentC(i) }
    factory { (id: String) -> FactoryPresenter(id) }
}
```

#### ParametersOf値の提供 (3.1.4)

`withParameter`または`withParameters`関数を使用して、特定の定義に対してインジェクトされるデフォルト値を定義できます。

```kotlin
@Test
fun `test DI modules`(){
    koinApplication {
        modules(allModules)
        checkModules(){
            withParameter<FactoryPresenter> { "_FactoryId_" }
            withParameters<FactoryPresenter> { parametersOf("_FactoryId_",...) }
        }
    }
}
```

#### スコープリンクの提供

`checkModules`ブロックで`withScopeLink`関数を使用してスコープをリンクし、別のスコープの定義からインスタンスをインジェクトできます。

```kotlin
val myModule = module {
    scope(named("scope1")) {
        scoped { ComponentA() }
    }
    scope(named("scope2")) {
        scoped { ComponentB(get()) }
    }
}
```

```kotlin
@Test
fun `test DI modules`(){
    koinApplication {
        modules(myModule)
        checkModules(){
            withScopeLink(named("scope2"), named("scope1"))
        }
    }
}
```
