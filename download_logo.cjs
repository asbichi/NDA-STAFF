const https = require("https");
const fs = require("fs");

https.get("https://nda.edu.ng/wp-content/uploads/2020/06/logo.png", (res) => {
  const chunks = [];
  res.on("data", (chunk) => chunks.push(chunk));
  res.on("end", () => {
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString("base64");
    fs.writeFileSync("src/logoBase64.ts", "export const LOGO_BASE64 = `data:image/png;base64," + base64 + "`;\n");
    console.log("Base64 saved to src/logoBase64.ts");
    
    // Also generate a find and replace script to replace image URLs
    const rScript = `
const fs = require("fs");
const path = require("path");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes("https://nda.edu.ng/wp-content/uploads/2020/06/logo.png")) {
    content = 'import { LOGO_BASE64 } from "@/logoBase64";\\n' + content;
    content = content.replace(/"https:\\/\\/nda\\.edu\\.ng\\/wp-content\\/uploads\\/2020\\/06\\/logo\\.png"/g, "LOGO_BASE64");
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
    `;
    fs.writeFileSync("replace_logo.cjs", rScript);
  });
}).on("error", (e) => {
  console.error(e);
});
