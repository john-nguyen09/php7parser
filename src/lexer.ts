/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

export enum TokenType {
    T_NONE,
    T_ABSTRACT,
    T_AND_EQUAL,
    T_ARRAY,
    T_ARRAY_CAST,
    T_AS,
    T_BAD_CHARACTER,
    T_BOOLEAN_AND,
    T_BOOLEAN_OR,
    T_BOOL_CAST,
    T_BREAK,
    T_CALLABLE,
    T_CASE,
    T_CATCH,
    T_CHARACTER,
    T_CLASS,
    T_CLASS_C,
    T_CLONE,
    T_CLOSE_TAG,
    T_COALESCE,
    T_COMMENT,
    T_CONCAT_EQUAL,
    T_CONST,
    T_CONSTANT_ENCAPSED_STRING,
    T_CONTINUE,
    T_CURLY_OPEN,
    T_DEC,
    T_DECLARE,
    T_DEFAULT,
    T_DIR,
    T_DIV_EQUAL,
    T_DNUMBER,
    T_DOC_COMMENT,
    T_DO,
    T_DOLLAR_OPEN_CURLY_BRACES,
    T_DOUBLE_ARROW,
    T_DOUBLE_CAST,
    T_DOUBLE_COLON,
    T_ECHO,
    T_ELLIPSIS,
    T_ELSE,
    T_ELSEIF,
    T_EMPTY,
    T_ENCAPSED_AND_WHITESPACE,
    T_ENDDECLARE,
    T_ENDFOR,
    T_ENDFOREACH,
    T_ENDIF,
    T_ENDSWITCH,
    T_ENDWHILE,
    T_END_HEREDOC,
    T_EVAL,
    T_EXIT,
    T_EXTENDS,
    T_FILE,
    T_FINAL,
    T_FINALLY,
    T_FOR,
    T_FOREACH,
    T_FUNCTION,
    T_FUNC_C,
    T_GLOBAL,
    T_GOTO,
    T_HALT_COMPILER,
    T_IF,
    T_IMPLEMENTS,
    T_INC,
    T_INCLUDE,
    T_INCLUDE_ONCE,
    T_INLINE_HTML,
    T_INSTANCEOF,
    T_INSTEADOF,
    T_INT_CAST,
    T_INTERFACE,
    T_ISSET,
    T_IS_EQUAL,
    T_IS_GREATER_OR_EQUAL,
    T_IS_IDENTICAL,
    T_IS_NOT_EQUAL,
    T_IS_NOT_IDENTICAL,
    T_IS_SMALLER_OR_EQUAL,
    T_SPACESHIP,
    T_LINE,
    T_LIST,
    T_LNUMBER,
    T_LOGICAL_AND,
    T_LOGICAL_OR,
    T_LOGICAL_XOR,
    T_METHOD_C,
    T_MINUS_EQUAL,
    T_MOD_EQUAL,
    T_MUL_EQUAL,
    T_NAMESPACE,
    T_NS_C,
    T_NS_SEPARATOR,
    T_NEW,
    T_NUM_STRING,
    T_OBJECT_CAST,
    T_OBJECT_OPERATOR,
    T_OPEN_TAG,
    T_OPEN_TAG_WITH_ECHO,
    T_OR_EQUAL,
    T_PAAMAYIM_NEKUDOTAYIM,
    T_PLUS_EQUAL,
    T_POW,
    T_POW_EQUAL,
    T_PRINT,
    T_PRIVATE,
    T_PUBLIC,
    T_PROTECTED,
    T_REQUIRE,
    T_REQUIRE_ONCE,
    T_RETURN,
    T_SL,
    T_SL_EQUAL,
    T_SR,
    T_SR_EQUAL,
    T_START_HEREDOC,
    T_STATIC,
    T_STRING,
    T_STRING_CAST,
    T_STRING_VARNAME,
    T_SWITCH,
    T_THROW,
    T_TRAIT,
    T_TRAIT_C,
    T_TRY,
    T_UNSET,
    T_UNSET_CAST,
    T_USE,
    T_VAR,
    T_VARIABLE,
    T_WHILE,
    T_WHITESPACE,
    T_XOR_EQUAL,
    T_YIELD,
    T_YIELD_FROM
}

export enum LexerMode {
    Initial,
    Scripting,
    LookingForProperty,
    DoubleQuotes,
    NowDoc,
    HereDoc,
    EndHereDoc,
    BackQuote,
    VarOffset,
    LookingForVarName
}

