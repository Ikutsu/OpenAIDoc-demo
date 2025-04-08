---
title: Lombok compiler plugin
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




:::tip
The Lombok compiler plugin is [Experimental](components-stability.md).
It may be dropped or changed at any time. Use it only for evaluation purposes.
We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-7112).

:::


The Kotlin Lombok compiler plugin allows the generation and use of Java's Lombok declarations by Kotlin code 
in the same mixed Java/Kotlin module.
If you call such declarations from another module, then you don't need to use this plugin for the compilation of 
that module.

The Lombok compiler plugin cannot replace [Lombok](https://projectlombok.org/), but it helps Lombok work in mixed Java/Kotlin modules.
Thus, you still need to configure Lombok as usual when using this plugin. 
Learn more about [how to configure the Lombok compiler plugin](#using-the-lombok-configuration-file).

## Supported annotations

The plugin supports the following annotations:
* `@Getter`, `@Setter`
* `@Builder`, `@SuperBuilder`
* `@NoArgsConstructor`, `@RequiredArgsConstructor`, and `@AllArgsConstructor`
* `@Data`
* `@With`
* `@Value`

We're continuing to work on this plugin. To find out the detailed current state, visit the [Lombok compiler plugin's README](https://github.com/JetBrains/kotlin/tree/master/plugins/lombok).

Currently, we don't have plans to support the `@Tolerate` annotation. However, we can consider this if you vote
for the [@Tolerate issue](https://youtrack.jetbrains.com/issue/KT-53564/Kotlin-Lombok-Support-Tolerate) in YouTrack.

:::tip
Kotlin compiler ignores Lombok annotations if you use them in Kotlin code.

:::


## Gradle

Apply the `kotlin-plugin-lombok` Gradle plugin in the `build.gradle(.kts)` file:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    kotlin("plugin.lombok") version "2.1.20"
    id("io.freefair.lombok") version "8.13"
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.lombok' version '2.1.20'
    id 'io.freefair.lombok' version '8.13'
}
```

</TabItem>
</Tabs>

See this [test project with examples of the Lombok compiler plugin in use](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/nokapt).

### Using the Lombok configuration file

If you use a [Lombok configuration file](https://projectlombok.org/features/configuration) `lombok.config`, you need to set the file's path so that the plugin can find it. 
The path must be relative to the module's directory. 
For example, add the following code to your `build.gradle(.kts)` file:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
kotlinLombok {
    lombokConfigurationFile(file("lombok.config"))
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>


```groovy
kotlinLombok {
    lombokConfigurationFile file("lombok.config")
}
```

</TabItem>
</Tabs>

See this [test project with examples of the Lombok compiler plugin and `lombok.config` in use](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/withconfig).

## Maven

To use the Lombok compiler plugin, add the plugin `lombok` to the `compilerPlugins` section and the dependency 
`kotlin-maven-lombok` to the `dependencies` section. 
If you use a [Lombok configuration file](https://projectlombok.org/features/configuration) `lombok.config`,
provide a path to it to the plugin in the `pluginOptions`. Add the following lines to the `pom.xml` file:

```xml
&lt;plugin&gt;
    &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
    &lt;artifactId&gt;kotlin-maven-plugin&lt;/artifactId&gt;
    &lt;version&gt;${kotlin.version}&lt;/version&gt;
    &lt;configuration&gt;
        &lt;compilerPlugins&gt;
&lt;plugin&gt;lombok&lt;/plugin&gt;
        &lt;/compilerPlugins&gt;
&lt;pluginOptions&gt;
            &lt;option&gt;lombok:config=${project.basedir}/lombok.config&lt;/option&gt;
        &lt;/pluginOptions&gt;
    &lt;/configuration&gt;
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
            &lt;artifactId&gt;kotlin-maven-lombok&lt;/artifactId&gt;
            &lt;version&gt;${kotlin.version}&lt;/version&gt;
        &lt;/dependency&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.projectlombok&lt;/groupId&gt;
            &lt;artifactId&gt;lombok&lt;/artifactId&gt;
            &lt;version&gt;1.18.20&lt;/version&gt;
            &lt;scope&gt;provided&lt;/scope&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/plugin&gt;
```

See this [test project example of the Lombok compiler plugin and `lombok.config` in use](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/nokapt).

## Using with kapt

By default, the [kapt](kapt.md) compiler plugin runs all annotation processors and disables annotation processing by javac.
To run [Lombok](https://projectlombok.org/) along with kapt, set up kapt to keep javac's annotation processors working.

If you use Gradle, add the option to the `build.gradle(.kts)` file:

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

In Maven, use the following settings to launch Lombok with Java's compiler:

```xml
&lt;plugin&gt;
    &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
    &lt;artifactId&gt;maven-compiler-plugin&lt;/artifactId&gt;
    &lt;version&gt;3.5.1&lt;/version&gt;
    &lt;configuration&gt;
        &lt;source&gt;1.8&lt;/source&gt;
        &lt;target&gt;1.8&lt;/target&gt;
        &lt;annotationProcessorPaths&gt;
            &lt;annotationProcessorPath&gt;
                &lt;groupId&gt;org.projectlombok&lt;/groupId&gt;
                &lt;artifactId&gt;lombok&lt;/artifactId&gt;
                &lt;version&gt;${lombok.version}&lt;/version&gt;
            &lt;/annotationProcessorPath&gt;
        &lt;/annotationProcessorPaths&gt;
    &lt;/configuration&gt;
&lt;/plugin&gt;    
```

The Lombok compiler plugin works correctly with [kapt](kapt.md) if annotation processors don't depend on the code generated by Lombok.

Look through the test project examples of kapt and the Lombok compiler plugin in use:
* Using [Gradle](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/lombokProject/yeskapt).
* Using [Maven](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/yeskapt)

## Command-line compiler

Lombok compiler plugin JAR is available in the binary distribution of the Kotlin compiler. You can attach the plugin
by providing the path to its JAR file using the `Xplugin` kotlinc option:

```bash
-Xplugin=$KOTLIN_HOME/lib/lombok-compiler-plugin.jar
```

If you want to use the `lombok.config` file, replace `<PATH_TO_CONFIG_FILE>` with a path to your `lombok.config`:

```bash
# The plugin option format is: "-P plugin:&lt;plugin id&gt;:&lt;key&gt;=&lt;value&gt;". 
# Options can be repeated.

-P plugin:org.jetbrains.kotlin.lombok:config=&lt;PATH_TO_CONFIG_FILE&gt;
```