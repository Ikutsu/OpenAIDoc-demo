---
title: Basic syntax
---


This is a collection of basic syntax elements with examples. At the end of every section, you'll find a link to
a detailed description of the related topic.

You can also learn all the Kotlin essentials with the free [Kotlin Core track](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)
by JetBrains Academy.

## Package definition and imports

Package specification should be at the top of the source file:

```kotlin
package my.demo

import kotlin.text.*

// ...
```

It is not required to match directories and packages: source files can be placed arbitrarily in the file system.

See [Packages](packages.md).

## Program entry point

An entry point of a Kotlin application is the `main` function:

```kotlin
fun main() {
    println("Hello world!")
}
```


Another form of `main` accepts a variable number of `String` arguments: 

```kotlin
fun main(args: Array&lt;String&gt;) {
    println(args.contentToString())
}
```


## Print to the standard output

`print` prints its argument to the standard output:

```kotlin
fun main() {

    print("Hello ")
    print("world!")

}
```


`println` prints its arguments and adds a line break, so that the next thing you print appears on the next line:

```kotlin
fun main() {

    println("Hello world!")
    println(42)

}
```


## Read from the standard input

The `readln()` function reads from the standard input. This function reads the entire line the user enters as a string.

You can use the `println()`, `readln()`, and `print()` functions together to print messages requesting 
and showing user input:

```kotlin
// Prints a message to request input
println("Enter any word: ")

// Reads and stores the user input. For example: Happiness
val yourWord = readln()

// Prints a message with the input
print("You entered the word: ")
print(yourWord)
// You entered the word: Happiness
```

For more information, see [Read standard input](read-standard-input.md).

## Functions

A function with two `Int` parameters and `Int` return type:

```kotlin

fun sum(a: Int, b: Int): Int {
    return a + b
}

fun main() {
    print("sum of 3 and 5 is ")
    println(sum(3, 5))
}
```


A function body can be an expression. Its return type is inferred:

```kotlin

fun sum(a: Int, b: Int) = a + b

fun main() {
    println("sum of 19 and 23 is ${sum(19, 23)}")
}
```


A function that returns no meaningful value:

```kotlin

fun printSum(a: Int, b: Int): Unit {
    println("sum of $a and $b is ${a + b}")
}

fun main() {
    printSum(-1, 8)
}
```


`Unit` return type can be omitted:

```kotlin

fun printSum(a: Int, b: Int) {
    println("sum of $a and $b is ${a + b}")
}

fun main() {
    printSum(-1, 8)
}
```


See [Functions](functions.md).

## Variables

In Kotlin, you declare a variable starting with a keyword, `val` or `var`, followed by the name of the variable.

Use the `val` keyword to declare variables that are assigned a value only once. These are immutable, read-only local variables that can’t be reassigned a different value
after initialization: 

```kotlin
fun main() {

    // Declares the variable x and initializes it with the value of 5
    val x: Int = 5
    // 5

    println(x)
}
```


Use the `var` keyword to declare variables that can be reassigned. These are mutable variables, and you can change their values after initialization:

```kotlin
fun main() {

    // Declares the variable x and initializes it with the value of 5
    var x: Int = 5
    // Reassigns a new value of 6 to the variable x
    x += 1
    // 6

    println(x)
}
```


Kotlin supports type inference and automatically identifies the data type of a declared variable. When declaring a variable, you can omit the type after the variable name:

```kotlin
fun main() {

    // Declares the variable x with the value of 5;`Int` type is inferred
    val x = 5
    // 5

    println(x)
}
```


You can use variables only after initializing them. You can either initialize a variable at the moment of declaration or declare a variable first and initialize it later. 
In the second case, you must specify the data type:

```kotlin
fun main() {

    // Initializes the variable x at the moment of declaration; type is not required
    val x = 5
    // Declares the variable c without initialization; type is required
    val c: Int
    // Initializes the variable c after declaration 
    c = 3
    // 5 
    // 3

    println(x)
    println(c)
}
```


