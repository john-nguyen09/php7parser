'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer;
(function (Lexer) {
    const table = [
        [
            [/^<\?=/, action1],
            [/^<\?php(?:[ \t]|(?:\r\n|\n|\r))/, action2],
            [/^<\?/, action3],
            [/^[^]/, action4]
        ],
        [
            [/^exit(?=\b)/, 29],
            [/^die(?=\b)/, 29],
            [/^function(?=\b)/, 35],
            [/^const(?=\b)/, 12],
            [/^return(?=\b)/, 59],
            [/^yield[ \n\r\t]+from/, 70],
            [/^yield(?=\b)/, 69],
            [/^try(?=\b)/, 64],
            [/^catch(?=\b)/, 8],
            [/^finally(?=\b)/, 32],
            [/^throw(?=\b)/, 62],
            [/^if(?=\b)/, 39],
            [/^elseif(?=\b)/, 19],
            [/^endif(?=\b)/, 24],
            [/^else(?=\b)/, 18],
            [/^while(?=\b)/, 68],
            [/^endwhile(?=\b)/, 26],
            [/^do(?=\b)/, 16],
            [/^for(?=\b)/, 33],
            [/^endfor(?=\b)/, 22],
            [/^foreach(?=\b)/, 34],
            [/^endforeach(?=\b)/, 23],
            [/^declare(?=\b)/, 14],
            [/^enddeclare(?=\b)/, 21],
            [/^instanceof(?=\b)/, 43],
            [/^as(?=\b)/, 4],
            [/^switch(?=\b)/, 61],
            [/^endswitch(?=\b)/, 25],
            [/^case(?=\b)/, 7],
            [/^default(?=\b)/, 15],
            [/^break(?=\b)/, 5],
            [/^continue(?=\b)/, 13],
            [/^goto(?=\b)/, 37],
            [/^echo(?=\b)/, 17],
            [/^print(?=\b)/, 53],
            [/^class(?=\b)/, 9],
            [/^interface(?=\b)/, 45],
            [/^trait(?=\b)/, 63],
            [/^extends(?=\b)/, 30],
            [/^implements(?=\b)/, 40],
            [/^->/, action6],
            [/^[ \n\r\t]+/, 161],
            [/^::/, 133],
            [/^\\/, 147],
            [/^\.\.\./, 134],
            [/^\?\?/, 122],
            [/^new(?=\b)/, 52],
            [/^clone(?=\b)/, 11],
            [/^var(?=\b)/, 67],
            [/^\([ \t]*(?:int|integer)[ \t]*\)/, 152],
            [/^\([ \t]*(?:real|double|float)[ \t]*\)/, 153],
            [/^\([ \t]*(?:string|binary)[ \t]*\)/, 150],
            [/^\([ \t]*array[ \t]*\)/, 155],
            [/^\([ \t]*object[ \t]*\)/, 151],
            [/^\([ \t]*(?:boolean|bool)[ \t]*\)/, 148],
            [/^\([ \t]*unset[ \t]*\)/, 149],
            [/^eval(?=\b)/, 28],
            [/^include_once(?=\b)/, 42],
            [/^include(?=\b)/, 41],
            [/^require_once(?=\b)/, 58],
            [/^require(?=\b)/, 57],
            [/^namespace(?=\b)/, 51],
            [/^use(?=\b)/, 66],
            [/^insteadof(?=\b)/, 44],
            [/^global(?=\b)/, 36],
            [/^isset(?=\b)/, 46],
            [/^empty(?=\b)/, 20],
            [/^__halt_compiler/, 38],
            [/^static(?=\b)/, 60],
            [/^abstract(?=\b)/, 2],
            [/^final(?=\b)/, 31],
            [/^private(?=\b)/, 54],
            [/^protected(?=\b)/, 56],
            [/^public(?=\b)/, 55],
            [/^unset(?=\b)/, 65],
            [/^=>/, 132],
            [/^list(?=\b)/, 47],
            [/^array(?=\b)/, 3],
            [/^callable(?=\b)/, 6],
            [/^--/, 129],
            [/^\+\+/, 135],
            [/^===/, 138],
            [/^!==/, 140],
            [/^==/, 136],
            [/^!=|^<>/, 139],
            [/^<=>/, 142],
            [/^<=/, 141],
            [/^>=/, 137],
            [/^\+=/, 112],
            [/^-=/, 144],
            [/^\*=/, 146],
            [/^\*\*/, 113],
            [/^\*\*=/, 114],
            [/^\/=/, 130],
            [/^\.=/, 127],
            [/^%=/, 145],
            [/^<<=/, 107],
            [/^>>=/, 109],
            [/^&=/, 104],
            [/^\|=/, 110],
            [/^\^=/, 105],
            [/^\|\|/, 124],
            [/^&&/, 102],
            [/^(?:OR|or)(?=\b)/, 49],
            [/^(?:AND|and)(?=\b)/, 48],
            [/^(?:XOR|xor)(?=\b)/, 50],
            [/^\\?<<<[ \t]*(?:[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*|'[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*'|"[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*")(?:\r\n|\n|\r)/, action15],
            [/^<</, 106],
            [/^>>/, 108],
            [/^\{/, action8],
            [/^\}/, action9],
            [/^0b[01]+/, 82],
            [/^0x[0-9a-fA-F]+/, 82],
            [/^(?:[0-9]+|(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*))[eE][+-]?[0-9]+|^(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*)/, 79],
            [/^[0-9]+/, 82],
            [/^__CLASS__/, 10],
            [/^__TRAIT__/, 77],
            [/^__FUNCTION__/, 74],
            [/^__METHOD__/, 75],
            [/^__LINE__/, 73],
            [/^__FILE__/, 72],
            [/^__DIR__/, 71],
            [/^__NAMESPACE__/, 76],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 83],
            [/^#|\/\//, action10],
            [/^\/\*\*|^\/\*/, action11],
            [/^\?>(?:\r\n|\n|\r)?/, action12],
            [/^\\?'/, action13],
            [/^\\?"/, action14],
            [/^`/, action16],
            [/^[;:,.\[\]()|^&+\-\/*=%!~$<>?@]/, action35],
            [/^[^]/, 0],
        ],
        [
            [/^[ \n\r\t]+/, 161],
            [/^->/, 115],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, action18],
            [/^[^]/, action19]
        ],
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84],
            [/^\{\$/, action23],
            [/^"/, action24],
            [/^[^]/, action25]
        ],
        [
            [/^[^]/, action26]
        ],
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84],
            [/^\{\$/, action23],
            [/^[^]/, action27]
        ],
        [
            [/^[^]/, action28]
        ],
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84],
            [/^\{\$/, action23],
            [/^`/, action29],
            [/^[^]/, action30]
        ],
        [
            [/^[0-9]+|^0x[0-9a-fA-F]+|^0b[01]+/, 82],
            [/^0|^[1-9][0-9]*/, 82],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84],
            [/^\]/, action31],
            [/^\[/, action35],
            [/^-/, 143],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 83],
            [/^[^]/, action32]
        ],
        [
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*[[}]/, action33],
            [/^[^]/, action34]
        ]
    ];
    var input;
    var lexemeLength;
    var modeStack;
    var position;
    var hereDocLabel;
    var doubleQuoteScannedLength;
    var match;
    var matchLength;
    var actionIndex;
    var action;
    var lexerMode;
    function clear() {
        input = null;
        hereDocLabel = null;
        doubleQuoteScannedLength = null;
        lexemeLength = 0;
        modeStack = [0];
        position = -1;
    }
    function concatRegExpArray(regExpArray) {
        let src = regExpArray.map((v, i, a) => {
            return '(' + v.source + ')';
        }).join('|');
        return new RegExp(src, 'i');
    }
    var patterns = [];
    for (let n = 0; n < table.length; ++n) {
        patterns.push(concatRegExpArray(table[n].map((v, i, a) => { return v[0]; })));
    }
    function setInput(text, lexerModeStack, lastPosition) {
        clear();
        input = text;
        if (lexerModeStack) {
            modeStack = lexerModeStack;
        }
        if (lastPosition) {
            position = lastPosition;
        }
    }
    Lexer.setInput = setInput;
    function lex() {
        if (!input.length) {
            return {
                tokenType: 1,
                offset: position,
                length: 0,
                modeStack: modeStack
            };
        }
        actionIndex = -1;
        lexemeLength = 0;
        let token = {
            tokenType: 0,
            offset: position + 1,
            length: 0,
            modeStack: modeStack
        };
        lexerMode = modeStack[modeStack.length - 1];
        match = input.match(patterns[lexerMode]);
        let n = 0;
        matchLength = match.length;
        while (++n < matchLength) {
            if (match[n]) {
                actionIndex = n - 1;
                break;
            }
        }
        if (actionIndex < 0) {
            throw new Error('Failed to find action index');
        }
        lexemeLength = match[0].length;
        action = table[lexerMode][actionIndex][1];
        if (typeof action === 'function') {
            token.tokenType = action();
            if (token.tokenType === -1) {
                return lex();
            }
        }
        else {
            token.tokenType = action;
            position += lexemeLength;
        }
        input = input.slice(lexemeLength);
        token.length = lexemeLength;
        return token;
    }
    Lexer.lex = lex;
    function isLabelStart(char) {
        let cp = char.charCodeAt(0);
        return (cp >= 97 && cp <= 122) || (cp >= 65 && cp <= 90) || cp === 95 || cp >= 0x7F;
    }
    function action1() {
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        return 157;
    }
    function action2() {
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        return 156;
    }
    function action3() {
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        return 156;
    }
    const openTagRegex = /<\?=|<\?php(?:[ \t]|(?:\r\n|\n|\r))|<\?/;
    function action4() {
        if (input.length > lexemeLength) {
            let pos = input.search(openTagRegex);
            if (pos === -1) {
                lexemeLength = input.length;
            }
            else {
                lexemeLength = pos;
            }
        }
        position += lexemeLength;
        return 81;
    }
    function action6() {
        position += lexemeLength;
        modeStack = modeStack.slice(0);
        modeStack.push(2);
        return 115;
    }
    function action8() {
        position += lexemeLength;
        modeStack = modeStack.slice(0);
        modeStack.push(1);
        return 116;
    }
    function action9() {
        position += lexemeLength;
        if (modeStack.length > 1) {
            modeStack = modeStack.slice(0, -1);
        }
        return 119;
    }
    const newLineOrCloseTagRegex = /(?:\r\n|\n|\r)+|\?>/;
    function action10() {
        let match = input.match(newLineOrCloseTagRegex);
        if (!match) {
            lexemeLength = input.length;
        }
        else if (match[0] === '?>') {
            lexemeLength = match.index;
        }
        else {
            lexemeLength = match.index + match[0].length;
        }
        position += lexemeLength;
        return 159;
    }
    function action11() {
        let isDocComment = false;
        if (lexemeLength > 2) {
            isDocComment = true;
        }
        let pos = input.indexOf('*/', lexemeLength);
        if (pos === -1) {
            lexemeLength = input.length;
        }
        else {
            lexemeLength = pos + 2;
        }
        position += lexemeLength;
        if (isDocComment) {
            return 160;
        }
        return 159;
    }
    function action12() {
        modeStack = modeStack.slice(0, -1);
        modeStack.push(0);
        position += lexemeLength;
        return 158;
    }
    function action13() {
        let n = lexemeLength;
        while (true) {
            if (n < input.length) {
                if (input[n] === '\'') {
                    ++n;
                    break;
                }
                else if (input[n++] === '\\' && n < input.length) {
                    ++n;
                }
            }
            else {
                position += lexemeLength;
                return 80;
            }
        }
        lexemeLength = n;
        position += lexemeLength;
        return 78;
    }
    function action14() {
        let n = lexemeLength;
        let char;
        while (n < input.length) {
            char = input[n++];
            switch (char) {
                case '"':
                    lexemeLength = n;
                    position += lexemeLength;
                    return 78;
                case '$':
                    if (n < input.length && (isLabelStart(input[n]) || input[n] === '{')) {
                        break;
                    }
                    continue;
                case '{':
                    if (n < input.length && input[n] == '$') {
                        break;
                    }
                    continue;
                case '\\':
                    if (n < input.length) {
                        ++n;
                    }
                default:
                    continue;
            }
            --n;
            break;
        }
        position += lexemeLength;
        doubleQuoteScannedLength = n - lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(3);
        return 97;
    }
    const labelRegex = /[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/;
    function action15() {
        let lexeme = input.substr(0, lexemeLength);
        let match = lexeme.match(labelRegex);
        hereDocLabel = match[0];
        let c = lexeme[match.index - 1];
        if (c === '\'') {
            modeStack.slice(0, -1);
            modeStack.push(4);
        }
        else {
            modeStack.slice(0, -1);
            modeStack.push(5);
        }
        if (input.substr(lexemeLength, hereDocLabel.length + 3)
            .search(new RegExp('^' + hereDocLabel + ';?(?:\r\n|\n|\r)')) >= 0) {
            modeStack = modeStack.slice(0, -1);
            modeStack.push(6);
        }
        position += lexemeLength;
        return 154;
    }
    function action16() {
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(7);
        return 95;
    }
    function action18() {
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return 83;
    }
    function action19() {
        lexemeLength = 0;
        modeStack = modeStack.slice(0, -1);
        return -1;
    }
    function action20() {
        modeStack = modeStack.slice(0);
        modeStack.push(9);
        position += lexemeLength;
        return 131;
    }
    function action21() {
        lexemeLength -= 3;
        modeStack = modeStack.slice(0);
        modeStack.push(2);
        position += lexemeLength;
        return 84;
    }
    function action22() {
        --lexemeLength;
        modeStack = modeStack.slice(0);
        modeStack.push(8);
        position += lexemeLength;
        return 84;
    }
    function action23() {
        lexemeLength = 1;
        modeStack = modeStack.slice(0);
        modeStack.push(1);
        position += lexemeLength;
        return 128;
    }
    function action24() {
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        position += lexemeLength;
        return 97;
    }
    function action25() {
        if (doubleQuoteScannedLength) {
            lexemeLength = doubleQuoteScannedLength;
            doubleQuoteScannedLength = 0;
        }
        else {
            let n = lexemeLength;
            if (input[0] === '\\' && n < input.length) {
                ++n;
            }
            let char;
            while (n < input.length) {
                char = input[n++];
                switch (char) {
                    case '"':
                        break;
                    case '$':
                        if (n < input.length && (isLabelStart(input[n]) || input[n] == '{')) {
                            break;
                        }
                        continue;
                    case '{':
                        if (n < input.length && input[n] === '$') {
                            break;
                        }
                        continue;
                    case '\\':
                        if (n < input.length) {
                            ++n;
                        }
                    default:
                        continue;
                }
                --n;
                break;
            }
            lexemeLength = n;
        }
        position += lexemeLength;
        return 80;
    }
    function action26() {
        let match = input.match(new RegExp('(?:\r\n|\n|\r)' + hereDocLabel + ';?(?:\r\n|\n|\r)'));
        let nNewlineChars;
        if (!match) {
            lexemeLength = input.length;
        }
        else {
            nNewlineChars = match[0].substr(0, 2) === '\r\n' ? 2 : 1;
            lexemeLength = match.index + nNewlineChars;
            modeStack = modeStack.slice(0, -1);
            modeStack.push(6);
        }
        position += lexemeLength;
        return 80;
    }
    function action27() {
        let n = 0;
        let char;
        while (n < input.length) {
            char = input[n++];
            switch (char) {
                case '\r':
                    if (n < input.length && input[n] === '\n') {
                        ++n;
                    }
                case '\n':
                    if (n < input.length && isLabelStart(input[n]) && input.slice(n, n + hereDocLabel.length) === hereDocLabel) {
                        let k = n + hereDocLabel.length;
                        if (k < input.length && input[k] === ';') {
                            ++k;
                        }
                        if (k < input.length && (input[k] === '\n' || input[k] === '\r')) {
                            modeStack = modeStack.slice(0, -1);
                            modeStack.push(6);
                            lexemeLength = n;
                            position += lexemeLength;
                            return 80;
                        }
                    }
                    continue;
                case '$':
                    if (n < input.length && (isLabelStart(input[n]) || input[n] === '{')) {
                        break;
                    }
                    continue;
                case '{':
                    if (n < input.length && input[n] === '$') {
                        break;
                    }
                    continue;
                case '\\':
                    if (n < input.length && input[n] !== '\n' && input[n] !== '\r') {
                        ++n;
                    }
                default:
                    continue;
            }
            --n;
            break;
        }
        lexemeLength = n;
        position += lexemeLength;
        return 80;
    }
    function action28() {
        lexemeLength = hereDocLabel.length;
        hereDocLabel = null;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        position += lexemeLength;
        return 27;
    }
    function action29() {
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        position += lexemeLength;
        return 95;
    }
    function action30() {
        let n = lexemeLength;
        let char;
        if (input[0] === '\\' && n < input.length) {
            ++n;
        }
        while (n < input.length) {
            char = input[n++];
            switch (char) {
                case '`':
                    break;
                case '$':
                    if (n < input.length && (isLabelStart(input[n]) || input[n] === '{')) {
                        break;
                    }
                    continue;
                case '{':
                    if (n < input.length && input[n] === '$') {
                        break;
                    }
                    continue;
                case '\\':
                    if (n < input.length) {
                        ++n;
                    }
                default:
                    continue;
            }
            --n;
            break;
        }
        lexemeLength = n;
        position += lexemeLength;
        return 80;
    }
    function action31() {
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return 120;
    }
    function action32() {
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return 0;
    }
    function action33() {
        --lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        position += lexemeLength;
        return 84;
    }
    function action34() {
        lexemeLength = 0;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1);
        return -1;
    }
    function action35() {
        position += lexemeLength;
        return charTokenType(input[0]);
    }
    function charTokenType(c) {
        switch (c) {
            case '.':
                return 126;
            case '\\':
                return 147;
            case '/':
                return 91;
            case '!':
                return 89;
            case ';':
                return 88;
            case ':':
                return 87;
            case '~':
                return 86;
            case '^':
                return 125;
            case '|':
                return 123;
            case '&':
                return 103;
            case '<':
                return 99;
            case '>':
                return 100;
            case '=':
                return 85;
            case '*':
                return 101;
            case '-':
                return 143;
            case '+':
                return 111;
            case '%':
                return 92;
            case '$':
                return 90;
            case ',':
                return 93;
            case '@':
                return 94;
            case '?':
                return 96;
            case '[':
                return 117;
            case ']':
                return 120;
            case '{':
                return 116;
            case '}':
                return 119;
            case '(':
                return 118;
            case ')':
                return 121;
            case '\'':
                return 98;
            case '"':
                return 97;
            case '`':
                return 95;
            default:
                return 0;
        }
    }
})(Lexer = exports.Lexer || (exports.Lexer = {}));
function tokenTypeToString(type) {
    switch (type) {
        case 0:
            return 'Unknown';
        case 1:
            return 'EndOfFile';
        case 2:
            return 'Abstract';
        case 3:
            return 'Array';
        case 4:
            return 'As';
        case 5:
            return 'Break';
        case 6:
            return 'Callable';
        case 7:
            return 'Case';
        case 8:
            return 'Catch';
        case 9:
            return 'Class';
        case 10:
            return 'ClassConstant';
        case 11:
            return 'Clone';
        case 12:
            return 'Const';
        case 13:
            return 'Continue';
        case 14:
            return 'Declare';
        case 15:
            return 'Default';
        case 16:
            return 'Do';
        case 17:
            return 'Echo';
        case 18:
            return 'Else';
        case 19:
            return 'ElseIf';
        case 20:
            return 'Empty';
        case 21:
            return 'EndDeclare';
        case 22:
            return 'EndFor';
        case 23:
            return 'EndForeach';
        case 24:
            return 'EndIf';
        case 25:
            return 'EndSwitch';
        case 26:
            return 'EndWhile';
        case 27:
            return 'EndHeredoc';
        case 28:
            return 'Eval';
        case 29:
            return 'Exit';
        case 30:
            return 'Extends';
        case 31:
            return 'Final';
        case 32:
            return 'Finally';
        case 33:
            return 'For';
        case 34:
            return 'ForEach';
        case 35:
            return 'Function';
        case 36:
            return 'Global';
        case 37:
            return 'Goto';
        case 38:
            return 'HaltCompiler';
        case 39:
            return 'If';
        case 40:
            return 'Implements';
        case 41:
            return 'Include';
        case 42:
            return 'IncludeOnce';
        case 43:
            return 'InstanceOf';
        case 44:
            return 'InsteadOf';
        case 45:
            return 'Interface';
        case 46:
            return 'Isset';
        case 47:
            return 'List';
        case 48:
            return 'And';
        case 49:
            return 'Or';
        case 50:
            return 'Xor';
        case 51:
            return 'Namespace';
        case 52:
            return 'New';
        case 53:
            return 'Print';
        case 54:
            return 'Private';
        case 55:
            return 'Public';
        case 56:
            return 'Protected';
        case 57:
            return 'Require';
        case 58:
            return 'RequireOnce';
        case 59:
            return 'Return';
        case 60:
            return 'Static';
        case 61:
            return 'Switch';
        case 62:
            return 'Throw';
        case 63:
            return 'Trait';
        case 64:
            return 'Try';
        case 65:
            return 'Unset';
        case 66:
            return 'Use';
        case 67:
            return 'Var';
        case 68:
            return 'While';
        case 69:
            return 'Yield';
        case 70:
            return 'YieldFrom';
        case 71:
            return 'DirectoryConstant';
        case 72:
            return 'FileConstant';
        case 73:
            return 'LineConstant';
        case 74:
            return 'FunctionConstant';
        case 75:
            return 'MethodConstant';
        case 76:
            return 'NamespaceConstant';
        case 77:
            return 'TraitConstant';
        case 78:
            return 'StringLiteral';
        case 79:
            return 'FloatingLiteral';
        case 80:
            return 'EncapsulatedAndWhitespace';
        case 81:
            return 'Text';
        case 82:
            return 'IntegerLiteral';
        case 83:
            return 'Name';
        case 84:
            return 'VariableName';
        case 85:
            return 'Equals';
        case 86:
            return 'Tilde';
        case 87:
            return 'Colon';
        case 88:
            return 'Semicolon';
        case 89:
            return 'Exclamation';
        case 90:
            return 'Dollar';
        case 91:
            return 'ForwardSlash';
        case 92:
            return 'Percent';
        case 93:
            return 'Comma';
        case 94:
            return 'AtSymbol';
        case 95:
            return 'Backtick';
        case 96:
            return 'Question';
        case 97:
            return 'DoubleQuote';
        case 98:
            return 'SingleQuote';
        case 99:
            return 'LessThan';
        case 100:
            return 'GreaterThan';
        case 101:
            return 'Asterisk';
        case 102:
            return 'AmpersandAmpersand';
        case 103:
            return 'Ampersand';
        case 104:
            return 'AmpersandEquals';
        case 105:
            return 'CaretEquals';
        case 106:
            return 'LessThanLessThan';
        case 107:
            return 'LessThanLessThanEquals';
        case 108:
            return 'GreaterThanGreaterThan';
        case 109:
            return 'GreaterThanGreaterThanEquals';
        case 110:
            return 'BarEquals';
        case 111:
            return 'Plus';
        case 112:
            return 'PlusEquals';
        case 113:
            return 'AsteriskAsterisk';
        case 114:
            return 'AsteriskAsteriskEquals';
        case 115:
            return 'Arrow';
        case 116:
            return 'OpenBrace';
        case 117:
            return 'OpenBracket';
        case 118:
            return 'OpenParenthesis';
        case 119:
            return 'CloseBrace';
        case 120:
            return 'CloseBracket';
        case 121:
            return 'CloseParenthesis';
        case 122:
            return 'QuestionQuestion';
        case 123:
            return 'Bar';
        case 124:
            return 'BarBar';
        case 125:
            return 'Caret';
        case 126:
            return 'Dot';
        case 127:
            return 'DotEquals';
        case 128:
            return 'CurlyOpen';
        case 129:
            return 'MinusMinus';
        case 130:
            return 'ForwardslashEquals';
        case 131:
            return 'DollarCurlyOpen';
        case 132:
            return 'FatArrow';
        case 133:
            return 'ColonColon';
        case 134:
            return 'Ellipsis';
        case 135:
            return 'PlusPlus';
        case 136:
            return 'EqualsEquals';
        case 137:
            return 'GreaterThanEquals';
        case 138:
            return 'EqualsEqualsEquals';
        case 139:
            return 'ExclamationEquals';
        case 140:
            return 'ExclamationEqualsEquals';
        case 141:
            return 'LessThanEquals';
        case 142:
            return 'Spaceship';
        case 143:
            return 'Minus';
        case 144:
            return 'MinusEquals';
        case 145:
            return 'PercentEquals';
        case 146:
            return 'AsteriskEquals';
        case 147:
            return 'Backslash';
        case 148:
            return 'BooleanCast';
        case 149:
            return 'UnsetCast';
        case 150:
            return 'StringCast';
        case 151:
            return 'ObjectCast';
        case 152:
            return 'IntegerCast';
        case 153:
            return 'FloatCast';
        case 154:
            return 'StartHeredoc';
        case 155:
            return 'ArrayCast';
        case 156:
            return 'OpenTag';
        case 157:
            return 'OpenTagEcho';
        case 158:
            return 'CloseTag';
        case 159:
            return 'Comment';
        case 160:
            return 'DocumentComment';
        case 161:
            return 'Whitespace';
    }
}
exports.tokenTypeToString = tokenTypeToString;
