---
title: Testing page
description: This page is for testing purposes only.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




<no-index/>

:::info
<p>
   This is a  block with images (taken from <strong>Getting started with Compose Multiplatform</strong> tutorial).
   </p>
<p>
   <img src="icon-1-done.svg" width="20" alt="First step"/> <a href="jvm-create-project-with-spring-boot.md">Create a Spring Boot project with Kotlin</a><br/>
      <img src="icon-2-done.svg" width="20" alt="Second step"/> <a href="jvm-spring-boot-add-data-class.md">Add a data class to the Spring Boot project</a><br/>
      <img src="icon-3.svg" width="20" alt="Third step"/> <strong>Add database support for Spring Boot project</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="Fourth step"/> Use Spring Data CrudRepository for database access><br/>
   </p>

:::

## Synchronized tabs

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    kotlin("kapt") version "1.9.23"
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id "org.jetbrains.kotlin.kapt" version "1.9.23"
}
```

</TabItem>
</Tabs>

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.noarg" version "1.9.23"
}
```

</TabItem>
</Tabs>

## Sections

### Collapsed section 

Some text here and a codeblock:

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## Codeblocks

Just a codeblock:

```kotlin
    import java.util.*

@Service
class MessageService(val db: MessageRepository) {
    fun findMessages(): List&lt;Message&gt; = db.findAll().toList()

    fun findMessageById(id: String): List&lt;Message&gt; = db.findById(id).toList()

    fun save(message: Message) {
        db.save(message)
    }

    fun &lt;T : Any&gt; Optional&lt;out T&gt;.toList(): List&lt;T&gt; =
        if (isPresent) listOf(get()) else emptyList()
}
```

### Expandable codeblock

```kotlin
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class DemoApplication

fun main(args: Array&lt;String&gt;) {
    runApplication&lt;DemoApplication&gt;(*args)
}

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```


### Runnable codeblock

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val user = User("Alex", 1)

    // Automatically uses toString() function so that output is easy to read
    println(user)            
    // User(name=Alex, id=1)

}
```


## Tables

### Markdown table

| Primitive-type array                                                                  | Equivalent in Java |
|---------------------------------------------------------------------------------------|--------------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`        |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)       | `byte[]`           |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)       | `char[]`           |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)   | `double[]`         |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)     | `float[]`          |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)         | `int[]`            |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)       | `long[]`           |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)     | `short[]`          |

### XML table

<table>
    <tr>
<td><strong>Last modified on</strong></td>
<td><strong>December 2023</strong></td>
    </tr>
    <tr>
<td><strong>Next update</strong></td>
<td><strong>June 2024</strong></td>
    </tr>
</table>

### XML table with codeblocks inside

Simple table:

<table>
    <tr>
<td>Before</td>
<td>Now</td>
    </tr>
    <tr>
<td>

```kotlin
kotlin {
    targets {
        configure(['windows',
            'linux']) {
        }
    }
}
```
</td>
<td>

```kotlin
kotlin {
    targets {
        configure([findByName('windows'),
            findByName('linux')]) {
        }
    }
}
```
</td>
    </tr>
</table>

More complex table:

<table>
    <tr>
<td></td>
<td>Before</td>
<td>Now</td>
    </tr>
    <tr>
<td rowspan="2">Dependencies of the <code>jvmMain</code> compilation</td>
<td>

```kotlin
jvm<Scope>
```
</td>
<td>

```kotlin
jvmCompilation<Scope>
```
</td>
    </tr>
    <tr>
<td>

```kotlin
dependencies {
    add("jvmImplementation",
        "foo.bar.baz:1.2.3")
}
```
</td>
<td>

```kotlin
dependencies {
    add("jvmCompilationImplementation",
        "foo.bar.baz:1.2.3")
}
```
</td>
    </tr>
    <tr>
<td>Dependencies of the <code>jvmMain</code> source set</td>
<td colspan="2">

```kotlin
jvmMain<Scope>
```
</td>
    </tr>
    <tr>
