/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

export enum TokenType {
    T_EOF, T_ABSTRACT, T_AND_EQUAL, T_ARRAY, T_ARRAY_CAST, T_AS,
    T_BAD_CHARACTER, T_BOOLEAN_AND, T_BOOLEAN_OR, T_BOOL_CAST, T_BREAK,
    T_CALLABLE, T_CASE, T_CATCH, T_CHARACTER, T_CLASS, T_CLASS_C,
    T_CLONE, T_CLOSE_TAG, T_COALESCE, T_COMMENT, T_CONCAT_EQUAL, T_CONST,
    T_CONSTANT_ENCAPSED_STRING, T_CONTINUE, T_CURLY_OPEN, T_DEC, T_DECLARE,
    T_DEFAULT, T_DIR, T_DIV_EQUAL, T_DNUMBER, T_DOC_COMMENT, T_DO,
    T_DOLLAR_OPEN_CURLY_BRACES, T_DOUBLE_ARROW, T_DOUBLE_CAST, T_DOUBLE_COLON,
    T_ECHO, T_ELLIPSIS, T_ELSE, T_ELSEIF, T_EMPTY, T_ENCAPSED_AND_WHITESPACE,
    T_ENDDECLARE, T_ENDFOR, T_ENDFOREACH, T_ENDIF, T_ENDSWITCH, T_ENDWHILE,
    T_END_HEREDOC, T_EVAL, T_EXIT, T_EXTENDS, T_FILE, T_FINAL, T_FINALLY,
    T_FOR, T_FOREACH, T_FUNCTION, T_FUNC_C, T_GLOBAL, T_GOTO, T_HALT_COMPILER,
    T_IF, T_IMPLEMENTS, T_INC, T_INCLUDE, T_INCLUDE_ONCE, T_INLINE_HTML,
    T_INSTANCEOF, T_INSTEADOF, T_INT_CAST, T_INTERFACE, T_ISSET, T_IS_EQUAL,
    T_IS_GREATER_OR_EQUAL, T_IS_IDENTICAL, T_IS_NOT_EQUAL, T_IS_NOT_IDENTICAL,
    T_IS_SMALLER_OR_EQUAL, T_SPACESHIP, T_LINE, T_LIST, T_LNUMBER, T_LOGICAL_AND,
    T_LOGICAL_OR, T_LOGICAL_XOR, T_METHOD_C, T_MINUS_EQUAL, T_MOD_EQUAL,
    T_MUL_EQUAL, T_NAMESPACE, T_NS_C, T_NS_SEPARATOR, T_NEW, T_NUM_STRING,
    T_OBJECT_CAST, T_OBJECT_OPERATOR, T_OPEN_TAG, T_OPEN_TAG_WITH_ECHO,
    T_OR_EQUAL, T_PAAMAYIM_NEKUDOTAYIM, T_PLUS_EQUAL, T_POW, T_POW_EQUAL,
    T_PRINT, T_PRIVATE, T_PUBLIC, T_PROTECTED, T_REQUIRE, T_REQUIRE_ONCE,
    T_RETURN, T_SL, T_SL_EQUAL, T_SR, T_SR_EQUAL, T_START_HEREDOC, T_STATIC,
    T_STRING, T_STRING_CAST, T_STRING_VARNAME, T_SWITCH, T_THROW, T_TRAIT,
    T_TRAIT_C, T_TRY, T_UNSET, T_UNSET_CAST, T_USE, T_VAR, T_VARIABLE,
    T_WHILE, T_WHITESPACE, T_XOR_EQUAL, T_YIELD, T_YIELD_FROM
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

export interface Token {
    tokenType: TokenType | string,
    index: number,
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

export namespace Lexer {

