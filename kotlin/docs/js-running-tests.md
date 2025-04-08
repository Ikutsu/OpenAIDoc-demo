---
title: Run tests in Kotlin/JS
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




The Kotlin Multiplatform Gradle plugin lets you run tests through a variety of test runners that can be specified via the Gradle
configuration.

When you create a multiplatform project, you can add test dependencies to all the source sets, including the JavaScript
target, by using a single dependency in `commonTest`:

<Tabs groupId="build-script">
<TabItem value="kotlin" label="Kotlin" default={kotlin === "kotlin"}>

```kotlin
// build.gradle.kts

kotlin {
    sourceSets {
         commonTest.dependencies {
            implementation(kotlin("test")) // This makes test annotations and functionality available in JS
        }
    }
}
```

</TabItem>
<TabItem value="groovy" label="Groovy" default={groovy === "kotlin"}>

```groovy
// build.gradle

kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // This makes test annotations and functionality available in JS
            }
        }
    }
}
```

</TabItem>
</Tabs>

You can tune how tests are executed in Kotlin/JS by adjusting the settings available in the `testTask` block in the Gradle
build script. For example, using the Karma test runner together with a headless instance of Chrome and an instance of
Firefox looks like this:

```kotlin
kotlin {
    js {
        browser {
            testTask {
                useKarma {
                    useChromeHeadless()
                    useFirefox()
                }
            }
        }
    }
}
```

For a detailed description of the available functionality, check out the Kotlin/JS reference on [configuring the test task](js-project-setup.md#test-task). 

Please note that by default, no browsers are bundled with the plugin. This means that you'll have to ensure they're
available on the target system.

To check that tests are executed properly, add a file `src/jsTest/kotlin/AppTest.kt` and fill it with this content:

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

class AppTest {
    @Test
    fun thingsShouldWork() {
        assertEquals(listOf(1,2,3).reversed(), listOf(3,2,1))
    }

    @Test
    fun thingsShouldBreak() {
        assertEquals(listOf(1,2,3).reversed(), listOf(1,2,3))
    }
}
```

To run the tests in the browser, execute the `jsBrowserTest` task via IntelliJ IDEA, or use the gutter icons to execute all
or individual tests:

<img src="/img/browsertest-task.png" alt="Gradle browserTest task" width="700" style={{verticalAlign: 'middle'}}/>

Alternatively, if you want to run the tests via the command line, use the Gradle wrapper:

```bash
./gradlew jsBrowserTest
```

After running the tests from IntelliJ IDEA, the **Run** tool window will show the test results. You can click failed tests
to see their stack trace, and navigate to the corresponding test implementation via a double click.

<img src="/img/test-stacktrace-ide.png" alt="Test results in IntelliJ IDEA" width="700" style={{verticalAlign: 'middle'}}/>

After each test run, regardless of how you executed the test, you can find a properly formatted test report from Gradle
in `build/reports/tests/jsBrowserTest/index.html`. Open this file in a browser to see another overview of the test results:

<img src="/img/test-summary.png" alt="Gradle test summary" width="700" style={{verticalAlign: 'middle'}}/>

If you are using the set of example tests shown in the snippet above, one test passes, and one test breaks, which gives 
the resulting total of 50% successful tests. To get more information about individual test cases, you can navigate via
the provided hyperlinks:

<img src="/img/failed-test.png" alt="Stacktrace of failed test in the Gradle summary" width="700" style={{verticalAlign: 'middle'}}/>