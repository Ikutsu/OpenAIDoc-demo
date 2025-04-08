---
title: Ant
---


## Getting the Ant tasks

Kotlin provides three tasks for Ant:

* `kotlinc`: Kotlin compiler targeting the JVM
* `kotlin2js`: Kotlin compiler targeting JavaScript
* `withKotlin`: Task to compile Kotlin files when using the standard *javac* Ant task

These tasks are defined in the *kotlin-ant.jar* library which is located in the `lib` folder 
in the [Kotlin Compiler](https://github.com/JetBrains/kotlin/releases/tag/v2.1.20) archive. Ant version 1.8.2+ is required.

## Targeting JVM with Kotlin-only source

When the project consists of exclusively Kotlin source code, the easiest way to compile the project is to use the `kotlinc` task:

```xml
&lt;project name="Ant Task Test" default="build"&gt;
    &lt;typedef resource="org/jetbrains/kotlin/ant/antlib.xml" classpath="${kotlin.lib}/kotlin-ant.jar"/&gt;

    &lt;target name="build"&gt;
        &lt;kotlinc src="hello.kt" output="hello.jar"/&gt;
    &lt;/target&gt;
&lt;/project&gt;
```

where `${kotlin.lib}` points to the folder where the Kotlin standalone compiler was unzipped.

## Targeting JVM with Kotlin-only source and multiple roots

If a project consists of multiple source roots, use `src` as elements to define paths:

```xml
&lt;project name="Ant Task Test" default="build"&gt;
    &lt;typedef resource="org/jetbrains/kotlin/ant/antlib.xml" classpath="${kotlin.lib}/kotlin-ant.jar"/&gt;

    &lt;target name="build"&gt;
        &lt;kotlinc output="hello.jar"&gt;
            &lt;src path="root1"/&gt;
            &lt;src path="root2"/&gt;
        &lt;/kotlinc&gt;
    &lt;/target&gt;
&lt;/project&gt;
```

## Targeting JVM with Kotlin and Java source

If a project consists of both Kotlin and Java source code, while it is possible to use `kotlinc`, to avoid repetition of
task parameters, it is recommended to use `withKotlin` task:

```xml
&lt;project name="Ant Task Test" default="build"&gt;
    &lt;typedef resource="org/jetbrains/kotlin/ant/antlib.xml" classpath="${kotlin.lib}/kotlin-ant.jar"/&gt;

    &lt;target name="build"&gt;
        &lt;delete dir="classes" failonerror="false"/&gt;
        &lt;mkdir dir="classes"/&gt;
        &lt;javac destdir="classes" includeAntRuntime="false" srcdir="src"&gt;
            &lt;withKotlin/&gt;
        &lt;/javac&gt;
        &lt;jar destfile="hello.jar"&gt;
            &lt;fileset dir="classes"/&gt;
        &lt;/jar&gt;
    &lt;/target&gt;
&lt;/project&gt;
```

You can also specify the name of the module being compiled as the `moduleName` attribute:

```xml
&lt;withKotlin moduleName="myModule"/&gt;
```

## Targeting JavaScript with single source folder

```xml
&lt;project name="Ant Task Test" default="build"&gt;
    &lt;typedef resource="org/jetbrains/kotlin/ant/antlib.xml" classpath="${kotlin.lib}/kotlin-ant.jar"/&gt;

    &lt;target name="build"&gt;
        &lt;kotlin2js src="root1" output="out.js"/&gt;
    &lt;/target&gt;
&lt;/project&gt;
```

## Targeting JavaScript with Prefix, PostFix and sourcemap options

```xml
&lt;project name="Ant Task Test" default="build"&gt;
    &lt;taskdef resource="org/jetbrains/kotlin/ant/antlib.xml" classpath="${kotlin.lib}/kotlin-ant.jar"/&gt;

    &lt;target name="build"&gt;
        &lt;kotlin2js src="root1" output="out.js" outputPrefix="prefix" outputPostfix="postfix" sourcemap="true"/&gt;
    &lt;/target&gt;
&lt;/project&gt;
```

## Targeting JavaScript with single source folder and metaInfo option

The `metaInfo` option is useful, if you want to distribute the result of translation as a Kotlin/JavaScript library.
If `metaInfo` was set to `true`, then during compilation additional JS file with
binary metadata will be created. This file should be distributed together with the
result of translation:

```xml
&lt;project name="Ant Task Test" default="build"&gt;
    &lt;typedef resource="org/jetbrains/kotlin/ant/antlib.xml" classpath="${kotlin.lib}/kotlin-ant.jar"/&gt;

    &lt;target name="build"&gt;
        <!-- out.meta.js will be created, which contains binary metadata -->
        &lt;kotlin2js src="root1" output="out.js" metaInfo="true"/&gt;
    &lt;/target&gt;
&lt;/project&gt;
```

## References

Complete list of elements and attributes are listed below:

### Attributes common for kotlinc and kotlin2js

| Name | Description | Required | Default Value |
|------|-------------|----------|---------------|
| `src`  | Kotlin source file or directory to compile | Yes |  |
| `nowarn` | Suppresses all compilation warnings | No | false |
| `noStdlib` | Does not include the Kotlin standard library into the classpath | No | false |
| `failOnError` | Fails the build if errors are detected during the compilation | No | true |

### kotlinc attributes

| Name | Description | Required | Default Value |
|------|-------------|----------|---------------|
| `output`  | Destination directory or .jar file name | Yes |  |
| `classpath`  | Compilation class path | No |  |
| `classpathref`  | Compilation class path reference | No |  |
| `includeRuntime`  | If `output` is a .jar file, whether Kotlin runtime library is included in the jar | No | true  |
| `moduleName` | Name of the module being compiled | No | The name of the target (if specified) or the project |

### kotlin2js attributes

| Name | Description | Required |
|------|-------------|----------|
| `output`  | Destination file | Yes |
| `libraries`  | Paths to Kotlin libraries | No |
| `outputPrefix`  | Prefix to use for generated JavaScript files | No |
| `outputSuffix` | Suffix to use for generated JavaScript files | No |
| `sourcemap`  | Whether sourcemap file should be generated | No |
| `metaInfo`  | Whether metadata file with binary descriptors should be generated | No |
| `main`  | Should compiler generated code call the main function | No |

### Passing raw compiler arguments

To pass custom raw compiler arguments, you can use `<compilerarg>` elements with either `value` or `line` attributes.
This can be done within the `<kotlinc>`, `<kotlin2js>`, and `<withKotlin>` task elements, as follows:

```xml
&lt;kotlinc src="${test.data}/hello.kt" output="${temp}/hello.jar"&gt;
    &lt;compilerarg value="-Xno-inline"/&gt;
    &lt;compilerarg line="-Xno-call-assertions -Xno-param-assertions"/&gt;
    &lt;compilerarg value="-Xno-optimize"/&gt;
&lt;/kotlinc&gt;
```

The full list of arguments that can be used is shown when you run `kotlinc -help`.