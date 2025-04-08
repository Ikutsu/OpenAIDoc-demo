---
title: Running KSP from command line
---


KSP is a Kotlin compiler plugin and needs to run with Kotlin compiler. Download and extract them.

```bash
#!/bin/bash

# Kotlin compiler
wget https://github.com/JetBrains/kotlin/releases/download/v2.1.10/kotlin-compiler-2.1.10.zip
unzip kotlin-compiler-2.1.10.zip

# KSP
wget https://github.com/google/ksp/releases/download/2.1.10-1.0.31/artifacts.zip
unzip artifacts.zip
```

To run KSP with `kotlinc`, pass the `-Xplugin` option to `kotlinc`.

```
-Xplugin=/path/to/symbol-processing-cmdline-2.1.10-1.0.31.jar
```

This is different from the `symbol-processing-2.1.10-1.0.31.jar`, which is designed to be used with
`kotlin-compiler-embeddable` when running with Gradle.
The command line `kotlinc` needs `symbol-processing-cmdline-2.1.10-1.0.31.jar`.

You'll also need the API jar.

```
-Xplugin=/path/to/symbol-processing-api-2.1.10-1.0.31.jar
```

See the complete example:

```bash
#!/bin/bash

KSP_PLUGIN_ID=com.google.devtools.ksp.symbol-processing
KSP_PLUGIN_OPT=plugin:$KSP_PLUGIN_ID

KSP_PLUGIN_JAR=./com/google/devtools/ksp/symbol-processing-cmdline/2.1.10-1.0.31/symbol-processing-cmdline-2.1.10-1.0.31.jar
KSP_API_JAR=./com/google/devtools/ksp/symbol-processing-api/2.1.10-1.0.31/symbol-processing-api-2.1.10-1.0.31.jar
KOTLINC=./kotlinc/bin/kotlinc

AP=/path/to/your-processor.jar

mkdir out
$KOTLINC \
        -Xplugin=$KSP_PLUGIN_JAR \
        -Xplugin=$KSP_API_JAR \
        -Xallow-no-source-files \
        -P $KSP_PLUGIN_OPT:apclasspath=$AP \
        -P $KSP_PLUGIN_OPT:projectBaseDir=. \
        -P $KSP_PLUGIN_OPT:classOutputDir=./out \
        -P $KSP_PLUGIN_OPT:javaOutputDir=./out \
        -P $KSP_PLUGIN_OPT:kotlinOutputDir=./out \
        -P $KSP_PLUGIN_OPT:resourceOutputDir=./out \
        -P $KSP_PLUGIN_OPT:kspOutputDir=./out \
        -P $KSP_PLUGIN_OPT:cachesDir=./out \
        -P $KSP_PLUGIN_OPT:incremental=false \
        -P $KSP_PLUGIN_OPT:apoption=key1=value1 \
        -P $KSP_PLUGIN_OPT:apoption=key2=value2 \
        $*
```