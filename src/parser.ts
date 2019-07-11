/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */

'use strict';

import { Token, Lexer, TokenKind, LexerMode } from './lexer';
import {
    ParseError,
    Phrase,
    PhraseKind,
} from './phrase';

export namespace Parser {

    interface Predicate {
        (t: Token): boolean;
    }

    const enum Associativity {
        None,
        Left,
        Right
    }

    function precedenceAssociativityTuple(t: Token) {
        switch (t.kind) {
            case TokenKind.AsteriskAsterisk:
                return [48, Associativity.Right];
            case TokenKind.PlusPlus:
                return [47, Associativity.Right];
            case TokenKind.MinusMinus:
                return [47, Associativity.Right];
            case TokenKind.Tilde:
                return [47, Associativity.Right];
            case TokenKind.IntegerCast:
                return [47, Associativity.Right];
            case TokenKind.FloatCast:
                return [47, Associativity.Right];
            case TokenKind.StringCast:
                return [47, Associativity.Right];
            case TokenKind.ArrayCast:
                return [47, Associativity.Right];
            case TokenKind.ObjectCast:
                return [47, Associativity.Right];
            case TokenKind.BooleanCast:
                return [47, Associativity.Right];
            case TokenKind.UnsetCast:
                return [47, Associativity.Right];
            case TokenKind.AtSymbol:
                return [47, Associativity.Right];
            case TokenKind.InstanceOf:
                return [46, Associativity.None];
            case TokenKind.Exclamation:
                return [45, Associativity.Right];
            case TokenKind.Asterisk:
                return [44, Associativity.Left];
            case TokenKind.ForwardSlash:
                return [44, Associativity.Left];
            case TokenKind.Percent:
                return [44, Associativity.Left];
            case TokenKind.Plus:
                return [43, Associativity.Left];
            case TokenKind.Minus:
                return [43, Associativity.Left];
            case TokenKind.Dot:
                return [43, Associativity.Left];
            case TokenKind.LessThanLessThan:
                return [42, Associativity.Left];
            case TokenKind.GreaterThanGreaterThan:
                return [42, Associativity.Left];
            case TokenKind.LessThan:
                return [41, Associativity.None];
            case TokenKind.GreaterThan:
                return [41, Associativity.None];
            case TokenKind.LessThanEquals:
                return [41, Associativity.None];
            case TokenKind.GreaterThanEquals:
                return [41, Associativity.None];
            case TokenKind.EqualsEquals:
                return [40, Associativity.None];
            case TokenKind.EqualsEqualsEquals:
                return [40, Associativity.None];
            case TokenKind.ExclamationEquals:
                return [40, Associativity.None];
            case TokenKind.ExclamationEqualsEquals:
                return [40, Associativity.None];
            case TokenKind.Spaceship:
                return [40, Associativity.None];
            case TokenKind.Ampersand:
                return [39, Associativity.Left];
            case TokenKind.Caret:
                return [38, Associativity.Left];
            case TokenKind.Bar:
                return [37, Associativity.Left];
            case TokenKind.AmpersandAmpersand:
                return [36, Associativity.Left];
            case TokenKind.BarBar:
                return [35, Associativity.Left];
            case TokenKind.QuestionQuestion:
                return [34, Associativity.Right];
            case TokenKind.Question:
                return [33, Associativity.Left]; //?: ternary
            case TokenKind.Equals:
                return [32, Associativity.Right];
            case TokenKind.DotEquals:
                return [32, Associativity.Right];
            case TokenKind.PlusEquals:
                return [32, Associativity.Right];
            case TokenKind.MinusEquals:
                return [32, Associativity.Right];
            case TokenKind.AsteriskEquals:
                return [32, Associativity.Right];
            case TokenKind.ForwardslashEquals:
                return [32, Associativity.Right];
            case TokenKind.PercentEquals:
                return [32, Associativity.Right];
            case TokenKind.AsteriskAsteriskEquals:
                return [32, Associativity.Right];
            case TokenKind.AmpersandEquals:
                return [32, Associativity.Right];
            case TokenKind.BarEquals:
                return [32, Associativity.Right];
            case TokenKind.CaretEquals:
                return [32, Associativity.Right];
            case TokenKind.LessThanLessThanEquals:
                return [32, Associativity.Right];
            case TokenKind.GreaterThanGreaterThanEquals:
                return [32, Associativity.Right];
            case TokenKind.And:
                return [31, Associativity.Left];
            case TokenKind.Xor:
                return [30, Associativity.Left];
            case TokenKind.Or:
                return [29, Associativity.Left];
            default:
                throwUnexpectedTokenError(t);

        }
    }

    const statementListRecoverSet = [
        TokenKind.Use,
        TokenKind.HaltCompiler,
        TokenKind.Const,
        TokenKind.Function,
        TokenKind.Class,
        TokenKind.Abstract,
        TokenKind.Final,
        TokenKind.Trait,
        TokenKind.Interface,
        TokenKind.OpenBrace,
        TokenKind.If,
        TokenKind.While,
        TokenKind.Do,
        TokenKind.For,
        TokenKind.Switch,
        TokenKind.Break,
        TokenKind.Continue,
        TokenKind.Return,
        TokenKind.Global,
        TokenKind.Static,
        TokenKind.Echo,
        TokenKind.Unset,
        TokenKind.ForEach,
        TokenKind.Declare,
        TokenKind.Try,
        TokenKind.Throw,
        TokenKind.Goto,
        TokenKind.Semicolon,
        TokenKind.CloseTag,
        TokenKind.OpenTagEcho,
        TokenKind.Text,
        TokenKind.OpenTag
    ];

    const classMemberDeclarationListRecoverSet = [
        TokenKind.Public,
        TokenKind.Protected,
        TokenKind.Private,
        TokenKind.Static,
        TokenKind.Abstract,
        TokenKind.Final,
        TokenKind.Function,
        TokenKind.Var,
        TokenKind.Const,
        TokenKind.Use
    ];

    const encapsulatedVariableListRecoverSet = [
        TokenKind.EncapsulatedAndWhitespace,
        TokenKind.DollarCurlyOpen,
        TokenKind.CurlyOpen
    ];

    function binaryOpToPhraseType(t: Token) {
        switch (t.kind) {
            case TokenKind.Question:
                return PhraseKind.TernaryExpression;
            case TokenKind.Dot:
            case TokenKind.Plus:
            case TokenKind.Minus:
                return PhraseKind.AdditiveExpression;
            case TokenKind.Bar:
            case TokenKind.Ampersand:
            case TokenKind.Caret:
                return PhraseKind.BitwiseExpression;
            case TokenKind.Asterisk:
            case TokenKind.ForwardSlash:
            case TokenKind.Percent:
                return PhraseKind.MultiplicativeExpression;
            case TokenKind.AsteriskAsterisk:
                return PhraseKind.ExponentiationExpression;
            case TokenKind.LessThanLessThan:
            case TokenKind.GreaterThanGreaterThan:
                return PhraseKind.ShiftExpression;
            case TokenKind.AmpersandAmpersand:
            case TokenKind.BarBar:
            case TokenKind.And:
            case TokenKind.Or:
            case TokenKind.Xor:
                return PhraseKind.LogicalExpression;
            case TokenKind.EqualsEqualsEquals:
            case TokenKind.ExclamationEqualsEquals:
            case TokenKind.EqualsEquals:
            case TokenKind.ExclamationEquals:
                return PhraseKind.EqualityExpression;
            case TokenKind.LessThan:
            case TokenKind.LessThanEquals:
            case TokenKind.GreaterThan:
            case TokenKind.GreaterThanEquals:
            case TokenKind.Spaceship:
                return PhraseKind.RelationalExpression;
            case TokenKind.QuestionQuestion:
                return PhraseKind.CoalesceExpression;
            case TokenKind.Equals:
                return PhraseKind.SimpleAssignmentExpression;
            case TokenKind.PlusEquals:
            case TokenKind.MinusEquals:
            case TokenKind.AsteriskEquals:
            case TokenKind.AsteriskAsteriskEquals:
            case TokenKind.ForwardslashEquals:
            case TokenKind.DotEquals:
            case TokenKind.PercentEquals:
            case TokenKind.AmpersandEquals:
            case TokenKind.BarEquals:
            case TokenKind.CaretEquals:
            case TokenKind.LessThanLessThanEquals:
            case TokenKind.GreaterThanGreaterThanEquals:
                return PhraseKind.CompoundAssignmentExpression;
            case TokenKind.InstanceOf:
                return PhraseKind.InstanceOfExpression;
            default:
                return PhraseKind.Unknown;

        }
    }

    var tokenBuffer: Token[];
    var phraseStack: Phrase[];
    var errorPhrase: ParseError;
    var recoverSetStack: TokenKind[][];

    export function parse(text: string): Phrase {

        init(text);
        let stmtList = statementList([TokenKind.EndOfFile]);
        //append trailing hidden tokens
        hidden(stmtList);
        return stmtList;
    }

    function init(text: string, lexerModeStack?: LexerMode[]) {
        Lexer.setInput(text, lexerModeStack);
        phraseStack = [];
        tokenBuffer = [];
        recoverSetStack = [];
        errorPhrase = null;
    }

    function start(phraseType?:PhraseKind, dontPushHiddenToParent?: boolean) {
        //parent node gets hidden tokens between children
        if (!dontPushHiddenToParent) {
            hidden();
        }
        let p: Phrase = {
            kind: phraseType ? phraseType : PhraseKind.Unknown,
            children: []
        }
        phraseStack.push(p);
        return p;
    }

    function end() {
        return phraseStack.pop();
    }

    function hidden(p?:Phrase) {

        if(!p) {
            p = phraseStack[phraseStack.length - 1];
        }
        
        let t: Token;

        while (true) {
            
            t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();
            if (t.kind < TokenKind.Comment) {
                tokenBuffer.unshift(t);
                break;
            } else {
                p.children.push(t);
            }

        }

    }

    function optional(tokenType: TokenKind) {

        if (tokenType === peek().kind) {
            errorPhrase = null;
            return next();
        } else {
            return null;
        }

    }

    function optionalOneOf(tokenTypes: TokenKind[]) {

        if (tokenTypes.indexOf(peek().kind) >= 0) {
            errorPhrase = null;
            return next();
        } else {
            return null;
        }

    }

    function next(doNotPush?: boolean): Token {

        let t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();

        if (t.kind === TokenKind.EndOfFile) {
            return t;
        }

        if (t.kind >= TokenKind.Comment) {
            //hidden token
            phraseStack[phraseStack.length - 1].children.push(t);
            return next(doNotPush);
        } else if (!doNotPush) {
            phraseStack[phraseStack.length - 1].children.push(t);
        }

        return t;

    }

