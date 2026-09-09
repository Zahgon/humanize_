// Prepends a "/* <filename> - v<version> */" header comment to every
// generated .js file in dist/. Direct TypeScript migration of the original
// bin/header script.

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

// glob patterns always use forward slashes, even on Windows
const pattern = path.join(__dirname, '../dist/**/*.js').replace(/\\/g, '/');

glob(pattern)
  .then((files: string[]) => {
    files.forEach((file: string) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }

        const header = `/* ${path.basename(file)} - v${pkg.version} */\n`;

        fs.writeFile(file, header + data, 'utf8', (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        });
      });
    });
  })
  .catch((err: Error) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