class LexerState {

    input: string;
    lexeme: string;
    mode: LexerMode[];
    line: number;
    char: number;
    lastLexemeEndedWithNewline: boolean;
    hereDocLabel: string;
    lastDocComment: string;
    doubleQuoteScannedLength: number;

    constructor() {
        this.clear();
    }

    less(n: number = 0) {
        this.input = this.lexeme.slice(n) + this.input;
        this.lexeme = this.lexeme.substr(0, n);
    }

    more(n: number) {
        this.lexeme += this.input.substr(0, n);
        this.input = this.input.slice(n);
    }

    advancePosition(countLines: boolean) {
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
        let c: string;

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
        this.input = this.lexeme = this.hereDocLabel = this.doubleQuoteScannedLength = this.lastDocComment = null;
        this.mode = [LexerMode.Initial];
        this.char = -1;
        this.line = 0;
        this.lastLexemeEndedWithNewline = false;
    }

}

function isLabelStart(char: string) {
    let cp = char.charCodeAt(0);
    return (cp >= 97 && cp <= 122) || (cp >= 65 && cp <= 90) || cp === 95 || cp >= 0x7F;
}

interface LexerAction {
    (s: LexerState): TokenType | string
}

function action1(s: LexerState) {
    s.advancePosition(false);
    s.mode = [LexerMode.Scripting];
    return TokenType.T_OPEN_TAG_WITH_ECHO;
}

function action2(s: LexerState) {
    s.advancePosition(true);
    s.mode = [LexerMode.Scripting];
    return TokenType.T_OPEN_TAG;
}

function action3(s: LexerState) {
    s.advancePosition(false);
    s.mode = [LexerMode.Scripting];
    return TokenType.T_OPEN_TAG;
}

function action4(s: LexerState) {
    //read until open tag or end
    if (s.input.length) {
        let pos = s.input.search(/<\?=|<\?php(?:[ \t]|(?:\r\n|\n|\r))|<\?/);
        if (pos === -1) {
            s.more(s.input.length);
        } else {
            s.more(pos);
        }
    }

    s.advancePosition(true);
    return TokenType.T_INLINE_HTML;
}

function action5(s: LexerState) {
    s.advancePosition(true);
    return TokenType.T_YIELD_FROM;
}

function action6(s: LexerState) {
    s.advancePosition(false);
    s.mode = [...s.mode.slice(), LexerMode.LookingForProperty];
    return TokenType.T_OBJECT_OPERATOR;
}

function action7(s: LexerState) {
    s.advancePosition(true);
    return TokenType.T_WHITESPACE;
}

function action8(s: LexerState) {
    s.advancePosition(false);
    s.mode = [...s.mode.slice(), LexerMode.Scripting];
    return '{';
}

function action9(s: LexerState) {
    s.lastDocComment = null;
    s.advancePosition(false);
    if (s.mode.length > 1) {
        s.mode = s.mode.slice(0, -1);
    }
    return '}';
}

function action10(s: LexerState) {

    //find first newline or closing tag
    let match: RegExpMatchArray = s.input.match(/(?:\r\n|\n|\r)+|\?>/);

    if (!match) {
        s.more(s.input.length);
    } else if (match[0] === '?>') {
        s.more(match.index);
    } else {
        //newline
        s.more(match.index + match[0].length);
    }

    s.advancePosition(true);
    return TokenType.T_COMMENT;
}

