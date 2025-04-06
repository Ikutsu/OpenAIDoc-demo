---
title: Managing Android Scopes
---
## 使用 Android 生命週期

Android 組件主要由其生命週期管理：我們無法直接實例化一個 Activity 或 Fragment。系統會為我們進行所有的建立和管理，並在方法上進行回調：onCreate、onStart...

這就是為什麼我們無法在 Koin 模組中描述我們的 Activity/Fragment/Service。然後我們需要將依賴項注入到屬性中，並尊重生命週期：與 UI 部分相關的組件必須在我們不再需要它們時立即釋放。

然後我們有：

* 長生命週期的組件 (Services, Data Repository ...) - 由多個螢幕使用，永不丟棄
* 中等生命週期的組件 (user sessions ...) - 由多個螢幕使用，必須在一段時間後丟棄
* 短生命週期的組件 (views) - 僅由一個螢幕使用，必須在螢幕結束時丟棄

長生命週期的組件可以很容易地描述為 `single` 定義。對於中等和短生命週期的組件，我們可以有幾種方法。

在 MVP 架構風格的情況下，`Presenter` 是一個短生命週期的組件，用於幫助/支援 UI。每次顯示螢幕時都必須建立 Presenter，並且在螢幕消失後丟棄。

每次都會建立一個新的 Presenter

```kotlin
class DetailActivity : AppCompatActivity() {

    // injected Presenter
    override val presenter : Presenter by inject()
```

我們可以在模組中描述它：

* 作為 `factory` - 每次調用 `by inject()` 或 `get()` 時都會產生一個新實例

```kotlin
val androidModule = module {

    // Factory instance of Presenter
    factory { Presenter() }
}
```

* 作為 `scope` - 產生一個與作用域（scope）綁定的實例

```kotlin
val androidModule = module {

    scope<DetailActivity> {
        scoped { Presenter() }
    }
}
```

:::note
大多數 Android 記憶體洩漏來自於從非 Android 組件引用 UI/Android 組件。系統會保留對它的引用，並且無法通過垃圾回收完全丟棄它。
:::

## Android 組件的作用域 (Scope) (自 3.2.1 起)

### 宣告一個 Android 作用域（Scope）

要在 Android 組件上設定依賴項的作用域，您必須使用 `scope` 程式碼區塊宣告一個作用域部分，如下所示：

```kotlin
class MyPresenter()
class MyAdapter(val presenter : MyPresenter)

module {
  // Declare scope for MyActivity
  scope<MyActivity> {
    // get MyPresenter instance from current scope 
    scoped { MyAdapter(get()) }
    scoped { MyPresenter() }
  }
}
```

### Android 作用域（Scope）類別

Koin 提供 `ScopeActivity`、`RetainedScopeActivity` 和 `ScopeFragment` 類別，讓您可以直接使用為 Activity 或 Fragment 宣告的作用域（Scope）：

```kotlin
class MyActivity : ScopeActivity() {
    
    // MyPresenter is resolved from MyActivity's scope 
    val presenter : MyPresenter by inject()
}
```

在底層，Android 作用域（scope）需要與 `AndroidScopeComponent` 介面一起使用才能實現 `scope` 欄位，如下所示：

```kotlin
abstract class ScopeActivity(
    @LayoutRes contentLayoutId: Int = 0,
) : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkNotNull(scope)
    }
}
```

我們需要使用 `AndroidScopeComponent` 介面並實現 `scope` 屬性。這將設定您的類別使用的預設作用域（scope）。

### Android 作用域（Scope） API

要創建一個綁定到 Android 組件的 Koin 作用域（scope），只需使用以下函數：
- `createActivityScope()` - 為當前 Activity 創建作用域（scope）（必須宣告作用域部分）
- `createActivityRetainedScope()` - 為當前 Activity 創建一個保留的作用域（scope）（由 ViewModel 生命週期支援）（必須宣告作用域部分）
- `createFragmentScope()` - 為當前 Fragment 創建作用域（scope）並連結到父 Activity 作用域（scope）

這些函數可用作委託，以實現不同種類的作用域（scope）：

- `activityScope()` - 為當前 Activity 創建作用域（scope）（必須宣告作用域部分）
- `activityRetainedScope()` - 為當前 Activity 創建一個保留的作用域（scope）（由 ViewModel 生命週期支援）（必須宣告作用域部分）
- `fragmentScope()` - 為當前 Fragment 創建作用域（scope）並連結到父 Activity 作用域（scope）

```kotlin
class MyActivity() : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityScope()
    
}
```

我們也可以使用以下方法設定一個保留的作用域（scope）（由 ViewModel 生命週期支援）：

```kotlin
class MyActivity() : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityRetainedScope()
}
```

