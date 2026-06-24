const fs = require("fs");
const path = require("path");

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  // Replace old colors with standard ones
  content = content.replace(/#001f3f/gi, "#2563eb");
  content = content.replace(/#003366/gi, "#1d4ed8");
  content = content.replace(/#d4af37/gi, "#10b981");
  content = content.replace(/#0a1128/gi, "#0f172a");

  // Fix tailwind specific classes that might have hardcoded hexes
  content = content.replace(/bg-\[#2563eb\]/g, "bg-primary");
  content = content.replace(/text-\[#2563eb\]/g, "text-primary");
  content = content.replace(/border-\[#2563eb\]/g, "border-primary");

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
