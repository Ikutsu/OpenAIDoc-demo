/**
 * 文档批量处理脚本
 * 用于将Kotlin文档Markdown文件转换为Docusaurus格式
 * 
 * 使用方法: node .github/workflows/process-docs.js
 * 脚本直接处理kotlin-repo中的文件，不复制到其他位置
 */

const fs = require('fs');
const path = require('path');

// 获取环境变量中的文件列表
const repoPath = process.env.REPO_PATH || 'kotlin-repo';
const changedFiles = process.env.KOTLIN_CHANGED_FILES ? process.env.KOTLIN_CHANGED_FILES.split(' ') : [];
const files = changedFiles.map(file => path.join(repoPath, file));
const varsFilePath = 'kotlin-repo/docs/v.list';

let a = `
<table> 
<tr>
<th>
Release info
</th>
<th>
Release highlights
</th>
<th>
Compatible Kotlin version
</th>
</tr>
<tr>
<td>

**0.8.4**

Released: 06 December, 2024

</td>
<td>

* Support for Kotlin’s [K2 mode](k2-compiler-migration-guide.md#support-in-ides) for improved stability and code analysis.

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.8.3**

Released: 23 July, 2024

</td>
<td>

* Fixes for Xcode compatibility issues.

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.8.2**

Released: 16 May, 2024

</td>
<td>

* Support for Android Studio Jellyfish and for the new Canary version, Koala.
* Added declarations of `
sourceCompatibility ` and `
targetCompatibility ` in the shared module.

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.8.1**

Released: 9 November, 2023

</td>
<td>

* Updated Kotlin to 1.9.20.
* Updated Jetpack Compose to 1.5.4.
* Enabled Gradle build and configuration caches by default.
* Refactored build configurations for the new Kotlin version.
* iOS framework is now static by default.
* Fixed an issue running on iOS devices with Xcode 15.

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.8.0**

Released: 5 October, 2023

</td>
<td>

* [KT-60169](https://youtrack.jetbrains.com/issue/KT-60169) Migrated on the Gradle version catalog.
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) Renamed `
android ` to `
androidTarget `.
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) Updated Kotlin and dependency versions.
* [KTIJ-26773](https://youtrack.jetbrains.com/issue/KTIJ-26773) Refactored to use ` - destination ` argument instead of ` - sdk ` and ` - arch `.
* [KTIJ-25839](https://youtrack.jetbrains.com/issue/KTIJ-25839) Refactored generated file names.
* [KTIJ-27058](https://youtrack.jetbrains.com/issue/KTIJ-27058) Added the JVM target config.
* [KTIJ-27160](https://youtrack.jetbrains.com/issue/KTIJ-27160) Supported Xcode 15.0.
* [KTIJ-27158](https://youtrack.jetbrains.com/issue/KTIJ-27158) Moved the new module wizard to the experimental state.

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.6.0**

Released: 24 May, 2023

</td>
<td>

* Support of the new Canary Android Studio Hedgehog.
* Updated versions of Kotlin, Gradle, and libraries in the Multiplatform project.
* Applied new [`
targetHierarchy.default()
`](whatsnew1820.md#new-approach-to-source-set-hierarchy) in the Multiplatform project.
* Applied source set name suffixes to platform-specific files in the Multiplatform project.

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.5.3**

Released: 12 April, 2023

</td>
<td>

* Updated Kotlin and Compose versions.
* Fixed an Xcode project scheme parsing.
* Added a scheme product type check.
* `
iosApp ` scheme is now selected by default if presented.

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.5.2**

Released: 30 January, 2023

</td>
<td>

* [Fixed a problem with Kotlin/Native debugger (slow Spotlight indexing)](https://youtrack.jetbrains.com/issue/KT-55988).
* [Fixed Kotlin/Native debugger in multimodule projects](https://youtrack.jetbrains.com/issue/KT-24450).
* [New build for Android Studio Giraffe 2022.3.1 Canary](https://youtrack.jetbrains.com/issue/KT-55274).
* [Added provisioning flags for an iOS app build](https://youtrack.jetbrains.com/issue/KT-55204).
* [Added inherited paths to the **Framework Search Paths** option in a generated iOS project](https://youtrack.jetbrains.com/issue/KT-55402).

</td>
<td>

* [Any of Kotlin plugin versions](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.5.1**

Released: 30 November, 2022

</td>
<td>

* [Fixed new project generation: delete an excess "app" directory](https://youtrack.jetbrains.com/issue/KTIJ-23790).

</td>
<td>

* [Kotlin 1.7.0—*](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.5.0**

Released: 22 November, 2022

</td>
<td>

* [Changed the default option for iOS framework distribution: now it is **Regular framework**](https://youtrack.jetbrains.com/issue/KT-54086).
* [Moved `
MyApplicationTheme ` to a separate file in a generated Android project](https://youtrack.jetbrains.com/issue/KT-53991).
* [Updated generated Android project](https://youtrack.jetbrains.com/issue/KT-54658).
* [Fixed an issue with unexpected erasing of new project directory](https://youtrack.jetbrains.com/issue/KTIJ-23707).

</td>
<td>

* [Kotlin 1.7.0—*](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.3.4**

Released: 12 September, 2022

</td>
<td>

* [Migrated Android app to Jetpack Compose](https://youtrack.jetbrains.com/issue/KT-53162).
* [Removed outdated HMPP flags](https://youtrack.jetbrains.com/issue/KT-52248).
* [Removed package name from Android manifest](https://youtrack.jetbrains.com/issue/KTIJ-22633).
* [Updated `.gitignore ` for Xcode projects](https://youtrack.jetbrains.com/issue/KT-53703).
* [Updated wizard project for better illustration expect/actual](https://youtrack.jetbrains.com/issue/KT-53928).
* [Updated compatibility with Canary build of Android Studio](https://youtrack.jetbrains.com/issue/KTIJ-22063).
* [Updated minimum Android SDK to 21 for Android app](https://youtrack.jetbrains.com/issue/KTIJ-22505).
* [Fixed an issue with the first launch after installation Xcode](https://youtrack.jetbrains.com/issue/KTIJ-22645).
* [Fixed an issues with Apple run configuration on M1](https://youtrack.jetbrains.com/issue/KTIJ-21781).
* [Fixed an issue with `
local.properties ` on Windows OS](https://youtrack.jetbrains.com/issue/KTIJ-22037).
* [Fixed an issue with Kotlin/Native debugger on Canary build of Android Studio](https://youtrack.jetbrains.com/issue/KT-53976).

</td>
<td>

* [Kotlin 1.7.0—1.7.*](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.3.3**

Released: 9 June, 2022

</td>
<td>

* Updated dependency on Kotlin IDE plugin 1.7.0.

</td>
<td>

* [Kotlin 1.7.0—1.7.*](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.3.2**

Released: 4 April, 2022

</td>
<td>

* Fixed the performance problem with the iOS application debug on Android Studio 2021.2 and 2021.3.

</td>
<td>

* [Kotlin 1.5.0—1.6.*](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.3.1**

Released: 15 February, 2022

</td>
<td>

* [Enabled M1 iOS simulator in Kotlin Multiplatform Mobile wizards](https://youtrack.jetbrains.com/issue/KT-51105).
* Improved performance for indexing XcProjects: [KT-49777](https://youtrack.jetbrains.com/issue/KT-49777), [KT-50779](https://youtrack.jetbrains.com/issue/KT-50779).
* Build scripts clean up: use `
kotlin("test")
` instead of `
kotlin("test-common")
` and `
kotlin("test-annotations-common")
`.
* Increase compatibility range with [Kotlin plugin version](https://youtrack.jetbrains.com/issue/KTIJ-20167).
* [Fixed the problem with JVM debug on Windows host](https://youtrack.jetbrains.com/issue/KT-50699).
* [Fixed the problem with the invalid version after disabling the plugin](https://youtrack.jetbrains.com/issue/KT-50966).

</td>
<td>

* [Kotlin 1.5.0—1.6.*](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.3.0**

Released: 16 November, 2021

</td>
<td>

* [New Kotlin Multiplatform Library wizard](https://youtrack.jetbrains.com/issue/KTIJ-19367).
* Support for the new type of Kotlin Multiplatform library distribution: [XCFramework](multiplatform-build-native-binaries.md#build-xcframeworks).
* Enabled [hierarchical project structure](multiplatform-hierarchy.md#manual-configuration) for new cross-platform mobile projects.
* Support for [explicit iOS targets declaration](https://youtrack.jetbrains.com/issue/KT-46861).
* [Enabled Kotlin Multiplatform Mobile plugin wizards on non-Mac machines](https://youtrack.jetbrains.com/issue/KT-48614).
* [Support for subfolders in the Kotlin Multiplatform module wizard](https://youtrack.jetbrains.com/issue/KT-47923).
* [Support for Xcode `
Assets.xcassets ` file](https://youtrack.jetbrains.com/issue/KT-49571).
* [Fixed the plugin classloader exception](https://youtrack.jetbrains.com/issue/KT-48103).
* Updated the CocoaPods Gradle Plugin template.
* Kotlin/Native debugger type evaluation improvements.
* Fixed iOS device launching with Xcode 13.

</td>
<td>

* [Kotlin 1.6.0](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.7**

Released: August 2, 2021

</td>
<td>

* [Added Xcode configuration option for AppleRunConfiguration](https://youtrack.jetbrains.com/issue/KTIJ-19054).
* [Added support Apple M1 simulators](https://youtrack.jetbrains.com/issue/KT-47618).
* [Added information about Xcode integration options in Project Wizard](https://youtrack.jetbrains.com/issue/KT-47466).
* [Added error notification after a project with CocoaPods was generated, but the CocoaPods gem has not been installed](https://youtrack.jetbrains.com/issue/KT-47329).
* [Added support Apple M1 simulator target in generated shared module with Kotlin 1.5.30](https://youtrack.jetbrains.com/issue/KT-47631).
* [Cleared generated Xcode project with Kotlin 1.5.20](https://youtrack.jetbrains.com/issue/KT-47465).
* Fixed launching Xcode Release configuration on a real iOS device.
* Fixed simulator launching with Xcode 12.5.

</td>
<td>

* [Kotlin 1.5.10](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.6**

Released: June 10, 2021

</td>
<td>

* Compatibility with Android Studio Bumblebee Canary 1.
* Support for [Kotlin 1.5.20](whatsnew1520.md): using the new framework-packing task for Kotlin/Native in the Project Wizard.

</td>
<td>

* [Kotlin 1.5.10](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.5**

Released: May 25, 2021

</td>
<td>

* [Fixed compatibility with Android Studio Arctic Fox 2020.3.1 Beta 1 and higher](https://youtrack.jetbrains.com/issue/KT-46834).

</td>
<td>

* [Kotlin 1.5.10](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.4**

Released: May 5, 2021

</td>
<td>

Use this version of the plugin with Android Studio 4.2 or Android Studio 2020.3.1 Canary 8 or higher.
* Compatibility with [Kotlin 1.5.0](whatsnew15.md).
* [Ability to use the CocoaPods dependency manager in the Kotlin Multiplatform module for iOS integration](https://youtrack.jetbrains.com/issue/KT-45946).

</td>
<td>

* [Kotlin 1.5.0](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.3**

Released: April 5, 2021

</td>
<td>

* [The Project Wizard: improvements in naming modules](https://youtrack.jetbrains.com/issues?q=issue%20id:%20KT-43449,%20KT-44060,%20KT-41520,%20KT-45282).
* [Ability to use the CocoaPods dependency manager in the Project Wizard for iOS integration](https://youtrack.jetbrains.com/issue/KT-45478).
* [Better readability of gradle.properties in new projects](https://youtrack.jetbrains.com/issue/KT-42908).
* [Sample tests are no longer generated if "Add sample tests for Shared Module" is unchecked](https://youtrack.jetbrains.com/issue/KT-43441).
* [Fixes and other improvements](https://youtrack.jetbrains.com/issues?q=Subsystems:%20%7BKMM%20Plugin%7D%20Type:%20Feature,%20Bug%20State:%20-Obsolete,%20-%7BAs%20designed%7D,%20-Answered,%20-Incomplete%20resolved%20date:%202021-03-10%20..%202021-03-25).

</td>
<td>

* [Kotlin 1.4.30](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.2**

Released: March 3, 2021

</td>
<td>

* [Ability to open Xcode-related files in Xcode](https://youtrack.jetbrains.com/issue/KT-44970).
* [Ability to set up a location for the Xcode project file in the iOS run configuration](https://youtrack.jetbrains.com/issue/KT-44968).
* [Support for Android Studio 2020.3.1 Canary 8](https://youtrack.jetbrains.com/issue/KT-45162).
* [Fixes and other improvements](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.2%20).

</td>
<td>

* [Kotlin 1.4.30](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.1**

Released: February 15, 2021

</td>
<td>

Use this version of the plugin with Android Studio 4.2.
* Infrastructure improvements.
* [Fixes and other improvements](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.1%20).

</td>
<td>

* [Kotlin 1.4.30](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.2.0**

Released: November 23, 2020

</td>
<td>

* [Support for iPad devices](https://youtrack.jetbrains.com/issue/KT-41932).
* [Support for custom scheme names that are configured in Xcode](https://youtrack.jetbrains.com/issue/KT-41677).
* [Ability to add custom build steps for the iOS run configuration](https://youtrack.jetbrains.com/issue/KT-41678).
* [Ability to debug a custom Kotlin/Native binary](https://youtrack.jetbrains.com/issue/KT-40954).
* [Simplified the code generated by Kotlin Multiplatform Mobile Wizards](https://youtrack.jetbrains.com/issue/KT-41712).
* [Removed support for the Kotlin Android Extensions plugin](https://youtrack.jetbrains.com/issue/KT-42121), which is deprecated in Kotlin 1.4.20.
* [Fixed saving physical device configuration after disconnecting from the host](https://youtrack.jetbrains.com/issue/KT-42390).
* Other fixes and improvements.

</td>
<td>

* [Kotlin 1.4.20](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.1.3**

Released: October 2, 2020

</td>
<td>

* Added compatibility with iOS 14 and Xcode 12.
* Fixed naming in platform tests created by the Kotlin Multiplatform Mobile Wizard.

</td>
<td>

* [Kotlin 1.4.10](releases.md#release-details)
* [Kotlin 1.4.20](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.1.2**

Released: September 29, 2020

</td>
<td>

 * Fixed compatibility with [Kotlin 1.4.20-M1](eap.md#build-details).
 * Enabled error reporting to JetBrains by default.

</td>
<td>

* [Kotlin 1.4.10](releases.md#release-details)
* [Kotlin 1.4.20](releases.md#release-details)

</td>
</tr>

<tr>
<td>

**0.1.1**

Released: September 10, 2020

</td>
<td>

* Fixed compatibility with Android Studio Canary 8 and higher.

</td>
<td>

* [Kotlin 1.4.10](releases.md#release-details)
* [Kotlin 1.4.20](releases.md#release-details)

</td>
</tr>
<tr>
<td>

**0.1.0**

Released: August 31, 2020

</td>
<td>

* The first version of the Kotlin Multiplatform Mobile plugin. Learn more in the [blog post](https://blog.jetbrains.com/kotlin/2020/08/kotlin-multiplatform-mobile-goes-alpha/).

</td>
<td>

* [Kotlin 1.4.0](releases.md#release-details)
* [Kotlin 1.4.10](releases.md#release-details)

</td>
</tr>

</table>
      `;
