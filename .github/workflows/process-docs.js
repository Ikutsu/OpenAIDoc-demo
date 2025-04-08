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
  transformedContent = convertFrontmatter(transformedContent, filePath);    // 步骤1
  transformedContent = convertAdmonitions(transformedContent);              // 步骤2
  transformedContent = convertImages(transformedContent);                   // 步骤3
  transformedContent = convertTabs(transformedContent);                     // 步骤4
  transformedContent = removeKotlinRunnable(transformedContent);            // 步骤5
  transformedContent = formatHtmlTags(transformedContent);                  // 步骤6
  
  // 如果提供了变量文件，应用变量替换
  if (varsFilePath && fs.existsSync(varsFilePath)) {
    transformedContent = replaceVariables(transformedContent, varsFilePath); // 步骤7
  }
  
  // 直接写回原文件
  fs.writeFileSync(filePath, transformedContent, 'utf8');
  console.log(`已处理文件: ${filePath}`);
}

// 步骤1: 转换Frontmatter
function convertFrontmatter(content, inputFile) {
  // 从注释中提取标题
  const titleMatch = content.match(/\[\/\/\]: # \(title: (.*?)\)/);
  const title = titleMatch ? titleMatch[1] : path.basename(inputFile, path.extname(inputFile));
  
  // 移除原始的标题注释
  let newContent = content.replace(/\[\/\/\]: # \(title: .*?\)\n/, '');
  
  // 获取START_PAGE环境变量，默认为getting-started.md
  const startPage = process.env.START_PAGE || 'getting-started.md';
  
  // 检查当前文件是否是START_PAGE
  const isStartPage = inputFile.endsWith(startPage);
  
  // 添加Docusaurus frontmatter，对起始页添加slug: /
  if (isStartPage) {
    console.log(`为起始页 ${inputFile} 添加slug: /属性`);
    newContent = `---\ntitle: ${title}\nslug: /\n---\n\n${newContent}`;
  } else {
    newContent = `---\ntitle: ${title}\n---\n\n${newContent}`;
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
  
  // 确保<p>后面有换行
  result = result.replace(/<p>\s*/g, '<p>\n   ');
  
  // 确保</p>前面有换行
  result = result.replace(/\s*<\/p>/g, '\n   </p>');
  
  // 处理表格单元格 - 使用更直接的替换方法
  // 1. 替换所有<td>为<td>\n   
  result = result.replace(/<td>/g, '<td>\n   ');
  
  // 2. 确保</td>前面有换行
  result = result.replace(/\s*<\/td>/g, '\n   </td>');
  
  // 3. 修复可能出现的多余空行和缩进
  result = result.replace(/<td>\n   \s*\n\s*/g, '<td>\n   ');
  
  return result;
}

// 步骤3: 转换图片标记
function convertImages(content) {
  let newContent = content;
  
  // 转换带宽度和类型的图片为JSX格式
  newContent = newContent.replace(
    /!\[(.*?)\]\((.*?)\)\{width=(\d+)\}\{type="joined"\}/g,
    '<img src="$2" width="$3" alt="$1" style={{verticalAlign: \'middle\'}}/>'
  );
  
  // 转换带宽度的图片为JSX格式
  newContent = newContent.replace(
    /!\[(.*?)\]\((.*?)\)\{width=(\d+)\}/g,
    '<img src="$2" width="$3" alt="$1" style={{verticalAlign: \'middle\'}}/>'
  );
  
  // 转换标准图片
  newContent = newContent.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img src="$2" alt="$1" style={{verticalAlign: \'middle\'}}/>'
  );
  
  // 修复图片路径，添加/img/前缀，处理任何类型的文件
  newContent = newContent.replace(/src="([^\/][^"]*?)"/g, 'src="/img/$1"');
  
  // 删除<img>标签后的{type="joined"}
  newContent = newContent.replace(
    /<img (.*?)\/>\{type="joined"\}/g,
    '<img $1/>'
  );
  
  // 为已有的没有style属性的img标签添加垂直对齐样式
  newContent = newContent.replace(
    /<img\s+([^>]*?)(?:\/?>)/g,
    (match, attributes) => {
      // 检查是否已有style属性
      if (attributes.includes('style=')) {
        return match; // 如果已有style，保持不变
      }
      // 如果img标签末尾是自闭合的
      if (match.endsWith('/>')) {
        return match.replace('/>', " style={{verticalAlign: 'middle'}}/>");
      }
      // 如果img标签是非自闭合的
      return match.replace('>', " style={{verticalAlign: 'middle'}}/>");
    }
  );
  
  return newContent;
}

// 步骤4: 转换Tabs组件
function convertTabs(content) {
  // 检查文件是否包含tabs标签
  if (content.includes('<tabs') || content.includes('<tab ')) {
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
    
    // 转换tabs标签
    content = content.replace(/<tabs group="(.*?)">/g, '<Tabs>');
    content = content.replace(/<\/tabs>/g, '</Tabs>');
    
    // 转换tab标签
    content = content.replace(
      /<tab title="(.*?)" group-key="(.*?)">/g,
      '<TabItem value="$2" label="$1" default={$2 === "kotlin"}>'
    );
    content = content.replace(/<\/tab>/g, '</TabItem>');
  }
  
  return content;
}

// 步骤5: 移除kotlin-runnable相关标记
function removeKotlinRunnable(content) {
  // 移除独立一行的{kotlin-runnable...}标记 - 处理多种变体
  let result = content;
  
  // 移除单独一行上的{kotlin-runnable...}标记
  result = result.replace(/^\{kotlin-runnable.*?\}\s*$/gm, '');
  
  // 移除单独一行上的{kotlin-...}类似标记（更通用的处理）
  result = result.replace(/^\{kotlin-.*?\}\s*$/gm, '');
  
  // 移除Kotlin代码示例中的//sampleStart和//sampleEnd注释
  result = result.replace(/^\s*\/\/sampleStart\s*$/gm, '');
  result = result.replace(/^\s*\/\/sampleEnd\s*$/gm, '');
  
  return result;
}

// 步骤7: 处理变量替换
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