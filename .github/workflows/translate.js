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
    terminologyPath: './demo/terminology.json'
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
    const lines = content.split('\n');
    const blocks = []; // 用于存储最终的文本块
    let currentBlockLines = []; // 用于临时存储当前块的行
    let inCodeBlock = false; // 标记是否在代码块内

    // 辅助函数：当一个块结束时，将其添加到 blocks 数组
    const finalizeCurrentBlock = () => {
        // 只有当当前块有内容时才添加
        if (currentBlockLines.length > 0) {
            blocks.push(currentBlockLines.join('\n'));
        }
        currentBlockLines = []; // 清空，为下一个块做准备
    };

    // 遍历每一行来识别块
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('```') || trimmedLine.startsWith(':::') || trimmedLine.startsWith('---')) {
            if (!inCodeBlock) { // 代码块开始
                finalizeCurrentBlock(); // 结束之前的块
                currentBlockLines.push(line); // 当前行是代码块的第一行
                inCodeBlock = true;
            } else { // 代码块结束
                currentBlockLines.push(line); // 当前行是代码块的最后一行
                inCodeBlock = false;
                finalizeCurrentBlock(); // 将完整的代码块作为一个整体添加到 blocks
            }
            continue; // 处理完代码块标记行，跳到下一行
        }
        // 如果在代码块内部，直接添加行到当前块
        if (inCodeBlock) {
            currentBlockLines.push(line);
            continue; // 跳到下一行
        }

        // 空行通常表示一个块的结束
        if (trimmedLine === '') {
            finalizeCurrentBlock(); // 结束当前块
            // 我们不把空行本身作为一个单独的块，它只是分隔符
            continue; // 跳到下一行
        }

        // 标题行 (#) 通常也开始一个新的块
        if (trimmedLine.startsWith('#')) {
            finalizeCurrentBlock(); // 结束之前的块
            currentBlockLines.push(line); // 标题行开始新的块
            // 标题通常是单行，让下一行的逻辑来结束这个标题块
            continue;
        }

        // 其他所有行（普通文本、列表项、引用等）都添加到当前块
        // 如果 currentBlockLines 为空，意味着这是一个新块的开始
        currentBlockLines.push(line);

    } // 遍历结束

    // 循环结束后，如果 currentBlockLines 中还有剩余内容，需要 finalizing
    finalizeCurrentBlock();

    // 返回所有分段的块
    return blocks;
}

function processTranslatedText(translatedText) {
    let processed = translatedText;
    
    // 移除可能的markdown包装
    if (processed.startsWith('```markdown') && processed.endsWith('```')) {
        processed = processed.slice(10, -3).trim();
    }
    
    return processed;
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
            
            // 收集翻译结果
            const translatedSegments = [];
            
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const segmentHash = getTextHash(segment);
                
                // 尝试使用翻译记忆
                let translatedSegment;
                if (translationMemory[targetLang] && translationMemory[targetLang][segmentHash]) {
                    console.log(`Using cached translation for segment ${i+1}/${segments.length}`);
                    translatedSegment = translationMemory[targetLang][segmentHash].translation;
                } else {
                    console.log(`Translating segment ${i+1}/${segments.length} (${segment.length} chars)`);
                    try {
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
                    } catch (error) {
                        console.error(`Error translating segment ${i+1}:`, error);
                        // 如果翻译失败，使用原文
                        translatedSegment = segment;
                    }
                }
                
                translatedSegments.push(translatedSegment);
            }
            
            // 重建文档并确保保持原始格式
            translatedContent = frontmatter;
            
            // 添加第一个段落
            if (translatedSegments.length > 0) {
                translatedContent += translatedSegments[0];
            }
            
            // 添加剩余段落，确保段落之间有适当的分隔
            for (let i = 1; i < translatedSegments.length; i++) {
                // 添加分隔空行，保持原始文档的段落结构
                // 根据段落的内容确定如何添加空行
                const currentSegment = translatedSegments[i];
                
                // 判断当前段落的类型
                const isHeading = currentSegment.trim().startsWith('#');
                const isCodeBlock = currentSegment.trim().startsWith('```') || 
                                   currentSegment.trim().startsWith(':::') || 
                                   currentSegment.trim().startsWith('---');
                
                // 根据段落类型添加空行
                if (isHeading || isCodeBlock) {
                    // 标题和代码块前添加两个换行
                    if (!translatedContent.endsWith('\n\n')) {
                        if (translatedContent.endsWith('\n')) {
                            translatedContent += '\n';
                        } else {
                            translatedContent += '\n\n';
                        }
                    }
                } else {
                    // 普通段落前添加两个换行
                    if (!translatedContent.endsWith('\n\n')) {
                        if (translatedContent.endsWith('\n')) {
                            translatedContent += '\n';
                        } else {
                            translatedContent += '\n\n';
                        }
                    }
                }
                
                // 添加段落内容
                translatedContent += currentSegment;
            }
            
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
