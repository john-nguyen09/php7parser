import * as fs from 'fs';
import * as path from 'path';
import { Parser } from './parser';
import { promisify } from 'util';

const readDirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

const casesDir = path.join(__dirname, '..', 'cases');

test('php7parser', async () => {
    const files = await readDirAsync(casesDir);

    for (const file of files) {
        const filePath = path.join(casesDir, file);

        if (path.extname(filePath) !== '.php') {
            continue;
        }

        const data = await readFileAsync(filePath);
        const src = data.toString();
        const parseTree = JSON.parse(JSON.stringify(Parser.parse(src), (k, v) => {
            return k === 'previous' ? undefined : v;
        }));

        expect(parseTree).toMatchSnapshot();
    }
});
