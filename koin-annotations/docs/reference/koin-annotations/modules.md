---
title: "使用 @Module 的模块"
---
在使用定义时，你可能需要将它们组织到模块中，或者不组织。你甚至可以完全不使用任何模块，而是使用生成的“默认”模块。

## 无模块 - 使用生成的默认模块

如果你不想指定任何模块，Koin 提供了一个默认模块来托管你所有的定义。`defaultModule` 可以直接使用：

```kotlin
// 使用 Koin 生成
import org.koin.ksp.generated.*

fun main() {
    startKoin {
        defaultModule()
    }
}

// 或者

fun main() {
    startKoin {
        modules(
          defaultModule
        )
    }
}
```

:::info
  别忘了使用 `org.koin.ksp.generated.*` 引入
:::

## 使用 @Module 的类模块

要声明一个模块，只需使用 `@Module` 注解标记一个类：

```kotlin
@Module
class MyModule
```

要在 Koin 中加载你的模块，只需使用为任何 `@Module` 类生成的 `.module` 扩展。只需创建你的模块 `MyModule().module` 的新实例：

```kotlin
// 使用 Koin 生成
import org.koin.ksp.generated.*

fun main() {
    startKoin {
        modules(
          MyModule().module
        )
    }
}
```

> 别忘了使用 `org.koin.ksp.generated.*` 引入

## 使用 @ComponentScan 的组件扫描

要扫描并将注解组件收集到一个模块中，只需在模块上使用 `@ComponentScan` 注解：

```kotlin
@Module
@ComponentScan
class MyModule
```

这将扫描当前包和子包以查找注解组件。你可以指定扫描给定的包 `@ComponentScan("com.my.package")`

:::info
  当使用 `@ComponentScan` 注解时，KSP 会遍历所有 Gradle 模块以查找相同的包。(自 1.4 起)
:::

## 类模块中的定义

要在你的类中直接定义定义，你可以使用定义注解来注解一个函数：

```kotlin
// 给定
// class MyComponent(val myDependency : MyDependency)

@Module
class MyModule {

  @Single
  fun myComponent(myDependency : MyDependency) = MyComponent(myDependency)
}
```

> @InjectedParam, @Property 也可以在函数成员上使用

## 包含模块

要将其他类模块包含到你的模块中，只需使用 `@Module` 注解的 `includes` 属性：

```kotlin
@Module
class ModuleA

@Module(includes = [ModuleA::class])
class ModuleB
```

这样你就可以只运行你的根模块：

```kotlin
// 使用 Koin 生成
import org.koin.ksp.generated.*

fun main() {
    startKoin {
        modules(
          // 将加载 ModuleB & ModuleA
          ModuleB().module
        )
    }
}
```