a = convertFrontmatter(a, 'a.md'); // 步骤1
a = convertAdmonitions(a); // 步骤2
a = convertDeflistToList(a); // 步骤5
a = convertIncludes(a); // 步骤6 - 处理include和snippet标签
a = convertTabs(a); // 步骤7
a = removeKotlinRunnable(a); // 步骤8
a = formatHtmlTags(a); // 步骤9
// 最后处理图片
a = convertImages(a); // 步骤3
a = convertVideos(a); // 步骤4
a = sanitizeMdxContent(a);
console.log(a);

// 处理文件
if (files.length > 0) {
    console.log(`开始处理 ${files.length} 个文件...`);
    processFiles(files, varsFilePath);
} else {
    console.log('没有检测到需要处理的文件');
}

// 处理文件列表
function processFiles(files, varsFilePath) {
    let processed = 0;

    files.forEach(file => {
        if (!file || !file.trim()) return;

        try {
            // 直接处理原始文件
            processFile(file, varsFilePath);
            processed++;
        } catch (error) {
            console.error(`处理文件 ${file} 时出错: ${error.message}`);
        }
    });

    console.log(`处理完成! 共处理 ${processed} 个文件`);
}

// 处理单个文件
function processFile(filePath, varsFilePath) {
    console.log(`处理: ${filePath}`);

    // 确保文件存在
    if (!fs.existsSync(filePath)) {
        console.error(`文件不存在: ${filePath}`);
        return;
    }

    // 读取输入文件
    const content = fs.readFileSync(filePath, 'utf8');

    // 应用所有转换
    let transformedContent = content;
    transformedContent = convertFrontmatter(transformedContent, filePath); // 步骤1
    transformedContent = convertAdmonitions(transformedContent); // 步骤2
    transformedContent = convertDeflistToList(transformedContent); // 步骤5
    transformedContent = convertIncludes(transformedContent); // 步骤6 - 处理include和snippet标签
    transformedContent = convertTabs(transformedContent); // 步骤7
    transformedContent = removeKotlinRunnable(transformedContent); // 步骤8
    transformedContent = formatHtmlTags(transformedContent); // 步骤9
    transformedContent = convertImages(transformedContent); // 步骤3 - 图片处理
    transformedContent = convertVideos(transformedContent); // 步骤4 - 视频处理

    // 最后，清理可能导致MDX编译错误的内容
    transformedContent = sanitizeMdxContent(transformedContent);

    // 如果提供了变量文件，应用变量替换
    if (varsFilePath && fs.existsSync(varsFilePath)) {
        transformedContent = replaceVariables(transformedContent, varsFilePath); // 步骤10
    }

    // 直接写回原文件
    fs.writeFileSync(filePath, transformedContent, 'utf8');
    console.log(`已处理文件: ${filePath}`);
}

