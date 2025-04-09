---
title: Add a data class to Spring Boot project
description: Add a Kotlin data class to Spring Boot project.
---


:::info
<p>
   This is the second part of the <strong>Getting started with Spring Boot and Kotlin</strong> tutorial. Before proceeding, make sure you've completed previous steps:
</p><br/>
<p>
   <img src="icon-1-done.svg" width="20" alt="First step"/> <a href="jvm-create-project-with-spring-boot.md">Create a Spring Boot project with Kotlin</a><br/><img src="icon-2.svg" width="20" alt="Second step"/> <strong>Add a data class to the Spring Boot project</strong><br/><img src="icon-3-todo.svg" width="20" alt="Third step"/> Add database support for Spring Boot project<br/><img src="icon-4-todo.svg" width="20" alt="Fourth step"/> Use Spring Data CrudRepository for database access
</p>

:::

In this part of the tutorial, you'll add some more functionality to the application and discover more Kotlin language features, such as data classes.
It requires changing the `MessageController` class to respond with a JSON document containing a collection of serialized objects.

## Update your application

1. In the same package, create a `Message.kt` file with a data class with two properties: `id` and `text`:

    ```kotlin
    // Message.kt
    package demo
   
    data class Message(val id: String?, val text: String)
    ```

   `Message` class will be used for data transfer: a list of serialized `Message` objects will make up the JSON document that the controller is going to respond to the browser request.
<h3>Data classes – data class Message</h3>
<p>
   The main purpose of <a href="data-classes.md">data classes</a> in Kotlin is to hold data. Such classes are marked with the `data` keyword, and some standard functionality and some utility functions are often mechanically derivable from the class structure.
</p>
<p>
   In this example, you declared `Message` as a data class as its main purpose is to store the data.
</p>
<h3>val and var properties</h3>
<p>
   <a href="properties.md">Properties in Kotlin</a> classes can be declared either as:
</p>
<list>
<li><i>mutable</i>, using the `var` keyword</li>
<li><i>read-only</i>, using the `val` keyword</li>
</list>
<p>
   The `Message` class declares two properties using `val` keyword, the `id` and `text`.
          The compiler will automatically generate the getters for both of these properties.
          It will not be possible to reassign the values of these properties after an instance of the `Message` class is created.
</p>
<h3>Nullable types – String?</h3>
<p>
   Kotlin provides <a href="null-safety.md#nullable-types-and-non-nullable-types">built-in support for nullable types</a>. In Kotlin, the type system distinguishes between references that can hold `null` (<i>nullable references</i>) and those that cannot (<i>non-nullable references</i>).<br/>
          For example, a regular variable of type `String` cannot hold `null`. To allow nulls, you can declare a variable as a nullable string by writing `String?`.
</p>
<p>
   The `id` property of the `Message` class is declared as a nullable type this time.
          Hence, it is possible to create an instance of `Message` class by passing `null` as a value for `id`:
</p>
          ```kotlin
Message(null, "Hello!")
```
       
   
2. In the `MessageController.kt` file, instead of the `index()` function, create the `listMessages()` function returning a list of `Message` objects:

    ```kotlin
    // MessageController.kt
    package demo
   
    import org.springframework.web.bind.annotation.GetMapping
    import org.springframework.web.bind.annotation.RequestMapping
    import org.springframework.web.bind.annotation.RestController

    @RestController
    @RequestMapping("/")
    class MessageController {
        @GetMapping
        fun listMessages() = listOf(
            Message("1", "Hello!"),
            Message("2", "Bonjour!"),
            Message("3", "Privet!"),
        )
    }
    ```
<h3>Collections – listOf()</h3>
<p>
   The Kotlin Standard Library provides implementations for basic collection types: sets, lists, and maps.<br/>
          A pair of interfaces represents each collection type:
</p>
<list>
<li>A <i>read-only</i> interface that provides operations for accessing collection elements.</li>
<li>A <i>mutable</i> interface that extends the corresponding read-only interface with write operations: adding, removing, and updating its elements.</li>
</list>
<p>
   The corresponding factory functions are also provided by the Kotlin Standard Library to create instances of such collections.
</p>
<p>
   In this tutorial, you use the <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html">`listOf()`</a> function to create a list of `Message` objects.
          This is the factory function to create a <i>read-only</i> list of objects: you can't add or remove elements from the list.<br/>
          If it is required to perform write operations on the list, call the <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html">`mutableListOf()`</a> function to create a mutable list instance.
</p>
<h3>Trailing comma</h3>
<p>
   A <a href="coding-conventions.md#trailing-commas">trailing comma</a> is a comma symbol after the <b>last item</b> of a series of elements:
</p>
            ```kotlin
Message("3", "Privet!"),
```
<p>
   This is a convenient feature of Kotlin syntax and is entirely optional – your code will still work without them.
</p>
<p>
   In the example above, creating a list of `Message` objects includes the trailing comma after the last `listOf()` function argument.
</p>
       
    

The response from `MessageController` will now be a JSON document containing a collection of `Message` objects.
:::note
Any controller in the Spring application renders JSON response by default if Jackson library is on the classpath.
As you [specified the `spring-boot-starter-web` dependency in the `build.gradle.kts` file](./jvm-create-project-with-spring-boot.md#explore-the-project-gradle-build-file), you received Jackson as a _transitive_ dependency.
Hence, the application responds with a JSON document if the endpoint returns a data structure that can be serialized to JSON.
:::

Here is a complete code of the `DemoApplication.kt`, `MessageController.kt`, and `Message.kt` files:

```kotlin
// DemoApplication.kt
package demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}
```


```kotlin
// MessageController.kt
package demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/")
class MessageController {
    @GetMapping
    fun listMessages() = listOf(
        Message("1", "Hello!"),
        Message("2", "Bonjour!"),
        Message("3", "Privet!"),
    )
}
```


```kotlin
// Message.kt
package demo

data class Message(val id: String?, val text: String)
```


## Run the application

The Spring application is ready to run:

1. Run the application again.

2. Once the application starts, open the following URL:

    ```text
    http://localhost:8080
    ```

    You will see a page with a collection of messages in JSON format:

    <img src="/img/messages-in-json-format.png" alt="Run the application" width="800" style={{verticalAlign: 'middle'}}/>

## Next step

In the next part of the tutorial, you'll add and configure a database to your project, and make HTTP requests.

**[Proceed to the next chapter](./jvm-spring-boot-add-db-support.md)**