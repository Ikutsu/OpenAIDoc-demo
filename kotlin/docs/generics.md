---
title: "Generics: in, out, where"
---


Classes in Kotlin can have type parameters, just like in Java:

```kotlin
class Box&lt;T&gt;(t: T) {
    var value = t
}
```

To create an instance of such a class, simply provide the type arguments:

```kotlin
val box: Box&lt;Int&gt; = Box&lt;Int&gt;(1)
```

But if the parameters can be inferred, for example, from the constructor arguments,
you can omit the type arguments:

```kotlin
val box = Box(1) // 1 has type Int, so the compiler figures out that it is Box&lt;Int&gt;
```

## Variance

One of the trickiest aspects of Java's type system is the wildcard types (see [Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)).
Kotlin doesn't have these. Instead, Kotlin has declaration-site variance and type projections.


### Variance and wildcards in Java

Let's think about why Java needs these mysterious wildcards. First, generic types in Java are _invariant_,
meaning that `List<String>` is _not_ a subtype of `List<Object>`. If `List` were not _invariant_, it would
have been no better than Java's arrays, as the following code would have compiled but caused an exception at runtime:

```java
// Java
List&lt;String&gt; strs = new ArrayList&lt;String&gt;();

// Java reports a type mismatch here at compile-time.
List&lt;Object&gt; objs = strs;

// What if it didn't?
// We would be able to put an Integer into a list of Strings.
objs.add(1);

// And then at runtime, Java would throw
// a ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Java prohibits such things to guarantee runtime safety. But this has implications. For example,
consider the `addAll()` method from the `Collection` interface. What's the signature of this method? Intuitively,
you'd write it this way:

```java
// Java
interface Collection&lt;E&gt; ... {
    void addAll(Collection&lt;E&gt; items);
}
```

But then, you would not be able to do the following (which is perfectly safe):

```java
// Java

// The following would not compile with the naive declaration of addAll:
// Collection&lt;String&gt; is not a subtype of Collection&lt;Object&gt;
void copyAll(Collection&lt;Object&gt; to, Collection&lt;String&gt; from) {
    to.addAll(from);
}
```

That's why the actual signature of `addAll()` is the following:

```java
// Java
interface Collection&lt;E&gt; ... {
    void addAll(Collection&lt;? extends E&gt; items);
}
```

The _wildcard type argument_ `? extends E` indicates that this method accepts a collection of objects of `E`
_or a subtype of_ `E`, not just `E` itself. This means that you can safely _read_ `E`'s from items
(elements of this collection are instances of a subclass of E), but _cannot write_ to
it as you don't know what objects comply with that unknown subtype of `E`.
In return for this limitation, you get the desired behavior: `Collection<String>` _is_ a subtype of `Collection<? extends Object>`.
In other words, the wildcard with an _extends_-bound (_upper_ bound) makes the type _covariant_.

The key to understanding why this works is rather simple: if you can only _take_ items from a collection,
then using a collection of `String`s and reading `Object`s from it is fine. Conversely, if you can only _put_ items
into the collection, it's okay to take a collection of `Object`s and put `String`s into it: in Java there is
`List<? super String>`, which accepts `String`s or any of its supertypes.

The latter is called _contravariance_, and you can only call methods that take `String` as an argument on `List<? super String>`
(for example, you can call `add(String)` or `set(int, String)`).  If you call something that returns `T` in `List<T>`,
you don't get a `String`, but rather an `Object`.

Joshua Bloch, in his book [Effective Java, 3rd Edition](http://www.oracle.com/technetwork/java/effectivejava-136174.html), explains the problem well
(Item 31: "Use bounded wildcards to increase API flexibility"). He gives the name _Producers_ to objects you only
_read from_ and _Consumers_ to those you only _write to_. He recommends:

>"For maximum flexibility, use wildcard types on input parameters that represent producers or consumers."

He then proposes the following mnemonic: _PECS_ stands for _Producer-Extends, Consumer-Super._

:::tip
If you use a producer-object, say, `List<? extends Foo>`, you are not allowed to call `add()` or `set()` on this object,
but this does not mean that it is _immutable_: for example, nothing prevents you from calling `clear()`
to remove all the items from the list, since `clear()` does not take any parameters at all.

The only thing guaranteed by wildcards (or other types of variance) is _type safety_. Immutability is a completely different story.

:::


### Declaration-site variance

Let's suppose that there is a generic interface `Source<T>` that does not have any methods that take `T` as a parameter, only methods that return `T`:

```java
// Java
interface Source&lt;T&gt; {
    T nextT();
}
```

Then, it would be perfectly safe to store a reference to an instance of `Source<String>` in a variable of
type `Source<Object>` - there are no consumer-methods to call. But Java does not know this, and still prohibits it:

```java
// Java
void demo(Source&lt;String&gt; strs) {
    Source&lt;Object&gt; objects = strs; // !!! Not allowed in Java
    // ...
}
```

To fix this, you should declare objects of type `Source<? extends Object>`. Doing so is meaningless,
because you can call all the same methods on such a variable as before, so there's no value added by the more complex type.
But the compiler does not know that.

In Kotlin, there is a way to explain this sort of thing to the compiler. This is called _declaration-site variance_:
you can annotate the _type parameter_ `T` of `Source` to make sure that it is only _returned_ (produced) from members
of `Source<T>`, and never consumed.
To do this, use the `out` modifier:

```kotlin
interface Source&lt;out T&gt; {
    fun nextT(): T
}

