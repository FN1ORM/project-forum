const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFiles(dir) {
  walkDir(dir, (filePath) => {
    if (filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('<Link') && !content.includes('prefetch={false}')) {
        // Replace <Link followed by whitespace with <Link prefetch={false} followed by the same whitespace
        const newContent = content.replace(/<Link\s/g, '<Link prefetch={false} ');
        if (content !== newContent) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`Updated ${filePath}`);
        }
      }
    }
  });
}

processFiles(path.join(__dirname, 'app'));
processFiles(path.join(__dirname, 'components'));
