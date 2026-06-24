const fs = require("fs");
const path = require("path");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes('import { LOGO_BASE64 } from "@/logoBase64";')) {
    content = content.replace('import { LOGO_BASE64 } from "@/logoBase64";', 'import { LOGO_BASE64 } from "@/src/logoBase64";');
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("Updated", filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (file.endsWith(".tsx")) {
      processFile(fullPath);
    }
  }
}

traverse("src");
