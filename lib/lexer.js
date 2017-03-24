/* Copyright (c) Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer;
(function (Lexer) {
    const table = [
        //INITIAL
        [
            [/^<\?=/, action1],
            [/^<\?php(?:[ \t]|(?:\r\n|\n|\r))/, action2],
            [/^<\?/, action3],
            [/^[^]/, action4]
        ],
        //IN_SCRIPTING
        [
            [/^exit(?=\b)/, 29 /* Exit */],
            [/^die(?=\b)/, 29 /* Exit */],
            [/^function(?=\b)/, 35 /* Function */],
            [/^const(?=\b)/, 12 /* Const */],
            [/^return(?=\b)/, 59 /* Return */],
            [/^yield[ \n\r\t]+from/, 70 /* YieldFrom */],
            [/^yield(?=\b)/, 69 /* Yield */],
            [/^try(?=\b)/, 64 /* Try */],
            [/^catch(?=\b)/, 8 /* Catch */],
            [/^finally(?=\b)/, 32 /* Finally */],
            [/^throw(?=\b)/, 62 /* Throw */],
            [/^if(?=\b)/, 39 /* If */],
            [/^elseif(?=\b)/, 19 /* ElseIf */],
            [/^endif(?=\b)/, 24 /* EndIf */],
            [/^else(?=\b)/, 18 /* Else */],
            [/^while(?=\b)/, 68 /* While */],
            [/^endwhile(?=\b)/, 26 /* EndWhile */],
            [/^do(?=\b)/, 16 /* Do */],
            [/^for(?=\b)/, 33 /* For */],
            [/^endfor(?=\b)/, 22 /* EndFor */],
            [/^foreach(?=\b)/, 34 /* ForEach */],
            [/^endforeach(?=\b)/, 23 /* EndForeach */],
            [/^declare(?=\b)/, 14 /* Declare */],
            [/^enddeclare(?=\b)/, 21 /* EndDeclare */],
            [/^instanceof(?=\b)/, 43 /* InstanceOf */],
            [/^as(?=\b)/, 4 /* As */],
            [/^switch(?=\b)/, 61 /* Switch */],
            [/^endswitch(?=\b)/, 25 /* EndSwitch */],
            [/^case(?=\b)/, 7 /* Case */],
            [/^default(?=\b)/, 15 /* Default */],
            [/^break(?=\b)/, 5 /* Break */],
            [/^continue(?=\b)/, 13 /* Continue */],
            [/^goto(?=\b)/, 37 /* Goto */],
            [/^echo(?=\b)/, 17 /* Echo */],
            [/^print(?=\b)/, 53 /* Print */],
            [/^class(?=\b)/, 9 /* Class */],
            [/^interface(?=\b)/, 45 /* Interface */],
            [/^trait(?=\b)/, 63 /* Trait */],
            [/^extends(?=\b)/, 30 /* Extends */],
            [/^implements(?=\b)/, 40 /* Implements */],
            [/^->/, action6],
            [/^[ \n\r\t]+/, 161 /* Whitespace */],
            [/^::/, 133 /* ColonColon */],
            [/^\\/, 147 /* Backslash */],
            [/^\.\.\./, 134 /* Ellipsis */],
            [/^\?\?/, 122 /* QuestionQuestion */],
            [/^new(?=\b)/, 52 /* New */],
            [/^clone(?=\b)/, 11 /* Clone */],
            [/^var(?=\b)/, 67 /* Var */],
            [/^\([ \t]*(?:int|integer)[ \t]*\)/, 152 /* IntegerCast */],
            [/^\([ \t]*(?:real|double|float)[ \t]*\)/, 153 /* FloatCast */],
            [/^\([ \t]*(?:string|binary)[ \t]*\)/, 150 /* StringCast */],
            [/^\([ \t]*array[ \t]*\)/, 155 /* ArrayCast */],
            [/^\([ \t]*object[ \t]*\)/, 151 /* ObjectCast */],
            [/^\([ \t]*(?:boolean|bool)[ \t]*\)/, 148 /* BooleanCast */],
            [/^\([ \t]*unset[ \t]*\)/, 149 /* UnsetCast */],
            [/^eval(?=\b)/, 28 /* Eval */],
            [/^include_once(?=\b)/, 42 /* IncludeOnce */],
            [/^include(?=\b)/, 41 /* Include */],
            [/^require_once(?=\b)/, 58 /* RequireOnce */],
            [/^require(?=\b)/, 57 /* Require */],
            [/^namespace(?=\b)/, 51 /* Namespace */],
            [/^use(?=\b)/, 66 /* Use */],
            [/^insteadof(?=\b)/, 44 /* InsteadOf */],
            [/^global(?=\b)/, 36 /* Global */],
            [/^isset(?=\b)/, 46 /* Isset */],
            [/^empty(?=\b)/, 20 /* Empty */],
            [/^__halt_compiler/, 38 /* HaltCompiler */],
            [/^static(?=\b)/, 60 /* Static */],
            [/^abstract(?=\b)/, 2 /* Abstract */],
            [/^final(?=\b)/, 31 /* Final */],
            [/^private(?=\b)/, 54 /* Private */],
            [/^protected(?=\b)/, 56 /* Protected */],
            [/^public(?=\b)/, 55 /* Public */],
            [/^unset(?=\b)/, 65 /* Unset */],
            [/^=>/, 132 /* FatArrow */],
            [/^list(?=\b)/, 47 /* List */],
            [/^array(?=\b)/, 3 /* Array */],
            [/^callable(?=\b)/, 6 /* Callable */],
            [/^--/, 129 /* MinusMinus */],
            [/^\+\+/, 135 /* PlusPlus */],
            [/^===/, 138 /* EqualsEqualsEquals */],
            [/^!==/, 140 /* ExclamationEqualsEquals */],
            [/^==/, 136 /* EqualsEquals */],
            [/^!=|^<>/, 139 /* ExclamationEquals */],
            [/^<=>/, 142 /* Spaceship */],
            [/^<=/, 141 /* LessThanEquals */],
            [/^>=/, 137 /* GreaterThanEquals */],
            [/^\+=/, 112 /* PlusEquals */],
            [/^-=/, 144 /* MinusEquals */],
            [/^\*=/, 146 /* AsteriskEquals */],
            [/^\*\*/, 113 /* AsteriskAsterisk */],
            [/^\*\*=/, 114 /* AsteriskAsteriskEquals */],
            [/^\/=/, 130 /* ForwardslashEquals */],
            [/^\.=/, 127 /* DotEquals */],
            [/^%=/, 145 /* PercentEquals */],
            [/^<<=/, 107 /* LessThanLessThanEquals */],
            [/^>>=/, 109 /* GreaterThanGreaterThanEquals */],
            [/^&=/, 104 /* AmpersandEquals */],
            [/^\|=/, 110 /* BarEquals */],
            [/^\^=/, 105 /* CaretEquals */],
            [/^\|\|/, 124 /* BarBar */],
            [/^&&/, 102 /* AmpersandAmpersand */],
            [/^(?:OR|or)(?=\b)/, 49 /* Or */],
            [/^(?:AND|and)(?=\b)/, 48 /* And */],
            [/^(?:XOR|xor)(?=\b)/, 50 /* Xor */],
            [/^\\?<<<[ \t]*(?:[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*|'[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*'|"[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*")(?:\r\n|\n|\r)/, action15],
            [/^<</, 106 /* LessThanLessThan */],
            [/^>>/, 108 /* GreaterThanGreaterThan */],
            [/^\{/, action8],
            [/^\}/, action9],
            [/^0b[01]+/, 82 /* IntegerLiteral */],
            [/^0x[0-9a-fA-F]+/, 82 /* IntegerLiteral */],
            [/^(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*)|^(?:[0-9]+|(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*))[eE][+-]?[0-9]+/, 79 /* FloatingLiteral */],
            [/^[0-9]+/, 82 /* IntegerLiteral */],
            [/^__CLASS__/, 10 /* ClassConstant */],
            [/^__TRAIT__/, 77 /* TraitConstant */],
            [/^__FUNCTION__/, 74 /* FunctionConstant */],
            [/^__METHOD__/, 75 /* MethodConstant */],
            [/^__LINE__/, 73 /* LineConstant */],
            [/^__FILE__/, 72 /* FileConstant */],
            [/^__DIR__/, 71 /* DirectoryConstant */],
            [/^__NAMESPACE__/, 76 /* NamespaceConstant */],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84 /* VariableName */],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 83 /* Name */],
            [/^#|\/\//, action10],
            [/^\/\*\*|^\/\*/, action11],
            [/^\?>(?:\r\n|\n|\r)?/, action12],
            [/^\\?'/, action13],
            [/^\\?"/, action14],
            [/^`/, action16],
            [/^[;:,.\[\]()|^&+\-\/*=%!~$<>?@]/, action35],
            [/^[^]/, 0 /* Unknown */],
        ],
        //LOOKING_FOR_PROPERTY
        [
            [/^[ \n\r\t]+/, 161 /* Whitespace */],
            [/^->/, 115 /* Arrow */],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, action18],
            [/^[^]/, action19]
        ],
        //DOUBLE_QUOTES
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84 /* VariableName */],
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
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84 /* VariableName */],
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
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84 /* VariableName */],
            [/^\{\$/, action23],
            [/^`/, action29],
            [/^[^]/, action30]
        ],
        //VAR_OFFSET
        [
            [/^[0-9]+|^0x[0-9a-fA-F]+|^0b[01]+/, 82 /* IntegerLiteral */],
            [/^0|^[1-9][0-9]*/, 82 /* IntegerLiteral */],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 84 /* VariableName */],
            [/^\]/, action31],
            [/^\[/, action35],
            [/^-/, 143 /* Minus */],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, 83 /* Name */],
            [/^[^]/, action32]
        ],
        //ST_LOOKING_FOR_VARNAME
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
        modeStack = [0 /* Initial */];
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
                tokenType: 1 /* EndOfFile */,
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
        //first element is skipped as it is the matched string
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
        modeStack = [1 /* Scripting */];
        return 157 /* OpenTagEcho */;
    }
    function action2() {
        position += lexemeLength;
        modeStack = [1 /* Scripting */];
        return 156 /* OpenTag */;
    }
    function action3() {
        position += lexemeLength;
        modeStack = [1 /* Scripting */];
        return 156 /* OpenTag */;
    }
    function action4() {
        //read until open tag or end
        if (input.length > lexemeLength) {
            let pos = input.search(/<\?=|<\?php(?:[ \t]|(?:\r\n|\n|\r))|<\?/);
            if (pos === -1) {
                lexemeLength = input.length;
            }
            else {
                lexemeLength = pos;
            }
        }
        position += lexemeLength;
        return 81 /* Text */;
    }
    /*
    scripting yield from
    function action5() {
        position += lexemeLength;
        return TokenType.YieldFrom;
    }
    */
    function action6() {
        position += lexemeLength;
        modeStack = modeStack.slice(0);
        modeStack.push(2 /* LookingForProperty */);
        return 115 /* Arrow */;
    }
    /*
    scripting whitespace
    function action7() {
        position += lexemeLength;
        return TokenType.Whitespace;
    }
    */
    function action8() {
        position += lexemeLength;
        modeStack = modeStack.slice(0);
        modeStack.push(1 /* Scripting */);
        return 116 /* OpenBrace */;
    }
    function action9() {
        position += lexemeLength;
        if (modeStack.length > 1) {
            modeStack = modeStack.slice(0, -1);
        }
        return 119 /* CloseBrace */;
    }
    function action10() {
        //find first newline or closing tag
        let match = input.match(/(?:\r\n|\n|\r)+|\?>/);
        if (!match) {
            lexemeLength = input.length;
        }
        else if (match[0] === '?>') {
            lexemeLength = match.index;
        }
        else {
            //newline
            lexemeLength = match.index + match[0].length;
        }
        position += lexemeLength;
        return 159 /* Comment */;
    }
    function action11() {
        let isDocComment = false;
        if (lexemeLength > 2) {
            isDocComment = true;
        }
        //find comment end */
        let pos = input.indexOf('*/', lexemeLength);
        if (pos === -1) {
            //todo WARN unterminated comment
            lexemeLength = input.length;
        }
        else {
            lexemeLength = pos + 2;
        }
        position += lexemeLength;
        if (isDocComment) {
            return 160 /* DocumentComment */;
        }
        return 159 /* Comment */;
    }
    function action12() {
        modeStack = [0 /* Initial */];
        position += lexemeLength;
        return 158 /* CloseTag */;
    }
    function action13() {
        //find first unescaped '
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
                return 80 /* EncapsulatedAndWhitespace */;
            }
        }
        lexemeLength = n;
        position += lexemeLength;
        return 78 /* StringLiteral */;
    }
    function action14() {
        //consume until unescaped "
        //if ${LABEL_START}, ${, {$ found or no match return " and consume none 
        let n = lexemeLength;
        let char;
        while (n < input.length) {
            char = input[n++];
            switch (char) {
                case '"':
                    lexemeLength = n;
                    position += lexemeLength;
                    return 78 /* StringLiteral */;
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
        position += lexemeLength;
        doubleQuoteScannedLength = n - lexemeLength; //less DoubleQuote length
        modeStack = [3 /* DoubleQuotes */];
        return 97 /* DoubleQuote */;
    }
    function action15() {
        let lexeme = input.substr(0, lexemeLength);
        let match = lexeme.match(/[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/);
        hereDocLabel = match[0];
        let c = lexeme[match.index - 1];
        if (c === '\'') {
            modeStack = [4 /* NowDoc */];
        }
        else {
            modeStack = [5 /* HereDoc */];
        }
        //check for end on next line
        if (input.substr(lexemeLength, hereDocLabel.length + 3)
            .search(new RegExp('^' + hereDocLabel + ';?(?:\r\n|\n|\r)')) >= 0) {
            modeStack = [6 /* EndHereDoc */];
        }
        position += lexemeLength;
        return 154 /* StartHeredoc */;
    }
    function action16() {
        position += lexemeLength;
        modeStack = [7 /* Backtick */];
        return 95 /* Backtick */;
    }
    /*
    function action17() {
        //Unexpected character
        position += lexemeLength;
        return TokenType.Unknown;
    }
    */
    function action18() {
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return 83 /* Name */;
    }
    function action19() {
        lexemeLength = 0;
        modeStack = modeStack.slice(0, -1);
        return -1;
    }
    function action20() {
        modeStack = modeStack.slice(0);
        modeStack.push(9 /* LookingForVarName */);
        position += lexemeLength;
        return 131 /* DollarCurlyOpen */;
    }
    function action21() {
        lexemeLength -= 3;
        modeStack = modeStack.slice(0);
        modeStack.push(2 /* LookingForProperty */);
        position += lexemeLength;
        return 84 /* VariableName */;
    }
    function action22() {
        --lexemeLength;
        modeStack = modeStack.slice(0);
        modeStack.push(8 /* VarOffset */);
        position += lexemeLength;
        return 84 /* VariableName */;
    }
    function action23() {
        lexemeLength = 1;
        modeStack = modeStack.slice(0);
        modeStack.push(1 /* Scripting */);
        position += lexemeLength;
        return 128 /* CurlyOpen */;
    }
    function action24() {
        modeStack = [1 /* Scripting */];
        position += lexemeLength;
        return 97 /* DoubleQuote */;
    }
    function action25() {
        if (doubleQuoteScannedLength) {
            //already know match index below
            //subtract 1 for the character already shifted
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
                    /* fall through */
                    default:
                        continue;
                }
                --n;
                break;
            }
            lexemeLength = n;
        }
        position += lexemeLength;
        return 80 /* EncapsulatedAndWhitespace */;
    }
    function action26() {
        //search for label
        let match = input.match(new RegExp('(?:\r\n|\n|\r)' + hereDocLabel + ';?(?:\r\n|\n|\r)'));
        let nNewlineChars;
        if (!match) {
            lexemeLength = input.length;
        }
        else {
            nNewlineChars = match[0].substr(0, 2) === '\r\n' ? 2 : 1;
            lexemeLength = match.index + nNewlineChars;
            modeStack = [6 /* EndHereDoc */];
        }
        position += lexemeLength;
        return 80 /* EncapsulatedAndWhitespace */;
    }
    function action27() {
        let n = lexemeLength;
        let char;
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
                            modeStack = [6 /* EndHereDoc */];
                            lexemeLength = n;
                            position += lexemeLength;
                            return 80 /* EncapsulatedAndWhitespace */;
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
        lexemeLength = n;
        position += lexemeLength;
        return 80 /* EncapsulatedAndWhitespace */;
    }
    function action28() {
        lexemeLength = hereDocLabel.length;
        hereDocLabel = null;
        modeStack = [1 /* Scripting */];
        position += lexemeLength;
        return 27 /* EndHeredoc */;
    }
    function action29() {
        modeStack = [1 /* Scripting */];
        position += lexemeLength;
        return 95 /* Backtick */;
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
                /* fall through */
                default:
                    continue;
            }
            --n;
            break;
        }
        lexemeLength = n;
        position += lexemeLength;
        return 80 /* EncapsulatedAndWhitespace */;
    }
    function action31() {
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return 120 /* CloseBracket */;
    }
    function action32() {
        //unexpected char
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return 0 /* Unknown */;
    }
    function action33() {
        --lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1 /* Scripting */);
        position += lexemeLength;
        return 84 /* VariableName */;
    }
    function action34() {
        lexemeLength = 0;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(1 /* Scripting */);
        return -1;
    }
    function action35() {
        position += lexemeLength;
        return charTokenType(input[0]);
    }
    function charTokenType(c) {
        switch (c) {
            case '.':
                return 126 /* Dot */;
            case '\\':
                return 147 /* Backslash */;
            case '/':
                return 91 /* ForwardSlash */;
            case '!':
                return 89 /* Exclamation */;
            case ';':
                return 88 /* Semicolon */;
            case ':':
                return 87 /* Colon */;
            case '~':
                return 86 /* Tilde */;
            case '^':
                return 125 /* Caret */;
            case '|':
                return 123 /* Bar */;
            case '&':
                return 103 /* Ampersand */;
            case '<':
                return 99 /* LessThan */;
            case '>':
                return 100 /* GreaterThan */;
            case '=':
                return 85 /* Equals */;
            case '*':
                return 101 /* Asterisk */;
            case '-':
                return 143 /* Minus */;
            case '+':
                return 111 /* Plus */;
            case '%':
                return 92 /* Percent */;
            case '$':
                return 90 /* Dollar */;
            case ',':
                return 93 /* Comma */;
            case '@':
                return 94 /* AtSymbol */;
            case '?':
                return 96 /* Question */;
            case '[':
                return 117 /* OpenBracket */;
            case ']':
                return 120 /* CloseBracket */;
            case '{':
                return 116 /* OpenBrace */;
            case '}':
                return 119 /* CloseBrace */;
            case '(':
                return 118 /* OpenParenthesis */;
            case ')':
                return 121 /* CloseParenthesis */;
            case '\'':
                return 98 /* SingleQuote */;
            case '"':
                return 97 /* DoubleQuote */;
            case '`':
                return 95 /* Backtick */;
            default:
                return 0 /* Unknown */;
        }
    }
})(Lexer = exports.Lexer || (exports.Lexer = {}));
