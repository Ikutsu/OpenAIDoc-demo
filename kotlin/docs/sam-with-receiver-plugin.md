---
title: SAM-with-receiver compiler plugin
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




The *sam-with-receiver* compiler plugin makes the first parameter of the annotated Java "single abstract method" (SAM)
interface method a receiver in Kotlin. This conversion only works when the SAM interface is passed as a Kotlin lambda,
both for SAM adapters and SAM constructors (see the [SAM conversions documentation](java-interop.md#sam-conversions) for more details).

Here is an example:

```java
public @interface SamWithReceiver {}

@SamWithReceiver
public interface TaskRunner {
    void run(Task task);
}
```

```kotlin
fun test(context: TaskContext) {
    val runner = TaskRunner {
        // Here 'this' is an instance of 'Task'

        println("$name is started")
        context.executeTask(this)
        println("$name is finished")
    }
}
```

## Gradle

The usage is the same to [all-open](all-open-plugin.md) and [no-arg](no-arg-plugin.md), except the fact that sam-with-receiver
does not have any built-in presets, and you need to specify your own list of special-treated annotations.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default={kotlin === "kotlin"}>

```kotlin
plugins {
    kotlin("plugin.sam.with.receiver") version "2.1.20"
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default={groovy === "kotlin"}>

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.sam.with.receiver" version "2.1.20"
}
```

</TabItem>
</Tabs>

Then specify the list of SAM-with-receiver annotations:

```groovy
samWithReceiver {
    annotation("com.my.SamWithReceiver")
}
```

## Maven

```xml
&lt;plugin&gt;
    &lt;artifactId&gt;kotlin-maven-plugin&lt;/artifactId&gt;
    &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
    &lt;version&gt;${kotlin.version}&lt;/version&gt;

    &lt;configuration&gt;
        &lt;compilerPlugins&gt;
&lt;plugin&gt;sam-with-receiver&lt;/plugin&gt;
        &lt;/compilerPlugins&gt;
&lt;pluginOptions&gt;
            &lt;option&gt;
                sam-with-receiver:annotation=com.my.SamWithReceiver
            &lt;/option&gt;
        &lt;/pluginOptions&gt;
    &lt;/configuration&gt;

    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
            &lt;artifactId&gt;kotlin-maven-sam-with-receiver&lt;/artifactId&gt;
            &lt;version&gt;${kotlin.version}&lt;/version&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/plugin&gt;
```

## Command-line compiler

Add the plugin JAR file to the compiler plugin classpath and specify the list of sam-with-receiver annotations:

```bash
-Xplugin=$KOTLIN_HOME/lib/sam-with-receiver-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.samWithReceiver:annotation=com.my.SamWithReceiver
```