function action11(s: LexerState) {

    let isDocComment = false;
    if (s.lexeme.length > 2) {
        isDocComment = true;
    }

    //find comment end */
    let pos = s.input.search(/\*\//);

    if (pos === -1) {
        //todo WARN unterminated comment
        s.more(s.input.length);
    } else {
        s.more(pos + 2);
    }

    s.advancePosition(true);

    if (isDocComment) {
        s.lastDocComment = s.lexeme;
        return TokenType.T_DOC_COMMENT;
    }

    return TokenType.T_COMMENT;

}

function action12(s: LexerState) {
    s.mode = [LexerMode.Initial];
    s.advancePosition(true);
    return TokenType.T_CLOSE_TAG;
}

function action13(s: LexerState) {

    //find first unescaped '
    let n = 0;
    while (true) {
        if (n < s.input.length) {
            if (s.input[n] === '\'') {
                ++n;
                break;
            } else if (s.input[n++] === '\\' && n < s.input.length) {
                ++n;
            }
        } else {
            s.advancePosition(false);
            return TokenType.T_ENCAPSED_AND_WHITESPACE;
        }
    }

    s.more(n);
    s.advancePosition(true);
    return TokenType.T_CONSTANT_ENCAPSED_STRING;
}

function action14(s: LexerState) {

    //consume until unescaped "
    //if ${LABEL_START}, ${, {$ found or no match return " and consume none 
    let n = 0;
    let char: string;

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
            /* fall through */
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

function action15(s: LexerState) {

    let match = s.lexeme.match(/[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/);
    s.hereDocLabel = match[0];
    let c = s.lexeme[match.index - 1];

    if (c === '\'') {
        s.mode = [LexerMode.NowDoc];
    } else {
        s.mode = [LexerMode.HereDoc];
    }

    //check for end on next line
    if (s.input.search(new RegExp('^' + s.hereDocLabel + ';?(?:\r\n|\n|\r)')) !== -1) {
        s.mode = [LexerMode.EndHereDoc];
    }

    s.advancePosition(true);
    return TokenType.T_START_HEREDOC;
}

function action16(s: LexerState) {
    s.advancePosition(false);
    s.mode = [LexerMode.BackQuote];
    return '`';
}

function action17(s: LexerState) {
    //Unexpected character
    s.advancePosition(false);
    return s.input[0];
}

function action18(s: LexerState) {
    s.mode = s.mode.slice(0, -1);
    s.advancePosition(false);
    return TokenType.T_STRING;
}

function action19(s: LexerState) {
    s.less();
    s.mode = s.mode.slice(0, -1);
    return -1;
}

function action20(s: LexerState) {
    s.mode = [...s.mode, LexerMode.LookingForVarName];
    s.advancePosition(false);
    return TokenType.T_DOLLAR_OPEN_CURLY_BRACES;
}

function action21(s: LexerState) {
    s.less(s.lexeme.length - 3);
    s.mode = [...s.mode, LexerMode.LookingForProperty];
    s.advancePosition(false);
    return TokenType.T_VARIABLE;
}

function action22(s: LexerState) {
    s.less(s.lexeme.length - 1);
    s.mode = [...s.mode, LexerMode.VarOffset];
    s.advancePosition(false);
    return TokenType.T_VARIABLE;
}

function action23(s: LexerState) {
    s.less(1);
    s.mode = [...s.mode, LexerMode.Scripting];
    s.advancePosition(false);
    return TokenType.T_CURLY_OPEN;
}


function action24(s: LexerState) {
    s.mode = [LexerMode.Scripting];
    s.advancePosition(false);
    return '"';
}

function action25(s: LexerState) {

    if (s.doubleQuoteScannedLength) {
        //already know match index below
        //subtract 1 for the character already shifted
        s.more(s.doubleQuoteScannedLength - 1);
        s.doubleQuoteScannedLength = 0;
    } else {
        let n = 0;
        if (s.lexeme[0] === '\\' && s.input.length) {
            ++n;
        }

        let char: string;
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
                /* fall through */
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

function action26(s: LexerState) {

    //search for label
    let match = s.input.match(new RegExp('(?:\r\n|\n|\r)' + s.hereDocLabel + ';?(?:\r\n|\n|\r)'));
    let nNewlineChars: number;

    if (!match) {
        s.more(s.input.length);
    } else {
        nNewlineChars = match[0].substr(0, 2) === '\r\n' ? 2 : 1;
        s.more(match.index + nNewlineChars);
        s.mode = [LexerMode.EndHereDoc];
    }

    s.advancePosition(true);
    return TokenType.T_ENCAPSED_AND_WHITESPACE;

}

function action27(s: LexerState) {

    let n = 0;
    let char: string;
    while (n < s.input.length) {
        char = s.input[n++];
        switch (char) {
            case '\r':
                if (n < s.input.length && s.input[n] === '\n') {
                    ++n;
                }
            /* fall through */
            case '\n':
                /* Check for ending label on the next line */
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
            /* fall through */
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

function action28(s: LexerState) {
    s.more(s.hereDocLabel.length - 1);
    s.hereDocLabel = null;
    s.mode = [LexerMode.Scripting];
    s.advancePosition(false);
    return TokenType.T_END_HEREDOC;
}

function action29(s: LexerState) {
    s.mode = [LexerMode.Scripting];
    s.advancePosition(false);
    return '`';
}

function action30(s: LexerState) {

    let n = 0;
    let char: string;

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
            /* fall through */
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

function action31(s: LexerState) {
    s.mode = s.mode.slice(0, -1);
    s.advancePosition(false);
    return ']';
}

function action32(s: LexerState) {
    //unexpected char
    if (s.lexeme === '\r' && s.input && s.input[0] === '\n') {
        s.more(1);
    }
    s.mode = [...s.mode.slice(0, -1)];
    s.advancePosition(true);
    return s.lexeme;
}

function action33(s: LexerState) {
    s.less(s.lexeme.length - 1);
    s.mode = [...s.mode.slice(0, -1), LexerMode.Scripting];
    s.advancePosition(false);
    return TokenType.T_STRING_VARNAME;
}

function action34(s: LexerState) {
    s.less();
    s.mode = [...s.mode.slice(0, -1), LexerMode.Scripting];
    return -1;
}

function action35(s: LexerState) {
    s.advancePosition(false);
    return s.lexeme;
}

var ruleTable: [RegExp, (TokenType | LexerAction)][][] = [
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

export interface Token {
    type: TokenType | string,
    text: string,
    mode: LexerMode[],
    range: Range
}

export interface Position {
    line: number,
    char: number
}

export interface Range {
    start: Position,
    end: Position
}

class Lexer {

    private _state: LexerState;
    private _patterns: RegExp[] = [];
    private _table = ruleTable;

    constructor() {
        this._state = new LexerState();
        for (let n = 0; n < this._table.length; ++n) {
            this._patterns.push(this.concatRegExpArray(this._table[n].map((v, i, a) => { return v[0]; })));
        }
    }

    lex(text: string, mode: LexerMode[] = null) {
        this._state.clear();
        this._state.input = text;
        if (mode) {
            this._state.mode = mode;
        }

        let firstLine: number, firstChar: number;
        let match: RegExpMatchArray;
        let actionIndex: number;
        let type: TokenType | string;
        let action: TokenType | LexerAction;
        let lexerMode: LexerMode;
        let lexerModeStack: LexerMode[];
        let tokens: Token[] = [];

        while (true) {

            if (!this._state.input.length) {
                break;
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

            //skip first element which is the matched string
            for (let n = 1; n < match.length; ++n) {
                if (match[n]) {
                    actionIndex = n - 1;
                    break;
                }
            }

            this._state.more(match[0].length);
            action = this._table[lexerMode][actionIndex][1];
            if (typeof action === 'function') {
                type = action(this._state);
            } else {
                type = action;
                this._state.advancePosition(false);
            }

            if (type === -1) {
                continue;
            }

            tokens.push({
                type: type,
                text: this._state.lexeme,
                mode: lexerModeStack,
                range: {
                    start: { line: firstLine, char: firstChar },
                    end: { line: this._state.line, char: this._state.char }
                }
            });

        }

        return tokens;

    }

    private concatRegExpArray(regExpArray: RegExp[]): RegExp {
        let src = regExpArray.map((v, i, a) => {
            return '(' + v.source + ')';
        }).join('|');
        return new RegExp(src);
    }

}

class TokenIterator {

    private _tokens: Token[];
    private _pos: number;
    private _endToken: Token = {
        type: TokenType.T_NONE,
        text: null,
        mode: null,
        range: null
    };
    private _lastDocComment: Token;

    constructor(tokens: Token[]) {
        this._tokens = tokens;
        this._pos = 0;
    }

    get current() {
        return this._pos < this._tokens.length ? this._tokens[this._pos] : this._endToken;
    }

    get lastDocComment() {
        let t = this._lastDocComment;
        this._lastDocComment = null;
        return t;
    }

    next(): Token {
        let t = this._pos < this._tokens.length ? this._tokens[this._pos++] : this._endToken;
        if (t.type === '}') {
            this._lastDocComment = null;
        }
        if (this.shouldSkip(t)) {
            return this.next();
        }
        return t;
    }

    lookahead(n = 0) {
        let pos = this._pos + n;
        return pos < this._tokens.length ? this._tokens[pos] : this._endToken;
    }

    rewind() {
        this._pos = 0;
        this._lastDocComment = null;
    }

    private shouldSkip(t: Token) {
        return t.type === TokenType.T_WHITESPACE ||
            t.type === TokenType.T_COMMENT ||
            t.type === TokenType.T_DOC_COMMENT ||
            t.type === TokenType.T_OPEN_TAG ||
            t.type === TokenType.T_OPEN_TAG_WITH_ECHO ||
            t.type === TokenType.T_CLOSE_TAG;
    }

}