fun demo(strs: Source&lt;String&gt;) {
    val objects: Source&lt;Any&gt; = strs // This is OK, since T is an out-parameter
    // ...
}
```

The general rule is this: when a type parameter `T` of a class `C` is declared `out`, it may occur only in the _out_-position
in the members of `C`, but in return `C<Base>` can safely be a supertype of `C<Derived>`.

In other words, you can say that the class `C` is _covariant_ in the parameter `T`, or that `T` is a _covariant_ type parameter.
You can think of `C` as being a _producer_ of `T`'s, and NOT a _consumer_ of `T`'s.

The `out` modifier is called a _variance annotation_, and  since it is provided at the type parameter declaration site,
it provides _declaration-site variance_.
This is in contrast with Java's _use-site variance_ where wildcards in the type usages make the types covariant.

In addition to `out`, Kotlin provides a complementary variance annotation: `in`. It makes a type parameter _contravariant_, meaning
it can only be consumed and never produced. A good example of a contravariant type is `Comparable`:

```kotlin
interface Comparable&lt;in T&gt; {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable&lt;Number&gt;) {
    x.compareTo(1.0) // 1.0 has type Double, which is a subtype of Number
    // Thus, you can assign x to a variable of type Comparable&lt;Double&gt;
    val y: Comparable&lt;Double&gt; = x // OK!
}
```

The words _in_ and _out_ seem to be self-explanatory (as they've already been used successfully in C# for quite some time),
and so the mnemonic mentioned above is not really needed.  It can in fact be rephrased at a higher level of abstraction:

**[The Existential](https://en.wikipedia.org/wiki/Existentialism) Transformation: Consumer in, Producer out!** :-)

## Type projections

### Use-site variance: type projections

It is very easy to declare a type parameter `T` as `out` and avoid trouble with subtyping on the use site,
but some classes _can't_ actually be restricted to only return `T`'s!
A good example of this is `Array`:

```kotlin
class Array&lt;T&gt;(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

This class can be neither co- nor contravariant in `T`. And this imposes certain inflexibilities. Consider the following function:

```kotlin
fun copy(from: Array&lt;Any&gt;, to: Array&lt;Any&gt;) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

This function is supposed to copy items from one array to another. Let's try to apply it in practice:

```kotlin
val ints: Array&lt;Int&gt; = arrayOf(1, 2, 3)
val any = Array&lt;Any&gt;(3) { "" } 
copy(ints, any)
//   ^ type is Array&lt;Int&gt; but Array&lt;Any&gt; was expected
```

Here you run into the same familiar problem: `Array<T>` is _invariant_ in `T`, and so neither `Array<Int>` nor `Array<Any>`
is a subtype of the other. Why not? Again, this is because `copy` could have an unexpected behavior, for example, it may attempt to
write a `String` to `from`, and if you actually pass an array of `Int` there, a `ClassCastException` will be thrown later.

To prohibit the `copy` function from _writing_ to `from`, you can do the following:

```kotlin
fun copy(from: Array&lt;out Any&gt;, to: Array&lt;Any&gt;) { ... }
```

This is _type projection_, which means that `from` is not a simple array, but is rather a restricted (_projected_) one.
You can only call methods that return the type parameter `T`, which in this case means that you can only call `get()`.
This is our approach to _use-site variance_, and it corresponds to Java's `Array<? extends Object>` while being slightly simpler.

You can project a type with `in` as well:

```kotlin
fun fill(dest: Array&lt;in String&gt;, value: String) { ... }
```

`Array<in String>` corresponds to Java's `Array<? super String>`. This means that you can pass an array of `String`, `CharSequence`,
or `Object` to the `fill()` function.

### Star-projections

Sometimes you want to say that you know nothing about the type argument, but you still want to use it in a safe way.
The safe way here is to define such a projection of the generic type, that every concrete instantiation of that generic
type will be a subtype of that projection.

Kotlin provides so-called _star-projection_ syntax for this:

- For `Foo<out T : TUpper>`, where `T` is a covariant type parameter with the upper bound `TUpper`, `Foo<*>` is
  equivalent to `Foo<out TUpper>`. This means that when the `T` is unknown you can safely _read_ values of `TUpper` from `Foo<*>`.
- For `Foo<in T>`, where `T` is a contravariant type parameter, `Foo<*>` is equivalent to `Foo<in Nothing>`. This means
  there is nothing you can _write_ to `Foo<*>` in a safe way when `T` is unknown.
- For `Foo<T : TUpper>`, where `T` is an invariant type parameter with the upper bound `TUpper`, `Foo<*>` is equivalent
  to `Foo<out TUpper>` for reading values and to `Foo<in Nothing>` for writing values.

If a generic type has several type parameters, each of them can be projected independently.
For example, if the type is declared as `interface Function<in T, out U>` you could use the following star-projections:

* `Function<*, String>` means `Function<in Nothing, String>`.
* `Function<Int, *>` means `Function<Int, out Any?>`.
* `Function<*, *>` means `Function<in Nothing, out Any?>`.

:::tip
Star-projections are very much like Java's raw types, but safe.

:::


## Generic functions

Classes aren't the only declarations that can have type parameters. Functions can, too. Type parameters are placed _before_ the name of the function:

```kotlin
fun &lt;T&gt; singletonList(item: T): List&lt;T&gt; {
    // ...
}

fun &lt;T&gt; T.basicToString(): String { // extension function
    // ...
}
```

To call a generic function, specify the type arguments at the call site _after_ the name of the function:

```kotlin
val l = singletonList&lt;Int&gt;(1)
```

Type arguments can be omitted if they can be inferred from the context, so the following example works as well:

```kotlin
val l = singletonList(1)
```

## Generic constraints

The set of all possible types that can be substituted for a given type parameter may be restricted by _generic constraints_.

### Upper bounds

The most common type of constraint is an _upper bound_, which corresponds to Java's `extends` keyword:

```kotlin
fun &lt;T : Comparable&lt;T&gt;&gt; sort(list: List&lt;T&gt;) {  ... }
```

The type specified after a colon is the _upper bound_, indicating that only a subtype of `Comparable<T>` can be substituted for `T`. For example:

```kotlin
sort(listOf(1, 2, 3)) // OK. Int is a subtype of Comparable&lt;Int&gt;
sort(listOf(HashMap&lt;Int, String&gt;())) // Error: HashMap&lt;Int, String&gt; is not a subtype of Comparable&lt;HashMap&lt;Int, String&gt;&gt;
```

The default upper bound (if there was none specified) is `Any?`. Only one upper bound can be specified inside the angle brackets.
If the same type parameter needs more than one upper bound, you need a separate _where_-clause:

```kotlin
fun &lt;T&gt; copyWhenGreater(list: List&lt;T&gt;, threshold: T): List&lt;String&gt;
    where T : CharSequence,
          T : Comparable&lt;T&gt; {
    return list.filter { it &gt; threshold }.map { it.toString() }
}
```

The passed type must satisfy all conditions of the `where` clause simultaneously. In the above example, the `T` type
must implement _both_ `CharSequence` and `Comparable`.

## Definitely non-nullable types

To make interoperability with generic Java classes and interfaces easier, Kotlin supports declaring a generic type parameter
as **definitely non-nullable**. 

To declare a generic type `T` as definitely non-nullable, declare the type with `& Any`. For example: `T & Any`.

A definitely non-nullable type must have a nullable [upper bound](#upper-bounds).

The most common use case for declaring definitely non-nullable types is when you want to override a Java method that 
contains `@NotNull` as an argument. For example, consider the `load()` method:

```java
import org.jetbrains.annotations.*;

public interface Game&lt;T&gt; {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

To override the `load()` method in Kotlin successfully, you need `T1` to be declared as definitely non-nullable:

```kotlin
interface ArcadeGame&lt;T1&gt; : Game&lt;T1&gt; {
    override fun save(x: T1): T1
    // T1 is definitely non-nullable
    override fun load(x: T1 & Any): T1 & Any
}
```

When working only with Kotlin, it's unlikely that you will need to declare definitely non-nullable types explicitly because 
Kotlin's type inference takes care of this for you.

## Type erasure

The type safety checks that Kotlin performs for generic declaration usages are done at compile time.
At runtime, the instances of generic types do not hold any information about their actual type arguments.
The type information is said to be _erased_. For example, the instances of `Foo<Bar>` and `Foo<Baz?>` are erased to
just `Foo<*>`.

### Generics type checks and casts

Due to the type erasure, there is no general way to check whether an instance of a generic type was created with certain type
arguments at runtime, and the compiler prohibits such `is`-checks such as
`ints is List<Int>` or `list is T` (type parameter). However, you can check an instance against a star-projected type:

```kotlin
if (something is List&lt;*&gt;) {
    something.forEach { println(it) } // The items are typed as `Any?`
}
```

Similarly, when you already have the type arguments of an instance checked statically (at compile time),
you can make an `is`-check or a cast that involves the non-generic part of the type. Note that
angle brackets are omitted in this case:

```kotlin
fun handleStrings(list: MutableList&lt;String&gt;) {
    if (list is ArrayList) {
        // `list` is smart-cast to `ArrayList&lt;String&gt;`
    }
}
```

The same syntax but with the type arguments omitted can be used for casts that do not take type arguments into account: `list as ArrayList`.

The type arguments of generic function calls are also only checked at compile time. Inside the function bodies,
the type parameters cannot be used for type checks, and type casts to type parameters (`foo as T`) are unchecked.
The only exclusion is inline functions with [reified type parameters](inline-functions.md#reified-type-parameters),
which have their actual type arguments inlined at each call site. This enables type checks and casts for the type parameters.
However, the restrictions described above still apply for instances of generic types used inside checks or casts.
For example, in the type check `arg is T`, if `arg` is an instance of a generic type itself, its type arguments are still erased.

```kotlin

inline fun &lt;reified A, reified B&gt; Pair&lt;*, *&gt;.asPairOf(): Pair&lt;A, B&gt;? {
    if (first !is A || second !is B) return null
    return first as A to second as B
}

val somePair: Pair&lt;Any?, Any?&gt; = "items" to listOf(1, 2, 3)


val stringToSomething = somePair.asPairOf&lt;String, Any&gt;()
val stringToInt = somePair.asPairOf&lt;String, Int&gt;()
val stringToList = somePair.asPairOf&lt;String, List&lt;*&gt;&gt;()
val stringToStringList = somePair.asPairOf&lt;String, List&lt;String&gt;&gt;() // Compiles but breaks type safety!
// Expand the sample for more details

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // This will throw ClassCastException as list items are not String
}
```


### Unchecked casts

Type casts to generic types with concrete type arguments such as `foo as List<String>` cannot be checked at runtime.  
These unchecked casts can be used when type safety is implied by the high-level program logic but cannot be inferred 
directly by the compiler. See the example below.

```kotlin
fun readDictionary(file: File): Map&lt;String, *&gt; = file.inputStream().use { 
    TODO("Read a mapping of strings to arbitrary elements.")
}

// We saved a map with `Int`s into this file
val intsFile = File("ints.dictionary")

// Warning: Unchecked cast: `Map&lt;String, *&gt;` to `Map&lt;String, Int&gt;`
val intsDictionary: Map&lt;String, Int&gt; = readDictionary(intsFile) as Map&lt;String, Int&gt;
```
A warning appears for the cast in the last line. The compiler can't fully check it at runtime and provides
no guarantee that the values in the map are `Int`.

To avoid unchecked casts, you can redesign the program structure. In the example above, you could use the
`DictionaryReader<T>` and `DictionaryWriter<T>` interfaces with type-safe implementations for different types.
You can introduce reasonable abstractions to move unchecked casts from the call site to the implementation details.
Proper use of [generic variance](#variance) can also help.

For generic functions, using [reified type parameters](inline-functions.md#reified-type-parameters) makes casts
like `arg as T` checked, unless `arg`'s type has *its own* type arguments that are erased.

An unchecked cast warning can be suppressed by [annotating](annotations.md) the statement or the
declaration where it occurs with `@Suppress("UNCHECKED_CAST")`:

```kotlin
inline fun &lt;reified T&gt; List&lt;*&gt;.asListOfType(): List&lt;T&gt;? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List&lt;T&gt; else
        null
```

>**On the JVM**: [array types](arrays.md) (`Array<Foo>`) retain information about the erased type of
>their elements, and type casts to an array type are partially checked: the
>nullability and actual type arguments of the element type are still erased. For example,
>the cast `foo as Array<List<String>?>` will succeed if `foo` is an array holding any `List<*>`, whether it is nullable or not.


## Underscore operator for type arguments

The underscore operator `_` can be used for type arguments. Use it to automatically infer a type of the argument when other types are explicitly specified:

```kotlin
abstract class SomeClass&lt;T&gt; {
    abstract fun execute() : T
}

class SomeImplementation : SomeClass&lt;String&gt;() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass&lt;Int&gt;() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun &lt;reified S: SomeClass&lt;T&gt;, T&gt; run() : T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // T is inferred as String because SomeImplementation derives from SomeClass&lt;String&gt;
    val s = Runner.run&lt;SomeImplementation, _&gt;()
    assert(s == "Test")

    // T is inferred as Int because OtherImplementation derives from SomeClass&lt;Int&gt;
    val n = Runner.run&lt;OtherImplementation, _&gt;()
    assert(n == 42)
}
```
