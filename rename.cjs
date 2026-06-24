const fs = require("fs");
const path = require("path");

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  content = content.replace(/NDA Staff Secondary School/g, "EduManage Global Academy");
  content = content.replace(/NDA STAFF SCHOOL/g, "EDUMANAGE");
  content = content.replace(/NDA STAFF/g, "EDUMANAGE");
  content = content.replace(/NDA Logo/g, "EduManage Logo");
  content = content.replace(/Nigerian Defence Academy, Kaduna State, Nigeria/g, "123 Education Drive, Innovation District, Global City");
  content = content.replace(/NDA\/[a-zA-Z_]+\/[a-zA-Z0-9 ]+\/[0-9]+/g, function(match){ return match.replace("NDA", "EDU") });
  content = content.replace(/https:\/\/nda.edu.ng\/wp-content\/uploads\/2020\/06\/logo.png/g, "https://ui-avatars.com/api/?name=EM&background=2563eb&color=fff&rounded=true&bold=true&size=512");
  content = content.replace(/admin@nda.edu.ng/g, "admin@edumanage.academy");
  content = content.replace(/ndastaffschool.edu.ng/g, "edumanage.academy");
  content = content.replace(/bg-\[#5D4037\]/g, "bg-primary");
  content = content.replace(/hover:bg-\[#4E342E\]/g, "hover:bg-primary/90");
  content = content.replace(/shadow-\[#5D4037\]\/10/g, "shadow-primary/10");
  content = content.replace(/shadow-\[#5D4037\]\/20/g, "shadow-primary/20");
  content = content.replace(/bg-\[#0a1128\]/g, "bg-slate-900");
  content = content.replace(/Kaduna, Nigeria/g, "Global City");
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
