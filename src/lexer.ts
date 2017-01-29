/* Copyright (c) Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

export const enum TokenType {
    //Misc
    Unknown,
    EndOfFile,

    //Keywords
    Abstract,
    Array,
    ArrayCast,
    As,
    Break,
    Callable,
    Case,
    Catch,
    Class,
    ClassConstant,
    Clone,
    Const,
    Continue,
    Declare,
    Default,
    Do,
    Echo,
    Else,
    ElseIf,
    Empty,
    EndDeclare,
    EndFor,
    EndForeach,
    EndIf,
    EndSwitch,
    EndWhile,
    EndHeredoc,
    Eval,
    Exit,
    Extends,
    Final,
    Finally,
    For,
    ForEach,
    Function,
    Global,
    Goto,
    HaltCompiler,
    If,
    Implements,
    Include,
    IncludeOnce,
    InstanceOf,
    InsteadOf,
    Interface,
    Isset,
    List,
    And,
    Or,
    Xor,
    Namespace,
    New,
    Print,
    Private,
    Public,
    Protected,
    Require,
    RequireOnce,
    Return,
    Static,
    Switch,
    Throw,
    Trait,
    Try,
    Unset,
    Use,
    Var,
    While,
    Yield,
    YieldFrom,

    //keyword magic constants
    DirectoryConstant,
    FileConstant,
    LineConstant,
    FunctionConstant,
    MethodConstant,
    NamespaceConstant,
    TraitConstant,

    //literals
    StringLiteral,
    FloatingLiteral,
    EncapsulatedAndWhitespace,
    Text,
    IntegerLiteral,

    //Names
    Name,
    VariableName,

    //Operators and Punctuation
    Equals,
    Tilde,
    Colon,
    Semicolon,
    Exclamation,
    Dollar,
    ForwardSlash,
    Percent,
    Comma,
    AtSymbol,
    Backtick,
    Question,
    DoubleQuote,
    SingleQuote,
    LessThan,
    GreaterThan,
    Asterisk,
    AmpersandAmpersand,
    Ampersand,
    AmpersandEquals,
    CaretEquals,
    LessThanLessThan,
    LessThanLessThanEquals,
    GreaterThanGreaterThan,
    GreaterThanGreaterThanEquals,
    BarEquals,
    Plus,
    PlusEquals,
    AsteriskAsterisk,
    AsteriskAsteriskEquals,
    Arrow,
    OpenBrace,
    OpenBracket,
    OpenParenthesis,
    CloseBrace,
    CloseBracket,
    CloseParenthesis,
    QuestionQuestion,
    Bar,
    BarBar,
    Caret,
    Dot,
    DotEquals,
    CurlyOpen,
    MinusMinus,
    ForwardslashEquals,
    DollarCurlyOpen,
    FatArrow,
    ColonColon,
    Ellipsis,
    PlusPlus,
    EqualsEquals,
    GreaterThanEquals,
    EqualsEqualsEquals,
    ExclamationEquals,
    ExclamationEqualsEquals,
    LessThanEquals,
    Spaceship,
    Minus,
    MinusEquals,
    PercentEquals,
    AsteriskEquals,
    Backslash,
    BooleanCast,
    UnsetCast,
    StringCast,
    ObjectCast,
    IntegerCast,
    FloatCast,
    OpenTag,
    OpenTagEcho,
    StartHeredoc,
    CloseTag,

    //Comments and whitespace
    Comment,
    DocumentComment,
    Whitespace
}

export const enum LexerMode {
    Initial,
    Scripting,
    LookingForProperty,
    DoubleQuotes,
    NowDoc,
    HereDoc,
    EndHereDoc,
    Backtick,
    VarOffset,
    LookingForVarName
}

export interface Token {
    tokenType: TokenType,
    line: number,
    character: number,
    text: string,
    modeStack: LexerMode[],
}

export namespace Lexer {

    var input: string;
    var lexeme: string;
    var modeStack: LexerMode[];
    var line: number;
    var character: number;
    var lastLexemeEndedWithNewline: boolean;
    var hereDocLabel: string;
    var doubleQuoteScannedLength: number;

    const table: [RegExp, (TokenType | LexerAction)][][] = [
        //INITIAL
        [
            [/^<\?=/, action1],
            [/^<\?php(?:[ \t]|(?:\r\n|\n|\r))/, action2],
            [/^<\?/, action3],
            [/^[^]/, action4]
        ],
        //IN_SCRIPTING
        [
            [/^exit(?=\b)/, TokenType.Exit],
            [/^die(?=\b)/, TokenType.Exit],
            [/^function(?=\b)/, TokenType.Function],
            [/^const(?=\b)/, TokenType.Const],
            [/^return(?=\b)/, TokenType.Return],
            [/^yield[ \n\r\t]+from/, action5],
            [/^yield(?=\b)/, TokenType.Yield],
            [/^try(?=\b)/, TokenType.Try],
            [/^catch(?=\b)/, TokenType.Catch],
            [/^finally(?=\b)/, TokenType.Finally],
            [/^throw(?=\b)/, TokenType.Throw],
            [/^if(?=\b)/, TokenType.If],
            [/^elseif(?=\b)/, TokenType.ElseIf],
            [/^endif(?=\b)/, TokenType.EndIf],
            [/^else(?=\b)/, TokenType.Else],
            [/^while(?=\b)/, TokenType.While],
            [/^endwhile(?=\b)/, TokenType.EndWhile],
            [/^do(?=\b)/, TokenType.Do],
            [/^for(?=\b)/, TokenType.For],
            [/^endfor(?=\b)/, TokenType.EndFor],
            [/^foreach(?=\b)/, TokenType.ForEach],
            [/^endforeach(?=\b)/, TokenType.EndForeach],
            [/^declare(?=\b)/, TokenType.Declare],
            [/^enddeclare(?=\b)/, TokenType.EndDeclare],
            [/^instanceof(?=\b)/, TokenType.InstanceOf],
            [/^as(?=\b)/, TokenType.As],
            [/^switch(?=\b)/, TokenType.Switch],
            [/^endswitch(?=\b)/, TokenType.EndSwitch],
            [/^case(?=\b)/, TokenType.Case],
            [/^default(?=\b)/, TokenType.Default],
            [/^break(?=\b)/, TokenType.Break],
            [/^continue(?=\b)/, TokenType.Continue],
            [/^goto(?=\b)/, TokenType.Goto],
            [/^echo(?=\b)/, TokenType.Echo],
            [/^print(?=\b)/, TokenType.Print],
            [/^class(?=\b)/, TokenType.Class],
            [/^interface(?=\b)/, TokenType.Interface],
            [/^trait(?=\b)/, TokenType.Trait],
            [/^extends(?=\b)/, TokenType.Extends],
            [/^implements(?=\b)/, TokenType.Implements],
            [/^->/, action6],
            [/^[ \n\r\t]+/, action7],
            [/^::/, TokenType.ColonColon],
            [/^\\/, TokenType.Backslash],
            [/^\.\.\./, TokenType.Ellipsis],
            [/^\?\?/, TokenType.QuestionQuestion],
            [/^new(?=\b)/, TokenType.New],
            [/^clone(?=\b)/, TokenType.Clone],
            [/^var(?=\b)/, TokenType.Var],
            [/^\([ \t]*(?:int|integer)[ \t]*\)/, TokenType.IntegerCast],
            [/^\([ \t]*(?:real|double|float)[ \t]*\)/, TokenType.FloatCast],
            [/^\([ \t]*(?:string|binary)[ \t]*\)/, TokenType.StringCast],
            [/^\([ \t]*array[ \t]*\)/, TokenType.ArrayCast],
            [/^\([ \t]*object[ \t]*\)/, TokenType.ObjectCast],
            [/^\([ \t]*(?:boolean|bool)[ \t]*\)/, TokenType.BooleanCast],
            [/^\([ \t]*unset[ \t]*\)/, TokenType.UnsetCast],
            [/^eval(?=\b)/, TokenType.Eval],
            [/^include_once(?=\b)/, TokenType.IncludeOnce],
            [/^include(?=\b)/, TokenType.Include],
            [/^require_once(?=\b)/, TokenType.RequireOnce],
            [/^require(?=\b)/, TokenType.Require],
            [/^namespace(?=\b)/, TokenType.Namespace],
            [/^use(?=\b)/, TokenType.Use],
            [/^insteadof(?=\b)/, TokenType.InsteadOf],
            [/^global(?=\b)/, TokenType.Global],
            [/^isset(?=\b)/, TokenType.Isset],
            [/^empty(?=\b)/, TokenType.Empty],
            [/^__halt_compiler/, TokenType.HaltCompiler],
            [/^static(?=\b)/, TokenType.Static],
            [/^abstract(?=\b)/, TokenType.Abstract],
            [/^final(?=\b)/, TokenType.Final],
            [/^private(?=\b)/, TokenType.Private],
            [/^protected(?=\b)/, TokenType.Protected],
            [/^public(?=\b)/, TokenType.Public],
            [/^unset(?=\b)/, TokenType.Unset],
            [/^=>/, TokenType.FatArrow],
            [/^list(?=\b)/, TokenType.List],
            [/^array(?=\b)/, TokenType.Array],
            [/^callable(?=\b)/, TokenType.Callable],
            [/^--/, TokenType.MinusMinus],
            [/^\+\+/, TokenType.PlusPlus],
            [/^===/, TokenType.EqualsEqualsEquals],
            [/^!==/, TokenType.ExclamationEqualsEquals],
            [/^==/, TokenType.EqualsEquals],
            [/^!=|^<>/, TokenType.ExclamationEquals],
            [/^<=>/, TokenType.Spaceship],
            [/^<=/, TokenType.LessThanEquals],
            [/^>=/, TokenType.GreaterThanEquals],
            [/^\+=/, TokenType.PlusEquals],
            [/^-=/, TokenType.MinusEquals],
            [/^\*=/, TokenType.AsteriskEquals],
            [/^\*\*/, TokenType.AsteriskAsterisk],
            [/^\*\*=/, TokenType.AsteriskAsteriskEquals],
            [/^\/=/, TokenType.ForwardslashEquals],
            [/^\.=/, TokenType.DotEquals],
            [/^%=/, TokenType.PercentEquals],
            [/^<<=/, TokenType.LessThanLessThanEquals],
            [/^>>=/, TokenType.GreaterThanGreaterThanEquals],
            [/^&=/, TokenType.AmpersandEquals],
            [/^\|=/, TokenType.BarEquals],
            [/^\^=/, TokenType.CaretEquals],
            [/^\|\|/, TokenType.BarBar],
            [/^&&/, TokenType.AmpersandAmpersand],
            [/^(?:OR|or)(?=\b)/, TokenType.Or],
            [/^(?:AND|and)(?=\b)/, TokenType.And],
            [/^(?:XOR|xor)(?=\b)/, TokenType.Xor],
            [/^\\?<<<[ \t]*(?:[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*|'[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*'|"[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*")(?:\r\n|\n|\r)/, action15],
            [/^<</, TokenType.LessThanLessThan],
            [/^>>/, TokenType.GreaterThanGreaterThan],
            [/^\{/, action8],
            [/^\}/, action9],
            [/^0b[01]+/, TokenType.IntegerLiteral],
            [/^0x[0-9a-fA-F]+/, TokenType.IntegerLiteral],
            [/^(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*)|^(?:[0-9]+|(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*))[eE][+-]?[0-9]+/, TokenType.FloatingLiteral],
            [/^[0-9]+/, TokenType.IntegerLiteral],
            [/^__CLASS__/, TokenType.ClassConstant],
            [/^__TRAIT__/, TokenType.TraitConstant],
            [/^__FUNCTION__/, TokenType.FunctionConstant],
            [/^__METHOD__/, TokenType.MethodConstant],
            [/^__LINE__/, TokenType.LineConstant],
            [/^__FILE__/, TokenType.FileConstant],
            [/^__DIR__/, TokenType.DirectoryConstant],
            [/^__NAMESPACE__/, TokenType.NamespaceConstant],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.VariableName],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.Name],
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
            [/^->/, TokenType.Arrow],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, action18],
            [/^[^]/, action19]
        ],
        //DOUBLE_QUOTES
        [
            [/^\$\{/, action20],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*->[a-zA-Z_\x7f-\xff]/, action21],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*\[/, action22],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.VariableName],
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
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.VariableName],
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
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.VariableName],
            [/^\{\$/, action23],
            [/^`/, action29],
            [/^[^]/, action30]
        ],
        //VAR_OFFSET
        [
            [/^[0-9]+|^0x[0-9a-fA-F]+|^0b[01]+/, TokenType.IntegerLiteral],
            [/^0|^[1-9][0-9]*/, TokenType.IntegerLiteral],
            [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.VariableName],
            [/^\]/, action31],
            [/^\[/, action35],
            [/^-/, TokenType.Minus],
            [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.Name],
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
        modeStack = [LexerMode.Initial];
        character = -1;
        line = 0;
        lastLexemeEndedWithNewline = false;
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
                character = -1;
                ++line;
                lastLexemeEndedWithNewline = false;
            }
            character += lexeme.length;
            return;
        }

        let n = 0;
        let c: string;

        while (n < lexeme.length) {
            if (lastLexemeEndedWithNewline) {
                character = -1;
                ++line;
                lastLexemeEndedWithNewline = false;
            }
            ++character;
            c = lexeme[n++];
            if (c === '\n' || c === '\r') {
                lastLexemeEndedWithNewline = true;
                if (c === '\r' && n < lexeme.length && lexeme[n] === '\n') {
                    ++n;
                    ++character;
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

    export function setInput(text: string, lexerModeStack?: LexerMode[]) {
        clear();
        input = text;
        if (lexerModeStack) {
            modeStack = lexerModeStack;
        }
    }

    export function lex(): Token {

        if (!input.length) {
            return {
                tokenType: TokenType.EndOfFile,
                text: null,
                modeStack: modeStack,
                line: line,
                character: character
            };
        }

        let match: RegExpMatchArray;
        let actionIndex = -1;
        let action: TokenType | LexerAction;
        let lexerMode: LexerMode;
        lexeme = '';

        let token: Token = {
            tokenType: 0,
            text: null,
            modeStack: modeStack,
            line: line,
            character: character + 1
        };

        if (lastLexemeEndedWithNewline) {
            ++token.line;
            token.character = 0;
        }

        lexerMode = modeStack[modeStack.length - 1];
        match = input.match(patterns[lexerMode]);

        //first element is skipped as it is the matched string
        let n = 0;
        while(++n < match.length){
            if (match[n]) {
                actionIndex = n - 1;
                break;
            }
        }

        if(actionIndex < 0){
            throw new Error('Failed to find action index');
        }

        more(match[0].length);
        action = table[lexerMode][actionIndex][1];

        if (typeof action === 'function') {
            token.tokenType = action();
            if (token.tokenType === -1) {
                return lex();
            }
        } else {
            token.tokenType = action;
            advancePosition(false);
        }

        token.text = lexeme;
        return token;

    }

    function isLabelStart(char: string) {
        let cp = char.charCodeAt(0);
        return (cp >= 97 && cp <= 122) || (cp >= 65 && cp <= 90) || cp === 95 || cp >= 0x7F;
    }

    interface LexerAction {
        (): TokenType;
    }

    function action1() {
        advancePosition(false);
        modeStack = [LexerMode.Scripting];
        return TokenType.OpenTagEcho;
    }

    function action2() {
        advancePosition(true);
        modeStack = [LexerMode.Scripting];
        return TokenType.OpenTag;
    }

    function action3() {
        advancePosition(false);
        modeStack = [LexerMode.Scripting];
        return TokenType.OpenTag;
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
        return TokenType.Text;
    }

    function action5() {
        advancePosition(true);
        return TokenType.YieldFrom;
    }

    function action6() {
        advancePosition(false);
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.LookingForProperty);
        return TokenType.Arrow;
    }

    function action7() {
        advancePosition(true);
        return TokenType.Whitespace;
    }

    function action8() {
        advancePosition(false);
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.Scripting);
        return TokenType.OpenBrace;
    }

    function action9() {
        advancePosition(false);
        if (modeStack.length > 1) {
            modeStack = modeStack.slice(0, -1);
        }
        return TokenType.CloseBrace;
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
        return TokenType.Comment;
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
            return TokenType.DocumentComment;
        }

        return TokenType.Comment;

    }

    function action12() {
        modeStack = [LexerMode.Initial];
        advancePosition(true);
        return TokenType.CloseTag;
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
                return TokenType.EncapsulatedAndWhitespace;
            }
        }

        more(n);
        advancePosition(true);
        return TokenType.StringLiteral;
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
                    return TokenType.StringLiteral;
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
        modeStack = [LexerMode.DoubleQuotes];
        return TokenType.DoubleQuote;

    }

    function action15() {

        let match = lexeme.match(/[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/);
        hereDocLabel = match[0];
        let c = lexeme[match.index - 1];

        if (c === '\'') {
            modeStack = [LexerMode.NowDoc];
        } else {
            modeStack = [LexerMode.HereDoc];
        }

        //check for end on next line
        if (input.search(new RegExp('^' + hereDocLabel + ';?(?:\r\n|\n|\r)')) !== -1) {
            modeStack = [LexerMode.EndHereDoc];
        }

        advancePosition(true);
        return TokenType.StartHeredoc;
    }

    function action16() {
        advancePosition(false);
        modeStack = [LexerMode.Backtick];
        return TokenType.Backtick;
    }

    function action17() {
        //Unexpected character
        advancePosition(false);
        return TokenType.Unknown;
    }

    function action18() {
        modeStack = modeStack.slice(0, -1);
        advancePosition(false);
        return TokenType.Name;
    }

    function action19() {
        less();
        modeStack = modeStack.slice(0, -1);
        return -1;
    }

    function action20() {
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.LookingForVarName);
        advancePosition(false);
        return TokenType.DollarCurlyOpen;
    }

    function action21() {
        less(lexeme.length - 3);
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.LookingForProperty);
        advancePosition(false);
        return TokenType.VariableName;
    }

    function action22() {
        less(lexeme.length - 1);
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.VarOffset);
        advancePosition(false);
        return TokenType.VariableName;
    }

    function action23() {
        less(1);
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.Scripting);
        advancePosition(false);
        return TokenType.CurlyOpen;
    }


    function action24() {
        modeStack = [LexerMode.Scripting];
        advancePosition(false);
        return TokenType.DoubleQuote;
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
        return TokenType.EncapsulatedAndWhitespace;

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
            modeStack = [LexerMode.EndHereDoc];
        }

        advancePosition(true);
        return TokenType.EncapsulatedAndWhitespace;

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
                            modeStack = [LexerMode.EndHereDoc];
                            more(n);
                            advancePosition(true);
                            return TokenType.EncapsulatedAndWhitespace;
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
        return TokenType.EncapsulatedAndWhitespace;

    }

    function action28() {
        more(hereDocLabel.length - 1);
        hereDocLabel = null;
        modeStack = [LexerMode.Scripting];
        advancePosition(false);
        return TokenType.EndHeredoc;
    }

    function action29() {
        modeStack = [LexerMode.Scripting];
        advancePosition(false);
        return TokenType.Backtick;
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
        return TokenType.EncapsulatedAndWhitespace;
    }

    function action31() {
        modeStack = modeStack.slice(0, -1);
        advancePosition(false);
        return TokenType.CloseBracket;
    }

    function action32() {
        //unexpected char
        if (lexeme === '\r' && input && input[0] === '\n') {
            more(1);
        }
        modeStack = modeStack.slice(0, -1);
        advancePosition(true);
        return TokenType.Unknown;
    }

    function action33() {
        less(lexeme.length - 1);
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        advancePosition(false);
        return TokenType.VariableName;
    }

    function action34() {
        less();
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        return -1;
    }

    function action35() {
        advancePosition(false);
        return charTokenType(lexeme);
    }

    function charTokenType(c: string) {

        switch (c) {
            case '\\':
                return TokenType.Backslash;
            case '/':
                return TokenType.ForwardSlash;
            case '!':
                return TokenType.Exclamation;
            case ';':
                return TokenType.Semicolon;
            case ':':
                return TokenType.Colon;
            case '~':
                return TokenType.Tilde;
            case '^':
                return TokenType.Caret;
            case '|':
                return TokenType.Bar;
            case '&':
                return TokenType.Ampersand;
            case '<':
                return TokenType.LessThan;
            case '>':
                return TokenType.GreaterThan;
            case '=':
                return TokenType.Equals;
            case '*':
                return TokenType.Asterisk;
            case '-':
                return TokenType.Minus;
            case '+':
                return TokenType.Plus;
            case '%':
                return TokenType.Percent;
            case '$':
                return TokenType.Dollar;
            case ',':
                return TokenType.Comma;
            case '@':
                return TokenType.AtSymbol;
            case '?':
                return TokenType.Question;
            case '[':
                return TokenType.OpenBracket;
            case ']':
                return TokenType.CloseBracket;
            case '{':
                return TokenType.OpenBrace;
            case '}':
                return TokenType.CloseBrace;
            case '(':
                return TokenType.OpenParenthesis;
            case ')':
                return TokenType.CloseParenthesis;
            case '\'':
                return TokenType.SingleQuote;
            case '"':
                return TokenType.DoubleQuote;
            case '`':
                return TokenType.Backtick;
            default:
                return TokenType.Unknown;
        }


    }

}