'use strict';
var TokenType;
(function (TokenType) {
    TokenType[TokenType["T_EOF"] = 0] = "T_EOF";
    TokenType[TokenType["T_ABSTRACT"] = 1] = "T_ABSTRACT";
    TokenType[TokenType["T_AND_EQUAL"] = 2] = "T_AND_EQUAL";
    TokenType[TokenType["T_ARRAY"] = 3] = "T_ARRAY";
    TokenType[TokenType["T_ARRAY_CAST"] = 4] = "T_ARRAY_CAST";
    TokenType[TokenType["T_AS"] = 5] = "T_AS";
    TokenType[TokenType["T_BAD_CHARACTER"] = 6] = "T_BAD_CHARACTER";
    TokenType[TokenType["T_BOOLEAN_AND"] = 7] = "T_BOOLEAN_AND";
    TokenType[TokenType["T_BOOLEAN_OR"] = 8] = "T_BOOLEAN_OR";
    TokenType[TokenType["T_BOOL_CAST"] = 9] = "T_BOOL_CAST";
    TokenType[TokenType["T_BREAK"] = 10] = "T_BREAK";
    TokenType[TokenType["T_CALLABLE"] = 11] = "T_CALLABLE";
    TokenType[TokenType["T_CASE"] = 12] = "T_CASE";
    TokenType[TokenType["T_CATCH"] = 13] = "T_CATCH";
    TokenType[TokenType["T_CHARACTER"] = 14] = "T_CHARACTER";
    TokenType[TokenType["T_CLASS"] = 15] = "T_CLASS";
    TokenType[TokenType["T_CLASS_C"] = 16] = "T_CLASS_C";
    TokenType[TokenType["T_CLONE"] = 17] = "T_CLONE";
    TokenType[TokenType["T_CLOSE_TAG"] = 18] = "T_CLOSE_TAG";
    TokenType[TokenType["T_COALESCE"] = 19] = "T_COALESCE";
    TokenType[TokenType["T_COMMENT"] = 20] = "T_COMMENT";
    TokenType[TokenType["T_CONCAT_EQUAL"] = 21] = "T_CONCAT_EQUAL";
    TokenType[TokenType["T_CONST"] = 22] = "T_CONST";
    TokenType[TokenType["T_CONSTANT_ENCAPSED_STRING"] = 23] = "T_CONSTANT_ENCAPSED_STRING";
    TokenType[TokenType["T_CONTINUE"] = 24] = "T_CONTINUE";
    TokenType[TokenType["T_CURLY_OPEN"] = 25] = "T_CURLY_OPEN";
    TokenType[TokenType["T_DEC"] = 26] = "T_DEC";
    TokenType[TokenType["T_DECLARE"] = 27] = "T_DECLARE";
    TokenType[TokenType["T_DEFAULT"] = 28] = "T_DEFAULT";
    TokenType[TokenType["T_DIR"] = 29] = "T_DIR";
    TokenType[TokenType["T_DIV_EQUAL"] = 30] = "T_DIV_EQUAL";
    TokenType[TokenType["T_DNUMBER"] = 31] = "T_DNUMBER";
    TokenType[TokenType["T_DOC_COMMENT"] = 32] = "T_DOC_COMMENT";
    TokenType[TokenType["T_DO"] = 33] = "T_DO";
    TokenType[TokenType["T_DOLLAR_OPEN_CURLY_BRACES"] = 34] = "T_DOLLAR_OPEN_CURLY_BRACES";
    TokenType[TokenType["T_DOUBLE_ARROW"] = 35] = "T_DOUBLE_ARROW";
    TokenType[TokenType["T_DOUBLE_CAST"] = 36] = "T_DOUBLE_CAST";
    TokenType[TokenType["T_DOUBLE_COLON"] = 37] = "T_DOUBLE_COLON";
    TokenType[TokenType["T_ECHO"] = 38] = "T_ECHO";
    TokenType[TokenType["T_ELLIPSIS"] = 39] = "T_ELLIPSIS";
    TokenType[TokenType["T_ELSE"] = 40] = "T_ELSE";
    TokenType[TokenType["T_ELSEIF"] = 41] = "T_ELSEIF";
    TokenType[TokenType["T_EMPTY"] = 42] = "T_EMPTY";
    TokenType[TokenType["T_ENCAPSED_AND_WHITESPACE"] = 43] = "T_ENCAPSED_AND_WHITESPACE";
    TokenType[TokenType["T_ENDDECLARE"] = 44] = "T_ENDDECLARE";
    TokenType[TokenType["T_ENDFOR"] = 45] = "T_ENDFOR";
    TokenType[TokenType["T_ENDFOREACH"] = 46] = "T_ENDFOREACH";
    TokenType[TokenType["T_ENDIF"] = 47] = "T_ENDIF";
    TokenType[TokenType["T_ENDSWITCH"] = 48] = "T_ENDSWITCH";
    TokenType[TokenType["T_ENDWHILE"] = 49] = "T_ENDWHILE";
    TokenType[TokenType["T_END_HEREDOC"] = 50] = "T_END_HEREDOC";
    TokenType[TokenType["T_EVAL"] = 51] = "T_EVAL";
    TokenType[TokenType["T_EXIT"] = 52] = "T_EXIT";
    TokenType[TokenType["T_EXTENDS"] = 53] = "T_EXTENDS";
    TokenType[TokenType["T_FILE"] = 54] = "T_FILE";
    TokenType[TokenType["T_FINAL"] = 55] = "T_FINAL";
    TokenType[TokenType["T_FINALLY"] = 56] = "T_FINALLY";
    TokenType[TokenType["T_FOR"] = 57] = "T_FOR";
    TokenType[TokenType["T_FOREACH"] = 58] = "T_FOREACH";
    TokenType[TokenType["T_FUNCTION"] = 59] = "T_FUNCTION";
    TokenType[TokenType["T_FUNC_C"] = 60] = "T_FUNC_C";
    TokenType[TokenType["T_GLOBAL"] = 61] = "T_GLOBAL";
    TokenType[TokenType["T_GOTO"] = 62] = "T_GOTO";
    TokenType[TokenType["T_HALT_COMPILER"] = 63] = "T_HALT_COMPILER";
    TokenType[TokenType["T_IF"] = 64] = "T_IF";
    TokenType[TokenType["T_IMPLEMENTS"] = 65] = "T_IMPLEMENTS";
    TokenType[TokenType["T_INC"] = 66] = "T_INC";
    TokenType[TokenType["T_INCLUDE"] = 67] = "T_INCLUDE";
    TokenType[TokenType["T_INCLUDE_ONCE"] = 68] = "T_INCLUDE_ONCE";
    TokenType[TokenType["T_INLINE_HTML"] = 69] = "T_INLINE_HTML";
    TokenType[TokenType["T_INSTANCEOF"] = 70] = "T_INSTANCEOF";
    TokenType[TokenType["T_INSTEADOF"] = 71] = "T_INSTEADOF";
    TokenType[TokenType["T_INT_CAST"] = 72] = "T_INT_CAST";
    TokenType[TokenType["T_INTERFACE"] = 73] = "T_INTERFACE";
    TokenType[TokenType["T_ISSET"] = 74] = "T_ISSET";
    TokenType[TokenType["T_IS_EQUAL"] = 75] = "T_IS_EQUAL";
    TokenType[TokenType["T_IS_GREATER_OR_EQUAL"] = 76] = "T_IS_GREATER_OR_EQUAL";
    TokenType[TokenType["T_IS_IDENTICAL"] = 77] = "T_IS_IDENTICAL";
    TokenType[TokenType["T_IS_NOT_EQUAL"] = 78] = "T_IS_NOT_EQUAL";
    TokenType[TokenType["T_IS_NOT_IDENTICAL"] = 79] = "T_IS_NOT_IDENTICAL";
    TokenType[TokenType["T_IS_SMALLER_OR_EQUAL"] = 80] = "T_IS_SMALLER_OR_EQUAL";
    TokenType[TokenType["T_SPACESHIP"] = 81] = "T_SPACESHIP";
    TokenType[TokenType["T_LINE"] = 82] = "T_LINE";
    TokenType[TokenType["T_LIST"] = 83] = "T_LIST";
    TokenType[TokenType["T_LNUMBER"] = 84] = "T_LNUMBER";
    TokenType[TokenType["T_LOGICAL_AND"] = 85] = "T_LOGICAL_AND";
    TokenType[TokenType["T_LOGICAL_OR"] = 86] = "T_LOGICAL_OR";
    TokenType[TokenType["T_LOGICAL_XOR"] = 87] = "T_LOGICAL_XOR";
    TokenType[TokenType["T_METHOD_C"] = 88] = "T_METHOD_C";
    TokenType[TokenType["T_MINUS_EQUAL"] = 89] = "T_MINUS_EQUAL";
    TokenType[TokenType["T_MOD_EQUAL"] = 90] = "T_MOD_EQUAL";
    TokenType[TokenType["T_MUL_EQUAL"] = 91] = "T_MUL_EQUAL";
    TokenType[TokenType["T_NAMESPACE"] = 92] = "T_NAMESPACE";
    TokenType[TokenType["T_NS_C"] = 93] = "T_NS_C";
    TokenType[TokenType["T_NS_SEPARATOR"] = 94] = "T_NS_SEPARATOR";
    TokenType[TokenType["T_NEW"] = 95] = "T_NEW";
    TokenType[TokenType["T_NUM_STRING"] = 96] = "T_NUM_STRING";
    TokenType[TokenType["T_OBJECT_CAST"] = 97] = "T_OBJECT_CAST";
    TokenType[TokenType["T_OBJECT_OPERATOR"] = 98] = "T_OBJECT_OPERATOR";
    TokenType[TokenType["T_OPEN_TAG"] = 99] = "T_OPEN_TAG";
    TokenType[TokenType["T_OPEN_TAG_WITH_ECHO"] = 100] = "T_OPEN_TAG_WITH_ECHO";
    TokenType[TokenType["T_OR_EQUAL"] = 101] = "T_OR_EQUAL";
    TokenType[TokenType["T_PAAMAYIM_NEKUDOTAYIM"] = 102] = "T_PAAMAYIM_NEKUDOTAYIM";
    TokenType[TokenType["T_PLUS_EQUAL"] = 103] = "T_PLUS_EQUAL";
    TokenType[TokenType["T_POW"] = 104] = "T_POW";
    TokenType[TokenType["T_POW_EQUAL"] = 105] = "T_POW_EQUAL";
    TokenType[TokenType["T_PRINT"] = 106] = "T_PRINT";
    TokenType[TokenType["T_PRIVATE"] = 107] = "T_PRIVATE";
    TokenType[TokenType["T_PUBLIC"] = 108] = "T_PUBLIC";
    TokenType[TokenType["T_PROTECTED"] = 109] = "T_PROTECTED";
    TokenType[TokenType["T_REQUIRE"] = 110] = "T_REQUIRE";
    TokenType[TokenType["T_REQUIRE_ONCE"] = 111] = "T_REQUIRE_ONCE";
    TokenType[TokenType["T_RETURN"] = 112] = "T_RETURN";
    TokenType[TokenType["T_SL"] = 113] = "T_SL";
    TokenType[TokenType["T_SL_EQUAL"] = 114] = "T_SL_EQUAL";
    TokenType[TokenType["T_SR"] = 115] = "T_SR";
    TokenType[TokenType["T_SR_EQUAL"] = 116] = "T_SR_EQUAL";
    TokenType[TokenType["T_START_HEREDOC"] = 117] = "T_START_HEREDOC";
    TokenType[TokenType["T_STATIC"] = 118] = "T_STATIC";
    TokenType[TokenType["T_STRING"] = 119] = "T_STRING";
    TokenType[TokenType["T_STRING_CAST"] = 120] = "T_STRING_CAST";
    TokenType[TokenType["T_STRING_VARNAME"] = 121] = "T_STRING_VARNAME";
    TokenType[TokenType["T_SWITCH"] = 122] = "T_SWITCH";
    TokenType[TokenType["T_THROW"] = 123] = "T_THROW";
    TokenType[TokenType["T_TRAIT"] = 124] = "T_TRAIT";
    TokenType[TokenType["T_TRAIT_C"] = 125] = "T_TRAIT_C";
    TokenType[TokenType["T_TRY"] = 126] = "T_TRY";
    TokenType[TokenType["T_UNSET"] = 127] = "T_UNSET";
    TokenType[TokenType["T_UNSET_CAST"] = 128] = "T_UNSET_CAST";
    TokenType[TokenType["T_USE"] = 129] = "T_USE";
    TokenType[TokenType["T_VAR"] = 130] = "T_VAR";
    TokenType[TokenType["T_VARIABLE"] = 131] = "T_VARIABLE";
    TokenType[TokenType["T_WHILE"] = 132] = "T_WHILE";
    TokenType[TokenType["T_WHITESPACE"] = 133] = "T_WHITESPACE";
    TokenType[TokenType["T_XOR_EQUAL"] = 134] = "T_XOR_EQUAL";
    TokenType[TokenType["T_YIELD"] = 135] = "T_YIELD";
    TokenType[TokenType["T_YIELD_FROM"] = 136] = "T_YIELD_FROM";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var LexerMode;
(function (LexerMode) {
    LexerMode[LexerMode["Initial"] = 0] = "Initial";
    LexerMode[LexerMode["Scripting"] = 1] = "Scripting";
    LexerMode[LexerMode["LookingForProperty"] = 2] = "LookingForProperty";
    LexerMode[LexerMode["DoubleQuotes"] = 3] = "DoubleQuotes";
    LexerMode[LexerMode["NowDoc"] = 4] = "NowDoc";
    LexerMode[LexerMode["HereDoc"] = 5] = "HereDoc";
    LexerMode[LexerMode["EndHereDoc"] = 6] = "EndHereDoc";
    LexerMode[LexerMode["BackQuote"] = 7] = "BackQuote";
    LexerMode[LexerMode["VarOffset"] = 8] = "VarOffset";
    LexerMode[LexerMode["LookingForVarName"] = 9] = "LookingForVarName";
})(LexerMode = exports.LexerMode || (exports.LexerMode = {}));
class LexerState {
    constructor() {
        this.clear();
    }
    less(n = 0) {
        this.input = this.lexeme.slice(n) + this.input;
        this.lexeme = this.lexeme.substr(0, n);
    }
    more(n) {
        this.lexeme += this.input.substr(0, n);
        this.input = this.input.slice(n);
    }
    advancePosition(countLines) {
        if (!this.lexeme) {
            return;
        }
        if (!countLines) {
            if (this.lastLexemeEndedWithNewline) {
                this.char = -1;
                ++this.line;
                this.lastLexemeEndedWithNewline = false;
            }
            this.char += this.lexeme.length;
            return;
        }
        let n = 0;
        let c;
        while (n < this.lexeme.length) {
            if (this.lastLexemeEndedWithNewline) {
                this.char = -1;
                ++this.line;
                this.lastLexemeEndedWithNewline = false;
            }
            ++this.char;
            c = this.lexeme[n++];
            if (c === '\n' || c === '\r') {
                this.lastLexemeEndedWithNewline = true;
                if (c === '\r' && n < this.lexeme.length && this.lexeme[n] === '\n') {
                    ++n;
                    ++this.char;
                }
            }
        }
    }
    clear() {
        this.input = this.lexeme = this.hereDocLabel = this.doubleQuoteScannedLength = null;
        this.mode = [LexerMode.Initial];
        this.char = -1;
        this.line = 0;
        this.lastLexemeEndedWithNewline = false;
    }
}
function isLabelStart(char) {
    let cp = char.charCodeAt(0);
    return (cp >= 97 && cp <= 122) || (cp >= 65 && cp <= 90) || cp === 95 || cp >= 0x7F;
}
function action1(s) {
    s.advancePosition(false);
    s.mode = [LexerMode.Scripting];
    return TokenType.T_OPEN_TAG_WITH_ECHO;
}
function action2(s) {
    s.advancePosition(true);
    s.mode = [LexerMode.Scripting];
    return TokenType.T_OPEN_TAG;
}
function action3(s) {
    s.advancePosition(false);
    s.mode = [LexerMode.Scripting];
    return TokenType.T_OPEN_TAG;
}
function action4(s) {
    if (s.input.length) {
        let pos = s.input.search(/<\?=|<\?php(?:[ \t]|(?:\r\n|\n|\r))|<\?/);
        if (pos === -1) {
            s.more(s.input.length);
        }
        else {
            s.more(pos);
        }
    }
    s.advancePosition(true);
    return TokenType.T_INLINE_HTML;
}
function action5(s) {
    s.advancePosition(true);
    return TokenType.T_YIELD_FROM;
}
function action6(s) {
    s.advancePosition(false);
    s.mode = [...s.mode.slice(), LexerMode.LookingForProperty];
    return TokenType.T_OBJECT_OPERATOR;
}
function action7(s) {
    s.advancePosition(true);
    return TokenType.T_WHITESPACE;
}
function action8(s) {
    s.advancePosition(false);
    s.mode = [...s.mode.slice(), LexerMode.Scripting];
    return '{';
}
function action9(s) {
    s.advancePosition(false);
    if (s.mode.length > 1) {
        s.mode = s.mode.slice(0, -1);
    }
    return '}';
}
function action10(s) {
    let match = s.input.match(/(?:\r\n|\n|\r)+|\?>/);
    if (!match) {
        s.more(s.input.length);
    }
    else if (match[0] === '?>') {
        s.more(match.index);
    }
    else {
        s.more(match.index + match[0].length);
    }
    s.advancePosition(true);
    return TokenType.T_COMMENT;
}
function action11(s) {
    let isDocComment = false;
    if (s.lexeme.length > 2) {
        isDocComment = true;
    }
    let pos = s.input.search(/\*\//);
    if (pos === -1) {
        s.more(s.input.length);
    }
    else {
        s.more(pos + 2);
    }
    s.advancePosition(true);
    if (isDocComment) {
        return TokenType.T_DOC_COMMENT;
    }
    return TokenType.T_COMMENT;
}
function action12(s) {
    s.mode = [LexerMode.Initial];
    s.advancePosition(true);
    return TokenType.T_CLOSE_TAG;
}
function action13(s) {
    let n = 0;
    while (true) {
        if (n < s.input.length) {
            if (s.input[n] === '\'') {
                ++n;
                break;
            }
            else if (s.input[n++] === '\\' && n < s.input.length) {
                ++n;
            }
        }
        else {
            s.advancePosition(false);
            return TokenType.T_ENCAPSED_AND_WHITESPACE;
        }
    }
    s.more(n);
    s.advancePosition(true);
    return TokenType.T_CONSTANT_ENCAPSED_STRING;
}
function action14(s) {
    let n = 0;
    let char;
    while (n < s.input.length) {
        char = s.input[n++];
        switch (char) {
            case '"':
                s.more(n);
                s.advancePosition(true);
                return 'T_CONSTANT_ENCAPSED_STRING';
            case '$':
                if (n < s.input.length && (isLabelStart(s.input[n]) || s.input[n] === '{')) {
                    break;
                }
                continue;
            case '{':
                if (n < s.input.length && s.input[n] == '$') {
                    break;
                }
                continue;
            case '\\':
                if (n < s.input.length) {
                    ++n;
                }
            default:
                continue;
        }
        --n;
        break;
    }
    s.advancePosition(false);
    s.doubleQuoteScannedLength = n;
    s.mode = [LexerMode.DoubleQuotes];
    return '"';
}
function action15(s) {
    let match = s.lexeme.match(/[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/);
    s.hereDocLabel = match[0];
    let c = s.lexeme[match.index - 1];
    if (c === '\'') {
        s.mode = [LexerMode.NowDoc];
    }
    else {
        s.mode = [LexerMode.HereDoc];
    }
    if (s.input.search(new RegExp('^' + s.hereDocLabel + ';?(?:\r\n|\n|\r)')) !== -1) {
        s.mode = [LexerMode.EndHereDoc];
    }
    s.advancePosition(true);
    return TokenType.T_START_HEREDOC;
}
function action16(s) {
    s.advancePosition(false);
    s.mode = [LexerMode.BackQuote];
    return '`';
}
function action17(s) {
    s.advancePosition(false);
    return s.input[0];
}
function action18(s) {
    s.mode = s.mode.slice(0, -1);
    s.advancePosition(false);
    return TokenType.T_STRING;
}
function action19(s) {
    s.less();
    s.mode = s.mode.slice(0, -1);
    return -1;
}
function action20(s) {
    s.mode = [...s.mode, LexerMode.LookingForVarName];
    s.advancePosition(false);
    return TokenType.T_DOLLAR_OPEN_CURLY_BRACES;
}
function action21(s) {
    s.less(s.lexeme.length - 3);
    s.mode = [...s.mode, LexerMode.LookingForProperty];
    s.advancePosition(false);
    return TokenType.T_VARIABLE;
}
function action22(s) {
    s.less(s.lexeme.length - 1);
    s.mode = [...s.mode, LexerMode.VarOffset];
    s.advancePosition(false);
    return TokenType.T_VARIABLE;
}
function action23(s) {
    s.less(1);
    s.mode = [...s.mode, LexerMode.Scripting];
    s.advancePosition(false);
    return TokenType.T_CURLY_OPEN;
}
function action24(s) {
    s.mode = [LexerMode.Scripting];
    s.advancePosition(false);
    return '"';
}
function action25(s) {
    if (s.doubleQuoteScannedLength) {
        s.more(s.doubleQuoteScannedLength - 1);
        s.doubleQuoteScannedLength = 0;
    }
    else {
        let n = 0;
        if (s.lexeme[0] === '\\' && s.input.length) {
            ++n;
        }
        let char;
        while (n < s.input.length) {
            char = s.input[n++];
            switch (char) {
                case '"':
                    break;
                case '$':
                    if (n < s.input.length && (isLabelStart(s.input[n]) || s.input[n] == '{')) {
                        break;
                    }
                    continue;
                case '{':
                    if (n < s.input.length && s.input[n] === '$') {
                        break;
                    }
                    continue;
                case '\\':
                    if (n < s.input.length) {
                        ++n;
                    }
                default:
                    continue;
            }
            --n;
            break;
        }
        s.more(n);
    }
    s.advancePosition(true);
    return TokenType.T_ENCAPSED_AND_WHITESPACE;
}
function action26(s) {
    let match = s.input.match(new RegExp('(?:\r\n|\n|\r)' + s.hereDocLabel + ';?(?:\r\n|\n|\r)'));
    let nNewlineChars;
    if (!match) {
        s.more(s.input.length);
    }
    else {
        nNewlineChars = match[0].substr(0, 2) === '\r\n' ? 2 : 1;
        s.more(match.index + nNewlineChars);
        s.mode = [LexerMode.EndHereDoc];
    }
    s.advancePosition(true);
    return TokenType.T_ENCAPSED_AND_WHITESPACE;
}
function action27(s) {
    let n = 0;
    let char;
    while (n < s.input.length) {
        char = s.input[n++];
        switch (char) {
            case '\r':
                if (n < s.input.length && s.input[n] === '\n') {
                    ++n;
                }
            case '\n':
                if (n < s.input.length && isLabelStart(s.input[n]) && s.input.slice(n, n + s.hereDocLabel.length) === s.hereDocLabel) {
                    let k = n + s.hereDocLabel.length;
                    if (k < s.input.length && s.input[k] === ';') {
                        ++k;
                    }
                    if (k < s.input.length && (s.input[k] === '\n' || s.input[k] === '\r')) {
                        s.mode = [LexerMode.EndHereDoc];
                        s.more(n);
                        s.advancePosition(true);
                        return TokenType.T_ENCAPSED_AND_WHITESPACE;
                    }
                }
                continue;
            case '$':
                if (n < s.input.length && (isLabelStart(s.input[n]) || s.input[n] === '{')) {
                    break;
                }
                continue;
            case '{':
                if (n < s.input.length && s.input[n] === '$') {
                    break;
                }
                continue;
            case '\\':
                if (n < s.input.length && s.input[n] !== '\n' && s.input[n] !== '\r') {
                    ++n;
                }
            default:
                continue;
        }
        --n;
        break;
    }
    s.more(n);
    s.advancePosition(true);
    return TokenType.T_ENCAPSED_AND_WHITESPACE;
}
function action28(s) {
    s.more(s.hereDocLabel.length - 1);
    s.hereDocLabel = null;
    s.mode = [LexerMode.Scripting];
    s.advancePosition(false);
    return TokenType.T_END_HEREDOC;
}
function action29(s) {
    s.mode = [LexerMode.Scripting];
    s.advancePosition(false);
    return '`';
}
function action30(s) {
    let n = 0;
    let char;
    if (s.lexeme[0] === '\\' && n < s.input.length) {
        ++n;
    }
    while (n < s.input.length) {
        char = s.input[n++];
        switch (char) {
            case '`':
                break;
            case '$':
                if (n < s.input.length && (isLabelStart(s.input[n]) || s.input[n] === '{')) {
                    break;
                }
                continue;
            case '{':
                if (n < s.input.length && s.input[n] === '$') {
                    break;
                }
                continue;
            case '\\':
                if (n < s.input.length) {
                    ++n;
                }
            default:
                continue;
        }
        --n;
        break;
    }
    s.more(n);
    s.advancePosition(true);
    return TokenType.T_ENCAPSED_AND_WHITESPACE;
}
function action31(s) {
    s.mode = s.mode.slice(0, -1);
    s.advancePosition(false);
    return ']';
}
function action32(s) {
    if (s.lexeme === '\r' && s.input && s.input[0] === '\n') {
        s.more(1);
    }
    s.mode = [...s.mode.slice(0, -1)];
    s.advancePosition(true);
    return s.lexeme;
}
function action33(s) {
    s.less(s.lexeme.length - 1);
    s.mode = [...s.mode.slice(0, -1), LexerMode.Scripting];
    s.advancePosition(false);
    return TokenType.T_STRING_VARNAME;
}
function action34(s) {
    s.less();
    s.mode = [...s.mode.slice(0, -1), LexerMode.Scripting];
    return -1;
}
function action35(s) {
    s.advancePosition(false);
    return s.lexeme;
}
var ruleTable = [
    [
        [/^<\?=/, action1],
        [/^<\?php(?:[ \t]|(?:\r\n|\n|\r))/, action2],
        [/^<\?/, action3],
        [/^[^]/, action4]
    ],
    [
        [/^exit(?=\b)/, TokenType.T_EXIT],
        [/^die(?=\b)/, TokenType.T_EXIT],
        [/^function(?=\b)/, TokenType.T_FUNCTION],
        [/^const(?=\b)/, TokenType.T_CONST],
        [/^return(?=\b)/, TokenType.T_RETURN],
        [/^yield[ \n\r\t]+from/, action5],
        [/^yield(?=\b)/, TokenType.T_YIELD],
        [/^try(?=\b)/, TokenType.T_TRY],
        [/^catch(?=\b)/, TokenType.T_CATCH],
        [/^finally(?=\b)/, TokenType.T_FINALLY],
        [/^throw(?=\b)/, TokenType.T_THROW],
        [/^if(?=\b)/, TokenType.T_IF],
        [/^elseif(?=\b)/, TokenType.T_ELSEIF],
        [/^endif(?=\b)/, TokenType.T_ENDIF],
        [/^else(?=\b)/, TokenType.T_ELSE],
        [/^while(?=\b)/, TokenType.T_WHILE],
        [/^endwhile(?=\b)/, TokenType.T_ENDWHILE],
        [/^do(?=\b)/, TokenType.T_DO],
        [/^for(?=\b)/, TokenType.T_FOR],
        [/^endfor(?=\b)/, TokenType.T_ENDFOR],
        [/^foreach(?=\b)/, TokenType.T_FOREACH],
        [/^endforeach(?=\b)/, TokenType.T_ENDFOREACH],
        [/^declare(?=\b)/, TokenType.T_DECLARE],
        [/^enddeclare(?=\b)/, TokenType.T_ENDDECLARE],
        [/^instanceof(?=\b)/, TokenType.T_INSTANCEOF],
        [/^as(?=\b)/, TokenType.T_AS],
        [/^switch(?=\b)/, TokenType.T_SWITCH],
        [/^endswitch(?=\b)/, TokenType.T_ENDSWITCH],
        [/^case(?=\b)/, TokenType.T_CASE],
        [/^default(?=\b)/, TokenType.T_DEFAULT],
        [/^break(?=\b)/, TokenType.T_BREAK],
        [/^continue(?=\b)/, TokenType.T_CONTINUE],
        [/^goto(?=\b)/, TokenType.T_GOTO],
        [/^echo(?=\b)/, TokenType.T_ECHO],
        [/^print(?=\b)/, TokenType.T_PRINT],
        [/^class(?=\b)/, TokenType.T_CLASS],
        [/^interface(?=\b)/, TokenType.T_INTERFACE],
        [/^trait(?=\b)/, TokenType.T_TRAIT],
        [/^extends(?=\b)/, TokenType.T_EXTENDS],
        [/^implements(?=\b)/, TokenType.T_IMPLEMENTS],
        [/^->/, action6],
        [/^[ \n\r\t]+/, action7],
        [/^::/, TokenType.T_PAAMAYIM_NEKUDOTAYIM],
        [/^\\/, TokenType.T_NS_SEPARATOR],
        [/^\.\.\./, TokenType.T_ELLIPSIS],
        [/^\?\?/, TokenType.T_COALESCE],
        [/^new(?=\b)/, TokenType.T_NEW],
        [/^clone(?=\b)/, TokenType.T_CLONE],
        [/^var(?=\b)/, TokenType.T_VAR],
        [/^\([ \t]*(?:int|integer)[ \t]*\)/, TokenType.T_INT_CAST],
        [/^\([ \t]*(?:real|double|float)[ \t]*\)/, TokenType.T_DOUBLE_CAST],
        [/^\([ \t]*(?:string|binary)[ \t]*\)/, TokenType.T_STRING_CAST],
        [/^\([ \t]*array[ \t]*\)/, TokenType.T_ARRAY_CAST],
        [/^\([ \t]*object[ \t]*\)/, TokenType.T_OBJECT_CAST],
        [/^\([ \t]*(?:boolean|bool)[ \t]*\)/, TokenType.T_BOOL_CAST],
        [/^\([ \t]*unset[ \t]*\)/, TokenType.T_UNSET_CAST],
        [/^eval(?=\b)/, TokenType.T_EVAL],
        [/^include_once(?=\b)/, TokenType.T_INCLUDE_ONCE],
        [/^include(?=\b)/, TokenType.T_INCLUDE],
        [/^require_once(?=\b)/, TokenType.T_REQUIRE_ONCE],
        [/^require(?=\b)/, TokenType.T_REQUIRE],
        [/^namespace(?=\b)/, TokenType.T_NAMESPACE],
        [/^use(?=\b)/, TokenType.T_USE],
        [/^insteadof(?=\b)/, TokenType.T_INSTEADOF],
        [/^global(?=\b)/, TokenType.T_GLOBAL],
        [/^isset(?=\b)/, TokenType.T_ISSET],
        [/^empty(?=\b)/, TokenType.T_EMPTY],
        [/^__halt_compiler/, TokenType.T_HALT_COMPILER],
        [/^static(?=\b)/, TokenType.T_STATIC],
        [/^abstract(?=\b)/, TokenType.T_ABSTRACT],
        [/^final(?=\b)/, TokenType.T_FINAL],
        [/^private(?=\b)/, TokenType.T_PRIVATE],
        [/^protected(?=\b)/, TokenType.T_PROTECTED],
        [/^public(?=\b)/, TokenType.T_PUBLIC],
        [/^unset(?=\b)/, TokenType.T_UNSET],
        [/^=>/, TokenType.T_DOUBLE_ARROW],
        [/^list(?=\b)/, TokenType.T_LIST],
        [/^array(?=\b)/, TokenType.T_ARRAY],
        [/^callable(?=\b)/, TokenType.T_CALLABLE],
        [/^--/, TokenType.T_DEC],
        [/^\+\+/, TokenType.T_INC],
        [/^===/, TokenType.T_IS_IDENTICAL],
        [/^!==/, TokenType.T_IS_NOT_IDENTICAL],
        [/^==/, TokenType.T_IS_EQUAL],
        [/^!=|^<>/, TokenType.T_IS_NOT_EQUAL],
        [/^<=>/, TokenType.T_SPACESHIP],
        [/^<=/, TokenType.T_IS_SMALLER_OR_EQUAL],
        [/^>=/, TokenType.T_IS_GREATER_OR_EQUAL],
        [/^\+=/, TokenType.T_PLUS_EQUAL],
        [/^-=/, TokenType.T_MINUS_EQUAL],
        [/^\*=/, TokenType.T_MUL_EQUAL],
        [/^\*\*/, TokenType.T_POW],
        [/^\*\*=/, TokenType.T_POW_EQUAL],
        [/^\/=/, TokenType.T_DIV_EQUAL],
        [/^\.=/, TokenType.T_CONCAT_EQUAL],
        [/^%=/, TokenType.T_MOD_EQUAL],
        [/^<<=/, TokenType.T_SL_EQUAL],
        [/^>>=/, TokenType.T_SR_EQUAL],
        [/^&=/, TokenType.T_AND_EQUAL],
        [/^\|=/, TokenType.T_OR_EQUAL],
        [/^\^=/, TokenType.T_XOR_EQUAL],
        [/^\|\|/, TokenType.T_BOOLEAN_OR],
        [/^&&/, TokenType.T_BOOLEAN_AND],
        [/^(?:OR|or)(?=\b)/, TokenType.T_LOGICAL_OR],
        [/^(?:AND|and)(?=\b)/, TokenType.T_LOGICAL_AND],
        [/^(?:XOR|xor)(?=\b)/, TokenType.T_LOGICAL_XOR],
        [/^\\?<<<[ \t]*(?:[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*|'[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*'|"[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*")(?:\r\n|\n|\r)/, action15],
        [/^<</, TokenType.T_SL],
        [/^>>/, TokenType.T_SR],
        [/^\{/, action8],
        [/^\}/, action9],
        [/^0b[01]+/, TokenType.T_LNUMBER],
        [/^0x[0-9a-fA-F]+/, TokenType.T_LNUMBER],
        [/^(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*)|^(?:[0-9]+|(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*))[eE][+-]?[0-9]+/, TokenType.T_DNUMBER],
        [/^[0-9]+/, TokenType.T_LNUMBER],
        [/^__CLASS__/, TokenType.T_CLASS_C],
        [/^__TRAIT__/, TokenType.T_TRAIT_C],
        [/^__FUNCTION__/, TokenType.T_FUNC_C],
        [/^__METHOD__/, TokenType.T_METHOD_C],
        [/^__LINE__/, TokenType.T_LINE],
        [/^__FILE__/, TokenType.T_FILE],
        [/^__DIR__/, TokenType.T_DIR],
        [/^__NAMESPACE__/, TokenType.T_NS_C],
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
        [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_STRING],
        [/^#|\/\//, action10],
        [/^\/\*\*|^\/\*/, action11],
        [/^\?>(?:\r\n|\n|\r)?/, action12],
        [/^\\?'/, action13],
        [/^\\?"/, action14],
        [/^`/, action16],
        [/^[;:,.\[\]()|^&+\-\/*=%!~$<>?@]/, action35],
        [/^[^]/, action17],
    ],
    [
        [/^[ \n\r\t]+/, action7],
        [/^->/, TokenType.T_OBJECT_OPERATOR],
        [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, action18],
        [/^[^]/, action19]
    ],
    [
        [/^\$\{/, action20],
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
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
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
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
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
        [/^\{\$/, action23],
        [/^`/, action29],
        [/^[^]/, action30]
    ],
    [
        [/^[0-9]+|^0x[0-9a-fA-F]+|^0b[01]+/, TokenType.T_NUM_STRING],
        [/^0|^[1-9][0-9]*/, TokenType.T_NUM_STRING],
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
        [/^\]/, action31],
        [/^\[/, action35],
        [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_STRING],
        [/^[^]/, action32]
    ],
    [
        [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*[[}]/, action33],
        [/^[^]/, action34]
    ]
];
class Lexer {
    constructor() {
        this._patterns = [];
        this._table = ruleTable;
        this._state = new LexerState();
        for (let n = 0; n < this._table.length; ++n) {
            this._patterns.push(this.concatRegExpArray(this._table[n].map((v, i, a) => { return v[0]; })));
        }
    }
    setInput(text, mode = [LexerMode.Initial]) {
        this.clear();
        this._state.input = text;
        this._state.mode = mode;
    }
    clear() {
        this._state.clear();
    }
    lex() {
        let firstLine, firstChar;
        let match;
        let actionIndex;
        let type;
        let action;
        let lexerMode;
        let lexerModeStack;
        if (!this._state.input.length) {
            return null;
        }
        firstLine = this._state.line;
        firstChar = this._state.char + 1;
        if (this._state.lastLexemeEndedWithNewline) {
            ++firstLine;
            firstChar = 0;
        }
        lexerModeStack = this._state.mode;
        lexerMode = this._state.mode[this._state.mode.length - 1];
        match = this._state.input.match(this._patterns[lexerMode]);
        for (let n = 1; n < match.length; ++n) {
            if (match[n]) {
                actionIndex = n - 1;
                break;
            }
            else {
                throw new Error('Failed to find action index');
            }
        }
        this._state.more(match[0].length);
        action = this._table[lexerMode][actionIndex][1];
        if (typeof action === 'function') {
            type = action(this._state);
            if (type === -1) {
                return this.lex();
            }
        }
        else {
            type = action;
            this._state.advancePosition(false);
        }
        return {
            type: type,
            text: this._state.lexeme,
            mode: lexerModeStack,
            range: {
                start: { line: firstLine, char: firstChar },
                end: { line: this._state.line, char: this._state.char }
            }
        };
    }
    lexAll() {
        let tokens = [];
        let t;
        while (t = this.lex()) {
            tokens.push(t);
        }
        return tokens;
    }
    concatRegExpArray(regExpArray) {
        let src = regExpArray.map((v, i, a) => {
            return '(' + v.source + ')';
        }).join('|');
        return new RegExp(src);
    }
}
exports.Lexer = Lexer;
