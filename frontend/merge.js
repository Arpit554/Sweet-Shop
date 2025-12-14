import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

const srcDir = path.join(_dirname, "src");
const outputFile = path.join(_dirname, "merged-frontend.js");

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function mergeFiles() {
  const allFiles = getAllFiles(srcDir);
  const outputStream = fs.createWriteStream(outputFile);

  allFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    outputStream.write(`\n// FILE: ${file}\n`);
    outputStream.write(content + "\n");
  });

  outputStream.on("finish", () => {
    console.log(`✅ Merged ${allFiles.length} files into ${outputFile}`);
  });

  outputStream.end();
}

mergeFiles();
