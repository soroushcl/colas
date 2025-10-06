const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'dist');

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      addJsExtensions(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      content = content.replace(
        /(from\s+['"])(?!.*dotenv)(?!.*cors)(?!.*express)(\..*?)(?<!\.js)(['"])/g,
        '$1$2.js$3'
      );
      fs.writeFileSync(fullPath, content, 'utf-8');
    }
  }
}

addJsExtensions(directory);