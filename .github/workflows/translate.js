const fs = require('fs');
const path = require('path');
const { GoogleGenAI  } = require("@google/genai");

// 配置项
const config = {
    sourceDir: './demo/docs',
    targetLanguages: ['zh-CN'],
    modelConfigs: {
        'zh-CN': { provider: 'google', model: 'gemini-2.0-flash' }
    },
    terminologyPath: './demo/terminology.json'
};

// Google LLM API
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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

// 加载之前翻译过的相关文件作为参考
function loadPreviousTranslations(targetLang, currentFilePath) {
    try {
        // 计算对应翻译文件的路径 - 修正计算方式
        const targetDir = config.sourceDir + '_' + targetLang;
        const relativePath = currentFilePath.replace(config.sourceDir.replace('./', ''), '');
        const previousTranslationPath = path.join(targetDir, relativePath);
        
        console.log(`尝试加载参考翻译: ${previousTranslationPath}`);
        
        // 检查是否存在对应的翻译文件
        if (!fs.existsSync(previousTranslationPath)) {
            console.log(`参考翻译文件不存在: ${previousTranslationPath}`);
            return [];
        }
        
        // 读取之前的翻译内容
        const content = fs.readFileSync(previousTranslationPath, 'utf8');
        console.log(`成功加载参考翻译文件: ${previousTranslationPath}`);
        
        return [{
            file: previousTranslationPath,
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

    return `# 翻译指令

你是一位精通技术文档翻译的专业翻译系统，负责将英文技术文档准确翻译为${getLangDisplayName(targetLang)}。请严格遵循以下要求：

## 任务定义
将给定的技术文档从英文翻译为${getLangDisplayName(targetLang)}，保持专业性和准确性。这是关于Kotlin依赖注入框架Koin的文档。

## 翻译要求
1. 保持所有Markdown格式、代码块和链接不变
2. 代码示例内的代码**不要翻译**
3. 保持原文的段落结构和标点符号风格
4. 术语表中的术语必须使用指定翻译
5. 技术概念必须准确翻译，不能有歧义
6. 翻译风格应保持技术文档的专业性和简洁性
7. 对于无法确定的专有名词，保留英文原文
8. 翻译整个文档，不分段处理，保持文档作为一个整体
9. 参考提供的之前翻译过的文档，保持翻译风格和术语使用的一致性

## 术语表
${relevantTerms || '无相关术语'}

## 参考翻译
${translationReferences || '无参考翻译'}

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
async function translateWithLLM(text, targetLang, filePath) {
    const modelConfig = config.modelConfigs[targetLang];
    const prompt = prepareTranslationPrompt(text, targetLang, filePath);

    console.log(prompt);

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

    const { frontmatter, mainContent } = extractFrontmatterAndContent(content);

    for (const targetLang of config.targetLanguages) {
        // 修正生成的目标文件路径计算方式
        const targetDir = config.sourceDir + '_' + targetLang;
        const relativePath = filePath.replace(config.sourceDir.replace('./', ''), '');
        const targetPath = path.join(targetDir, relativePath);

        // 创建目标目录
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // 翻译内容（保留 frontmatter）
        let translatedContent;
        if (mainContent.trim()) {
            translatedContent = await translateWithLLM(mainContent, targetLang, filePath);

            // 处理可能返回的代码块格式
            if (translatedContent.startsWith('```markdown') && translatedContent.endsWith('```')) {
                translatedContent = translatedContent.slice(10, -3).trim();
            }

            // 完整文档 = 原始 frontmatter + 翻译后的内容
            translatedContent = frontmatter + translatedContent;
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

    console.log('Translation completed');
}

main().catch(console.error);
