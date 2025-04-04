const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { GoogleGenAI } = require("@google/genai");

// 配置项
const config = {
    sourceDir: './demo/docs',
    targetLanguages: ['zh-CN'],
    modelConfigs: {
        'zh-CN': { provider: 'google', model: 'gemini-2.0-flash' }
    },
    translationMemoryPath: './demo/translation-memory.json',
    terminologyPath: './demo/terminology.json',
    segmentSizeLimit: 2000, // 设置段落大小限制（字符数）
    segmentSeparators: ['\n## ', '\n### ', '\n#### ', '\n##### ', '\n###### ', '\n\n'], // 分段标识符
};

// Google LLM API
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// 加载翻译记忆和术语库
let translationMemory = {};
let terminology = {};

try {
    translationMemory = JSON.parse(fs.readFileSync(config.translationMemoryPath, 'utf8'));
} catch (error) {
    translationMemory = {};
    config.targetLanguages.forEach(lang => {
        translationMemory[lang] = {};
    });
}

try {
    terminology = JSON.parse(fs.readFileSync(config.terminologyPath, 'utf8'));
} catch (error) {
    terminology = { terms: {} };
}

// 计算文本的哈希值
function getTextHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
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

// 将文档分割成段落
function splitIntoSegments(content) {
    // 预处理：保护代码块
    const codeBlocks = [];
    let contentWithPlaceholders = content;
    
    // 提取并保护所有代码块
    const codeBlockRegex = /```[\s\S]*?```/g;
    let match;
    let index = 0;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
        const placeholder = `__CODE_BLOCK_${index}__`;
        codeBlocks.push(match[0]);
        contentWithPlaceholders = contentWithPlaceholders.replace(match[0], placeholder);
        index++;
    }
    
    // 按标题和段落分隔
    let segments = [];
    
    // 按主要分隔符分割
    let tempSegments = [contentWithPlaceholders];
    
    for (const separator of config.segmentSeparators) {
        let newSegments = [];
        
        for (const segment of tempSegments) {
            if (!segment.trim()) continue;
            
            const parts = segment.split(separator);
            
            if (parts.length > 0) {
                newSegments.push(parts[0]);
                
                for (let i = 1; i < parts.length; i++) {
                    // 保留分隔符前缀，移除前导空格
                    newSegments.push(separator.substring(1) + parts[i]);
                }
            }
        }
        
        tempSegments = newSegments;
    }
    
    // 不再处理过长段落，直接使用分隔符分割后的结果
    segments = tempSegments;
    
    // 恢复代码块
    segments = segments.map(segment => {
        let restoredSegment = segment;
        for (let i = 0; i < codeBlocks.length; i++) {
            const placeholder = `__CODE_BLOCK_${i}__`;
            if (restoredSegment.includes(placeholder)) {
                restoredSegment = restoredSegment.replace(placeholder, codeBlocks[i]);
            }
        }
        return restoredSegment;
    });
    
    // 最终过滤空段落
    return segments.filter(segment => segment.trim().length > 0);
}

