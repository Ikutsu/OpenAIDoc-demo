---
title: Maven
---


Maven is a build system that you can use to build and manage any Java-based project.

## Configure and enable the plugin

The `kotlin-maven-plugin` compiles Kotlin sources and modules. Currently, only Maven v3 is supported.

In your `pom.xml` file, define the version of Kotlin you want to use in the `kotlin.version` property:

```xml
&lt;properties&gt;
    &lt;kotlin.version&gt;2.1.20&lt;/kotlin.version&gt;
&lt;/properties&gt;
```

To enable `kotlin-maven-plugin`, update your `pom.xml` file:

```xml
&lt;plugins&gt;
&lt;plugin&gt;
        &lt;artifactId&gt;kotlin-maven-plugin&lt;/artifactId&gt;
        &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
        &lt;version&gt;2.1.20&lt;/version&gt;
    &lt;/plugin&gt;
&lt;/plugins&gt;
```

### Use JDK 17

To use JDK 17, in your `.mvn/jvm.config` file, add:

```none
--add-opens=java.base/java.lang=ALL-UNNAMED
--add-opens=java.base/java.io=ALL-UNNAMED
```

## Declare repositories

By default, the `mavenCentral` repository is available for all Maven projects. To access artifacts in other repositories,
specify the ID and URL of each repository in the `<repositories>` element:

```xml
&lt;repositories&gt;
    &lt;repository&gt;
        &lt;id&gt;spring-repo&lt;/id&gt;
        &lt;url&gt;https://repo.spring.io/release&lt;/url&gt;
    &lt;/repository&gt;
&lt;/repositories&gt;
```

