const fs = require("fs");
const path = require("path");

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  content = content.replace(/EduManage Academy/gi, "NDA Staff School");
  content = content.replace(/ATTEEduManageNCE/gi, "ATTENDANCE");
  content = content.replace(/EduManage/gi, "NDA");

  fs.writeFileSync(filePath, content, "utf-8");
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory("src");
