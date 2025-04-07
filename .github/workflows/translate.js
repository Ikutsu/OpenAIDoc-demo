const fs = require('fs');
const path = require('path');
const { GoogleGenAI  } = require("@google/genai");

// 从配置文件加载配置项
const configPath = path.resolve(__dirname, './translate-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Google LLM API
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// 修复 Markdown 文件中的损坏链接
function fixBrokenLinks(content, filePath) {
    console.log(`正在修复文件中的损坏链接: ${filePath}`);
    
    // 定义链接修复规则
    const linkFixRules = [
        // 1. 将 `/docs/` 开头的链接修改为正确的路径
        {
            pattern: /\[([^\]]+)\]\(\/docs\/([^\)]+)\)/g,
            replacer: (match, text, link) => {
                console.log(`  修复 /docs/ 链接: ${match} -> [${text}](/${link})`);
                return `[${text}](/${link})`;
            }
        },
        // 2. 修复格式错误的链接，如 [text]([url](link))
        {
            pattern: /\[([^\]]+)\]\(\[url\]\(([^\)]+)\)\)/g,
            replacer: (match, text, url) => {
                console.log(`  修复格式错误的链接: ${match} -> [${text}](${url})`);
                return `[${text}](${url})`;
            }
        },
        // 3. 将绝对路径链接转换为相对路径链接 (特别针对于 Docusaurus 无法解析的路径)
        {
            pattern: /\[([^\]]+)\]\(\/([^\/][^\)]+)\)/g,
            replacer: (match, text, link) => {
                // 计算相对路径
                const currentDir = path.dirname(filePath.replace(config.sourceDir, ''));
                let targetPath = `/${link}`;
                // 如果原始路径包含锚点，需要保留
                const hashPos = link.indexOf('#');
                let hash = '';
                if (hashPos !== -1) {
                    hash = link.substring(hashPos);
                    link = link.substring(0, hashPos);
                }
                
                // 获取相对路径
                let relativePath = path.relative(currentDir, path.dirname(`/${link}`));
                if (!relativePath.startsWith('.')) {
                    relativePath = './' + relativePath;
                }
                
                // 拼接文件名
                const fileName = path.basename(link);
                relativePath = path.join(relativePath, fileName).replace(/\\/g, '/');
                
                // 添加 hash
                relativePath = relativePath + hash;
                
                console.log(`  转换绝对路径为相对路径: ${match} -> [${text}](${relativePath})`);
                return `[${text}](${relativePath})`;
            }
        },
        // 4. 为相对路径添加 .md 扩展名
        {
            pattern: /\[([^\]]+)\]\((\.\.\/[^\.][^\)]*)(#[^\)]+)?\)/g,
            replacer: (match, text, relPath, hash = '') => {
                if (!relPath.endsWith('.md') && !relPath.endsWith('/')) {
                    console.log(`  为相对路径添加 .md 扩展名: ${match} -> [${text}](${relPath}.md${hash || ''})`);
                    return `[${text}](${relPath}.md${hash || ''})`;
                }
                return match;
            }
        },
        // 5. 修复带有百分号编码的链接
        {
            pattern: /%5B([^\]]+)%5D\(%5B([^\)]+)%5D\)/g,
            replacer: (match, text, url) => {
                const decodedText = decodeURIComponent(text);
                const decodedUrl = decodeURIComponent(url);
                console.log(`  修复百分号编码链接: ${match} -> [${decodedText}](${decodedUrl})`);
                return `[${decodedText}](${decodedUrl})`;
            }
        },
        // 6. 修复特殊的 Docusaurus 链接格式
        {
            pattern: /\[([^\]]+)\]\(\.\.\/\.\.\/setup\/([^\)]+)\)/g,
            replacer: (match, text, link) => {
                // 针对于常见的"../../setup/koin#android"这类链接问题
                console.log(`  修复相对路径链接: ${match} -> [${text}](../../setup/${link}.md)`);
                // 如果链接为空或未定义，直接返回原链接
                if (!link) {
                    console.log(`  警告: 链接为空 - ${match}`);
                    return match;
                }
                // 如果链接中包含#，需要分离出来
                const parts = link.split('#');
                if (parts.length > 1) {
                    return `[${text}](../../setup/${parts[0]}.md#${parts[1]})`;
                }
                return `[${text}](../../setup/${link}.md)`;
            }
        }
    ];
    
    // 应用所有修复规则
    let modifiedContent = content;
    let totalFixes = 0;
    
    linkFixRules.forEach(({ pattern, replacer }) => {
        let fixCount = 0;
        modifiedContent = modifiedContent.replace(pattern, (...args) => {
            fixCount++;
            return replacer(...args);
        });
        
        if (fixCount > 0) {
            totalFixes += fixCount;
            console.log(`  应用规则修复了 ${fixCount} 个链接`);
        }
    });
    
    // 输出修复结果统计
    if (totalFixes > 0) {
        console.log(`在文件 ${filePath} 中修复了 ${totalFixes} 个损坏链接`);
    } else {
        console.log(`文件 ${filePath} 中未发现需要修复的链接`);
    }
    
    return modifiedContent;
}