    var input: string;
    var lexeme: string;
    var mode: LexerMode[];
    var line: number;
    var char: number;
    var lastLexemeEndedWithNewline: boolean;
    var hereDocLabel: string;
    var doubleQuoteScannedLength: number;
    var tokenCount: number
    var table: [RegExp, (TokenType | LexerAction)][][] = [
        //INITIAL
        [
            [/^<\?=/, action1],
            [/^<\?php(?:[ \t]|(?:\r\n|\n|\r))/, action2],
            [/^<\?/, action3],
            [/^[^]/, action4]
        ],
        //IN_SCRIPTING
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
        //LOOKING_FOR_PROPERTY
        [
            [/^[ \n\r\t]+/, action7],
            [/^->/, TokenType.T_OBJECT_OPERATOR],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, action18],
            [/^[^]/, action19]
        ],
        //DOUBLE_QUOTES
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
            [/^\{\$/, action23],
            [/^"/, action24],
            [/^[^]/, action25]
        ],
        //ST_END_HEREDOC
        [
            [/^[^]/, action26]
        ],
        //ST_HEREDOC
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
            [/^\{\$/, action23],
            [/^[^]/, action27]
        ],
        //NOWDOC
        [
            [/^[^]/, action28]
        ],
        //BACKQUOTE
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
            [/^\{\$/, action23],
            [/^`/, action29],
            [/^[^]/, action30]
        ],
        //VAR_OFFSET
        [
            [/^[0-9]+|^0x[0-9a-fA-F]+|^0b[01]+/, TokenType.T_NUM_STRING],
            [/^0|^[1-9][0-9]*/, TokenType.T_NUM_STRING],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_VARIABLE],
            [/^\]/, action31],
            [/^\[/, action35],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.T_STRING],
            [/^[^]/, action32]
        ],
        //ST_LOOKING_FOR_VARNAME
        [
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*[[}]/, action33],
            [/^[^]/, action34]
        ]
    ];

    function clear() {
        input = lexeme = hereDocLabel = doubleQuoteScannedLength = null;
        mode = [LexerMode.Initial];
        char = -1;
        line = 0;
        lastLexemeEndedWithNewline = false;
        tokenCount = 0;
    }

    function less(n: number = 0) {
        input = lexeme.slice(n) + input;
        lexeme = lexeme.substr(0, n);
    }

    function more(n: number) {
        lexeme += input.substr(0, n);
        input = input.slice(n);
    }

    function advancePosition(countLines: boolean) {
        if (!lexeme) {
            return;
        }

        if (!countLines) {
            if (lastLexemeEndedWithNewline) {
                char = -1;
                ++line;
                lastLexemeEndedWithNewline = false;
            }
            char += lexeme.length;
            return;
        }

        let n = 0;
        let c: string;

        while (n < lexeme.length) {
            if (lastLexemeEndedWithNewline) {
                char = -1;
                ++line;
                lastLexemeEndedWithNewline = false;
            }
            ++char;
            c = lexeme[n++];
            if (c === '\n' || c === '\r') {
                lastLexemeEndedWithNewline = true;
                if (c === '\r' && n < lexeme.length && lexeme[n] === '\n') {
                    ++n;
                    ++char;
                }
            }
        }

    }

    function concatRegExpArray(regExpArray: RegExp[]): RegExp {
        let src = regExpArray.map((v, i, a) => {
            return '(' + v.source + ')';
        }).join('|');
        return new RegExp(src);
    }

    var patterns: RegExp[] = [];
    for (let n = 0; n < table.length; ++n) {
        patterns.push(concatRegExpArray(table[n].map((v, i, a) => { return v[0]; })));
    }

    function lex(): Token {

        let firstLine: number, firstChar: number;
        let match: RegExpMatchArray;
        let actionIndex: number;
        let type: TokenType | string;
        let action: TokenType | LexerAction;
        let lexerMode: LexerMode;
        let lexerModeStack: LexerMode[];

        if (!input.length) {
            return null;
        }

        firstLine = line;
        firstChar = char + 1;

        if (lastLexemeEndedWithNewline) {
            ++firstLine;
            firstChar = 0;
        }

        lexerModeStack = mode.slice(0);
        lexerMode = mode[mode.length - 1];
        match = input.match(patterns[lexerMode]);

        //skip first element which is the matched string
        for (let n = 1; n < match.length; ++n) {
            if (match[n]) {
                actionIndex = n - 1;
                break;
            } else {
                throw new Error('Failed to find action index');
            }
        }

        more(match[0].length);
        action = table[lexerMode][actionIndex][1];
        if (typeof action === 'function') {
            type = action();
            if (type === -1) {
                return lex();
            }
        } else {
            type = action;
            advancePosition(false);
        }

        return {
            tokenType: type,
            index: tokenCount++,
            text: lexeme,
            mode: lexerModeStack,
            range: {
                start: { line: firstLine, char: firstChar },
                end: { line: line, char: char }
            }
        };

    }

    export function tokenise(text: string, modeState: LexerMode[] = [LexerMode.Initial]) {
        clear();
        input = text;
        mode = modeState;

        let tokens: Token[] = [];
        let t: Token;

        while (t = lex()) {
            tokens.push(t);
        }
        return tokens;
    }


    function isLabelStart(char: string) {
        let cp = char.charCodeAt(0);
        return (cp >= 97 && cp <= 122) || (cp >= 65 && cp <= 90) || cp === 95 || cp >= 0x7F;
    }

    interface LexerAction {
        (): TokenType | string;
    }

    function action1() {
        advancePosition(false);
        mode = [LexerMode.Scripting];
        return TokenType.T_OPEN_TAG_WITH_ECHO;
    }

    function action2() {
        advancePosition(true);
        mode = [LexerMode.Scripting];
        return TokenType.T_OPEN_TAG;
    }

    function action3() {
        advancePosition(false);
        mode = [LexerMode.Scripting];
        return TokenType.T_OPEN_TAG;
    }

    function action4() {
        //read until open tag or end
        if (input.length) {
            let pos = input.search(/<\?=|<\?php(?:[ \t]|(?:\r\n|\n|\r))|<\?/);
            if (pos === -1) {
                more(input.length);
            } else {
                more(pos);
            }
        }

        advancePosition(true);
        return TokenType.T_INLINE_HTML;
    }

    function action5() {
        advancePosition(true);
        return TokenType.T_YIELD_FROM;
    }

    function action6() {
        advancePosition(false);
        mode = [...mode.slice(), LexerMode.LookingForProperty];
        return TokenType.T_OBJECT_OPERATOR;
    }

    function action7() {
        advancePosition(true);
        return TokenType.T_WHITESPACE;
    }

    function action8() {
        advancePosition(false);
        mode = [...mode.slice(), LexerMode.Scripting];
        return '{';
    }

    function action9() {
        advancePosition(false);
        if (mode.length > 1) {
            mode = mode.slice(0, -1);
        }
        return '}';
    }

    function action10() {

        //find first newline or closing tag
        let match: RegExpMatchArray = input.match(/(?:\r\n|\n|\r)+|\?>/);

        if (!match) {
            more(input.length);
        } else if (match[0] === '?>') {
            more(match.index);
        } else {
            //newline
            more(match.index + match[0].length);
        }

        advancePosition(true);
        return TokenType.T_COMMENT;
    }

    function action11() {

        let isDocComment = false;
        if (lexeme.length > 2) {
            isDocComment = true;
        }

        //find comment end */
        let pos = input.search(/\*\//);

        if (pos === -1) {
            //todo WARN unterminated comment
            more(input.length);
        } else {
            more(pos + 2);
        }

        advancePosition(true);

        if (isDocComment) {
            return TokenType.T_DOC_COMMENT;
        }

        return TokenType.T_COMMENT;

    }

    function action12() {
        mode = [LexerMode.Initial];
        advancePosition(true);
        return TokenType.T_CLOSE_TAG;
    }

    function action13() {

        //find first unescaped '
        let n = 0;
        while (true) {
            if (n < input.length) {
                if (input[n] === '\'') {
                    ++n;
                    break;
                } else if (input[n++] === '\\' && n < input.length) {
                    ++n;
                }
            } else {
                advancePosition(false);
                return TokenType.T_ENCAPSED_AND_WHITESPACE;
            }
        }

        more(n);
        advancePosition(true);
        return TokenType.T_CONSTANT_ENCAPSED_STRING;
    }

    function action14() {

        //consume until unescaped "
        //if ${LABEL_START}, ${, {$ found or no match return " and consume none 
        let n = 0;
        let char: string;

        while (n < input.length) {
            char = input[n++];
            switch (char) {
                case '"':
                    more(n);
                    advancePosition(true);
                    return TokenType.T_CONSTANT_ENCAPSED_STRING;
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
                /* fall through */
                default:
                    continue;
            }

            --n;
            break;
        }

        advancePosition(false);
        doubleQuoteScannedLength = n;
        mode = [LexerMode.DoubleQuotes];
        return '"';

    }

    function action15() {

        let match = lexeme.match(/[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/);
        hereDocLabel = match[0];
        let c = lexeme[match.index - 1];

        if (c === '\'') {
            mode = [LexerMode.NowDoc];
        } else {
            mode = [LexerMode.HereDoc];
        }

        //check for end on next line
        if (input.search(new RegExp('^' + hereDocLabel + ';?(?:\r\n|\n|\r)')) !== -1) {
            mode = [LexerMode.EndHereDoc];
        }

        advancePosition(true);
        return TokenType.T_START_HEREDOC;
    }

    function action16() {
        advancePosition(false);
        mode = [LexerMode.BackQuote];
        return '`';
    }

    function action17() {
        //Unexpected character
        advancePosition(false);
        return input[0];
    }

    function action18() {
        mode = mode.slice(0, -1);
        advancePosition(false);
        return TokenType.T_STRING;
    }

    function action19() {
        less();
        mode = mode.slice(0, -1);
        return -1;
    }

    function action20() {
        mode = [...mode, LexerMode.LookingForVarName];
        advancePosition(false);
        return TokenType.T_DOLLAR_OPEN_CURLY_BRACES;
    }

    function action21() {
        less(lexeme.length - 3);
        mode = [...mode, LexerMode.LookingForProperty];
        advancePosition(false);
        return TokenType.T_VARIABLE;
    }

    function action22() {
        less(lexeme.length - 1);
        mode = [...mode, LexerMode.VarOffset];
        advancePosition(false);
        return TokenType.T_VARIABLE;
    }

    function action23() {
        less(1);
        mode = [...mode, LexerMode.Scripting];
        advancePosition(false);
        return TokenType.T_CURLY_OPEN;
    }


    function action24() {
        mode = [LexerMode.Scripting];
        advancePosition(false);
        return '"';
    }

    function action25() {

        if (doubleQuoteScannedLength) {
            //already know match index below
            //subtract 1 for the character already shifted
            more(doubleQuoteScannedLength - 1);
            doubleQuoteScannedLength = 0;
        } else {
            let n = 0;
            if (lexeme[0] === '\\' && input.length) {
                ++n;
            }

            let char: string;
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
                    /* fall through */
                    default:
                        continue;
                }

                --n;
                break;
            }

            more(n);
        }

        advancePosition(true);
        return TokenType.T_ENCAPSED_AND_WHITESPACE;

    }

