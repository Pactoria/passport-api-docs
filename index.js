import fs from 'node:fs/promises';
import path from 'node:path';

async function listFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  let filePaths = [];
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      filePaths = filePaths.concat(await listFiles(fullPath));
    } else {
      filePaths.push(fullPath);
    }
  }
  return filePaths;
}

listFiles('docs').then(filePaths => {
    const files = {
        name: '/',
        contents: []
    };
    for (const filePath of filePaths) {
        const parts = filePath.split('/');
        let current = files;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const existing = current.contents.find(content => content.name === part);
            if (existing) {
                current = existing;
            } else {
                const isFile = i === parts.length - 1;
                const newContent = {
                    name: part,
                    path: isFile ? filePath : undefined,
                    contents: isFile ? undefined : []
                };
                current.contents.push(newContent);
                current = newContent;
            }
        }
    }
    //Write to file
    fs.writeFile('docs.json', JSON.stringify(files, null, 2));
}).catch(console.error);