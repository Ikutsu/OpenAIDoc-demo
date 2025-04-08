---
title: KSP quickstart
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




For a quick start, you can create your own processor or get a [sample one](https://github.com/google/ksp/tree/main/examples/playground).

## Add a processor

To add a processor, you need to include the KSP Gradle Plugin and add a dependency on the processor:

1. Add the KSP Gradle Plugin `com.google.devtools.ksp` to your `build.gradle(.kts)` file:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    id("com.google.devtools.ksp") version "2.1.10-1.0.31"
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'com.google.devtools.ksp' version '2.1.10-1.0.31'
}
```

</TabItem>
</Tabs>

2. Add a dependency on the processor.
This example uses [Dagger](https://dagger.dev/dev-guide/ksp.html). Replace it with the processor you want to add.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
dependencies {
    implementation("com.google.dagger:dagger-compiler:2.51.1")
    ksp("com.google.dagger:dagger-compiler:2.51.1")
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
dependencies {
    implementation 'com.google.dagger:dagger-compiler:2.51.1'
    ksp 'com.google.dagger:dagger-compiler:2.51.1'
}
```

</TabItem>
</Tabs>

3. Run `./gradlew build`. You can find the generated code in the `build/generated/ksp` directory.

Here is a full example:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    id("com.google.devtools.ksp") version "2.1.10-1.0.31"
    kotlin("jvm")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    implementation("com.google.dagger:dagger-compiler:2.51.1")
    ksp("com.google.dagger:dagger-compiler:2.51.1")
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'com.google.devtools.ksp' version '2.1.10-1.0.31'
    id 'org.jetbrains.kotlin.jvm' version '2.1.20'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.jetbrains.kotlin:kotlin-stdlib:2.1.20'
    implementation 'com.google.dagger:dagger-compiler:2.51.1'
    ksp 'com.google.dagger:dagger-compiler:2.51.1'
}
```

</TabItem>
</Tabs>

## Create a processor of your own

1. Create an empty gradle project.
2. Specify version `2.1.10` of the Kotlin plugin in the root project for use in other project modules:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    kotlin("jvm") version "2.1.10" apply false
}

buildscript {
    dependencies {
        classpath(kotlin("gradle-plugin", version = "2.1.10"))
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'org.jetbrains.kotlin.jvm' version '2.1.10' apply false
}

buildscript {
    dependencies {
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.10'
    }
}
```

</TabItem>
</Tabs>

3. Add a module for hosting the processor.

4. In the module's build script, apply Kotlin plugin and add the KSP API to the `dependencies` block.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    kotlin("jvm")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.google.devtools.ksp:symbol-processing-api:2.1.10-1.0.31")
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'org.jetbrains.kotlin.jvm' version '2.1.20'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.google.devtools.ksp:symbol-processing-api:2.1.10-1.0.31'
}
```

</TabItem>
</Tabs>

5. You'll need to implement [`com.google.devtools.ksp.processing.SymbolProcessor`](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/processing/SymbolProcessor.kt)
   and [`com.google.devtools.ksp.processing.SymbolProcessorProvider`](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/processing/SymbolProcessorProvider.kt).
   Your implementation of `SymbolProcessorProvider` will be loaded as a service to instantiate the `SymbolProcessor` you implement.
   Note the following:
    * Implement [`SymbolProcessorProvider.create()`](https://github.com/google/ksp/blob/master/api/src/main/kotlin/com/google/devtools/ksp/processing/SymbolProcessorProvider.kt)
      to create a `SymbolProcessor`. Pass dependencies that your processor needs (such as `CodeGenerator`, processor options)
      through the parameters of `SymbolProcessorProvider.create()`.
    * Your main logic should be in the [`SymbolProcessor.process()`](https://github.com/google/ksp/blob/master/api/src/main/kotlin/com/google/devtools/ksp/processing/SymbolProcessor.kt) method.
    * Use `resolver.getSymbolsWithAnnotation()` to get the symbols you want to process, given the fully-qualified name of
      an annotation.
    * A common use case for KSP is to implement a customized visitor (interface `com.google.devtools.ksp.symbol.KSVisitor`)
      for operating on symbols. A simple template visitor is `com.google.devtools.ksp.symbol.KSDefaultVisitor`.
    * For sample implementations of the `SymbolProcessorProvider` and `SymbolProcessor` interfaces, see the following files
      in the sample project.
        * `src/main/kotlin/BuilderProcessor.kt`
        * `src/main/kotlin/TestProcessor.kt`
    * After writing your own processor, register your processor provider to the package by including its fully-qualified
      name in `src/main/resources/META-INF/services/com.google.devtools.ksp.processing.SymbolProcessorProvider`.

## Use your own processor in a project

1. Create another module that contains a workload where you want to try out your processor.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
pluginManagement { 
    repositories { 
        gradlePluginPortal()
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
pluginManagement {
    repositories {
        gradlePluginPortal()
    }
}
 ```

