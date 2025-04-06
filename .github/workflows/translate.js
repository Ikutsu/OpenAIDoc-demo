const fs = require('fs');
const path = require('path');
const { GoogleGenAI  } = require("@google/genai");

// 从配置文件加载配置项
const configPath = path.resolve(__dirname, './translate-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

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
        return path.join(baseDir, 'i18n', targetLang, 'content-docs', 'current', relativePath);
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
    const content = fs.readFileSync(filePath, 'utf8');

    const { frontmatter, mainContent } = extractFrontmatterAndContent(content);

    for (const targetLang of config.targetLanguages) {
        // 使用新的路径计算函数
        const targetPath = getTargetPath(filePath, targetLang);

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
    return config.languageNames[langCode] || langCode;
}

// 主函数
async function main() {
    const changedFiles = process.env.ALL_CHANGED_FILES.split(/[\s,]+/);
    const baseDir = process.env.BASE_DIR;
    console.log(`Found ${changedFiles.length} changed files`);

    for (const file of changedFiles) {
        await translateFile(file);
    }

    console.log('Translation completed');
}

main().catch(console.error);
