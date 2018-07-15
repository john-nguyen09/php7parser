/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */

'use strict';

export const enum TokenKind {
    //Misc
    Unknown = 0,
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
    kind: TokenKind,
    /**
     * Offset within source were first char of token is found
     */
    offset: number,
    /**
     * Length of token string
     */
    length: number
}

export namespace Token {
    export function create(type: TokenKind, offset: number, length: number): Token {
        return { kind: type, offset: offset, length: length };
    }
}

export namespace Lexer {

    interface LexerState {
        position: number;
        input: string;
        modeStack: LexerMode[];
        doubleQuoteScannedLength: number;
        heredocLabel: string;
        heredocEndNewLineLength:number;
        heredocEndIndent: number;
    }

    var state: LexerState;

    export function setInput(text: string, lexerModeStack?: LexerMode[], position?: number) {
        state = {
            position: position > 0 ? position : 0,
            input: text,
            modeStack: lexerModeStack ? lexerModeStack : [LexerMode.Initial],
            doubleQuoteScannedLength: -1,
            heredocLabel: null,
            heredocEndNewLineLength: 0,
            heredocEndIndent: 0
        };
    }

    export function lex(): Token {
        if (state.position >= state.input.length) {
            return {
                kind: TokenKind.EndOfFile,
                offset: state.position,
                length: 0
            };
        }

        let t: Token;

        switch (state.modeStack[state.modeStack.length - 1]) {
            case LexerMode.Initial:
                t = initial(state);
                break;

            case LexerMode.Scripting:
                t = scripting(state);
                break;

            case LexerMode.LookingForProperty:
                t = lookingForProperty(state);
                break;

            case LexerMode.DoubleQuotes:
                t = doubleQuotes(state);
                break;

            case LexerMode.NowDoc:
                t = nowdoc(state);
                break;

            case LexerMode.HereDoc:
                t = heredoc(state);
                break;

            case LexerMode.EndHereDoc:
                t = endHeredoc(state);
                break;

            case LexerMode.Backtick:
                t = backtick(state);
                break;

            case LexerMode.VarOffset:
                t = varOffset(state);
                break;

            case LexerMode.LookingForVarName:
                t = lookingForVarName(state);
                break;

            default:
                throw new Error('Unknown LexerMode');

        }

        return t ? t : lex();

    }

    /**
     * spec suggests that only extended ascii (cp > 0x7f && cp < 0x100) is valid but official lexer seems ok with all utf8
     * @param c 
     */
    function isLabelStart(c: string) {
        let cp = c.charCodeAt(0);
        return (cp > 0x40 && cp < 0x5b) || (cp > 0x60 && cp < 0x7b) || cp === 0x5f || cp > 0x7f;
    }

    /**
     * spec suggests that only extended ascii (cp > 0x7f && cp < 0x100) is valid but official lexer seems ok with all utf8
     * @param c 
     */
    function isLabelChar(c: string) {
        let cp = c.charCodeAt(0);
        return (cp > 0x2f && cp < 0x3a) || (cp > 0x40 && cp < 0x5b) || (cp > 0x60 && cp < 0x7b) || cp === 0x5f || cp > 0x7f;
    }

    function isWhitespace(c: string) {
        return c === ' ' || c === '\n' || c === '\r' || c === '\t';
    }

    function initial(s: LexerState): Token {

        let l = s.input.length;
        let c = s.input[s.position];
        let start = s.position;

        if (c === '<' && s.position + 1 < l && s.input[s.position + 1] === '?') {
            let kind = TokenKind.OpenTag;

            if (
                s.input.substr(s.position, 5).toLowerCase() === '<?php' &&
                s.position + 5 < l && isWhitespace(s.input[s.position + 5])
            ) {

                if (s.input[s.position + 5] === '\r' && s.position + 6 < l && s.input[s.position + 6] === '\n') {
                    s.position += 7;
                } else {
                    s.position += 6;
                }

            } else if (s.position + 2 < l && s.input[s.position + 2] === '=') {
                kind = TokenKind.OpenTagEcho;
                s.position += 3;
            }
            else {
                s.position += 2;
            }

            let t = { kind: kind, offset: start, length: s.position - start };
            s.modeStack.pop();
            s.modeStack.push(LexerMode.Scripting);
            return t;
        }

        while (++s.position < l) {
            c = s.input[s.position];
            if (c === '<' && s.position + 1 < l && s.input[s.position + 1] === '?') {
                break;
            }
        }

        return { kind: TokenKind.Text, offset: start, length: s.position - start};

    }

    function scripting(s: LexerState): Token {

        let c = s.input[s.position];
        let start = s.position;
        let l = s.input.length;

        switch (c) {

            case ' ':
            case '\t':
            case '\n':
            case '\r':
                while (++s.position < l && isWhitespace(s.input[s.position])) { }
                return { kind: TokenKind.Whitespace, offset: start, length: s.position - start };

            case '-':
                return scriptingMinus(s);

            case ':':
                if (++s.position < l && s.input[s.position] === ':') {
                    ++s.position;
                    return { kind: TokenKind.ColonColon, offset: start, length: 2 };
                }
                return { kind: TokenKind.Colon, offset: start, length: 1 };

            case '.':
                return scriptingDot(s);

            case '=':
                return scriptingEquals(s);

            case '+':
                return scriptingPlus(s);

            case '!':
                return scriptingExclamation(s);

            case '<':
                return scriptingLessThan(s);

            case '>':
                return scriptingGreaterThan(s);

            case '*':
                return scriptingAsterisk(s);

            case '/':
                return scriptingForwardSlash(s);

            case '%':
                if (++s.position < l && s.input[s.position] === '=') {
                    ++s.position;
                    return { kind: TokenKind.PercentEquals, offset: start, length: 2 };
                }
                return { kind: TokenKind.Percent, offset: start, length: 1 };

            case '&':
                return scriptingAmpersand(s);

            case '|':
                return scriptingBar(s);

            case '^':
                if (++s.position < l && s.input[s.position] === '=') {
                    ++s.position;
                    return { kind: TokenKind.CaretEquals, offset: start, length: 2 };
                }
                return { kind: TokenKind.Caret, offset: start, length: 1 };

            case ';':
                ++s.position;
                return { kind: TokenKind.Semicolon, offset: start, length: 1 };

            case ',':
                ++s.position;
                return { kind: TokenKind.Comma, offset: start, length: 1 };

            case '[':
                ++s.position;
                return { kind: TokenKind.OpenBracket, offset: start, length: 1 };

            case ']':
                ++s.position;
                return { kind: TokenKind.CloseBracket, offset: start, length: 1 };

            case '(':
                return scriptingOpenParenthesis(s);

            case ')':
                ++s.position;
                return { kind: TokenKind.CloseParenthesis, offset: start, length: 1 };

            case '~':
                ++s.position;
                return { kind: TokenKind.Tilde, offset: start, length: 1 };

            case '?':
                return scriptingQuestion(s);

            case '@':
                ++s.position;
                return { kind: TokenKind.AtSymbol, offset: start, length: 1 };

            case '$':
                return scriptingDollar(s);

            case '#':
                ++s.position;
                return scriptingComment(s, start);

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                return scriptingNumeric(s);

            case '{':
                ++s.position;
                s.modeStack.push(LexerMode.Scripting);
                return { kind: TokenKind.OpenBrace, offset: start, length: 1 };

            case '}':
                ++s.position;
                if (s.modeStack.length > 1) {
                    s.modeStack.pop();
                }
                return { kind: TokenKind.CloseBrace, offset: start, length: 1 };

            case '`':
                ++s.position;
                s.modeStack.pop();
                s.modeStack.push(LexerMode.Backtick);
                return { kind: TokenKind.Backtick, offset: start, length: 1 };

            case '\\':
                return scriptingBackslash(s);

            case '\'':
                return scriptingSingleQuote(s, start);

            case '"':
                return scriptingDoubleQuote(s, start);

            default:
                if (isLabelStart(c)) {
                    return scriptingLabelStart(s);
                } else {
                    ++s.position;
                    return { kind: TokenKind.Unknown, offset: start, length: 1 };
                }

        }

    }

