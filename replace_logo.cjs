
const fs = require("fs");
const path = require("path");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes("https://nda.edu.ng/wp-content/uploads/2020/06/logo.png")) {
    content = 'import { LOGO_BASE64 } from "@/logoBase64";\n' + content;
    content = content.replace(/"https:\/\/nda\.edu\.ng\/wp-content\/uploads\/2020\/06\/logo\.png"/g, "LOGO_BASE64");
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
    