// 准备翻译提示词
function prepareTranslationPrompt(sourceText, targetLang, isSegment = true) {
    // 获取相关术语
    const relevantTerms = Object.entries(terminology.terms)
        .filter(([term]) => sourceText.includes(term))
        .map(([term, translations]) => `"${term}" → "${translations[targetLang]}"`)
        .join('\n');

    return `# 翻译指令

你是一位精通技术文档翻译的专业翻译系统，负责将英文技术文档准确翻译为${getLangDisplayName(targetLang)}。请严格遵循以下要求：

## 任务定义
将给定的技术文档${isSegment ? '片段' : ''}从英文翻译为${getLangDisplayName(targetLang)}，保持专业性和准确性。这是关于Kotlin依赖注入框架Koin的文档。

## 翻译要求
1. 保持所有Markdown格式、代码块和链接不变
2. 代码示例内的代码**不要翻译**
3. 保持原文的段落结构和标点符号风格
4. 术语表中的术语必须使用指定翻译
5. 技术概念必须准确翻译，不能有歧义
6. 翻译风格应保持技术文档的专业性和简洁性
7. 对于无法确定的专有名词，保留英文原文
8. ${isSegment ? '这是文档的一个片段，专注于翻译当前内容' : '翻译整个文档，保持文档作为一个整体'}
9. **非常重要**：不要在翻译中引入多余的字符，特别是不要使用"\\n"或单独的"n"字符来表示换行
10. 保持Markdown格式的一致性，确保代码块标记（\`\`\`）正确配对

## 术语表
${relevantTerms || '无相关术语'}

## 待翻译内容
\`\`\`markdown
${sourceText}
\`\`\`

## 输出要求
- 仅输出翻译结果，不要添加解释或注释
- 保持所有原始的Markdown语法和格式
- 保留原文中的所有代码块、变量名和函数名不变
- 确保所有链接和引用保持不变`;
}

// 调用LLM API进行翻译
async function translateWithLLM(text, targetLang, isSegment = true) {
    const modelConfig = config.modelConfigs[targetLang];
    const prompt = prepareTranslationPrompt(text, targetLang, isSegment);

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
                temperature: 0.1
            }
        });

        return response.text;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

