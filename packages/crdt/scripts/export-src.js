// scripts/export-src.js
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.resolve(__dirname, "../src");

const exportContent = {
  src: {},
};

function readDirectory(directory, obj) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  files.forEach((file) => {
    const filePath = path.join(directory, file.name);
    if (file.isDirectory()) {
      obj[file.name] = {};
      readDirectory(filePath, obj[file.name]);
    } else {
      obj[file.name] = fs.readFileSync(filePath, "utf8");
    }
  });
}

readDirectory(srcPath, exportContent.src);

fs.writeFileSync(
  path.resolve(__dirname, "../dist/srcExport.json"),
  JSON.stringify(exportContent, null, 2)
);