    function expect(tokenType: TokenKind) {

        let t = peek();

        if (t.kind === tokenType) {
            errorPhrase = null;
            return next();
        } else if (tokenType === TokenKind.Semicolon && t.kind === TokenKind.CloseTag) {
            //implicit end statement
            return t;
        } else {
            error(tokenType);
            //test skipping a single token to sync
            if (peek(1).kind === tokenType) {
                let predicate = (x: Token) => { return x.kind === tokenType; };
                skip(predicate);
                errorPhrase = null;
                return next(); //tokenType
            }
            return null;
        }

    }

    function expectOneOf(tokenTypes: TokenKind[]) {

        let t = peek();

        if (tokenTypes.indexOf(t.kind) >= 0) {
            errorPhrase = null;
            return next();
        } else if (tokenTypes.indexOf(TokenKind.Semicolon) >= 0 && t.kind === TokenKind.CloseTag) {
            //implicit end statement
            return t;
        } else {
            error(tokenTypes[0]);
            //test skipping single token to sync
            if (tokenTypes.indexOf(peek(1).kind) >= 0) {
                let predicate = (x: Token) => { return tokenTypes.indexOf(x.kind) >= 0; };
                skip(predicate);
                errorPhrase = null;
                return next(); //tokenType
            }
            return null;
        }

    }

    function peek(n?: number) {

        let k = n ? n + 1 : 1;
        let bufferPos = -1;
        let t: Token;

        while (true) {
            
            ++bufferPos;
            if (bufferPos === tokenBuffer.length) {
                tokenBuffer.push(Lexer.lex());
            }

            t = tokenBuffer[bufferPos];

            if (t.kind < TokenKind.Comment) {
                //not a hidden token
                --k;
            }

            if (t.kind === TokenKind.EndOfFile || k === 0) {
                break;
            }

        }

        return t;
    }

    /**
     * skipped tokens get pushed to error phrase children
     */
    function skip(predicate: Predicate) {

        let t: Token;

        while (true) {
            t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();

            if (predicate(t) || t.kind === TokenKind.EndOfFile) {
                tokenBuffer.unshift(t);
                break;
            } else {
                errorPhrase.children.push(t);
            }
        }

    }

    function error(expected?:TokenKind) {

        //dont report errors if recovering from another
        if (errorPhrase) {
            return;
        }

        errorPhrase = <ParseError>{
            kind : PhraseKind.Error,
            children:[],
            unexpected: peek()
        };

        if(expected) {
            errorPhrase.expected = expected;
        }

        phraseStack[phraseStack.length - 1].children.push(errorPhrase);

    }

    function list(phraseType: PhraseKind, elementFunction: () => Phrase | Token,
        elementStartPredicate: Predicate, breakOn?: TokenKind[], recoverSet?: TokenKind[]) {

        let p = start(phraseType);

        let t: Token;
        let recoveryAttempted = false;
        let listRecoverSet = recoverSet ? recoverSet.slice(0) : [];

        if (breakOn) {
            Array.prototype.push.apply(listRecoverSet, breakOn);
        }

        recoverSetStack.push(listRecoverSet);

        while (true) {
            
            t = peek();
            
            if (elementStartPredicate(t)) {
                recoveryAttempted = false;
                p.children.push(elementFunction());
            } else if (!breakOn || breakOn.indexOf(t.kind) >= 0 || recoveryAttempted) {
                break;
            } else {
                error();
                //attempt to sync with token stream
                t = peek(1);
                if (elementStartPredicate(t) || breakOn.indexOf(t.kind) >= 0) {
                    skip((x) => { return x === t });
                } else {
                    defaultSyncStrategy();
                }
                recoveryAttempted = true;
            }

        }

        recoverSetStack.pop();

        return end();

    }

    function defaultSyncStrategy() {

        let mergedRecoverTokenTypeArray: TokenKind[] = [];

        for (let n = recoverSetStack.length - 1; n >= 0; --n) {
            Array.prototype.push.apply(mergedRecoverTokenTypeArray, recoverSetStack[n]);
        }

        let mergedRecoverTokenTypeSet = new Set(mergedRecoverTokenTypeArray);
        let predicate: Predicate = (x) => { return mergedRecoverTokenTypeSet.has(x.kind); };
        skip(predicate);

    }
/*
    function isListPhrase(phraseType: PhraseType) {
        switch (phraseType) {
            case PhraseType.StatementList:
                return true;
            default:
                false;
        }
    }
*/
    function statementList(breakOn: TokenKind[]) {

        return list(
            PhraseKind.StatementList,
            statement,
            isStatementStart,
            breakOn,
            statementListRecoverSet);

    }

    function constDeclaration() {

        let p = start(PhraseKind.ConstDeclaration);
        next(); //const
        p.children.push(delimitedList(
            PhraseKind.ConstElementList,
            constElement,
            isConstElementStartToken,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        ));
        expect(TokenKind.Semicolon);
        return end();

    }

    function isClassConstElementStartToken(t: Token) {
        return t.kind === TokenKind.Name || isSemiReservedToken(t);
    }

    function isConstElementStartToken(t: Token) {
        return t.kind === TokenKind.Name;
    }

    function constElement() {

        let p = start(PhraseKind.ConstElement);
        expect(TokenKind.Name);
        expect(TokenKind.Equals);
        p.children.push(expression(0));
        return end();

    }

    function expression(minPrecedence: number) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let lhs = expressionAtom();
        let p: Phrase;
        let rhs: Phrase | Token;
        let binaryPhraseType: PhraseKind;

        while (true) {
            
            op = peek();
            binaryPhraseType = binaryOpToPhraseType(op);

            if (binaryPhraseType === PhraseKind.Unknown) {
                break;
            }

            [precedence, associativity] = precedenceAssociativityTuple(op);

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }


            if (binaryPhraseType === PhraseKind.TernaryExpression) {
                lhs = ternaryExpression(lhs);
                continue;
            }

            p = start(binaryPhraseType, true);
            p.children.push(lhs);
            next();

            if (binaryPhraseType === PhraseKind.InstanceOfExpression) {
                p.children.push(typeDesignator(PhraseKind.InstanceofTypeDesignator));
            } else {
                if (binaryPhraseType === PhraseKind.SimpleAssignmentExpression &&
                    peek().kind === TokenKind.Ampersand) {
                    next(); //&
                    p.kind = PhraseKind.ByRefAssignmentExpression;
                }
                p.children.push(expression(precedence));
            }

