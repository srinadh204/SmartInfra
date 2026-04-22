const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const regex = /(["'`])http:\/\/localhost:5000(.*?)(\1)/g;

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (regex.test(content)) {
        content = content.replace(regex, '`${process.env.REACT_APP_API_URL}$2`');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Refactored: ${fullPath}`);
      }
    }
  }
}

console.log('Starting refactor...');
processDirectory(srcDir);
console.log('Refactor complete.');