    function lookingForProperty(s: LexerState): Token {

        let start = s.position;
        let c = s.input[s.position];
        let l = s.input.length;

        switch (c) {
            case ' ':
            case '\t':
            case '\n':
            case '\r':
                while (++s.position < l && isWhitespace(s.input[s.position])) { }
                return { kind: TokenKind.Whitespace, offset: start, length: s.position - start };

            default:
                if (isLabelStart(c)) {
                    while (++s.position < l && isLabelChar(s.input[s.position])) { }
                    s.modeStack.pop();
                    return { kind: TokenKind.Name, offset: start, length: s.position - start };
                }

                if (c === '-' && s.position + 1 < l && s.input[s.position + 1] === '>') {
                    s.position += 2;
                    return { kind: TokenKind.Arrow, offset: start, length: 2 };
                }

                s.modeStack.pop();
                return null;
        }

    }

    function doubleQuotes(s: LexerState) {

        let l = s.input.length;
        let c = s.input[s.position];
        let start = s.position;
        let t: Token;

        switch (c) {
            case '$':
                if ((t = encapsulatedDollar(s))) {
                    return t;
                }
                break;

            case '{':
                if (s.position + 1 < l && s.input[s.position + 1] === '$') {
                    s.modeStack.push(LexerMode.Scripting);
                    ++s.position;
                    return { kind: TokenKind.CurlyOpen, offset: start, length: 1 };
                }
                break;

            case '"':
                s.modeStack.pop();
                s.modeStack.push(LexerMode.Scripting);
                ++s.position;
                return { kind: TokenKind.DoubleQuote, offset: start, length: 1 };

            default:
                break;

        }

        return doubleQuotesAny(s);
    }

    function nowdoc(s: LexerState) {

        //search for label
        let start = s.position;
        let n = start;
        let l = s.input.length;
        let c: string;

        while (n < l) {
            c = s.input[n++];
            switch (c) {
                case '\r':
                    if (n < l && s.input[n] === '\n') {
                        ++n;
                    }
                /* fall through */
                case '\n':

                    {
                        let k = n;

                        //7.3 end heredoc indent
                        while (k < l && (s.input[k] === ' ' || s.input[k] === '\t')) {
                            ++k;
                        }
                        s.heredocEndIndent = k - n;

                        /* Check for ending label on the next line */
                        if (k < l && s.heredocLabel === s.input.substr(k, s.heredocLabel.length)) {

                            if (k + s.heredocLabel.length < l && isLabelStart(s.input[k + s.heredocLabel.length])) {
                                //end label has not been found
                                continue;
                            }

                            //set position to nl before end label
                            if (s.input[n - 2] === '\r' && s.input[n - 1] === '\n') {
                                n -= 2;
                                s.heredocEndNewLineLength = 2;
                            } else {
                                --n;
                                s.heredocEndNewLineLength = 1;
                            }

                            s.modeStack.pop();
                            s.modeStack.push(LexerMode.EndHereDoc);
                            break;
                        }
                    }

                /* fall through */
                default:
                    continue;
            }

            break;
        }

        s.position = n;
        return { kind: TokenKind.EncapsulatedAndWhitespace, offset: start, length: s.position - start };

    }

    function heredoc(s: LexerState) {

        let l = s.input.length;
        let c = s.input[s.position];
        let start = s.position;
        let t: Token;

        switch (c) {
            case '$':
                if ((t = encapsulatedDollar(s))) {
                    return t;
                }
                break;

            case '{':
                if (s.position + 1 < l && s.input[s.position + 1] === '$') {
                    s.modeStack.push(LexerMode.Scripting);
                    ++s.position;
                    return { kind: TokenKind.CurlyOpen, offset: start, length: 1 };
                }
                break;

            default:
                break;

        }

        return heredocAny(s);

    }

    function backtick(s: LexerState) {

        let l = s.input.length;
        let c = s.input[s.position];
        let start = s.position;
        let t: Token;

        switch (c) {
            case '$':
                if ((t = encapsulatedDollar(s))) {
                    return t;
                }
                break;

            case '{':
                if (s.position + 1 < l && s.input[s.position + 1] === '$') {
                    s.modeStack.push(LexerMode.Scripting);
                    ++s.position;
                    return { kind: TokenKind.CurlyOpen, offset: start, length: 1 };
                }
                break;

            case '`':
                s.modeStack.pop();
                s.modeStack.push(LexerMode.Scripting);
                ++s.position;
                return { kind: TokenKind.Backtick, offset: start, length: 1 };

            default:
                break;

        }

        return backtickAny(s);

    }

    function varOffset(s: LexerState) {

        let start = s.position;
        let c = s.input[s.position];
        let l = s.input.length;

        switch (s.input[s.position]) {

            case '$':
                if (s.position + 1 < l && isLabelStart(s.input[s.position + 1])) {
                    ++s.position;
                    while (++s.position < l && isLabelChar(s.input[s.position])) { }
                    return { kind: TokenKind.VariableName, offset: start, length: s.position - start };
                }
                break;

            case '[':
                ++s.position;
                return { kind: TokenKind.OpenBracket, offset: start, length: 1 };

            case ']':
                s.modeStack.pop();
                ++s.position;
                return { kind: TokenKind.CloseBracket, offset: start, length: 1 };

            case '-':
                ++s.position;
                return { kind: TokenKind.Minus, offset: start, length: 1 };

            default:
                if (c >= '0' && c <= '9') {
                    return varOffsetNumeric(s);
                } else if (isLabelStart(c)) {
                    while (++s.position < l && isLabelChar(s.input[s.position])) { }
                    return { kind: TokenKind.Name, offset: start, length: s.position - start };
                }
                break;

        }

        //unexpected char
        s.modeStack.pop();
        ++s.position;
        return { kind: TokenKind.Unknown, offset: start, length: 1 };

    }