// 加载术语库
let terminology = {};

try {
    terminology = JSON.parse(fs.readFileSync(config.terminologyPath, 'utf8'));
} catch (error) {
    terminology = { terms: {} };
}

// 提取 frontmatter 和内容
function extractFrontmatterAndContent(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = content.match(frontmatterRegex);

    if (match) {
        const frontmatter = match[0];
        const mainContent = content.slice(match[0].length);
        return { frontmatter, mainContent };
    }

    return { frontmatter: '', mainContent: content };
}

// 解析和修改 frontmatter
function parseFrontmatter(frontmatter) {
    if (!frontmatter) return { frontmatterObj: {}, rawFrontmatter: '' };
    
    // 去掉 frontmatter 的分隔符
    const contentOnly = frontmatter.replace(/^---\n/, '').replace(/\n---\n$/, '');
    
    // 解析 frontmatter 内容为对象
    const frontmatterObj = {};
    const lines = contentOnly.split('\n');
    
    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // 处理带引号的值
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }
            
            frontmatterObj[key] = value;
        }
    }
    
    return { frontmatterObj, rawFrontmatter: contentOnly };
}

// 生成 frontmatter 字符串
function generateFrontmatter(frontmatterObj) {
    let result = '---\n';
    
    for (const [key, value] of Object.entries(frontmatterObj)) {
        // 如果值包含特殊字符或空格，用引号括起来
        const needsQuotes = /[:"\s]/.test(value);
        result += `${key}: ${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}\n`;
    }
    
    result += '---\n';
    return result;
}

// 翻译 frontmatter 中的标题
async function translateFrontmatter(frontmatter, targetLang, filePath) {
    if (!frontmatter) return '';
    
    const { frontmatterObj, rawFrontmatter } = parseFrontmatter(frontmatter);
    
    // 检查是否为 koin.md 文件，如果是，添加 slug: /
    const fileName = path.basename(filePath);
    if (fileName === process.env.START_PAGE) {
        frontmatterObj.slug = '/';
        console.log(`为文件 ${fileName} 添加了 slug: / 设置`);
    }
    
    // 检查是否有需要翻译的字段
    const fieldsToTranslate = ['title', 'description', 'sidebar_label'];
    const hasFieldsToTranslate = fieldsToTranslate.some(field => frontmatterObj[field]);
    
    if (!hasFieldsToTranslate) {
        // 即使没有需要翻译的字段，仍需要生成新的 frontmatter 以包含可能添加的 slug
        return generateFrontmatter(frontmatterObj);
    }
    
    // 准备要翻译的文本
    const textsToTranslate = [];
    for (const field of fieldsToTranslate) {
        if (frontmatterObj[field]) {
            textsToTranslate.push(`${field}: ${frontmatterObj[field]}`);
        }
    }
    
    if (textsToTranslate.length === 0) {
        return generateFrontmatter(frontmatterObj);
    }
    
    // 将字段拼接成文本进行翻译
    const textToTranslate = textsToTranslate.join('\n');
    const translatedText = await translateWithLLM(textToTranslate, targetLang, filePath);
    const cleanedTranslatedText = cleanupTranslation(translatedText);
    
    // 将翻译结果解析回对象
    const translatedLines = cleanedTranslatedText.split('\n');
    for (const line of translatedLines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // 如果是我们要翻译的字段，更新值
            if (fieldsToTranslate.includes(key) && frontmatterObj[key]) {
                frontmatterObj[key] = value;
            }
        }
    }
    
    // 生成新的 frontmatter
    return generateFrontmatter(frontmatterObj);
}

