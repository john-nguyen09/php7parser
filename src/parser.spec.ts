import * as fs from 'fs';
import * as path from 'path';
import { Parser } from './parser';
import { promisify } from 'util';
import { Token } from './lexer';
import { Phrase, ParseError } from './phrase';
import { Node } from './node';

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
        const parseTree = nodeToObject(Parser.parse(src));

        expect(parseTree).toMatchSnapshot(file);
    }
});

function nodeToObject(node: Node) {
    let obj = null;

    if (isPhrase(node)) {
        obj = phraseToObj(node);

        for (const child of node.children) {
            obj.children.push(nodeToObject(child));
        }
    } else if (isToken(node)) {
        obj = tokenToObj(node);
    }

    return obj;
}

function isPhrase(node: Node): node is Phrase {
    return 'children' in node;
}

function isToken(node: Node): node is Token {
    return !isPhrase(node);
}

function isParseError(p: Phrase): p is ParseError {
    return 'unexpected' in p;
}

function tokenToObj(t: Token) {
    return {
        kind: t.kind,
        offset: t.offset,
        length: t.length,
    };
}

function phraseToObj(p: Phrase): { kind: number, children: any[] } {
    if (isParseError(p)) {
        return parseErrorToObject(p);
    }

    return {
        kind: p.kind,
        children: [],
    }
}

function parseErrorToObject(p: ParseError): { kind: number, children: any[], unexpected: any, expected?: number } {
    const obj: any = {
        kind: p.kind,
        children: [],
    };
    obj.unexpected = tokenToObj(p.unexpected);

    if (p.expected) {
        obj.expected = p.expected;
    }

    return obj;
}