</TabItem>
</Tabs>

2. In the module's build script, apply the `com.google.devtools.ksp` plugin with the specified version and
   add your processor to the list of dependencies.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    id("com.google.devtools.ksp") version "2.1.10-1.0.31"
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    implementation(project(":test-processor"))
    ksp(project(":test-processor"))
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'com.google.devtools.ksp' version '2.1.10-1.0.31'
}

dependencies {
    implementation 'org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version'
    implementation project(':test-processor')
    ksp project(':test-processor')
}
```

</TabItem>
</Tabs>

3. Run `./gradlew build`. You can find the generated code under
   `build/generated/ksp`.

Here's a sample build script to apply the KSP plugin to a workload:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    id("com.google.devtools.ksp") version "2.1.10-1.0.31"
    kotlin("jvm") 
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    implementation(project(":test-processor"))
    ksp(project(":test-processor"))
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'com.google.devtools.ksp' version '2.1.10-1.0.31'
    id 'org.jetbrains.kotlin.jvm' version '2.1.20'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.jetbrains.kotlin:kotlin-stdlib:2.1.20'
    implementation project(':test-processor')
    ksp project(':test-processor')
}
```

</TabItem>
</Tabs>

## Pass options to processors

Processor options in `SymbolProcessorEnvironment.options` are specified in gradle build scripts:

```none
ksp {
    arg("option1", "value1")
    arg("option2", "value2")
    ...
}
```

## Make IDE aware of generated code

:::tip
Generated source files are registered automatically since KSP 1.8.0-1.0.9.
If you're using KSP 1.0.9 or newer and don't need to make the IDE aware of generated resources,
feel free to skip this section.

:::


By default, IntelliJ IDEA or other IDEs don't know about the generated code. So it will mark references to generated
symbols unresolvable. To make an IDE be able to reason about the generated symbols, mark the
following paths as generated source roots:

```text
build/generated/ksp/main/kotlin/
build/generated/ksp/main/java/
```

If your IDE supports resource directories, also mark the following one:

```text
build/generated/ksp/main/resources/
```

It may also be necessary to configure these directories in your KSP consumer module's build script:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
kotlin {
    sourceSets.main {
        kotlin.srcDir("build/generated/ksp/main/kotlin")
    }
    sourceSets.test {
        kotlin.srcDir("build/generated/ksp/test/kotlin")
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
kotlin {
    sourceSets {
        main.kotlin.srcDirs += 'build/generated/ksp/main/kotlin'
        test.kotlin.srcDirs += 'build/generated/ksp/test/kotlin'
    }
}
```

</TabItem>
</Tabs>

If you are using IntelliJ IDEA and KSP in a Gradle plugin then the above snippet will give the following warning:
```text
Execution optimizations have been disabled for task ':publishPluginJar' to ensure correctness due to the following reasons:
Gradle detected a problem with the following location: '../build/generated/ksp/main/kotlin'. 
Reason: Task ':publishPluginJar' uses this output of task ':kspKotlin' without declaring an explicit or implicit dependency.
```

In this case, use the following script instead:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    // ...
    idea
}

idea {
    module {
        // Not using += due to https://github.com/gradle/gradle/issues/8749
        sourceDirs = sourceDirs + file("build/generated/ksp/main/kotlin") // or tasks["kspKotlin"].destination
        testSourceDirs = testSourceDirs + file("build/generated/ksp/test/kotlin")
        generatedSourceDirs = generatedSourceDirs + file("build/generated/ksp/main/kotlin") + file("build/generated/ksp/test/kotlin")
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    // ...
    id 'idea'
}

idea {
    module {
        // Not using += due to https://github.com/gradle/gradle/issues/8749
        sourceDirs = sourceDirs + file('build/generated/ksp/main/kotlin') // or tasks["kspKotlin"].destination
        testSourceDirs = testSourceDirs + file('build/generated/ksp/test/kotlin')
        generatedSourceDirs = generatedSourceDirs + file('build/generated/ksp/main/kotlin') + file('build/generated/ksp/test/kotlin')
    }
}
```

</TabItem>
</Tabs>
