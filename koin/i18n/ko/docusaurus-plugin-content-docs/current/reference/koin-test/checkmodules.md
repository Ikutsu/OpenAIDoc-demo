---
title: CheckModules - Check Koin configuration (Deprecated)
---
```markdown
:::warning
이 API는 Koin 4.0부터 더 이상 사용되지 않습니다.
:::

Koin을 사용하면 구성 모듈을 검증하여 런타임 시 의존성 주입 문제를 발견하는 것을 방지할 수 있습니다.

### Koin Dynamic Check - CheckModules()

간단한 JUnit 테스트 내에서 `checkModules()` 함수를 호출합니다. 그러면 모듈이 시작되고 가능한 각 정의를 실행하려고 시도합니다.

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

`checkKoinModules`를 사용하는 것도 가능합니다.

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        
        checkKoinModules(listOf(module1,module2))
    }
}
```

#### CheckModule DSL

주입된 파라미터, 속성 또는 동적 인스턴스를 사용하는 모든 정의에 대해 `checkModules` DSL을 사용하면 다음 경우에 어떻게 작동할지 지정할 수 있습니다.

* `withInstance(value)` - `value` 인스턴스를 Koin 그래프에 추가합니다 (의존성 또는 파라미터에 사용 가능).

* `withInstance<MyType>()` - `MyType`의 모의 인스턴스를 추가합니다. MockProviderRule을 사용하십시오. (의존성 또는 파라미터에 사용 가능)

* `withParameter<Type>(qualifier){ qualifier -> value }` - `value` 인스턴스를 파라미터로 주입되도록 추가합니다.

* `withParameter<Type>(qualifier){ qualifier -> parametersOf(...) }` - `value` 인스턴스를 파라미터로 주입되도록 추가합니다.

* `withProperty(key,value)` - Koin에 속성을 추가합니다.

#### Junit 규칙을 사용하여 모의 허용

`checkModules`에서 모의를 사용하려면 `MockProviderRule`을 제공해야 합니다.

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 여기에 프레임워크로 clazz를 사용하여 모의
}
```

#### 동적 동작으로 모듈 검증 (3.1.3+)

다음과 같은 동적 동작을 검증하려면 CheckKoinModules DSL을 사용하여 테스트에 필요한 인스턴스 데이터를 제공해 보겠습니다.

```kotlin
val myModule = module {
    factory { (id: String) -> FactoryPresenter(id) }
}
```

다음과 같이 확인할 수 있습니다.

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        
        koinApplication {
            modules(myModule)
            checkModules(){
                // Koin에 추가할 값 (정의에 의해 사용됨)
                withInstance("_my_id_value")
            }
        }
    }
}
```

이러한 방식으로 `FactoryPresenter` 정의는 위에서 정의한 `"_my_id_value"`로 주입됩니다.

모의 인스턴스를 사용하여 그래프를 채울 수도 있습니다. Koin이 주입된 정의를 모의할 수 있도록 `MockProviderRule` 선언이 필요하다는 것을 알 수 있습니다.

```kotlin
val myModule1 = module {
    factory { (a : ComponentA) -> ComponentB(a) }
}
// 또는
val myModule2 = module {
    factory { ComponentB(get()) }
}
```

```kotlin
class CheckModulesTest : KoinTest {
    
    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        // Mock 프레임워크 설정
        Mockito.mock(clazz.java)
    }

    @Test
    fun verifyKoinApp() {
        
        koinApplication {
            modules(myModule1)
            checkModules(){
                // ComponentA의 mock을 Koin에 추가
                withInstance<ComponentA>()
            }
        }
    }
}
```

#### Android용 모듈 검사 (3.1.3)

다음은 일반적인 Android 앱에 대한 그래프를 테스트하는 방법입니다.

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

`checkKoinModules`를 사용하는 것도 가능합니다.

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

#### 기본값 제공 (3.1.4)

필요한 경우 검사된 모듈의 모든 유형에 대한 기본값을 설정할 수 있습니다. 예를 들어, 주입된 모든 문자열 값을 재정의할 수 있습니다.

`checkModules` 블록에서 `withInstance()` 함수를 사용하여 모든 정의에 대한 기본값을 정의해 보겠습니다.

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

주입된 `String` 파라미터를 사용하는 주입된 모든 정의는 `"_ID_"`를 받습니다.

```kotlin
module {
    single { (i: String) -> Simple.ComponentC(i) }
    factory { (id: String) -> FactoryPresenter(id) }
}
```

#### ParametersOf 값 제공 (3.1.4)

`withParameter` 또는 `withParameters` 함수를 사용하여 특정 정의에 주입할 기본값을 정의할 수 있습니다.

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

#### 범위 링크 제공

`checkModules` 블록에서 `withScopeLink` 함수를 사용하여 범위를 연결하여 다른 범위의 정의에서 인스턴스를 주입할 수 있습니다.

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
```