    function lookingForVarName(s: LexerState) {

        let start = s.position;
        let l = s.input.length;

        if (isLabelStart(s.input[s.position])) {
            let k = s.position + 1;
            while (++k < l && isLabelChar(s.input[k])) { }
            if (k < l && (s.input[k] === '[' || s.input[k] === '}')) {
                s.modeStack.pop();
                s.modeStack.push(LexerMode.Scripting);
                s.position = k;
                return { kind: TokenKind.VariableName, offset: start, length: s.position - start };
            }
        }

        s.modeStack.pop();
        s.modeStack.push(LexerMode.Scripting);
        return undefined;

    }

    function varOffsetNumeric(s: LexerState) {

        let start = s.position;
        let c = s.input[s.position];
        let l = s.input.length;

        if (c === '0') {
            let k = s.position + 1;
            if (k < l && s.input[k] === 'b' && ++k < l && (s.input[k] === '1' || s.input[k] === '0')) {
                while (++k < l && (s.input[k] === '1' || s.input[k] === '0')) { }
                s.position = k;
                return { kind: TokenKind.IntegerLiteral, offset: start, length: s.position - start };
            }

            if (k < l && s.input[k] === 'x' && ++k < l && isHexDigit(s.input[k])) {
                while (++k < l && isHexDigit(s.input[k])) { }
                s.position = k;
                return { kind: TokenKind.IntegerLiteral, offset: start, length: s.position - start };
            }
        }

        while (++s.position < l && s.input[s.position] >= '0' && s.input[s.position] <= '9') { }
        return { kind: TokenKind.IntegerLiteral, offset: start, length: s.position - start };

    }

    function backtickAny(s: LexerState) {

        let n = s.position;
        let c: string;
        let start = n;
        let l = s.input.length;

        if (s.input[n] === '\\' && n < l) {
            ++n;
        }

        while (n < l) {
            c = s.input[n++];
            switch (c) {
                case '`':
                    break;
                case '$':
                    if (n < l && (isLabelStart(s.input[n]) || s.input[n] === '{')) {
                        break;
                    }
                    continue;
                case '{':
                    if (n < l && s.input[n] === '$') {
                        break;
                    }
                    continue;
                case '\\':
                    if (n < l) {
                        ++n;
                    }
                /* fall through */
                default:
                    continue;
            }

            --n;
            break;
        }

        s.position = n;
        return { kind: TokenKind.EncapsulatedAndWhitespace, offset: start, length: s.position - start };

    }

    function heredocAny(s: LexerState) {

        let start = s.position;
        let n = start;
        let c: string;
        let l = s.input.length;

        while (n < l) {
            c = s.input[n++];
            switch (c) {
                case '\r':
                    if (n < l && s.input[n] === '\n') {
                        ++n;
                    }
                /* fall through */
                case '\n':

                    {
                        let k = n;

                        //7.3 end heredoc indent
                        while (k < l && (s.input[k] === ' ' || s.input[k] === '\t')) {
                            ++k;
                        }

                        s.heredocEndIndent = k - n;

                        /* Check for ending label on the next line */
                        if (k < l && s.heredocLabel === s.input.substr(k, s.heredocLabel.length)) {

                            if (k + s.heredocLabel.length < l && isLabelStart(s.input[k + s.heredocLabel.length])) {
                                //end label has not been found
                                continue;
                            }

                            //set position to nl before end label
                            if (s.input[n - 2] === '\r' && s.input[n - 1] === '\n') {
                                n -= 2;
                                s.heredocEndNewLineLength = 2;
                            } else {
                                --n;
                                s.heredocEndNewLineLength = 1;
                            }

                            s.position = n;
                            s.modeStack.pop();
                            s.modeStack.push(LexerMode.EndHereDoc);
                            return { kind: TokenKind.EncapsulatedAndWhitespace, offset: start, length: s.position - start };
                        }
                    }

                    continue;
                case '$':
                    if (n < l && (isLabelStart(s.input[n]) || s.input[n] === '{')) {
                        break;
                    }
                    continue;
                case '{':
                    if (n < l && s.input[n] === '$') {
                        break;
                    }
                    continue;
                case '\\':
                    if (n < l && s.input[n] !== '\n' && s.input[n] !== '\r') {
                        ++n;
                    }
                /* fall through */
                default:
                    continue;
            }

            --n;
            break;
        }

        s.position = n;
        return { kind: TokenKind.EncapsulatedAndWhitespace, offset: start, length: s.position - start };
    }

    function endHeredoc(s: LexerState) {

        let start = s.position;
        s.position += s.heredocEndNewLineLength + s.heredocEndIndent + s.heredocLabel.length;
        s.heredocLabel = null;
        s.heredocEndIndent = 0;
        s.heredocEndNewLineLength = 0;
        s.modeStack.pop();
        s.modeStack.push(LexerMode.Scripting);
        return { kind: TokenKind.EndHeredoc, offset: start, length: s.position - start };

    }

    function doubleQuotesAny(s: LexerState) {

        let start = s.position;

        if (s.doubleQuoteScannedLength > 0) {
            //already know position
            s.position = s.doubleQuoteScannedLength;
            s.doubleQuoteScannedLength = -1
        } else {
            //find new pos
            let n = s.position;
            let l = s.input.length;
            ++n;

            if (s.input[s.position] === '\\' && n + 1 < l) {
                ++n;
            }

            let c: string;
            while (n < l) {
                c = s.input[n++];
                switch (c) {
                    case '"':
                        break;
                    case '$':
                        if (n < l && (isLabelStart(s.input[n]) || s.input[n] == '{')) {
                            break;
                        }
                        continue;
                    case '{':
                        if (n < l && s.input[n] === '$') {
                            break;
                        }
                        continue;
                    case '\\':
                        if (n < l) {
                            ++n;
                        }
                    /* fall through */
                    default:
                        continue;
                }

                --n;
                break;
            }

            s.position = n;
        }

        return { kind: TokenKind.EncapsulatedAndWhitespace, offset: start, length: s.position - start };

    }

    function encapsulatedDollar(s: LexerState): Token {

        let start = s.position;
        let l = s.input.length;
        let k = s.position + 1;

        if (k >= l) {
            return undefined;
        }

        if (s.input[k] === '{') {
            s.position += 2;
            s.modeStack.push(LexerMode.LookingForVarName);
            return { kind: TokenKind.DollarCurlyOpen, offset: start, length: 2 };
        }

        if (!isLabelStart(s.input[k])) {
            return undefined;
        }

        while (++k < l && isLabelChar(s.input[k])) { }

        if (k < l && s.input[k] === '[') {
            s.modeStack.push(LexerMode.VarOffset);
            s.position = k;
            return { kind: TokenKind.VariableName, offset: start, length: s.position - start };
        }

        if (k < l && s.input[k] === '-') {
            let n = k + 1;
            if (n < l && s.input[n] === '>' && ++n < l && isLabelStart(s.input[n])) {
                s.modeStack.push(LexerMode.LookingForProperty);
                s.position = k;
                return { kind: TokenKind.VariableName, offset: start, length: s.position - start };
            }
        }

        s.position = k;
        return { kind: TokenKind.VariableName, offset: start, length: s.position - start };

    }

