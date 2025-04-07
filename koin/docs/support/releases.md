---
title: "发布 & API 兼容性指南"
custom_edit_url: null
---
:::info
本页面提供了每个 Koin 主要版本的全面概述，详细说明了我们框架的演变，以帮助您规划升级并保持兼容性。
:::

对于每个版本，文档都分为以下几个部分：

- `Kotlin`：指定了该版本使用的 Kotlin 版本，确保语言兼容性的清晰，并使您能够利用最新的 Kotlin 功能。
- `New`：重点介绍了新引入的功能和改进，这些功能和改进增强了功能和开发者体验。
- `Experimental`：列出了标记为实验性的 API 和功能。 这些功能正在积极开发中，并会根据社区的反馈进行更改。
- `Deprecated`：标识已标记为弃用的 API 和功能，以及有关推荐替代方案的指南，帮助您为未来的删除做好准备。
- `Breaking`：详细说明了可能破坏向后兼容性的任何更改，确保您了解迁移期间的必要调整。

这种结构化的方法不仅阐明了每个版本中的增量更改，而且还加强了我们对 Koin 项目中透明度、稳定性和持续改进的承诺。

## 4.0.3

:::note
使用 Kotlin `2.0.21`
:::

所有使用的库版本都位于 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/main/projects/gradle/libs.versions.toml)

### New 🎉

`koin-core`
- `KoinPlatformTools.generateId()` - 借助这个新版本的 Kotlin，我们可以从新的 `kotlin.uuid.uuid` API 中受益。 `KoinPlatformTools.generateId()` Koin 函数现在使用这个新的 API 在各个平台上生成真正的 UUID。

`koin-viewmodel`
 - Koin 4.0 引入了新的 ViewModel DSL 和 API，它们相互关联 Google/Jetbrains KMP API。 为了避免在代码库中重复，ViewModel API 现在位于 `koin-core-viewmodel` 和 `koin-core-viewmodel-navigation` 项目中。
 - ViewModel DSL 的导入是 `org.koin.core.module.dsl.*`

以下 API 在给定的项目中现在是稳定的。

`koin-core-coroutines` - 所有 API 现在都是稳定的
  - 所有 `lazyModules`
  - `awaitAllStartJobs`，`onKoinStarted`，`isAllStartedJobsDone`
  - `waitAllStartJobs`，`runOnKoinStarted`
  - `KoinApplication.coroutinesEngine`
  - `Module.includes(lazy)`
  - `lazyModule()`
  - `KoinPlatformCoroutinesTools`

### Experimental 🚧

`koin-test`
- `ParameterTypeInjection` - 新的 API，用于帮助设计 `Verify` API 的动态参数注入

`koin-androidx-startup`
- `koin-androidx-startup` - 使用 `androidx.startup.Initializer` API 使用 `AndroidX Startup` 启动 Koin 的新功能。 `koin-androidx-startup` 中的所有 API 都是 Experimental

`koin-compose`
- `rememberKoinModules` - 加载/卸载给定 `@Composable` 组件的 Koin 模块
- `rememberKoinScope` - 加载/卸载给定 `@Composable` 组件的 Koin Scope
- `KoinScope` - 为所有底层 Composable 子项加载 Koin scope

### Deprecation ⚠️

以下 API 已被弃用，不应再使用：

- `koin-test`
  - 所有用于 `checkModules` 的 API。 迁移到 `Verify` API。

- `koin-android`
  - ViewModel DSL，有利于 koin-core 中的新集中式 DSL

- `koin-compose-viewmodel`
  - ViewModel DSL，有利于 koin-core 中的新集中式 DSL
  - 函数 `koinNavViewModel` 现已弃用，有利于 `koinViewModel`

### Breaking 💥

以下 API 已被删除，原因是上一个里程碑中的弃用：

:::note
所有使用 `@KoinReflectAPI` 注释的 API 已被删除
:::

`koin-core`
  - `ApplicationAlreadyStartedException` 已重命名为 `KoinApplicationAlreadyStartedException`
  - `KoinScopeComponent.closeScope()` 已删除，因为内部不再使用
  - 移动了内部 `ResolutionContext` 以替换 `InstanceContext`
  - `KoinPlatformTimeTools`，`Timer`，`measureDuration` 已删除，以改用 Kotlin Time API
  - `KoinContextHandler` 已删除，有利于 `GlobalContext`

`koin-android`
  - 所有状态 ViewModel API 在错误级别都已弃用：
    - `stateViewModel()`,`getStateViewModel()`，请改用 `viewModel()`
    - `getSharedStateViewModel()`，`sharedStateViewModel()`，对于共享实例，请改用 `viewModel()` 或 `activityViewModel()`
  - 函数 `fun Fragment.createScope()` 已删除
  - ViewModel 工厂的所有 API（主要在内部）都已为新的内部结构重新设计

