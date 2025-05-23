---
title: "Why Koin?"
---
Koin은 모든 Kotlin 애플리케이션(Multiplatform, Android, 백엔드 등)에 의존성 주입을 쉽고 효율적으로 통합할 수 있는 방법을 제공합니다.

Koin의 목표는 다음과 같습니다.
- 스마트 API를 통해 의존성 주입 인프라를 간소화합니다.
- Kotlin DSL은 읽기 쉽고 사용하기 쉬우며 모든 종류의 애플리케이션을 작성할 수 있습니다.
- Android 생태계부터 Ktor와 같은 백엔드 요구 사항에 이르기까지 다양한 통합을 제공합니다.
- 어노테이션과 함께 사용할 수 있도록 허용합니다.

## Koin 요약

### Kotlin 개발을 쉽고 생산적으로 만들기

Koin은 스마트한 Kotlin 의존성 주입 라이브러리로, 도구가 아닌 앱에 집중할 수 있도록 도와줍니다.

```kotlin

class MyRepository()
class MyPresenter(val repository : MyRepository) 

// 그냥 선언하세요.
val myModule = module { 
  singleOf(::MyPresenter)
  singleOf(::MyRepository)
}
```

Koin은 Kotlin 관련 기술을 애플리케이션에 구축하고 조립할 수 있는 간단한 도구와 API를 제공하여 비즈니스를 쉽게 확장할 수 있도록 지원합니다.

```kotlin
fun main() { 
  
  // Koin을 시작하세요.
  startKoin {
    modules(myModule)
  }
} 
```

### Android 준비 완료

Kotlin 언어 덕분에 Koin은 Android 플랫폼을 확장하고 원래 플랫폼의 일부로 새로운 기능을 제공합니다.

```kotlin
class MyApplication : Application() {
  override fun onCreate() {
    super.onCreate()

    startKoin {
      modules(myModule)
    }
  } 
}
```

Koin은 `by inject()` 또는 `by viewModel()`을 사용하여 Android 컴포넌트 어디에서나 종속성을 쉽게 검색할 수 있는 강력한 API를 제공합니다.

```kotlin
class MyActivity : AppCompatActivity() {

  val myPresenter : MyPresenter by inject()

} 
```

### Kotlin Multiplatform 지원

모바일 플랫폼 간에 코드를 공유하는 것은 주요 Kotlin Multiplatform 사용 사례 중 하나입니다. Kotlin Multiplatform Mobile을 사용하면 크로스 플랫폼 모바일 애플리케이션을 구축하고 Android와 iOS 간에 공통 코드를 공유할 수 있습니다.

Koin은 멀티 플랫폼 의존성 주입을 제공하고 네이티브 모바일 애플리케이션 및 웹/백엔드 애플리케이션 전반에서 컴포넌트를 구축하는 데 도움이 됩니다.

### 성능 및 생산성

Koin은 사용 및 실행 측면에서 직관적이도록 설계된 순수 Kotlin 프레임워크입니다. 사용하기 쉽고 컴파일 시간에 영향을 미치지 않으며 추가 플러그인 구성이 필요하지 않습니다.

## Koin: 의존성 주입 프레임워크

Koin은 Kotlin을 위한 널리 사용되는 의존성 주입(DI, Dependency Injection) 프레임워크로, 최소한의 상용구 코드로 애플리케이션의 의존성을 관리할 수 있는 현대적이고 가벼운 솔루션을 제공합니다.

### 의존성 주입 vs. 서비스 로케이터

Koin은 서비스 로케이터 패턴과 유사해 보일 수 있지만, 이를 차별화하는 주요 차이점이 있습니다.

- 서비스 로케이터(Service Locator): 서비스 로케이터는 기본적으로 필요에 따라 서비스 인스턴스를 요청할 수 있는 사용 가능한 서비스 레지스트리입니다. 서비스 로케이터는 이러한 인스턴스를 생성하고 관리하는 역할을 하며, 종종 정적 글로벌 레지스트리를 사용합니다.

- 의존성 주입(Dependency Injection): 반면, Koin은 순수한 의존성 주입 프레임워크입니다. Koin을 사용하면 모듈에서 의존성을 선언하고 Koin이 객체 생성 및 연결을 처리합니다. 이를 통해 자체 범위가 있는 여러 독립적인 모듈을 생성하여 의존성 관리를 보다 모듈화하고 잠재적인 충돌을 방지할 수 있습니다.

### Koin의 접근 방식: 유연성과 모범 사례의 조화