    function scriptingDoubleQuote(s: LexerState, start: number): Token {

        //optional \ consumed
        //consume until unescaped "
        //if ${LABEL_START}, ${, {$ found or no match return " and consume none 
        ++s.position;
        let n = s.position;
        let c: string;
        let l = s.input.length;

        while (n < l) {
            c = s.input[n++];
            switch (c) {
                case '"':
                    s.position = n;
                    return { kind: TokenKind.StringLiteral, offset: start, length: s.position - start };
                case '$':
                    if (n < l && (isLabelStart(s.input[n]) || s.input[n] === '{')) {
                        break;
                    }
                    continue;
                case '{':
                    if (n < l && s.input[n] === '$') {
                        break;
                    }
                    continue;
                case '\\':
                    if (n < l) {
                        ++n;
                    }
                /* fall through */
                default:
                    continue;
            }

            --n;
            break;
        }

        s.doubleQuoteScannedLength = n;
        s.modeStack.pop();
        s.modeStack.push(LexerMode.DoubleQuotes);
        return { kind: TokenKind.DoubleQuote, offset: start, length: s.position - start };

    }

    function scriptingSingleQuote(s: LexerState, start: number): Token {
        //optional \ already consumed
        //find first unescaped '
        let l = s.input.length;
        let c: string;
        ++s.position;
        while (s.position < l) {
            c = s.input[s.position];
            ++s.position;

            if (c === '\'') {
                return { kind: TokenKind.StringLiteral, offset: start, length: s.position - start };
            } else if (c === '\\' && s.position < l) {
                ++s.position;
            }
        }

        return { kind: TokenKind.EncapsulatedAndWhitespace, offset: start, length: s.position - start };
    }

    function scriptingBackslash(s: LexerState): Token {

        //single quote, double quote and heredoc open have optional \

        let start = s.position;
        ++s.position;
        let t: Token;

        if (s.position < s.input.length) {
            switch (s.input[s.position]) {
                case '\'':
                    return scriptingSingleQuote(s, start);

                case '"':
                    return scriptingDoubleQuote(s, start);

                case '<':
                    t = scriptingHeredoc(s, start);
                    if (t) {
                        return t;
                    }

                default:
                    break;
            }
        }

        return { kind: TokenKind.Backslash, offset: start, length: 1 };

    }

    const endHeredocLabelRegExp = /^;?(?:\r\n|\n|\r)/;
    function scriptingHeredoc(s: LexerState, start: number) {

        //pos is on first <
        let l = s.input.length;
        let k = s.position;

        let labelStart: number;
        let labelEnd: number;

        for (let kPlus3 = k + 3; k < kPlus3; ++k) {
            if (k >= l || s.input[k] !== '<') {
                return null;
            }
        }

        while (k < l && (s.input[k] === ' ' || s.input[k] === '\t')) {
            ++k;
        }

        let quote: string;
        if (k < l && (s.input[k] === '\'' || s.input[k] === '"')) {
            quote = s.input[k];
            ++k;
        }

        labelStart = k;

        if (k < l && isLabelStart(s.input[k])) {
            while (++k < l && isLabelChar(s.input[k])) { }
        } else {
            return null;
        }

        labelEnd = k;

        if (quote) {
            if (k < l && s.input[k] === quote) {
                ++k;
            } else {
                return null;
            }
        }

        if (k < l) {
            if (s.input[k] === '\r') {
                ++k;
                if (s.input[k] === '\n') {
                    ++k;
                }
            } else if (s.input[k] === '\n') {
                ++k;
            } else {
                return null;
            }
        }

        s.position = k;
        s.heredocLabel = s.input.slice(labelStart, labelEnd);
        let t = { kind: TokenKind.StartHeredoc, offset: start, length: s.position - start };
        s.modeStack.pop();

        if (quote === '\'') {
            s.modeStack.push(LexerMode.NowDoc);
        } else {
            s.modeStack.push(LexerMode.HereDoc);
        }

        //check for end on next line
        if (
            s.input.substr(s.position, s.heredocLabel.length) === s.heredocLabel &&
            s.input.substr(s.position + s.heredocLabel.length, 3).search(endHeredocLabelRegExp) >= 0
        ) {
            s.modeStack.pop();
            s.modeStack.push(LexerMode.EndHereDoc);
        }

        return t;

    }