            lhs = end();

        }

        return lhs;

    }

    function ternaryExpression(testExpr: Phrase | Token) {

        let p = start(PhraseKind.TernaryExpression,true);
        p.children.push(testExpr);
        next(); //?

        if (optional(TokenKind.Colon)) {
            p.children.push(expression(0));
        } else {
            p.children.push(expression(0));
            expect(TokenKind.Colon);
            p.children.push(expression(0));
        }

        return end();
    }


    function variableOrExpression() {

        let part = variableAtom();
        let isVariable = (<Phrase>part).kind === PhraseKind.SimpleVariable;

        if (isDereferenceOperator(peek())) {
            part = variable(part);
            isVariable = true;
        } else {

            switch ((<Phrase>part).kind) {
                case PhraseKind.QualifiedName:
                case PhraseKind.FullyQualifiedName:
                case PhraseKind.RelativeQualifiedName:
                    part = constantAccessExpression(part);
                    break;
                default:
                    break;
            }

        }

        if (!isVariable) {
            return part;
        }

        //check for post increment/decrement
        let t = peek();
        if (t.kind === TokenKind.PlusPlus) {
            return postfixExpression(PhraseKind.PostfixIncrementExpression, <Phrase>part);
        } else if (t.kind === TokenKind.MinusMinus) {
            return postfixExpression(PhraseKind.PostfixDecrementExpression, <Phrase>part);
        } else {
            return part;
        }

    }

    function constantAccessExpression(qName: Phrase | Token) {
        let p = start(PhraseKind.ConstantAccessExpression, true);
        p.children.push(qName);
        return end();
    }

    function postfixExpression(phraseType: PhraseKind, variableNode: Phrase) {
        let p = start(phraseType,true);
        p.children.push(variableNode);
        next(); //operator
        return end();
    }

    function isDereferenceOperator(t: Token) {
        switch (t.kind) {
            case TokenKind.OpenBracket:
            case TokenKind.OpenBrace:
            case TokenKind.Arrow:
            case TokenKind.OpenParenthesis:
            case TokenKind.ColonColon:
                return true;
            default:
                return false;
        }
    }

    function expressionAtom() {

        let t = peek();

        switch (t.kind) {
            case TokenKind.Static:
                if (peek(1).kind === TokenKind.Function) {
                    return anonymousFunctionCreationExpression();
                } else {
                    return variableOrExpression();
                }
            case TokenKind.StringLiteral:
                if (isDereferenceOperator(peek(1))) {
                    return variableOrExpression();
                } else {
                    return next(true);
                }
            case TokenKind.VariableName:
            case TokenKind.Dollar:
            case TokenKind.Array:
            case TokenKind.OpenBracket:
            case TokenKind.Backslash:
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.OpenParenthesis:
                return variableOrExpression();
            case TokenKind.PlusPlus:
                return unaryExpression(PhraseKind.PrefixIncrementExpression);
            case TokenKind.MinusMinus:
                return unaryExpression(PhraseKind.PrefixDecrementExpression);
            case TokenKind.Plus:
            case TokenKind.Minus:
            case TokenKind.Exclamation:
            case TokenKind.Tilde:
                return unaryExpression(PhraseKind.UnaryOpExpression);
            case TokenKind.AtSymbol:
                return unaryExpression(PhraseKind.ErrorControlExpression);
            case TokenKind.IntegerCast:
            case TokenKind.FloatCast:
            case TokenKind.StringCast:
            case TokenKind.ArrayCast:
            case TokenKind.ObjectCast:
            case TokenKind.BooleanCast:
            case TokenKind.UnsetCast:
                return unaryExpression(PhraseKind.CastExpression);
            case TokenKind.List:
                return listIntrinsic();
            case TokenKind.Clone:
                return cloneExpression();
            case TokenKind.New:
                return objectCreationExpression();
            case TokenKind.FloatingLiteral:
            case TokenKind.IntegerLiteral:
            case TokenKind.LineConstant:
            case TokenKind.FileConstant:
            case TokenKind.DirectoryConstant:
            case TokenKind.TraitConstant:
            case TokenKind.MethodConstant:
            case TokenKind.FunctionConstant:
            case TokenKind.NamespaceConstant:
            case TokenKind.ClassConstant:
                return next(true);
            case TokenKind.StartHeredoc:
                return heredocStringLiteral();
            case TokenKind.DoubleQuote:
                return doubleQuotedStringLiteral();
            case TokenKind.Backtick:
                return shellCommandExpression();
            case TokenKind.Print:
                return printIntrinsic();
            case TokenKind.Yield:
                return yieldExpression();
            case TokenKind.YieldFrom:
                return yieldFromExpression();
            case TokenKind.Function:
                return anonymousFunctionCreationExpression();
            case TokenKind.Include:
                return scriptInclusion(PhraseKind.IncludeExpression);
            case TokenKind.IncludeOnce:
                return scriptInclusion(PhraseKind.IncludeOnceExpression);
            case TokenKind.Require:
                return scriptInclusion(PhraseKind.RequireExpression);
            case TokenKind.RequireOnce:
                return scriptInclusion(PhraseKind.RequireOnceExpression);
            case TokenKind.Eval:
                return evalIntrinsic();
            case TokenKind.Empty:
                return emptyIntrinsic();
            case TokenKind.Exit:
                return exitIntrinsic();
            case TokenKind.Isset:
                return issetIntrinsic();
            default:
                //error
                start(PhraseKind.Error);
                error();
                return end();
        }

    }

    function exitIntrinsic() {
        let p = start(PhraseKind.ExitIntrinsic);
        next(); //exit or die
        if (optional(TokenKind.OpenParenthesis)) {
            if (isExpressionStart(peek())) {
                p.children.push(expression(0));
            }
            expect(TokenKind.CloseParenthesis);
        }
        return end();
    }

    function issetIntrinsic() {

        let p = start(PhraseKind.IssetIntrinsic);
        next(); //isset
        expect(TokenKind.OpenParenthesis);
        p.children.push(variableList([TokenKind.CloseParenthesis]));
        expect(TokenKind.CloseParenthesis);
        return end();

    }

    function emptyIntrinsic() {

        let p = start(PhraseKind.EmptyIntrinsic);
        next(); //keyword
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);
        return end();

    }

    function evalIntrinsic() {

        let p = start(PhraseKind.EvalIntrinsic);
        next(); //keyword
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);
        return end();

    }

    function scriptInclusion(phraseType: PhraseKind) {

        let p = start(phraseType);
        next(); //keyword
        p.children.push(expression(0));
        return end();
    }

    function printIntrinsic() {

        let p = start(PhraseKind.PrintIntrinsic);
        next(); //keyword
        p.children.push(expression(0));
        return end();
    }

    function yieldFromExpression() {

        let p = start(PhraseKind.YieldFromExpression);
        next(); //keyword
        p.children.push(expression(0));
        return end();
    }

    function yieldExpression() {

        let p = start(PhraseKind.YieldExpression);
        next(); //yield

        if (!isExpressionStart(peek())) {
            return end();
        }

        let keyOrValue = expression(0);
        p.children.push(keyOrValue);

        if (optional(TokenKind.FatArrow)) {
            p.children.push(expression(0));
        }

        return end();

    }

    function shellCommandExpression() {

        let p = start(PhraseKind.ShellCommandExpression);
        next(); //`
        p.children.push(encapsulatedVariableList(TokenKind.Backtick));
        expect(TokenKind.Backtick);
        return end();

    }

    function doubleQuotedStringLiteral() {

        let p = start(PhraseKind.DoubleQuotedStringLiteral);
        next(); //"
        p.children.push(encapsulatedVariableList(TokenKind.DoubleQuote));
        expect(TokenKind.DoubleQuote);
        return end();

    }

    function encapsulatedVariableList(breakOn: TokenKind) {

        return list(
            PhraseKind.EncapsulatedVariableList,
            encapsulatedVariable,
            isEncapsulatedVariableStart,
            [breakOn],
            encapsulatedVariableListRecoverSet
        );

    }

    function isEncapsulatedVariableStart(t: Token) {

        switch (t.kind) {
            case TokenKind.EncapsulatedAndWhitespace:
            case TokenKind.VariableName:
            case TokenKind.DollarCurlyOpen:
            case TokenKind.CurlyOpen:
                return true;
            default:
                return false;
        }

    }

    function encapsulatedVariable() {

        switch (peek().kind) {
            case TokenKind.EncapsulatedAndWhitespace:
                return next(true);
            case TokenKind.VariableName:
                let t = peek(1);
                if (t.kind === TokenKind.OpenBracket) {
                    return encapsulatedDimension();
                } else if (t.kind === TokenKind.Arrow) {
                    return encapsulatedProperty();
                } else {
                    return simpleVariable();
                }
            case TokenKind.DollarCurlyOpen:
                return dollarCurlyOpenEncapsulatedVariable();
            case TokenKind.CurlyOpen:
                return curlyOpenEncapsulatedVariable();
            default:
                throwUnexpectedTokenError(peek());
        }

    }

    function curlyOpenEncapsulatedVariable() {

        let p = start(PhraseKind.EncapsulatedVariable);
        next(); //{
        p.children.push(variable(variableAtom()));
        expect(TokenKind.CloseBrace);
        return end();

    }

    function dollarCurlyOpenEncapsulatedVariable() {

        let p = start(PhraseKind.EncapsulatedVariable);
        next(); //${
        let t = peek();

        if (t.kind === TokenKind.VariableName) {

            if (peek(1).kind === TokenKind.OpenBracket) {
                p.children.push(dollarCurlyEncapsulatedDimension());
            } else {
                let sv = start(PhraseKind.SimpleVariable);
                next();
                p.children.push(end());
            }

        } else if (isExpressionStart(t)) {
            p.children.push(expression(0));
        } else {
            error();
        }

        expect(TokenKind.CloseBrace);
        return end();
    }

    function dollarCurlyEncapsulatedDimension() {
        let p = start(PhraseKind.SubscriptExpression);
        next(); //VariableName
        next(); // [
        p.children.push(expression(0));
        expect(TokenKind.CloseBracket);
        return end();
    }

    function encapsulatedDimension() {

        let p = start(PhraseKind.SubscriptExpression);

        p.children.push(simpleVariable()); //T_VARIABLE
        next(); //[

        switch (peek().kind) {
            case TokenKind.Name:
            case TokenKind.IntegerLiteral:
                next();
                break;
            case TokenKind.VariableName:
                p.children.push(simpleVariable());
                break;
            case TokenKind.Minus:
                let u = start(PhraseKind.UnaryOpExpression);
                next(); //-
                expect(TokenKind.IntegerLiteral);
                p.children.push(end());
                break;
            default:
                //error
                error();
                break;
        }

        expect(TokenKind.CloseBracket);
        return end();

    }

    function encapsulatedProperty() {
        let p = start(PhraseKind.PropertyAccessExpression);
        p.children.push(simpleVariable());
        next(); //->
        expect(TokenKind.Name);
        return end();
    }

    function heredocStringLiteral() {

        let p = start(PhraseKind.HeredocStringLiteral);
        next(); //StartHeredoc
        p.children.push(encapsulatedVariableList(TokenKind.EndHeredoc));
        expect(TokenKind.EndHeredoc);
        return end();

    }

    function anonymousClassDeclaration() {

        let p = start(PhraseKind.AnonymousClassDeclaration);
        p.children.push(anonymousClassDeclarationHeader());
        p.children.push(typeDeclarationBody(
            PhraseKind.ClassDeclarationBody, isClassMemberStart, classMemberDeclarationList
        ));
        return end();

    }

    function anonymousClassDeclarationHeader() {

        let p = start(PhraseKind.AnonymousClassDeclarationHeader);
        next(); //class

        if (optional(TokenKind.OpenParenthesis)) {

            if (isArgumentStart(peek())) {
                p.children.push(argumentList());
            }
            expect(TokenKind.CloseParenthesis);
        }

        if (peek().kind === TokenKind.Extends) {
            p.children.push(classBaseClause());
        }

        if (peek().kind === TokenKind.Implements) {
            p.children.push(classInterfaceClause());
        }

        return end();

    }

    function classInterfaceClause() {

        let p = start(PhraseKind.ClassInterfaceClause);
        next(); //implements
        p.children.push(qualifiedNameList([TokenKind.OpenBrace]));
        return end();

    }

    function classMemberDeclarationList() {

        return list(
            PhraseKind.ClassMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenKind.CloseBrace],
            classMemberDeclarationListRecoverSet
        );

    }

    function isClassMemberStart(t: Token) {
        switch (t.kind) {
            case TokenKind.Public:
            case TokenKind.Protected:
            case TokenKind.Private:
            case TokenKind.Static:
            case TokenKind.Abstract:
            case TokenKind.Final:
            case TokenKind.Function:
            case TokenKind.Var:
            case TokenKind.Const:
            case TokenKind.Use:
                return true;
            default:
                return false;
        }
    }

    function classMemberDeclaration() {

        let p = start(PhraseKind.Error);
        let t = peek();

        switch (t.kind) {
            case TokenKind.Public:
            case TokenKind.Protected:
            case TokenKind.Private:
            case TokenKind.Static:
            case TokenKind.Abstract:
            case TokenKind.Final:
                let modifiers = memberModifierList();
                t = peek();
                if (t.kind === TokenKind.VariableName) {
                    p.children.push(modifiers);
                    return propertyDeclaration(p);
                } else if (t.kind === TokenKind.Function) {
                    return methodDeclaration(p, modifiers);
                } else if (t.kind === TokenKind.Const) {
                    p.children.push(modifiers);
                    return classConstDeclaration(p);
                } else {
                    //error
                    p.children.push(modifiers);
                    error();
                    return end();
                }
            case TokenKind.Function:
                return methodDeclaration(p, null);
            case TokenKind.Var:
                next();
                return propertyDeclaration(p);
            case TokenKind.Const:
                return classConstDeclaration(p);
            case TokenKind.Use:
                return traitUseClause(p);
            default:
                //should not get here
                throwUnexpectedTokenError(t);
        }

    }

    function throwUnexpectedTokenError(t: Token) {
        throw new Error(`Unexpected token: ${t.kind}`);
    }

    function traitUseClause(p: Phrase) {
        p.kind = PhraseKind.TraitUseClause;
        next(); //use
        p.children.push(qualifiedNameList([TokenKind.Semicolon, TokenKind.OpenBrace]));
        p.children.push(traitUseSpecification());
        return end();

    }

    function traitUseSpecification() {

        let p = start(PhraseKind.TraitUseSpecification);
        let t = expectOneOf([TokenKind.Semicolon, TokenKind.OpenBrace]);

        if (t && t.kind === TokenKind.OpenBrace) {
            if (isTraitAdaptationStart(peek())) {
                p.children.push(traitAdaptationList());
            }
            expect(TokenKind.CloseBrace);
        }

        return end();

    }

    function traitAdaptationList() {

        return list(
            PhraseKind.TraitAdaptationList,
            traitAdaptation,
            isTraitAdaptationStart,
            [TokenKind.CloseBrace],

        );

    }

    function isTraitAdaptationStart(t: Token) {
        switch (t.kind) {
            case TokenKind.Name:
            case TokenKind.Backslash:
            case TokenKind.Namespace:
                return true;
            default:
                return isSemiReservedToken(t);
        }
    }

    function traitAdaptation() {

        let p = start(PhraseKind.Error);
        let t = peek();
        let t2 = peek(1);

        if (t.kind === TokenKind.Namespace ||
            t.kind === TokenKind.Backslash ||
            (t.kind === TokenKind.Name &&
                (t2.kind === TokenKind.ColonColon || t2.kind === TokenKind.Backslash))) {

            p.children.push(methodReference());

            if (peek().kind === TokenKind.InsteadOf) {
                next();
                return traitPrecedence(p);
            }

        } else if (t.kind === TokenKind.Name || isSemiReservedToken(t)) {

            let methodRef = start(PhraseKind.MethodReference);
            methodRef.children.push(identifier());
            p.children.push(end());
        } else {
            //error
            error();
            return end();
        }

        return traitAlias(p);


    }

    function traitAlias(p: Phrase) {

        p.kind = PhraseKind.TraitAlias;
        expect(TokenKind.As);

        let t = peek();

        if (t.kind === TokenKind.Name || isReservedToken(t)) {
            p.children.push(identifier());
        } else if (isMemberModifier(t)) {
            next();
            t = peek();
            if (t.kind === TokenKind.Name || isSemiReservedToken(t)) {
                p.children.push(identifier());
            }
        } else {
            error();
        }

        expect(TokenKind.Semicolon);
        return end();

    }

    function traitPrecedence(p: Phrase) {

        p.kind = PhraseKind.TraitPrecedence;
        p.children.push(qualifiedNameList([TokenKind.Semicolon]));
        expect(TokenKind.Semicolon);
        return end();

    }

    function methodReference() {

        let p = start(PhraseKind.MethodReference);
        p.children.push(qualifiedName());
        expect(TokenKind.ColonColon);
        p.children.push(identifier());
        return end();

    }

    function methodDeclarationHeader(memberModifers: Phrase) {

        let p = start(PhraseKind.MethodDeclarationHeader, true);
        if (memberModifers) {
            p.children.push(memberModifers);
        }
        p.children.push(expect(TokenKind.Function));
        optional(TokenKind.Ampersand);
        p.children.push(identifier());
        expect(TokenKind.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(delimitedList(
                PhraseKind.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenKind.Comma,
                [TokenKind.CloseParenthesis]
            ));
        }

        expect(TokenKind.CloseParenthesis);

        if (peek().kind === TokenKind.Colon) {
            p.children.push(returnType());
        }

        return end();

    }

    function methodDeclaration(p: Phrase, memberModifers: Phrase) {

        p.kind = PhraseKind.MethodDeclaration;
        p.children.push(methodDeclarationHeader(memberModifers));
        p.children.push(methodDeclarationBody());
        return end();

    }

    function methodDeclarationBody() {
        let p = start(PhraseKind.MethodDeclarationBody);

        if (peek().kind === TokenKind.Semicolon) {
            next();
        } else {
            p.children.push(compoundStatement());
        }
        return end();
    }

    function identifier() {
        let p = start(PhraseKind.Identifier);
        let t = peek();
        if (t.kind === TokenKind.Name || isSemiReservedToken(t)) {
            next();
        } else {
            error();
        }
        return end();
    }

    function interfaceDeclaration() {

        let p = start(PhraseKind.InterfaceDeclaration);
        p.children.push(interfaceDeclarationHeader());
        p.children.push(typeDeclarationBody(
            PhraseKind.InterfaceDeclarationBody, isClassMemberStart, interfaceMemberDeclarations
        ));
        return end();

    }

    function typeDeclarationBody<T extends Phrase>(phraseType: PhraseKind, elementStartPredicate: Predicate, listFunction: () => T) {

        let p = start(phraseType);
        expect(TokenKind.OpenBrace);

        if (elementStartPredicate(peek())) {
            p.children.push(listFunction());
        }

        expect(TokenKind.CloseBrace);
        return end();

    }

    function interfaceMemberDeclarations() {

        return list(
            PhraseKind.InterfaceMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenKind.CloseBrace],
            classMemberDeclarationListRecoverSet
        );

    }

    function interfaceDeclarationHeader() {

        let p = start(PhraseKind.InterfaceDeclarationHeader);
        next(); //interface
        expect(TokenKind.Name);

        if (peek().kind === TokenKind.Extends) {
            p.children.push(interfaceBaseClause());
        }

        return end();

    }

    function interfaceBaseClause() {

        let p = start(PhraseKind.InterfaceBaseClause);
        next(); //extends
        p.children.push(qualifiedNameList([TokenKind.OpenBrace]));
        return end();

    }

    function traitDeclaration() {

        let p = start(PhraseKind.TraitDeclaration);
        p.children.push(traitDeclarationHeader());
        p.children.push(typeDeclarationBody(
            PhraseKind.TraitDeclarationBody, isClassMemberStart, traitMemberDeclarations
        ));
        return end();

    }

    function traitDeclarationHeader() {
        let p = start(PhraseKind.TraitDeclarationHeader);
        next(); //trait
        expect(TokenKind.Name);
        return end();

    }

    function traitMemberDeclarations() {

        return list(
            PhraseKind.TraitMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenKind.CloseBrace],
            classMemberDeclarationListRecoverSet
        );

    }

    function functionDeclaration() {

        let p = start(PhraseKind.FunctionDeclaration);
        p.children.push(functionDeclarationHeader());
        p.children.push(functionDeclarationBody());
        return end();

    }

    function functionDeclarationBody() {
        let cs = compoundStatement();
        cs.kind = PhraseKind.FunctionDeclarationBody;
        return cs;
    }

    function functionDeclarationHeader() {

        let p = start(PhraseKind.FunctionDeclarationHeader);

        next(); //function
        optional(TokenKind.Ampersand);
        expect(TokenKind.Name);
        expect(TokenKind.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(delimitedList(
                PhraseKind.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenKind.Comma,
                [TokenKind.CloseParenthesis]
            ));
        }

        expect(TokenKind.CloseParenthesis);

        if (peek().kind === TokenKind.Colon) {
            p.children.push(returnType());
        }

        return end();

    }

    function isParameterStart(t: Token) {

        switch (t.kind) {
            case TokenKind.Ampersand:
            case TokenKind.Ellipsis:
            case TokenKind.VariableName:
                return true;
            default:
                return isTypeDeclarationStart(t);
        }

    }

    function classDeclaration() {

        let p = start(PhraseKind.ClassDeclaration);

        p.children.push(classDeclarationHeader());
        p.children.push(typeDeclarationBody(
            PhraseKind.ClassDeclarationBody, isClassMemberStart, classMemberDeclarationList
        ));
        return end();

    }

    function classDeclarationHeader() {

        let p = start(PhraseKind.ClassDeclarationHeader);
        optionalOneOf([TokenKind.Abstract, TokenKind.Final]);
        expect(TokenKind.Class);
        expect(TokenKind.Name);

        if (peek().kind === TokenKind.Extends) {
            p.children.push(classBaseClause());
        }

        if (peek().kind === TokenKind.Implements) {
            p.children.push(classInterfaceClause());
        }

        return end();

    }

    function classBaseClause() {
        let p = start(PhraseKind.ClassBaseClause);
        next(); //extends
        p.children.push(qualifiedName());
        return end();
    }

    function compoundStatement() {

        let p = start(PhraseKind.CompoundStatement);
        expect(TokenKind.OpenBrace);

        if (isStatementStart(peek())) {
            p.children.push(statementList([TokenKind.CloseBrace]));
        }

        expect(TokenKind.CloseBrace);
        return end();

    }

    function statement() {

        let t = peek();

        switch (t.kind) {
            case TokenKind.Namespace:
                return namespaceDefinition();
            case TokenKind.Use:
                return namespaceUseDeclaration();
            case TokenKind.HaltCompiler:
                return haltCompilerStatement();
            case TokenKind.Const:
                return constDeclaration();
            case TokenKind.Function:
                {
                    let p1 = peek(1);
                    if(
                        p1.kind === TokenKind.OpenParenthesis || 
                        (p1.kind === TokenKind.Ampersand && peek(2).kind === TokenKind.OpenParenthesis)
                    ) {
                        //anon fn without assignment
                        return expressionStatement();
                    } else {
                        return functionDeclaration();
                    }
                }
            case TokenKind.Class:
            case TokenKind.Abstract:
            case TokenKind.Final:
                return classDeclaration();
            case TokenKind.Trait:
                return traitDeclaration();
            case TokenKind.Interface:
                return interfaceDeclaration();
            case TokenKind.OpenBrace:
                return compoundStatement();
            case TokenKind.If:
                return ifStatement();
            case TokenKind.While:
                return whileStatement();
            case TokenKind.Do:
                return doStatement();
            case TokenKind.For:
                return forStatement();
            case TokenKind.Switch:
                return switchStatement();
            case TokenKind.Break:
                return breakStatement();
            case TokenKind.Continue:
                return continueStatement();
            case TokenKind.Return:
                return returnStatement();
            case TokenKind.Global:
                return globalDeclaration();
            case TokenKind.Static:
                if (peek(1).kind === TokenKind.VariableName &&
                    [TokenKind.Semicolon, TokenKind.Comma,
                    TokenKind.CloseTag, TokenKind.Equals].indexOf(peek(2).kind) >= 0) {
                    return functionStaticDeclaration();
                } else {
                    return expressionStatement();
                }
            case TokenKind.Text:
            case TokenKind.OpenTag:
            case TokenKind.CloseTag:
                return inlineText();
            case TokenKind.ForEach:
                return foreachStatement();
            case TokenKind.Declare:
                return declareStatement();
            case TokenKind.Try:
                return tryStatement();
            case TokenKind.Throw:
                return throwStatement();
            case TokenKind.Goto:
                return gotoStatement();
            case TokenKind.Echo:
            case TokenKind.OpenTagEcho:
                return echoIntrinsic();
            case TokenKind.Unset:
                return unsetIntrinsic();
            case TokenKind.Semicolon:
                return nullStatement();
            case TokenKind.Name:
                if (peek(1).kind === TokenKind.Colon) {
                    return namedLabelStatement();
                }
            //fall though
            default:
                return expressionStatement();

        }

    }

    function inlineText() {
        let p = start(PhraseKind.InlineText);

        optional(TokenKind.CloseTag);
        optional(TokenKind.Text);
        optional(TokenKind.OpenTag);

        return end();
    }

    function nullStatement() {
        start(PhraseKind.NullStatement);
        next(); //;
        return end();
    }

    function isCatchClauseStart(t: Token) {
        return t.kind === TokenKind.Catch;
    }

    function tryStatement() {

        let p = start(PhraseKind.TryStatement);
        next(); //try
        p.children.push(compoundStatement());

        let t = peek();

        if (t.kind === TokenKind.Catch) {
            p.children.push(list(
                PhraseKind.CatchClauseList,
                catchClause,
                isCatchClauseStart
            ));
        } else if (t.kind !== TokenKind.Finally) {
            error();
        }

        if (peek().kind === TokenKind.Finally) {
            p.children.push(finallyClause());
        }

        return end();

    }

    function finallyClause() {

        let p = start(PhraseKind.FinallyClause);
        next(); //finally
        p.children.push(compoundStatement());
        return end();

    }

    function catchClause() {

        let p = start(PhraseKind.CatchClause);
        next(); //catch
        expect(TokenKind.OpenParenthesis);
        p.children.push(delimitedList(
            PhraseKind.CatchNameList,
            qualifiedName,
            isQualifiedNameStart,
            TokenKind.Bar,
            [TokenKind.VariableName]
        ));
        expect(TokenKind.VariableName);
        expect(TokenKind.CloseParenthesis);
        p.children.push(compoundStatement());
        return end();

    }

    function declareDirective() {

        let p = start(PhraseKind.DeclareDirective);
        expect(TokenKind.Name);
        expect(TokenKind.Equals);
        expectOneOf([TokenKind.IntegerLiteral, TokenKind.FloatingLiteral, TokenKind.StringLiteral]);
        return end();

    }

    function declareStatement() {

        let p = start(PhraseKind.DeclareStatement);
        next(); //declare
        expect(TokenKind.OpenParenthesis);
        p.children.push(declareDirective());
        expect(TokenKind.CloseParenthesis);

        let t = peek();

        if (t.kind === TokenKind.Colon) {

            next(); //:
            p.children.push(statementList([TokenKind.EndDeclare]));
            expect(TokenKind.EndDeclare);
            expect(TokenKind.Semicolon);

        } else if (isStatementStart(t)) {

            p.children.push(statement());

        } else if (t.kind === TokenKind.Semicolon) {

            next();

        } else {

            error();

        }

        return end();

    }

    function switchStatement() {

        let p = start(PhraseKind.SwitchStatement);
        next(); //switch
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);

        let t = expectOneOf([TokenKind.Colon, TokenKind.OpenBrace]);
        let tCase = peek();

        if (tCase.kind === TokenKind.Case || tCase.kind === TokenKind.Default) {
            p.children.push(caseStatements(t && t.kind === TokenKind.Colon ?
                TokenKind.EndSwitch : TokenKind.CloseBrace));
        }

        if (t && t.kind === TokenKind.Colon) {
            expect(TokenKind.EndSwitch);
            expect(TokenKind.Semicolon);
        } else {
            expect(TokenKind.CloseBrace);
        }

        return end();

    }

    function caseStatements(breakOn: TokenKind) {

        let p = start(PhraseKind.CaseStatementList);
        let t: Token;
        let caseBreakOn = [TokenKind.Case, TokenKind.Default];
        caseBreakOn.push(breakOn);

        while (true) {
            
            t = peek();

            if (t.kind === TokenKind.Case) {
                p.children.push(caseStatement(caseBreakOn));
            } else if (t.kind === TokenKind.Default) {
                p.children.push(defaultStatement(caseBreakOn));
            } else if (breakOn === t.kind) {
                break;
            } else {
                error();
                break;
            }

        }

        return end();

    }

    function caseStatement(breakOn: TokenKind[]) {

        let p = start(PhraseKind.CaseStatement);
        next(); //case
        p.children.push(expression(0));
        expectOneOf([TokenKind.Colon, TokenKind.Semicolon]);
        if (isStatementStart(peek())) {
            p.children.push(statementList(breakOn));
        }
        return end();

    }

    function defaultStatement(breakOn: TokenKind[]) {
        let p = start(PhraseKind.DefaultStatement);
        next(); //default
        expectOneOf([TokenKind.Colon, TokenKind.Semicolon]);
        if (isStatementStart(peek())) {
            p.children.push(statementList(breakOn));
        }
        return end();
    }

    function namedLabelStatement() {

        let p = start(PhraseKind.NamedLabelStatement);
        next(); //name
        next(); //:
        return end();
    }

    function gotoStatement() {

        let p = start(PhraseKind.GotoStatement);
        next(); //goto
        expect(TokenKind.Name);
        expect(TokenKind.Semicolon);
        return end();

    }

    function throwStatement() {

        let p = start(PhraseKind.ThrowStatement);
        next(); //throw
        p.children.push(expression(0));
        expect(TokenKind.Semicolon);
        return end();
    }

    function foreachCollection() {
        let p = start(PhraseKind.ForeachCollection);
        p.children.push(expression(0));
        return end();
    }

    function foreachKeyOrValue() {
        let p = start(PhraseKind.ForeachValue);
        p.children.push(expression(0));
        if (peek().kind === TokenKind.FatArrow) {
            next();
            p.kind = PhraseKind.ForeachKey;
        }
        return end();
    }

    function foreachValue() {
        let p = start(PhraseKind.ForeachValue);
        optional(TokenKind.Ampersand);
        p.children.push(expression(0));
        return end();
    }

    function foreachStatement() {

        let p = start(PhraseKind.ForeachStatement);
        next(); //foreach
        expect(TokenKind.OpenParenthesis);
        p.children.push(foreachCollection());
        expect(TokenKind.As);
        let keyOrValue = peek().kind === TokenKind.Ampersand ? foreachValue() : foreachKeyOrValue();
        p.children.push(keyOrValue);

        if (keyOrValue.kind === PhraseKind.ForeachKey) {
            p.children.push(foreachValue());
        } 

        expect(TokenKind.CloseParenthesis);

        let t = peek();

        if (t.kind === TokenKind.Colon) {
            next();
            p.children.push(statementList([TokenKind.EndForeach]));
            expect(TokenKind.EndForeach);
            expect(TokenKind.Semicolon);
        } else if (isStatementStart(t)) {
            p.children.push(statement());
        } else {
            error();
        }

        return end();

    }

    function isVariableStart(t: Token) {

        switch (t.kind) {
            case TokenKind.VariableName:
            case TokenKind.Dollar:
            case TokenKind.OpenParenthesis:
            case TokenKind.Array:
            case TokenKind.OpenBracket:
            case TokenKind.StringLiteral:
            case TokenKind.Static:
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.Backslash:
                return true;
            default:
                return false;
        }

    }

    function variableInitial() {
        return variable(variableAtom());
    }

    function variableList(breakOn?: TokenKind[]) {
        return delimitedList(
            PhraseKind.VariableList,
            variableInitial,
            isVariableStart,
            TokenKind.Comma,
            breakOn
        );
    }

    function unsetIntrinsic() {

        let p = start(PhraseKind.UnsetIntrinsic);
        next(); //unset
        expect(TokenKind.OpenParenthesis);
        p.children.push(variableList([TokenKind.CloseParenthesis]));
        expect(TokenKind.CloseParenthesis);
        expect(TokenKind.Semicolon);
        return end();

    }

    function expressionInitial() {
        return expression(0);
    }

    function echoIntrinsic() {

        let p = start(PhraseKind.EchoIntrinsic);
        next(); //echo or <?=
        p.children.push(delimitedList(
            PhraseKind.ExpressionList,
            expressionInitial,
            isExpressionStart,
            TokenKind.Comma
        ));
        expect(TokenKind.Semicolon);
        return end();

    }

    function isStaticVariableDclarationStart(t: Token) {
        return t.kind === TokenKind.VariableName;
    }

    function functionStaticDeclaration() {

        let p = start(PhraseKind.FunctionStaticDeclaration);
        next(); //static
        p.children.push(delimitedList(
            PhraseKind.StaticVariableDeclarationList,
            staticVariableDeclaration,
            isStaticVariableDclarationStart,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        ));
        expect(TokenKind.Semicolon);
        return end();

    }

    function globalDeclaration() {

        let p = start(PhraseKind.GlobalDeclaration);
        next(); //global
        p.children.push(delimitedList(
            PhraseKind.VariableNameList,
            simpleVariable,
            isSimpleVariableStart,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        ));
        expect(TokenKind.Semicolon);
        return end();

    }

    function isSimpleVariableStart(t: Token) {
        switch (t.kind) {
            case TokenKind.VariableName:
            case TokenKind.Dollar:
                return true;
            default:
                return false;
        }
    }

    function staticVariableDeclaration() {

        let p = start(PhraseKind.StaticVariableDeclaration);
        expect(TokenKind.VariableName);

        if (peek().kind === TokenKind.Equals) {
            p.children.push(functionStaticInitialiser());
        }

        return end();

    }

    function functionStaticInitialiser() {

        let p = start(PhraseKind.FunctionStaticInitialiser);
        next(); //=
        p.children.push(expression(0));
        return end();

    }

    function continueStatement() {
        let p = start(PhraseKind.ContinueStatement);
        next(); //break/continue
        if(isExpressionStart(peek())) {
            p.children.push(expression(0));
        }
        expect(TokenKind.Semicolon);
        return end();
    }

    function breakStatement() {
        let p = start(PhraseKind.BreakStatement);
        next(); //break/continue
        if(isExpressionStart(peek())) {
            p.children.push(expression(0));
        }
        expect(TokenKind.Semicolon);
        return end();
    }

    function returnStatement() {
        let p = start(PhraseKind.ReturnStatement);
        next(); //return

        if (isExpressionStart(peek())) {
            p.children.push(expression(0));
        }

        expect(TokenKind.Semicolon);
        return end();
    }

    function forExpressionGroup(phraseType: PhraseKind, breakOn: TokenKind[]) {

        return delimitedList(
            phraseType,
            expressionInitial,
            isExpressionStart,
            TokenKind.Comma,
            breakOn
        );

    }

    function forStatement() {

        let p = start(PhraseKind.ForStatement);
        next(); //for
        expect(TokenKind.OpenParenthesis);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseKind.ForInitialiser, [TokenKind.Semicolon]));
        }

        expect(TokenKind.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseKind.ForControl, [TokenKind.Semicolon]));
        }

        expect(TokenKind.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseKind.ForEndOfLoop, [TokenKind.CloseParenthesis]));
        }

        expect(TokenKind.CloseParenthesis);

        let t = peek();

        if (t.kind === TokenKind.Colon) {
            next();
            p.children.push(statementList([TokenKind.EndFor]));
            expect(TokenKind.EndFor);
            expect(TokenKind.Semicolon);
        } else if (isStatementStart(peek())) {
            p.children.push(statement());
        } else {
            error();
        }

        return end();

    }

    function doStatement() {

        let p = start(PhraseKind.DoStatement);
        next(); // do
        p.children.push(statement());
        expect(TokenKind.While);
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);
        expect(TokenKind.Semicolon);
        return end();

    }

    function whileStatement() {

        let p = start(PhraseKind.WhileStatement);
        next(); //while
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);

        let t = peek();

        if (t.kind === TokenKind.Colon) {
            next();
            p.children.push(statementList([TokenKind.EndWhile]));
            expect(TokenKind.EndWhile);
            expect(TokenKind.Semicolon);
        } else if (isStatementStart(t)) {
            p.children.push(statement());
        } else {
            //error
            error();
        }

        return end();

    }

    function elseIfClause1() {

        let p = start(PhraseKind.ElseIfClause);
        next(); //elseif
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);
        p.children.push(statement());
        return end();
    }

    function elseIfClause2() {
        let p = start(PhraseKind.ElseIfClause);
        next(); //elseif
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);
        expect(TokenKind.Colon);
        p.children.push(statementList([TokenKind.EndIf, TokenKind.Else, TokenKind.ElseIf]));
        return end();
    }

    function elseClause1() {
        let p = start(PhraseKind.ElseClause);
        next(); //else
        p.children.push(statement());
        return end();
    }

    function elseClause2() {
        let p = start(PhraseKind.ElseClause);
        next(); //else
        expect(TokenKind.Colon);
        p.children.push(statementList([TokenKind.EndIf]));
        return end();
    }

    function isElseIfClauseStart(t: Token) {
        return t.kind === TokenKind.ElseIf;
    }

    function ifStatement() {

        let p = start(PhraseKind.IfStatement);
        next(); //if
        expect(TokenKind.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenKind.CloseParenthesis);

        let t = peek();
        let elseIfClauseFunction = elseIfClause1;
        let elseClauseFunction = elseClause1;
        let expectEndIf = false;

        if (t.kind === TokenKind.Colon) {
            next();
            p.children.push(statementList([TokenKind.ElseIf, TokenKind.Else, TokenKind.EndIf]));
            elseIfClauseFunction = elseIfClause2;
            elseClauseFunction = elseClause2;
            expectEndIf = true;
        } else if (isStatementStart(t)) {
            p.children.push(statement());
        } else {
            error();
        }

        if (peek().kind === TokenKind.ElseIf) {
            p.children.push(list(
                PhraseKind.ElseIfClauseList,
                elseIfClauseFunction,
                isElseIfClauseStart
            ));
        }

        if (peek().kind === TokenKind.Else) {
            p.children.push(elseClauseFunction());
        }

        if (expectEndIf) {
            expect(TokenKind.EndIf);
            expect(TokenKind.Semicolon);
        }

        return end();

    }

    function expressionStatement() {

        let p = start(PhraseKind.ExpressionStatement);
        p.children.push(expression(0));
        expect(TokenKind.Semicolon);
        return end();

    }

    function returnType() {
        let p = start(PhraseKind.ReturnType);
        next(); //:
        p.children.push(typeDeclaration());
        return end();
    }

    function typeDeclaration() {

        let p = start(PhraseKind.TypeDeclaration);
        optional(TokenKind.Question);

        switch (peek().kind) {
            case TokenKind.Callable:
            case TokenKind.Array:
                next();
                break;
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.Backslash:
                p.children.push(qualifiedName());
                break;
            default:
                error();
                break;
        }

        return end();

    }

    function classConstDeclaration(p: Phrase) {

        p.kind = PhraseKind.ClassConstDeclaration;
        next(); //const
        p.children.push(delimitedList(
            PhraseKind.ClassConstElementList,
            classConstElement,
            isClassConstElementStartToken,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        ));
        expect(TokenKind.Semicolon);
        return end();

    }

    function isExpressionStart(t: Token) {

        switch (t.kind) {
            case TokenKind.VariableName:
            case TokenKind.Dollar:
            case TokenKind.Array:
            case TokenKind.OpenBracket:
            case TokenKind.StringLiteral:
            case TokenKind.Backslash:
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.OpenParenthesis:
            case TokenKind.Static:
            case TokenKind.PlusPlus:
            case TokenKind.MinusMinus:
            case TokenKind.Plus:
            case TokenKind.Minus:
            case TokenKind.Exclamation:
            case TokenKind.Tilde:
            case TokenKind.AtSymbol:
            case TokenKind.IntegerCast:
            case TokenKind.FloatCast:
            case TokenKind.StringCast:
            case TokenKind.ArrayCast:
            case TokenKind.ObjectCast:
            case TokenKind.BooleanCast:
            case TokenKind.UnsetCast:
            case TokenKind.List:
            case TokenKind.Clone:
            case TokenKind.New:
            case TokenKind.FloatingLiteral:
            case TokenKind.IntegerLiteral:
            case TokenKind.LineConstant:
            case TokenKind.FileConstant:
            case TokenKind.DirectoryConstant:
            case TokenKind.TraitConstant:
            case TokenKind.MethodConstant:
            case TokenKind.FunctionConstant:
            case TokenKind.NamespaceConstant:
            case TokenKind.ClassConstant:
            case TokenKind.StartHeredoc:
            case TokenKind.DoubleQuote:
            case TokenKind.Backtick:
            case TokenKind.Print:
            case TokenKind.Yield:
            case TokenKind.YieldFrom:
            case TokenKind.Function:
            case TokenKind.Include:
            case TokenKind.IncludeOnce:
            case TokenKind.Require:
            case TokenKind.RequireOnce:
            case TokenKind.Eval:
            case TokenKind.Empty:
            case TokenKind.Isset:
            case TokenKind.Exit:
                return true;
            default:
                return false;
        }

    }

    function classConstElement() {

        let p = start(PhraseKind.ClassConstElement);
        p.children.push(identifier());
        expect(TokenKind.Equals);
        p.children.push(expression(0));
        return end();

    }

    function isPropertyElementStart(t: Token) {
        return t.kind === TokenKind.VariableName;
    }

    function propertyDeclaration(p: Phrase) {

        let t: Token;
        p.kind = PhraseKind.PropertyDeclaration;
        p.children.push(delimitedList(
            PhraseKind.PropertyElementList,
            propertyElement,
            isPropertyElementStart,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        ));
        expect(TokenKind.Semicolon);
        return end();

    }

    function propertyElement() {

        let p = start(PhraseKind.PropertyElement);
        expect(TokenKind.VariableName);

        if (peek().kind === TokenKind.Equals) {
            p.children.push(propertyInitialiser());
        }

        return end();

    }

    function propertyInitialiser() {

        let p = start(PhraseKind.PropertyInitialiser);
        next(); //equals
        p.children.push(expression(0));
        return end();

    }

    function memberModifierList() {

        let p = start(PhraseKind.MemberModifierList);

        while (isMemberModifier(peek())) {
            next();
        }

        return end();

    }

    function isMemberModifier(t: Token) {
        switch (t.kind) {
            case TokenKind.Public:
            case TokenKind.Protected:
            case TokenKind.Private:
            case TokenKind.Static:
            case TokenKind.Abstract:
            case TokenKind.Final:
                return true;
            default:
                return false;
        }
    }


    function qualifiedNameList(breakOn: TokenKind[]) {

        return delimitedList(
            PhraseKind.QualifiedNameList,
            qualifiedName,
            isQualifiedNameStart,
            TokenKind.Comma,
            breakOn
        );
    }

    function objectCreationExpression() {

        let p = start(PhraseKind.ObjectCreationExpression);
        next(); //new

        if (peek().kind === TokenKind.Class) {
            p.children.push(anonymousClassDeclaration());
            return end();
        }

        p.children.push(typeDesignator(PhraseKind.ClassTypeDesignator));

        if (optional(TokenKind.OpenParenthesis)) {

            if (isArgumentStart(peek())) {
                p.children.push(argumentList());
            }

            expect(TokenKind.CloseParenthesis);
        }

        return end();

    }

    function typeDesignator(phraseType: PhraseKind) {

        let p = start(phraseType);
        let part = classTypeDesignatorAtom();

        while (true) {
            
            switch (peek().kind) {
                case TokenKind.OpenBracket:
                    part = subscriptExpression(part, TokenKind.CloseBracket);
                    continue;
                case TokenKind.OpenBrace:
                    part = subscriptExpression(part, TokenKind.CloseBrace);
                    continue;
                case TokenKind.Arrow:
                    part = propertyAccessExpression(part);
                    continue;
                case TokenKind.ColonColon:
                    let staticPropNode = start(PhraseKind.ScopedPropertyAccessExpression);
                    staticPropNode.children.push(part);
                    next(); //::
                    staticPropNode.children.push(restrictedScopedMemberName());
                    part = end();
                    continue;
                default:
                    break;
            }

            break;

        }

        p.children.push(part);
        return end();

    }

    function restrictedScopedMemberName() {

        let p = start(PhraseKind.ScopedMemberName);
        let t = peek();

        switch (t.kind) {
            case TokenKind.VariableName:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                next();
                break;
            case TokenKind.Dollar:
                p.children.push(simpleVariable());
                break;
            default:
                error();
                break;
        }

        return end();

    }

    function classTypeDesignatorAtom() {

        let t = peek();

        switch (t.kind) {
            case TokenKind.Static:
                return relativeScope();
            case TokenKind.VariableName:
            case TokenKind.Dollar:
                return simpleVariable();
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.Backslash:
                return qualifiedName();
            default:
                start(PhraseKind.Error);
                error();
                return end();
        }

    }

    function cloneExpression() {

        let p = start(PhraseKind.CloneExpression);
        next(); //clone
        p.children.push(expression(0));
        return end();

    }

    function listIntrinsic() {

        let p = start(PhraseKind.ListIntrinsic);
        next(); //list
        expect(TokenKind.OpenParenthesis);
        p.children.push(arrayInitialiserList(TokenKind.CloseParenthesis));
        expect(TokenKind.CloseParenthesis);
        return end();

    }

    function unaryExpression(phraseType: PhraseKind) {

        let p = start(phraseType);
        let op = next();//op

        switch (phraseType) {
            case PhraseKind.PrefixDecrementExpression:
            case PhraseKind.PrefixIncrementExpression:
                p.children.push(variable(variableAtom()));
                break;
            default:
                p.children.push(expression(precedenceAssociativityTuple(op)[0]));
                break;
        }

        return end();

    }

    function anonymousFunctionHeader() {
        let p = start(PhraseKind.AnonymousFunctionHeader);
        optional(TokenKind.Static);
        next(); //function
        optional(TokenKind.Ampersand);
        expect(TokenKind.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(delimitedList(
                PhraseKind.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenKind.Comma,
                [TokenKind.CloseParenthesis]
            ));
        }

        expect(TokenKind.CloseParenthesis);

        if (peek().kind === TokenKind.Use) {
            p.children.push(anonymousFunctionUseClause());
        }

        if (peek().kind === TokenKind.Colon) {
            p.children.push(returnType());
        }

        return end();

    }

    function anonymousFunctionCreationExpression() {

        let p = start(PhraseKind.AnonymousFunctionCreationExpression);

        p.children.push(anonymousFunctionHeader());
        p.children.push(functionDeclarationBody());
        return end();

    }

    function isAnonymousFunctionUseVariableStart(t: Token) {
        return t.kind === TokenKind.VariableName ||
            t.kind === TokenKind.Ampersand;
    }

    function anonymousFunctionUseClause() {

        let p = start(PhraseKind.AnonymousFunctionUseClause);
        next(); //use
        expect(TokenKind.OpenParenthesis);
        p.children.push(delimitedList(
            PhraseKind.ClosureUseList,
            anonymousFunctionUseVariable,
            isAnonymousFunctionUseVariableStart,
            TokenKind.Comma,
            [TokenKind.CloseParenthesis]
        ));
        expect(TokenKind.CloseParenthesis);
        return end();

    }

    function anonymousFunctionUseVariable() {

        let p = start(PhraseKind.AnonymousFunctionUseVariable);
        optional(TokenKind.Ampersand);
        expect(TokenKind.VariableName);
        return end();

    }

    function isTypeDeclarationStart(t: Token) {
        switch (t.kind) {
            case TokenKind.Backslash:
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.Question:
            case TokenKind.Array:
            case TokenKind.Callable:
                return true;
            default:
                return false;
        }
    }

    function parameterDeclaration() {

        let p = start(PhraseKind.ParameterDeclaration);

        if (isTypeDeclarationStart(peek())) {
            p.children.push(typeDeclaration());
        }

        optional(TokenKind.Ampersand);
        optional(TokenKind.Ellipsis);
        expect(TokenKind.VariableName);

        if (peek().kind === TokenKind.Equals) {
            next();
            p.children.push(expression(0));
        }

        return end();

    }

    function variable(variableAtomNode: Phrase | Token) {

        let count = 0;

        while (true) {
            ++count;
            switch (peek().kind) {
                case TokenKind.ColonColon:
                    variableAtomNode = scopedAccessExpression(variableAtomNode);
                    continue;
                case TokenKind.Arrow:
                    variableAtomNode = propertyOrMethodAccessExpression(variableAtomNode);
                    continue;
                case TokenKind.OpenBracket:
                    variableAtomNode = subscriptExpression(variableAtomNode, TokenKind.CloseBracket);
                    continue;
                case TokenKind.OpenBrace:
                    variableAtomNode = subscriptExpression(variableAtomNode, TokenKind.CloseBrace);
                    continue;
                case TokenKind.OpenParenthesis:
                    variableAtomNode = functionCallExpression(variableAtomNode);
                    continue;
                default:
                    //only simple variable atoms qualify as variables
                    if (count === 1 && (<Phrase>variableAtomNode).kind !== PhraseKind.SimpleVariable) {
                        let errNode = start(PhraseKind.Error, true);
                        errNode.children.push(variableAtomNode);
                        error();
                        return end();
                    }
                    break;
            }

            break;
        }

        return variableAtomNode;
    }

    function functionCallExpression(lhs: Phrase | Token) {
        let p = start(PhraseKind.FunctionCallExpression, true);
        p.children.push(lhs);
        expect(TokenKind.OpenParenthesis);
        if (isArgumentStart(peek())) {
            p.children.push(argumentList());
        }
        expect(TokenKind.CloseParenthesis);
        return end();
    }

    function scopedAccessExpression(lhs: Phrase | Token) {

        let p = start(PhraseKind.Error, true);
        p.children.push(lhs);
        next() //::
        p.children.push(scopedMemberName(p));

        if (optional(TokenKind.OpenParenthesis)) {
            p.kind = PhraseKind.ScopedCallExpression;
            if (isArgumentStart(peek())) {
                p.children.push(argumentList());
            }

            expect(TokenKind.CloseParenthesis);
            return end();
        } else if (p.kind === PhraseKind.ScopedCallExpression) {
            //error
            error();
        }

        return end();

    }

    function scopedMemberName(parent: Phrase) {

        let p = start(PhraseKind.ScopedMemberName);
        let t = peek();

        switch (t.kind) {
            case TokenKind.OpenBrace:
                parent.kind = PhraseKind.ScopedCallExpression;
                p.children.push(encapsulatedExpression(TokenKind.OpenBrace, TokenKind.CloseBrace));
                break;
            case TokenKind.VariableName:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                parent.kind = PhraseKind.ScopedPropertyAccessExpression;
                next();
                break;
            case TokenKind.Dollar:
                p.children.push(simpleVariable());
                parent.kind = PhraseKind.ScopedPropertyAccessExpression;
                break;
            default:
                if (t.kind === TokenKind.Name || isSemiReservedToken(t)) {
                    p.children.push(identifier());
                    parent.kind = PhraseKind.ClassConstantAccessExpression;
                } else {
                    //error
                    error();
                }
                break;
        }

        return end();

    }

    function propertyAccessExpression(lhs: Phrase | Token) {
        let p = start(PhraseKind.PropertyAccessExpression, true);
        p.children.push(lhs);
        next(); //->
        p.children.push(memberName());
        return end();
    }

    function propertyOrMethodAccessExpression(lhs: Phrase | Token) {

        let p = start(PhraseKind.PropertyAccessExpression, true);
        p.children.push(lhs);
        next(); //->
        p.children.push(memberName());

        if (optional(TokenKind.OpenParenthesis)) {
            if (isArgumentStart(peek())) {
                p.children.push(argumentList());
            }
            p.kind = PhraseKind.MethodCallExpression;
            expect(TokenKind.CloseParenthesis);
        }

        return end();

    }

    function memberName() {

        let p = start(PhraseKind.MemberName);

        switch (peek().kind) {
            case TokenKind.Name:
                next();
                break;
            case TokenKind.OpenBrace:
                p.children.push(encapsulatedExpression(TokenKind.OpenBrace, TokenKind.CloseBrace));
                break;
            case TokenKind.Dollar:
            case TokenKind.VariableName:
                p.children.push(simpleVariable());
                break;
            default:
                error();
                break;
        }

        return end();

    }

    function subscriptExpression(lhs: Phrase | Token, closeTokenType: TokenKind) {

        let p = start(PhraseKind.SubscriptExpression, true);
        p.children.push(lhs);
        next(); // [ or {

        if (isExpressionStart(peek())) {
            p.children.push(expression(0));
        }

        expect(closeTokenType);
        return end();

    }

    function argumentList() {

        return delimitedList(
            PhraseKind.ArgumentExpressionList,
            argumentExpression,
            isArgumentStart,
            TokenKind.Comma,
            [TokenKind.CloseParenthesis]
        );

    }

    function isArgumentStart(t: Token) {
        return t.kind === TokenKind.Ellipsis || isExpressionStart(t);
    }

    function variadicUnpacking() {
        let p = start(PhraseKind.VariadicUnpacking);
        next(); //...
        p.children.push(expression(0));
        return end();
    }

    function argumentExpression() {
        return peek().kind === TokenKind.Ellipsis ?
            variadicUnpacking() : expression(0);
    }

    function qualifiedName() {

        let p = start(PhraseKind.QualifiedName);
        let t = peek();

        if (t.kind === TokenKind.Backslash) {
            next();
            p.kind = PhraseKind.FullyQualifiedName;
        } else if (t.kind === TokenKind.Namespace) {
            p.kind = PhraseKind.RelativeQualifiedName;
            next();
            expect(TokenKind.Backslash);
        }

        p.children.push(namespaceName());
        return end();

    }

    function isQualifiedNameStart(t: Token) {
        switch (t.kind) {
            case TokenKind.Backslash:
            case TokenKind.Name:
            case TokenKind.Namespace:
                return true;
            default:
                return false;
        }
    }

    function shortArrayCreationExpression() {

        let p = start(PhraseKind.ArrayCreationExpression);
        next(); //[
        if (isArrayElementStart(peek())) {
            p.children.push(arrayInitialiserList(TokenKind.CloseBracket));
        }
        expect(TokenKind.CloseBracket);
        return end();

    }

    function longArrayCreationExpression() {

        let p = start(PhraseKind.ArrayCreationExpression);
        next(); //array
        expect(TokenKind.OpenParenthesis);

        if (isArrayElementStart(peek())) {
            p.children.push(arrayInitialiserList(TokenKind.CloseParenthesis));
        }

        expect(TokenKind.CloseParenthesis);
        return end();

    }

    function isArrayElementStart(t: Token) {
        return t.kind === TokenKind.Ampersand || isExpressionStart(t);
    }

    function arrayInitialiserList(breakOn: TokenKind) {

        let p = start(PhraseKind.ArrayInitialiserList);
        let t: Token;

        let arrayInitialiserListRecoverSet = [breakOn, TokenKind.Comma];
        recoverSetStack.push(arrayInitialiserListRecoverSet);

        while (true) {
            
            //an array can have empty elements
            if (isArrayElementStart(peek())) {
                p.children.push(arrayElement());
            }

            t = peek();

            if (t.kind === TokenKind.Comma) {
                next();
            } else if (t.kind === breakOn) {
                break;
            } else {
                error();
                //check for missing delimeter
                if (isArrayElementStart(t)) {
                    continue;
                } else {
                    //skip until recover token
                    defaultSyncStrategy();
                    t = peek();
                    if (t.kind === TokenKind.Comma || t.kind === breakOn) {
                        continue;
                    }
                }

                break;
            }

        }

        recoverSetStack.pop();
        return end();

    }

    function arrayValue() {

        let p = start(PhraseKind.ArrayValue);
        optional(TokenKind.Ampersand)
        p.children.push(expression(0));
        return end();

    }

    function arrayKey() {
        let p = start(PhraseKind.ArrayKey);
        p.children.push(expression(0));
        return end();
    }

    function arrayElement() {

        let p = start(PhraseKind.ArrayElement);

        if (peek().kind === TokenKind.Ampersand) {
            p.children.push(arrayValue());
            return end();
        }

        let keyOrValue = arrayKey();
        p.children.push(keyOrValue);

        if (!optional(TokenKind.FatArrow)) {
            keyOrValue.kind = PhraseKind.ArrayValue;
            return end();
        }

        p.children.push(arrayValue());
        return end();

    }

    function encapsulatedExpression(openTokenType: TokenKind, closeTokenType: TokenKind) {

        let p = start(PhraseKind.EncapsulatedExpression);
        expect(openTokenType);
        p.children.push(expression(0));
        expect(closeTokenType);
        return end();

    }

    function relativeScope() {
        let p = start(PhraseKind.RelativeScope);
        next();
        return end();
    }

    function variableAtom(): Phrase | Token {

        let t = peek();
        switch (t.kind) {
            case TokenKind.VariableName:
            case TokenKind.Dollar:
                return simpleVariable();
            case TokenKind.OpenParenthesis:
                return encapsulatedExpression(TokenKind.OpenParenthesis, TokenKind.CloseParenthesis);
            case TokenKind.Array:
                return longArrayCreationExpression();
            case TokenKind.OpenBracket:
                return shortArrayCreationExpression();
            case TokenKind.StringLiteral:
                return next(true);
            case TokenKind.Static:
                return relativeScope();
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.Backslash:
                return qualifiedName();
            default:
                //error
                let p = start(PhraseKind.Error);
                error();
                return end();
        }

    }

    function simpleVariable() {

        let p = start(PhraseKind.SimpleVariable);
        let t = expectOneOf([TokenKind.VariableName, TokenKind.Dollar]);

        if (t && t.kind === TokenKind.Dollar) {
            t = peek();
            if (t.kind === TokenKind.OpenBrace) {
                p.children.push(encapsulatedExpression(TokenKind.OpenBrace, TokenKind.CloseBrace));
            } else if (t.kind === TokenKind.Dollar || t.kind === TokenKind.VariableName) {
                p.children.push(simpleVariable());
            } else {
                error();
            }
        }

        return end();

    }

    function haltCompilerStatement() {

        let p = start(PhraseKind.HaltCompilerStatement);
        next(); // __halt_compiler
        expect(TokenKind.OpenParenthesis);
        expect(TokenKind.CloseParenthesis);
        expect(TokenKind.Semicolon);
        return end();

    }

    function namespaceUseDeclaration() {

        let p = start(PhraseKind.NamespaceUseDeclaration);
        next(); //use
        optionalOneOf([TokenKind.Function, TokenKind.Const]);
        optional(TokenKind.Backslash);
        let nsNameNode = namespaceName();
        let t = peek();

        if (t.kind === TokenKind.Backslash || t.kind === TokenKind.OpenBrace) {
            p.children.push(nsNameNode);
            expect(TokenKind.Backslash);
            expect(TokenKind.OpenBrace);
            p.children.push(delimitedList(
                PhraseKind.NamespaceUseGroupClauseList,
                namespaceUseGroupClause,
                isNamespaceUseGroupClauseStartToken,
                TokenKind.Comma,
                [TokenKind.CloseBrace]
            ));
            expect(TokenKind.CloseBrace);
            expect(TokenKind.Semicolon);
            return end();
        }

        p.children.push(delimitedList(
            PhraseKind.NamespaceUseClauseList,
            namespaceUseClauseFunction(nsNameNode),
            isNamespaceUseClauseStartToken,
            TokenKind.Comma,
            [TokenKind.Semicolon],
            true));

        expect(TokenKind.Semicolon);
        return end();

    }

    function isNamespaceUseClauseStartToken(t:Token) {
        return t.kind === TokenKind.Name || t.kind === TokenKind.Backslash;
    }

    function namespaceUseClauseFunction(nsName: Phrase) {

        return () => {

            let p = start(PhraseKind.NamespaceUseClause, !!nsName);

            if (nsName) {
                p.children.push(nsName);
                nsName = null;
            } else {
                p.children.push(namespaceName());
            }

            if (peek().kind === TokenKind.As) {
                p.children.push(namespaceAliasingClause());
            }

            return end();

        };

    }

    function delimitedList(phraseType: PhraseKind, elementFunction: () => Phrase | Token,
        elementStartPredicate: Predicate, delimiter: TokenKind, breakOn?: TokenKind[], doNotPushHiddenToParent?:boolean) {
        let p = start(phraseType, doNotPushHiddenToParent);
        let t: Token;
        let delimitedListRecoverSet = breakOn ? breakOn.slice(0) : [];
        delimitedListRecoverSet.push(delimiter);
        recoverSetStack.push(delimitedListRecoverSet);

        while (true) {
            
            p.children.push(elementFunction());
            t = peek();
            
            if (t.kind === delimiter) {
                next();
            } else if (!breakOn || breakOn.indexOf(t.kind) >= 0) {
                break;
            } else {
                error();
                //check for missing delimeter
                if (elementStartPredicate(t)) {
                    continue;
                } else if (breakOn) {
                    //skip until breakOn or delimiter token or whatever else is in recover set
                    defaultSyncStrategy();
                    if (peek().kind === delimiter) {
                        continue;
                    }
                }

                break;
            }

        }

        recoverSetStack.pop();
        return end();
    }

    function isNamespaceUseGroupClauseStartToken(t: Token) {
        switch (t.kind) {
            case TokenKind.Const:
            case TokenKind.Function:
            case TokenKind.Name:
                return true;
            default:
                return false;
        }
    }

    function namespaceUseGroupClause() {

        let p = start(PhraseKind.NamespaceUseGroupClause);
        optionalOneOf([TokenKind.Function, TokenKind.Const]);
        p.children.push(namespaceName());

        if (peek().kind === TokenKind.As) {
            p.children.push(namespaceAliasingClause());
        }

        return end();

    }

    function namespaceAliasingClause() {

        let p = start(PhraseKind.NamespaceAliasingClause);
        next(); //as
        expect(TokenKind.Name);
        return end();

    }

    function namespaceDefinition() {

        let p = start(PhraseKind.NamespaceDefinition);
        next(); //namespace

        if (peek().kind === TokenKind.Name) {

            p.children.push(namespaceName());
            let t = expectOneOf([TokenKind.Semicolon, TokenKind.OpenBrace]);
            if (!t || t.kind !== TokenKind.OpenBrace) {
                return end();
            }

        } else {
            expect(TokenKind.OpenBrace);
        }

        p.children.push(statementList([TokenKind.CloseBrace]));
        expect(TokenKind.CloseBrace);
        return end();

    }

    function namespaceName() {

        start(PhraseKind.NamespaceName);
        expect(TokenKind.Name);

        while (true) {
            
            if (peek().kind === TokenKind.Backslash &&
                peek(1).kind === TokenKind.Name) {
                next();
                next();
            } else {
                break;
            }

        }

        return end();

    }

    function isReservedToken(t: Token) {
        switch (t.kind) {
            case TokenKind.Include:
            case TokenKind.IncludeOnce:
            case TokenKind.Eval:
            case TokenKind.Require:
            case TokenKind.RequireOnce:
            case TokenKind.Or:
            case TokenKind.Xor:
            case TokenKind.And:
            case TokenKind.InstanceOf:
            case TokenKind.New:
            case TokenKind.Clone:
            case TokenKind.Exit:
            case TokenKind.If:
            case TokenKind.ElseIf:
            case TokenKind.Else:
            case TokenKind.EndIf:
            case TokenKind.Echo:
            case TokenKind.Do:
            case TokenKind.While:
            case TokenKind.EndWhile:
            case TokenKind.For:
            case TokenKind.EndFor:
            case TokenKind.ForEach:
            case TokenKind.EndForeach:
            case TokenKind.Declare:
            case TokenKind.EndDeclare:
            case TokenKind.As:
            case TokenKind.Try:
            case TokenKind.Catch:
            case TokenKind.Finally:
            case TokenKind.Throw:
            case TokenKind.Use:
            case TokenKind.InsteadOf:
            case TokenKind.Global:
            case TokenKind.Var:
            case TokenKind.Unset:
            case TokenKind.Isset:
            case TokenKind.Empty:
            case TokenKind.Continue:
            case TokenKind.Goto:
            case TokenKind.Function:
            case TokenKind.Const:
            case TokenKind.Return:
            case TokenKind.Print:
            case TokenKind.Yield:
            case TokenKind.List:
            case TokenKind.Switch:
            case TokenKind.EndSwitch:
            case TokenKind.Case:
            case TokenKind.Default:
            case TokenKind.Break:
            case TokenKind.Array:
            case TokenKind.Callable:
            case TokenKind.Extends:
            case TokenKind.Implements:
            case TokenKind.Namespace:
            case TokenKind.Trait:
            case TokenKind.Interface:
            case TokenKind.Class:
            case TokenKind.ClassConstant:
            case TokenKind.TraitConstant:
            case TokenKind.FunctionConstant:
            case TokenKind.MethodConstant:
            case TokenKind.LineConstant:
            case TokenKind.FileConstant:
            case TokenKind.DirectoryConstant:
            case TokenKind.NamespaceConstant:
                return true;
            default:
                return false;
        }
    }

    function isSemiReservedToken(t: Token) {
        switch (t.kind) {
            case TokenKind.Static:
            case TokenKind.Abstract:
            case TokenKind.Final:
            case TokenKind.Private:
            case TokenKind.Protected:
            case TokenKind.Public:
                return true;
            default:
                return isReservedToken(t);
        }
    }

    function isStatementStart(t: Token) {

        switch (t.kind) {
            case TokenKind.Namespace:
            case TokenKind.Use:
            case TokenKind.HaltCompiler:
            case TokenKind.Const:
            case TokenKind.Function:
            case TokenKind.Class:
            case TokenKind.Abstract:
            case TokenKind.Final:
            case TokenKind.Trait:
            case TokenKind.Interface:
            case TokenKind.OpenBrace:
            case TokenKind.If:
            case TokenKind.While:
            case TokenKind.Do:
            case TokenKind.For:
            case TokenKind.Switch:
            case TokenKind.Break:
            case TokenKind.Continue:
            case TokenKind.Return:
            case TokenKind.Global:
            case TokenKind.Static:
            case TokenKind.Echo:
            case TokenKind.Unset:
            case TokenKind.ForEach:
            case TokenKind.Declare:
            case TokenKind.Try:
            case TokenKind.Throw:
            case TokenKind.Goto:
            case TokenKind.Name:
            case TokenKind.Semicolon:
            case TokenKind.CloseTag:
            case TokenKind.Text:
            case TokenKind.OpenTag:
            case TokenKind.OpenTagEcho:
                return true;
            default:
                return isExpressionStart(t);
        }
    }

}
