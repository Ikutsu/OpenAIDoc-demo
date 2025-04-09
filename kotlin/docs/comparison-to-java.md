---
title: "与 Java 的比较"
---
## Kotlin 中解决的一些 Java 问题

Kotlin 修复了 Java 存在的一系列问题：

* 空引用由[类型系统控制](null-safety.md)。
* [没有原始类型](java-interop.md#java-generics-in-kotlin)
* Kotlin 中的数组是[不变的](arrays.md)
* Kotlin 具有合适的[函数类型](lambdas.md#function-types)，而不是 Java 的 SAM 转换
* 没有通配符的 [使用点变型](generics.md#use-site-variance-type-projections)
* Kotlin 没有受检[异常](exceptions.md)
* [用于只读和可变集合的独立接口](collections-overview.md)

## Java 有而 Kotlin 没有的

* [受检异常](exceptions.md)
* 不是类的[基本类型](basic-types.md)。 字节码尽可能使用基本类型，但它们不是显式可用的。
* [静态成员](classes.md)被[伴生对象](object-declarations.md#companion-objects)、[顶层函数](functions.md)、[扩展函数](extensions.md#extension-functions)或 [@JvmStatic](java-to-kotlin-interop.md#static-methods) 替代。
* [通配符类型](generics.md)被[声明点变型](generics.md#declaration-site-variance)和[类型投影](generics.md#type-projections)替代。
* [三元运算符 `a ? b : c`](control-flow.md#if-expression) 被 [if 表达式](control-flow.md#if-expression) 替代。
* [Records](https://openjdk.org/jeps/395)
* [Pattern Matching](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)
* package-private [可见性修饰符](visibility-modifiers.md)

## Kotlin 有而 Java 没有的

* [Lambda 表达式](lambdas.md) + [内联函数](inline-functions.md) = 高效的自定义控制结构
* [扩展函数](extensions.md)
* [空安全](null-safety.md)
* [智能类型转换](typecasts.md) (**Java 16**: [Pattern Matching for instanceof](https://openjdk.org/jeps/394))
* [字符串模板](strings.md) (**Java 21**: [String Templates (Preview)](https://openjdk.org/jeps/430))
* [属性](properties.md)
* [主构造函数](classes.md)
* [头等委托](delegation.md)
* [变量和属性类型的类型推断](basic-types.md) (**Java 10**: [Local-Variable Type Inference](https://openjdk.org/jeps/286))
* [单例](object-declarations.md)
* [声明点变型 & 类型投影](generics.md)
* [区间表达式](ranges.md)
* [运算符重载](operator-overloading.md)
* [伴生对象](classes.md#companion-objects)
* [数据类](data-classes.md)
* [协程](coroutines-overview.md)
* [顶层函数](functions.md)
* [默认参数](functions.md#default-arguments)
* [命名参数](functions.md#named-arguments)
* [中缀函数](functions.md#infix-notation)
* [Expect 和 actual 声明](multiplatform-expect-actual.md)
* [显式 API 模式](whatsnew14.md#explicit-api-mode-for-library-authors) 和 [更好地控制 API 表面](opt-in-requirements.md)

## 接下来做什么？

学习如何：
* 使用 [Java 和 Kotlin 执行字符串的典型任务](java-to-kotlin-idioms-strings.md)。
* 使用 [Java 和 Kotlin 执行集合的典型任务](java-to-kotlin-collections-guide.md)。
* [处理 Java 和 Kotlin 中的可空性](java-to-kotlin-nullability-guide.md)。