    function scriptingLabelStart(s: LexerState): Token {

        let l = s.input.length;
        let start = s.position;
        while (++s.position < l && isLabelChar(s.input[s.position])) { }

        let text = s.input.slice(start, s.position);
        let kind = 0;

        if (text[0] === '_') {

            switch (text) {
                case '__CLASS__':
                    kind = TokenKind.ClassConstant;
                    break;
                case '__TRAIT__':
                    kind = TokenKind.TraitConstant;
                    break;
                case '__FUNCTION__':
                    kind = TokenKind.FunctionConstant;
                    break;
                case '__METHOD__':
                    kind = TokenKind.MethodConstant;
                    break;
                case '__LINE__':
                    kind = TokenKind.LineConstant;
                    break;
                case '__FILE__':
                    kind = TokenKind.FileConstant;
                    break;
                case '__DIR__':
                    kind = TokenKind.DirectoryConstant;
                    break;
                case '__NAMESPACE__':
                    kind = TokenKind.NamespaceConstant;
                    break;
                default:
                    break;
            }

            if (kind > 0) {
                return { kind: kind, offset: start, length: s.position - start };
            }
        }

        text = text.toLowerCase();

        switch (text) {
            case 'exit':
                kind = TokenKind.Exit;
                break;
            case 'die':
                kind = TokenKind.Exit;
                break;
            case 'function':
                kind = TokenKind.Function;
                break;
            case 'const':
                kind = TokenKind.Const;
                break;
            case 'return':
                kind = TokenKind.Return;
                break;
            case 'yield':
                return scriptingYield(s, start);
            case 'try':
                kind = TokenKind.Try;
                break;
            case 'catch':
                kind = TokenKind.Catch;
                break;
            case 'finally':
                kind = TokenKind.Finally;
                break;
            case 'throw':
                kind = TokenKind.Throw;
                break;
            case 'if':
                kind = TokenKind.If;
                break;
            case 'elseif':
                kind = TokenKind.ElseIf;
                break;
            case 'endif':
                kind = TokenKind.EndIf;
                break;
            case 'else':
                kind = TokenKind.Else;
                break;
            case 'while':
                kind = TokenKind.While;
                break;
            case 'endwhile':
                kind = TokenKind.EndWhile;
                break;
            case 'do':
                kind = TokenKind.Do;
                break;
            case 'for':
                kind = TokenKind.For;
                break;
            case 'endfor':
                kind = TokenKind.EndFor;
                break;
            case 'foreach':
                kind = TokenKind.ForEach;
                break;
            case 'endforeach':
                kind = TokenKind.EndForeach;
                break;
            case 'declare':
                kind = TokenKind.Declare;
                break;
            case 'enddeclare':
                kind = TokenKind.EndDeclare;
                break;
            case 'instanceof':
                kind = TokenKind.InstanceOf;
                break;
            case 'as':
                kind = TokenKind.As;
                break;
            case 'switch':
                kind = TokenKind.Switch;
                break;
            case 'endswitch':
                kind = TokenKind.EndSwitch;
                break;
            case 'case':
                kind = TokenKind.Case;
                break;
            case 'default':
                kind = TokenKind.Default;
                break;
            case 'break':
                kind = TokenKind.Break;
                break;
            case 'continue':
                kind = TokenKind.Continue;
                break;
            case 'goto':
                kind = TokenKind.Goto;
                break;
            case 'echo':
                kind = TokenKind.Echo;
                break;
            case 'print':
                kind = TokenKind.Print;
                break;
            case 'class':
                kind = TokenKind.Class;
                break;
            case 'interface':
                kind = TokenKind.Interface;
                break;
            case 'trait':
                kind = TokenKind.Trait;
                break;
            case 'extends':
                kind = TokenKind.Extends;
                break;
            case 'implements':
                kind = TokenKind.Implements;
                break;
            case 'new':
                kind = TokenKind.New;
                break;
            case 'clone':
                kind = TokenKind.Clone;
                break;
            case 'var':
                kind = TokenKind.Var;
                break;
            case 'eval':
                kind = TokenKind.Eval;
                break;
            case 'include_once':
                kind = TokenKind.IncludeOnce;
                break;
            case 'include':
                kind = TokenKind.Include;
                break;
            case 'require_once':
                kind = TokenKind.RequireOnce;
                break;
            case 'require':
                kind = TokenKind.Require;
                break;
            case 'namespace':
                kind = TokenKind.Namespace;
                break;
            case 'use':
                kind = TokenKind.Use;
                break;
            case 'insteadof':
                kind = TokenKind.InsteadOf;
                break;
            case 'global':
                kind = TokenKind.Global;
                break;
            case 'isset':
                kind = TokenKind.Isset;
                break;
            case 'empty':
                kind = TokenKind.Empty;
                break;
            case '__halt_compiler':
                kind = TokenKind.HaltCompiler;
                break;
            case 'static':
                kind = TokenKind.Static;
                break;
            case 'abstract':
                kind = TokenKind.Abstract;
                break;
            case 'final':
                kind = TokenKind.Final;
                break;
            case 'private':
                kind = TokenKind.Private;
                break;
            case 'protected':
                kind = TokenKind.Protected;
                break;
            case 'public':
                kind = TokenKind.Public;
                break;
            case 'unset':
                kind = TokenKind.Unset;
                break;
            case 'list':
                kind = TokenKind.List;
                break;
            case 'array':
                kind = TokenKind.Array;
                break;
            case 'callable':
                kind = TokenKind.Callable;
                break;
            case 'or':
                kind = TokenKind.Or;
                break;
            case 'and':
                kind = TokenKind.And;
                break;
            case 'xor':
                kind = TokenKind.Xor;
                break;
            default:
                break;
        }

        if (!kind) {
            kind = TokenKind.Name;
        }

        return { kind: kind, offset: start, length: s.position - start };
    }

    function scriptingYield(s: LexerState, start: number) {
        //pos will be after yield keyword
        //check for from

        let l = s.input.length;
        let k = s.position;

        if (k < l && isWhitespace(s.input[k])) {
            while (++k < l && isWhitespace(s.input[k])) { }
            if (s.input.substr(k, 4).toLowerCase() === 'from') {
                s.position = k + 4;
                return { kind: TokenKind.YieldFrom, offset: start, length: s.position - start };
            }
        }

        return { kind: TokenKind.Yield, offset: start, length: s.position - start };

    }

    function scriptingQuestion(s: LexerState): Token {

        let l = s.input.length;
        let start = s.position;

        ++s.position;
        if (s.position < l) {
            if (s.input[s.position] === '?') {
                ++s.position;
                return { kind: TokenKind.QuestionQuestion, offset: start, length: 2 };
            } else if (s.input[s.position] === '>') {
                ++s.position;
                s.modeStack.pop();
                s.modeStack.push(LexerMode.Initial);
                return { kind: TokenKind.CloseTag, offset: start, length: s.position - start };
            }
        }
        return { kind: TokenKind.Question, offset: start, length: 1 };
    }

    function scriptingDollar(s: LexerState): Token {
        let start = s.position;
        let k = s.position;
        let l = s.input.length;
        ++k;

        if (k < l && isLabelStart(s.input[k])) {
            while (++k < l && isLabelChar(s.input[k])) { }
            s.position = k;
            return { kind: TokenKind.VariableName, offset: start, length: s.position - start };
        }

        ++s.position;
        return { kind: TokenKind.Dollar, offset: start, length: 1 };
    }

    function scriptingOpenParenthesis(s: LexerState): Token {

        let start = s.position;
        let k = start;
        let l = s.input.length;

        //check for cast tokens
        ++k;
        while (k < l && (s.input[k] === ' ' || s.input[k] === '\t')) {
            ++k;
        }

        let keywordStart = k;
        while (k < l && ((s.input[k] >= 'A' && s.input <= 'Z') || (s.input[k] >= 'a' && s.input <= 'z'))) {
            ++k;
        }
        let keywordEnd = k;

        while (k < l && (s.input[k] === ' ' || s.input[k] === '\t')) {
            ++k;
        }

        //should have a ) here if valid cast token
        if (k < l && s.input[k] === ')') {
            let keyword = s.input.slice(keywordStart, keywordEnd).toLowerCase();
            let kind = 0;
            switch (keyword) {
                case 'int':
                case 'integer':
                    kind = TokenKind.IntegerCast;
                    break;

                case 'real':
                case 'float':
                case 'double':
                    kind = TokenKind.FloatCast;
                    break;

                case 'string':
                case 'binary':
                    kind = TokenKind.StringCast;
                    break;

                case 'array':
                    kind = TokenKind.ArrayCast;
                    break;

                case 'object':
                    kind = TokenKind.ObjectCast;
                    break;

                case 'bool':
                case 'boolean':
                    kind = TokenKind.BooleanCast;
                    break;

                case 'unset':
                    kind = TokenKind.UnsetCast;
                    break;

                default:
                    break;
            }

            if (kind > 0) {
                s.position = k + 1;
                return { kind: kind, offset: start, length: s.position - start };
            }

        }

        ++s.position;
        return { kind: TokenKind.OpenParenthesis, offset: start, length: 1 };

    }

    function isHexDigit(c: string) {
        return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
    }

