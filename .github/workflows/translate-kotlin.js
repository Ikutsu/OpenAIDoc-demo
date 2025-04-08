/**
 * 用于将Kotlin仓库中的文件复制到目标目录
 * 不包含翻译逻辑，仅处理文件复制
 */

const fs = require('fs');
const path = require('path');

// 从环境变量获取配置
const baseDir = process.env.BASE_DIR || './kotlin';
const repoPath = process.env.REPO_PATH || 'kotlin-repo';
const changedFiles = process.env.CHANGED_FILES ? process.env.CHANGED_FILES.split(' ') : [];
const files = changedFiles.map(file => path.join(repoPath, file));

console.log(`基础目录: ${baseDir}`);
console.log(`仓库路径: ${repoPath}`);
console.log(`变更文件数量: ${changedFiles.length}`);

// 确保目标目录存在
function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`创建目录: ${directoryPath}`);
  }
}

// 复制单个文件
function copyFile(source, target) {
  try {
    // 确保目标目录存在
    const targetDir = path.dirname(target);
    ensureDirectoryExists(targetDir);
    
    // 复制文件
    fs.copyFileSync(source, target);
    console.log(`复制成功: ${source} -> ${target}`);
    return true;
  } catch (error) {
    console.error(`复制文件失败 ${source} -> ${target}: ${error.message}`);
    return false;
  }
}

// 主函数：复制变更的文件
function processChangedFiles() {
  console.log('开始处理变更文件...');
  let processed = 0;
  let skipped = 0;
  
  files.forEach(filePath => {
    if (!filePath || !filePath.trim()) {
      skipped++;
      return;
    }
    
    // 构建源文件和目标文件路径
    const sourceFile = filePath;
    const targetFile = filePath.replace(new RegExp(`^${repoPath}`), baseDir);
    
    // 检查源文件是否存在
    if (!fs.existsSync(sourceFile)) {
      console.error(`源文件不存在: ${sourceFile}`);
      skipped++;
      return;
    }
    
    // 复制文件
    if (copyFile(sourceFile, targetFile)) {
      processed++;
    } else {
      skipped++;
    }
  });
  
  console.log(`处理完成! 成功复制 ${processed} 个文件，跳过 ${skipped} 个文件。`);
}

// 执行程序
if (changedFiles.length > 0) {
  processChangedFiles();
} else {
  console.log('没有检测到需要处理的文件');
}
