---
title: Direct integration
---
:::info

   This is a local integration method. It can work for you if:<br/>

   * You've already set up a Kotlin Multiplatform project targeting iOS on your local machine.
   * Your Kotlin Multiplatform project does not have CocoaPods dependencies.<br/>

   [Choose the integration method that suits you best](multiplatform-ios-integration-overview.md)


:::

If you want to develop your Kotlin Multiplatform project and an iOS project simultaneously by sharing code between them,
you can set up direct integration using a special script.

This script automates the process of connecting the Kotlin framework to iOS projects in Xcode:

<img src="/img/direct-integration-scheme.svg" alt="Direct integration diagram" width="700" style={{verticalAlign: 'middle'}}/>

The script uses the `embedAndSignAppleFrameworkForXcode` Gradle task designed specifically for the Xcode environment.
During the setup, you add it to the run script phase of the iOS app build. After that, the Kotlin artifact
is built and included in the derived data before running the iOS app build.

In general, the script:

* Copies the compiled Kotlin framework into the correct directory within the iOS project structure.
* Handles the code signing process of the embedded framework.
* Ensures that code changes in the Kotlin framework are reflected in the iOS app in Xcode.

## How to set up

If you're currently using the CocoaPods plugin to connect your Kotlin framework, migrate first.
If your project doesn't have CocoaPods dependencies, [skip this step](#connect-the-framework-to-your-project).

### Migrate from the CocoaPods plugin

To migrate from the CocoaPods plugin:

1. In Xcode, clean build directories using **Product** | **Clean Build Folder** or with the
   <shortcut>Cmd + Shift + K</shortcut> shortcut.
2. In the directory with the `Podfile` file, run the following command:

    ```none
   pod deintegrate
   ```

3. Remove the `cocoapods {}` block from your `build.gradle(.kts)` files.
4. Delete the `.podspec` and `Podfile` files.

### Connect the framework to your project

To connect the Kotlin framework generated from the multiplatform project to your Xcode project:

1. The `embedAndSignAppleFrameworkForXcode` task only registers if the `binaries.framework` configuration option is
   declared. In your Kotlin Multiplatform project, check the iOS target declaration in the `build.gradle.kts` file.
2. In Xcode, open the iOS project settings by double-clicking the project name.
3. On the **Build Phases** tab of the project settings, click **+** and select **New Run Script Phase**.

   <img src="/img/xcode-run-script-phase-1.png" alt="Add run script phase" width="700" style={{verticalAlign: 'middle'}}/>

4. Adjust the following script and copy the result to the run script phase:

   ```bash
   cd "<Path to the root of the multiplatform project>"
   ./gradlew :<Shared module name>:embedAndSignAppleFrameworkForXcode 
   ```

   * In the `cd` command, specify the path to the root of your Kotlin Multiplatform project, for example, `$SRCROOT/..`.
   * In the `./gradlew` command, specify the name of the shared module, for example, `:shared` or `:composeApp`.

   <img src="/img/xcode-run-script-phase-2.png" alt="Add the script" width="700" style={{verticalAlign: 'middle'}}/>

5. Drag the **Run Script** phase before the **Compile Sources** phase.

   <img src="/img/xcode-run-script-phase-3.png" alt="Drag the Run Script phase" width="700" style={{verticalAlign: 'middle'}}/>

6. On the **Build Settings** tab, disable the **User Script Sandboxing** option under **Build Options**:

   <img src="/img/disable-sandboxing-in-xcode-project-settings.png" alt="User Script Sandboxing" width="700" style={{verticalAlign: 'middle'}}/>

   > This may require restarting your Gradle daemon if you built the iOS project without disabling sandboxing first.
   > Stop the Gradle daemon process that might have been sandboxed:
   > ```shell
   > ./gradlew --stop
   > ```
   >
   > 

7. Build the project in Xcode. If everything is set up correctly, the project will successfully build.

:::note
If you have a custom build configuration different from the default `Debug` or `Release`, on the **Build Settings**
tab, add the `KOTLIN_FRAMEWORK_BUILD_TYPE` setting under **User-Defined** and set it to `Debug` or `Release`.

:::

## What's next?

You can also take advantage of local integration when working with the Swift package manager. [Learn how to add a
dependency on a Kotlin framework in a local package](multiplatform-spm-local-integration.md).