    function scriptingNumeric(s: LexerState): Token {

        let start = s.position;
        let l = s.input.length;
        let k = s.position;

        if (s.input[s.position] === '0' && ++k < l) {
            if (s.input[k] === 'b' && ++k < l && (s.input[k] === '0' || s.input[k] === '1')) {
                while (++k < l && (s.input[k] === '0' || s.input[k] === '1')) { }
                s.position = k;
                return { kind: TokenKind.IntegerLiteral, offset: start, length: s.position - start };
            }
            k = s.position + 1;
            if (s.input[k] === 'x' && ++k < l && isHexDigit(s.input[k])) {
                while (++k < l && isHexDigit(s.input[k])) { }
                s.position = k;
                return { kind: TokenKind.IntegerLiteral, offset: start, length: s.position - start };
            }
        }

        while (++s.position < l && s.input[s.position] >= '0' && s.input[s.position] <= '9') { }

        if (s.input[s.position] === '.') {
            ++s.position;
            return scriptingNumericStartingWithDotOrE(s, start, true);
        } else if (s.input[s.position] === 'e' || s.input[s.position] === 'E') {
            return scriptingNumericStartingWithDotOrE(s, start, false);
        }

        return { kind: TokenKind.IntegerLiteral, offset: start, length: s.position - start };

    }

    function scriptingNumericStartingWithDotOrE(s: LexerState, start: number, hasDot: boolean): Token {

        let l = s.input.length;
        while (s.position < l && s.input[s.position] >= '0' && s.input[s.position] <= '9') {
            ++s.position;
        }

        if (s.position < l && (s.input[s.position] === 'e' || s.input[s.position] === 'E')) {
            let k = s.position + 1;
            if (k < l && (s.input[k] === '+' || s.input[k] === '-')) {
                ++k;
            }
            if (k < l && s.input[k] >= '0' && s.input[k] <= '9') {
                while (++k < l && s.input[k] >= '0' && s.input[k] <= '9') { }
                s.position = k;
                return { kind: TokenKind.FloatingLiteral, offset: start, length: s.position - start };
            }
        }

        return { kind: hasDot ? TokenKind.FloatingLiteral : TokenKind.IntegerLiteral, offset: start, length: s.position - start };

    }

    function scriptingBar(s: LexerState): Token {
        let start = s.position;
        ++s.position;

        if (s.position < s.input.length) {
            switch (s.input[s.position]) {
                case '=':
                    ++s.position;
                    return { kind: TokenKind.BarEquals, offset: start, length: 2 };

                case '|':
                    ++s.position;
                    return { kind: TokenKind.BarBar, offset: start, length: 2 };

                default:
                    break;
            }
        }

        return { kind: TokenKind.Bar, offset: start, length: 1 };
    }

    function scriptingAmpersand(s: LexerState): Token {

        let start = s.position;
        ++s.position;

        if (s.position < s.input.length) {

            switch (s.input[s.position]) {
                case '=':
                    ++s.position;
                    return { kind: TokenKind.AmpersandEquals, offset: start, length: 2 };

                case '&':
                    ++s.position;
                    return { kind: TokenKind.AmpersandAmpersand, offset: start, length: 2 };

                default:
                    break;
            }

        }

        return { kind: TokenKind.Ampersand, offset: start, length: 1 };

    }

    function scriptingInlineCommentOrDocBlock(s: LexerState): Token {

        // /* already read

        let kind = TokenKind.Comment;
        let start = s.position - 2;
        let l = s.input.length;
        let c:string;

        if (s.position < l && s.input[s.position] === '*' && s.position + 1 < l && s.input[s.position + 1] !== '/') {
            ++s.position;
            kind = TokenKind.DocumentComment;
        }

        //find comment end */
        while (s.position < l) {
            if (s.input[s.position] === '*' && s.position + 1 < l && s.input[s.position + 1] === '/') {
                s.position += 2;
                break;
            }
            ++s.position;
        }

        //todo WARN unterminated comment
        return { kind: kind, offset: start, length: s.position - start };

    }

    function scriptingForwardSlash(s: LexerState) {

        let start = s.position;
        ++s.position;

        if (s.position < s.input.length) {

            switch (s.input[s.position]) {
                case '=':
                    ++s.position;
                    return { kind: TokenKind.ForwardslashEquals, offset: start, length: 2 };

                case '*':
                    ++s.position;
                    return scriptingInlineCommentOrDocBlock(s);

                case '/':
                    ++s.position;
                    return scriptingComment(s, start);

                default:
                    break;
            }

        }

        return { kind: TokenKind.ForwardSlash, offset: start, length: 1 };
    }

    function scriptingComment(s: LexerState, start: number) {
        //s.position will be on first char after # or //
        //find first newline or closing tag

        let l = s.input.length;
        let c: string;

        while (s.position < l) {
            c = s.input[s.position];
            ++s.position;
            if (
                c === '\n' ||
                c === '\r' ||
                (c === '?' && s.position < l && s.input[s.position] === '>')
            ) {
                --s.position;
                break;
            }
        }

        return { kind: TokenKind.Comment, offset: start, length: s.position - start };

    }

    function scriptingAsterisk(s: LexerState) {
        let start = s.position;

        if (++s.position < s.input.length) {
            switch (s.input[s.position]) {
                case '*':
                    ++s.position;
                    if (s.position < s.input.length && s.input[s.position] === '=') {
                        ++s.position;
                        return { kind: TokenKind.AsteriskAsteriskEquals, offset: start, length: 3 };
                    }
                    return { kind: TokenKind.AsteriskAsterisk, offset: start, length: 2 };

                case '=':
                    ++s.position;
                    return { kind: TokenKind.AsteriskEquals, offset: start, length: 2 };

                default:
                    break;
            }
        }

        return { kind: TokenKind.Asterisk, offset: start, length: 1 };
    }

    function scriptingGreaterThan(s: LexerState) {
        let start = s.position;

        if (++s.position < s.input.length) {

            switch (s.input[s.position]) {
                case '>':
                    ++s.position;
                    if (s.position < s.input.length && s.input[s.position] === '=') {
                        ++s.position;
                        return { kind: TokenKind.GreaterThanGreaterThanEquals, offset: start, length: 3 };
                    }
                    return { kind: TokenKind.GreaterThanGreaterThan, offset: start, length: 2 };
                case '=':
                    ++s.position;
                    return { kind: TokenKind.GreaterThanEquals, offset: start, length: 2 };
                default:
                    break;
            }
        }

        return { kind: TokenKind.GreaterThan, offset: start, length: 1 };

    }

    function scriptingLessThan(s: LexerState) {

        let start = s.position;

        if (++s.position < s.input.length) {

            switch (s.input[s.position]) {
                case '>':
                    ++s.position;
                    return { kind: TokenKind.ExclamationEquals, offset: start, length: 2 };

                case '<':
                    ++s.position;
                    if (s.position < s.input.length) {
                        if (s.input[s.position] === '=') {
                            ++s.position;
                            return { kind: TokenKind.LessThanLessThanEquals, offset: start, length: 3 };
                        } else if (s.input[s.position] === '<') {
                            //go back to first <
                            s.position -= 2;
                            let heredoc = scriptingHeredoc(s, start);
                            if (heredoc) {
                                return heredoc;
                            } else {
                                s.position += 2;
                            }
                        }

                    }
                    return { kind: TokenKind.LessThanLessThan, offset: start, length: 2 };
                case '=':
                    ++s.position;
                    if (s.position < s.input.length && s.input[s.position] === '>') {
                        ++s.position;
                        return { kind: TokenKind.Spaceship, offset: start, length: 3 };
                    }
                    return { kind: TokenKind.LessThanEquals, offset: start, length: 2 };

                default:
                    break;

            }

        }

        return { kind: TokenKind.LessThan, offset: start, length: 1 };
    }

