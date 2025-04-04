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
    let segments = [];
    let currentSegment = '';
    
    // 首先按照标题和空行分隔符进行初步分割
    let tempSegments = [content];
    
    for (const separator of config.segmentSeparators) {
        let newSegments = [];
        
        for (const segment of tempSegments) {
            // 跳过空段落
            if (!segment.trim()) continue;
            
            // 检查当前段落是否包含代码块
            const codeBlockMatches = segment.match(/```[\s\S]*?```/g);
            if (codeBlockMatches) {
                // 如果包含代码块，暂时将代码块替换为占位符
                const placeholders = {};
                let segmentWithPlaceholders = segment;
                
                codeBlockMatches.forEach((codeBlock, index) => {
                    const placeholder = `__CODE_BLOCK_${index}__`;
                    placeholders[placeholder] = codeBlock;
                    segmentWithPlaceholders = segmentWithPlaceholders.replace(codeBlock, placeholder);
                });
                
                // 对替换后的文本进行分段
                const subSegments = segmentWithPlaceholders.split(separator);
                
                // 恢复代码块
                subSegments.forEach((subSegment, index) => {
                    Object.keys(placeholders).forEach(placeholder => {
                        subSegments[index] = subSegments[index].replace(placeholder, placeholders[placeholder]);
                    });
                });
                
                // 添加分隔符前缀（除了第一个段落）
                if (subSegments.length > 0) {
                    newSegments.push(subSegments[0]);
                    for (let i = 1; i < subSegments.length; i++) {
                        newSegments.push(separator.substring(1) + subSegments[i]);
                    }
                }
            } else {
                // 如果不包含代码块，直接分段
                const subSegments = segment.split(separator);
                
                if (subSegments.length > 0) {
                    newSegments.push(subSegments[0]);
                    for (let i = 1; i < subSegments.length; i++) {
                        newSegments.push(separator.substring(1) + subSegments[i]);
                    }
                }
            }
        }
        
        tempSegments = newSegments;
    }
    
    // 然后处理超长段落
    for (const segment of tempSegments) {
        // 跳过空段落
        if (!segment.trim()) continue;
        
        // 如果当前段落超过大小限制且不包含代码块，尝试在句子边界分割
        if (segment.length > config.segmentSizeLimit && !segment.includes('```')) {
            const sentences = segment.match(/[^.!?]+[.!?]+/g) || [segment];
            
            for (const sentence of sentences) {
                if (currentSegment.length + sentence.length > config.segmentSizeLimit && currentSegment.length > 0) {
                    segments.push(currentSegment);
                    currentSegment = sentence;
                } else {
                    currentSegment += sentence;
                }
            }
            
            if (currentSegment.length > 0) {
                segments.push(currentSegment);
                currentSegment = '';
            }
        } else {
            // 保持代码块完整性或处理小段落
            segments.push(segment);
        }
    }
    
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
    if (processed.startsWith('```markdown') && processed.endsWith('```')) {
        processed = processed.slice(10, -3).trim();
    }
    
    // 清理错误的换行符表示
    processed = processed.replace(/([^\\])\\n/g, '$1\n');  // 处理非转义的 \n
    processed = processed.replace(/\bn\b/g, '');  // 移除孤立的 n 字符
    
    // 修复可能错误的 Markdown 格式
    processed = processed.replace(/```markdown\n/g, '');
    
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
            
            let translatedSegments = [];
            
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const segmentHash = getTextHash(segment);
                
                // 检查段落是否有翻译记忆
                let translatedSegment;
                if (translationMemory[targetLang] && translationMemory[targetLang][segmentHash]) {
                    console.log(`Using cached translation for segment ${i+1}/${segments.length}`);
                    translatedSegment = translationMemory[targetLang][segmentHash].translation;
                } else {
                    console.log(`Translating segment ${i+1}/${segments.length} (${segment.length} chars)`);
                    translatedSegment = await translateWithLLM(segment, targetLang, true);
                    translatedSegment = processTranslatedText(translatedSegment);
                    
                    // 保存段落翻译记忆
                    if (!translationMemory[targetLang]) {
                        translationMemory[targetLang] = {};
                    }
                    
                    translationMemory[targetLang][segmentHash] = {
                        source: segment,
                        translation: translatedSegment,
                        lastUpdated: new Date().toISOString()
                    };
                }
                
                translatedSegments.push(translatedSegment);
            }
            
            // 合并翻译后的段落时检查连接处
            translatedContent = frontmatter;
            
            for (let i = 0; i < translatedSegments.length; i++) {
                if (i > 0) {
                    // 检查段落连接处是否需要添加换行符
                    const prevEndsWithNewline = translatedSegments[i-1].endsWith('\n');
                    const currentStartsWithMarkdown = translatedSegments[i].startsWith('```') || 
                                                      translatedSegments[i].startsWith('## ') || 
                                                      translatedSegments[i].startsWith('### ');
                    
                    if (!prevEndsWithNewline && !currentStartsWithMarkdown) {
                        translatedContent += '\n';
                    }
                }
                
                translatedContent += translatedSegments[i];
            }
            
            // 最终检查整个翻译结果
            translatedContent = translatedContent
                .replace(/```\s+```/g, '')  // 移除空代码块
                .replace(/\n{3,}/g, '\n\n') // 限制连续换行数量
                .replace(/\bn\b/g, '');     // 再次检查孤立的n字符
            
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