// 计算目标文件路径
function getTargetPath(filePath, targetLang) {
    // 如果是简体中文，直接存在 baseDir/docs 下
    if (targetLang === 'zh-Hans') {
        const baseDir = process.env.BASE_DIR || '.';
        const relativePath = path.relative(config.sourceDir, filePath);
        return path.join(baseDir, 'docs', relativePath);
    } 
    // 其他语言存在 i18n/[语言]/content-docs/current 下
    else {
        const baseDir = process.env.BASE_DIR || '.';
        const relativePath = path.relative(config.sourceDir, filePath);
        return path.join(baseDir, 'i18n', targetLang, 'docusaurus-plugin-content-docs', 'current', relativePath);
    }
}

// 加载之前翻译过的相关文件作为参考
function loadPreviousTranslations(targetLang, currentFilePath) {
    try {
        // 计算对应翻译文件的路径
        const targetPath = getTargetPath(currentFilePath, targetLang);
        
        console.log(`尝试加载参考翻译: ${targetPath}`);
        
        // 检查是否存在对应的翻译文件
        if (!fs.existsSync(targetPath)) {
            console.log(`参考翻译文件不存在: ${targetPath}`);
            return [];
        }
        
        // 读取之前的翻译内容
        const content = fs.readFileSync(targetPath, 'utf8');
        console.log(`成功加载参考翻译文件: ${targetPath}`);
        
        return [{
            file: targetPath,
            content: content
        }];
        
    } catch (error) {
        console.error("Error loading previous translation:", error);
        return [];
    }
}

// 准备翻译提示词
function prepareTranslationPrompt(sourceText, targetLang, currentFilePath) {
    // 获取相关术语
    const relevantTerms = Object.entries(terminology.terms)
        .filter(([term]) => sourceText.includes(term))
        .map(([term, translations]) => `"${term}" → "${translations[targetLang]}"`)
        .join('\n');
    
    // 获取同名的之前翻译文件作为参考
    const previousTranslations = loadPreviousTranslations(targetLang, currentFilePath);
    
    // 构建参考翻译部分
    let translationReferences = '';
    if (previousTranslations.length > 0) {
        translationReferences = '\n## 参考翻译（参考以下之前翻译过的文档，保持风格和术语一致性）\n';
        translationReferences += `### 之前的翻译版本\n\`\`\`\n${previousTranslations[0].content}\n\`\`\`\n\n`;
    }

    return `你是一位精通技术文档翻译的专业翻译人员，负责将英文技术文档准确翻译为${getLangDisplayName(targetLang)}。请严格遵循以下要求：
    
    ## 翻译风格和质量要求
    1. 尽量符合${getLangDisplayName(targetLang)}互联网的使用语境，并正确处理倒装和不同语言的语序，给专业的名词适当保留括号以及英文注释
    2. 术语使用统一、准确，并根据上下文自然融入语句

    ## 技术要求

    1. 保持所有 Markdown 格式、代码块和链接不变  
    2. 代码示例内的代码**不要翻译**
    3. 术语表中的术语必须使用指定翻译
    4. 对于无法确定的专有名词，保留英文原文
    5. 参考提供的之前翻译过的文档，保持翻译风格和术语使用的一致性

    ## 输出要求

    - 仅输出翻译结果，不要添加解释或注释
    - 保持所有原始的 Markdown 语法和格式
    - 保留原文中的所有代码块、变量名和函数名不变
    - 确保所有链接和引用保持不变
    
    ## 术语表
    ${relevantTerms || '无相关术语'}

    ## 参考翻译
    ${translationReferences || '无参考翻译'}

    ## 待翻译内容
    \`\`\`markdown
    ${sourceText}
    \`\`\`
    `;
}

// 调用LLM API进行翻译
async function translateWithLLM(text, targetLang, filePath) {
    const modelConfig = config.modelConfigs[targetLang];
    const prompt = prepareTranslationPrompt(text, targetLang, filePath);

    console.log(`Translating to ${targetLang} using ${modelConfig.provider}:${modelConfig.model}`);

    if (modelConfig.provider === 'google') {
        return await callGemini(prompt, modelConfig.model);
    }

    throw new Error(`Unsupported provider: ${modelConfig.provider}`);
}

