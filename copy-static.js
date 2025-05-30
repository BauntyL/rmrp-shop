
const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log("📦 Copying static files...");

copyRecursiveSync("server", "dist/server");
copyRecursiveSync("shared", "dist/shared");
fs.copyFileSync("storage.js", "dist/storage.js");
fs.copyFileSync("server/db.js", "dist/db.js");
fs.copyFileSync("server/index.js", "dist/server/index.js");
fs.copyFileSync("package.json", "dist/package.json");
fs.copyFileSync("package-lock.json", "dist/package-lock.json");

console.log("✅ Static files copied.");