// 处理翻译结果
function processTranslatedText(translatedText) {
    // 移除可能的代码块标记
    let processed = translatedText;
    
    // 处理翻译结果被包裹在markdown代码块的情况
    if (processed.startsWith('```markdown') && processed.endsWith('```')) {
        processed = processed.slice(10, -3).trim();
    }
    
    // 清理常见的格式问题
    processed = processed
        // 修复错误的换行符表示
        .replace(/([^\\])\\n/g, '$1\n')
        .replace(/^\\n/g, '\n')
        .replace(/\\n$/g, '\n')
        // 移除孤立的n字符
        .replace(/(\s)n(\s)/g, '$1$2')
        .replace(/^n\s/g, '')
        .replace(/\sn$/g, '')
        .replace(/\bn\b/g, '')
        // 修复可能错误的Markdown格式
        .replace(/```markdown\s/g, '```')
        .replace(/\n{3,}/g, '\n\n');
    
    return processed;
}

// 翻译文件
async function translateFile(filePath) {
    console.log(`Translating file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const fileHash = getTextHash(content);

    const { frontmatter, mainContent } = extractFrontmatterAndContent(content);

    for (const targetLang of config.targetLanguages) {
        const targetPath = path.join(config.sourceDir + "_" + targetLang, filePath.replace(config.sourceDir.replace('./', ''), ''));

        // 创建目标目录
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // 检查翻译记忆
        if (translationMemory[targetLang] && translationMemory[targetLang][fileHash]) {
            console.log(`Using cached translation for ${targetLang}: ${targetPath}`);
            fs.writeFileSync(targetPath, translationMemory[targetLang][fileHash].translation);
            continue;
        }

        // 翻译内容（保留 frontmatter）
        let translatedContent;
        if (mainContent.trim()) {
            // 分段翻译
            const segments = splitIntoSegments(mainContent);
            console.log(`Divided document into ${segments.length} segments`);
            
            // 创建段落映射以保持原始顺序
            const segmentMap = new Map();
            const pendingTranslations = [];
            
            // 准备所有翻译任务
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const segmentHash = getTextHash(segment);
                
                // 检查段落是否有翻译记忆
                if (translationMemory[targetLang] && translationMemory[targetLang][segmentHash]) {
                    console.log(`Using cached translation for segment ${i+1}/${segments.length}`);
                    segmentMap.set(i, translationMemory[targetLang][segmentHash].translation);
                } else {
                    console.log(`Preparing to translate segment ${i+1}/${segments.length} (${segment.length} chars)`);
                    pendingTranslations.push({
                        index: i,
                        segment: segment,
                        segmentHash: segmentHash
                    });
                }
            }
            
            // 执行所有待处理的翻译
            for (let i = 0; i < pendingTranslations.length; i++) {
                const { index, segment, segmentHash } = pendingTranslations[i];
                console.log(`Translating segment ${index+1}/${segments.length} (${segment.length} chars)`);
                
                let translatedSegment;
                try {
                    translatedSegment = await translateWithLLM(segment, targetLang, true);
                    translatedSegment = processTranslatedText(translatedSegment);
                } catch (error) {
                    console.error(`Error translating segment ${index+1}:`, error);
                    // 如果翻译失败，使用原文
                    translatedSegment = segment;
                }
                
                // 保存段落翻译记忆
                if (!translationMemory[targetLang]) {
                    translationMemory[targetLang] = {};
                }
                
                translationMemory[targetLang][segmentHash] = {
                    source: segment,
                    translation: translatedSegment,
                    lastUpdated: new Date().toISOString()
                };
                
                segmentMap.set(index, translatedSegment);
            }
            
            // 按原始顺序合并翻译结果
            const translatedSegments = [];
            for (let i = 0; i < segments.length; i++) {
                translatedSegments.push(segmentMap.get(i));
            }
            
            // 智能合并翻译段落
            translatedContent = frontmatter;
            
            // 特殊处理第一个段落
            if (translatedSegments.length > 0) {
                translatedContent += translatedSegments[0];
            }
            
            // 合并其余段落，确保格式正确
            for (let i = 1; i < translatedSegments.length; i++) {
                const currentSegment = translatedSegments[i];
                const prevSegment = translatedSegments[i-1];
                
                // 检查是否需要添加换行
                // 1. 如果当前段落以标题开始，确保前面有空行
                // 2. 如果上一段落以代码块结束，确保有空行
                const isCurrentStartingWithHeading = /^#{1,6}\s/.test(currentSegment.trim());
                const isPrevEndingWithCodeBlock = prevSegment.trim().endsWith('```');
                
                if (isCurrentStartingWithHeading && !prevSegment.endsWith('\n\n')) {
                    if (prevSegment.endsWith('\n')) {
                        translatedContent += '\n';
                    } else {
                        translatedContent += '\n\n';
                    }
                } else if (isPrevEndingWithCodeBlock && !prevSegment.endsWith('\n\n')) {
                    translatedContent += '\n\n';
                } else if (!prevSegment.endsWith('\n')) {
                    translatedContent += '\n';
                }
                
                translatedContent += currentSegment;
            }
            
            // 最终清理整个翻译文档
            translatedContent = translatedContent
                // 清理可能的空代码块
                .replace(/```\s*```/g, '')
                // 限制连续换行
                .replace(/\n{3,}/g, '\n\n')
                // 确保代码块完整性
                .replace(/```([^`]*?)(?!\n```)/g, '```$1\n```')
                // 最终检查孤立的n字符
                .replace(/\bn\b/g, '');
            
            // 保存整个文件的翻译记忆
            translationMemory[targetLang][fileHash] = {
                source: content,
                translation: translatedContent,
                lastUpdated: new Date().toISOString()
            };
        } else {
            // 只有 frontmatter 的情况，直接复制
            translatedContent = content;
        }

        // 写入翻译后的文件
        fs.writeFileSync(targetPath, translatedContent);
        console.log(`Translated to ${targetLang}: ${targetPath}`);
    }
}

// 获取语言显示名称
function getLangDisplayName(langCode) {
    const names = {
        'zh-CN': '简体中文'
    };
    return names[langCode] || langCode;
}

// 主函数
async function main() {
    const changedFiles = process.env.ALL_CHANGED_FILES.split(/[\s,]+/);
    console.log(`Found ${changedFiles.length} changed files`);

    for (const file of changedFiles) {
        await translateFile(file);
    }

    // 保存翻译记忆
    fs.writeFileSync(config.translationMemoryPath, JSON.stringify(translationMemory, null, 2));
    console.log('Translation completed and memory saved');
}

main().catch(console.error);