    function scriptingExclamation(s: LexerState) {

        let start = s.position;

        if (++s.position < s.input.length && s.input[s.position] === '=') {
            if (++s.position < s.input.length && s.input[s.position] === '=') {
                ++s.position;
                return { kind: TokenKind.ExclamationEqualsEquals, offset: start, length: 3 };
            }
            return { kind: TokenKind.ExclamationEquals, offset: start, length: 2 };
        }

        return { kind: TokenKind.Exclamation, offset: start, length: 1 };
    }

    function scriptingPlus(s: LexerState) {

        let start = s.position;

        if (++s.position < s.input.length) {

            switch (s.input[s.position]) {
                case '=':
                    ++s.position;
                    return { kind: TokenKind.PlusEquals, offset: start, length: 2 };
                case '+':
                    ++s.position;
                    return { kind: TokenKind.PlusPlus, offset: start, length: 2 };
                default:
                    break;

            }

        }

        return { kind: TokenKind.Plus, offset: start, length: 1 };

    }

    function scriptingEquals(s: LexerState) {

        let start = s.position;

        if (++s.position < s.input.length) {
            switch (s.input[s.position]) {
                case '=':
                    if (++s.position < s.input.length && s.input[s.position] === '=') {
                        ++s.position;
                        return { kind: TokenKind.EqualsEqualsEquals, offset: start, length: 3 };
                    }
                    return { kind: TokenKind.EqualsEquals, offset: start, length: 2 };
                case '>':
                    ++s.position;
                    return { kind: TokenKind.FatArrow, offset: start, length: 2 };
                default:
                    break;
            }
        }

        return { kind: TokenKind.Equals, offset: start, length: 1 };
    }

    function scriptingDot(s: LexerState) {
        let start = s.position;

        if (++s.position < s.input.length) {
            let c = s.input[s.position];
            if (c === '=') {
                ++s.position;
                return { kind: TokenKind.DotEquals, offset: start, length: 2 };
            } else if (c === '.' && s.position + 1 < s.input.length && s.input[s.position + 1] === '.') {
                s.position += 2;
                return { kind: TokenKind.Ellipsis, offset: start, length: 3 };
            } else if (c >= '0' && c <= '9') {
                //float
                return scriptingNumericStartingWithDotOrE(s, start, true);
            }
        }
        return { kind: TokenKind.Dot, offset: start, length: 1 };
    }

    function scriptingMinus(s: LexerState) {

        let start = s.position;

        if (++s.position < s.input.length) {

            switch (s.input[s.position]) {
                case '>':
                    ++s.position;
                    s.modeStack.push(LexerMode.LookingForProperty);
                    return { kind: TokenKind.Arrow, offset: start, length: 2 };
                case '-':
                    ++s.position;
                    return { kind: TokenKind.MinusMinus, offset: start, length: 2 };
                case '=':
                    ++s.position;
                    return { kind: TokenKind.MinusEquals, offset: start, length: 2 };
                default:
                    break;
            }

        }

        return { kind: TokenKind.Minus, offset: start, length: 1 };
    }

}