    function action26() {

        //search for label
        let match = input.match(new RegExp('(?:\r\n|\n|\r)' + hereDocLabel + ';?(?:\r\n|\n|\r)'));
        let nNewlineChars: number;

        if (!match) {
            more(input.length);
        } else {
            nNewlineChars = match[0].substr(0, 2) === '\r\n' ? 2 : 1;
            more(match.index + nNewlineChars);
            mode = [LexerMode.EndHereDoc];
        }

        advancePosition(true);
        return TokenType.T_ENCAPSED_AND_WHITESPACE;

    }

    function action27() {

        let n = 0;
        let char: string;
        while (n < input.length) {
            char = input[n++];
            switch (char) {
                case '\r':
                    if (n < input.length && input[n] === '\n') {
                        ++n;
                    }
                /* fall through */
                case '\n':
                    /* Check for ending label on the next line */
                    if (n < input.length && isLabelStart(input[n]) && input.slice(n, n + hereDocLabel.length) === hereDocLabel) {
                        let k = n + hereDocLabel.length;

                        if (k < input.length && input[k] === ';') {
                            ++k;
                        }

                        if (k < input.length && (input[k] === '\n' || input[k] === '\r')) {
                            mode = [LexerMode.EndHereDoc];
                            more(n);
                            advancePosition(true);
                            return TokenType.T_ENCAPSED_AND_WHITESPACE;
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
                /* fall through */
                default:
                    continue;
            }

            --n;
            break;
        }

        more(n);
        advancePosition(true);
        return TokenType.T_ENCAPSED_AND_WHITESPACE;

    }

    function action28() {
        more(hereDocLabel.length - 1);
        hereDocLabel = null;
        mode = [LexerMode.Scripting];
        advancePosition(false);
        return TokenType.T_END_HEREDOC;
    }

    function action29() {
        mode = [LexerMode.Scripting];
        advancePosition(false);
        return '`';
    }

    function action30() {

        let n = 0;
        let char: string;

        if (lexeme[0] === '\\' && n < input.length) {
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
                /* fall through */
                default:
                    continue;
            }

            --n;
            break;
        }

        more(n);
        advancePosition(true);
        return TokenType.T_ENCAPSED_AND_WHITESPACE;
    }

    function action31() {
        mode = mode.slice(0, -1);
        advancePosition(false);
        return ']';
    }

    function action32() {
        //unexpected char
        if (lexeme === '\r' && input && input[0] === '\n') {
            more(1);
        }
        mode = [...mode.slice(0, -1)];
        advancePosition(true);
        return lexeme;
    }

    function action33() {
        less(lexeme.length - 1);
        mode = [...mode.slice(0, -1), LexerMode.Scripting];
        advancePosition(false);
        return TokenType.T_STRING_VARNAME;
    }

    function action34() {
        less();
        mode = [...mode.slice(0, -1), LexerMode.Scripting];
        return -1;
    }

    function action35() {
        advancePosition(false);
        return lexeme;
    }

}