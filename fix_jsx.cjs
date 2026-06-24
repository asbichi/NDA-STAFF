const fs = require("fs");
const path = require("path");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  // It current looks like src=LOGO_BASE64
  // We need to change it to src={LOGO_BASE64}
  if (content.includes("src=LOGO_BASE64")) {
    content = content.replace(/src=LOGO_BASE64/g, "src={LOGO_BASE64}");
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
