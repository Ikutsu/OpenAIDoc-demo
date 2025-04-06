---
title: Injecting in Jetpack Compose
---
n
本頁面描述如何為您的 Jetpack Compose 應用程式注入依賴項 - https://developer.android.com/jetpack/compose

## 注入到 @Composable

在編寫您的 composable 函數時，您可以存取以下 Koin API：

* `get()` - 從 Koin 容器獲取實例
* `getKoin()` - 獲取當前 Koin 實例

對於聲明 'MyService' 元件的模組：

```kotlin
val androidModule = module {

    single { MyService() }
}
```

我們可以這樣獲取您的實例：

```kotlin
@Composable
fun App() {
    val myService = get<MyService>()
}
```

:::note
為了與 Jetpack Compose 的函數式方面保持一致，最好的編寫方法是將實例直接注入到函數屬性中。 這樣可以允許使用 Koin 進行預設實作，但保持以您想要的方式注入實例的開放性。
:::

```kotlin
@Composable
fun App(myService: MyService = get()) {
}
```

## ViewModel for @Composable

與您可以存取經典的 single/factory 實例的方式相同，您可以存取以下 Koin ViewModel API：

* `getViewModel()` 或 `koinViewModel()` - 獲取實例

對於聲明 'MyViewModel' 元件的模組：

```kotlin
module {
    viewModel { MyViewModel() }
    // or constructor DSL
    viewModelOf(::MyViewModel)
}
```

我們可以這樣獲取您的實例：

```kotlin
@Composable
fun App() {
    val vm = koinViewModel<MyViewModel>()
}
```

我們可以在函數參數中獲取您的實例：

```kotlin
@Composable
fun App(vm : MyViewModel = koinViewModel()) {

}
```

:::warning
Jetpack Compose 1.1+ 的更新不支援 Lazy API。
:::