---
title: Releases & API Compatibility Guide
custom_edit_url: null
---
```markdown
:::info
本页全面概述了 Koin 的每个主要版本，详细介绍了我们框架的演变，以帮助您规划升级并保持兼容性。
:::

对于每个版本，文档都分为以下几个部分：

- `Kotlin`: 指定用于此版本的 Kotlin 版本，确保语言兼容性的清晰，并使您能够利用最新的 Kotlin 功能。
- `New`：突出显示了新引入的功能和改进，这些功能和改进增强了功能和开发者体验。
- `Experimental`: 列出了标记为实验性的 API 和功能。这些正在积极开发中，并且会根据社区的反馈进行更改。
- `Deprecated`: 标识已标记为弃用的 API 和功能，以及有关推荐替代方案的指南，帮助您为将来的删除做准备。
- `Breaking`: 详细说明了可能破坏向后兼容性的任何更改，确保您了解迁移期间的必要调整。

这种结构化的方法不仅阐明了每个版本中的增量变化，而且还加强了我们对 Koin 项目的透明度、稳定性和持续改进的承诺。

## 4.0.3

:::note
使用 Kotlin `2.0.21`
:::

所有使用的库版本都位于 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/main/projects/gradle/libs.versions.toml) 中

### New 🎉

`koin-core`
- `KoinPlatformTools.generateId()` - 借助这个新版本的 Kotlin，我们可以从新的 `kotlin.uuid.uuid` API 中受益。`KoinPlatformTools.generateId()` Koin 函数现在使用这个新的 API 来生成跨平台的真实 UUID。

`koin-viewmodel`
 - Koin 4.0 引入了新的 ViewModel DSL 和 API，它们相互使用了 Google/Jetbrains KMP API。为了避免在代码库中重复，ViewModel API 现在位于 `koin-core-viewmodel` 和 `koin-core-viewmodel-navigation` 项目中。
 - ViewModel DSL 的导入是 `org.koin.core.module.dsl.*`

以下给定项目中的 API 现在是稳定的。

`koin-core-coroutines` - 所有 API 现在都是稳定的
  - 所有 `lazyModules`
  - `awaitAllStartJobs`, `onKoinStarted`, `isAllStartedJobsDone`
  - `waitAllStartJobs`, `runOnKoinStarted`
  - `KoinApplication.coroutinesEngine`
  - `Module.includes(lazy)`
  - `lazyModule()`
  - `KoinPlatformCoroutinesTools`

### Experimental 🚧

`koin-test`
- `ParameterTypeInjection` - 新的 API，用于帮助设计 `Verify` API 的动态参数注入

`koin-androidx-startup`
- `koin-androidx-startup` - 使用 `androidx.startup.Initializer` API，可以使用 `AndroidX Startup` 启动 Koin 的新功能。`koin-androidx-startup` 中的所有 API 都是实验性的

`koin-compose`
- `rememberKoinModules` - 加载/卸载给定 @Composable 组件的 Koin 模块
- `rememberKoinScope` - 加载/卸载给定 @Composable 组件的 Koin Scope（作用域）
- `KoinScope` - 为所有底层 Composable 子组件加载 Koin scope（作用域）

### Deprecation ⚠️

以下 API 已被弃用，不应再使用：

- `koin-test`
  - `checkModules` 的所有 API。迁移到 `Verify` API。

- `koin-android`
  - ViewModel DSL，支持 koin-core 中新的集中式 DSL

- `koin-compose-viewmodel`
  - ViewModel DSL，支持 koin-core 中新的集中式 DSL
  - 函数 `koinNavViewModel` 现已弃用，推荐使用 `koinViewModel`

### Breaking 💥

由于上次里程碑中的弃用，以下 API 已被删除：

:::note
所有使用 `@KoinReflectAPI` 注释的 API 都已删除
:::

`koin-core`
  - `ApplicationAlreadyStartedException` 已重命名为 `KoinApplicationAlreadyStartedException`
  - 删除了 `KoinScopeComponent.closeScope()`，因为不再在内部使用
  - 移动了内部 `ResolutionContext` 以替换 `InstanceContext`
  - 删除了 `KoinPlatformTimeTools`、`Timer`、`measureDuration`，以使用 Kotlin Time API 代替
  - 删除了 `KoinContextHandler`，推荐使用 `GlobalContext`

`koin-android`
  - 所有状态 ViewModel API 都在错误级别被弃用：
    - `stateViewModel()`,`getStateViewModel()`，请改用 `viewModel()`
    - `getSharedStateViewModel()`, `sharedStateViewModel()`，对于共享实例，请改用 `viewModel()` 或 `activityViewModel()`
  - 删除了函数 `fun Fragment.createScope()`
  - ViewModel 工厂（主要是内部工厂）的所有 API 都已针对新的内部结构进行了重新设计

`koin-compose`
  - 旧的 compose API 函数在错误级别被弃用：
    - 函数 `inject()` 已被删除，推荐使用 `koinInject()`
    - 函数 `getViewModel()` 已被删除，推荐使用 `koinViewModel()`
    - 函数 `rememberKoinInject()` 已移至 `koinInject()`
  - 删除了 `StableParametersDefinition`，因为不再在内部使用
  - 删除了所有 Lazy ViewModel API - 旧的 `viewModel()`
  - 删除了 `rememberStableParametersDefinition()`，因为不再在内部使用

## 3.5.6

:::note
使用 Kotlin `1.9.22`
:::

所有使用的库版本都位于 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml) 中

### New 🎉

`koin-core`
  - `KoinContext` 现在具有以下内容：
    - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
    - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
  - `koinApplication()` 函数现在使用多种格式：
    - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
    - `koinApplication(appDeclaration: KoinAppDeclaration?)`
    - `koinApplication(createEagerInstances: Boolean)`
  - `KoinAppDeclaration` 以帮助打开声明样式
  - `KoinPlatformTimeTools` 用于为 JS 使用 API Time
  - iOS - `synchronized` API 使用 Touchlab Lockable API

`koin-androidx-compose`
  - 新的 `KoinAndroidContext` 以从 Android 环境绑定到当前的 Koin context（上下文）

`koin-compose`
  - 新的 `KoinContext` context（上下文）启动器，带有当前的默认 context（上下文）

`koin-ktor`
  - 现在为 Ktor 实例使用隔离的 context（上下文）（使用 `Application.getKoin()` 而不是默认 context（上下文））
  - Koin 插件引入了新的监控
  - `RequestScope` 允许 scope（作用域）实例用于 Ktor 请求

### Experimental 🚧

`koin-android`
  - `ViewModelScope` 引入了 ViewModel scope（作用域）的实验性 API

`koin-core-coroutines` - 引入了在后台加载模块的新 API

### Deprecation ⚠️

`koin-android`
  - `getLazyViewModelForClass()` API 非常复杂，并且调用默认的全局 context（上下文）。最好坚持使用 Android/Fragment API
  - `resolveViewModelCompat()` 已弃用，推荐使用 `resolveViewModel()`

`koin-compose`
  - 函数 `get()` 和 `inject()` 已弃用，推荐使用 `koinInject()`
  - 函数 `getViewModel()` 已弃用，推荐使用 `koinViewModel()`
  - 函数 `rememberKoinInject()` 已弃用，推荐使用 `koinInject()`

### Breaking 💥

`koin-core`
  - `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances : Boolean = false)` 正在替换 `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)`
  - 将属性 `KoinExtension.koin` 移动到函数 `KoinExtension.onRegister()`
  - iOS - `internal fun globalContextByMemoryModel(): KoinContext` 使用 `MutableGlobalContext`

`koin-compose`
  - 函数 `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)` 已删除，推荐使用 `KoinContext` 和 `KoinAndroidContext`

## 3.4.3

:::note
使用 Kotlin `1.8.21`
:::

### New 🎉

`koin-core`
  - 新的 ExtensionManager API 可帮助为 Koin 编写扩展引擎 - `ExtensionManager` + `KoinExtension`
  - 使用 `parameterArrayOf` 和 `parameterSetOf` 更新 Parameters API

`koin-test`
  - `Verification` API - 帮助在 Module（模块）上运行 `verify`。

`koin-android`
  - ViewModel 注入的内部结构
  - 添加 `AndroidScopeComponent.onCloseScope()` 函数回调

`koin-android-test`
  - `Verification` API - 帮助在 Module（模块）上运行 `androidVerify()`。

`koin-androidx-compose`
  - 新的 `get()`
  - 新的 `getViewModel()`
  - 新的 Scopes（作用域） `KoinActivityScope`, `KoinFragmentScope`

`koin-androidx-compose-navigation` - 导航的新模块
  - 新的 `koinNavViewModel()`

`koin-compose` - Compose 的新 Multiplatform API
  - `koinInject`, `rememberKoinInject`
  - `KoinApplication`

### Experimental 🚧

`koin-compose` - Compose 的新 Experimental Multiplatform API
  - `rememberKoinModules`
  - `KoinScope`, `rememberKoinScope`

### Deprecation ⚠️

`koin-compose`
- 函数 `get()` 用于替换 `inject()` 用法，避免使用 Lazy 函数
- 函数 `getViewModel()` 用于替换 `viewModel()` 函数，避免使用 Lazy 函数

### Breaking 💥

`koin-android`
  - `LifecycleScopeDelegate` 现已删除

`koin-androidx-compose`
  - 删除了 `getStateViewModel`，推荐使用 `koinViewModel`
