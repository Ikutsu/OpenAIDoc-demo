---
title: Fragment Factory
---
```markdown
由於 AndroidX 已發布 `androidx.fragment` 程式庫家族，以擴展 Android `Fragment` 周圍的功能

https://developer.android.com/jetpack/androidx/releases/fragment

## Fragment Factory (片段工廠)

自 `2.1.0-alpha-3` 版本起，引入了 `FragmentFactory`（片段工廠），這是一個專用於建立 `Fragment` 類別實例的類別：

https://developer.android.com/reference/kotlin/androidx/fragment/app/FragmentFactory

Koin 可以引入 `KoinFragmentFactory`，以幫助您直接注入 `Fragment` 實例。

## Setup Fragment Factory (設定片段工廠)

首先，在您的 KoinApplication 宣告中，使用 `fragmentFactory()` 關鍵字來設定預設的 `KoinFragmentFactory` 實例：

```kotlin
 startKoin {
    // setup a KoinFragmentFactory instance
    fragmentFactory()

    modules(...)
}
```

## Declare & Inject your Fragment (宣告 & 注入您的片段)

若要宣告 `Fragment` 實例，只需在您的 Koin 模組中將其宣告為 `fragment`，並使用 *constructor injection* (建構子注入)。

給定一個 `Fragment` 類別：

```kotlin
class MyFragment(val myService: MyService) : Fragment() {


}
```

```kotlin
val appModule = module {
    single { MyService() }
    fragment { MyFragment(get()) }
}
```

## Get your Fragment (取得您的片段)

從您的 host `Activity` (主機 Activity) 類別中，使用 `setupKoinFragmentFactory()` 設定您的片段工廠：

```kotlin
class MyActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Koin Fragment Factory
        setupKoinFragmentFactory()

        super.onCreate(savedInstanceState)
        //...
    }
}
```

並使用您的 `supportFragmentManager` 檢索您的 `Fragment`：

```kotlin
supportFragmentManager.beginTransaction()
            .replace<MyFragment>(R.id.mvvm_frame)
            .commit()
```

使用重載的可選參數放入您的 `bundle` 或 `tag`：

```kotlin
supportFragmentManager.beginTransaction()
            .replace<MyFragment>(
                containerViewId = R.id.mvvm_frame,
                args = MyBundle(),
                tag = MyString()
            )
```

## Fragment Factory & Koin Scopes (片段工廠 & Koin 作用域)

如果您想使用 Koin Activity 的 Scope (作用域)，您必須將您的片段在您的作用域內宣告為 `scoped` 定義：

```kotlin
val appModule = module {
    scope<MyActivity> {
        fragment { MyFragment(get()) }
    }
}
```

並使用您的作用域設定您的 Koin 片段工廠：`setupKoinFragmentFactory(lifecycleScope)`

```kotlin
class MyActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Koin Fragment Factory
        setupKoinFragmentFactory(lifecycleScope)

        super.onCreate(savedInstanceState)
        //...
    }
}
```
