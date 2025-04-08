---
title: Using builders with builder type inference
---


Kotlin supports _builder type inference_ (or builder inference), which can come in useful when you are working with 
generic builders. It helps the compiler infer the type arguments of a builder call based on the type information
about other calls inside its lambda argument.

Consider this example of [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html)
usage:

```kotlin
fun addEntryToMap(baseMap: Map&lt;String, Number&gt;, additionalEntry: Pair&lt;String, Int&gt;?) {
   val myMap = buildMap {
       putAll(baseMap)
       if (additionalEntry != null) {
           put(additionalEntry.first, additionalEntry.second)
       }
   }
}
```

There is not enough type information here to infer type arguments in a regular way, but builder inference can
analyze the calls inside the lambda argument. Based on the type information about `putAll()` and `put()` calls,
the compiler can automatically infer type arguments of the `buildMap()` call into `String` and `Number`. 
Builder inference allows to omit type arguments while using generic builders.

## Writing your own builders

### Requirements for enabling builder inference

:::tip
Before Kotlin 1.7.0, enabling builder inference for a builder function required `-Xenable-builder-inference` compiler option. 
In 1.7.0 the option is enabled by default.

:::


To let builder inference work for your own builder, make sure its declaration has a builder lambda parameter of a
function type with a receiver. There are also two requirements for the receiver type:

1. It should use the type arguments that builder inference is supposed to infer. For example:
   ```kotlin
   fun &lt;V&gt; buildList(builder: MutableList&lt;V&gt;.() `→` Unit) { ... }
   ```
   
:::tip
    Note that passing the type parameter's type directly like `fun <T> myBuilder(builder: T.() `→` Unit)` is not yet supported.

:::
   

2. It should provide public members or extensions that contain the corresponding type parameters in their signature. 
   For example:
   ```kotlin
   class ItemHolder&lt;T&gt; {
       private val items = mutableListOf&lt;T&gt;()

       fun addItem(x: T) {
           items.add(x)
       }

       fun getLastItem(): T? = items.lastOrNull()
   }
   
   fun &lt;T&gt; ItemHolder&lt;T&gt;.addAllItems(xs: List&lt;T&gt;) {
       xs.forEach { addItem(it) }
   }

   fun &lt;T&gt; itemHolderBuilder(builder: ItemHolder&lt;T&gt;.() `→` Unit): ItemHolder&lt;T&gt; = 
       ItemHolder&lt;T&gt;().apply(builder)

   fun test(s: String) {
       val itemHolder1 = itemHolderBuilder { // Type of itemHolder1 is ItemHolder&lt;String&gt;
           addItem(s)
       }
       val itemHolder2 = itemHolderBuilder { // Type of itemHolder2 is ItemHolder&lt;String&gt;
           addAllItems(listOf(s)) 
       }
       val itemHolder3 = itemHolderBuilder { // Type of itemHolder3 is ItemHolder&lt;String?&gt;
           val lastItem: String? = getLastItem()
           // ...
       }
   }
   ```

### Supported features

Builder inference supports: 
* Inferring several type arguments
  ```kotlin
  fun &lt;K, V&gt; myBuilder(builder: MutableMap&lt;K, V&gt;.() `→` Unit): Map&lt;K, V&gt; { ... }
  ```
* Inferring type arguments of several builder lambdas within one call including interdependent ones
  ```kotlin
  fun &lt;K, V&gt; myBuilder(
      listBuilder: MutableList&lt;V&gt;.() `→` Unit,
      mapBuilder: MutableMap&lt;K, V&gt;.() `→` Unit
  ): Pair&lt;List&lt;V&gt;, Map&lt;K, V&gt;&gt; =
      mutableListOf&lt;V&gt;().apply(listBuilder) to mutableMapOf&lt;K, V&gt;().apply(mapBuilder)
  
  fun main() {
      val result = myBuilder(
          { add(1) },
          { put("key", 2) }
      )
      // result has Pair&lt;List&lt;Int&gt;, Map&lt;String, Int&gt;&gt; type
  }
  ```
* Inferring type arguments whose type parameters are lambda's parameter or return types
  ```kotlin
  fun &lt;K, V&gt; myBuilder1(
      mapBuilder: MutableMap&lt;K, V&gt;.() `→` K
  ): Map&lt;K, V&gt; = mutableMapOf&lt;K, V&gt;().apply { mapBuilder() }
  
  fun &lt;K, V&gt; myBuilder2(
      mapBuilder: MutableMap&lt;K, V&gt;.(K) `→` Unit
  ): Map&lt;K, V&gt; = mutableMapOf&lt;K, V&gt;().apply { mapBuilder(2 as K) }
  
  fun main() {
      // result1 has the Map&lt;Long, String&gt; type inferred
      val result1 = myBuilder1 {
          put(1L, "value")
          2
      }
      val result2 = myBuilder2 {
          put(1, "value 1")
          // You can use `it` as "postponed type variable" type
          // See the details in the section below
          put(it, "value 2")
      }
  }
  ```

