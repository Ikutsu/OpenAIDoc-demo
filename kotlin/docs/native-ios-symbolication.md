---
title: Symbolicating iOS crash reports
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




Debugging an iOS application crash sometimes involves analyzing crash reports.
More info about crash reports can be found in the [Apple documentation](https://developer.apple.com/library/archive/technotes/tn2151/_index.html).

Crash reports generally require symbolication to become properly readable:
symbolication turns machine code addresses into human-readable source locations.
The document below describes some specific details of symbolicating crash reports
from iOS applications using Kotlin.

## Producing .dSYM for release Kotlin binaries

To symbolicate addresses in Kotlin code (e.g. for stack trace elements
corresponding to Kotlin code) `.dSYM` bundle for Kotlin code is required.

By default, Kotlin/Native compiler produces `.dSYM` for release
(i.e. optimized) binaries on Darwin platforms. This can be disabled with `-Xadd-light-debug=disable`
compiler flag. At the same time, this option is disabled by default for other platforms. To enable it, use the `-Xadd-light-debug=enable`
compiler option.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget> {
        binaries.all {
            freeCompilerArgs += "-Xadd-light-debug=\{enable|disable\}"
        }
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
kotlin {
    targets.withType(org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget) {
        binaries.all {
            freeCompilerArgs += "-Xadd-light-debug=\{enable|disable\}"
        }
    }
}
```

</TabItem>
</Tabs>

In projects created from IntelliJ IDEA or AppCode templates these `.dSYM` bundles
are then discovered by Xcode automatically.

## Make frameworks static when using rebuild from bitcode

Rebuilding Kotlin-produced framework from bitcode invalidates the original `.dSYM`.
If it is performed locally, make sure the updated `.dSYM` is used when symbolicating
crash reports.

If rebuilding is performed on App Store side, then `.dSYM` of rebuilt *dynamic* framework
seems discarded and not downloadable from App Store Connect.
In this case, it may be required to make the framework static.

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget> {
        binaries.withType<org.jetbrains.kotlin.gradle.plugin.mpp.Framework> {
            isStatic = true
        }
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default>

```groovy
kotlin {
    targets.withType(org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget) {
        binaries.withType(org.jetbrains.kotlin.gradle.plugin.mpp.Framework) {
            isStatic = true
        }
    }
}
```

</TabItem>
</Tabs>