// 步骤1: 转换Frontmatter
function convertFrontmatter(content, inputFile) {
    // 从注释中提取标题 - 使用更精确的模式匹配
    // 这个正则表达式使用非贪婪模式并避免在括号内部提前终止
    const titleMatch = content.match(/\[\/\/\]: # \(title: ([\s\S]*?)\)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(inputFile, path.extname(inputFile));

    // 从注释中提取描述 - 使用更精确的模式匹配
    const descriptionMatch = content.match(/\[\/\/\]: # \(description: ([\s\S]*?)\)(?:\n|$)/);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';

    // 处理标题中的转义字符
    let processedTitle = title;
    if (processedTitle) {
        // 解析转义序列，如\(变为(, \)变为), \"变为"等
        processedTitle = processedTitle.replace(/\\(.)/g, '$1');

        console.log(`处理标题: "${title}" -> "${processedTitle}"`);
    }

    // 移除原始的标题注释 - 使用更精确的模式匹配
    let newContent = content.replace(/\[\/\/\]: # \(title: [\s\S]*?\)(?:\n|$)/, '');

    // 移除原始的描述注释 - 使用更精确的模式匹配
    newContent = newContent.replace(/\[\/\/\]: # \(description: [\s\S]*?\)(?:\n|$)/, '');

    // 检查标题是否包含特殊字符（冒号、逗号、问号等）
    const hasSpecialChars = /[:!?#,[\]{}|><%@()]/.test(processedTitle);
    // 格式化标题，如果包含特殊字符，则用双引号括起来
    const formattedTitle = hasSpecialChars ? `"${processedTitle}"` : processedTitle;

    // 获取START_PAGE环境变量，默认为getting-started.md
    const startPage = process.env.START_PAGE || 'getting-started.md';

    // 检查当前文件是否是START_PAGE
    const isStartPage = inputFile.endsWith(startPage);

    // 添加Docusaurus frontmatter，包括描述（如果有）
    if (isStartPage) {
        console.log(`为起始页 ${inputFile} 添加slug: /属性`);
        let frontmatter = `---\ntitle: ${formattedTitle}\nslug: /\n`;
        if (description) {
            frontmatter += `description: ${description}\n`;
        }
        frontmatter += `---\n\n`;
        newContent = frontmatter + newContent;
    } else {
        let frontmatter = `---\ntitle: ${formattedTitle}\n`;
        if (description) {
            frontmatter += `description: ${description}\n`;
        }
        frontmatter += `---\n\n`;
        newContent = frontmatter + newContent;
    }

    return newContent;
}


// 创建一个共享函数来处理所有admonition内容中的">"符号
function cleanMarkdownReferences(content) {
    let cleanedContent = content;

    // 使用更精确的方法替换Markdown引用符号
    // 1. 单独一行的">"
    cleanedContent = cleanedContent.replace(/^>$/gm, '');

    // 2. 行首的"> "（带空格）
    cleanedContent = cleanedContent.replace(/^> /gm, '');

    // 3. 行首的">"（不带空格）
    cleanedContent = cleanedContent.replace(/^>/gm, '');

    // 4. 行中的"\n> "
    cleanedContent = cleanedContent.replace(/\n> /g, '\n');

    // 5. 行中的"\n>"
    cleanedContent = cleanedContent.replace(/\n>/g, '\n');

    // 6. 行首有缩进空格后跟">"的情况
    cleanedContent = cleanedContent.replace(/^(\s+)>/gm, '$1');

    // 7. 行首有缩进空格后跟"> "的情况
    cleanedContent = cleanedContent.replace(/^(\s+)> /gm, '$1');

    // 8. 处理换行后缩进空格再跟">"的情况
    cleanedContent = cleanedContent.replace(/\n(\s+)>/g, '\n$1');

    // 9. 处理换行后缩进空格再跟"> "的情况
    cleanedContent = cleanedContent.replace(/\n(\s+)> /g, '\n$1');

    return cleanedContent;
}

// 步骤2: 转换提示框
function convertAdmonitions(content) {
    let newContent = content;

    // 1. 处理带有明确样式标记的提示框

    // 处理警告框
    newContent = newContent.replace(
        /> ([\s\S]*?)\n> \n> \{style="warning"\}/g,
        (match, p1) => {
            // 使用共享函数清理内容
            const cleanedContent = cleanMarkdownReferences(p1);
            return `:::caution\n${cleanedContent}\n:::`;
        }
    );

    // 处理提示框
    newContent = newContent.replace(
        /> ([\s\S]*?)\n> \n> \{style="tip"\}/g,
        (match, p1) => {
            // 使用共享函数清理内容
            const cleanedContent = cleanMarkdownReferences(p1);
            return `:::tip\n${cleanedContent}\n:::`;
        }
    );

    // 处理注意框
    newContent = newContent.replace(
        /> ([\s\S]*?)\n> \n> \{style="note"\}/g,
        (match, p1) => {
            // 使用共享函数清理内容
            const cleanedContent = cleanMarkdownReferences(p1);
            return `:::note\n${cleanedContent}\n:::`;
        }
    );

    // 2. 处理其他特殊标记

    // 转换tldr为info
    newContent = newContent.replace(
        /<tldr>([\s\S]*?)<\/tldr>/g,
        ':::info\n$1\n:::'
    );

    // 转换primary-label
    newContent = newContent.replace(/<primary-label ref="[^"]*"\/>/g, '');

    // 3. 删除文档中剩余的{style="xxx"}标记
    newContent = newContent.replace(/\{style="[^"]*"\}/g, '');

    // 4. 处理admonition内部的>符号
    // 首先识别所有的admonition块
    newContent = newContent.replace(
        /:::(tip|caution|note|info|warning)([\s\S]*?):::/g,
        (match, type, content) => {
            // 使用共享函数清理内容
            const cleanedContent = cleanMarkdownReferences(content);
            return `:::${type}${cleanedContent}:::`;
        }
    );

    // 5. 处理没有明确样式标记的独立提示框
    // 这种方法更简单直接：通过行分割，识别以>开头的块
    const lines = newContent.split('\n');
    const processedLines = [];
    let inBlockquote = false;
    let blockquoteContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查是否是以>开头的行
        if (line.trim().startsWith('> ')) {
            if (!inBlockquote) {
                inBlockquote = true;
            }
            // 收集内容，去掉>前缀
            blockquoteContent.push(line.replace(/^> /, ''));
        }
        // 空的>行，跳过但继续收集
        else if (line.trim() === '>') {
            if (inBlockquote) {
                blockquoteContent.push('');
            }
        }
        // 如果是其他行，结束当前引用块
        else {
            if (inBlockquote) {
                // 只有当blockquoteContent不为空，且不在admonition内才转换
                const content = blockquoteContent.join('\n');
                if (content.trim() && !content.includes(':::')) {
                    processedLines.push(':::tip');
                    processedLines.push(...blockquoteContent);
                    processedLines.push(':::');
                } else {
                    // 否则保持原样
                    processedLines.push(...blockquoteContent.map(l => `> ${l}`));
                }

                inBlockquote = false;
                blockquoteContent = [];
            }

            processedLines.push(line);
        }
    }

    // 处理文件末尾可能的引用块
    if (inBlockquote && blockquoteContent.length > 0) {
        const content = blockquoteContent.join('\n');
        if (content.trim() && !content.includes(':::')) {
            processedLines.push(':::tip');
            processedLines.push(...blockquoteContent);
            processedLines.push(':::');
        } else {
            processedLines.push(...blockquoteContent.map(l => `> ${l}`));
        }
    }

    // 在处理完admonition后，应用HTML标签格式化
    let result = processedLines.join('\n');
    result = result.replace(
        /:::(tip|caution|note|info|warning)([\s\S]*?):::/g,
        (match, type, content) => {
            // 使用共享函数清理内容
            let cleanedContent = cleanMarkdownReferences(content);

            // 格式化HTML标签
            const formattedContent = formatHtmlTags(cleanedContent);

            return `:::${type}${formattedContent}:::`;
        }
    );

    return result;
}

// 步骤6: 格式化HTML标签
function formatHtmlTags(content) {
    let result = content;

    // 移除所有元素的不规范style属性
    result = result.replace(
        /<([a-z]+)([^>]*?)style="[^"]*?"([^>]*?)>/g,
        '<$1$2$3>'
    );

    // 移除所有元素的非标准style属性（无引号）
    result = result.replace(
        /<([a-z]+)([^>]*?)style=[^"\s>]*([^>]*?)>/g,
        '<$1$2$3>'
    );

    // 确保<p>后面有换行
    result = result.replace(/<p>\s*/g, '<p>\n   ');

    // 确保</p>前面有换行
    result = result.replace(/\s*<\/p>/g, '\n   </p>');

    // 只去除标签前的缩进空格，保留换行符
    // 处理行首的<ul>标签，去除缩进空格
    result = result.replace(/^(\s+)<ul>/gm, '<ul>');

    // 处理行首的<td>标签，去除缩进空格
    result = result.replace(/^(\s+)<td([^>]*)>/gm, '<td$2>');

    // 处理行首的</td>标签，去除缩进空格
    result = result.replace(/^(\s+)<\/td>/gm, '</td>');

    return result;
}

// 步骤3: 转换图片标记
function convertImages(content) {
    // 修复错误的图片标签闭合符号
    let newContent = content.replace(
        /<img([^>]*?)\/\/>/g,
        '<img$1/>'
    );

    // 第1步：转换Markdown格式的图片为HTML格式，特殊处理带大括号属性的情况
    newContent = newContent.replace(
            /!\[(.*?)\]\((.*?)\)(\{.*?\})?/g,
            (match, alt, src, attrs) => {
                console.log(`处理图片: alt=${alt}, src=${src}, attrs=${attrs || '无属性'}`);

                // 构建基本图片标签
                let imgTag = `<img src="${src.startsWith('http') ? src : `/img/${src}`}" alt="${alt}"`;
            
            // 解析可能存在的属性
            if (attrs) {
                // 处理width属性
                const widthMatch = attrs.match(/width=["']?(\d+)["']?/);
                if (widthMatch && widthMatch[1]) {
                    console.log(`找到宽度属性: ${widthMatch[1]}`);
                    imgTag += ` width="${widthMatch[1]}"`;
                }
            }
            
            // 添加默认样式和关闭标签
            imgTag += ` style={{verticalAlign: 'middle'}}/>`;
            console.log(`生成的图片标签: ${imgTag}`);
            
            return imgTag;
        }
    );
    
    // 第2步：处理HTML图片标签后的大括号属性 - 处理形如 width="350" 的格式
    newContent = newContent.replace(
        /(<img[^>]*?)(\/?>)\s*\{([^{}]*?)width=["']?(\d+)["']?([^{}]*?)\}/g,
        (match, imgTag, closing, attrsBefore, width, attrsAfter) => {
            console.log(`处理图片标签后的大括号属性(引号格式): ${match}`);
            
            // 检查图片标签是否已有width属性
            if (imgTag.includes('width=')) {
                return `${imgTag}${closing}`;
            } else {
                return `${imgTag} width="${width}"${closing}`;
            }
        }
    );
    
    // 第3步：处理HTML图片标签后的大括号属性 - 处理形如 width=350 的格式
    newContent = newContent.replace(
        /(<img[^>]*?)(\/?>)\s*\{([^{}]*?)width=(\d+)([^{}]*?)\}/g,
        (match, imgTag, closing, attrsBefore, width, attrsAfter) => {
            console.log(`处理图片标签后的大括号属性(无引号格式): ${match}`);
            
            // 检查图片标签是否已有width属性
            if (imgTag.includes('width=')) {
                return `${imgTag}${closing}`;
            } else {
                return `${imgTag} width="${width}"${closing}`;
            }
        }
    );
    
    // 第4步：移除所有剩余的图片标签后的大括号
    newContent = newContent.replace(
        /(<img[^>]*?\/?>)\s*\{[^{}]*?\}/g,
        '$1'
    );
    
    // 第5步：确保所有图片标签都正确闭合
    newContent = newContent.replace(
        /<img([^>]*?)>(?!\s*\/)/g,
        '<img$1/>'
    );
    
    // 第6步：修复双斜杠闭合问题 - 特殊处理可能出现的多余斜杠
    newContent = newContent.replace(
        /<img([^>]*?)\/{2,}>/g,
        '<img$1/>'
    );
    
    return newContent;
}

// 步骤4: 转换视频标签
function convertVideos(content) {
    let newContent = content;

    // 修复视频标签中错误的src路径（移除http链接前的/img/前缀）
    newContent = newContent.replace(
        /<video([^>]*?)src="\/img\/(https?:\/\/[^"]+)"([^>]*?)>/g,
        '<video$1src="$2"$3>'
    );

    // 修复自闭合视频标签中错误的src路径
    newContent = newContent.replace(
        /<video([^>]*?)src="\/img\/(https?:\/\/[^"]+)"([^>]*?)\/>/g,
        '<video$1src="$2"$3/>'
    );

    return newContent;
}

// 步骤7: 转换Tabs组件
function convertTabs(content) {
    // 检查文件是否包含tabs标签（大小写不敏感）
    if (content.match(/<tabs|<tab |<Tabs|<Tab /i)) {
        // 判断是否已存在frontmatter
        const hasFrontmatter = content.startsWith('---\n');

        if (hasFrontmatter) {
            // 如果已有frontmatter，将导入语句插入到frontmatter之后
            const frontmatterEnd = content.indexOf('---', 3) + 3;
            const beforeFrontmatter = content.substring(0, frontmatterEnd);
            const afterFrontmatter = content.substring(frontmatterEnd);
            content =
                beforeFrontmatter +
                "\n\nimport Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';\n\n" +
                afterFrontmatter;
        } else {
            // 如果没有frontmatter，则正常添加到开头（这种情况不应该发生，因为我们在前面已经添加了frontmatter）
            content = `import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';\n\n${content}`;
        }

        // 转换各种格式的tabs和tab标签

        // 转换<tabs>标签（小写）- 带group属性
        content = content.replace(/<tabs\s+group\s*=\s*["']([^"']*)["']\s*>/g, '<Tabs groupId="$1">');
        
        // 转换<tabs>标签（小写）- 不带属性
        content = content.replace(/<tabs>/g, '<Tabs>');
        content = content.replace(/<\/tabs>/g, '</Tabs>');

        // 转换已经使用大写的<Tabs>标签但可能有group属性
        content = content.replace(/<Tabs\s+group\s*=\s*["']([^"']*)["']\s*>/g, '<Tabs groupId="$1">');

        // 转换<tab>标签（小写）- 带id, title和group-key三个属性
        content = content.replace(
            /<tab\s+id\s*=\s*["']([^"']*)["']\s+title\s*=\s*["']([^"']*)["']\s+group-key\s*=\s*["']([^"']*)["']\s*>/g,
            '<TabItem value="$1" label="$2" default={$3 === "kotlin"}>'
        );

        // 转换<tab>标签（小写）- 带title和group-key属性
        content = content.replace(
            /<tab\s+title\s*=\s*["']([^"']*)["']\s+group-key\s*=\s*["']([^"']*)["']\s*>/g,
            '<TabItem value="$2" label="$1" default={$2 === "kotlin"}>'
        );

        // 转换<tab>标签（小写）- 带id和title
        content = content.replace(
            /<tab\s+id\s*=\s*["']([^"']*)["']\s+title\s*=\s*["']([^"']*)["']\s*>/g,
            '<TabItem value="$1" label="$2">'
        );

        // 转换简单的<tab>标签（小写）- 只带title
        content = content.replace(
            /<tab\s+title\s*=\s*["']([^"']*)["']\s*>/g,
            '<TabItem value="$1" label="$1">'
        );

        // 转换所有</tab>结束标签
        content = content.replace(/<\/tab>/g, '</TabItem>');
    }

    return content;
}

// 步骤8: 移除kotlin-runnable相关标记和其他特殊属性标记
function removeKotlinRunnable(content) {
    let result = content;

    // 匹配所有可能的Kotlin代码块标记组合
    // 这个正则表达式可以匹配任意顺序的属性，只要大括号中包含kotlin-runnable或validate等属性
    result = result.replace(/\{(?:[a-zA-Z-]+="[^"]*"(?:\s+|))+\}/g, (match) => {
        // 检查是否是Kotlin相关标记
        if (match.includes('kotlin-runnable') ||
            match.includes('kotlin-min-compiler-version') ||
            match.includes('validate=')) {
            return ''; // 移除整个标记
        }
        // 检查是否是折叠相关标记
        if (match.includes('initial-collapse-state=') && 
            match.includes('collapsible=')) {
            return ''; // 移除整个标记
        }
        return match; // 非相关标记保持不变
    });

    // 移除Markdown链接后面的CSS类大括号，例如{:.typo-float-right.kto-button.kto-button_size_m.kto-button_mode_outline}
    result = result.replace(/\]\([^)]+\)\{:[.a-zA-Z0-9_-]+\}/g, (match) => {
        // 提取链接部分，移除CSS类大括号
        return match.replace(/\{:[.a-zA-Z0-9_-]+\}/, '');
    });

    // 移除单独一行上的折叠标记
    result = result.replace(/^\{initial-collapse-state="[^"]*"\s+collapsible="[^"]*"\}\s*$/gm, '');

    // 移除单独一行上的{kotlin-runnable...}标记
    result = result.replace(/^\{kotlin-runnable.*?\}\s*$/gm, '');

    // 移除单独一行上的{kotlin-...}类似标记（更通用的处理）
    result = result.replace(/^\{kotlin-.*?\}\s*$/gm, '');

    // 移除行内的kotlin标记
    result = result.replace(/\{kotlin-[^{}]*\}/g, '');

    // 移除Kotlin代码示例中的//sampleStart和//sampleEnd注释
    result = result.replace(/^\s*\/\/sampleStart\s*$/gm, '');
    result = result.replace(/^\s*\/\/sampleEnd\s*$/gm, '');

    return result;
}

// 步骤9: 处理变量替换
function replaceVariables(content, varsFilePath) {
    // 如果没有提供变量文件路径，直接返回原内容
    if (!varsFilePath) {
        return content;
    }

    try {
        // 读取变量文件
        const varsContent = fs.readFileSync(varsFilePath, 'utf8');
        const variables = {};

        // 提取变量定义
        const varRegex = /<var name="([^"]+)" value="([^"]+)"/g;
        let match;

        while ((match = varRegex.exec(varsContent)) !== null) {
            const [, name, value] = match;
            variables[name] = value;
        }

        // 替换内容中的变量占位符
        let result = content;

        // 查找所有%varName%格式的占位符
        const placeholderRegex = /%([^%]+)%/g;
        result = result.replace(placeholderRegex, (match, varName) => {
            // 如果找到对应的变量，替换为其值；否则保持原样
            return variables[varName] || match;
        });

        return result;
    } catch (error) {
        console.error(`处理变量替换时出错: ${error.message}`);
        return content; // 出错时返回原内容
    }
}
// convertDeflistToList
// 步骤10: 将deflist转换为普通列表
function convertDeflistToList(htmlContent) {
  // 移除deflist开始和结束标签
  let result = htmlContent.replace(/<deflist.*?>/g, '');
  result = result.replace(/<\/deflist>/g, '');
  
  // 将def标签的title属性内容转换为h3标题，保留def中的内容
  result = result.replace(/<def title="(.*?)".*?>([\s\S]*?)<\/def>/g, (match, title, content) => {
    return `<h3>${title}</h3>${content}`;
  });
  
    // 处理行首的<td>标签，去除缩进空格
    result = result.replace(/^(\s+)<h3([^>]*)>/gm, '<h3$2>');

    result = result.replace(/^(\s+)<p([^>]*)>/gm, '<p$2>');
    // 处理行首的</td>标签，去除缩进空格
    result = result.replace(/^(\s+)<\/p>/gm, '</p>');

  return result;
}

// 步骤11: 处理include和snippet标签
function convertIncludes(content) {
    let result = content;

    // 第1步：处理snippet标签，保留内容但移除标签
    result = result.replace(
        /<snippet\s+id="([^"]+)">([\s\S]*?)<\/snippet>/g,
        (match, id, snippetContent) => {
            // 保留snippet内容，但使用注释标记它的开始和结束，以便于查找
            return `{/* START_SNIPPET: ${id} */}\n${snippetContent}\n{/* END_SNIPPET: ${id} */}`;
        }
    );

    // 第2步：处理include标签，直接保留内容，移除标签
    result = result.replace(
        /<include\s+element-id="([^"]+)"(?:\s+use-filter="([^"]+)")?\s+from="([^"]+)"\/>/g,
        (match, elementId, useFilter, fromFile) => {
            // 在Docusaurus中，我们不做实际的include操作，而是添加注释表明这里有include
            return `{/* Note: This is an included content from ${fromFile}, element ${elementId}, with filters: ${useFilter || 'none'} */}`;
        }
    );

    // 第3步：处理注释掉的include标签
    result = result.replace(
        /<!--\s*<include(?:[^>]*)>\s*-->/g,
        '{/* Commented out include tag */}'
    );

    return result;
}