Koin은 DI(Dependency Injection)와 서비스 로케이터(Service Locator) 패턴을 모두 지원하여 개발자에게 유연성을 제공합니다. 그러나 DI, 특히 생성자 주입(constructor injection)을 사용하는 것이 좋습니다. 생성자 주입은 의존성이 생성자 매개변수로 전달되는 방식입니다. 이 접근 방식은 테스트 용이성을 향상시키고 코드를 더 쉽게 이해할 수 있도록 만듭니다.

Koin의 설계 철학은 단순성과 쉬운 설정에 중점을 두면서도 필요한 경우 복잡한 구성을 허용합니다. Koin을 사용함으로써 개발자는 DI를 대부분의 시나리오에 권장되고 선호되는 접근 방식으로 사용하여 의존성을 효과적으로 관리할 수 있습니다.

### 투명성 및 디자인 개요

Koin은 DI(의존성 주입, Dependency Injection) 및 SL(서비스 로케이터, Service Locator) 패턴을 모두 지원하는 다재다능한 IoC(제어 역전, Inversion of Control) 컨테이너로 설계되었습니다. Koin이 어떻게 작동하는지 명확하게 이해하고 효과적으로 사용하는 방법을 안내하기 위해 다음 측면을 살펴보겠습니다.

#### Koin이 DI와 SL의 균형을 맞추는 방법

Koin은 DI와 SL의 요소를 결합하여 프레임워크 사용 방식에 영향을 미칠 수 있습니다.

1. **글로벌 컨텍스트 사용:** 기본적으로 Koin은 서비스 로케이터처럼 작동하는 전역적으로 액세스 가능한 컴포넌트를 제공합니다. 이를 통해 `KoinComponent` 또는 `inject` 함수를 사용하여 중앙 레지스트리에서 의존성을 검색할 수 있습니다.

2. **격리된 컴포넌트:** Koin은 DI, 특히 생성자 주입을 권장하지만 격리된 컴포넌트도 허용합니다. 이러한 유연성은 특정 경우에 SL을 활용하면서 DI를 가장 적합한 방식으로 사용하도록 애플리케이션을 구성할 수 있음을 의미합니다.

3. **Android 컴포넌트의 SL:** Android 개발에서 Koin은 종종 설정의 용이성을 위해 `Application` 및 `Activity`와 같은 컴포넌트 내에서 SL을 내부적으로 사용합니다. 이 시점에서 Koin은 특히 생성자 주입을 통해 DI를 권장하여 보다 구조화된 방식으로 의존성을 관리합니다. 그러나 이는 강제 적용되지 않으며 개발자는 필요한 경우 SL을 사용할 수 있는 유연성이 있습니다.

#### 이것이 사용자에게 중요한 이유

DI와 SL의 차이점을 이해하면 애플리케이션의 의존성을 효과적으로 관리하는 데 도움이 됩니다.

- **의존성 주입:** Koin은 테스트 용이성 및 유지 관리 용이성에 대한 이점으로 인해 권장합니다. 생성자 주입은 의존성을 명시적으로 만들고 코드 명확성을 향상시키므로 선호됩니다.

- **서비스 로케이터:** Koin은 특히 Android 컴포넌트에서 편의를 위해 SL을 지원하지만 SL에만 의존하면 결합도가 높아지고 테스트 용이성이 저하될 수 있습니다. Koin의 설계는 균형 잡힌 접근 방식을 제공하여 실용적인 경우 SL을 사용하고 DI를 모범 사례로 홍보합니다.

#### Koin을 최대한 활용하기

Koin을 효과적으로 사용하려면:

- **모범 사례 따르기:** 의존성 관리에 대한 모범 사례에 맞추기 위해 가능한 경우 생성자 주입을 사용합니다. 이 접근 방식은 테스트 용이성과 유지 관리 용이성을 향상시킵니다.

- **Koin의 유연성 활용:** 설정을 단순화하는 시나리오에서 SL에 대한 Koin의 지원을 활용하되 핵심 애플리케이션 의존성을 관리하기 위해 DI에 의존하는 것을 목표로 합니다.

- **설명서 및 예제 참조:** Koin의 설명서 및 예제를 검토하여 프로젝트 요구 사항에 따라 DI 및 SL을 적절하게 구성하고 사용하는 방법을 이해합니다.

- **의존성 관리 시각화:** 다이어그램과 예제는 Koin이 의존성을 해결하고 다양한 컨텍스트 내에서 의존성을 관리하는 방법을 설명하는 데 도움이 될 수 있습니다. 이러한 시각 자료는 Koin의 내부 작동 방식에 대한 더 명확한 이해를 제공할 수 있습니다.

> 이 지침을 제공함으로써 Koin의 기능과 설계 선택 사항을 효과적으로 탐색하고 의존성 관리의 모범 사례를 준수하면서 Koin의 잠재력을 최대한 활용할 수 있도록 돕는 것을 목표로 합니다.