---
title: Type aliases
---


Type aliases provide alternative names for existing types.
If the type name is too long you can introduce a different shorter name and use the new one instead.
 
It's useful to shorten long generic types.
For instance, it's often tempting to shrink collection types:

```kotlin
typealias NodeSet = Set&lt;Network.Node&gt;

typealias FileTable&lt;K&gt; = MutableMap&lt;K, MutableList&lt;File&gt;&gt;
```

You can provide different aliases for function types:

```kotlin
typealias MyHandler = (Int, String, Any) `→` Unit

typealias Predicate&lt;T&gt; = (T) `→` Boolean
```

You can have new names for inner and nested classes:

```kotlin
class A {
    inner class Inner
}
class B {
    inner class Inner
}

typealias AInner = A.Inner
typealias BInner = B.Inner
```

Type aliases do not introduce new types. 
They are equivalent to the corresponding underlying types.
When you add `typealias Predicate<T>` and use `Predicate<Int>` in your code, the Kotlin compiler always expands it to `(Int) `→` Boolean`. 
Thus you can pass a variable of your type whenever a general function type is required and vice versa:

```kotlin
typealias Predicate&lt;T&gt; = (T) `→` Boolean

fun foo(p: Predicate&lt;Int&gt;) = p(42)

fun main() {
    val f: (Int) `→` Boolean = { it &gt; 0 }
    println(foo(f)) // prints "true"

    val p: Predicate&lt;Int&gt; = { it &gt; 0 }
    println(listOf(1, -2).filter(p)) // prints "[1]"
}
```