You can declare variables at the top level:

```kotlin

val PI = 3.14
var x = 0

fun incrementX() {
    x += 1
}
// x = 0; PI = 3.14
// incrementX()
// x = 1; PI = 3.14

fun main() {
    println("x = $x; PI = $PI")
    incrementX()
    println("incrementX()")
    println("x = $x; PI = $PI")
}
```


For information about declaring properties, see [Properties](properties.md).

## Creating classes and instances

To define a class, use the `class` keyword:
```kotlin
class Shape
```

Properties of a class can be listed in its declaration or body: 

```kotlin
class Rectangle(val height: Double, val length: Double) {
    val perimeter = (height + length) * 2 
}
```

The default constructor with parameters listed in the class declaration is available automatically:

```kotlin
class Rectangle(val height: Double, val length: Double) {
    val perimeter = (height + length) * 2 
}
fun main() {
    val rectangle = Rectangle(5.0, 2.0)
    println("The perimeter is ${rectangle.perimeter}")
}
```


Inheritance between classes is declared by a colon (`:`). Classes are `final` by default; to make a class inheritable, 
mark it as `open`:

```kotlin
open class Shape

class Rectangle(val height: Double, val length: Double): Shape() {
    val perimeter = (height + length) * 2 
}
```

For more information about constructors and inheritance, see [Classes](classes.md) and [Objects and instances](object-declarations.md).

## Comments

Just like most modern languages, Kotlin supports single-line (or _end-of-line_) and multi-line (_block_) comments:

```kotlin
// This is an end-of-line comment

/* This is a block comment
   on multiple lines. */
```

Block comments in Kotlin can be nested:

```kotlin
/* The comment starts here
/* contains a nested comment */     
and ends here. */
```

See [Documenting Kotlin Code](kotlin-doc.md) for information on the documentation comment syntax.

## String templates

```kotlin
fun main() {

    var a = 1
    // simple name in template:
    val s1 = "a is $a" 
    
    a = 2
    // arbitrary expression in template:
    val s2 = "${s1.replace("is", "was")}, but now is $a"

    println(s2)
}
```


