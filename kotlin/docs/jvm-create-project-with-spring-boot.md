---
title: Create a Spring Boot project with Kotlin
description: Create a Spring Boot application with Kotlin using IntelliJ IDEA.
---
:::info
<p>
   This is the first part of the <strong>Get started with Spring Boot and Kotlin</strong> tutorial:
</p><br/>
<p>
   <img src="/img/icon-1.svg" width="20" alt="First step"/> <strong>Create a Spring Boot project with Kotlin</strong><br/><img src="/img/icon-2-todo.svg" width="20" alt="Second step"/> Add a data class to the Spring Boot project<br/><img src="/img/icon-3-todo.svg" width="20" alt="Third step"/> Add database support for the Spring Boot project<br/><img src="/img/icon-4-todo.svg" width="20" alt="Fourth step"/> Use Spring Data CrudRepository for database access<br/>
</p>


:::

The first part of the tutorial shows you how to create a Spring Boot project in IntelliJ IDEA using Project Wizard.

## Before you start

Download and install the latest version of [IntelliJ IDEA Ultimate Edition](https://www.jetbrains.com/idea/download/index.html).

:::note
If you use IntelliJ IDEA Community Edition or another IDE, you can generate a Spring Boot project using a [web-based project generator](https://start.spring.io).

:::

## Create a Spring Boot project

Create a new Spring Boot project with Kotlin by using the Project Wizard in IntelliJ IDEA Ultimate Edition:

:::note
You can also create a new project using [IntelliJ IDEA with the Spring Boot plugin](https://www.jetbrains.com/help/idea/spring-boot.html).

:::

1. In IntelliJ IDEA, select **File** | **New** | **Project**. 
2. In the panel on the left, select **New Project** | **Spring Boot**.
3. Specify the following fields and options in the Project Wizard window:
   
   * **Name**: demo
   * **Language**: Kotlin
   * **Type**: Gradle - Kotlin

     > This option specifies the build system and the DSL.
     >
     

   * **Package name**: demo
   * **JDK**: Java JDK
     
     > This tutorial uses **Amazon Corretto version 21**.
     > If you don't have a JDK installed, you can download it from the dropdown list.
     >
     
   
   * **Java**: 17

   <img src="/img/create-spring-boot-project.png" alt="Create Spring Boot project" width="800" style={{verticalAlign: 'middle'}}/>

4. Ensure that you have specified all the fields and click **Next**.

5. Select the following dependencies that will be required for the tutorial:

   * **Web | Spring Web**
   * **SQL | Spring Data JDBC**
   * **SQL | H2 Database**

   <img src="/img/set-up-spring-boot-project.png" alt="Set up Spring Boot project" width="800" style={{verticalAlign: 'middle'}}/>

6. Click **Create** to generate and set up the project.

   > The IDE will generate and open a new project. It may take some time to download and import the project dependencies.
   >
    

7. After this, you can observe the following structure in the **Project view**:

   <img src="/img/spring-boot-project-view.png" alt="Set up Spring Boot project" width="400" style={{verticalAlign: 'middle'}}/>

   The generated Gradle project corresponds to the Maven's standard directory layout:
   * There are packages and classes under the `main/kotlin` folder that belong to the application.
   * The entry point to the application is the `main()` method of the `DemoApplication.kt` file.

## Explore the project Gradle build file 

Open the `build.gradle.kts` file: it is the Gradle Kotlin build script, which contains a list of the dependencies required for the application.

The Gradle file is standard for Spring Boot, but it also contains necessary Kotlin dependencies, including the kotlin-spring Gradle plugin – `kotlin("plugin.spring")`.

Here is the full script with the explanation of all parts and dependencies:

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.24" // The version of Kotlin to use
    kotlin("plugin.spring") version "1.9.24" // The Kotlin Spring plugin
    id("org.springframework.boot") version "3.3.4"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin") // Jackson extensions for Kotlin for working with JSON
    implementation("org.jetbrains.kotlin:kotlin-reflect") // Kotlin reflection library, required for working with Spring
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict") // `-Xjsr305=strict` enables the strict mode for JSR-305 annotations
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

As you can see, there are a few Kotlin-related artifacts added to the Gradle build file:

1. In the `plugins` block, there are two Kotlin artifacts:

   * `kotlin("jvm")` – the plugin defines the version of Kotlin to be used in the project
   * `kotlin("plugin.spring")` – Kotlin Spring compiler plugin for adding the `open` modifier to Kotlin classes in order to make them compatible with Spring Framework features

2. In the `dependencies` block, a few Kotlin-related modules listed:

   * `com.fasterxml.jackson.module:jackson-module-kotlin` – the module adds support for serialization and deserialization of Kotlin classes and data classes
   * `org.jetbrains.kotlin:kotlin-reflect` – Kotlin reflection library

3. After the dependencies section, you can see the `kotlin` plugin configuration block.
   This is where you can add extra arguments to the compiler to enable or disable various language features.

## Explore the generated Spring Boot application

Open the `DemoApplication.kt` file:

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
<h3>Declaring classes – class DemoApplication</h3>
<p>
   Right after package declaration and import statements you can see the first class declaration, `class DemoApplication`.
</p>
<p>
   In Kotlin, if a class doesn't include any members (properties or functions), you can omit the class body (`{}`) for good.
</p>
<h3>@SpringBootApplication annotation</h3>
<p>
   <a href="https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.using-the-springbootapplication-annotation">`@SpringBootApplication annotation`</a> is a convenience annotation in a Spring Boot application.
      It enables Spring Boot's <a href="https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration">auto-configuration</a>, <a href="https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html">component scan</a>, and be able to define an extra configuration on their "application class".
</p>
<h3>Program entry point – main()</h3>
<p>
   The <a href="basic-syntax.md#program-entry-point">`main()`</a> function is the entry point to the application.
</p>
<p>
   It is declared as a <a href="functions.md#function-scope">top-level function</a> outside the `DemoApplication` class. The `main()` function invokes the Spring's `runApplication(*args)` function to start the application with the Spring Framework.
</p>
<h3>Variable arguments – args: Array&lt;String&gt;</h3>
<p>
   If you check the declaration of the `runApplication()` function, you will see that the parameter of the function is marked with <a href="functions.md#variable-number-of-arguments-varargs">`vararg` modifier</a>: `vararg args: String`.
        This means that you can pass a variable number of String arguments to the function.
</p>
<h3>The spread operator – (*args)</h3>
<p>
   The `args` is a parameter to the `main()` function declared as an array of Strings.
        Since there is an array of strings, and you want to pass its content to the function, use the spread operator (prefix the array with a star sign `*`).
</p>
   



## Create a controller

The application is ready to run, but let's update its logic first.

In the Spring application, a controller is used to handle the web requests.
In the same package with `DemoApplication.kt` file, create the `MessageController.kt` file with the
`MessageController` class as follows:

```kotlin
// MessageController.kt
package demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```
<h3>@RestController annotation</h3>
<p>
   You need to tell Spring that `MessageController` is a REST Controller, so you should mark it with the `@RestController` annotation.
</p>
<p>
   This annotation means this class will be picked up by the component scan because it's in the same package as our `DemoApplication` class.
</p>
<h3>@GetMapping annotation</h3>
<p>
   `@GetMapping` marks the functions of the REST controller that implement the endpoints corresponding to HTTP GET calls:
</p>
      ```kotlin
@GetMapping("/")
      fun index(@RequestParam("name") name: String) = "Hello, $name!"
```
<h3>@RequestParam annotation</h3>
<p>
   The function parameter `name` is marked with `@RequestParam` annotation. This annotation indicates that a method parameter should be bound to a web request parameter.
</p>
<p>
   Hence, if you access the application at the root and supply a request parameter called "name", like `/?name=&lt;your-value&gt;`, the parameter value will be used as an argument for invoking the `index()` function.
</p>
<h3>Single-expression functions – index()</h3>
<p>
   Since the `index()` function contains only one statement you can declare it as a <a href="functions.md#single-expression-functions">single-expression function</a>.
</p>
<p>
   This means the curly braces can be omitted and the body is specified after the equals sign `=`.
</p>
<h3>Type inference for function return types</h3>
<p>
   The `index()` function does not declare the return type explicitly. Instead, the compiler infers the return type by looking at the result of the statement on the right-hand side from the equals sign `=`.
</p>
<p>
   The type of `Hello, $name!` expression is `String`, hence the return type of the function is also `String`.
</p>
<h3>String templates – $name</h3>
<p>
   `Hello, $name!` expression is called a <a href="strings.md#string-templates"><i>String template</i></a> in Kotlin.
</p>
<p>
   String templates are String literals that contain embedded expressions.
</p>
<p>
   This is a convenient replacement for String concatenation operations.
</p>
   


## Run the application

The Spring application is now ready to run:

1. Click the green Run icon in the gutter beside the `main()` method:

    <img src="/img/run-spring-boot-application.png" alt="Run Spring Boot application" width="706" style={{verticalAlign: 'middle'}}/>
    
    > You can also run the `./gradlew bootRun` command in the terminal.
    >
    

    This starts the local server on your computer.

2. Once the application starts, open the following URL:

    ```text
    http://localhost:8080?name=John
    ```

    You should see "Hello, John!" printed as a response:

    <img src="/img/spring-application-response.png" alt="Spring Application response" width="706" style={{verticalAlign: 'middle'}}/>

## Next step

In the next part of the tutorial, you'll learn about Kotlin data classes and how you can use them in your application.

**[Proceed to the next chapter](jvm-spring-boot-add-data-class.md)**