## How builder inference works

### Postponed type variables

Builder inference works in terms of _postponed type variables_, which appear inside the builder lambda during builder
inference analysis. A postponed type variable is a type argument's type, which is in the process of inferring.
The compiler uses it to collect type information about the type argument.

Consider the example with [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html):

```kotlin
val result = buildList {
    val x = get(0)
}
```

Here `x` has a type of postponed type variable: the `get()` call returns a value of type `E`, but `E` itself is not yet
fixed. At this moment, a concrete type for `E` is unknown.

When a value of a postponed type variable gets associated with a concrete type, builder inference collects this information
to infer the resulting type of the corresponding type argument at the end of the builder inference analysis. For example:

```kotlin
val result = buildList {
    val x = get(0)
    val y: String = x
} // result has the List&lt;String&gt; type inferred
```

After the postponed type variable gets assigned to a variable of the `String` type, builder inference gets the information
that `x` is a subtype of `String`. This assignment is the last statement in the builder lambda, so the builder inference
analysis ends with the result of inferring the type argument `E` into `String`.

Note that you can always call `equals()`, `hashCode()`, and `toString()` functions with a postponed type variable as a
receiver.

### Contributing to builder inference results

Builder inference can collect different varieties of type information that contribute to the analysis result.
It considers:
* Calling methods on a lambda's receiver that use the type parameter's type
  ```kotlin
  val result = buildList {
      // Type argument is inferred into String based on the passed "value" argument
      add("value")
  } // result has the List&lt;String&gt; type inferred
  ```
* Specifying the expected type for calls that return the type parameter's type
  ```kotlin
  val result = buildList {
      // Type argument is inferred into Float based on the expected type
      val x: Float = get(0)
  } // result has the List&lt;Float&gt; type
  ```
  ```kotlin
  class Foo&lt;T&gt; {
      val items = mutableListOf&lt;T&gt;()
  }

  fun &lt;K&gt; myBuilder(builder: Foo&lt;K&gt;.() `→` Unit): Foo&lt;K&gt; = Foo&lt;K&gt;().apply(builder)

  fun main() {
      val result = myBuilder {
          val x: List&lt;CharSequence&gt; = items
          // ...
      } // result has the Foo&lt;CharSequence&gt; type
  }
  ```
* Passing postponed type variables' types into methods that expect concrete types
  ```kotlin
  fun takeMyLong(x: Long) { ... }

  fun String.isMoreThat3() = length &gt; 3

  fun takeListOfStrings(x: List&lt;String&gt;) { ... }

  fun main() {
      val result1 = buildList {
          val x = get(0)
          takeMyLong(x)
      } // result1 has the List&lt;Long&gt; type

      val result2 = buildList {
          val x = get(0)
          val isLong = x.isMoreThat3()
      // ...
      } // result2 has the List&lt;String&gt; type
  
      val result3 = buildList {
          takeListOfStrings(this)
      } // result3 has the List&lt;String&gt; type
  }
  ```
* Taking a callable reference to the lambda receiver's member
  ```kotlin
  fun main() {
      val result = buildList {
          val x: KFunction1&lt;Int, Float&gt; = ::get
      } // result has the List&lt;Float&gt; type
  }
  ```
  ```kotlin
  fun takeFunction(x: KFunction1&lt;Int, Float&gt;) { ... }

  fun main() {
      val result = buildList {
          takeFunction(::get)
      } // result has the List&lt;Float&gt; type
  }
  ```

At the end of the analysis, builder inference considers all collected type information and tries to merge it into 
the resulting type. See the example.

```kotlin
val result = buildList { // Inferring postponed type variable E
    // Considering E is Number or a subtype of Number
    val n: Number? = getOrNull(0)
    // Considering E is Int or a supertype of Int
    add(1)
    // E gets inferred into Int
} // result has the List&lt;Int&gt; type
```

The resulting type is the most specific type that corresponds to the type information collected during the analysis.
If the given type information is contradictory and cannot be merged, the compiler reports an error.

Note that the Kotlin compiler uses builder inference only if regular type inference cannot infer a type argument.
This means you can contribute type information outside a builder lambda, and then builder inference analysis is not
required. Consider the example:

```kotlin
fun someMap() = mutableMapOf&lt;CharSequence, String&gt;()

fun &lt;E&gt; MutableMap&lt;E, String&gt;.f(x: MutableMap&lt;E, String&gt;) { ... }

fun main() {
    val x: Map&lt;in String, String&gt; = buildMap {
        put("", "")
        f(someMap()) // Type mismatch (required String, found CharSequence)
    }
}
```

Here a type mismatch appears because the expected type of the map is specified outside the builder lambda. 
The compiler analyzes all the statements inside with the fixed receiver type `Map<in String, String>`.