`koin-compose`
  - 旧的 compose API 函数在错误级别都已弃用：
    - 函数 `inject()` 已被删除，有利于 `koinInject()`
    - 函数 `getViewModel()` 已被删除，有利于 `koinViewModel()`
    - 函数 `rememberKoinInject()` 已移至 `koinInject()`
  - 删除了 `StableParametersDefinition`，因为内部不再使用
  - 删除了所有 Lazy ViewModel API - 旧的 `viewModel()`
  - 删除了 `rememberStableParametersDefinition()`，因为内部不再使用

## 3.5.6

:::note
使用 Kotlin `1.9.22`
:::

所有使用的库版本都位于 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml)

### New 🎉

`koin-core`
  - `KoinContext` 现在具有以下功能：
    - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
    - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
  - `koinApplication()` 函数现在使用多种格式：
    - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
    - `koinApplication(appDeclaration: KoinAppDeclaration?)`
    - `koinApplication(createEagerInstances: Boolean)`
  - `KoinAppDeclaration` 用于帮助打开声明样式
  - `KoinPlatformTimeTools` 用于为 JS 使用 API Time
  - iOS - `synchronized` API 用于使用 Touchlab Lockable API

`koin-androidx-compose`
  - 新的 `KoinAndroidContext` 用于从 Android 环境绑定到当前 Koin 上下文

`koin-compose`
  - 新的 `KoinContext` 上下文启动器，带有当前默认上下文

`koin-ktor`
  - 现在为 Ktor 实例使用隔离的上下文（使用 `Application.getKoin()` 而不是默认上下文）
  - Koin 插件引入了新的监控
  - `RequestScope` 允许将 scope 实例绑定到 Ktor 请求

### Experimental 🚧

`koin-android`
  - `ViewModelScope` 引入了用于 ViewModel scope 的实验性 API

`koin-core-coroutines` - 引入了在后台加载模块的新 API

### Deprecation ⚠️

`koin-android`
  - `getLazyViewModelForClass()` API 非常复杂，并且调用默认的全局上下文。 最好坚持使用 Android/Fragment API
  - `resolveViewModelCompat()` 已弃用，有利于 `resolveViewModel()`

`koin-compose`
  - 函数 `get()` 和 `inject()` 已弃用，有利于 `koinInject()`
  - 函数 `getViewModel()` 已弃用，有利于 `koinViewModel()`
  - 函数 `rememberKoinInject()` 已弃用，有利于 `koinInject()`

### Breaking 💥

`koin-core`
  - `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances : Boolean = false)` 正在替换 `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)`
  - 将属性 `KoinExtension.koin` 移动到函数 `KoinExtension.onRegister()`
  - iOS - `internal fun globalContextByMemoryModel(): KoinContext` 使用 `MutableGlobalContext`

`koin-compose`
  - 函数 `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)` 已删除，有利于 `KoinContext` 和 `KoinAndroidContext`

## 3.4.3

:::note
使用 Kotlin `1.8.21`
:::

### New 🎉

`koin-core`
  - 新的 ExtensionManager API 用于帮助编写 Koin 的扩展引擎 - `ExtensionManager` + `KoinExtension`
  - 参数 API 更新，带有 `parameterArrayOf` 和 `parameterSetOf`

`koin-test`
  - `Verification` API - 帮助在模块上运行 `verify`。

`koin-android`
  - ViewModel 注入的内部结构
  - 添加 `AndroidScopeComponent.onCloseScope()` 函数回调

`koin-android-test`
  - `Verification` API - 帮助在模块上运行 `androidVerify()`。

`koin-androidx-compose`
  - 新的 `get()`
  - 新的 `getViewModel()`
  - 新的 Scopes `KoinActivityScope`，`KoinFragmentScope`

`koin-androidx-compose-navigation` - 导航的新模块
  - 新的 `koinNavViewModel()`

`koin-compose` - Compose 的新多平台 API
  - `koinInject`，`rememberKoinInject`
  - `KoinApplication`

### Experimental 🚧

`koin-compose` - Compose 的新 Experimental 多平台 API
  - `rememberKoinModules`
  - `KoinScope`，`rememberKoinScope`

### Deprecation ⚠️

`koin-compose`
- 函数 `get()` 替换 `inject()` 用法，避免使用 Lazy 函数
- 函数 `getViewModel()` 替换 `viewModel()` 函数，避免使用 Lazy 函数

### Breaking 💥

`koin-android`
  - `LifecycleScopeDelegate` 现在已删除

`koin-androidx-compose`
  - 已删除 `getStateViewModel`，有利于 `koinViewModel`