:::tip
If you declare `mavenLocal()` as a repository in a Gradle project, you may experience problems when switching 
between Gradle and Maven projects. For more information, see [Declare repositories](gradle-configure-project.md#declare-repositories).

:::


## Set dependencies

Kotlin has an extensive standard library that can be used in your applications.
To use the standard library in your project, add the following dependency to your `pom.xml` file:

```xml
&lt;dependencies&gt;
    &lt;dependency&gt;
        &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
        &lt;artifactId&gt;kotlin-stdlib&lt;/artifactId&gt;
        &lt;version&gt;${kotlin.version}&lt;/version&gt;
    &lt;/dependency&gt;
&lt;/dependencies&gt;
```

:::tip
If you're targeting JDK 7 or 8 with Kotlin versions older than:
* 1.8, use `kotlin-stdlib-jdk7` or `kotlin-stdlib-jdk8`, respectively.
* 1.2, use `kotlin-stdlib-jre7` or `kotlin-stdlib-jre8`, respectively.

:::
 

If your project uses [Kotlin reflection](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/index.html)
or testing facilities, you need to add the corresponding dependencies as well.
The artifact IDs are `kotlin-reflect` for the reflection library, and `kotlin-test` and `kotlin-test-junit`
for the testing libraries.

## Compile Kotlin-only source code

To compile source code, specify the source directories in the `<build>` tag:

```xml
&lt;build&gt;
    &lt;sourceDirectory&gt;${project.basedir}/src/main/kotlin&lt;/sourceDirectory&gt;
    &lt;testSourceDirectory&gt;${project.basedir}/src/test/kotlin&lt;/testSourceDirectory&gt;
&lt;/build&gt;
```

The Kotlin Maven Plugin needs to be referenced to compile the sources:

```xml
&lt;build&gt;
&lt;plugins&gt;
&lt;plugin&gt;
            &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
            &lt;artifactId&gt;kotlin-maven-plugin&lt;/artifactId&gt;
            &lt;version&gt;${kotlin.version}&lt;/version&gt;

            &lt;executions&gt;
                &lt;execution&gt;
                    &lt;id&gt;compile&lt;/id&gt;
                    &lt;goals&gt;
                        &lt;goal&gt;compile&lt;/goal&gt;
                    &lt;/goals&gt;
                &lt;/execution&gt;

                &lt;execution&gt;
                    &lt;id&gt;test-compile&lt;/id&gt;
                    &lt;goals&gt;
                        &lt;goal&gt;test-compile&lt;/goal&gt;
                    &lt;/goals&gt;
                &lt;/execution&gt;
            &lt;/executions&gt;
        &lt;/plugin&gt;
    &lt;/plugins&gt;
&lt;/build&gt;
```

Starting from Kotlin 1.8.20, you can replace the whole `<executions>` element above with `<extensions>true</extensions>`. 
Enabling extensions automatically adds the `compile`, `test-compile`, `kapt`, and `test-kapt` executions to your build, 
bound to their appropriate [lifecycle phases](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html). 
If you need to configure an execution, you need to specify its ID. You can find an example of this in the next section.

:::tip
If several build plugins overwrite the default lifecycle and you have also enabled the `extensions` option, the last plugin in 
the `<build>` section has priority in terms of lifecycle settings. All earlier changes to lifecycle settings are ignored.

:::


<!-- The following header is used in the Mari link service. If you wish to change it here, change the link there too -->

## Compile Kotlin and Java sources

To compile projects that include Kotlin and Java source code, invoke the Kotlin compiler before the Java compiler.
In Maven terms it means that `kotlin-maven-plugin` should be run before `maven-compiler-plugin` using the following method,
making sure that the `kotlin` plugin comes before the `maven-compiler-plugin` in your `pom.xml` file:

```xml
&lt;build&gt;
&lt;plugins&gt;
&lt;plugin&gt;
            &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
            &lt;artifactId&gt;kotlin-maven-plugin&lt;/artifactId&gt;
            &lt;version&gt;${kotlin.version}&lt;/version&gt;
            &lt;extensions&gt;true&lt;/extensions&gt; <!-- You can set this option 
            to automatically take information about lifecycles -->
            &lt;executions&gt;
                &lt;execution&gt;
                    &lt;id&gt;compile&lt;/id&gt;
                    &lt;goals&gt;
                        &lt;goal&gt;compile&lt;/goal&gt; <!-- You can skip the <goals> element 
                        if you enable extensions for the plugin -->
                    &lt;/goals&gt;
                    &lt;configuration&gt;
                        &lt;sourceDirs&gt;
                            &lt;sourceDir&gt;${project.basedir}/src/main/kotlin&lt;/sourceDir&gt;
                            &lt;sourceDir&gt;${project.basedir}/src/main/java&lt;/sourceDir&gt;
                        &lt;/sourceDirs&gt;
                    &lt;/configuration&gt;
                &lt;/execution&gt;
                &lt;execution&gt;
                    &lt;id&gt;test-compile&lt;/id&gt;
                    &lt;goals&gt; 
                        &lt;goal&gt;test-compile&lt;/goal&gt; <!-- You can skip the <goals> element 
                    if you enable extensions for the plugin -->
                    &lt;/goals&gt;
                    &lt;configuration&gt;
                        &lt;sourceDirs&gt;
                            &lt;sourceDir&gt;${project.basedir}/src/test/kotlin&lt;/sourceDir&gt;
                            &lt;sourceDir&gt;${project.basedir}/src/test/java&lt;/sourceDir&gt;
                        &lt;/sourceDirs&gt;
                    &lt;/configuration&gt;
                &lt;/execution&gt;
            &lt;/executions&gt;
        &lt;/plugin&gt;
&lt;plugin&gt;
            &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
            &lt;artifactId&gt;maven-compiler-plugin&lt;/artifactId&gt;
            &lt;version&gt;3.5.1&lt;/version&gt;
            &lt;executions&gt;
                <!-- Replacing default-compile as it is treated specially by Maven -->
                &lt;execution&gt;
                    &lt;id&gt;default-compile&lt;/id&gt;
&lt;phase&gt;none&lt;/phase&gt;
                &lt;/execution&gt;
                <!-- Replacing default-testCompile as it is treated specially by Maven -->
                &lt;execution&gt;
                    &lt;id&gt;default-testCompile&lt;/id&gt;
&lt;phase&gt;none&lt;/phase&gt;
                &lt;/execution&gt;
                &lt;execution&gt;
                    &lt;id&gt;java-compile&lt;/id&gt;
&lt;phase&gt;compile&lt;/phase&gt;
                    &lt;goals&gt;
                        &lt;goal&gt;compile&lt;/goal&gt;
                    &lt;/goals&gt;
                &lt;/execution&gt;
                &lt;execution&gt;
                    &lt;id&gt;java-test-compile&lt;/id&gt;
&lt;phase&gt;test-compile&lt;/phase&gt;
                    &lt;goals&gt;
                        &lt;goal&gt;testCompile&lt;/goal&gt;
                    &lt;/goals&gt;
                &lt;/execution&gt;
            &lt;/executions&gt;
        &lt;/plugin&gt;
    &lt;/plugins&gt;
&lt;/build&gt;
```

## Enable incremental compilation

To make your builds faster, you can enable incremental compilation by adding the `kotlin.compiler.incremental` property:

```xml
&lt;properties&gt;
    &lt;kotlin.compiler.incremental&gt;true&lt;/kotlin.compiler.incremental&gt;
&lt;/properties&gt;
```

Alternatively, run your build with the `-Dkotlin.compiler.incremental=true` option.

## Configure annotation processing

See [`kapt` – Using in Maven](kapt.md#use-in-maven).

## Create JAR file

To create a small JAR file containing just the code from your module, include the following under `build->plugins`
in your Maven `pom.xml` file, where `main.class` is defined as a property and points to the main Kotlin or Java class:

```xml
&lt;plugin&gt;
    &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
    &lt;artifactId&gt;maven-jar-plugin&lt;/artifactId&gt;
    &lt;version&gt;2.6&lt;/version&gt;
    &lt;configuration&gt;
        &lt;archive&gt;
            &lt;manifest&gt;
                &lt;addClasspath&gt;true&lt;/addClasspath&gt;
                &lt;mainClass&gt;${main.class}&lt;/mainClass&gt;
            &lt;/manifest&gt;
        &lt;/archive&gt;
    &lt;/configuration&gt;
&lt;/plugin&gt;
```

## Create a self-contained JAR file

To create a self-contained JAR file containing the code from your module along with its dependencies, include the following
under `build->plugins` in your Maven `pom.xml` file, where `main.class` is defined as a property and points to
the main Kotlin or Java class:

```xml
&lt;plugin&gt;
    &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
    &lt;artifactId&gt;maven-assembly-plugin&lt;/artifactId&gt;
    &lt;version&gt;2.6&lt;/version&gt;
    &lt;executions&gt;
        &lt;execution&gt;
            &lt;id&gt;make-assembly&lt;/id&gt;
&lt;phase&gt;package&lt;/phase&gt;
            &lt;goals&gt; &lt;goal&gt;single&lt;/goal&gt; &lt;/goals&gt;
            &lt;configuration&gt;
                &lt;archive&gt;
                    &lt;manifest&gt;
                        &lt;mainClass&gt;${main.class}&lt;/mainClass&gt;
                    &lt;/manifest&gt;
                &lt;/archive&gt;
                &lt;descriptorRefs&gt;
                    &lt;descriptorRef&gt;jar-with-dependencies&lt;/descriptorRef&gt;
                &lt;/descriptorRefs&gt;
            &lt;/configuration&gt;
        &lt;/execution&gt;
    &lt;/executions&gt;
&lt;/plugin&gt;
```

This self-contained JAR file can be passed directly to a JRE to run your application:

``` bash
java -jar target/mymodule-0.0.1-SNAPSHOT-jar-with-dependencies.jar
```

## Specify compiler options

Additional options and arguments for the compiler can be specified as tags under the `&lt;configuration&gt;` element of the
Maven plugin node:

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- If you want to enable automatic addition of executions to your build -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn>  <!-- Disable warnings -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- Enable strict mode for JSR-305 annotations -->
            ...
        </args>
    </configuration>
</plugin>
```

Many of the options can also be configured through properties:

```xml
<project ...>
<properties>
        <kotlin.compiler.languageVersion>2.1</kotlin.compiler.languageVersion>
    </properties>
</project>
```

The following attributes are supported:

### Attributes specific to JVM

| Name              | Property name                   | Description                                                                                          | Possible values                                  | Default value               |
|-------------------|---------------------------------|------------------------------------------------------------------------------------------------------|--------------------------------------------------|-----------------------------|
| `nowarn`          |                                 | Generate no warnings                                                                                 | true, false                                      | false                       |
| `languageVersion` | kotlin.compiler.languageVersion | Provide source compatibility with the specified version of Kotlin                                    | "1.8", "1.9", "2.0", "2.1", "2.2" (EXPERIMENTAL) |                             |
| `apiVersion`      | kotlin.compiler.apiVersion      | Allow using declarations only from the specified version of bundled libraries                        | "1.8", "1.9", "2.0", "2.1", "2.2" (EXPERIMENTAL) |                             |
| `sourceDirs`      |                                 | The directories containing the source files to compile                                               |                                                  | The project source roots    |
| `compilerPlugins` |                                 | Enabled compiler plugins                                                                             |                                                  | []                          |
| `pluginOptions`   |                                 | Options for compiler plugins                                                                         |                                                  | []                          |
| `args`            |                                 | Additional compiler arguments                                                                        |                                                  | []                          |
| `jvmTarget`       | `kotlin.compiler.jvmTarget`     | Target version of the generated JVM bytecode                                                         | "1.8", "9", "10", ..., "23"                      | "1.8" |
| `jdkHome`         | `kotlin.compiler.jdkHome`       | Include a custom JDK from the specified location into the classpath instead of the default JAVA_HOME |                                                  |                             |

## Use BOM

To use a Kotlin [Bill of Materials (BOM)](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms), 
write a dependency on [`kotlin-bom`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-bom):

```xml
<dependencyManagement>
    <dependencies>  
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-bom</artifactId>
            <version>2.1.20</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Generate documentation

The standard Javadoc generation plugin (`maven-javadoc-plugin`) doesn't support Kotlin code. To generate documentation 
for Kotlin projects, use [Dokka](https://github.com/Kotlin/dokka). Dokka supports mixed-language projects and can 
generate output in multiple formats, including standard Javadoc. For more information about how to configure Dokka in
your Maven project, see [Maven](dokka-maven.md).

## Enable OSGi support

[Learn how to enable OSGi support in your Maven project](kotlin-osgi.md#maven).