<td>Dependencies of the <code>jvmTest</code> compilation</td>
<td>

```kotlin
jvmTest<Scope>
```
</td>
<td>

```kotlin
jvmTestCompilation<Scope>
```
</td>
    </tr>
    <tr>
<td>Dependencies of the <code>jvmTest</code> source set</td>
<td colspan="2">

```kotlin
jvmTest<Scope>
```
</td>
    </tr>
</table>

## Lists

### Ordered list

1. One
2. Two
3. Three
    1. Three point 1
    2. Three point 2
    3. Three point 3
        1. Three point 1 and 1
4. With a codeblock inside:

   ```kotlin
   jvmTest&lt;Scope&gt;
   ```

### Non-ordered list

* First bullet
* Second bullet
* Third bullet
    * One more
    * Another one
        * Wow, one more
* With a codeblock inside:

   ```kotlin
   jvmTest&lt;Scope&gt;
   ```

### Definition list
<h3>Collapsible item #1</h3>
<p>
   The return type of the <code>findById()</code> function in the <code>CrudRepository</code> interface is an instance of the <code>Optional</code> class. However, it would be convenient to return a <code>List</code> with a single message for consistency. For that, you need to unwrap the <code>Optional</code> value if it’s present, and return a list with the value. This can be implemented as an <a href="extensions.md#extension-functions">extension function</a> to the <code>Optional</code> type.
   </p>
<p>
   In the code, <code>Optional&lt;out T&gt;.toList()</code>, <code>.toList()</code> is the extension function for <code>Optional</code>. Extension functions allow you to write additional functions to any classes, which is especially useful when you want to extend functionality of some library class.
   </p>
<h3>Collapsible item #2</h3>
<p>
   <a href="https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#jdbc.entity-persistence">This function works</a> with an assumption that the new object doesn’t have an id in the database. Hence, the id <b>should be null</b> for insertion.
   </p>
<p>
   If the id isn’t <i>null</i>, <code>CrudRepository</code> assumes that the object already exists in the database and this is an <i>update</i> operation as opposed to an <i>insert</i> operation. After the insert operation, the <code>id</code> will be generated by the data store and assigned back to the <code>Message</code> instance. This is why the <code>id</code> property should be declared using the <code>var</code> keyword.
   </p>
<p>
   </p>
   


## Text elements

* **Bold text**
* _italic text_
* `inline code`
* [internal anchor](#lists)
* [internal link](roadmap.md)
* [external link](https://jetbrains.com)
* emojis ❌✅🆕

## Variables
* variable using: latest Kotlin version is 2.1.20

## Embedded elements

### Video from YouTube

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="What's new in Kotlin 1.9.20"/>

### Pictures

Regular (Markdown):

<img src="/img/create-test.png" alt="Create a test" width="700" style={{verticalAlign: 'middle'}}/>

Regular (XML):

<img src="multiplatform-web-wizard.png" alt="Multiplatform web wizard" width="400"/>

Inline:

<img src="/img/youtrack-logo.png" alt="YouTrack" width="30" style={{verticalAlign: 'middle'}}/>

Zoomable:

<img src="/img/ksp-class-diagram.svg" alt="class diagram" width="700" style={{verticalAlign: 'middle'}}/>

Button-style:

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="Create a project" />
</a>

## Notes

Warning:

:::tip
Support for K2 in the kapt compiler plugin is [Experimental](components-stability.md).
Opt-in is required (see details below), and you should use it only for evaluation purposes.

:::


Note:

:::tip
As for native platform libraries shipped with Kotlin/Native (like Foundation, UIKit, and POSIX),  only some of their
APIs need an opt-in with `@ExperimentalForeignApi`. In such cases, you get a warning with an opt-in requirement.

:::


Tip:

:::tip
As for native platform libraries shipped with Kotlin/Native (like Foundation, UIKit, and POSIX),  only some of their
APIs need an opt-in with `@ExperimentalForeignApi`. In such cases, you get a warning with an opt-in requirement.

:::
