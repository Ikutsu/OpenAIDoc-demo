---
title: "在 Jetpack Compose 中进行注入"
---
本页介绍如何为你的 Jetpack Compose 应用注入依赖 - https://developer.android.com/jetpack/compose

## 注入到 @Composable 中

在编写可组合函数（composable function）时，你可以访问以下 Koin API：

* `get()` - 从 Koin 容器中获取实例
* `getKoin()` - 获取当前 Koin 实例

对于声明 'MyService' 组件的模块：

```kotlin
val androidModule = module {

    single { MyService() }
}
```

我们可以这样获取你的实例：

```kotlin
@Composable
fun App() {
    val myService = get<MyService>()
}
```

:::note
为了与 Jetpack Compose 的函数式特性保持一致，最好的编写方式是将实例直接注入到函数属性中。 这样既可以使用 Koin 实现默认实现，又可以保持以你想要的方式注入实例的开放性。
:::

```kotlin
@Composable
fun App(myService: MyService = get()) {
}
```

## @Composable 的 ViewModel

与访问经典 single/factory 实例的方式相同，你可以访问以下 Koin ViewModel API：

* `getViewModel()` or `koinViewModel()` - 获取实例

对于声明 'MyViewModel' 组件的模块：

```kotlin
module {
    viewModel { MyViewModel() }
    // or constructor DSL
    viewModelOf(::MyViewModel)
}
```

我们可以这样获取你的实例：

```kotlin
@Composable
fun App() {
    val vm = koinViewModel<MyViewModel>()
}
```

我们可以在函数参数中获取你的实例：

```kotlin
@Composable
fun App(vm : MyViewModel = koinViewModel()) {

}
```

:::warning
Jetpack Compose 1.1+ 的更新不支持 Lazy API
:::