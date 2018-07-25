/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */

'use strict';

import { Token, Lexer, TokenKind, LexerMode, tokenKindToString } from './lexer';
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
        TokenKind.Use,
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
    var recoverSetStack: TokenKind[][];
    //offset is always set to the next token start even if it is trivia
    var offset = 0;

    export function parse(text: string): Phrase {
        init(text);
        const start = startOffset();
        const stmtList = topStatementList([TokenKind.EndOfFile]);
        //need trailing trivia
        const eof = next();
        return Phrase.create(PhraseKind.Script, lengthFrom(start), [stmtList, eof]);
    }

    function init(text: string, lexerModeStack?: LexerMode[]) {
        Lexer.setInput(text, lexerModeStack);
        tokenBuffer = [];
        recoverSetStack = [];
    }

    function optional(tokenType: TokenKind) {
        return tokenType === peek().kind ? next() : undefined;
    }

    function optionalOneOf(tokenTypes: TokenKind[]) {
        return tokenTypes.indexOf(peek().kind) > -1 ? next() : undefined;
    }

    /**
     * skips over whitespace, comments and doc comments
     * @param allowDocComment doc comments returned when true
     */
    function next(): Token {
        let t:Token;
        do {
            t = tokenBuffer.length > 0 ? tokenBuffer.shift() : Lexer.lex();
            offset += t.length;
        } while (t.kind >= TokenKind.Comment);
        return t;
    }

    function startOffset() {
        return offset + triviaLength(peek());
    }

    function triviaLength(t:Token) {
        let l = 0;
        while((t = t.previous) && t.kind >= TokenKind.DocumentComment) {
            l += t.length;
        }
        return l;
    }

    function lengthFrom(start:number) {
        return offset - start;
    }

    function expect(tokenType: TokenKind) {
        let t = peek();
        if (t.kind === tokenType) {
            return next();
        } else if (tokenType === TokenKind.Semicolon && t.kind === TokenKind.CloseTag) {
            //implicit end statement
            return next();
        } else {
            //test skipping a single token to sync
            if (peek(1).kind === tokenType) {
                const start = startOffset();
                return Phrase.createParseError([next(), next()], t, tokenType, lengthFrom(start));
            }
            return Phrase.createParseError([], t, tokenType);
        }
    }

    function expectOneOf(tokenTypes: TokenKind[]) {
        let t = peek();
        if (tokenTypes.indexOf(t.kind) > -1) {
            return next();
        } else if (tokenTypes.indexOf(TokenKind.Semicolon) > -1 && t.kind === TokenKind.CloseTag) {
            //implicit end statement
            return next();
        } else {
            //test skipping single token to sync
            if (tokenTypes.indexOf(peek(1).kind) > -1) {
                const start = startOffset();
                return Phrase.createParseError([next(), next()], t, undefined, lengthFrom(start));
            }
            return Phrase.createParseError([], t);
        }
    }

    function peek(n?: number) {

        n = n ? n + 1 : 1;
        let bufferPos = -1;
        let t: Token;

        do {

            ++bufferPos;
            if (bufferPos === tokenBuffer.length) {
                tokenBuffer.push(Lexer.lex());
            }

            t = tokenBuffer[bufferPos];

            if (t.kind < TokenKind.Comment) {
                //not a hidden token
                --n;
            }

        } while (t.kind !== TokenKind.EndOfFile && n > 0);

        return t;
    }

    function skip(until: Predicate, includeUntilTokenInSkipped?:boolean) {

        let t = peek();
        let skipped: Token[] = [];

        while(!until(t) && t.kind !== TokenKind.EndOfFile) {
            skipped.push(next());
            t = peek();
        }

        if(includeUntilTokenInSkipped && t.kind !== TokenKind.EndOfFile){
            skipped.push(next());
        }

        return skipped;
    }

    function list(phraseType: PhraseKind, elementFunction: () => Phrase | Token,
        elementStartPredicate: Predicate, breakOn?: TokenKind[], recoverSet?: TokenKind[], allowDocComment?: boolean) {
        const start = startOffset();
        let t: Token;
        let listRecoverSet = recoverSet ? recoverSet.slice(0) : [];
        let children: (Phrase | Token)[] = [];

        if (breakOn) {
            Array.prototype.push.apply(listRecoverSet, breakOn);
        }

        recoverSetStack.push(listRecoverSet);

        while (true) {

            t = peek();

            if (elementStartPredicate(t)) {
                children.push(elementFunction());
            } else if (!breakOn || breakOn.indexOf(t.kind) > -1) {
                break;
            } else {
                //error
                //attempt to skip single token to sync
                let t1 = peek(1);
                let errStart = startOffset();
                if (elementStartPredicate(t1) || (breakOn && breakOn.indexOf(t1.kind) > -1)) {
                    children.push(Phrase.createParseError([next()], t, undefined, lengthFrom(errStart)));
                } else {
                    //skip many to sync
                    children.push(Phrase.createParseError(defaultSyncStrategy(), t, undefined, lengthFrom(errStart)));
                    //only continue if recovered on a token in the listRecoverSet
                    t = peek(0);
                    if (listRecoverSet.indexOf(t.kind) < 0) {
                        break;
                    }
                }
            }

        }

        recoverSetStack.pop();
        return Phrase.create(phraseType, lengthFrom(start), children);

    }

    /**
     * default strategy is to skip tokens until a token in the combined recoverSetStack is found
     */
    function defaultSyncStrategy() {

        let mergedRecoverTokenTypeArray: TokenKind[] = [];

        for (let n = recoverSetStack.length - 1; n >= 0; --n) {
            Array.prototype.push.apply(mergedRecoverTokenTypeArray, recoverSetStack[n]);
        }

        let mergedRecoverTokenTypeSet = new Set(mergedRecoverTokenTypeArray);
        let predicate: Predicate = (x) => { return mergedRecoverTokenTypeSet.has(x.kind); };
        return skip(predicate);

    }

    function topStatementList(breakOn: TokenKind[]) {
        //@todo restrict some statements to top stmt list only
        breakOn.push(TokenKind.HaltCompiler);
        const stmtList = statementList(breakOn);
        stmtList.kind = PhraseKind.TopStatementList;
        if (peek().kind === TokenKind.HaltCompiler) {
            const halt = haltCompilerStatement();
            stmtList.children.push(halt);
        }
        return stmtList;
    }

    function statementList(breakOn: TokenKind[]): Phrase {
        return list(
            PhraseKind.StatementList,
            statement,
            isStatementStart,
            breakOn,
            statementListRecoverSet,
            true
        );
    }

    function constDeclaration() {
        const start = startOffset();
        const keyword = next();
        const list = delimitedList(
            PhraseKind.ConstElementList,
            constElement,
            isConstElementStartToken,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        );
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.ConstDeclaration, lengthFrom(start), [keyword, list, semicolon]);
    }

    function isClassConstElementStartToken(t: Token) {
        return t.kind === TokenKind.Name || isSemiReservedToken(t);
    }

    function isConstElementStartToken(t: Token) {
        return t.kind === TokenKind.Name;
    }

    function constElement() {
        const start = startOffset();
        const name = expect(TokenKind.Name);
        const equals = expect(TokenKind.Equals);
        const expr = expression(0);
        return Phrase.create(PhraseKind.ConstElement, lengthFrom(start), [name, equals, expr]);
    }

    function expression(minPrecedence: number): Phrase | Token {

        let precedence: number;
        let associativity: Associativity;
        const start = startOffset();
        let lhs = expressionAtom();
        let p: Phrase;
        let rhs: Phrase | Token;
        let op = peek();
        let binaryPhraseType = binaryOpToPhraseType(op);

        while (binaryPhraseType !== PhraseKind.Unknown) {

            [precedence, associativity] = precedenceAssociativityTuple(op);

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }

            if (binaryPhraseType === PhraseKind.TernaryExpression) {
                lhs = ternaryExpression(start, lhs);
                op = peek();
                binaryPhraseType = binaryOpToPhraseType(op);
                continue;
            }

            op = next();

            if (binaryPhraseType === PhraseKind.InstanceOfExpression) {
                rhs = typeDesignator(PhraseKind.InstanceofTypeDesignator);
                lhs = Phrase.create(binaryPhraseType, lengthFrom(start), [lhs, op, rhs]);
            } else if (
                binaryPhraseType === PhraseKind.SimpleAssignmentExpression &&
                peek().kind === TokenKind.Ampersand
            ) {
                const ampersand = next();
                rhs = expression(precedence);
                lhs = Phrase.create(PhraseKind.ByRefAssignmentExpression, lengthFrom(start), [lhs, op, ampersand, rhs]);
            } else {
                rhs = expression(precedence);
                lhs = Phrase.create(binaryPhraseType, lengthFrom(start), [lhs, op, rhs]);
            }

            op = peek();
            binaryPhraseType = binaryOpToPhraseType(op);

        }

        return lhs;

    }

    function ternaryExpression(start:number, testExpr: Phrase | Token) {

        const question = next();
        let colon: Token | ParseError = optional(TokenKind.Colon);
        let falseExpr: Phrase | Token;

        if (colon) {
            //short form
            falseExpr = expression(0);
            return Phrase.create(PhraseKind.TernaryExpression, lengthFrom(start), [testExpr, question, colon, falseExpr]);
        }

        const trueExpr = expression(0);
        colon = expect(TokenKind.Colon);
        falseExpr = expression(0);
        return Phrase.create(PhraseKind.TernaryExpression, lengthFrom(start), [testExpr, question, trueExpr, colon, falseExpr]);
    }

    function variableOrExpression() {
        const start = startOffset();
        let part = variableAtom();
        let isVariable = (<Phrase>part).kind === PhraseKind.SimpleVariable;

        if (isDereferenceOperator(peek())) {
            part = variable(start, part);
            isVariable = true;
        } else {

            switch ((<Phrase>part).kind) {
                case PhraseKind.QualifiedName:
                case PhraseKind.FullyQualifiedName:
                case PhraseKind.RelativeQualifiedName:
                    part = constantAccessExpression(start, part);
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
            return postfixExpression(start, PhraseKind.PostfixIncrementExpression, <Phrase>part);
        } else if (t.kind === TokenKind.MinusMinus) {
            return postfixExpression(start, PhraseKind.PostfixDecrementExpression, <Phrase>part);
        } else {
            return part;
        }

    }

    function constantAccessExpression(start:number, qName: Phrase | Token) {
        return Phrase.create(PhraseKind.ConstantAccessExpression, lengthFrom(start), [qName]);
    }

    function postfixExpression(start:number, phraseType: PhraseKind, variableNode: Phrase) {
        const op = next();
        return Phrase.create(phraseType, lengthFrom(start), [variableNode, op]);
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
                    return next();
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
                return next();
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
                return Phrase.createParseError([], t);
        }

    }

    function exitIntrinsic() {
        const start = startOffset();
        const keyword = next(); //exit or die
        const open = optional(TokenKind.OpenParenthesis);

        if (!open) {
            return Phrase.create(PhraseKind.ExitIntrinsic, lengthFrom(start), [keyword]);
        }

        if (!isExpressionStart(peek())) {
            const close = expect(TokenKind.CloseParenthesis);
            return Phrase.create(PhraseKind.ExitIntrinsic, lengthFrom(start), [keyword, open, close]);
        }
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.ExitIntrinsic, lengthFrom(start), [keyword, open, expr, close]);
    }

    function issetIntrinsic() {
        const start = startOffset();
        const keyword = next(); //isset
        const open = expect(TokenKind.OpenParenthesis);
        const list = variableList([TokenKind.CloseParenthesis]);
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.IssetIntrinsic, lengthFrom(start), [keyword, open, list, close]);
    }

    function emptyIntrinsic() {
        const start = startOffset();
        const keyword = next(); //empty
        const open = expect(TokenKind.OpenParenthesis);
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.EmptyIntrinsic, lengthFrom(start), [keyword, open, expr, close]);
    }

    function evalIntrinsic() {
        const start = startOffset();
        const keyword = next(); //eval
        const open = expect(TokenKind.OpenParenthesis);
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.EvalIntrinsic, lengthFrom(start), [keyword, open, expr, close]);
    }

    function scriptInclusion(phraseType: PhraseKind) {
        const start = startOffset();
        const keyword = next();
        const expr = expression(0);
        return Phrase.create(phraseType, lengthFrom(start), [keyword, expr]);
    }

    function printIntrinsic() {
        const start = startOffset();
        const keyword = next();
        const expr = expression(0);
        return Phrase.create(PhraseKind.PrintIntrinsic, lengthFrom(start), [keyword, expr]);
    }

    function yieldFromExpression() {
        const start = startOffset();
        const keyword = next();
        const expr = expression(0);
        return Phrase.create(PhraseKind.YieldFromExpression, lengthFrom(start), [keyword, expr]);
    }

    function yieldExpression() {
        const start = startOffset();
        const keyword = next();

        if (!isExpressionStart(peek())) {
            return Phrase.create(PhraseKind.YieldExpression, lengthFrom(start), [keyword]);
        }

        const keyOrValue = expression(0);
        const arrow = optional(TokenKind.FatArrow);

        if (!arrow) {
            return Phrase.create(PhraseKind.YieldExpression, lengthFrom(start), [keyword, keyOrValue]);
        }

        const value = expression(0);
        return Phrase.create(PhraseKind.YieldExpression, lengthFrom(start), [keyword, keyOrValue, arrow, value]);
    }

    function shellCommandExpression() {
        const start = startOffset();
        const open = next(); //`
        const list = encapsulatedVariableList(TokenKind.Backtick);
        const close = expect(TokenKind.Backtick);
        return Phrase.create(PhraseKind.ShellCommandExpression, lengthFrom(start), [open, list, close]);
    }

    function doubleQuotedStringLiteral() {
        const start = startOffset();
        const open = next(); //"
        const list = encapsulatedVariableList(TokenKind.DoubleQuote);
        const close = expect(TokenKind.DoubleQuote);
        return Phrase.create(PhraseKind.DoubleQuotedStringLiteral, lengthFrom(start), [open, list, close]);
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
                return next();
            case TokenKind.VariableName:
                {
                    let t = peek(1);
                    if (t.kind === TokenKind.OpenBracket) {
                        return encapsulatedDimension();
                    } else if (t.kind === TokenKind.Arrow) {
                        return encapsulatedProperty();
                    } else {
                        return simpleVariable();
                    }
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
        const start = startOffset();
        const open = next(); //{
        const vble = variable(start, variableAtom());
        const close = expect(TokenKind.CloseBrace);
        return Phrase.create(PhraseKind.EncapsulatedVariable, lengthFrom(start), [open, vble, close]);
    }

    function dollarCurlyOpenEncapsulatedVariable() {
        const start = startOffset();
        const open = next(); //${
        const t = peek();
        let expr: Phrase | Token;

        if (t.kind === TokenKind.VariableName) {
            if (peek(1).kind === TokenKind.OpenBracket) {
                expr = dollarCurlyEncapsulatedDimension();
            } else {
                const varStart = startOffset();
                const varName = next();
                expr = Phrase.create(PhraseKind.SimpleVariable, lengthFrom(varStart), [varName]);
            }
        } else if (isExpressionStart(t)) {
            expr = expression(0);
        } else {
            expr = Phrase.createParseError([], t);
        }

        const close = expect(TokenKind.CloseBrace);
        return Phrase.create(PhraseKind.EncapsulatedVariable, lengthFrom(start), [open, expr, close]);
    }

    function dollarCurlyEncapsulatedDimension() {
        const start = startOffset();
        const varName = next();
        const open = next(); // [
        const expr = expression(0);
        const close = expect(TokenKind.CloseBracket);
        return Phrase.create(PhraseKind.SubscriptExpression, lengthFrom(start), [varName, open, expr, close]);
    }

    function encapsulatedDimension() {
        const start = startOffset();
        const sv = simpleVariable(); //T_VARIABLE
        const open = next(); //[
        let expr: Phrase | Token;

        switch (peek().kind) {
            case TokenKind.Name:
            case TokenKind.IntegerLiteral:
                expr = next();
                break;
            case TokenKind.VariableName:
                expr = simpleVariable();
                break;
            case TokenKind.Minus:
                {
                    const exprStart = startOffset();
                    const minus = next();
                    const intLiteral = expect(TokenKind.IntegerLiteral);
                    expr = Phrase.create(PhraseKind.UnaryOpExpression, lengthFrom(exprStart), [minus, intLiteral]);
                }
                break;
            default:
                //error
                expr = Phrase.createParseError([], peek());
                break;
        }

        const close = expect(TokenKind.CloseBracket);
        return Phrase.create(PhraseKind.SubscriptExpression, lengthFrom(start), [sv, open, expr, close]);
    }

    function encapsulatedProperty() {
        const start = startOffset();
        const sv = simpleVariable();
        const arrow = next(); //->
        const name = expect(TokenKind.Name);
        return Phrase.create(PhraseKind.PropertyAccessExpression, lengthFrom(start), [sv, arrow, name]);
    }

    function heredocStringLiteral() {
        const start = startOffset();
        const startHeredoc = next();
        const list = encapsulatedVariableList(TokenKind.EndHeredoc);
        const endHeredoc = expect(TokenKind.EndHeredoc);
        return Phrase.create(PhraseKind.HeredocStringLiteral, lengthFrom(start), [startHeredoc, list, endHeredoc]);
    }

    function anonymousClassDeclaration() {
        const start = startOffset();
        const header = anonymousClassDeclarationHeader();
        const body = typeDeclarationBody(
            PhraseKind.ClassDeclarationBody, isClassMemberStart, classMemberDeclarationList
        );
        return Phrase.create(PhraseKind.AnonymousClassDeclaration, lengthFrom(start), [header, body]);
    }

    function anonymousClassDeclarationHeader() {
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        children.push(next()); //class
        const open = optional(TokenKind.OpenParenthesis);

        if (open) {
            children.push(open);
            if (isArgumentStart(peek())) {
                children.push(argumentList());
            }
            children.push(expect(TokenKind.CloseParenthesis));
        }

        if (peek().kind === TokenKind.Extends) {
            children.push(classBaseClause());
        }

        if (peek().kind === TokenKind.Implements) {
            children.push(classInterfaceClause());
        }

        return Phrase.create(PhraseKind.AnonymousClassDeclarationHeader, lengthFrom(start), children);
    }

    function classInterfaceClause() {
        const start = startOffset();
        const keyword = next(); //implements
        const list = qualifiedNameList([TokenKind.OpenBrace]);
        return Phrase.create(PhraseKind.ClassInterfaceClause, lengthFrom(start), [keyword, list]);
    }

    function classMemberDeclarationList() {
        return list(
            PhraseKind.ClassMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenKind.CloseBrace],
            classMemberDeclarationListRecoverSet,
            true
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

        const start = startOffset();
        let t = peek();

        switch (t.kind) {
            case TokenKind.Public:
            case TokenKind.Protected:
            case TokenKind.Private:
            case TokenKind.Static:
            case TokenKind.Abstract:
            case TokenKind.Final:
                {
                    const modifiers = memberModifierList();
                    t = peek();
                    if (t.kind === TokenKind.VariableName) {
                        return propertyDeclaration(modifiers);
                    } else if (t.kind === TokenKind.Function) {
                        return methodDeclaration(start, modifiers);
                    } else if (t.kind === TokenKind.Const) {
                        return classConstDeclaration(modifiers);
                    } else {
                        //error
                        return Phrase.createParseError([modifiers], t, undefined, lengthFrom(start));
                    }
                }
            case TokenKind.Function:
                return methodDeclaration(start);
            case TokenKind.Var:
                return propertyDeclaration(next());
            case TokenKind.Const:
                return classConstDeclaration();
            case TokenKind.Use:
                return traitUseClause();
            default:
                //should not get here
                throwUnexpectedTokenError(t);
        }

    }

    function throwUnexpectedTokenError(t: Token) {
        throw new Error(`Unexpected token: ${tokenKindToString(t.kind)}`);
    }

    function traitUseClause() {
        const start = startOffset();
        const use = next();
        const nameList = qualifiedNameList([TokenKind.Semicolon, TokenKind.OpenBrace]);
        const spec = traitUseSpecification();
        return Phrase.create(PhraseKind.TraitUseClause, lengthFrom(start), [use, nameList, spec]);
    }

    function traitUseSpecification() {
        const start = startOffset();
        const t = expectOneOf([TokenKind.Semicolon, TokenKind.OpenBrace]) as Token;

        if (t.kind !== TokenKind.OpenBrace) {
            return Phrase.create(PhraseKind.TraitUseSpecification, lengthFrom(start), [t]);
        }

        if (!isTraitAdaptationStart(peek())) {
            const close = expect(TokenKind.CloseBrace);
            return Phrase.create(PhraseKind.TraitUseSpecification, lengthFrom(start), [t, close]);
        }

        const adaptList = traitAdaptationList();
        const close = expect(TokenKind.CloseBrace);
        return Phrase.create(PhraseKind.TraitUseSpecification, lengthFrom(start), [t, adaptList, close]);
    }

    function traitAdaptationList() {
        return list(
            PhraseKind.TraitAdaptationList,
            traitAdaptation,
            isTraitAdaptationStart,
            [TokenKind.CloseBrace]
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

        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        let t = peek();
        let t2 = peek(1);

        if (t.kind === TokenKind.Namespace ||
            t.kind === TokenKind.Backslash ||
            (t.kind === TokenKind.Name &&
                (t2.kind === TokenKind.ColonColon || t2.kind === TokenKind.Backslash))) {

            children.push(methodReference());

            if (peek().kind === TokenKind.InsteadOf) {
                children.push(next());
                return traitPrecedence(start, children);
            }

        } else if (t.kind === TokenKind.Name || isSemiReservedToken(t)) {
            const methodRefStart = startOffset();
            const ident = identifier();
            children.push(Phrase.create(PhraseKind.MethodReference, lengthFrom(methodRefStart), [ident]));
        } else {
            //error
            return Phrase.createParseError([], t);
        }

        return traitAlias(start, children);
    }

    function traitAlias(start:number, children: (Phrase | Token)[]) {
        children.push(expect(TokenKind.As));
        let t = peek();

        if (t.kind === TokenKind.Name || isReservedToken(t)) {
            children.push(identifier());
        } else if (isMemberModifier(t)) {
            children.push(next());
            t = peek();
            if (t.kind === TokenKind.Name || isSemiReservedToken(t)) {
                children.push(identifier());
            }
        } else {
            children.push(Phrase.createParseError([], t));
        }

        children.push(expect(TokenKind.Semicolon));
        return Phrase.create(PhraseKind.TraitAlias, lengthFrom(start), children);
    }

    function traitPrecedence(start:number, children: (Phrase | Token)[]) {
        children.push(qualifiedNameList([TokenKind.Semicolon]));
        children.push(expect(TokenKind.Semicolon));
        return Phrase.create(PhraseKind.TraitPrecedence, lengthFrom(start), children);
    }

    function methodReference() {
        const start = startOffset();
        const name = qualifiedName();
        const op = expect(TokenKind.ColonColon);
        const ident = identifier();
        return Phrase.create(PhraseKind.MethodReference, lengthFrom(start), [name, op, ident]);
    }

    function methodDeclarationHeader(start:number, memberModifers?: Phrase) {
        const children: (Phrase | Token)[] = [];
        if (memberModifers) {
            children.push(memberModifers);
        }
        children.push(next()); //function
        const ampersand = optional(TokenKind.Ampersand);
        if (ampersand) {
            children.push(ampersand);
        }
        children.push(identifier());
        children.push(expect(TokenKind.OpenParenthesis));

        if (isParameterStart(peek())) {
            children.push(delimitedList(
                PhraseKind.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenKind.Comma,
                [TokenKind.CloseParenthesis]
            ));
        }

        children.push(expect(TokenKind.CloseParenthesis));

        if (peek().kind === TokenKind.Colon) {
            children.push(returnType());
        }

        return Phrase.create(PhraseKind.MethodDeclarationHeader, lengthFrom(start), children);
    }

    function methodDeclaration(start:number, memberModifers?: Phrase) {
        const header = methodDeclarationHeader(start, memberModifers);
        const body = methodDeclarationBody();
        return Phrase.create(PhraseKind.MethodDeclaration, lengthFrom(start), [header, body]);
    }

    function methodDeclarationBody() {
        const start = startOffset();
        let body: Phrase | Token;

        if (peek().kind === TokenKind.Semicolon) {
            body = next();
        } else {
            body = compoundStatement();
        }

        return Phrase.create(PhraseKind.MethodDeclarationBody, lengthFrom(start), [body]);
    }

    function identifier() {
        const start = startOffset();
        let ident: Phrase | Token = peek();

        if (ident.kind === TokenKind.Name || isSemiReservedToken(ident)) {
            ident = next();
        } else {
            ident = Phrase.createParseError([], ident);
        }

        return Phrase.create(PhraseKind.Identifier, lengthFrom(start), [ident]);
    }

    function interfaceDeclaration() {
        const start = startOffset();
        const header = interfaceDeclarationHeader();
        const body = typeDeclarationBody(
            PhraseKind.InterfaceDeclarationBody, isClassMemberStart, interfaceMemberDeclarations
        );
        return Phrase.create(PhraseKind.InterfaceDeclaration, lengthFrom(start), [header, body]);
    }

    function typeDeclarationBody<T extends Phrase>(phraseType: PhraseKind, elementStartPredicate: Predicate, listFunction: () => T) {
        const start = startOffset();
        const open = expect(TokenKind.OpenBrace);

        if (!elementStartPredicate(peek())) {
            const close = expect(TokenKind.CloseBrace);
            return Phrase.create(phraseType, lengthFrom(start), [open, close]);
        }

        const l = listFunction();
        const close = expect(TokenKind.CloseBrace);
        return Phrase.create(phraseType, lengthFrom(start), [open, l, close]);
    }

    function interfaceMemberDeclarations() {
        return list(
            PhraseKind.InterfaceMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenKind.CloseBrace],
            classMemberDeclarationListRecoverSet,
            true
        );
    }

    function interfaceDeclarationHeader() {
        const start = startOffset();
        const interfaceToken = next();
        const name = expect(TokenKind.Name);

        if (peek().kind !== TokenKind.Extends) {
            return Phrase.create(PhraseKind.InterfaceDeclarationHeader, lengthFrom(start), [interfaceToken, name]);
        }

        const base = interfaceBaseClause();
        return Phrase.create(PhraseKind.InterfaceDeclarationHeader, lengthFrom(start), [interfaceToken, name, base]);
    }

    function interfaceBaseClause() {
        const start = startOffset();
        const ext = next(); //extends
        const list = qualifiedNameList([TokenKind.OpenBrace]);
        return Phrase.create(PhraseKind.InterfaceBaseClause, lengthFrom(start), [ext, list]);
    }

    function traitDeclaration() {
        const start = startOffset();
        const header = traitDeclarationHeader();
        const body = typeDeclarationBody(
            PhraseKind.TraitDeclarationBody, isClassMemberStart, traitMemberDeclarations
        );
        return Phrase.create(PhraseKind.TraitDeclaration, lengthFrom(start), [header, body]);
    }

    function traitDeclarationHeader() {
        const start = startOffset();
        const traitToken = next(); //trait
        const name = expect(TokenKind.Name);
        return Phrase.create(PhraseKind.TraitDeclarationHeader, lengthFrom(start), [traitToken, name]);
    }

    function traitMemberDeclarations() {
        return list(
            PhraseKind.TraitMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenKind.CloseBrace],
            classMemberDeclarationListRecoverSet,
            true
        );
    }

    function functionDeclaration() {
        const start = startOffset();
        const header = functionDeclarationHeader();
        const body = functionDeclarationBody();
        return Phrase.create(PhraseKind.FunctionDeclaration, lengthFrom(start), [header, body]);
    }

    function functionDeclarationBody() {
        let cs = compoundStatement();
        cs.kind = PhraseKind.FunctionDeclarationBody;
        return cs;
    }

    function functionDeclarationHeader() {
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        children.push(next()); //function
        const amp = optional(TokenKind.Ampersand);

        if (amp) {
            children.push(amp);
        }

        children.push(expect(TokenKind.Name));
        children.push(expect(TokenKind.OpenParenthesis));

        if (isParameterStart(peek())) {
            children.push(delimitedList(
                PhraseKind.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenKind.Comma,
                [TokenKind.CloseParenthesis]
            ));
        }

        children.push(expect(TokenKind.CloseParenthesis));

        if (peek().kind === TokenKind.Colon) {
            children.push(returnType());
        }

        return Phrase.create(PhraseKind.FunctionDeclarationHeader, lengthFrom(start), children);
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
        const start = startOffset();
        const header = classDeclarationHeader();
        const body = typeDeclarationBody(
            PhraseKind.ClassDeclarationBody, isClassMemberStart, classMemberDeclarationList
        );
        return Phrase.create(PhraseKind.ClassDeclaration, lengthFrom(start), [header, body]);
    }

    function classDeclarationHeader() {
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        const mod = optionalOneOf([TokenKind.Abstract, TokenKind.Final]);

        if (mod) {
            children.push(mod);
        }

        children.push(expect(TokenKind.Class));
        children.push(expect(TokenKind.Name));

        if (peek().kind === TokenKind.Extends) {
            children.push(classBaseClause());
        }

        if (peek().kind === TokenKind.Implements) {
            children.push(classInterfaceClause());
        }

        return Phrase.create(PhraseKind.ClassDeclarationHeader, lengthFrom(start), children);
    }

    function classBaseClause() {
        const start = startOffset();
        const ext = next(); //extends
        const name = qualifiedName();
        return Phrase.create(PhraseKind.ClassBaseClause, lengthFrom(start), [ext, name]);
    }

    function compoundStatement() {
        const start = startOffset();
        const open = expect(TokenKind.OpenBrace);

        if (!isStatementStart(peek())) {
            const close = expect(TokenKind.CloseBrace);
            return Phrase.create(PhraseKind.CompoundStatement, lengthFrom(start), [open, close]);
        }

        const stmtList = statementList([TokenKind.CloseBrace]);
        const close = expect(TokenKind.CloseBrace);
        return Phrase.create(PhraseKind.CompoundStatement, lengthFrom(start), [open, stmtList, close]);
    }

    function isFunctionStatic(peek1: Token, peek2: Token) {
        return peek1.kind === TokenKind.VariableName &&
            (peek2.kind === TokenKind.Semicolon ||
                peek2.kind === TokenKind.Comma ||
                peek2.kind === TokenKind.CloseTag ||
                peek2.kind === TokenKind.Equals);
    }

    function isAnonFunction(peek1: Token, peek2: Token) {
        return peek1.kind === TokenKind.OpenParenthesis ||
            (peek1.kind === TokenKind.Ampersand && peek2.kind === TokenKind.OpenParenthesis);
    }

    function statement(): Phrase {

        let t = peek();

        switch (t.kind) {
            case TokenKind.Namespace:
                return namespaceDefinition();
            case TokenKind.Use:
                return namespaceUseDeclaration();
            case TokenKind.Const:
                return constDeclaration();
            case TokenKind.Function:
                if (isAnonFunction(peek(1), peek(2))) {
                    return expressionStatement();
                } else {
                    return functionDeclaration();
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
                if (isFunctionStatic(peek(1), peek(2))) {
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
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        const close = optional(TokenKind.CloseTag);
        const text = optional(TokenKind.Text);
        const open = optionalOneOf([TokenKind.OpenTagEcho, TokenKind.OpenTag]);

        if (close) {
            children.push(close);
        }

        if (text) {
            children.push(text);
        }

        if (open) {
            children.push(open);
        }

        return Phrase.create(PhraseKind.InlineText, lengthFrom(start), children);
    }

    function nullStatement() {
        const start = startOffset();
        const semicolon = next(); //;
        return Phrase.create(PhraseKind.NullStatement, lengthFrom(start), [semicolon]);
    }

    function isCatchClauseStart(t: Token) {
        return t.kind === TokenKind.Catch;
    }

    function tryStatement() {
        const start = startOffset();
        const tryToken = next();
        const compound = compoundStatement();

        let t = peek();
        let catchListOrFinally: Phrase | Token;

        if (t.kind === TokenKind.Catch) {
            catchListOrFinally = list(
                PhraseKind.CatchClauseList,
                catchClause,
                isCatchClauseStart
            );
        } else {
            if (t.kind === TokenKind.Finally) {
                catchListOrFinally = finallyClause();
            } else {
                catchListOrFinally = Phrase.createParseError([], t);
            }
            return Phrase.create(PhraseKind.TryStatement, lengthFrom(start), [tryToken, compound, catchListOrFinally]);
        }

        if (peek().kind !== TokenKind.Finally) {
            return Phrase.create(PhraseKind.TryStatement, lengthFrom(start), [tryToken, compound, catchListOrFinally]);
        }

        const finClause = finallyClause();
        return Phrase.create(PhraseKind.TryStatement, lengthFrom(start), [tryToken, compound, catchListOrFinally, finClause]);
    }

    function finallyClause() {
        const start = startOffset();
        const fin = next(); //finally
        const stmt = compoundStatement();
        return Phrase.create(PhraseKind.FinallyClause, lengthFrom(start), [fin, stmt]);
    }

    function catchClause() {
        const start = startOffset();
        const catchToken = next();
        const open = expect(TokenKind.OpenParenthesis);
        const delimList = delimitedList(
            PhraseKind.CatchNameList,
            qualifiedName,
            isQualifiedNameStart,
            TokenKind.Bar,
            [TokenKind.VariableName]
        );
        const varName = expect(TokenKind.VariableName);
        const close = expect(TokenKind.CloseParenthesis);
        const stmt = compoundStatement();
        return Phrase.create(PhraseKind.CatchClause, lengthFrom(start), [catchToken, open, delimList, varName, close, stmt]);
    }

    function declareDirective() {
        const start = startOffset();
        const name = expect(TokenKind.Name);
        const equals = expect(TokenKind.Equals);
        const literal = expectOneOf([TokenKind.IntegerLiteral, TokenKind.FloatingLiteral, TokenKind.StringLiteral]);
        return Phrase.create(PhraseKind.DeclareDirective, lengthFrom(start), [name, equals, literal]);
    }

    function declareStatement() {
        const start = startOffset();
        const declareToken = next();
        const open = expect(TokenKind.OpenParenthesis);
        const directive = declareDirective();
        const close = expect(TokenKind.CloseParenthesis);

        let t = peek();

        if (t.kind === TokenKind.Colon) {
            const colon = next(); //:
            const stmtList = statementList([TokenKind.EndDeclare]);
            const end = expect(TokenKind.EndDeclare);
            const semicolon = expect(TokenKind.Semicolon);
            return Phrase.create(PhraseKind.DeclareStatement, lengthFrom(start), [declareToken, open, directive, close, colon, stmtList, end, semicolon]);
        } else if (isStatementStart(t)) {
            const stmt = statement();
            return Phrase.create(PhraseKind.DeclareStatement, lengthFrom(start), [declareToken, open, directive, close, stmt]);
        } else if (t.kind === TokenKind.Semicolon) {
            const semicolon = next();
            return Phrase.create(PhraseKind.DeclareStatement, lengthFrom(start), [declareToken, open, directive, close, semicolon]);
        } else {
            const err = Phrase.createParseError([], t);
            return Phrase.create(PhraseKind.DeclareStatement, lengthFrom(start), [declareToken, open, directive, close, err]);
        }
    }

    function switchStatement() {
        const start = startOffset();
        const keyword = next(); //switch
        const open = expect(TokenKind.OpenParenthesis);
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);

        const colonOrBrace = expectOneOf([TokenKind.Colon, TokenKind.OpenBrace]);
        let tCase = peek();

        let stmtList: Phrase;
        if (tCase.kind === TokenKind.Case || tCase.kind === TokenKind.Default) {
            stmtList = caseStatements(
                (<Token>colonOrBrace).kind === TokenKind.Colon ? TokenKind.EndSwitch : TokenKind.CloseBrace
            );
        }

        if ((<Token>colonOrBrace).kind === TokenKind.Colon) {
            const endSwitch = expect(TokenKind.EndSwitch);
            const semicolon = expect(TokenKind.Semicolon);
            return Phrase.create(
                PhraseKind.SwitchStatement, 
                lengthFrom(start),
                stmtList ? [keyword, open, expr, close, colonOrBrace, stmtList, endSwitch, semicolon] :
                    [keyword, open, expr, close, colonOrBrace, endSwitch, semicolon],
            );
        } else {
            const braceClose = expect(TokenKind.CloseBrace);
            return Phrase.create(
                PhraseKind.SwitchStatement,
                lengthFrom(start),
                stmtList ? [keyword, open, expr, close, colonOrBrace, stmtList, braceClose] :
                    [keyword, open, expr, close, colonOrBrace, braceClose],
            );
        }
    }

    function caseStatements(breakOn: TokenKind) {
        const start = startOffset();
        let t: Token;
        const children: (Phrase | Token)[] = [];
        const caseBreakOn = [TokenKind.Case, TokenKind.Default];
        caseBreakOn.push(breakOn);
        recoverSetStack.push(caseBreakOn.slice(0));

        while (true) {

            t = peek();

            if (t.kind === TokenKind.Case) {
                children.push(caseStatement(caseBreakOn));
            } else if (t.kind === TokenKind.Default) {
                children.push(defaultStatement(caseBreakOn));
            } else if (breakOn === t.kind) {
                break;
            } else {
                let skipped = defaultSyncStrategy();
                let errStart = startOffset();
                children.push(Phrase.createParseError(skipped, t, undefined, lengthFrom(errStart)));
                if (caseBreakOn.indexOf(peek().kind) > -1) {
                    continue;
                }
                break;
            }

        }

        recoverSetStack.pop();
        return Phrase.create(PhraseKind.CaseStatementList, lengthFrom(start), children);
    }

    function caseStatement(breakOn: TokenKind[]) {
        const start = startOffset();
        const keyword = next(); //case
        const expr = expression(0);
        const colonOrSemicolon = expectOneOf([TokenKind.Colon, TokenKind.Semicolon]);

        if (!isStatementStart(peek())) {
            return Phrase.create(PhraseKind.CaseStatement, lengthFrom(start), [keyword, expr, colonOrSemicolon]);
        }

        const stmtList = statementList(breakOn);
        return Phrase.create(PhraseKind.CaseStatement, lengthFrom(start), [keyword, expr, colonOrSemicolon, stmtList]);
    }

    function defaultStatement(breakOn: TokenKind[]) {
        const start = startOffset();
        const keyword = next(); //default
        const colonOrSemicolon = expectOneOf([TokenKind.Colon, TokenKind.Semicolon]);
        if (!isStatementStart(peek())) {
            return Phrase.create(PhraseKind.CaseStatement, lengthFrom(start), [keyword, colonOrSemicolon]);
        }

        const stmtList = statementList(breakOn);
        return Phrase.create(PhraseKind.CaseStatement, lengthFrom(start), [keyword, colonOrSemicolon, stmtList]);
    }

    function namedLabelStatement() {
        const start = startOffset();
        const name = next();
        const colon = next();
        return Phrase.create(PhraseKind.NamedLabelStatement, lengthFrom(start), [name, colon]);
    }

    function gotoStatement() {
        const start = startOffset();
        const keyword = next(); //goto
        const name = expect(TokenKind.Name);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.GotoStatement, lengthFrom(start), [keyword, name, semicolon]);
    }

    function throwStatement() {
        const start = startOffset();
        const keyword = next(); //throw
        const expr = expression(0);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.ThrowStatement, lengthFrom(start), [keyword, expr, semicolon]);
    }

    function foreachCollection() {
        const start = startOffset();
        let expr = expression(0);
        return Phrase.create(PhraseKind.ForeachCollection, lengthFrom(start), [expr]);
    }

    function foreachKeyOrValue() {
        const start = startOffset();
        const expr = expression(0);
        const arrow = optional(TokenKind.FatArrow);
        if (!arrow) {
            return Phrase.create(PhraseKind.ForeachValue, lengthFrom(start), [expr]);
        }
        return Phrase.create(PhraseKind.ForeachKey, lengthFrom(start), [expr, arrow]);
    }

    function foreachValue() {
        const start = startOffset();
        const amp = optional(TokenKind.Ampersand);
        const expr = expression(0);
        return Phrase.create(PhraseKind.ForeachValue, lengthFrom(start), amp ? [amp, expr] : [expr]);
    }

    function foreachStatement() {
        const start = startOffset();
        const foreachToken = next(); //foreach
        const open = expect(TokenKind.OpenParenthesis);
        const collection = foreachCollection();
        const asToken = expect(TokenKind.As);
        const keyOrValue = peek().kind === TokenKind.Ampersand ? foreachValue() : foreachKeyOrValue();
        let val: Phrase;

        if (keyOrValue.kind === PhraseKind.ForeachKey) {
            val = foreachValue();
        }

        const close = expect(TokenKind.CloseParenthesis);
        let t = peek();

        if (t.kind === TokenKind.Colon) {
            const colon = next();
            const stmtList = statementList([TokenKind.EndForeach]);
            const endForeach = expect(TokenKind.EndForeach);
            const semicolon = expect(TokenKind.Semicolon);
            return Phrase.create(
                PhraseKind.ForeachStatement,
                lengthFrom(start),
                val ? [foreachToken, open, collection, asToken, keyOrValue, val, close, colon, stmtList, endForeach, semicolon] :
                    [foreachToken, open, collection, asToken, keyOrValue, close, colon, stmtList, endForeach, semicolon],
            );
        } else if (isStatementStart(t)) {
            const stmt = statement();
            return Phrase.create(
                PhraseKind.ForeachStatement,
                lengthFrom(start),
                val ? [foreachToken, open, collection, asToken, keyOrValue, val, close, stmt] :
                    [foreachToken, open, collection, asToken, keyOrValue, close, stmt],
            );
        } else {
            const err = Phrase.createParseError([], t);
            return Phrase.create(
                PhraseKind.ForeachStatement,
                lengthFrom(start),
                val ? [foreachToken, open, collection, asToken, keyOrValue, val, close, err] :
                    [foreachToken, open, collection, asToken, keyOrValue, close, err],
            );
        }
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
        return variable(startOffset(), variableAtom());
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
        const start = startOffset();
        const keyword = next(); //unset
        const open = expect(TokenKind.OpenParenthesis);
        const varList = variableList([TokenKind.CloseParenthesis]);
        const close = expect(TokenKind.CloseParenthesis);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.UnsetIntrinsic, lengthFrom(start), [keyword, open, varList, close, semicolon]);
    }

    function expressionInitial() {
        return expression(0);
    }

    function echoIntrinsic() {
        const start = startOffset();
        const keyword = next(); //echo or <?=
        const exprList = delimitedList(
            PhraseKind.ExpressionList,
            expressionInitial,
            isExpressionStart,
            TokenKind.Comma
        );
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.EchoIntrinsic, lengthFrom(start), [keyword, exprList, semicolon]);
    }

    function isStaticVariableDclarationStart(t: Token) {
        return t.kind === TokenKind.VariableName;
    }

    function functionStaticDeclaration() {
        const start = startOffset();
        const keyword = next(); //static
        const varList = delimitedList(
            PhraseKind.StaticVariableDeclarationList,
            staticVariableDeclaration,
            isStaticVariableDclarationStart,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        );
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.FunctionStaticDeclaration, lengthFrom(start), [keyword, varList, semicolon]);
    }

    function globalDeclaration() {
        const start = startOffset();
        const keyword = next(); //global
        const varList = delimitedList(
            PhraseKind.VariableNameList,
            simpleVariable,
            isSimpleVariableStart,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        );
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.GlobalDeclaration, lengthFrom(start), [keyword, varList, semicolon]);
    }

    function isSimpleVariableStart(t: Token) {
        return t.kind === TokenKind.VariableName || t.kind === TokenKind.Dollar;
    }

    function staticVariableDeclaration() {
        const start = startOffset();
        const varName = expect(TokenKind.VariableName);

        if (peek().kind !== TokenKind.Equals) {
            return Phrase.create(PhraseKind.StaticVariableDeclaration, lengthFrom(start), [varName]);
        }

        const init = functionStaticInitialiser();
        return Phrase.create(PhraseKind.StaticVariableDeclaration, lengthFrom(start), [varName, init]);

    }

    function functionStaticInitialiser() {
        const start = startOffset();
        const equals = next();
        const expr = expression(0);
        return Phrase.create(PhraseKind.FunctionStaticInitialiser, lengthFrom(start), [equals, expr]);
    }

    function continueStatement() {
        const start = startOffset();
        const keyword = next(); //break/continue
        if (!isExpressionStart(peek())) {
            const semicolon = expect(TokenKind.Semicolon);
            return Phrase.create(PhraseKind.ContinueStatement, lengthFrom(start), [keyword, semicolon]);
        }

        const expr = expression(0);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.ContinueStatement, lengthFrom(start), [keyword, expr, semicolon]);

    }

    function breakStatement() {
        const start = startOffset();
        const keyword = next(); //break/continue

        if (!isExpressionStart(peek())) {
            const semicolon = expect(TokenKind.Semicolon);
            return Phrase.create(PhraseKind.BreakStatement, lengthFrom(start), [keyword, semicolon]);
        }

        const expr = expression(0);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.BreakStatement, lengthFrom(start), [keyword, expr, semicolon]);
    }

    function returnStatement() {
        const start = startOffset();
        const keyword = next(); //return

        if (!isExpressionStart(peek())) {
            const semicolon = expect(TokenKind.Semicolon);
            return Phrase.create(PhraseKind.ReturnStatement, lengthFrom(start), [keyword, semicolon]);
        }

        const expr = expression(0);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.ReturnStatement, lengthFrom(start), [keyword, expr, semicolon]);
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
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        const forToken = next();
        children.push(forToken);
        children.push(expect(TokenKind.OpenParenthesis));

        if (isExpressionStart(peek())) {
            children.push(forExpressionGroup(PhraseKind.ForInitialiser, [TokenKind.Semicolon]));
        }

        children.push(expect(TokenKind.Semicolon));

        if (isExpressionStart(peek())) {
            children.push(forExpressionGroup(PhraseKind.ForControl, [TokenKind.Semicolon]));
        }

        children.push(expect(TokenKind.Semicolon));

        if (isExpressionStart(peek())) {
            children.push(forExpressionGroup(PhraseKind.ForEndOfLoop, [TokenKind.CloseParenthesis]));
        }

        children.push(expect(TokenKind.CloseParenthesis));

        let t = peek();

        if (t.kind === TokenKind.Colon) {
            children.push(next());
            children.push(statementList([TokenKind.EndFor]));
            children.push(expect(TokenKind.EndFor));
            children.push(expect(TokenKind.Semicolon));
        } else if (isStatementStart(peek())) {
            children.push(statement());
        } else {
            children.push(Phrase.createParseError([], t));
        }

        return Phrase.create(PhraseKind.ForStatement, lengthFrom(start), children);
    }

    function doStatement() {
        const start = startOffset();
        const doToken = next(); // do
        const stmt = statement();
        const whileToken = expect(TokenKind.While);
        const open = expect(TokenKind.OpenParenthesis);
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.DoStatement, lengthFrom(start), [doToken, stmt, whileToken, open, expr, close, semicolon]);
    }

    function whileStatement() {
        const start = startOffset();
        const whileToken = next(); //while
        const open = expect(TokenKind.OpenParenthesis);
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);

        let t = peek();

        if (t.kind === TokenKind.Colon) {
            const colon = next();
            const stmtList = statementList([TokenKind.EndWhile]);
            const endWhile = expect(TokenKind.EndWhile);
            const semicolon = expect(TokenKind.Semicolon);
            return Phrase.create(
                PhraseKind.WhileStatement,
                lengthFrom(start),
                [whileToken, open, expr, close, colon, stmtList, endWhile, semicolon],
            );
        } else if (isStatementStart(t)) {
            const stmt = statement();
            return Phrase.create(
                PhraseKind.WhileStatement,
                lengthFrom(start),
                [whileToken, open, expr, close, stmt],
            );
        } else {
            //error
            const err = Phrase.createParseError([], t);
            return Phrase.create(
                PhraseKind.WhileStatement,
                lengthFrom(start),
                [whileToken, open, expr, close, err],
            );
        }
    }

    function elseIfClause1() {
        const start = startOffset();
        const keyword = next(); //elseif
        const open = expect(TokenKind.OpenParenthesis);
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);
        const stmt = statement();
        return Phrase.create(PhraseKind.ElseIfClause, lengthFrom(start), [keyword, open, expr, close, stmt]);
    }

    function elseIfClause2() {
        const start = startOffset();
        const keyword = next(); //elseif
        const open = expect(TokenKind.OpenParenthesis);
        const expr = expression(0);
        const close = expect(TokenKind.CloseParenthesis);
        const colon = expect(TokenKind.Colon);
        const stmtList = statementList([TokenKind.EndIf, TokenKind.Else, TokenKind.ElseIf]);
        return Phrase.create(PhraseKind.ElseIfClause, lengthFrom(start), [keyword, open, expr, close, colon, stmtList]);
    }

    function elseClause1() {
        const start = startOffset();
        const keyword = next(); //else
        const stmt = statement();
        return Phrase.create(PhraseKind.ElseClause, lengthFrom(start), [keyword, stmt]);
    }

    function elseClause2() {
        const start = startOffset();
        const keyword = next(); //else
        const colon = expect(TokenKind.Colon);
        const stmtList = statementList([TokenKind.EndIf]);
        return Phrase.create(PhraseKind.ElseClause, lengthFrom(start), [keyword, colon, stmtList]);
    }

    function isElseIfClauseStart(t: Token) {
        return t.kind === TokenKind.ElseIf;
    }

    function ifStatement() {
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        const ifToken = next();
        children.push(ifToken);
        children.push(expect(TokenKind.OpenParenthesis));
        children.push(expression(0));
        children.push(expect(TokenKind.CloseParenthesis));

        let t = peek();
        let elseIfClauseFunction = elseIfClause1;
        let elseClauseFunction = elseClause1;
        let expectEndIf = false;

        if (t.kind === TokenKind.Colon) {
            children.push(next());
            children.push(statementList([TokenKind.ElseIf, TokenKind.Else, TokenKind.EndIf]));
            elseIfClauseFunction = elseIfClause2;
            elseClauseFunction = elseClause2;
            expectEndIf = true;
        } else if (isStatementStart(t)) {
            children.push(statement());
        } else {
            children.push(Phrase.createParseError([], t));
        }

        if (peek().kind === TokenKind.ElseIf) {
            children.push(list(
                PhraseKind.ElseIfClauseList,
                elseIfClauseFunction,
                isElseIfClauseStart
            ));
        }

        if (peek().kind === TokenKind.Else) {
            children.push(elseClauseFunction());
        }

        if (expectEndIf) {
            children.push(expect(TokenKind.EndIf));
            children.push(expect(TokenKind.Semicolon));
        }

        return Phrase.create(PhraseKind.IfStatement, lengthFrom(start), children);
    }

    function expressionStatement() {
        const start = startOffset();
        const expr = expression(0);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.ExpressionStatement, lengthFrom(start), [expr, semicolon]);
    }

    function returnType() {
        const start = startOffset();
        const colon = next(); //:
        const typeDecl = typeDeclaration();
        return Phrase.create(PhraseKind.ReturnType, lengthFrom(start), [colon, typeDecl]);
    }

    function typeDeclaration() {
        const start = startOffset();
        const question = optional(TokenKind.Question);
        let decl: Phrase | Token;

        switch (peek().kind) {
            case TokenKind.Callable:
            case TokenKind.Array:
                decl = next();
                break;
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.Backslash:
                decl = qualifiedName();
                break;
            default:
                decl = Phrase.createParseError([], peek());
                break;
        }

        return Phrase.create(PhraseKind.TypeDeclaration, lengthFrom(start), question ? [question, decl] : [decl]);
    }

    function classConstDeclaration(modifiers?: Phrase) {
        const start = startOffset();
        const constToken = next();
        const delimList = delimitedList(
            PhraseKind.ClassConstElementList,
            classConstElement,
            isClassConstElementStartToken,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        );
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(
            PhraseKind.ClassConstDeclaration,
            lengthFrom(start),
            modifiers ? [modifiers, constToken, delimList, semicolon] : [constToken, delimList, semicolon]
        );
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
        const start = startOffset();
        const ident = identifier();
        const equals = expect(TokenKind.Equals);
        const expr = expression(0);
        return Phrase.create(PhraseKind.ClassConstElement, lengthFrom(start), [ident, equals, expr]);
    }

    function isPropertyElementStart(t: Token) {
        return t.kind === TokenKind.VariableName;
    }

    function propertyDeclaration(modifiersOrVar: Phrase | Token) {
        const start = startOffset();
        const delimList = delimitedList(
            PhraseKind.PropertyElementList,
            propertyElement,
            isPropertyElementStart,
            TokenKind.Comma,
            [TokenKind.Semicolon]
        );
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.PropertyDeclaration, lengthFrom(start), [modifiersOrVar, delimList, semicolon]);
    }

    function propertyElement() {
        const start = startOffset();
        const varName = expect(TokenKind.VariableName);

        if (peek().kind !== TokenKind.Equals) {
            return Phrase.create(PhraseKind.PropertyElement, lengthFrom(start), [varName]);
        }

        const initialiser = propertyInitialiser();
        return Phrase.create(PhraseKind.PropertyElement, lengthFrom(start), [varName, initialiser]);
    }

    function propertyInitialiser() {
        const start = startOffset();
        const equals = next();
        const expr = expression(0);
        return Phrase.create(PhraseKind.PropertyInitialiser, lengthFrom(start), [equals, expr]);
    }

    function memberModifierList() {
        const start = startOffset();
        let children: (Phrase | Token)[] = [];
        while (isMemberModifier(peek())) {
            children.push(next());
        }
        return Phrase.create(PhraseKind.MemberModifierList, lengthFrom(start), children);
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
        const start = startOffset();
        const newToken = next();
        if (peek().kind === TokenKind.Class) {
            const anonClass = anonymousClassDeclaration();
            return Phrase.create(PhraseKind.ObjectCreationExpression, lengthFrom(start), [newToken, anonClass]);
        }

        const typeDes = typeDesignator(PhraseKind.ClassTypeDesignator);
        const open = optional(TokenKind.OpenParenthesis);

        if (!open) {
            return Phrase.create(PhraseKind.ObjectCreationExpression, lengthFrom(start), [newToken, typeDes]);
        }

        if (!isArgumentStart(peek())) {
            const close = expect(TokenKind.CloseParenthesis);
            return Phrase.create(PhraseKind.ObjectCreationExpression, lengthFrom(start), [newToken, typeDes, open, close]);
        }

        const argList = argumentList();
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(
            PhraseKind.ObjectCreationExpression,
            lengthFrom(start),
            [newToken, typeDes, open, argList, close]
        );

    }

    function typeDesignator(phraseType: PhraseKind) {

        const start = startOffset();
        let part = classTypeDesignatorAtom();

        while (true) {

            switch (peek().kind) {
                case TokenKind.OpenBracket:
                    part = subscriptExpression(start, part, TokenKind.CloseBracket);
                    continue;
                case TokenKind.OpenBrace:
                    part = subscriptExpression(start, part, TokenKind.CloseBrace);
                    continue;
                case TokenKind.Arrow:
                    part = propertyAccessExpression(start, part);
                    continue;
                case TokenKind.ColonColon:
                    {
                        const op = next(); //::
                        const name = restrictedScopedMemberName();
                        part = Phrase.create(PhraseKind.ScopedPropertyAccessExpression, lengthFrom(start), [part, op, name]);
                    }
                    continue;
                default:
                    break;
            }

            break;
        }

        return Phrase.create(phraseType, lengthFrom(start), [part]);
    }

    function restrictedScopedMemberName() {
        const start = startOffset();
        let t = peek();
        let name: Phrase | Token;

        switch (t.kind) {
            case TokenKind.VariableName:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                name = next();
                break;
            case TokenKind.Dollar:
                name = simpleVariable();
                break;
            default:
                name = Phrase.createParseError([], t);
                break;
        }

        return Phrase.create(PhraseKind.ScopedMemberName, lengthFrom(start), [name]);

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
                return Phrase.createParseError([], t);
        }

    }

    function cloneExpression() {
        const start = startOffset();
        const keyword = next(); //clone
        const expr = expression(0);
        return Phrase.create(PhraseKind.CloneExpression, lengthFrom(start), [keyword, expr]);
    }

    function isArrayElementStartOrComma(t: Token) {
        return isArrayElementStart(t) || t.kind === TokenKind.Comma;
    }

    function listIntrinsic() {
        const start = startOffset();
        const keyword = next(); //list
        const open = expect(TokenKind.OpenParenthesis);
        //list must not be empty in php7+ but allow it for backwards compatibility
        if (!isArrayElementStartOrComma(peek())) {
            const close = expect(TokenKind.CloseParenthesis);
            return Phrase.create(PhraseKind.ListIntrinsic, lengthFrom(start), [keyword, open, close]);
        }

        const arrayList = arrayInitialiserList(TokenKind.CloseParenthesis);
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.ListIntrinsic, lengthFrom(start), [keyword, open, arrayList, close]);
    }

    function unaryExpression(phraseType: PhraseKind) {
        const start = startOffset();
        const op = next();
        let vbl: Phrase | Token;

        switch (phraseType) {
            case PhraseKind.PrefixDecrementExpression:
            case PhraseKind.PrefixIncrementExpression:
                vbl = variable(start, variableAtom());
                break;
            default:
                vbl = expression(precedenceAssociativityTuple(op)[0]);
                break;
        }

        return Phrase.create(phraseType, lengthFrom(start), [op, vbl]);

    }

    function anonymousFunctionHeader() {
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        const stat = optional(TokenKind.Static);
        if (stat) {
            children.push(stat);
        }
        children.push(next()); //function
        const amp = optional(TokenKind.Ampersand);
        if (amp) {
            children.push(amp);
        }
        children.push(expect(TokenKind.OpenParenthesis));

        if (isParameterStart(peek())) {
            children.push(delimitedList(
                PhraseKind.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenKind.Comma,
                [TokenKind.CloseParenthesis]
            ));
        }

        children.push(expect(TokenKind.CloseParenthesis));

        if (peek().kind === TokenKind.Use) {
            children.push(anonymousFunctionUseClause());
        }

        if (peek().kind === TokenKind.Colon) {
            children.push(returnType());
        }

        return Phrase.create(PhraseKind.AnonymousFunctionHeader, lengthFrom(start), children);

    }

    function anonymousFunctionCreationExpression() {
        const start = startOffset();
        const header = anonymousFunctionHeader();
        const body = functionDeclarationBody();
        return Phrase.create(PhraseKind.AnonymousFunctionCreationExpression, lengthFrom(start), [header, body]);
    }

    function isAnonymousFunctionUseVariableStart(t: Token) {
        return t.kind === TokenKind.VariableName || t.kind === TokenKind.Ampersand;
    }

    function anonymousFunctionUseClause() {
        const start = startOffset();
        const use = next();
        const open = expect(TokenKind.OpenParenthesis);
        const delimList = delimitedList(
            PhraseKind.ClosureUseList,
            anonymousFunctionUseVariable,
            isAnonymousFunctionUseVariableStart,
            TokenKind.Comma,
            [TokenKind.CloseParenthesis]
        );
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.AnonymousFunctionUseClause, lengthFrom(start), [use, open, delimList, close]);
    }

    function anonymousFunctionUseVariable() {
        const start = startOffset();
        const amp = optional(TokenKind.Ampersand);
        const varName = expect(TokenKind.VariableName);
        return Phrase.create(PhraseKind.AnonymousFunctionUseVariable, lengthFrom(start), amp ? [amp, varName] : [varName]);
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
        const start = startOffset();
        const children: (Phrase | Token)[] = [];

        if (isTypeDeclarationStart(peek())) {
            children.push(typeDeclaration());
        }

        const amp = optional(TokenKind.Ampersand);
        if (amp) {
            children.push(amp);
        }
        const ellip = optional(TokenKind.Ellipsis);
        if (ellip) {
            children.push(ellip);
        }
        children.push(expect(TokenKind.VariableName));

        if (peek().kind === TokenKind.Equals) {
            children.push(defaultArgumentSpecifier());
        }

        return Phrase.create(PhraseKind.ParameterDeclaration, lengthFrom(start), children);
    }

    function defaultArgumentSpecifier() {
        const start = startOffset();
        const equals = next();
        const expr = expression(0);
        return Phrase.create(PhraseKind.DefaultArgumentSpecifier, lengthFrom(start), [equals, expr]);
    }

    function variable(start:number, variableAtomNode: Phrase | Token) {

        let count = 0;

        while (true) {
            ++count;
            switch (peek().kind) {
                case TokenKind.ColonColon:
                    variableAtomNode = scopedAccessExpression(start, variableAtomNode);
                    continue;
                case TokenKind.Arrow:
                    variableAtomNode = propertyOrMethodAccessExpression(start, variableAtomNode);
                    continue;
                case TokenKind.OpenBracket:
                    variableAtomNode = subscriptExpression(start, variableAtomNode, TokenKind.CloseBracket);
                    continue;
                case TokenKind.OpenBrace:
                    variableAtomNode = subscriptExpression(start, variableAtomNode, TokenKind.CloseBrace);
                    continue;
                case TokenKind.OpenParenthesis:
                    variableAtomNode = functionCallExpression(start, variableAtomNode);
                    continue;
                default:
                    //only simple variable atoms qualify as variables on their own
                    if (count === 1 && (<Phrase>variableAtomNode).kind !== PhraseKind.SimpleVariable) {
                        variableAtomNode = Phrase.createParseError([variableAtomNode], peek(), undefined, lengthFrom(start));
                    }
                    break;
            }

            break;
        }

        return variableAtomNode;
    }

    function functionCallExpression(start:number, lhs: Phrase | Token) {
        const open = expect(TokenKind.OpenParenthesis);
        if (!isArgumentStart(peek())) {
            const close = expect(TokenKind.CloseParenthesis);
            return Phrase.create(PhraseKind.FunctionCallExpression, lengthFrom(start), [lhs, open, close]);
        }
        const argList = argumentList();
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.FunctionCallExpression, lengthFrom(start), [lhs, open, argList, close]);
    }

    function scopedAccessExpression(start:number, lhs: Phrase | Token) {
        const op = next() //::
        const memberNamePhraseTypeTuple = scopedMemberName();
        const open = optional(TokenKind.OpenParenthesis);

        if (open) {
            if (!isArgumentStart(peek())) {
                const close = expect(TokenKind.CloseParenthesis);
                return Phrase.create(PhraseKind.ScopedCallExpression, lengthFrom(start), [lhs, op, memberNamePhraseTypeTuple[0], open, close]);
            }

            const argList = argumentList();
            const close = expect(TokenKind.CloseParenthesis);
            return Phrase.create(PhraseKind.ScopedCallExpression, lengthFrom(start), [lhs, op, memberNamePhraseTypeTuple[0], open, argList, close]);
        } else if (memberNamePhraseTypeTuple[1] === PhraseKind.ScopedCallExpression) {
            //error
            let err = Phrase.createParseError([], peek(), TokenKind.OpenParenthesis);
            return Phrase.create(PhraseKind.ScopedCallExpression, lengthFrom(start), [lhs, op, memberNamePhraseTypeTuple[0], err]);
        }

        return Phrase.create(memberNamePhraseTypeTuple[1], lengthFrom(start), [lhs, op, memberNamePhraseTypeTuple[0]]);
    }

    function scopedMemberName(): [Phrase | Token, PhraseKind] {
        const start = startOffset();
        let t = peek();
        const tup: [Phrase, PhraseKind] = [undefined, PhraseKind.ScopedCallExpression];
        let name: Phrase | Token;

        switch (t.kind) {
            case TokenKind.OpenBrace:
                tup[1] = PhraseKind.ScopedCallExpression;
                name = encapsulatedExpression(TokenKind.OpenBrace, TokenKind.CloseBrace);
                break;
            case TokenKind.VariableName:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                tup[1] = PhraseKind.ScopedPropertyAccessExpression;
                name = next();
                break;
            case TokenKind.Dollar:
                name = simpleVariable();
                tup[1] = PhraseKind.ScopedPropertyAccessExpression;
                break;
            default:
                if (t.kind === TokenKind.Name || isSemiReservedToken(t)) {
                    name = identifier();
                    tup[1] = PhraseKind.ClassConstantAccessExpression;
                } else {
                    //error
                    name = Phrase.createParseError([], t);
                }
                break;
        }

        tup[0] = Phrase.create(PhraseKind.ScopedMemberName, lengthFrom(start), [name]);
        return tup;
    }

    function propertyAccessExpression(start:number, lhs: Phrase | Token) {
        const op = next(); //->
        const name = memberName();
        return Phrase.create(PhraseKind.PropertyAccessExpression, lengthFrom(start), [lhs, op, name]);
    }

    function propertyOrMethodAccessExpression(start: number, lhs: Phrase | Token) {
        const op = next(); //->
        const name = memberName();
        const open = optional(TokenKind.OpenParenthesis);
        
        if (!open) {
            return Phrase.create(PhraseKind.PropertyAccessExpression, lengthFrom(start), [lhs, op, name]);
        }

        if (!isArgumentStart(peek())) {
            const close = expect(TokenKind.CloseParenthesis);
            return Phrase.create(PhraseKind.MethodCallExpression, lengthFrom(start), [lhs, op, name, open, close]);
        }

        const argList = argumentList();
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.MethodCallExpression, lengthFrom(start), [lhs, op, name, open, argList, close]);
    }

    function memberName() {
        const start = startOffset();
        let name: Phrase | Token;

        switch (peek().kind) {
            case TokenKind.Name:
                name = next();
                break;
            case TokenKind.OpenBrace:
                name = encapsulatedExpression(TokenKind.OpenBrace, TokenKind.CloseBrace);
                break;
            case TokenKind.Dollar:
            case TokenKind.VariableName:
                name = simpleVariable();
                break;
            default:
                name = Phrase.createParseError([], peek());
                break;
        }

        return Phrase.create(PhraseKind.MemberName, lengthFrom(start), [name]);
    }

    function createSkipUntilMatchingBracePredicate() {
        let openBraceCount = 1;
        return (t: Token) => {
            if (t.kind === TokenKind.OpenBrace) {
                ++openBraceCount;
            } else if (t.kind === TokenKind.CloseBrace && --openBraceCount === 0) {
                return true;
            }
            return false;
        }
    }

    function subscriptExpression(start:number, lhs: Phrase | Token, closeTokenType: TokenKind) {
        const open = next(); // [ or {

        if (open.kind === TokenKind.OpenBrace) {
            const expr = expression(0);
            const close = expect(closeTokenType);
            if (close.kind === PhraseKind.Error) {

                //errors within {} subscript can happen when a
                //control construct keyword is mistaken for a member name
                //eg 
                //$this->
                //if($bool) { stmtlist }
                //skip until matching close brace to recover
                const errStart = startOffset();
                const skipFn = createSkipUntilMatchingBracePredicate();
                const skipped = skip(skipFn, true);
                Array.prototype.push.apply((<Phrase>close).children, skipped);
                (<Phrase>close).length = lengthFrom(errStart);
            }
            return Phrase.create(PhraseKind.SubscriptExpression, lengthFrom(start), [lhs, open, expr, close]);
        }

        if (!isExpressionStart(peek())) {
            const close = expect(closeTokenType);
            return Phrase.create(PhraseKind.SubscriptExpression, lengthFrom(start), [lhs, open, close]);
        }

        const expr = expression(0);
        const close = expect(closeTokenType);
        return Phrase.create(PhraseKind.SubscriptExpression, lengthFrom(start), [lhs, open, expr, close]);
    }

    function argumentList() {
        const start = startOffset();
        let t:Token;
        const children: (Phrase | Token)[] = [];
        let arrayInitialiserListRecoverSet = [TokenKind.CloseParenthesis, TokenKind.Comma];
        
        recoverSetStack.push(arrayInitialiserListRecoverSet);

        while(true) {

            children.push(argumentExpression());
            t = peek();

            if (t.kind === TokenKind.Comma) {
                children.push(next());

                //7.3 trailing comma
                if(peek().kind === TokenKind.CloseParenthesis) {
                    break;
                }

            } else if (t.kind !== TokenKind.CloseParenthesis) {
                //error
                //check for missing delimeter
                if (isArgumentStart(t)) {
                    children.push(Phrase.createParseError([], t));
                    continue;
                } else {
                    //skip until recover token
                    const errStart = startOffset();
                    const skipped = defaultSyncStrategy();
                    children.push(Phrase.createParseError(skipped, t, undefined, lengthFrom(errStart)));
                    if (peek().kind === TokenKind.Comma) {
                        continue;
                    }
                }

                break;
            } else {
                break;
            }

        }

        recoverSetStack.pop();
        return Phrase.create(PhraseKind.ArgumentExpressionList, lengthFrom(start), children);

    }

    function isArgumentStart(t: Token) {
        return t.kind === TokenKind.Ellipsis || isExpressionStart(t);
    }

    function variadicUnpacking() {
        const start = startOffset();
        const op = next(); //...
        const expr = expression(0);
        return Phrase.create(PhraseKind.VariadicUnpacking, lengthFrom(start), [op, expr]);
    }

    function argumentExpression() {
        return peek().kind === TokenKind.Ellipsis ? variadicUnpacking() : expression(0);
    }

    function qualifiedName() {
        const start = startOffset();
        let t = peek();
        let name: Phrase;

        if (t.kind === TokenKind.Backslash) {
            t = next();
            name = namespaceName();
            return Phrase.create(PhraseKind.FullyQualifiedName, lengthFrom(start), [t, name]);
        } else if (t.kind === TokenKind.Namespace) {
            t = next();
            const bslash = expect(TokenKind.Backslash);
            name = namespaceName();
            return Phrase.create(PhraseKind.RelativeQualifiedName, lengthFrom(start),  [t, bslash, name]);
        } else {
            name = namespaceName();
            return Phrase.create(PhraseKind.QualifiedName, lengthFrom(start), [name]);
        }
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
        const start = startOffset();
        const open = next(); //[
        if (!isArrayElementStartOrComma(peek())) {
            const close = expect(TokenKind.CloseBracket);
            return Phrase.create(PhraseKind.ArrayCreationExpression, lengthFrom(start), [open, close]);
        }
        const initList = arrayInitialiserList(TokenKind.CloseBracket);
        const close = expect(TokenKind.CloseBracket);
        return Phrase.create(PhraseKind.ArrayCreationExpression, lengthFrom(start), [open, initList, close]);
    }

    function longArrayCreationExpression() {
        const start = startOffset();
        const keyword = next(); //array
        const open = expect(TokenKind.OpenParenthesis);

        if (!isArrayElementStartOrComma(peek())) {
            const close = expect(TokenKind.CloseParenthesis);
            return Phrase.create(PhraseKind.ArrayCreationExpression, lengthFrom(start), [keyword, open, close]);
        }

        const initList = arrayInitialiserList(TokenKind.CloseParenthesis);
        const close = expect(TokenKind.CloseParenthesis);
        return Phrase.create(PhraseKind.ArrayCreationExpression, lengthFrom(start), [keyword, open, initList, close]);
    }

    function isArrayElementStart(t: Token) {
        return t.kind === TokenKind.Ampersand || isExpressionStart(t);
    }

    /**
     * only call if there is at least one element or comma
     * @param breakOn 
     */
    function arrayInitialiserList(breakOn: TokenKind) {
        const start = startOffset();
        let t = peek();
        const children: (Phrase | Token)[] = [];

        let arrayInitialiserListRecoverSet = [breakOn, TokenKind.Comma];
        recoverSetStack.push(arrayInitialiserListRecoverSet);

        do {

            //an array can have empty elements
            if (isArrayElementStart(peek())) {
                children.push(arrayElement());
            }

            t = peek();

            if (t.kind === TokenKind.Comma) {
                children.push(next());
            } else if (t.kind !== breakOn) {
                //error
                //check for missing delimeter
                if (isArrayElementStart(t)) {
                    children.push(Phrase.createParseError([], t));
                    continue;
                } else {
                    //skip until recover token
                    const errStart = startOffset();
                    const skipped = defaultSyncStrategy();
                    children.push(Phrase.createParseError(skipped, t, undefined, lengthFrom(errStart)));
                    t = peek();
                    if (t.kind === TokenKind.Comma) {
                        continue;
                    }
                }

                break;
            }

        } while (t.kind !== breakOn);

        recoverSetStack.pop();
        return Phrase.create(PhraseKind.ArrayInitialiserList, lengthFrom(start), children);

    }

    function arrayValue() {
        const start = startOffset();
        const amp = optional(TokenKind.Ampersand)
        const expr = expression(0);
        return Phrase.create(PhraseKind.ArrayValue, lengthFrom(start),  amp ? [amp, expr] : [expr]);
    }

    function arrayKey() {
        const start = startOffset();
        const expr = expression(0);
        return Phrase.create(PhraseKind.ArrayKey, lengthFrom(start), [expr]);
    }

    function arrayElement() {

        const start = startOffset();
        if (peek().kind === TokenKind.Ampersand) {
            const val = arrayValue();
            return Phrase.create(PhraseKind.ArrayElement, lengthFrom(start), [val]);
        }

        let keyOrValue = arrayKey();
        const arrow = optional(TokenKind.FatArrow);

        if (!arrow) {
            keyOrValue.kind = PhraseKind.ArrayValue;
            return Phrase.create(PhraseKind.ArrayElement, lengthFrom(start), [keyOrValue]);
        }

        const val = arrayValue();
        return Phrase.create(PhraseKind.ArrayElement, lengthFrom(start), [keyOrValue, arrow, val]);

    }

    function encapsulatedExpression(openTokenType: TokenKind, closeTokenType: TokenKind) {
        const start = startOffset();
        const open = expect(openTokenType);
        const expr = expression(0);
        const close = expect(closeTokenType);
        return Phrase.create(PhraseKind.EncapsulatedExpression, lengthFrom(start), [open, expr, close]);
    }

    function relativeScope() {
        const start = startOffset();
        const keyword = next();
        return Phrase.create(PhraseKind.RelativeScope, lengthFrom(start), [keyword]);
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
                return next();
            case TokenKind.Static:
                return relativeScope();
            case TokenKind.Name:
            case TokenKind.Namespace:
            case TokenKind.Backslash:
                return qualifiedName();
            default:
                //error
                return Phrase.createParseError([], t);
        }

    }

    function simpleVariable(): Phrase {
        const start = startOffset();
        const varNameOrDollar = expectOneOf([TokenKind.VariableName, TokenKind.Dollar]);

        if ((<Token>varNameOrDollar).kind !== TokenKind.Dollar) {
            return Phrase.create(PhraseKind.SimpleVariable, lengthFrom(start), [varNameOrDollar]);
        }

        const t = peek();
        let varOrExpr: Phrase | Token;
        if (t.kind === TokenKind.OpenBrace) {
            varOrExpr = encapsulatedExpression(TokenKind.OpenBrace, TokenKind.CloseBrace);
        } else if (t.kind === TokenKind.Dollar || t.kind === TokenKind.VariableName) {
            varOrExpr = simpleVariable();
        } else {
            varOrExpr = Phrase.createParseError([], t);
        }

        return Phrase.create(PhraseKind.SimpleVariable, lengthFrom(start), [varNameOrDollar, varOrExpr]);

    }

    function haltCompilerStatement() {
        const start = startOffset();
        const keyword = next(); // __halt_compiler
        const open = expect(TokenKind.OpenParenthesis);
        const close = expect(TokenKind.CloseParenthesis);
        const semicolon = expect(TokenKind.Semicolon);
        return Phrase.create(PhraseKind.HaltCompilerStatement, lengthFrom(start), [keyword, open, close, semicolon]);
    }

    function namespaceUseDeclaration() {
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        children.push(next()); //use
        const kind = optionalOneOf([TokenKind.Function, TokenKind.Const]);
        if (kind) {
            children.push(kind);
        }
        const leadingBackslash = optional(TokenKind.Backslash);
        const nsNameNode = namespaceName();
        let t = peek();

        //should be \ but allow { to recover from missing \
        if (t.kind === TokenKind.Backslash || t.kind === TokenKind.OpenBrace) {
            if (leadingBackslash) {
                children.push(leadingBackslash);
            }
            children.push(nsNameNode);
            children.push(expect(TokenKind.Backslash));
            children.push(expect(TokenKind.OpenBrace));
            children.push(delimitedList(
                PhraseKind.NamespaceUseGroupClauseList,
                namespaceUseGroupClause,
                isNamespaceUseGroupClauseStartToken,
                TokenKind.Comma,
                [TokenKind.CloseBrace]
            ));
            children.push(expect(TokenKind.CloseBrace));
            children.push(expect(TokenKind.Semicolon));
            return Phrase.create(PhraseKind.NamespaceUseDeclaration, lengthFrom(start), children);
        }

        children.push(delimitedList(
            PhraseKind.NamespaceUseClauseList,
            namespaceUseClauseFunction(start, nsNameNode, leadingBackslash),
            isNamespaceUseClauseStartToken,
            TokenKind.Comma,
            [TokenKind.Semicolon],
        ));

        children.push(expect(TokenKind.Semicolon));
        return Phrase.create(PhraseKind.NamespaceUseDeclaration, lengthFrom(start), children);
    }

    function isNamespaceUseClauseStartToken(t: Token) {
        return t.kind === TokenKind.Name || t.kind === TokenKind.Backslash;
    }

    function namespaceUseClauseFunction(start:number, nsName: Phrase, leadingBackslash: Token) {

        return () => {
            let name = nsName;
            let bs = leadingBackslash;

            if (name) {
                nsName = undefined;
                leadingBackslash = undefined;
            } else {
                start = startOffset();
                bs = optional(TokenKind.Backslash);
                name = namespaceName();
            }

            if (peek().kind !== TokenKind.As) {
                return Phrase.create(PhraseKind.NamespaceUseClause, lengthFrom(start), bs ? [bs, name] : [name]);
            }

            const alias = namespaceAliasingClause();
            return Phrase.create(PhraseKind.NamespaceUseClause, lengthFrom(start), bs ? [bs, name, alias] : [name, alias]);
        };

    }

    function delimitedList(phraseType: PhraseKind, elementFunction: () => Phrase | Token,
        elementStartPredicate: Predicate, delimiter: TokenKind, breakOn?: TokenKind[]) {
        const start = startOffset();
        let t: Token;
        let delimitedListRecoverSet = breakOn ? breakOn.slice(0) : [];
        delimitedListRecoverSet.push(delimiter);
        recoverSetStack.push(delimitedListRecoverSet);
        const children: (Phrase | Token)[] = [];

        while (true) {

            children.push(elementFunction());
            t = peek();

            if (t.kind === delimiter) {
                children.push(next());
            } else if (!breakOn || breakOn.indexOf(t.kind) > -1) {
                break;
            } else {
                //error
                //check for missing delimeter
                if (elementStartPredicate(t)) {
                    children.push(Phrase.createParseError([], t));
                    continue;
                } else {
                    //skip until recover set
                    const errStart = startOffset();
                    let skipped = defaultSyncStrategy();
                    children.push(Phrase.createParseError(skipped, t, undefined, lengthFrom(errStart)));
                    if (delimitedListRecoverSet.indexOf(peek().kind) > -1) {
                        continue;
                    }
                }

                break;
            }

        }

        recoverSetStack.pop();
        return Phrase.create(phraseType, lengthFrom(start), children);
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
        const start = startOffset();
        const kind = optionalOneOf([TokenKind.Function, TokenKind.Const]);
        const name = namespaceName();

        if (peek().kind !== TokenKind.As) {
            return Phrase.create(PhraseKind.NamespaceUseGroupClause, lengthFrom(start), kind ? [kind, name] : [name]);
        }

        const alias = namespaceAliasingClause();
        return Phrase.create(PhraseKind.NamespaceUseGroupClause, lengthFrom(start), [kind, name, alias]);
    }

    function namespaceAliasingClause() {
        const start = startOffset();
        const asToken = next();
        const name = expect(TokenKind.Name);
        return Phrase.create(PhraseKind.NamespaceAliasingClause, lengthFrom(start), [asToken, name]);
    }

    function namespaceDefinition() {
        const start = startOffset();
        const ns = next(); //namespace
        let name: Phrase;

        if (peek().kind === TokenKind.Name) {
            name = namespaceName();
        }

        const t = expectOneOf([TokenKind.Semicolon, TokenKind.OpenBrace]) as Token;

        if (t.kind === TokenKind.Semicolon) {
            if (!name) {
                name = Phrase.createParseError([], peek(), TokenKind.OpenBrace);
            }
            return Phrase.create(PhraseKind.NamespaceDefinition, lengthFrom(start), [ns, name, t]);
        } else if (t.kind !== TokenKind.OpenBrace) {
            const err = Phrase.createParseError([], peek());
            return Phrase.create(PhraseKind.NamespaceDefinition, lengthFrom(start), name ? [ns, name, err] : [ns, err]);
        }

        const list = statementList([TokenKind.CloseBrace]);
        const close = expect(TokenKind.CloseBrace);
        return Phrase.create(PhraseKind.NamespaceDefinition, lengthFrom(start), name ? [ns, name, t, list, close] : [ns, t, list, close]);

    }

    function namespaceName() {
        const start = startOffset();
        const children: (Phrase | Token)[] = [];
        children.push(expect(TokenKind.Name));

        while (peek().kind === TokenKind.Backslash && peek(1).kind === TokenKind.Name) {
            children.push(next(), next());
        }

        return Phrase.create(PhraseKind.NamespaceName, lengthFrom(start), children);
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