See [String templates](strings.md#string-templates) for details.

## Conditional expressions

```kotlin

fun maxOf(a: Int, b: Int): Int {
    if (a &gt; b) {
        return a
    } else {
        return b
    }
}

fun main() {
    println("max of 0 and 42 is ${maxOf(0, 42)}")
}
```


In Kotlin, `if` can also be used as an expression:

```kotlin

fun maxOf(a: Int, b: Int) = if (a &gt; b) a else b

fun main() {
    println("max of 0 and 42 is ${maxOf(0, 42)}")
}
```


See [`if`-expressions](control-flow.md#if-expression).

## for loop

```kotlin
fun main() {

    val items = listOf("apple", "banana", "kiwifruit")
    for (item in items) {
        println(item)
    }

}
```


or:

```kotlin
fun main() {

    val items = listOf("apple", "banana", "kiwifruit")
    for (index in items.indices) {
        println("item at $index is ${items[index]}")
    }

}
```


See [for loop](control-flow.md#for-loops).

## while loop

```kotlin
fun main() {

    val items = listOf("apple", "banana", "kiwifruit")
    var index = 0
    while (index &lt; items.size) {
        println("item at $index is ${items[index]}")
        index++
    }

}
```


See [while loop](control-flow.md#while-loops).

## when expression

```kotlin

fun describe(obj: Any): String =
    when (obj) {
        1          `→` "One"
        "Hello"    `→` "Greeting"
        is Long    `→` "Long"
        !is String `→` "Not a string"
        else       `→` "Unknown"
    }

fun main() {
    println(describe(1))
    println(describe("Hello"))
    println(describe(1000L))
    println(describe(2))
    println(describe("other"))
}
```


See [when expressions and statements](control-flow.md#when-expressions-and-statements).

## Ranges

Check if a number is within a range using `in` operator:

```kotlin
fun main() {

    val x = 10
    val y = 9
    if (x in 1..y+1) {
        println("fits in range")
    }

}
```


Check if a number is out of range:

```kotlin
fun main() {

    val list = listOf("a", "b", "c")
    
    if (-1 !in 0..list.lastIndex) {
        println("-1 is out of range")
    }
    if (list.size !in list.indices) {
        println("list size is out of valid list indices range, too")
    }

}
```


Iterate over a range:

```kotlin
fun main() {

    for (x in 1..5) {
        print(x)
    }

}
```


Or over a progression:

```kotlin
fun main() {

    for (x in 1..10 step 2) {
        print(x)
    }
    println()
    for (x in 9 downTo 0 step 3) {
        print(x)
    }

}
```


See [Ranges and progressions](ranges.md).

## Collections

Iterate over a collection:

```kotlin
fun main() {
    val items = listOf("apple", "banana", "kiwifruit")

    for (item in items) {
        println(item)
    }

}
```


Check if a collection contains an object using `in` operator:

```kotlin
fun main() {
    val items = setOf("apple", "banana", "kiwifruit")

    when {
        "orange" in items `→` println("juicy")
        "apple" in items `→` println("apple is fine too")
    }

}
```


Use [lambda expressions](lambdas.md) to filter and map collections:

```kotlin
fun main() {

    val fruits = listOf("banana", "avocado", "apple", "kiwifruit")
    fruits
      .filter { it.startsWith("a") }
      .sortedBy { it }
      .map { it.uppercase() }
      .forEach { println(it) }

}
```


See [Collections overview](collections-overview.md).

## Nullable values and null checks

A reference must be explicitly marked as nullable when `null` value is possible. Nullable type names have `?` at the end.

Return `null` if `str` does not hold an integer:

```kotlin
fun parseInt(str: String): Int? {
    // ...
}
```

Use a function returning nullable value:

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}

fun printProduct(arg1: String, arg2: String) {
    val x = parseInt(arg1)
    val y = parseInt(arg2)

    // Using `x * y` yields error because they may hold nulls.
    if (x != null && y != null) {
        // x and y are automatically cast to non-nullable after null check
        println(x * y)
    }
    else {
        println("'$arg1' or '$arg2' is not a number")
    }    
}

fun main() {
    printProduct("6", "7")
    printProduct("a", "7")
    printProduct("a", "b")
}
```


or:

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}

fun printProduct(arg1: String, arg2: String) {
    val x = parseInt(arg1)
    val y = parseInt(arg2)

    // ...
    if (x == null) {
        println("Wrong number format in arg1: '$arg1'")
        return
    }
    if (y == null) {
        println("Wrong number format in arg2: '$arg2'")
        return
    }

    // x and y are automatically cast to non-nullable after null check
    println(x * y)

}

fun main() {
    printProduct("6", "7")
    printProduct("a", "7")
    printProduct("99", "b")
}
```


See [Null-safety](null-safety.md).

## Type checks and automatic casts

The `is` operator checks if an expression is an instance of a type.
If an immutable local variable or property is checked for a specific type, there's no need to cast it explicitly:

```kotlin

fun getStringLength(obj: Any): Int? {
    if (obj is String) {
        // `obj` is automatically cast to `String` in this branch
        return obj.length
    }

    // `obj` is still of type `Any` outside of the type-checked branch
    return null
}

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength(1000)
    printLength(listOf(Any()))
}
```


or:

```kotlin

fun getStringLength(obj: Any): Int? {
    if (obj !is String) return null

    // `obj` is automatically cast to `String` in this branch
    return obj.length
}

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength(1000)
    printLength(listOf(Any()))
}
```


or even:

```kotlin

fun getStringLength(obj: Any): Int? {
    // `obj` is automatically cast to `String` on the right-hand side of `&&`
    if (obj is String && obj.length &gt; 0) {
        return obj.length
    }

    return null
}

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength("")
    printLength(1000)
}
```


See [Classes](classes.md) and [Type casts](typecasts.md).

