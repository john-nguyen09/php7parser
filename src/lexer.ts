/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */

'use strict';

export const enum TokenType {
    //Misc
    Unknown,
    EndOfFile,

    //Keywords
    Abstract,
    Array,
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
    StartHeredoc,
    ArrayCast,
    OpenTag,
    OpenTagEcho,
    CloseTag,

    //Comments, whitespace
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
    /**
     * Token type
     */
    tokenType: TokenType,
    /**
     * Offset within source were first char of token is found
     */
    offset: number,
    /**
     * Length of token string
     */
    length: number
    /**
     * Lexer mode prior to this token being read.
     */
    modeStack: LexerMode[],
}

export namespace Lexer {

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
            [/^yield[ \n\r\t]+from/, TokenType.YieldFrom],
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
            [/^[ \n\r\t]+/, TokenType.Whitespace],
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
            [/^(?:[0-9]+|(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*))[eE][+-]?[0-9]+|^(?:[0-9]*\.[0-9]+|[0-9]+\.[0-9]*)/, TokenType.FloatingLiteral],
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
            [/^[^]/, TokenType.Unknown],
        ],
        //LOOKING_FOR_PROPERTY
        [
            [/^[ \n\r\t]+/, TokenType.Whitespace],
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

    var input: string;
    var lexemeLength: number;
    var modeStack: LexerMode[];
    var position: number;
    var hereDocLabel: string;
    var doubleQuoteScannedLength: number;
    var match: RegExpMatchArray;
    var matchLength: number;
    var actionIndex: number;
    var action: TokenType | LexerAction;
    var lexerMode: LexerMode;

    function clear() {
        input = null;
        hereDocLabel = null;
        doubleQuoteScannedLength = null;
        lexemeLength = 0;
        modeStack = [LexerMode.Initial];
        position = -1;
    }

    function concatRegExpArray(regExpArray: RegExp[]): RegExp {
        let src = regExpArray.map((v, i, a) => {
            return '(' + v.source + ')';
        }).join('|');
        return new RegExp(src, 'i');
    }

    var patterns: RegExp[] = [];
    for (let n = 0; n < table.length; ++n) {
        patterns.push(concatRegExpArray(table[n].map((v, i, a) => { return v[0]; })));
    }

    export function setInput(text: string, lexerModeStack?: LexerMode[], lastPosition?: number) {
        clear();
        input = text;
        if (lexerModeStack) {
            modeStack = lexerModeStack;
        }
        if (lastPosition) {
            position = lastPosition;
        }
    }

    export function lex(): Token {

        if (!input.length) {
            return {
                tokenType: TokenType.EndOfFile,
                offset: position,
                length: 0,
                modeStack: modeStack
            };
        }

        actionIndex = -1;
        lexemeLength = 0;

        let token: Token = {
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
        } else {
            token.tokenType = action;
            position += lexemeLength;
        }

        input = input.slice(lexemeLength);
        token.length = lexemeLength;
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
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        return TokenType.OpenTagEcho;
    }

    function action2() {
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        return TokenType.OpenTag;
    }

    function action3() {
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        return TokenType.OpenTag;
    }

    const openTagRegex = /<\?=|<\?php(?:[ \t]|(?:\r\n|\n|\r))|<\?/;
    function action4() {
        if (input.length > lexemeLength) {
            //read until open tag or end
            let pos = input.search(openTagRegex);
            if (pos === -1) {
                lexemeLength = input.length;
            } else {
                lexemeLength = pos;
            }
        }

        position += lexemeLength;
        return TokenType.Text;
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
        modeStack.push(LexerMode.LookingForProperty);
        return TokenType.Arrow;
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
        modeStack.push(LexerMode.Scripting);
        return TokenType.OpenBrace;
    }

    function action9() {
        position += lexemeLength;
        if (modeStack.length > 1) {
            modeStack = modeStack.slice(0, -1);
        }
        return TokenType.CloseBrace;
    }

    const newLineOrCloseTagRegex = /(?:\r\n|\n|\r)+|\?>/;
    function action10() {

        //find first newline or closing tag
        let match: RegExpMatchArray = input.match(newLineOrCloseTagRegex);

        if (!match) {
            lexemeLength = input.length;
        } else if (match[0] === '?>') {
            lexemeLength = match.index;
        } else {
            //newline
            lexemeLength = match.index + match[0].length;
        }

        position += lexemeLength;
        return TokenType.Comment;
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
        } else {
            lexemeLength = pos + 2;
        }

        position += lexemeLength;

        if (isDocComment) {
            return TokenType.DocumentComment;
        }

        return TokenType.Comment;

    }

    function action12() {
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Initial);
        position += lexemeLength;
        return TokenType.CloseTag;
    }

    function action13() {

        //find first unescaped '
        let n = lexemeLength;
        while (true) {
            if (n < input.length) {
                if (input[n] === '\'') {
                    ++n;
                    break;
                } else if (input[n++] === '\\' && n < input.length) {
                    ++n;
                }
            } else {
                position += lexemeLength;
                return TokenType.EncapsulatedAndWhitespace;
            }
        }

        lexemeLength = n;
        position += lexemeLength;
        return TokenType.StringLiteral;
    }

    function action14() {

        //consume until unescaped "
        //if ${LABEL_START}, ${, {$ found or no match return " and consume none 
        let n = lexemeLength;
        let char: string;

        while (n < input.length) {
            char = input[n++];
            switch (char) {
                case '"':
                    lexemeLength = n;
                    position += lexemeLength;
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

        position += lexemeLength;
        doubleQuoteScannedLength = n - lexemeLength; //less DoubleQuote length
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.DoubleQuotes);
        return TokenType.DoubleQuote;

    }

    const labelRegex = /[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/;
    function action15() {

        let lexeme = input.substr(0, lexemeLength);
        let match = lexeme.match(labelRegex);
        hereDocLabel = match[0];
        let c = lexeme[match.index - 1];

        if (c === '\'') {
            modeStack.slice(0, -1);
            modeStack.push(LexerMode.NowDoc);
        } else {
            modeStack.slice(0,-1);
            modeStack.push(LexerMode.HereDoc);
        }

        //check for end on next line
        if (input.substr(lexemeLength, hereDocLabel.length + 3)
            .search(new RegExp('^' + hereDocLabel + ';?(?:\r\n|\n|\r)')) >= 0) {
            modeStack = modeStack.slice(0, -1);
            modeStack.push(LexerMode.EndHereDoc);
        }

        position += lexemeLength;
        return TokenType.StartHeredoc;
    }

    function action16() {
        position += lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Backtick);
        return TokenType.Backtick;
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
        return TokenType.Name;
    }

    function action19() {
        lexemeLength = 0;
        modeStack = modeStack.slice(0, -1);
        return -1;
    }

    function action20() {
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.LookingForVarName);
        position += lexemeLength;
        return TokenType.DollarCurlyOpen;
    }

    function action21() {
        lexemeLength -= 3;
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.LookingForProperty);
        position += lexemeLength;
        return TokenType.VariableName;
    }

    function action22() {
        --lexemeLength;
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.VarOffset);
        position += lexemeLength;
        return TokenType.VariableName;
    }

    function action23() {
        lexemeLength = 1;
        modeStack = modeStack.slice(0);
        modeStack.push(LexerMode.Scripting);
        position += lexemeLength;
        return TokenType.CurlyOpen;
    }


    function action24() {
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        position += lexemeLength;
        return TokenType.DoubleQuote;
    }

    function action25() {

        if (doubleQuoteScannedLength) {
            //already know match index below
            //subtract 1 for the character already shifted
            lexemeLength = doubleQuoteScannedLength;
            doubleQuoteScannedLength = 0;
        } else {
            let n = lexemeLength;
            if (input[0] === '\\' && n < input.length) {
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

            lexemeLength = n;
        }

        position += lexemeLength;
        return TokenType.EncapsulatedAndWhitespace;

    }

    function action26() {

        //search for label
        let match = input.match(new RegExp('(?:\r\n|\n|\r)' + hereDocLabel + ';?(?:\r\n|\n|\r)'));
        let nNewlineChars: number;

        if (!match) {
            lexemeLength = input.length;
        } else {
            nNewlineChars = match[0].substr(0, 2) === '\r\n' ? 2 : 1;
            lexemeLength = match.index + nNewlineChars;
            modeStack = modeStack.slice(0, -1);
            modeStack.push(LexerMode.EndHereDoc);
        }

        position += lexemeLength;
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
                            modeStack = modeStack.slice(0, -1);
                            modeStack.push(LexerMode.EndHereDoc);
                            lexemeLength = n;
                            position += lexemeLength;
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

        lexemeLength = n;
        position += lexemeLength;
        return TokenType.EncapsulatedAndWhitespace;

    }

    function action28() {
        lexemeLength = hereDocLabel.length;
        hereDocLabel = null;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        position += lexemeLength;
        return TokenType.EndHeredoc;
    }

    function action29() {
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        position += lexemeLength;
        return TokenType.Backtick;
    }

    function action30() {

        let n = lexemeLength;
        let char: string;

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
        return TokenType.EncapsulatedAndWhitespace;
    }

    function action31() {
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return TokenType.CloseBracket;
    }

    function action32() {
        //unexpected char
        modeStack = modeStack.slice(0, -1);
        position += lexemeLength;
        return TokenType.Unknown;
    }

    function action33() {
        --lexemeLength;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        position += lexemeLength;
        return TokenType.VariableName;
    }

    function action34() {
        lexemeLength = 0;
        modeStack = modeStack.slice(0, -1);
        modeStack.push(LexerMode.Scripting);
        return -1;
    }

    function action35() {
        position += lexemeLength;
        return charTokenType(input[0]);
    }

    function charTokenType(c: string) {

        switch (c) {
            case '.':
                return TokenType.Dot;
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

export function tokenTypeToString(type: TokenType) {
    switch (type) {
        case TokenType.Unknown:
            return 'Unknown';
        case TokenType.EndOfFile:
            return 'EndOfFile';
        case TokenType.Abstract:
            return 'Abstract';
        case TokenType.Array:
            return 'Array';
        case TokenType.As:
            return 'As';
        case TokenType.Break:
            return 'Break';
        case TokenType.Callable:
            return 'Callable';
        case TokenType.Case:
            return 'Case';
        case TokenType.Catch:
            return 'Catch';
        case TokenType.Class:
            return 'Class';
        case TokenType.ClassConstant:
            return 'ClassConstant';
        case TokenType.Clone:
            return 'Clone';
        case TokenType.Const:
            return 'Const';
        case TokenType.Continue:
            return 'Continue';
        case TokenType.Declare:
            return 'Declare';
        case TokenType.Default:
            return 'Default';
        case TokenType.Do:
            return 'Do';
        case TokenType.Echo:
            return 'Echo';
        case TokenType.Else:
            return 'Else';
        case TokenType.ElseIf:
            return 'ElseIf';
        case TokenType.Empty:
            return 'Empty';
        case TokenType.EndDeclare:
            return 'EndDeclare';
        case TokenType.EndFor:
            return 'EndFor';
        case TokenType.EndForeach:
            return 'EndForeach';
        case TokenType.EndIf:
            return 'EndIf';
        case TokenType.EndSwitch:
            return 'EndSwitch';
        case TokenType.EndWhile:
            return 'EndWhile';
        case TokenType.EndHeredoc:
            return 'EndHeredoc';
        case TokenType.Eval:
            return 'Eval';
        case TokenType.Exit:
            return 'Exit';
        case TokenType.Extends:
            return 'Extends';
        case TokenType.Final:
            return 'Final';
        case TokenType.Finally:
            return 'Finally';
        case TokenType.For:
            return 'For';
        case TokenType.ForEach:
            return 'ForEach';
        case TokenType.Function:
            return 'Function';
        case TokenType.Global:
            return 'Global';
        case TokenType.Goto:
            return 'Goto';
        case TokenType.HaltCompiler:
            return 'HaltCompiler';
        case TokenType.If:
            return 'If';
        case TokenType.Implements:
            return 'Implements';
        case TokenType.Include:
            return 'Include';
        case TokenType.IncludeOnce:
            return 'IncludeOnce';
        case TokenType.InstanceOf:
            return 'InstanceOf';
        case TokenType.InsteadOf:
            return 'InsteadOf';
        case TokenType.Interface:
            return 'Interface';
        case TokenType.Isset:
            return 'Isset';
        case TokenType.List:
            return 'List';
        case TokenType.And:
            return 'And';
        case TokenType.Or:
            return 'Or';
        case TokenType.Xor:
            return 'Xor';
        case TokenType.Namespace:
            return 'Namespace';
        case TokenType.New:
            return 'New';
        case TokenType.Print:
            return 'Print';
        case TokenType.Private:
            return 'Private';
        case TokenType.Public:
            return 'Public';
        case TokenType.Protected:
            return 'Protected';
        case TokenType.Require:
            return 'Require';
        case TokenType.RequireOnce:
            return 'RequireOnce';
        case TokenType.Return:
            return 'Return';
        case TokenType.Static:
            return 'Static';
        case TokenType.Switch:
            return 'Switch';
        case TokenType.Throw:
            return 'Throw';
        case TokenType.Trait:
            return 'Trait';
        case TokenType.Try:
            return 'Try';
        case TokenType.Unset:
            return 'Unset';
        case TokenType.Use:
            return 'Use';
        case TokenType.Var:
            return 'Var';
        case TokenType.While:
            return 'While';
        case TokenType.Yield:
            return 'Yield';
        case TokenType.YieldFrom:
            return 'YieldFrom';
        case TokenType.DirectoryConstant:
            return 'DirectoryConstant';
        case TokenType.FileConstant:
            return 'FileConstant';
        case TokenType.LineConstant:
            return 'LineConstant';
        case TokenType.FunctionConstant:
            return 'FunctionConstant';
        case TokenType.MethodConstant:
            return 'MethodConstant';
        case TokenType.NamespaceConstant:
            return 'NamespaceConstant';
        case TokenType.TraitConstant:
            return 'TraitConstant';
        case TokenType.StringLiteral:
            return 'StringLiteral';
        case TokenType.FloatingLiteral:
            return 'FloatingLiteral';
        case TokenType.EncapsulatedAndWhitespace:
            return 'EncapsulatedAndWhitespace';
        case TokenType.Text:
            return 'Text';
        case TokenType.IntegerLiteral:
            return 'IntegerLiteral';
        case TokenType.Name:
            return 'Name';
        case TokenType.VariableName:
            return 'VariableName';
        case TokenType.Equals:
            return 'Equals';
        case TokenType.Tilde:
            return 'Tilde';
        case TokenType.Colon:
            return 'Colon';
        case TokenType.Semicolon:
            return 'Semicolon';
        case TokenType.Exclamation:
            return 'Exclamation';
        case TokenType.Dollar:
            return 'Dollar';
        case TokenType.ForwardSlash:
            return 'ForwardSlash';
        case TokenType.Percent:
            return 'Percent';
        case TokenType.Comma:
            return 'Comma';
        case TokenType.AtSymbol:
            return 'AtSymbol';
        case TokenType.Backtick:
            return 'Backtick';
        case TokenType.Question:
            return 'Question';
        case TokenType.DoubleQuote:
            return 'DoubleQuote';
        case TokenType.SingleQuote:
            return 'SingleQuote';
        case TokenType.LessThan:
            return 'LessThan';
        case TokenType.GreaterThan:
            return 'GreaterThan';
        case TokenType.Asterisk:
            return 'Asterisk';
        case TokenType.AmpersandAmpersand:
            return 'AmpersandAmpersand';
        case TokenType.Ampersand:
            return 'Ampersand';
        case TokenType.AmpersandEquals:
            return 'AmpersandEquals';
        case TokenType.CaretEquals:
            return 'CaretEquals';
        case TokenType.LessThanLessThan:
            return 'LessThanLessThan';
        case TokenType.LessThanLessThanEquals:
            return 'LessThanLessThanEquals';
        case TokenType.GreaterThanGreaterThan:
            return 'GreaterThanGreaterThan';
        case TokenType.GreaterThanGreaterThanEquals:
            return 'GreaterThanGreaterThanEquals';
        case TokenType.BarEquals:
            return 'BarEquals';
        case TokenType.Plus:
            return 'Plus';
        case TokenType.PlusEquals:
            return 'PlusEquals';
        case TokenType.AsteriskAsterisk:
            return 'AsteriskAsterisk';
        case TokenType.AsteriskAsteriskEquals:
            return 'AsteriskAsteriskEquals';
        case TokenType.Arrow:
            return 'Arrow';
        case TokenType.OpenBrace:
            return 'OpenBrace';
        case TokenType.OpenBracket:
            return 'OpenBracket';
        case TokenType.OpenParenthesis:
            return 'OpenParenthesis';
        case TokenType.CloseBrace:
            return 'CloseBrace';
        case TokenType.CloseBracket:
            return 'CloseBracket';
        case TokenType.CloseParenthesis:
            return 'CloseParenthesis';
        case TokenType.QuestionQuestion:
            return 'QuestionQuestion';
        case TokenType.Bar:
            return 'Bar';
        case TokenType.BarBar:
            return 'BarBar';
        case TokenType.Caret:
            return 'Caret';
        case TokenType.Dot:
            return 'Dot';
        case TokenType.DotEquals:
            return 'DotEquals';
        case TokenType.CurlyOpen:
            return 'CurlyOpen';
        case TokenType.MinusMinus:
            return 'MinusMinus';
        case TokenType.ForwardslashEquals:
            return 'ForwardslashEquals';
        case TokenType.DollarCurlyOpen:
            return 'DollarCurlyOpen';
        case TokenType.FatArrow:
            return 'FatArrow';
        case TokenType.ColonColon:
            return 'ColonColon';
        case TokenType.Ellipsis:
            return 'Ellipsis';
        case TokenType.PlusPlus:
            return 'PlusPlus';
        case TokenType.EqualsEquals:
            return 'EqualsEquals';
        case TokenType.GreaterThanEquals:
            return 'GreaterThanEquals';
        case TokenType.EqualsEqualsEquals:
            return 'EqualsEqualsEquals';
        case TokenType.ExclamationEquals:
            return 'ExclamationEquals';
        case TokenType.ExclamationEqualsEquals:
            return 'ExclamationEqualsEquals';
        case TokenType.LessThanEquals:
            return 'LessThanEquals';
        case TokenType.Spaceship:
            return 'Spaceship';
        case TokenType.Minus:
            return 'Minus';
        case TokenType.MinusEquals:
            return 'MinusEquals';
        case TokenType.PercentEquals:
            return 'PercentEquals';
        case TokenType.AsteriskEquals:
            return 'AsteriskEquals';
        case TokenType.Backslash:
            return 'Backslash';
        case TokenType.BooleanCast:
            return 'BooleanCast';
        case TokenType.UnsetCast:
            return 'UnsetCast';
        case TokenType.StringCast:
            return 'StringCast';
        case TokenType.ObjectCast:
            return 'ObjectCast';
        case TokenType.IntegerCast:
            return 'IntegerCast';
        case TokenType.FloatCast:
            return 'FloatCast';
        case TokenType.StartHeredoc:
            return 'StartHeredoc';
        case TokenType.ArrayCast:
            return 'ArrayCast';
        case TokenType.OpenTag:
            return 'OpenTag';
        case TokenType.OpenTagEcho:
            return 'OpenTagEcho';
        case TokenType.CloseTag:
            return 'CloseTag';
        case TokenType.Comment:
            return 'Comment';
        case TokenType.DocumentComment:
            return 'DocumentComment';
        case TokenType.Whitespace:
            return 'Whitespace';
    }
}