export function tokenKindToString(type: TokenKind) {
    switch (type) {
        case TokenKind.Unknown:
            return 'Unknown';
        case TokenKind.EndOfFile:
            return 'EndOfFile';
        case TokenKind.Abstract:
            return 'Abstract';
        case TokenKind.Array:
            return 'Array';
        case TokenKind.As:
            return 'As';
        case TokenKind.Break:
            return 'Break';
        case TokenKind.Callable:
            return 'Callable';
        case TokenKind.Case:
            return 'Case';
        case TokenKind.Catch:
            return 'Catch';
        case TokenKind.Class:
            return 'Class';
        case TokenKind.ClassConstant:
            return 'ClassConstant';
        case TokenKind.Clone:
            return 'Clone';
        case TokenKind.Const:
            return 'Const';
        case TokenKind.Continue:
            return 'Continue';
        case TokenKind.Declare:
            return 'Declare';
        case TokenKind.Default:
            return 'Default';
        case TokenKind.Do:
            return 'Do';
        case TokenKind.Echo:
            return 'Echo';
        case TokenKind.Else:
            return 'Else';
        case TokenKind.ElseIf:
            return 'ElseIf';
        case TokenKind.Empty:
            return 'Empty';
        case TokenKind.EndDeclare:
            return 'EndDeclare';
        case TokenKind.EndFor:
            return 'EndFor';
        case TokenKind.EndForeach:
            return 'EndForeach';
        case TokenKind.EndIf:
            return 'EndIf';
        case TokenKind.EndSwitch:
            return 'EndSwitch';
        case TokenKind.EndWhile:
            return 'EndWhile';
        case TokenKind.EndHeredoc:
            return 'EndHeredoc';
        case TokenKind.Eval:
            return 'Eval';
        case TokenKind.Exit:
            return 'Exit';
        case TokenKind.Extends:
            return 'Extends';
        case TokenKind.Final:
            return 'Final';
        case TokenKind.Finally:
            return 'Finally';
        case TokenKind.For:
            return 'For';
        case TokenKind.ForEach:
            return 'ForEach';
        case TokenKind.Function:
            return 'Function';
        case TokenKind.Global:
            return 'Global';
        case TokenKind.Goto:
            return 'Goto';
        case TokenKind.HaltCompiler:
            return 'HaltCompiler';
        case TokenKind.If:
            return 'If';
        case TokenKind.Implements:
            return 'Implements';
        case TokenKind.Include:
            return 'Include';
        case TokenKind.IncludeOnce:
            return 'IncludeOnce';
        case TokenKind.InstanceOf:
            return 'InstanceOf';
        case TokenKind.InsteadOf:
            return 'InsteadOf';
        case TokenKind.Interface:
            return 'Interface';
        case TokenKind.Isset:
            return 'Isset';
        case TokenKind.List:
            return 'List';
        case TokenKind.And:
            return 'And';
        case TokenKind.Or:
            return 'Or';
        case TokenKind.Xor:
            return 'Xor';
        case TokenKind.Namespace:
            return 'Namespace';
        case TokenKind.New:
            return 'New';
        case TokenKind.Print:
            return 'Print';
        case TokenKind.Private:
            return 'Private';
        case TokenKind.Public:
            return 'Public';
        case TokenKind.Protected:
            return 'Protected';
        case TokenKind.Require:
            return 'Require';
        case TokenKind.RequireOnce:
            return 'RequireOnce';
        case TokenKind.Return:
            return 'Return';
        case TokenKind.Static:
            return 'Static';
        case TokenKind.Switch:
            return 'Switch';
        case TokenKind.Throw:
            return 'Throw';
        case TokenKind.Trait:
            return 'Trait';
        case TokenKind.Try:
            return 'Try';
        case TokenKind.Unset:
            return 'Unset';
        case TokenKind.Use:
            return 'Use';
        case TokenKind.Var:
            return 'Var';
        case TokenKind.While:
            return 'While';
        case TokenKind.Yield:
            return 'Yield';
        case TokenKind.YieldFrom:
            return 'YieldFrom';
        case TokenKind.DirectoryConstant:
            return 'DirectoryConstant';
        case TokenKind.FileConstant:
            return 'FileConstant';
        case TokenKind.LineConstant:
            return 'LineConstant';
        case TokenKind.FunctionConstant:
            return 'FunctionConstant';
        case TokenKind.MethodConstant:
            return 'MethodConstant';
        case TokenKind.NamespaceConstant:
            return 'NamespaceConstant';
        case TokenKind.TraitConstant:
            return 'TraitConstant';
        case TokenKind.StringLiteral:
            return 'StringLiteral';
        case TokenKind.FloatingLiteral:
            return 'FloatingLiteral';
        case TokenKind.EncapsulatedAndWhitespace:
            return 'EncapsulatedAndWhitespace';
        case TokenKind.Text:
            return 'Text';
        case TokenKind.IntegerLiteral:
            return 'IntegerLiteral';
        case TokenKind.Name:
            return 'Name';
        case TokenKind.VariableName:
            return 'VariableName';
        case TokenKind.Equals:
            return 'Equals';
        case TokenKind.Tilde:
            return 'Tilde';
        case TokenKind.Colon:
            return 'Colon';
        case TokenKind.Semicolon:
            return 'Semicolon';
        case TokenKind.Exclamation:
            return 'Exclamation';
        case TokenKind.Dollar:
            return 'Dollar';
        case TokenKind.ForwardSlash:
            return 'ForwardSlash';
        case TokenKind.Percent:
            return 'Percent';
        case TokenKind.Comma:
            return 'Comma';
        case TokenKind.AtSymbol:
            return 'AtSymbol';
        case TokenKind.Backtick:
            return 'Backtick';
        case TokenKind.Question:
            return 'Question';
        case TokenKind.DoubleQuote:
            return 'DoubleQuote';
        case TokenKind.SingleQuote:
            return 'SingleQuote';
        case TokenKind.LessThan:
            return 'LessThan';
        case TokenKind.GreaterThan:
            return 'GreaterThan';
        case TokenKind.Asterisk:
            return 'Asterisk';
        case TokenKind.AmpersandAmpersand:
            return 'AmpersandAmpersand';
        case TokenKind.Ampersand:
            return 'Ampersand';
        case TokenKind.AmpersandEquals:
            return 'AmpersandEquals';
        case TokenKind.CaretEquals:
            return 'CaretEquals';
        case TokenKind.LessThanLessThan:
            return 'LessThanLessThan';
        case TokenKind.LessThanLessThanEquals:
            return 'LessThanLessThanEquals';
        case TokenKind.GreaterThanGreaterThan:
            return 'GreaterThanGreaterThan';
        case TokenKind.GreaterThanGreaterThanEquals:
            return 'GreaterThanGreaterThanEquals';
        case TokenKind.BarEquals:
            return 'BarEquals';
        case TokenKind.Plus:
            return 'Plus';
        case TokenKind.PlusEquals:
            return 'PlusEquals';
        case TokenKind.AsteriskAsterisk:
            return 'AsteriskAsterisk';
        case TokenKind.AsteriskAsteriskEquals:
            return 'AsteriskAsteriskEquals';
        case TokenKind.Arrow:
            return 'Arrow';
        case TokenKind.OpenBrace:
            return 'OpenBrace';
        case TokenKind.OpenBracket:
            return 'OpenBracket';
        case TokenKind.OpenParenthesis:
            return 'OpenParenthesis';
        case TokenKind.CloseBrace:
            return 'CloseBrace';
        case TokenKind.CloseBracket:
            return 'CloseBracket';
        case TokenKind.CloseParenthesis:
            return 'CloseParenthesis';
        case TokenKind.QuestionQuestion:
            return 'QuestionQuestion';
        case TokenKind.Bar:
            return 'Bar';
        case TokenKind.BarBar:
            return 'BarBar';
        case TokenKind.Caret:
            return 'Caret';
        case TokenKind.Dot:
            return 'Dot';
        case TokenKind.DotEquals:
            return 'DotEquals';
        case TokenKind.CurlyOpen:
            return 'CurlyOpen';
        case TokenKind.MinusMinus:
            return 'MinusMinus';
        case TokenKind.ForwardslashEquals:
            return 'ForwardslashEquals';
        case TokenKind.DollarCurlyOpen:
            return 'DollarCurlyOpen';
        case TokenKind.FatArrow:
            return 'FatArrow';
        case TokenKind.ColonColon:
            return 'ColonColon';
        case TokenKind.Ellipsis:
            return 'Ellipsis';
        case TokenKind.PlusPlus:
            return 'PlusPlus';
        case TokenKind.EqualsEquals:
            return 'EqualsEquals';
        case TokenKind.GreaterThanEquals:
            return 'GreaterThanEquals';
        case TokenKind.EqualsEqualsEquals:
            return 'EqualsEqualsEquals';
        case TokenKind.ExclamationEquals:
            return 'ExclamationEquals';
        case TokenKind.ExclamationEqualsEquals:
            return 'ExclamationEqualsEquals';
        case TokenKind.LessThanEquals:
            return 'LessThanEquals';
        case TokenKind.Spaceship:
            return 'Spaceship';
        case TokenKind.Minus:
            return 'Minus';
        case TokenKind.MinusEquals:
            return 'MinusEquals';
        case TokenKind.PercentEquals:
            return 'PercentEquals';
        case TokenKind.AsteriskEquals:
            return 'AsteriskEquals';
        case TokenKind.Backslash:
            return 'Backslash';
        case TokenKind.BooleanCast:
            return 'BooleanCast';
        case TokenKind.UnsetCast:
            return 'UnsetCast';
        case TokenKind.StringCast:
            return 'StringCast';
        case TokenKind.ObjectCast:
            return 'ObjectCast';
        case TokenKind.IntegerCast:
            return 'IntegerCast';
        case TokenKind.FloatCast:
            return 'FloatCast';
        case TokenKind.StartHeredoc:
            return 'StartHeredoc';
        case TokenKind.ArrayCast:
            return 'ArrayCast';
        case TokenKind.OpenTag:
            return 'OpenTag';
        case TokenKind.OpenTagEcho:
            return 'OpenTagEcho';
        case TokenKind.CloseTag:
            return 'CloseTag';
        case TokenKind.Comment:
            return 'Comment';
        case TokenKind.DocumentComment:
            return 'DocumentComment';
        case TokenKind.Whitespace:
            return 'Whitespace';
    }
}