:::note
如果您不想使用 Android 作用域（Scope）類別，您可以使用自己的類別並將 `AndroidScopeComponent` 與作用域（Scope）創建 API 一起使用
:::

### AndroidScopeComponent 和作用域（Scope）關閉處理

您可以在 Koin 作用域（Scope）被銷毀之前執行一些程式碼，方法是覆寫 `AndroidScopeComponent` 中的 `onCloseScope` 函數：

```kotlin
class MyActivity() : AppCompatActivity(contentLayoutId), AndroidScopeComponent {

    override val scope: Scope by activityScope()

    override fun onCloseScope() {
        // Called before closing the Scope
    }
}
```

:::note
如果您嘗試從 `onDestroy()` 函數訪問作用域（Scope），則作用域（scope）將已關閉。
:::

### ViewModel 作用域（Scope）(自 3.5.4 起)

ViewModel 僅針對根作用域（root scope）創建，以避免任何洩漏（洩漏 Activity 或 Fragment ...）。這可以防止可見性問題，其中 ViewModel 可能有權訪問不相容的作用域（scope）。

:::warn
ViewModel 無法訪問 Activity 或 Fragment 作用域（scope）。為什麼？因為 ViewModel 的生命週期比 Activity 和 Fragment 長，然後它會將依賴項洩漏到適當作用域（scope）之外。
:::

:::note
如果您*真的*需要從 ViewModel 作用域（scope）外部橋接依賴項，您可以使用「注入的參數」將一些物件傳遞給您的 ViewModel：`viewModel { p ->  }`
:::

`ScopeViewModel` 是一個新的類別，用於幫助處理 ViewModel 作用域（scope）。這處理 ViewModel 的作用域（scope）創建，並提供 `scope` 屬性以允許使用 `by scope.inject()` 進行注入：

```kotlin
module {
    viewModelOf(::MyScopeViewModel)
    scope<MyScopeViewModel> {
        scopedOf(::Session)
    }    
}

class MyScopeViewModel : ScopeViewModel() {

    // on onCleared, scope is closed
    
    // injected from current MyScopeViewModel's scope
    val session by scope.inject<Session>()

}
```

通過使用 `ScopeViewModel`，您還可以覆寫 `onCloseScope()` 函數，以在作用域（scope）關閉之前執行程式碼。

:::note
ViewModel 作用域（scope）內的所有實例都具有相同的可見性，並且將在 ViewModel 實例的生命週期內存在，直到調用 ViewModel 的 onCleared 函數。
:::

例如，一旦 Activity 或 Fragment 創建了一個 ViewModel，就會創建關聯的作用域（scope）：

```kotlin
class MyActivity : AppCompatActivity() {

    // Create ViewModel and its scope
    val myViewModel by viewModel<MyScopeViewModel>()

}
```

一旦創建了您的 ViewModel，就可以創建和注入來自此作用域（scope）內的所有關聯依賴項。

要手動實現您的 ViewModel 作用域（scope），而無需 `ScopeViewModel` 類別，請按如下步驟操作：

```kotlin
class MyScopeViewModel : ViewModel(), KoinScopeComponent {

    override val scope: Scope = createScope(this)

    // inject your dependency
    val session by scope.inject<Session>()

    // clear scope
    override fun onCleared() {
        super.onCleared()
        scope.close()
    }
}
```

## 作用域（Scope）連結

作用域（Scope）連結允許在具有自定義作用域（scope）的組件之間共享實例。

在更廣泛的用法中，您可以在組件之間使用 `Scope` 實例。例如，如果我們需要共享一個 `UserSession` 實例。

首先宣告一個作用域（scope）定義：

```kotlin
module {
    // Shared user session data
    scope(named("session")) {
        scoped { UserSession() }
    }
}
```

當需要開始使用 `UserSession` 實例時，為其創建一個作用域（scope）：

```kotlin
val ourSession = getKoin().createScope("ourSession",named("session"))

// link ourSession scope to current `scope`, from ScopeActivity or ScopeFragment
scope.linkTo(ourSession)
```

然後在您需要的任何地方使用它：

```kotlin
class MyActivity1 : ScopeActivity() {
    
    fun reuseSession(){
        val ourSession = getKoin().createScope("ourSession",named("session"))
        
        // link ourSession scope to current `scope`, from ScopeActivity or ScopeFragment
        scope.linkTo(ourSession)

        // will look at MyActivity1's Scope + ourSession scope to resolve
        val userSession = get<UserSession>()
    }
}
class MyActivity2 : ScopeActivity() {

    fun reuseSession(){
        val ourSession = getKoin().createScope("ourSession",named("session"))
        
        // link ourSession scope to current `scope`, from ScopeActivity or ScopeFragment
        scope.linkTo(ourSession)

        // will look at MyActivity2's Scope + ourSession scope to resolve
        val userSession = get<UserSession>()
    }
}
```
