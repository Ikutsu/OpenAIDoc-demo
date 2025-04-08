---
title: Configure your build for EAP
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




:::info
<p>
   No preview versions are currently available
</p>
    <!-- <p>Latest Kotlin EAP release: <strong>2.1.20-RC3</strong></p> -->
<p>
   <a href="eap.md#build-details">Explore Kotlin EAP release details</a>
</p>

:::

To configure your build to use the EAP version of Kotlin, you need to: 

* Specify the EAP version of Kotlin. [Available EAP versions are listed here](eap.md#build-details).
* Change the versions of dependencies to EAP ones.
The EAP version of Kotlin may not work with the libraries of the previously released version. 

The following procedures describe how to configure your build in Gradle and Maven:

* [Configure in Gradle](#configure-in-gradle)
* [Configure in Maven](#configure-in-maven)

## Configure in Gradle 

This section describes how you can:

* [Adjust the Kotlin version](#adjust-the-kotlin-version)
* [Adjust versions in dependencies](#adjust-versions-in-dependencies)

### Adjust the Kotlin version

In the `plugins` block within `build.gradle(.kts)`, change the `KOTLIN-EAP-VERSION` to the actual EAP version,
such as `2.1.20-RC3`. [Available EAP versions are listed here](eap.md#build-details).

Alternatively, you can specify the EAP version in the `pluginManagement` block in `settings.gradle(.kts)` – see [Gradle documentation](https://docs.gradle.org/current/userguide/plugins.html#sec:plugin_version_management) for details.

Here is an example for the Multiplatform project.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
plugins {
    java
    kotlin("multiplatform") version "KOTLIN-EAP-VERSION"
}

repositories {
    mavenCentral()
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
plugins {
    id 'java'
    id 'org.jetbrains.kotlin.multiplatform' version 'KOTLIN-EAP-VERSION'
}

repositories {
    mavenCentral()
}
```

</TabItem>
</Tabs>

### Adjust versions in dependencies

If you use kotlinx libraries in your project, your versions of the libraries may not be compatible with the EAP version of Kotlin.

To resolve this issue, you need to specify the version of a compatible library in dependencies. For a list of compatible libraries, 
see [EAP build details](eap.md#build-details). 

:::tip
In most cases we create libraries only for the first EAP version of a specific release and these libraries work with the subsequent EAP versions for this release.

If there are incompatible changes in next EAP versions, we release a new version of the library.

:::


Here is an example.

For the **kotlinx.coroutines** library, add the version number – `1.10.1` – that is compatible with `2.1.20-RC3`. 

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.1")
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
dependencies {
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.1"
}
```

</TabItem>
</Tabs>

## Configure in Maven

In the sample Maven project definition, replace `KOTLIN-EAP-VERSION` with the actual version, such as `2.1.20-RC3`.
[Available EAP versions are listed here](eap.md#build-details).

```xml
&lt;project ...&gt;
&lt;properties&gt;
        &lt;kotlin.version&gt;KOTLIN-EAP-VERSION&lt;/kotlin.version&gt;
    &lt;/properties&gt;

    &lt;repositories&gt;
        &lt;repository&gt;
           &lt;id&gt;mavenCentral&lt;/id&gt;
           &lt;url&gt;https://repo1.maven.org/maven2/&lt;/url&gt;
        &lt;/repository&gt;
    &lt;/repositories&gt;
&lt;pluginRepositories&gt;
&lt;pluginRepository&gt;
          &lt;id&gt;mavenCentral&lt;/id&gt;
          &lt;url&gt;https://repo1.maven.org/maven2/&lt;/url&gt;
       &lt;/pluginRepository&gt;
    &lt;/pluginRepositories&gt;

    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
            &lt;artifactId&gt;kotlin-stdlib&lt;/artifactId&gt;
            &lt;version&gt;${kotlin.version}&lt;/version&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;

    &lt;build&gt;
&lt;plugins&gt;
&lt;plugin&gt;
                &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
                &lt;artifactId&gt;kotlin-maven-plugin&lt;/artifactId&gt;
                &lt;version&gt;${kotlin.version}&lt;/version&gt;
                ...
            &lt;/plugin&gt;
        &lt;/plugins&gt;
    &lt;/build&gt;
&lt;/project&gt;
```

## If you run into any problems

* Report an issue to [our issue tracker, YouTrack](https://kotl.in/issue).
* Find help in the [#eap channel in Kotlin Slack](https://app.slack.com/client/T09229ZC6/C0KLZSCHF) ([get an invite](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)).
* Roll back to the latest stable version: [change it in your build script file](#adjust-the-kotlin-version).