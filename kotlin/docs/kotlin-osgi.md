---
title: Kotlin and OSGi
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




To enable Kotlin [OSGi](https://www.osgi.org/) support in your Kotlin project, include `kotlin-osgi-bundle` instead of
the regular Kotlin libraries. It is recommended to remove `kotlin-runtime`, `kotlin-stdlib` and `kotlin-reflect` dependencies
as `kotlin-osgi-bundle` already contains all of them. You also should pay attention in case when external Kotlin libraries
are included. Most regular Kotlin dependencies are not OSGi-ready, so you shouldn't use them and should remove them from
your project.

## Maven

To include the Kotlin OSGi bundle to a Maven project:

```xml
&lt;dependencies&gt;
    &lt;dependency&gt;
        &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
        &lt;artifactId&gt;kotlin-osgi-bundle&lt;/artifactId&gt;
        &lt;version&gt;${kotlin.version}&lt;/version&gt;
    &lt;/dependency&gt;
&lt;/dependencies&gt;
```

To exclude the standard library from external libraries (notice that "star exclusion" works in Maven 3 only):

```xml
&lt;dependency&gt;
    &lt;groupId&gt;some.group.id&lt;/groupId&gt;
    &lt;artifactId&gt;some.library&lt;/artifactId&gt;
    &lt;version&gt;some.library.version&lt;/version&gt;

    &lt;exclusions&gt;
        &lt;exclusion&gt;
            &lt;groupId&gt;org.jetbrains.kotlin&lt;/groupId&gt;
            &lt;artifactId&gt;*&lt;/artifactId&gt;
        &lt;/exclusion&gt;
    &lt;/exclusions&gt;
&lt;/dependency&gt;
```

## Gradle

To include `kotlin-osgi-bundle` to a Gradle project:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default={kotlin === "kotlin"}>

```kotlin
dependencies {
    implementation(kotlin("osgi-bundle"))
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default={groovy === "kotlin"}>

```groovy
dependencies {
    implementation "org.jetbrains.kotlin:kotlin-osgi-bundle:2.1.20"
}
```

</TabItem>
</Tabs>

To exclude default Kotlin libraries that comes as transitive dependencies you can use the following approach:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default={kotlin === "kotlin"}>

```kotlin
dependencies {
    implementation("some.group.id:some.library:someversion") {
        exclude(group = "org.jetbrains.kotlin")
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default={groovy === "kotlin"}>

```groovy
dependencies {
    implementation('some.group.id:some.library:someversion') {
        exclude group: 'org.jetbrains.kotlin'
    }
}
```

</TabItem>
</Tabs>

## FAQ

### Why not just add required manifest options to all Kotlin libraries

Even though it is the most preferred way to provide OSGi support, unfortunately it couldn't be done for now due to so called
["package split" issue](https://docs.osgi.org/specification/osgi.core/7.0.0/framework.module.html#d0e5999) that couldn't be easily eliminated and such a big change is
not planned for now. There is `Require-Bundle` feature but it is not the best option too and not recommended to use.
So it was decided to make a separate artifact for OSGi.