// 调用Gemini API
async function callGemini(prompt, model) {
    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 1
            }
        });

        return response.text;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

// 翻译文件
async function translateFile(filePath) {
    console.log(`Translating file: ${filePath}`);
    
    if (!filePath) {
        console.error('无效的文件路径');
        return;
    }
    
    // 修正文件路径，需要从REPO_PATH中读取源文件
    const absoluteFilePath = path.resolve(process.env.REPO_PATH, filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(absoluteFilePath)) {
        console.error(`File not found: ${absoluteFilePath}`);
        return;
    }
    
    try {
        let content = fs.readFileSync(absoluteFilePath, 'utf8');
        
        // 在翻译前修复损坏链接
        content = fixBrokenLinks(content, filePath);

        const { frontmatter, mainContent } = extractFrontmatterAndContent(content);

        for (const targetLang of config.targetLanguages) {
            try {
                // 使用新的路径计算函数
                const targetPath = getTargetPath(filePath, targetLang);
                
                if (!targetPath) {
                    console.error(`无法获取目标路径: ${filePath} -> ${targetLang}`);
                    continue;
                }

                // 创建目标目录
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });

                // 翻译 frontmatter
                const translatedFrontmatter = await translateFrontmatter(frontmatter, targetLang, filePath);

                // 翻译内容
                let translatedContent;
                if (mainContent && mainContent.trim()) {
                    translatedContent = await translateWithLLM(mainContent, targetLang, filePath);

                    // 检查翻译结果
                    if (!translatedContent) {
                        console.error(`翻译结果为空: ${filePath} -> ${targetLang}`);
                        continue;
                    }

                    // 清理翻译结果中的多余内容
                    translatedContent = cleanupTranslation(translatedContent);

                    // 完整文档 = 翻译后的 frontmatter + 翻译后的内容
                    translatedContent = translatedFrontmatter + translatedContent;
                } else {
                    // 只有 frontmatter 的情况，使用翻译后的 frontmatter
                    translatedContent = translatedFrontmatter;
                }

                // 写入翻译后的文件
                fs.writeFileSync(targetPath, translatedContent);
                console.log(`Translated to ${targetLang}: ${targetPath}`);
            } catch (langError) {
                console.error(`Error translating to ${targetLang}: ${langError.message}`);
            }
        }
    } catch (fileError) {
        console.error(`Error processing file ${filePath}: ${fileError.message}`);
    }
}

// 清理翻译结果中的多余内容
function cleanupTranslation(text) {
    // 移除开头的 markdown 代码块标记
    if (text.startsWith('```markdown')) {
        text = text.replace(/^```markdown\n/, '');
    } else if (text.startsWith('```md')) {
        text = text.replace(/^```md\n/, '');
    } else if (text.startsWith('```')) {
        text = text.replace(/^```\n/, '');
    }
    
    // 移除结尾的 markdown 代码块标记
    if (text.endsWith('```')) {
        text = text.replace(/```$/, '');
    }
    
    // 移除多余的 'n' 字符（通常出现在翻译API的错误输出中）
    text = text.replace(/([^\\])\\n/g, '$1\n'); // 将不是转义字符的 \n 替换为实际换行
    text = text.replace(/^\\n/g, '\n'); // 处理行首的 \n
    
    // 移除多余的空行
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // 移除可能的多余空格
    text = text.trim();
    
    return text;
}

// 获取语言显示名称
function getLangDisplayName(langCode) {
    return config.languageNames[langCode] || langCode;
}

// 主函数
async function main() {
    const changedFilesInput = process.env.CHANGED_FILES || '';
    console.log(`环境变量 CHANGED_FILES: ${changedFilesInput}`);
    
    const changedFiles = changedFilesInput.split(/[\s,]+/).filter(file => file.trim());
    console.log(`Found ${changedFiles.length} changed files`);

    if (changedFiles.length === 0) {
        console.log('没有找到需要翻译的文件，如果需要指定文件，请设置 CHANGED_FILES 环境变量');
        return;
    }

    for (const file of changedFiles) {
        try {
            await translateFile(file);
        } catch (error) {
            console.error(`Error translating ${file}:`, error);
            // 继续处理下一个文件
        }
    }

    console.log('Translation completed');
}

main().catch(console.error);