// 新函数: 清理可能导致MDX编译错误的内容
function sanitizeMdxContent(content) {
    let result = content;

    // 修复可能错误的Tab闭合标签
    result = result.replace(/<\/TabItem>\s*<\/tab>/g, '</TabItem>');
    result = result.replace(/<\/tab>\s*<\/Tabs>/g, '</TabItem></Tabs>');

    // 处理<code-block>标签，将其转换为Markdown代码块
    result = result.replace(
        /<code-block\s+lang="([^"]+)">\s*([\s\S]*?)\s*<\/code-block>/g,
        (match, language, code) => {
            // 清理代码中可能导致问题的字符
            const cleanedCode = code
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .trim();
            
            // 转换为Markdown代码块格式
            return `\`\`\`${language}\n${cleanedCode}\n\`\`\``;
        }
    );

    // 处理表格中的{<b>xxx</b>yyy}格式 - 转换为纯文本格式
    result = result.replace(
        /\{<b>(.*?)<\/b>(.*?)\}/g,
        (match, boldPart, normalPart) => {
            // 将其转换为**加粗部分**普通部分格式
            return `**${boldPart}**${normalPart}`;
        }
    );

    // 处理箭头符号 "->", 将其转换为HTML实体或代码格式
    result = result.replace(
        /([^\w`]|^)(->|--&gt;)([^\w`]|$)/g,
        (match, before, arrow, after) => {
            return `${before}\`→\`${after}`;
        }
    );

    // 处理箭头符号 "<-", 将其转换为HTML实体或代码格式
    result = result.replace(
        /([^\w`]|^)(<-|&lt;-)([^\w`]|$)/g,
        (match, before, arrow, after) => {
            return `${before}\`←\`${after}`;
        }
    );

    // 处理文档中说明的箭头符号含义
    result = result.replace(
        /"(->\s*and\s*<-|->|<-)\s*indicate[^"]*"/g,
        (match) => {
            return match.replace(/->/g, '→').replace(/<-/g, '←');
        }
    );

    // 处理邮箱地址，将其包装在代码块中，防止@符号被解析为JSX
    result = result.replace(
        /(<|&lt;)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(&gt;|>)/g,
        '`$1$2$3`'
    );

    // 特别处理列表项中的 <=数字 格式，如 <=1.9.0: 
    result = result.replace(
        /([^\w`]|^)(<=)(\d+(?:\.\d+)*)/g,
        (match, before, operator, version) => {
            return `${before}&lt;=${version}`;
        }
    );

    // 特别处理列表项开头的 * <=数字 格式
    result = result.replace(
        /^(\s*[*-]\s+)(<=)(\d+(?:\.\d+)*)/gm,
        (match, listMarker, operator, version) => {
            return `${listMarker}&lt;=${version}`;
        }
    );

    // 处理<数字这种格式，防止被解析为JSX标签，但不处理已转换的TabItem标签
    result = result.replace(
        /([^\w`<]|^)(<)(?!TabItem|\/TabItem)(\d+[^\s>]*)/g,
        (match, before, openBracket, number) => {
            return `${before}&lt;${number}`;
        }
    );

    // 处理>=符号，防止被解析为JSX标签的一部分
    result = result.replace(
        /&gt;=\s*(\d+)/g,
        '&gt;= $1'
    );

    // 处理以数字开头的属性或者文本片段
    result = result.replace(
        /-\s*&gt;\s*(\d+):/g,
        '-&gt; $1:'
    );

    // 处理代码块中可能出现的特殊字符，但保留已有的HTML实体
    result = result.replace(
        /```([a-z]*)\n([\s\S]*?)```/g,
        (match, language, code) => {
            // 使用一种简单的方法：先替换&lt;和&gt;为临时标记，然后处理<和>，最后恢复临时标记
            let processedCode = code
                .replace(/&lt;/g, '###LT###')
                .replace(/&gt;/g, '###GT###')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/###LT###/g, '&lt;')
                .replace(/###GT###/g, '&gt;');
                
            return '```' + language + '\n' + processedCode + '```';
        }
    );

    return result;
}