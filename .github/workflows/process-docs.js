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

const text = `<table>
   <tr>
       <td>Kotlin 1.9.0 and earlier (a standard setup)</td>
       <td>Kotlin 1.9.20</td>
   </tr>
   <tr>
<td>

\`\`\`kotlin
kotlin {
    androidTarget()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val commonMain by getting

        val iosMain by creating {
            dependsOn(commonMain)
        }

        val iosArm64Main by getting {
            dependsOn(iosMain)
        }

        val iosSimulatorArm64Main by getting {
            dependsOn(iosMain)
        }
    }
}
\`\`\`

</td>
<td>

\`\`\`kotlin
kotlin {
    androidTarget()
    iosArm64()
    iosSimulatorArm64()

    // The iosMain source set is created automatically
}
\`\`\`

</td>
</tr>
</table>`;
// 首先处理HTML注释，保护它们不被其他转换修改
let a = protectHtmlComments(text);

// 应用所有转换
a = convertFrontmatter(a, 'a.md'); // 步骤1
a = convertAdmonitions(a); // 步骤2
a = convertDeflistToList(a); // 步骤5
a = convertIncludes(a); // 步骤6 - 处理include和snippet标签
a = convertTabs(a); // 步骤7
a = removeKotlinRunnable(a); // 步骤8
a = formatHtmlTags(a); // 步骤9
a = convertImages(a); // 步骤3 - 图片处理
a = convertVideos(a); // 步骤4 - 视频处理

// 最后，清理可能导致MDX编译错误的内容
a = sanitizeMdxContent(a);

// 恢复被保护的HTML注释
a = restoreHtmlComments(a);

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

    // 首先处理HTML注释，保护它们不被其他转换修改
    let transformedContent = protectHtmlComments(content);

    // 应用所有转换
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

    // 恢复被保护的HTML注释
    transformedContent = restoreHtmlComments(transformedContent);

    // 如果提供了变量文件，应用变量替换
    if (varsFilePath && fs.existsSync(varsFilePath)) {
        transformedContent = replaceVariables(transformedContent, varsFilePath); // 步骤10
    }

    // 在处理文件后添加这一步
    transformedContent = decodeHtmlEntitiesInTables(transformedContent);

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
    result = result.replace(/^(\s+)<td([^>]*)>/gm, '<td$2>\n');

    // 处理行首的</td>标签，去除缩进空格
    result = result.replace(/^(\s+)<\/td>/gm, '</td>');

    // 处理行尾的</td>标签，在前面添加换行
    result = result.replace(/([^\s])<\/td>/g, "$1\n</td>");

    // 处理行首的<td>标签，去除缩进空格
    result = result.replace(/^(\s+)<tr([^>]*)>/gm, '<tr$2>');

    // 处理行首的</td>标签，去除缩进空格
    result = result.replace(/^(\s+)<\/tr>/gm, '</tr>');

    // 处理行首的<td>标签，去除缩进空格
    result = result.replace(/^(\s+)<table([^>]*)>/gm, '<table$2>');

    // 处理行首的</td>标签，去除缩进空格
    result = result.replace(/^(\s+)<\/table>/gm, '</table>');

    // 处理行首的</td>标签，去除缩进空格
    result = result.replace(/^(\s+)<\/p>/gm, '</p>');

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
            '<TabItem value="$1" label="$2" default>'
        );

        // 转换<tab>标签（小写）- 带title和group-key属性
        content = content.replace(
            /<tab\s+title\s*=\s*["']([^"']*)["']\s+group-key\s*=\s*["']([^"']*)["']\s*>/g,
            '<TabItem value="$2" label="$1" default>'
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

    // 首先保护React组件不被其他规则修改
    result = protectReactComponents(result);

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

    // 处理箭头符号 "->", 将其转换为HTML实体或代码格式，但跳过占位符
    result = result.replace(
        /([^\w`]|^)(->|--&gt;)([^\w`]|$)/g,
        (match, before, arrow, after) => {
            // 如果是在占位符内部（HTML注释占位符），则不处理
            if (before.includes('__HTML_COMMENT_') || after.includes('__HTML_COMMENT_') || 
                before.includes('__REACT_') || after.includes('__REACT_')) {
                return match;
            }
            return `${before}\`→\`${after}`;
        }
    );

    // 处理箭头符号 "<-", 将其转换为HTML实体或代码格式，但跳过占位符
    result = result.replace(
        /([^\w`]|^)(<-|&lt;-)([^\w`]|$)/g,
        (match, before, arrow, after) => {
            // 如果是在占位符内部（HTML注释占位符），则不处理
            if (before.includes('__HTML_COMMENT_') || after.includes('__HTML_COMMENT_') || 
                before.includes('__REACT_') || after.includes('__REACT_')) {
                return match;
            }
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
            // 跳过React组件占位符
            if (before.includes('__REACT_') || before.includes('__HTML_COMMENT_')) {
                return match;
            }
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
        /([^\w`<]|^)(<)(?!TabItem|\/TabItem|Tabs|\/Tabs)(\d+[^\s>]*)/g,
        (match, before, openBracket, number) => {
            // 跳过React组件占位符
            if (before.includes('__REACT_') || before.includes('__HTML_COMMENT_')) {
                return match;
            }
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

    // 恢复被保护的React组件
    result = restoreReactComponents(result);

    // 修复所有错误编码的Tabs和TabItem组件标签
    result = result.replace(/&lt;(\/?)Tabs(\s+[^>]*)?&gt;/g, '<$1Tabs$2>');
    result = result.replace(/&lt;(\/?)TabItem(\s+[^>]*)?&gt;/g, '<$1TabItem$2>');
    
    // 修复半转换的标签（前尖括号正常，后尖括号被转义）
    result = result.replace(/<(Tabs|TabItem)([^>]*?)&gt;/g, '<$1$2>');
    result = result.replace(/<\/(Tabs|TabItem)&gt;/g, '</$1>');
    
    // 修复JSX属性中的表达式
    result = result.replace(/default=\{([^}]*?)&quot;([^}]*?)&quot;\}/g, 'default={$1"$2"}');
    result = result.replace(/default=\{([^}]*?)&#39;([^}]*?)&#39;\}/g, 'default={$1\'$2\'}');
    
    // 特别处理 default={kotlin === "kotlin"} 这类表达式
    result = result.replace(/default=\{([^}]*?) === &quot;([^}]*?)&quot;\}/g, 'default={$1 === "$2"}');
    result = result.replace(/default=\{([^}]*?) === &#39;([^}]*?)&#39;\}/g, 'default={$1 === \'$2\'}');

    // 处理混合形式的表格标签（开始标签是HTML形式，结束标签是实体形式，或反之）
    result = result.replace(/<tr>[\s\S]*?&lt;\/tr&gt;/g, function(match) {
        return match.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    });

    result = result.replace(/&lt;tr&gt;[\s\S]*?<\/tr>/g, function(match) {
        return match.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    });

    return result;
}

// 新增函数：保护HTML注释
function protectHtmlComments(content) {
    const commentPlaceholders = {};
    let placeholderIndex = 0;
    
    // 使用一个唯一的占位符替换每个HTML注释
    const result = content.replace(/<!--[\s\S]*?-->/g, (match) => {
        const placeholder = `__HTML_COMMENT_${placeholderIndex}__`;
        commentPlaceholders[placeholder] = match;
        placeholderIndex++;
        return placeholder;
    });
    
    // 存储占位符映射到全局变量，以便后续恢复
    global.commentPlaceholders = commentPlaceholders;
    
    return result;
}

// 新增函数：恢复HTML注释
function restoreHtmlComments(content) {
    let result = content;
    
    // 获取之前存储的占位符映射
    const commentPlaceholders = global.commentPlaceholders || {};
    
    // 恢复所有HTML注释
    Object.keys(commentPlaceholders).forEach(placeholder => {
        const comment = commentPlaceholders[placeholder];
        // 使用全局替换，确保所有占位符都被替换
        const regex = new RegExp(placeholder, 'g');
        result = result.replace(regex, comment);
    });
    
    // 将MDX注释转换为HTML注释（如果还需要这一步）
    result = result.replace(/\{\/\*\s*Commented out include tag\s*\*\/\}/g, '<!-- Commented out include tag -->');
    
    return result;
}

// 新增函数：保护React组件不被其他规则修改
function protectReactComponents(content) {
    const componentPlaceholders = {};
    let placeholderIndex = 0;
    
    // 保护Tabs和TabItem组件
    const result = content.replace(/<(Tabs|TabItem)([^>]*?)>|<\/(Tabs|TabItem)>/g, (match) => {
        const placeholder = `__REACT_COMPONENT_${placeholderIndex}__`;
        componentPlaceholders[placeholder] = match;
        placeholderIndex++;
        return placeholder;
    });
    
    // 保护JSX表达式 {...}
    const withJsxProtected = result.replace(/default=\{([^}]*?)\}/g, (match) => {
        const placeholder = `__REACT_JSX_${placeholderIndex}__`;
        componentPlaceholders[placeholder] = match;
        placeholderIndex++;
        return placeholder;
    });
    
    // 存储占位符映射到全局变量
    global.reactComponentPlaceholders = componentPlaceholders;
    
    return withJsxProtected;
}

// 新增函数：恢复被保护的React组件
function restoreReactComponents(content) {
    let result = content;
    
    // 获取之前存储的占位符映射
    const componentPlaceholders = global.reactComponentPlaceholders || {};
    
    // 恢复所有React组件
    Object.keys(componentPlaceholders).forEach(placeholder => {
        const component = componentPlaceholders[placeholder];
        // 使用全局替换，确保所有占位符都被替换
        const regex = new RegExp(placeholder, 'g');
        result = result.replace(regex, component);
    });
    
    return result;
}

// 添加一个函数处理HTML表格中的实体编码
function decodeHtmlEntitiesInTables(content) {
  // 先处理整个文档中以&lt;table&gt;开头的表格（完全是实体形式的表格）
  let result = content.replace(
    /&lt;table&gt;[\s\S]*?&lt;\/table&gt;/g,
    function(match) {
      return match
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    }
  );
  
  // 再处理已经是HTML形式的表格
  result = result.replace(
    /(<table>[\s\S]*?<\/table>)/g, 
    function(match) {
      return match
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    }
  );
  
  return result;
}