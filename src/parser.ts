/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */

'use strict';

import { Token, Lexer, TokenType, LexerMode } from './lexer';
import {
    ParseError,
    Phrase,
    PhraseType,
    AdditiveExpression,
    AnonymousClassDeclaration,
    AnonymousClassDeclarationHeader,
    AnonymousFunctionCreationExpression,
    AnonymousFunctionHeader,
    AnonymousFunctionUseClause,
    AnonymousFunctionUseVariable,
    ArgumentExpressionList,
    ArrayCreationExpression,
    ArrayElement,
    ArrayInitialiserList,
    ArrayKey,
    ArrayValue,
    BitwiseExpression,
    BreakStatement,
    ByRefAssignmentExpression,
    CaseStatement,
    CaseStatementList,
    CastExpression,
    CatchClause,
    CatchClauseList,
    CatchNameList,
    ClassBaseClause,
    ClassConstantAccessExpression,
    ClassConstDeclaration,
    ClassConstElement,
    ClassConstElementList,
    ClassDeclaration,
    ClassDeclarationBody,
    ClassDeclarationHeader,
    ClassInterfaceClause,
    ClassMemberDeclarationList,
    ClassTypeDesignator,
    CloneExpression,
    ClosureUseList,
    CoalesceExpression,
    CompoundAssignmentExpression,
    CompoundStatement,
    TernaryExpression,
    ConstantAccessExpression,
    ConstDeclaration,
    ConstElement,
    ConstElementList,
    ContinueStatement,
    DeclareDirective,
    DeclareStatement,
    DefaultStatement,
    DoStatement,
    DoubleQuotedStringLiteral,
    EchoIntrinsic,
    ElseClause,
    ElseIfClause,
    ElseIfClauseList,
    EmptyIntrinsic,
    EncapsulatedExpression,
    EncapsulatedVariable,
    EncapsulatedVariableList,
    EqualityExpression,
    ErrorClassMemberDeclaration,
    ErrorClassTypeDesignatorAtom,
    ErrorControlExpression,
    ErrorExpression,
    ErrorScopedAccessExpression,
    ErrorTraitAdaptation,
    ErrorVariable,
    ErrorVariableAtom,
    EvalIntrinsic,
    ExitIntrinsic,
    ExponentiationExpression,
    ExpressionList,
    ExpressionStatement,
    FinallyClause,
    ForControl,
    ForeachCollection,
    ForeachKey,
    ForeachStatement,
    ForeachValue,
    ForEndOfLoop,
    ForInitialiser,
    ForStatement,
    FullyQualifiedName,
    FunctionCallExpression,
    FunctionDeclaration,
    FunctionDeclarationHeader,
    FunctionStaticDeclaration,
    FunctionStaticInitialiser,
    GlobalDeclaration,
    GotoStatement,
    HaltCompilerStatement,
    HeredocStringLiteral,
    Identifier,
    IfStatement,
    IncludeExpression,
    IncludeOnceExpression,
    InlineText,
    InstanceOfExpression,
    InstanceofTypeDesignator,
    InterfaceBaseClause,
    InterfaceDeclaration,
    InterfaceDeclarationBody,
    InterfaceDeclarationHeader,
    InterfaceMemberDeclarationList,
    IssetIntrinsic,
    ListIntrinsic,
    LogicalExpression,
    MemberModifierList,
    MemberName,
    MethodCallExpression,
    MethodDeclaration,
    MethodDeclarationBody,
    MethodDeclarationHeader,
    MethodReference,
    MultiplicativeExpression,
    NamedLabelStatement,
    NamespaceAliasingClause,
    NamespaceDefinition,
    NamespaceName,
    NamespaceUseClause,
    NamespaceUseClauseList,
    NamespaceUseDeclaration,
    NamespaceUseGroupClause,
    NamespaceUseGroupClauseList,
    NullStatement,
    ObjectCreationExpression,
    ParameterDeclaration,
    ParameterDeclarationList,
    PostfixDecrementExpression,
    PostfixIncrementExpression,
    PrefixDecrementExpression,
    PrefixIncrementExpression,
    PrintIntrinsic,
    PropertyAccessExpression,
    PropertyDeclaration,
    PropertyElement,
    PropertyElementList,
    PropertyInitialiser,
    QualifiedName,
    QualifiedNameList,
    RelationalExpression,
    RelativeQualifiedName,
    RelativeScope,
    RequireExpression,
    RequireOnceExpression,
    ReturnStatement,
    ReturnType,
    ScopedCallExpression,
    ScopedMemberName,
    ScopedPropertyAccessExpression,
    ShellCommandExpression,
    ShiftExpression,
    SimpleAssignmentExpression,
    SimpleVariable,
    StatementList,
    StaticVariableDeclaration,
    StaticVariableDeclarationList,
    SubscriptExpression,
    SwitchStatement,
    ThrowStatement,
    TraitAdaptationList,
    TraitAlias,
    TraitDeclaration,
    TraitDeclarationBody,
    TraitDeclarationHeader,
    TraitMemberDeclarationList,
    TraitPrecedence,
    TraitUseClause,
    TraitUseSpecification,
    TryStatement,
    TypeDeclaration,
    UnaryOpExpression,
    UnsetIntrinsic,
    VariableList,
    VariableNameList,
    VariadicUnpacking,
    WhileStatement,
    YieldExpression,
    YieldFromExpression,
    UnaryExpression,
    BinaryExpression,
    ScriptInclusion,
    TypeDeclarationBody,
    ScopedExpression,
    List,
    ObjectAccessExpression,
    TypeDesignator
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
        switch (t.tokenType) {
            case TokenType.AsteriskAsterisk:
                return [48, Associativity.Right];
            case TokenType.PlusPlus:
                return [47, Associativity.Right];
            case TokenType.MinusMinus:
                return [47, Associativity.Right];
            case TokenType.Tilde:
                return [47, Associativity.Right];
            case TokenType.IntegerCast:
                return [47, Associativity.Right];
            case TokenType.FloatCast:
                return [47, Associativity.Right];
            case TokenType.StringCast:
                return [47, Associativity.Right];
            case TokenType.ArrayCast:
                return [47, Associativity.Right];
            case TokenType.ObjectCast:
                return [47, Associativity.Right];
            case TokenType.BooleanCast:
                return [47, Associativity.Right];
            case TokenType.AtSymbol:
                return [47, Associativity.Right];
            case TokenType.InstanceOf:
                return [46, Associativity.None];
            case TokenType.Exclamation:
                return [45, Associativity.Right];
            case TokenType.Asterisk:
                return [44, Associativity.Left];
            case TokenType.ForwardSlash:
                return [44, Associativity.Left];
            case TokenType.Percent:
                return [44, Associativity.Left];
            case TokenType.Plus:
                return [43, Associativity.Left];
            case TokenType.Minus:
                return [43, Associativity.Left];
            case TokenType.Dot:
                return [43, Associativity.Left];
            case TokenType.LessThanLessThan:
                return [42, Associativity.Left];
            case TokenType.GreaterThanGreaterThan:
                return [42, Associativity.Left];
            case TokenType.LessThan:
                return [41, Associativity.None];
            case TokenType.GreaterThan:
                return [41, Associativity.None];
            case TokenType.LessThanEquals:
                return [41, Associativity.None];
            case TokenType.GreaterThanEquals:
                return [41, Associativity.None];
            case TokenType.EqualsEquals:
                return [40, Associativity.None];
            case TokenType.EqualsEqualsEquals:
                return [40, Associativity.None];
            case TokenType.ExclamationEquals:
                return [40, Associativity.None];
            case TokenType.ExclamationEqualsEquals:
                return [40, Associativity.None];
            case TokenType.Spaceship:
                return [40, Associativity.None];
            case TokenType.Ampersand:
                return [39, Associativity.Left];
            case TokenType.Caret:
                return [38, Associativity.Left];
            case TokenType.Bar:
                return [37, Associativity.Left];
            case TokenType.AmpersandAmpersand:
                return [36, Associativity.Left];
            case TokenType.BarBar:
                return [35, Associativity.Left];
            case TokenType.QuestionQuestion:
                return [34, Associativity.Right];
            case TokenType.Question:
                return [33, Associativity.Left]; //?: ternary
            case TokenType.Equals:
                return [32, Associativity.Right];
            case TokenType.DotEquals:
                return [32, Associativity.Right];
            case TokenType.PlusEquals:
                return [32, Associativity.Right];
            case TokenType.MinusEquals:
                return [32, Associativity.Right];
            case TokenType.AsteriskEquals:
                return [32, Associativity.Right];
            case TokenType.ForwardslashEquals:
                return [32, Associativity.Right];
            case TokenType.PercentEquals:
                return [32, Associativity.Right];
            case TokenType.AsteriskAsteriskEquals:
                return [32, Associativity.Right];
            case TokenType.AmpersandEquals:
                return [32, Associativity.Right];
            case TokenType.BarEquals:
                return [32, Associativity.Right];
            case TokenType.CaretEquals:
                return [32, Associativity.Right];
            case TokenType.LessThanLessThanEquals:
                return [32, Associativity.Right];
            case TokenType.GreaterThanGreaterThanEquals:
                return [32, Associativity.Right];
            case TokenType.And:
                return [31, Associativity.Left];
            case TokenType.Xor:
                return [30, Associativity.Left];
            case TokenType.Or:
                return [29, Associativity.Left];
            default:
                throwUnexpectedTokenError(t);

        }
    }

    const statementListRecoverSet = [
        TokenType.Use,
        TokenType.HaltCompiler,
        TokenType.Const,
        TokenType.Function,
        TokenType.Class,
        TokenType.Abstract,
        TokenType.Final,
        TokenType.Trait,
        TokenType.Interface,
        TokenType.OpenBrace,
        TokenType.If,
        TokenType.While,
        TokenType.Do,
        TokenType.For,
        TokenType.Switch,
        TokenType.Break,
        TokenType.Continue,
        TokenType.Return,
        TokenType.Global,
        TokenType.Static,
        TokenType.Echo,
        TokenType.Unset,
        TokenType.ForEach,
        TokenType.Declare,
        TokenType.Try,
        TokenType.Throw,
        TokenType.Goto,
        TokenType.Semicolon,
        TokenType.CloseTag,
    ];

    const classMemberDeclarationListRecoverSet = [
        TokenType.Public,
        TokenType.Protected,
        TokenType.Private,
        TokenType.Static,
        TokenType.Abstract,
        TokenType.Final,
        TokenType.Function,
        TokenType.Var,
        TokenType.Const,
        TokenType.Use
    ];

    const encapsulatedVariableListRecoverSet = [
        TokenType.EncapsulatedAndWhitespace,
        TokenType.DollarCurlyOpen,
        TokenType.CurlyOpen
    ];

    function binaryOpToPhraseType(t: Token) {
        switch (t.tokenType) {
            case TokenType.Question:
                return PhraseType.TernaryExpression;
            case TokenType.Dot:
            case TokenType.Plus:
            case TokenType.Minus:
                return PhraseType.AdditiveExpression;
            case TokenType.Bar:
            case TokenType.Ampersand:
            case TokenType.Caret:
                return PhraseType.BitwiseExpression;
            case TokenType.Asterisk:
            case TokenType.ForwardSlash:
            case TokenType.Percent:
                return PhraseType.MultiplicativeExpression;
            case TokenType.AsteriskAsterisk:
                return PhraseType.ExponentiationExpression;
            case TokenType.LessThanLessThan:
            case TokenType.GreaterThanGreaterThan:
                return PhraseType.ShiftExpression;
            case TokenType.AmpersandAmpersand:
            case TokenType.BarBar:
            case TokenType.And:
            case TokenType.Or:
            case TokenType.Xor:
                return PhraseType.LogicalExpression;
            case TokenType.EqualsEqualsEquals:
            case TokenType.ExclamationEqualsEquals:
            case TokenType.EqualsEquals:
            case TokenType.ExclamationEquals:
                return PhraseType.EqualityExpression;
            case TokenType.LessThan:
            case TokenType.LessThanEquals:
            case TokenType.GreaterThan:
            case TokenType.GreaterThanEquals:
            case TokenType.Spaceship:
                return PhraseType.RelationalExpression;
            case TokenType.QuestionQuestion:
                return PhraseType.CoalesceExpression;
            case TokenType.Equals:
                return PhraseType.SimpleAssignmentExpression;
            case TokenType.PlusEquals:
            case TokenType.MinusEquals:
            case TokenType.AsteriskEquals:
            case TokenType.AsteriskAsteriskEquals:
            case TokenType.ForwardslashEquals:
            case TokenType.DotEquals:
            case TokenType.PercentEquals:
            case TokenType.AmpersandEquals:
            case TokenType.BarEquals:
            case TokenType.CaretEquals:
            case TokenType.LessThanLessThanEquals:
            case TokenType.GreaterThanGreaterThanEquals:
                return PhraseType.CompoundAssignmentExpression;
            case TokenType.InstanceOf:
                return PhraseType.InstanceOfExpression;
            default:
                return PhraseType.Unknown;

        }
    }

    var tokenBuffer: Token[];
    var phraseStack: Phrase[];
    var errorPhrase: Phrase;
    var recoverSetStack: TokenType[][];

    export function parse(text: string): Phrase {

        init(text);
        return statementList([TokenType.EndOfFile]);

    }

    function init(text: string, lexerModeStack?: LexerMode[]) {
        Lexer.setInput(text, lexerModeStack);
        phraseStack = [];
        tokenBuffer = [];
        recoverSetStack = [];
        errorPhrase = null;
    }

    function start<T extends Phrase>(phrase: T, dontPushHiddenToParent?:boolean) {
        //parent node gets hidden tokens between children
        if(!dontPushHiddenToParent){
            hidden();
        }
        phraseStack.push(phrase);
        return phrase;
    }

    function end<T extends Phrase>() {
        return phraseStack.pop() as T;
    }

    function hidden() {

        let p = phraseStack[phraseStack.length - 1];
        let t: Token;

        while (true) {

            t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();
            if (t.tokenType < TokenType.Comment) {
                tokenBuffer.unshift(t);
                break;
            } else {
                p.children.push(t);
            }

        }

    }

    function optional(tokenType: TokenType) {

        if (tokenType === peek().tokenType) {
            errorPhrase = null;
            return next();
        } else {
            return null;
        }

    }

    function optionalOneOf(tokenTypes: TokenType[]) {

        if (tokenTypes.indexOf(peek().tokenType) >= 0) {
            errorPhrase = null;
            return next();
        } else {
            return null;
        }

    }

    function next(doNotPush?: boolean): Token {

        let t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();

        if (t.tokenType === TokenType.EndOfFile) {
            return t;
        }

        if (t.tokenType >= TokenType.Comment) {
            //hidden token
            phraseStack[phraseStack.length - 1].children.push(t);
            return next(doNotPush);
        } else if (!doNotPush) {
            phraseStack[phraseStack.length - 1].children.push(t);
        }

        return t;

    }

    function expect(tokenType: TokenType) {

        let t = peek();

        if (t.tokenType === tokenType) {
            errorPhrase = null;
            return next();
        } else if (tokenType === TokenType.Semicolon && t.tokenType === TokenType.CloseTag) {
            //implicit end statement
            return t;
        } else {
            error();
            //test skipping a single token to sync
            if (peek(1).tokenType === tokenType) {
                let predicate = (x: Token) => { return x.tokenType === tokenType; };
                skip(predicate);
                errorPhrase = null;
                return next(); //tokenType
            }
            return null;
        }

    }

    function expectOneOf(tokenTypes: TokenType[]) {

        let t = peek();

        if (tokenTypes.indexOf(t.tokenType) >= 0) {
            errorPhrase = null;
            return next();
        } else if (tokenTypes.indexOf(TokenType.Semicolon) >= 0 && t.tokenType === TokenType.CloseTag) {
            //implicit end statement
            return t;
        } else {
            error();
            //test skipping single token to sync
            if (tokenTypes.indexOf(peek(1).tokenType) >= 0) {
                let predicate = (x: Token) => { return tokenTypes.indexOf(x.tokenType) >= 0; };
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

            if (t.tokenType < TokenType.Comment) {
                //not a hidden token
                --k;
            }

            if (t.tokenType === TokenType.EndOfFile || k === 0) {
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
        let nSkipped = 0;

        while (true) {
            t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();

            if (predicate(t) || t.tokenType === TokenType.EndOfFile) {
                tokenBuffer.unshift(t);
                errorPhrase.errors[errorPhrase.errors.length - 1].numberSkipped = nSkipped;
                break;
            } else {
                ++nSkipped;
                errorPhrase.children.push(t);
            }
        }

    }

    function error() {

        //dont report errors if recovering from another
        if (errorPhrase) {
            return;
        }

        errorPhrase = phraseStack[phraseStack.length - 1];

        if (!errorPhrase.errors) {
            errorPhrase.errors = [];
        }

        let t = peek();
        errorPhrase.errors.push({
            unexpected: t,
            numberSkipped: 0
        });

    }

    function list(phraseType: PhraseType, elementFunction: () => Phrase | Token,
        elementStartPredicate: Predicate, breakOn?: TokenType[], recoverSet?: TokenType[]) {

        let p = start<List<Phrase | Token>>({
            phraseType: phraseType,
            elements: [],
            children: []
        });

        let t: Token;
        let recoveryAttempted = false;
        let listRecoverSet = recoverSet ? recoverSet.slice(0) : [];
        let element: Phrase | Token;

        if (breakOn) {
            Array.prototype.push.apply(listRecoverSet, breakOn);
        }

        recoverSetStack.push(listRecoverSet);

        while (true) {

            t = peek();

            if (elementStartPredicate(t)) {
                recoveryAttempted = false;
                element = elementFunction();
                p.children.push(element);
                p.elements.push(element);
            } else if (!breakOn || breakOn.indexOf(t.tokenType) >= 0 || recoveryAttempted) {
                break;
            } else {
                error();
                //attempt to sync with token stream
                t = peek(1);
                if (elementStartPredicate(t) || breakOn.indexOf(t.tokenType) >= 0) {
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

        let mergedRecoverTokenTypeArray: TokenType[] = [];

        for (let n = recoverSetStack.length - 1; n >= 0; --n) {
            Array.prototype.push.apply(mergedRecoverTokenTypeArray, recoverSetStack[n]);
        }

        let mergedRecoverTokenTypeSet = new Set(mergedRecoverTokenTypeArray);
        let predicate: Predicate = (x) => { return mergedRecoverTokenTypeSet.has(x.tokenType); };
        skip(predicate);

    }

    function isListPhrase(phraseType: PhraseType) {
        switch (phraseType) {
            case PhraseType.StatementList:
                return true;
            default:
                false;
        }
    }

    function statementList(breakOn: TokenType[]) {

        return list(
            PhraseType.StatementList,
            statement,
            isStatementStart,
            breakOn,
            statementListRecoverSet) as StatementList;

    }

    function constDeclaration() {

        let p = start<ConstDeclaration>({
            phraseType: PhraseType.ConstDeclaration,
            constElementList: null,
            children: []
        });
        next(); //const
        p.children.push(p.constElementList = <ConstElementList>delimitedList(
            PhraseType.ConstElementList,
            constElement,
            isConstElementStartToken,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return end();

    }

    function isClassConstElementStartToken(t: Token) {
        return t.tokenType === TokenType.Name || isSemiReservedToken(t);
    }

    function isConstElementStartToken(t: Token) {
        return t.tokenType === TokenType.Name;
    }

    function constElement() {

        let p = start<ConstElement>({
            phraseType: PhraseType.ConstElement,
            name: null,
            value: null,
            children: []
        });
        p.name = expect(TokenType.Name);
        expect(TokenType.Equals);
        p.children.push(p.value = expression(0));
        return end();

    }

    function expression(minPrecedence: number) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let lhs = expressionAtom();
        let p: BinaryExpression;
        let rhs: Phrase | Token;
        let binaryPhraseType: PhraseType;

        while (true) {

            op = peek();
            binaryPhraseType = binaryOpToPhraseType(op);

            if (binaryPhraseType === PhraseType.Unknown) {
                break;
            }

            [precedence, associativity] = precedenceAssociativityTuple(op);

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }


            if (binaryPhraseType === PhraseType.TernaryExpression) {
                lhs = ternaryExpression(lhs);
                continue;
            }

            p = start<BinaryExpression>({
                phraseType: binaryPhraseType,
                left: lhs,
                operator: null,
                right: null,
                children: []
            }, true);
            p.children.push(lhs);
            p.operator = next();

            if (binaryPhraseType === PhraseType.InstanceOfExpression) {
                p.children.push(p.right = typeDesignator(PhraseType.InstanceofTypeDesignator));
            } else {
                if (binaryPhraseType === PhraseType.SimpleAssignmentExpression &&
                    peek().tokenType === TokenType.Ampersand) {
                    next(); //&
                    p.phraseType = PhraseType.ByRefAssignmentExpression;
                }
                p.children.push(p.right = expression(precedence));
            }

            lhs = end();

        }

        return lhs;

    }

    function ternaryExpression(testExpr: Phrase | Token) {

        let p = start<TernaryExpression>({
            phraseType: PhraseType.TernaryExpression,
            testExpr: testExpr,
            falseExpr: null,
            children: []
        }, true);
        p.children.push(testExpr);
        next(); //?

        if (optional(TokenType.Colon)) {
            p.children.push(p.falseExpr = expression(0));
        } else {
            p.children.push(p.trueExpr = expression(0));
            expect(TokenType.Colon);
            p.children.push(p.falseExpr = expression(0));
        }

        return end();
    }


    function variableOrExpression() {

        let part = variableAtom();
        let isVariable = (<Phrase>part).phraseType === PhraseType.SimpleVariable;

        if (isDereferenceOperator(peek())) {
            part = variable(part);
            isVariable = true;
        } else {

            switch ((<Phrase>part).phraseType) {
                case PhraseType.QualifiedName:
                    part = constantAccessExpression(<QualifiedName>part);
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
        if (t.tokenType === TokenType.PlusPlus) {
            return postfixExpression(PhraseType.PostfixIncrementExpression, <Phrase>part);
        } else if (t.tokenType === TokenType.MinusMinus) {
            return postfixExpression(PhraseType.PostfixDecrementExpression, <Phrase>part);
        } else {
            return part;
        }

    }

    function constantAccessExpression(qName: QualifiedName) {
        let p = start<ConstantAccessExpression>({
            phraseType: PhraseType.ConstantAccessExpression,
            name: null,
            children: []
        }, true);
        p.children.push(p.name = qName);
        return end();
    }

    function postfixExpression(phraseType: PhraseType, variableNode: Phrase) {
        let p = start<UnaryExpression>({
            phraseType: phraseType,
            operand: null,
            operator: null,
            children: []
        }, true);
        p.children.push(p.operand = variableNode);
        p.operator = next(); //operator
        return end();
    }

    function isDereferenceOperator(t: Token) {
        switch (t.tokenType) {
            case TokenType.OpenBracket:
            case TokenType.OpenBrace:
            case TokenType.Arrow:
            case TokenType.OpenParenthesis:
            case TokenType.ColonColon:
                return true;
            default:
                return false;
        }
    }

    function expressionAtom() {

        let t = peek();

        switch (t.tokenType) {
            case TokenType.Static:
                if (peek(1).tokenType === TokenType.Function) {
                    return anonymousFunctionCreationExpression();
                } else {
                    return variableOrExpression();
                }
            case TokenType.StringLiteral:
                if (isDereferenceOperator(peek(1))) {
                    return variableOrExpression();
                } else {
                    return next(true);
                }
            case TokenType.VariableName:
            case TokenType.Dollar:
            case TokenType.Array:
            case TokenType.OpenBracket:
            case TokenType.Backslash:
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.OpenParenthesis:
                return variableOrExpression();
            case TokenType.PlusPlus:
                return unaryExpression(PhraseType.PrefixIncrementExpression);
            case TokenType.MinusMinus:
                return unaryExpression(PhraseType.PrefixDecrementExpression);
            case TokenType.Plus:
            case TokenType.Minus:
            case TokenType.Exclamation:
            case TokenType.Tilde:
                return unaryExpression(PhraseType.UnaryOpExpression);
            case TokenType.AtSymbol:
                return unaryExpression(PhraseType.ErrorControlExpression);
            case TokenType.IntegerCast:
            case TokenType.FloatCast:
            case TokenType.StringCast:
            case TokenType.ArrayCast:
            case TokenType.ObjectCast:
            case TokenType.BooleanCast:
            case TokenType.UnsetCast:
                return unaryExpression(PhraseType.CastExpression);
            case TokenType.List:
                return listIntrinsic();
            case TokenType.Clone:
                return cloneExpression();
            case TokenType.New:
                return objectCreationExpression();
            case TokenType.FloatingLiteral:
            case TokenType.IntegerLiteral:
            case TokenType.LineConstant:
            case TokenType.FileConstant:
            case TokenType.DirectoryConstant:
            case TokenType.TraitConstant:
            case TokenType.MethodConstant:
            case TokenType.FunctionConstant:
            case TokenType.NamespaceConstant:
            case TokenType.ClassConstant:
                return next(true);
            case TokenType.StartHeredoc:
                return heredocStringLiteral();
            case TokenType.DoubleQuote:
                return doubleQuotedStringLiteral();
            case TokenType.Backtick:
                return shellCommandExpression();
            case TokenType.Print:
                return printIntrinsic();
            case TokenType.Yield:
                return yieldExpression();
            case TokenType.YieldFrom:
                return yieldFromExpression();
            case TokenType.Function:
                return anonymousFunctionCreationExpression();
            case TokenType.Include:
                return scriptInclusion(PhraseType.IncludeExpression);
            case TokenType.IncludeOnce:
                return scriptInclusion(PhraseType.IncludeOnceExpression);
            case TokenType.Require:
                return scriptInclusion(PhraseType.RequireExpression);
            case TokenType.RequireOnce:
                return scriptInclusion(PhraseType.RequireOnceExpression);
            case TokenType.Eval:
                return evalIntrinsic();
            case TokenType.Empty:
                return emptyIntrinsic();
            case TokenType.Exit:
                return exitIntrinsic();
            case TokenType.Isset:
                return issetIntrinsic();
            default:
                //error
                start({ phraseType: PhraseType.ErrorExpression, children: [] });
                error();
                return end();
        }

    }

    function exitIntrinsic() {
        let p = start<ExitIntrinsic>({
            phraseType: PhraseType.ExitIntrinsic,
            children: []
        });
        next(); //exit or die
        if (optional(TokenType.OpenParenthesis)) {
            if (isExpressionStart(peek())) {
                p.expr = expression(0);
                p.children.push(p.expr);
            }
            expect(TokenType.CloseParenthesis);
        }
        return end();
    }

    function issetIntrinsic() {

        let p = start<IssetIntrinsic>({
            phraseType: PhraseType.IssetIntrinsic,
            variableList: null,
            children: []
        });
        next(); //isset
        expect(TokenType.OpenParenthesis);
        p.variableList = <VariableList>variableList([TokenType.CloseParenthesis]);
        p.children.push(p.variableList);
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function emptyIntrinsic() {

        let p = start<EmptyIntrinsic>({
            phraseType: PhraseType.EmptyIntrinsic,
            expr: null,
            children: []
        });
        next(); //keyword
        expect(TokenType.OpenParenthesis);
        p.expr = expression(0);
        p.children.push(p.expr);
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function evalIntrinsic() {

        let p = start<EvalIntrinsic>({
            phraseType: PhraseType.EvalIntrinsic,
            expr: null,
            children: []
        });
        next(); //keyword
        expect(TokenType.OpenParenthesis);
        p.expr = expression(0);
        p.children.push(p.expr);
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function scriptInclusion(phraseType: PhraseType) {

        let p = start<ScriptInclusion>({
            phraseType: phraseType,
            expr: null,
            children: []
        });
        next(); //keyword
        p.expr = expression(0);
        p.children.push(p.expr);
        return end();
    }

    function printIntrinsic() {

        let p = start<PrintIntrinsic>({
            phraseType: PhraseType.PrintIntrinsic,
            expr: null,
            children: []
        });
        next(); //keyword
        p.expr = expression(0);
        p.children.push(p.expr);
        return end();
    }

    function yieldFromExpression() {

        let p = start<YieldFromExpression>({
            phraseType: PhraseType.YieldFromExpression,
            expr: null,
            children: []
        });
        next(); //keyword
        p.expr = expression(0);
        p.children.push(p.expr);
        return end();
    }

    function yieldExpression() {

        let p = start<YieldExpression>({
            phraseType: PhraseType.YieldExpression,
            children: []
        });
        next(); //yield

        if (!isExpressionStart(peek())) {
            return end();
        }

        let keyOrValue = expression(0);
        p.children.push(keyOrValue);

        if (optional(TokenType.FatArrow)) {
            p.key = keyOrValue;
            p.value = expression(0);
            p.children.push(p.value);
        } else {
            p.value = keyOrValue;
        }

        return end();

    }

    function shellCommandExpression() {

        let p = start<ShellCommandExpression>({
            phraseType: PhraseType.ShellCommandExpression,
            encapsulatedVariableList: null,
            children: []
        });
        next(); //`
        p.encapsulatedVariableList = <EncapsulatedVariableList>encapsulatedVariableList(TokenType.Backtick);
        p.children.push(p.encapsulatedVariableList);
        expect(TokenType.Backtick);
        return end();

    }

    function doubleQuotedStringLiteral() {

        let p = start<DoubleQuotedStringLiteral>({
            phraseType: PhraseType.DoubleQuotedStringLiteral,
            encapsulatedVariableList: null,
            children: []
        });
        next(); //"
        p.encapsulatedVariableList = encapsulatedVariableList(TokenType.DoubleQuote);
        p.children.push(p.encapsulatedVariableList);
        expect(TokenType.DoubleQuote);
        return end();

    }

    function encapsulatedVariableList(breakOn: TokenType) {

        return list(
            PhraseType.EncapsulatedVariableList,
            encapsulatedVariable,
            isEncapsulatedVariableStart,
            [breakOn],
            encapsulatedVariableListRecoverSet
        ) as EncapsulatedVariableList;

    }

    function isEncapsulatedVariableStart(t: Token) {

        switch (t.tokenType) {
            case TokenType.EncapsulatedAndWhitespace:
            case TokenType.VariableName:
            case TokenType.DollarCurlyOpen:
            case TokenType.CurlyOpen:
                return true;
            default:
                return false;
        }

    }

    function encapsulatedVariable() {

        switch (peek().tokenType) {
            case TokenType.EncapsulatedAndWhitespace:
                return next(true);
            case TokenType.VariableName:
                let t = peek(1);
                if (t.tokenType === TokenType.OpenBracket) {
                    return encapsulatedDimension();
                } else if (t.tokenType === TokenType.Arrow) {
                    return encapsulatedProperty();
                } else {
                    return simpleVariable();
                }
            case TokenType.DollarCurlyOpen:
                return dollarCurlyOpenEncapsulatedVariable();
            case TokenType.CurlyOpen:
                return curlyOpenEncapsulatedVariable();
            default:
                throwUnexpectedTokenError(peek());
        }

    }

    function curlyOpenEncapsulatedVariable() {

        let p = start<EncapsulatedVariable>({
            phraseType: PhraseType.EncapsulatedVariable,
            variable: null,
            children: []
        });
        next(); //{
        p.variable = variable(variableAtom());
        p.children.push(p.variable);
        expect(TokenType.CloseBrace);
        return end();

    }

    function dollarCurlyOpenEncapsulatedVariable() {

        let p = start<EncapsulatedVariable>({
            phraseType: PhraseType.EncapsulatedVariable,
            variable: null,
            children: []
        });
        next(); //${
        let t = peek();

        if (t.tokenType === TokenType.VariableName) {

            if (peek(1).tokenType === TokenType.OpenBracket) {
                p.variable = dollarCurlyEncapsulatedDimension();
                p.children.push(p.variable);
            } else {
                let sv = start<SimpleVariable>({
                    phraseType: PhraseType.SimpleVariable,
                    name: null,
                    children: []
                });
                sv.name = next();
                p.variable = end();
                p.children.push(p.variable);
            }

        } else if (isExpressionStart(t)) {
            p.children.push(p.variable = expression(0));
        } else {
            error();
        }

        expect(TokenType.CloseBrace);
        return end();
    }

    function dollarCurlyEncapsulatedDimension() {
        let p = start<SubscriptExpression>({
            phraseType: PhraseType.SubscriptExpression,
            dereferencable: null,
            offset: null,
            children: []
        });
        p.dereferencable = next(); //VariableName
        next(); // [
        p.children.push(p.offset = expression(0));
        expect(TokenType.CloseBracket);
        return end();
    }

    function encapsulatedDimension() {

        let p = start<SubscriptExpression>({
            phraseType: PhraseType.SubscriptExpression,
            dereferencable: null,
            offset: null,
            children: []
        });

        p.children.push(p.dereferencable = simpleVariable()); //T_VARIABLE
        next(); //[

        switch (peek().tokenType) {
            case TokenType.Name:
            case TokenType.IntegerLiteral:
                p.offset = next();
                break;
            case TokenType.VariableName:
                p.children.push(p.offset = simpleVariable());
                break;
            case TokenType.Minus:
                let u = start<UnaryOpExpression>({
                    phraseType: PhraseType.UnaryOpExpression,
                    operand: null,
                    operator: null,
                    children: []
                });
                u.operator = next(); //-
                u.operand = expect(TokenType.IntegerLiteral);
                p.children.push(p.offset = end());
                break;
            default:
                //error
                error();
                break;
        }

        expect(TokenType.CloseBracket);
        return end();

    }

    function encapsulatedProperty() {
        let p = start<PropertyAccessExpression>({
            phraseType: PhraseType.PropertyAccessExpression,
            variable: null,
            memberName: null,
            children: []
        });
        p.children.push(p.variable = simpleVariable());
        next(); //->
        p.memberName = expect(TokenType.Name);
        return end();
    }

    function heredocStringLiteral() {

        let p = start<HeredocStringLiteral>({
            phraseType: PhraseType.HeredocStringLiteral,
            encapsulatedVariableList: null,
            children: []
        });
        next(); //StartHeredoc
        p.children.push(p.encapsulatedVariableList = encapsulatedVariableList(TokenType.EndHeredoc));
        expect(TokenType.EndHeredoc);
        return end();

    }

    function anonymousClassDeclaration() {

        let p = start<AnonymousClassDeclaration>({
            phraseType: PhraseType.AnonymousClassDeclaration,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = anonymousClassDeclarationHeader());
        p.children.push(p.body = <ClassDeclarationBody>TypeDeclarationBody(
                PhraseType.ClassDeclarationBody, isClassMemberStart, classMemberDeclarationList
            ));
        return end<AnonymousClassDeclaration>();

    }

    function anonymousClassDeclarationHeader() {

        let p = start<AnonymousClassDeclarationHeader>({
            phraseType: PhraseType.AnonymousClassDeclarationHeader,
            children: []
        });
        next(); //class

        if (optional(TokenType.OpenParenthesis)) {

            if (isArgumentStart(peek())) {
                p.children.push(p.argumentList = <ArgumentExpressionList>argumentList());
            }
            expect(TokenType.CloseParenthesis);
        }

        if (peek().tokenType === TokenType.Extends) {
            p.children.push(p.baseClause = classBaseClause());
        }

        if (peek().tokenType === TokenType.Implements) {
            p.children.push(p.interfaceClause = classInterfaceClause());
        }

        return end<AnonymousClassDeclarationHeader>();

    }

    function classInterfaceClause() {

        let p = start<ClassInterfaceClause>({
            phraseType: PhraseType.ClassInterfaceClause,
            nameList: null,
            children: []
        });
        next(); //implements
        p.children.push(p.nameList = qualifiedNameList([TokenType.OpenBrace]));
        return end<ClassInterfaceClause>();

    }

    function classMemberDeclarationList() {

        return list(
            PhraseType.ClassMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenType.CloseBrace],
            classMemberDeclarationListRecoverSet
        ) as ClassMemberDeclarationList;

    }

    function isClassMemberStart(t: Token) {
        switch (t.tokenType) {
            case TokenType.Public:
            case TokenType.Protected:
            case TokenType.Private:
            case TokenType.Static:
            case TokenType.Abstract:
            case TokenType.Final:
            case TokenType.Function:
            case TokenType.Var:
            case TokenType.Const:
            case TokenType.Use:
                return true;
            default:
                return false;
        }
    }

    function classMemberDeclaration() {

        let p = start<Phrase>({
            phraseType: PhraseType.ErrorClassMemberDeclaration,
            children: []
        });
        let t = peek();

        switch (t.tokenType) {
            case TokenType.Public:
            case TokenType.Protected:
            case TokenType.Private:
            case TokenType.Static:
            case TokenType.Abstract:
            case TokenType.Final:
                let modifiers = memberModifierList();
                t = peek();
                if (t.tokenType === TokenType.VariableName) {
                    p.children.push((<PropertyDeclaration>p).modifierList = modifiers);
                    return propertyDeclaration(<PropertyDeclaration>p);
                } else if (t.tokenType === TokenType.Function) {
                    return methodDeclaration(<MethodDeclaration>p, modifiers);
                } else if (t.tokenType === TokenType.Const) {
                    p.children.push(modifiers);
                    return classConstDeclaration(<ClassConstDeclaration>p);
                } else {
                    //error
                    error();
                    return end();
                }
            case TokenType.Function:
                return methodDeclaration(<MethodDeclaration>p, null);
            case TokenType.Var:
                next();
                return propertyDeclaration(<PropertyDeclaration>p);
            case TokenType.Const:
                return classConstDeclaration(<ClassConstDeclaration>p);
            case TokenType.Use:
                return traitUseClause();
            default:
                //should not get here
                throwUnexpectedTokenError(t);
        }

    }

    function throwUnexpectedTokenError(t: Token) {
        throw new Error(`Unexpected token: ${t.tokenType}`);
    }

    function traitUseClause() {

        let p = start<TraitUseClause>({
            phraseType: PhraseType.TraitUseClause,
            nameList: null,
            specification: null,
            children: []
        });
        next(); //use
        p.children.push(p.nameList = qualifiedNameList([TokenType.Semicolon, TokenType.OpenBrace]));
        p.children.push(p.specification = traitUseSpecification());
        return end();

    }

    function traitUseSpecification() {

        let p = start<TraitUseSpecification>({
            phraseType: PhraseType.TraitUseSpecification,
            children: []
        });
        let t = expectOneOf([TokenType.Semicolon, TokenType.OpenBrace]);

        if (t.tokenType === TokenType.OpenBrace) {
            if (isTraitAdaptationStart(peek())) {
                p.children.push(p.adaptationList = traitAdaptationList());
            }
            expect(TokenType.CloseBrace);
        }

        return end<TraitUseSpecification>();

    }

    function traitAdaptationList() {

        return list(
            PhraseType.TraitAdaptationList,
            traitAdaptation,
            isTraitAdaptationStart,
            [TokenType.CloseBrace],

        ) as TraitAdaptationList;

    }

    function isTraitAdaptationStart(t: Token) {
        switch (t.tokenType) {
            case TokenType.Name:
            case TokenType.Backslash:
            case TokenType.Namespace:
                return true;
            default:
                return isSemiReservedToken(t);
        }
    }

    function traitAdaptation() {

        let p = start<Phrase>({
            phraseType: PhraseType.ErrorTraitAdaptation,
            children: []
        });
        let t = peek();
        let t2 = peek(1);

        if (t.tokenType === TokenType.Namespace ||
            t.tokenType === TokenType.Backslash ||
            (t.tokenType === TokenType.Name &&
                (t2.tokenType === TokenType.ColonColon || t2.tokenType === TokenType.Backslash))) {

            p.children.push((<TraitPrecedence | TraitAlias>p).method = methodReference());

            if (peek().tokenType === TokenType.InsteadOf) {
                next();
                return traitPrecedence(<TraitPrecedence>p);
            }

        } else if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {

            let methodRef = start<MethodReference>({
                phraseType: PhraseType.MethodReference,
                methodName: null,
                children: []
            });
            methodRef.children.push(methodRef.methodName = identifier());
            p.children.push((<TraitAlias>p).method = end<MethodReference>());
        } else {
            //error
            error();
            return end();
        }

        return traitAlias(<TraitAlias>p);


    }

    function traitAlias(p: TraitAlias) {

        p.phraseType = PhraseType.TraitAlias;
        expect(TokenType.As);

        let t = peek();

        if (t.tokenType === TokenType.Name || isReservedToken(t)) {
            p.children.push(p.alias = identifier());
        } else if (isMemberModifier(t)) {
            p.modifier = next();
            t = peek();
            if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
                p.children.push(p.alias = identifier());
            }
        } else {
            error();
        }

        expect(TokenType.Semicolon);
        return end<TraitAlias>();

    }

    function traitPrecedence(p: TraitPrecedence) {

        p.phraseType = PhraseType.TraitPrecedence;
        p.children.push(p.insteadOfNameList = qualifiedNameList([TokenType.Semicolon]));
        expect(TokenType.Semicolon);
        return end<TraitPrecedence>();

    }

    function methodReference() {

        let p = start<MethodReference>({
            phraseType: PhraseType.MethodReference,
            methodName: null,
            typeName: null,
            children: []
        });
        p.children.push(p.typeName = qualifiedName());
        expect(TokenType.ColonColon);
        p.children.push(p.methodName = identifier());
        return end<MethodReference>();

    }

    function methodDeclarationHeader(memberModifers: MemberModifierList) {

        let p = start<MethodDeclarationHeader>({
            phraseType: PhraseType.MethodDeclarationHeader,
            name: null,
            children: []
        }, true);
        if (memberModifers) {
            p.children.push(p.modifierList = memberModifers);
        }
        next(); //function
        p.returnsRef = optional(TokenType.Ampersand);
        p.children.push(p.name = identifier());
        expect(TokenType.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(p.parameterList = <ParameterDeclarationList>delimitedList(
                PhraseType.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenType.Comma,
                [TokenType.CloseParenthesis]
            ));
        }

        expect(TokenType.CloseParenthesis);

        if (peek().tokenType === TokenType.Colon) {
            p.children.push(p.returnType = returnType());
        }

        return end<MethodDeclarationHeader>();

    }

    function methodDeclaration(p: MethodDeclaration, memberModifers: MemberModifierList) {

        p.phraseType = PhraseType.MethodDeclaration;
        p.children.push(p.header = methodDeclarationHeader(memberModifers));
        p.children.push(p.body = methodDeclarationBody());
        return end();

    }

    function methodDeclarationBody() {
        let p = start<MethodDeclarationBody>({
            phraseType: PhraseType.MethodDeclarationBody,
            children: []
        });

        if (peek().tokenType === TokenType.Semicolon) {
            next();
        } else {
            p.children.push(p.block = compoundStatement());
        }
        return end<MethodDeclarationBody>();
    }

    function identifier() {
        let p = start<Identifier>({
            phraseType: PhraseType.Identifier,
            name: null,
            children: []
        });
        let t = peek();
        if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
            p.name = next();
        } else {
            error();
        }
        return end<Identifier>();
    }

    function interfaceDeclaration() {

        let p = start<InterfaceDeclaration>({
            phraseType: PhraseType.InterfaceDeclaration,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = interfaceDeclarationHeader());
        p.children.push(p.body = <InterfaceDeclarationBody>TypeDeclarationBody(
            PhraseType.InterfaceDeclarationBody, isClassMemberStart, interfaceMemberDeclarations
        ));
        return end<InterfaceDeclaration>();

    }

    function TypeDeclarationBody<T extends Phrase>(phraseType: PhraseType, elementStartPredicate: Predicate, listFunction: () => T) {

        let p = start<TypeDeclarationBody<T>>({
            phraseType: phraseType,
            children: []
        });
        expect(TokenType.OpenBrace);

        if (elementStartPredicate(peek())) {
            p.children.push(p.memberList = listFunction());
        }

        expect(TokenType.CloseBrace);
        return end();

    }

    function interfaceMemberDeclarations() {

        return list(
            PhraseType.InterfaceMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenType.CloseBrace],
            classMemberDeclarationListRecoverSet
        ) as InterfaceMemberDeclarationList;

    }

    function interfaceDeclarationHeader() {

        let p = start<InterfaceDeclarationHeader>({
            phraseType: PhraseType.InterfaceDeclarationHeader,
            name: null,
            children: []
        });
        next(); //interface
        p.name = expect(TokenType.Name);

        if (peek().tokenType === TokenType.Extends) {
            p.children.push(p.baseClause = interfaceBaseClause());
        }

        return end<InterfaceDeclarationHeader>();

    }

    function interfaceBaseClause() {

        let p = start<InterfaceBaseClause>({
            phraseType: PhraseType.InterfaceBaseClause,
            nameList: null,
            children: []
        });
        next(); //extends
        p.children.push(p.nameList = qualifiedNameList([TokenType.OpenBrace]));
        return end<InterfaceBaseClause>();

    }

    function traitDeclaration() {

        let p = start<TraitDeclaration>({
            phraseType: PhraseType.TraitDeclaration,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = traitDeclarationHeader());
        p.children.push(p.body = TypeDeclarationBody(
            PhraseType.TraitDeclarationBody, isClassMemberStart, traitMemberDeclarations
        ));
        return end<TraitDeclaration>();

    }

    function traitDeclarationHeader() {
        let p = start<TraitDeclarationHeader>({
            phraseType: PhraseType.TraitDeclarationHeader,
            name: null,
            children: []
        });
        next(); //trait
        p.name = expect(TokenType.Name);
        return end<TraitDeclarationHeader>();

    }

    function traitMemberDeclarations() {

        return list(
            PhraseType.TraitMemberDeclarationList,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenType.CloseBrace],
            classMemberDeclarationListRecoverSet
        ) as TraitMemberDeclarationList;

    }

    function functionDeclaration() {

        let p = start<FunctionDeclaration>({
            phraseType: PhraseType.FunctionDeclaration,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = functionDeclarationHeader());
        p.children.push(p.body = compoundStatement());
        return end();

    }

    function functionDeclarationHeader() {

        let p = start<FunctionDeclarationHeader>({
            phraseType: PhraseType.FunctionDeclarationHeader,
            name: null,
            children: []
        });

        next(); //function
        p.returnsRef = optional(TokenType.Ampersand);
        p.name = expect(TokenType.Name);
        expect(TokenType.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(p.parameterList = <ParameterDeclarationList>delimitedList(
                PhraseType.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenType.Comma,
                [TokenType.CloseParenthesis]
            ));
        }

        expect(TokenType.CloseParenthesis);

        if (peek().tokenType === TokenType.Colon) {
            p.children.push(p.returnType = returnType());
        }

        return end<FunctionDeclarationHeader>();

    }

    function isParameterStart(t: Token) {

        switch (t.tokenType) {
            case TokenType.Ampersand:
            case TokenType.Ellipsis:
            case TokenType.VariableName:
                return true;
            default:
                return isTypeDeclarationStart(t);
        }

    }

    function classDeclaration() {

        let p = start<ClassDeclaration>({
            phraseType: PhraseType.ClassDeclaration,
            header: null,
            body: null,
            children: []
        });
        
        p.children.push(p.header = classDeclarationHeader());
        p.children.push(p.body = TypeDeclarationBody(
            PhraseType.ClassDeclarationBody, isClassMemberStart, classMemberDeclarationList
        ));
        return end<ClassDeclaration>();

    }

    function classDeclarationHeader() {

        let p = start<ClassDeclarationHeader>({
            phraseType: PhraseType.ClassDeclarationHeader,
            name: null,
            children: []
        });
        p.modifier = optionalOneOf([TokenType.Abstract, TokenType.Final]);
        expect(TokenType.Class);
        p.name = expect(TokenType.Name);

        if (peek().tokenType === TokenType.Extends) {
            p.children.push(p.baseClause = classBaseClause());
        }

        if (peek().tokenType === TokenType.Implements) {
            p.children.push(p.interfaceClause = classInterfaceClause());
        }

        return end<ClassDeclarationHeader>();

    }

    function classBaseClause() {
        let p = start<ClassBaseClause>({
            phraseType: PhraseType.ClassBaseClause,
            name: null,
            children: []
        });
        next(); //extends
        p.children.push(p.name = qualifiedName());
        return end<ClassBaseClause>();
    }

    function compoundStatement() {

        let p = start<CompoundStatement>({
            phraseType: PhraseType.CompoundStatement,
            children: []
        });
        expect(TokenType.OpenBrace);

        if (isStatementStart(peek())) {
            p.children.push(p.statementList = statementList([TokenType.CloseBrace]));
        }

        expect(TokenType.CloseBrace);
        return end<CompoundStatement>();

    }

    function statement() {

        let t = peek();

        switch (t.tokenType) {
            case TokenType.Namespace:
                return namespaceDefinition();
            case TokenType.Use:
                return namespaceUseDeclaration();
            case TokenType.HaltCompiler:
                return haltCompilerStatement();
            case TokenType.Const:
                return constDeclaration();
            case TokenType.Function:
                return functionDeclaration();
            case TokenType.Class:
            case TokenType.Abstract:
            case TokenType.Final:
                return classDeclaration();
            case TokenType.Trait:
                return traitDeclaration();
            case TokenType.Interface:
                return interfaceDeclaration();
            case TokenType.OpenBrace:
                return compoundStatement();
            case TokenType.If:
                return ifStatement();
            case TokenType.While:
                return whileStatement();
            case TokenType.Do:
                return doStatement();
            case TokenType.For:
                return forStatement();
            case TokenType.Switch:
                return switchStatement();
            case TokenType.Break:
                return breakStatement();
            case TokenType.Continue:
                return continueStatement();
            case TokenType.Return:
                return returnStatement();
            case TokenType.Global:
                return globalDeclaration();
            case TokenType.Static:
                if (peek(1).tokenType === TokenType.VariableName &&
                    [TokenType.Semicolon, TokenType.Comma,
                    TokenType.CloseTag, TokenType.Equals].indexOf(peek(2).tokenType) >= 0) {
                    return functionStaticDeclaration();
                } else {
                    return expressionStatement();
                }
            case TokenType.Text:
            case TokenType.OpenTag:
            case TokenType.OpenTagEcho:
            case TokenType.CloseTag:
                return inlineText();
            case TokenType.ForEach:
                return foreachStatement();
            case TokenType.Declare:
                return declareStatement();
            case TokenType.Try:
                return tryStatement();
            case TokenType.Throw:
                return throwStatement();
            case TokenType.Goto:
                return gotoStatement();
            case TokenType.Echo:
                return echoIntrinsic();
            case TokenType.Unset:
                return unsetIntrinsic();
            case TokenType.Semicolon:
                return nullStatement();
            case TokenType.Name:
                if (peek(1).tokenType === TokenType.Colon) {
                    return namedLabelStatement();
                }
            //fall though
            default:
                return expressionStatement();

        }

    }

    function inlineText() {
        let p = start<InlineText>({
            phraseType: PhraseType.InlineText,
            children: []
        });

        optional(TokenType.CloseTag);
        optional(TokenType.Text);
        optionalOneOf([TokenType.OpenTagEcho, TokenType.OpenTag]);

        return end();
    }

    function nullStatement() {
        start<NullStatement>({
            phraseType: PhraseType.NullStatement,
            children: []
        });
        next(); //;
        return end<NullStatement>();
    }

    function isCatchClauseStart(t: Token) {
        return t.tokenType === TokenType.Catch;
    }

    function tryStatement() {

        let p = start<TryStatement>({
            phraseType: PhraseType.TryStatement,
            block: null,
            catchList: null,
            children: []
        });
        next(); //try
        p.children.push(p.block = compoundStatement());

        let t = peek();

        if (t.tokenType === TokenType.Catch) {
            p.children.push(p.catchList = <CatchClauseList>list(
                PhraseType.CatchClauseList,
                catchClause,
                isCatchClauseStart
            ));
        } else if (t.tokenType !== TokenType.Finally) {
            error();
        }

        if (peek().tokenType === TokenType.Finally) {
            p.children.push(p.finally = finallyClause());
        }

        return end<TryStatement>();

    }

    function finallyClause() {

        let p = start<FinallyClause>({
            phraseType: PhraseType.FinallyClause,
            block: null,
            children: []
        });
        next(); //finally
        p.children.push(p.block = compoundStatement());
        return end<FinallyClause>();

    }

    function catchClause() {

        let p = start<CatchClause>({
            phraseType: PhraseType.CatchClause,
            nameList: null,
            variable: null,
            block: null,
            children: []
        });
        next(); //catch
        expect(TokenType.OpenParenthesis);
        p.children.push(p.nameList = <CatchNameList>delimitedList(
            PhraseType.CatchNameList,
            qualifiedName,
            isQualifiedNameStart,
            TokenType.Bar,
            [TokenType.VariableName]
        ));
        p.variable = expect(TokenType.VariableName);
        expect(TokenType.CloseParenthesis);
        p.children.push(p.block = compoundStatement());
        return end<CatchClause>();

    }

    function declareDirective() {

        let p = start<DeclareDirective>({
            phraseType: PhraseType.DeclareDirective,
            name: null,
            value: null,
            children: []
        });
        p.name = expect(TokenType.Name);
        expect(TokenType.Equals);
        p.value = expectOneOf([TokenType.IntegerLiteral, TokenType.FloatingLiteral, TokenType.StringLiteral]);
        return end<DeclareDirective>();

    }

    function declareStatement() {

        let p = start<DeclareStatement>({
            phraseType: PhraseType.DeclareStatement,
            directive: null,
            statement: null,
            children: []
        });
        next(); //declare
        expect(TokenType.OpenParenthesis);
        p.children.push(p.directive = declareDirective());
        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {

            next(); //:
            p.children.push(p.statement = statementList([TokenType.EndDeclare]));
            expect(TokenType.EndDeclare);
            expect(TokenType.Semicolon);

        } else if (isStatementStart(t)) {

            p.children.push(p.statement = statement());

        } else if (t.tokenType === TokenType.Semicolon) {

            next();

        } else {

            error();

        }

        return end<DeclareStatement>();

    }

    function switchStatement() {

        let p = start<SwitchStatement>({
            phraseType: PhraseType.SwitchStatement,
            expr: null,
            children: []
        });
        next(); //switch
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);

        let t = expectOneOf([TokenType.Colon, TokenType.OpenBrace]);
        let tCase = peek();

        if (tCase.tokenType === TokenType.Case || tCase.tokenType === TokenType.Default) {
            p.children.push(p.caseList = caseStatements(t.tokenType === TokenType.Colon ?
                TokenType.EndSwitch : TokenType.CloseBrace));
        }

        if (t.tokenType === TokenType.Colon) {
            expect(TokenType.EndSwitch);
            expect(TokenType.Semicolon);
        } else {
            expect(TokenType.CloseBrace);
        }

        return end<SwitchStatement>();

    }

    function caseStatements(breakOn: TokenType) {

        let p = start<CaseStatementList>({
            phraseType: PhraseType.CaseStatementList,
            elements: [],
            children: []
        });
        let t: Token;
        let caseBreakOn = [TokenType.Case, TokenType.Default];
        let element: CaseStatement | DefaultStatement;
        caseBreakOn.push(breakOn);

        while (true) {

            t = peek();

            if (t.tokenType === TokenType.Case) {
                element = caseStatement(caseBreakOn);
                p.children.push(element);
                p.elements.push(element);
            } else if (t.tokenType === TokenType.Default) {
                element = defaultStatement(caseBreakOn);
                p.children.push(element);
                p.elements.push(element);
            } else if (breakOn === t.tokenType) {
                break;
            } else {
                error();
                break;
            }

        }

        return end<CaseStatementList>();

    }

    function caseStatement(breakOn: TokenType[]) {

        let p = start<CaseStatement>({
            phraseType: PhraseType.CaseStatement,
            expr: null,
            children: []
        });
        next(); //case
        p.children.push(p.expr = expression(0));
        expectOneOf([TokenType.Colon, TokenType.Semicolon]);
        if (isStatementStart(peek())) {
            p.children.push(p.statementList = statementList(breakOn));
        }
        return end<CaseStatement>();

    }

    function defaultStatement(breakOn: TokenType[]) {
        let p = start<DefaultStatement>({
            phraseType: PhraseType.DefaultStatement,
            children: []
        });
        next(); //default
        expectOneOf([TokenType.Colon, TokenType.Semicolon]);
        if (isStatementStart(peek())) {
            p.children.push(p.statementList = statementList(breakOn));
        }
        return end<DefaultStatement>();
    }

    function namedLabelStatement() {

        let p = start<NamedLabelStatement>({
            phraseType: PhraseType.NamedLabelStatement,
            name: null,
            children: []
        });
        p.name = next(); //name
        next(); //:
        return end<NamedLabelStatement>();
    }

    function gotoStatement() {

        let p = start<GotoStatement>({
            phraseType: PhraseType.GotoStatement,
            label: null,
            children: []
        });
        next(); //goto
        p.label = expect(TokenType.Name);
        expect(TokenType.Semicolon);
        return end<GotoStatement>();

    }

    function throwStatement() {

        let p = start<ThrowStatement>({
            phraseType: PhraseType.ThrowStatement,
            expr: null,
            children: []
        });
        next(); //throw
        p.children.push(p.expr = expression(0));
        expect(TokenType.Semicolon);
        return end<ThrowStatement>();
    }

    function foreachCollection() {
        let p = start<ForeachCollection>({
            phraseType: PhraseType.ForeachCollection,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        return end<ForeachCollection>();
    }

    function foreachKeyOrValue() {
        let p = start<ForeachValue>({
            phraseType: PhraseType.ForeachValue,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        if (peek().tokenType === TokenType.FatArrow) {
            next();
            p.phraseType = PhraseType.ForeachKey;
        }
        return end();
    }

    function foreachValue() {
        let p = start<ForeachValue>({
            phraseType: PhraseType.ForeachValue,
            expr: null,
            children: []
        });
        p.byRef = optional(TokenType.Ampersand);
        p.children.push(p.expr = expression(0));
        return end<ForeachValue>();
    }

    function foreachStatement() {

        let p = start<ForeachStatement>({
            phraseType: PhraseType.ForeachStatement,
            collection: null,
            value: null,
            statement: null,
            children: []
        });
        next(); //foreach
        expect(TokenType.OpenParenthesis);
        p.children.push(p.collection = foreachCollection());
        expect(TokenType.As);
        let keyOrValue = peek().tokenType === TokenType.Ampersand ? foreachValue() : foreachKeyOrValue();
        p.children.push(keyOrValue);

        if (keyOrValue.phraseType === PhraseType.ForeachKey) {
            p.key = <ForeachKey>keyOrValue;
            p.children.push(p.value = foreachValue());
        } else {
            p.value = <ForeachValue>keyOrValue;
        }

        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(p.statement = statementList([TokenType.EndForeach]));
            expect(TokenType.EndForeach);
            expect(TokenType.Semicolon);
        } else if (isStatementStart(t)) {
            p.children.push(p.statement = statement());
        } else {
            error();
        }

        return end<ForeachStatement>();

    }

    function isVariableStart(t: Token) {

        switch (t.tokenType) {
            case TokenType.VariableName:
            case TokenType.Dollar:
            case TokenType.OpenParenthesis:
            case TokenType.Array:
            case TokenType.OpenBracket:
            case TokenType.StringLiteral:
            case TokenType.Static:
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Backslash:
                return true;
            default:
                return false;
        }

    }

    function variableInitial() {
        return variable(variableAtom());
    }

    function variableList(breakOn?: TokenType[]) {
        return delimitedList(
            PhraseType.VariableList,
            variableInitial,
            isVariableStart,
            TokenType.Comma,
            breakOn
        ) as VariableList;
    }

    function unsetIntrinsic() {

        let p = start<UnsetIntrinsic>({
            phraseType: PhraseType.UnsetIntrinsic,
            variableList: null,
            children: []
        });
        next(); //unset
        expect(TokenType.OpenParenthesis);
        p.children.push(p.variableList = variableList([TokenType.CloseParenthesis]));
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Semicolon);
        return end();

    }

    function expressionInitial() {
        return expression(0);
    }

    function echoIntrinsic() {

        let p = start<EchoIntrinsic>({
            phraseType: PhraseType.EchoIntrinsic,
            exprList: null,
            children: []
        });
        next(); //echo
        p.children.push(p.exprList = <ExpressionList>delimitedList(
            PhraseType.ExpressionList,
            expressionInitial,
            isExpressionStart,
            TokenType.Comma
        ));
        expect(TokenType.Semicolon);
        return end();

    }

    function isStaticVariableDclarationStart(t: Token) {
        return t.tokenType === TokenType.VariableName;
    }

    function functionStaticDeclaration() {

        let p = start<FunctionStaticDeclaration>({
            phraseType: PhraseType.FunctionStaticDeclaration,
            variableDeclarationList: null,
            children: []
        });
        next(); //static
        p.children.push(p.variableDeclarationList = <StaticVariableDeclarationList>delimitedList(
            PhraseType.StaticVariableDeclarationList,
            staticVariableDeclaration,
            isStaticVariableDclarationStart,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return end();

    }

    function globalDeclaration() {

        let p = start<GlobalDeclaration>({
            phraseType: PhraseType.GlobalDeclaration,
            variableNameList: null,
            children: []
        });
        next(); //global
        p.children.push(p.variableNameList = <VariableNameList>delimitedList(
            PhraseType.VariableNameList,
            simpleVariable,
            isSimpleVariableStart,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return end();

    }

    function isSimpleVariableStart(t: Token) {
        switch (t.tokenType) {
            case TokenType.VariableName:
            case TokenType.Dollar:
                return true;
            default:
                return false;
        }
    }

    function staticVariableDeclaration() {

        let p = start<StaticVariableDeclaration>({
            phraseType: PhraseType.StaticVariableDeclaration,
            name: null,
            children: []
        });
        p.name = expect(TokenType.VariableName);

        if (peek().tokenType === TokenType.Equals) {
            p.children.push(p.initialiser = functionStaticInitialiser());
        }

        return end<StaticVariableDeclaration>();

    }

    function functionStaticInitialiser() {

        let p = start<FunctionStaticInitialiser>({
            phraseType: PhraseType.FunctionStaticInitialiser,
            value: null,
            children: []
        });
        next(); //=
        p.children.push(p.value = expression(0));
        return end<FunctionStaticInitialiser>();

    }

    function continueStatement() {
        let p = start<ContinueStatement>({
            phraseType: PhraseType.ContinueStatement,
            children: []
        });
        next(); //break/continue
        p.expr = optional(TokenType.IntegerLiteral);
        expect(TokenType.Semicolon);
        return end();
    }

    function breakStatement() {
        let p = start<BreakStatement>({
            phraseType: PhraseType.BreakStatement,
            children: []
        });
        next(); //break/continue
        p.expr = optional(TokenType.IntegerLiteral);
        expect(TokenType.Semicolon);
        return end();
    }

    function returnStatement() {
        let p = start<ReturnStatement>({
            phraseType: PhraseType.ReturnStatement,
            children: []
        });
        next(); //return

        if (isExpressionStart(peek())) {
            p.children.push(p.expr = expression(0));
        }

        expect(TokenType.Semicolon);
        return end();
    }

    function forExpressionGroup(phraseType: PhraseType, breakOn: TokenType[]) {

        return delimitedList(
            phraseType,
            expressionInitial,
            isExpressionStart,
            TokenType.Comma,
            breakOn
        );

    }

    function forStatement() {

        let p = start<ForStatement>({
            phraseType: PhraseType.ForStatement,
            statement: null,
            children: []
        });
        next(); //for
        expect(TokenType.OpenParenthesis);

        if (isExpressionStart(peek())) {
            p.children.push(p.initialiser = <ForInitialiser>forExpressionGroup(PhraseType.ForInitialiser, [TokenType.Semicolon]));
        }

        expect(TokenType.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(p.control = <ForControl>forExpressionGroup(PhraseType.ForControl, [TokenType.Semicolon]));
        }

        expect(TokenType.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(p.end = <ForEndOfLoop>forExpressionGroup(PhraseType.ForEndOfLoop, [TokenType.CloseParenthesis]));
        }

        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(p.statement = statementList([TokenType.EndFor]));
            expect(TokenType.EndFor);
            expect(TokenType.Semicolon);
        } else if (isStatementStart(peek())) {
            p.children.push(p.statement = statement());
        } else {
            error();
        }

        return end();

    }

    function doStatement() {

        let p = start<DoStatement>({
            phraseType: PhraseType.DoStatement,
            statement: null,
            expr: null,
            children: []
        });
        next(); // do
        p.children.push(p.statement = statement());
        expect(TokenType.While);
        expect(TokenType.OpenParenthesis);
        p.children.push(p.expr = expression(0));
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Semicolon);
        return end();

    }

    function whileStatement() {

        let p = start<WhileStatement>({
            phraseType: PhraseType.WhileStatement,
            expr: null,
            statement: null,
            children: []
        });
        next(); //while
        expect(TokenType.OpenParenthesis);
        p.children.push(p.expr = expression(0));
        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(p.statement = statementList([TokenType.EndWhile]));
            expect(TokenType.EndWhile);
            expect(TokenType.Semicolon);
        } else if (isStatementStart(t)) {
            p.children.push(p.statement = statement());
        } else {
            //error
            error();
        }

        return end();

    }

    function elseIfClause1() {

        let p = start<ElseIfClause>({
            phraseType: PhraseType.ElseIfClause,
            expr: null,
            statement: null,
            children: []
        });
        next(); //elseif
        expect(TokenType.OpenParenthesis);
        p.children.push(p.expr = expression(0));
        expect(TokenType.CloseParenthesis);
        p.children.push(p.statement = statement());
        return end<ElseIfClause>();
    }

    function elseIfClause2() {
        let p = start<ElseIfClause>({
            phraseType: PhraseType.ElseIfClause,
            expr: null,
            statement: null,
            children: []
        });
        next(); //elseif
        expect(TokenType.OpenParenthesis);
        p.children.push(p.expr = expression(0));
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Colon);
        p.children.push(p.statement = statementList([TokenType.EndIf, TokenType.Else, TokenType.ElseIf]));
        return end<ElseIfClause>();
    }

    function elseClause1() {
        let p = start<ElseClause>({
            phraseType: PhraseType.ElseClause,
            statement: null,
            children: []
        });
        next(); //else
        p.children.push(p.statement = statement());
        return end<ElseClause>();
    }

    function elseClause2() {
        let p = start<ElseClause>({
            phraseType: PhraseType.ElseClause,
            statement: null,
            children: []
        });
        next(); //else
        expect(TokenType.Colon);
        p.children.push(p.statement = statementList([TokenType.EndIf]));
        return end<ElseClause>();
    }

    function isElseIfClauseStart(t: Token) {
        return t.tokenType === TokenType.ElseIf;
    }

    function ifStatement() {

        let p = start<IfStatement>({
            phraseType: PhraseType.IfStatement,
            expr: null,
            statement: null,
            children: []
        });
        next(); //if
        expect(TokenType.OpenParenthesis);
        p.children.push(p.expr = expression(0));
        expect(TokenType.CloseParenthesis);

        let t = peek();
        let elseIfClauseFunction = elseIfClause1;
        let elseClauseFunction = elseClause1;
        let expectEndIf = false;

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(p.statement = statementList([TokenType.ElseIf, TokenType.Else, TokenType.EndIf]));
            elseIfClauseFunction = elseIfClause2;
            elseClauseFunction = elseClause2;
            expectEndIf = true;
        } else if (isStatementStart(t)) {
            p.children.push(p.statement = statement());
        } else {
            error();
        }

        if (peek().tokenType === TokenType.ElseIf) {
            p.children.push(p.elseIfClauseList = <ElseIfClauseList>list(
                PhraseType.ElseIfClauseList,
                elseIfClauseFunction,
                isElseIfClauseStart
            ));
        }

        if (peek().tokenType === TokenType.Else) {
            p.children.push(p.elseClause = elseClauseFunction());
        }

        if (expectEndIf) {
            expect(TokenType.EndIf);
            expect(TokenType.Semicolon);
        }

        return end();

    }

    function expressionStatement() {

        let p = start<ExpressionStatement>({
            phraseType: PhraseType.ExpressionStatement,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        expect(TokenType.Semicolon);
        return end();

    }

    function returnType() {
        let p = start<ReturnType>({
            phraseType: PhraseType.ReturnType,
            type: null,
            children: []
        });
        next(); //:
        p.children.push(p.type = typeDeclaration());
        return end<ReturnType>();
    }

    function typeDeclaration() {

        let p = start<TypeDeclaration>({
            phraseType: PhraseType.TypeDeclaration,
            name: null,
            children: []
        });
        p.nullable = optional(TokenType.Question);

        switch (peek().tokenType) {
            case TokenType.Callable:
            case TokenType.Array:
                p.name = next();
                break;
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Backslash:
                p.children.push(p.name = qualifiedName());
                break;
            default:
                error();
                break;
        }

        return end<TypeDeclaration>();

    }

    function classConstDeclaration(p: ClassConstDeclaration) {

        p.phraseType = PhraseType.ClassConstDeclaration;
        next(); //const
        p.children.push(p.constElementList = <ClassConstElementList>delimitedList(
            PhraseType.ClassConstElementList,
            classConstElement,
            isClassConstElementStartToken,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return end();

    }

    function isExpressionStart(t: Token) {

        switch (t.tokenType) {
            case TokenType.VariableName:
            case TokenType.Dollar:
            case TokenType.Array:
            case TokenType.OpenBracket:
            case TokenType.StringLiteral:
            case TokenType.Backslash:
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.OpenParenthesis:
            case TokenType.Static:
            case TokenType.PlusPlus:
            case TokenType.MinusMinus:
            case TokenType.Plus:
            case TokenType.Minus:
            case TokenType.Exclamation:
            case TokenType.Tilde:
            case TokenType.AtSymbol:
            case TokenType.IntegerCast:
            case TokenType.FloatCast:
            case TokenType.StringCast:
            case TokenType.ArrayCast:
            case TokenType.ObjectCast:
            case TokenType.BooleanCast:
            case TokenType.UnsetCast:
            case TokenType.List:
            case TokenType.Clone:
            case TokenType.New:
            case TokenType.FloatingLiteral:
            case TokenType.IntegerLiteral:
            case TokenType.LineConstant:
            case TokenType.FileConstant:
            case TokenType.DirectoryConstant:
            case TokenType.TraitConstant:
            case TokenType.MethodConstant:
            case TokenType.FunctionConstant:
            case TokenType.NamespaceConstant:
            case TokenType.ClassConstant:
            case TokenType.StartHeredoc:
            case TokenType.DoubleQuote:
            case TokenType.Backtick:
            case TokenType.Print:
            case TokenType.Yield:
            case TokenType.YieldFrom:
            case TokenType.Function:
            case TokenType.Include:
            case TokenType.IncludeOnce:
            case TokenType.Require:
            case TokenType.RequireOnce:
            case TokenType.Eval:
            case TokenType.Empty:
            case TokenType.Isset:
            case TokenType.Exit:
                return true;
            default:
                return false;
        }

    }

    function classConstElement() {

        let p = start<ClassConstElement>({
            phraseType: PhraseType.ConstElement,
            name: null,
            value: null,
            children: []
        });
        p.children.push(p.name = identifier());
        expect(TokenType.Equals);
        p.children.push(p.value = expression(0));
        return end<ClassConstElement>();

    }

    function isPropertyElementStart(t: Token) {
        return t.tokenType === TokenType.VariableName;
    }

    function propertyDeclaration(p: PropertyDeclaration) {

        let t: Token;
        p.phraseType = PhraseType.PropertyDeclaration;
        p.children.push(p.propertyList = <PropertyElementList>delimitedList(
            PhraseType.PropertyElementList,
            propertyElement,
            isPropertyElementStart,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return end();

    }

    function propertyElement() {

        let p = start<PropertyElement>({
            phraseType: PhraseType.PropertyElement,
            name: null,
            children: []
        });
        p.name = expect(TokenType.VariableName);

        if (peek().tokenType === TokenType.Equals) {
            p.children.push(p.initialiser = propertyInitialiser());
        }

        return end<PropertyElement>();

    }

    function propertyInitialiser() {

        let p = start<PropertyInitialiser>({
            phraseType: PhraseType.PropertyInitialiser,
            value: null,
            children: []
        });
        next(); //equals
        p.children.push(p.value = expression(0));
        return end<PropertyInitialiser>();

    }

    function memberModifierList() {

        let p = start<MemberModifierList>({
            phraseType: PhraseType.MemberModifierList,
            elements: [],
            children: []
        });

        while (isMemberModifier(peek())) {
            p.elements.push(next());
        }

        return end<MemberModifierList>();

    }

    function isMemberModifier(t: Token) {
        switch (t.tokenType) {
            case TokenType.Public:
            case TokenType.Protected:
            case TokenType.Private:
            case TokenType.Static:
            case TokenType.Abstract:
            case TokenType.Final:
                return true;
            default:
                return false;
        }
    }


    function qualifiedNameList(breakOn: TokenType[]) {

        return delimitedList(
            PhraseType.QualifiedNameList,
            qualifiedName,
            isQualifiedNameStart,
            TokenType.Comma,
            breakOn
        ) as QualifiedNameList;
    }

    function objectCreationExpression() {

        let p = start<ObjectCreationExpression>({
            phraseType: PhraseType.ObjectCreationExpression,
            type: null,
            children: []
        });
        next(); //new

        if (peek().tokenType === TokenType.Class) {
            p.children.push(p.type = anonymousClassDeclaration());
            return end();
        }

        p.children.push(p.type = typeDesignator(PhraseType.ClassTypeDesignator));

        if (optional(TokenType.OpenParenthesis)) {

            if (isArgumentStart(peek())) {
                p.children.push(p.argumentList = argumentList());
            }

            expect(TokenType.CloseParenthesis);
        }

        return end();

    }

    function typeDesignator(phraseType: PhraseType) {

        let p = start<TypeDesignator>({
            phraseType: phraseType,
            type: null,
            children: []
        });
        let part = classTypeDesignatorAtom();

        while (true) {

            switch (peek().tokenType) {
                case TokenType.OpenBracket:
                    part = subscriptExpression(part, TokenType.CloseBracket);
                    continue;
                case TokenType.OpenBrace:
                    part = subscriptExpression(part, TokenType.CloseBrace);
                    continue;
                case TokenType.Arrow:
                    part = propertyAccessExpression(part);
                    continue;
                case TokenType.ColonColon:
                    let staticPropNode = start<ScopedPropertyAccessExpression>({
                        phraseType: PhraseType.ScopedPropertyAccessExpression,
                        scope: part,
                        memberName: null,
                        children: []
                    });
                    staticPropNode.children.push(part);
                    next(); //::
                    staticPropNode.children.push(staticPropNode.memberName = restrictedScopedMemberName());
                    part = end();
                    continue;
                default:
                    break;
            }

            break;

        }

        p.children.push(p.type = part);
        return end<TypeDesignator>();

    }

    function restrictedScopedMemberName() {

        let p = start<ScopedMemberName>({
            phraseType: PhraseType.ScopedMemberName,
            name: null,
            children: []
        });
        let t = peek();

        switch (t.tokenType) {
            case TokenType.VariableName:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                p.name = next();
                break;
            case TokenType.Dollar:
                p.children.push(p.name = simpleVariable());
                break;
            default:
                error();
                break;
        }

        return end<ScopedMemberName>();

    }

    function classTypeDesignatorAtom() {

        let t = peek();

        switch (t.tokenType) {
            case TokenType.Static:
                return relativeScope();
            case TokenType.VariableName:
            case TokenType.Dollar:
                return simpleVariable();
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Backslash:
                return qualifiedName();
            default:
                start({
                    phraseType: PhraseType.ErrorClassTypeDesignatorAtom,
                    children: []
                });
                error();
                return end();
        }

    }

    function cloneExpression() {

        let p = start<CloneExpression>({
            phraseType: PhraseType.CloneExpression,
            expr: null,
            children: []
        });
        next(); //clone
        p.children.push(p.expr = expression(0));
        return end();

    }

    function listIntrinsic() {

        let p = start<ListIntrinsic>({
            phraseType: PhraseType.ListIntrinsic,
            initialiserList: null,
            children: []
        });
        next(); //list
        expect(TokenType.OpenParenthesis);
        p.children.push(p.initialiserList = arrayInitialiserList(TokenType.CloseParenthesis));
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function unaryExpression(phraseType: PhraseType) {

        let p = start<UnaryExpression>({
            phraseType: phraseType,
            operator: null,
            operand: null,
            children: []
        });
        p.operator = next();//op

        switch (phraseType) {
            case PhraseType.PrefixDecrementExpression:
            case PhraseType.PrefixIncrementExpression:
                p.children.push(p.operand = variable(variableAtom()));
                break;
            default:
                p.children.push(p.operand = expression(precedenceAssociativityTuple(p.operator)[0]));
                break;
        }

        return end();

    }

    function anonymousFunctionHeader() {
        let p = start<AnonymousFunctionHeader>({
            phraseType: PhraseType.AnonymousFunctionHeader,
            children: []
        });
        p.modifier = optional(TokenType.Static);
        next(); //function
        p.returnsRef = optional(TokenType.Ampersand);
        expect(TokenType.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(p.parameterList = <ParameterDeclarationList>delimitedList(
                PhraseType.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenType.Comma,
                [TokenType.CloseParenthesis]
            ));
        }

        expect(TokenType.CloseParenthesis);

        if (peek().tokenType === TokenType.Use) {
            p.children.push(p.useClause = anonymousFunctionUseClause());
        }

        if (peek().tokenType === TokenType.Colon) {
            p.children.push(p.returnType = returnType());
        }

        return end<AnonymousFunctionHeader>();

    }

    function anonymousFunctionCreationExpression() {

        let p = start<AnonymousFunctionCreationExpression>({
            phraseType: PhraseType.AnonymousFunctionCreationExpression,
            header: null,
            body: null,
            children: []
        });
        
        p.children.push(p.header = anonymousFunctionHeader());
        p.children.push(p.body = compoundStatement());
        return end();

    }

    function isAnonymousFunctionUseVariableStart(t: Token) {
        return t.tokenType === TokenType.VariableName ||
            t.tokenType === TokenType.Ampersand;
    }

    function anonymousFunctionUseClause() {

        let p = start<AnonymousFunctionUseClause>({
            phraseType: PhraseType.AnonymousFunctionUseClause,
            useList: null,
            children: []
        });
        next(); //use
        expect(TokenType.OpenParenthesis);
        p.children.push(p.useList = <ClosureUseList>delimitedList(
            PhraseType.ClosureUseList,
            anonymousFunctionUseVariable,
            isAnonymousFunctionUseVariableStart,
            TokenType.Comma,
            [TokenType.CloseParenthesis]
        ));
        expect(TokenType.CloseParenthesis);
        return end<AnonymousFunctionUseClause>();

    }

    function anonymousFunctionUseVariable() {

        let p = start<AnonymousFunctionUseVariable>({
            phraseType: PhraseType.AnonymousFunctionUseVariable,
            name: null,
            children: []
        });
        p.byRef = optional(TokenType.Ampersand);
        p.name = expect(TokenType.VariableName);
        return end<AnonymousFunctionUseVariable>();

    }

    function isTypeDeclarationStart(t: Token) {
        switch (t.tokenType) {
            case TokenType.Backslash:
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Question:
            case TokenType.Array:
            case TokenType.Callable:
                return true;
            default:
                return false;
        }
    }

    function parameterDeclaration() {

        let p = start<ParameterDeclaration>({
            phraseType: PhraseType.ParameterDeclaration,
            name: null,
            children: []
        });

        if (isTypeDeclarationStart(peek())) {
            p.children.push(p.type = typeDeclaration());
        }

        p.byRef = optional(TokenType.Ampersand);
        p.variadic = optional(TokenType.Ellipsis);
        p.name = expect(TokenType.VariableName);

        if (peek().tokenType === TokenType.Equals) {
            next();
            p.children.push(p.value = expression(0));
        }

        return end<ParameterDeclaration>();

    }

    function variable(variableAtomNode: Phrase | Token) {

        let count = 0;

        while (true) {
            ++count;
            switch (peek().tokenType) {
                case TokenType.ColonColon:
                    variableAtomNode = scopedAccessExpression(variableAtomNode);
                    continue;
                case TokenType.Arrow:
                    variableAtomNode = propertyOrMethodAccessExpression(variableAtomNode);
                    continue;
                case TokenType.OpenBracket:
                    variableAtomNode = subscriptExpression(variableAtomNode, TokenType.CloseBracket);
                    continue;
                case TokenType.OpenBrace:
                    variableAtomNode = subscriptExpression(variableAtomNode, TokenType.CloseBrace);
                    continue;
                case TokenType.OpenParenthesis:
                    variableAtomNode = functionCallExpression(variableAtomNode);
                    continue;
                default:
                    //only simple variable atoms qualify as variables
                    if (count === 1 && (<Phrase>variableAtomNode).phraseType !== PhraseType.SimpleVariable) {
                        let errNode = start({
                            phraseType: PhraseType.ErrorVariable,
                            children: []
                        }, true);
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
        let p = start<FunctionCallExpression>({
            phraseType: PhraseType.FunctionCallExpression,
            callableExpr: null,
            children: []
        }, true);
        p.children.push(p.callableExpr = lhs);
        expect(TokenType.OpenParenthesis);
        if (isArgumentStart(peek())) {
            p.children.push(p.argumentList = argumentList());
        }
        expect(TokenType.CloseParenthesis);
        return end();
    }

    function scopedAccessExpression(lhs: Phrase | Token) {

        let p = start<ScopedExpression>({
            phraseType: PhraseType.ErrorScopedAccessExpression,
            scope: null,
            memberName: null,
            children: []
        }, true);
        p.children.push(p.scope = lhs);
        next() //::
        p.children.push(p.memberName = scopedMemberName(p));

        if (optional(TokenType.OpenParenthesis)) {
            p.phraseType = PhraseType.ScopedCallExpression;
            if (isArgumentStart(peek())) {
                p.children.push((<ScopedCallExpression>p).argumentList = argumentList());
            }

            expect(TokenType.CloseParenthesis);
            return end();
        } else if (p.phraseType === PhraseType.ScopedCallExpression) {
            //error
            error();
        }

        return end();

    }

    function scopedMemberName(parent: Phrase) {

        let p = start<ScopedMemberName>({
            phraseType: PhraseType.ScopedMemberName,
            name: null,
            children: []
        });
        let t = peek();

        switch (t.tokenType) {
            case TokenType.OpenBrace:
                parent.phraseType = PhraseType.ScopedCallExpression;
                p.children.push(p.name = encapsulatedExpression(TokenType.OpenBrace, TokenType.CloseBrace));
                break;
            case TokenType.VariableName:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                parent.phraseType = PhraseType.ScopedPropertyAccessExpression;
                p.name = next();
                break;
            case TokenType.Dollar:
                p.children.push(p.name = simpleVariable());
                parent.phraseType = PhraseType.ScopedPropertyAccessExpression;
                break;
            default:
                if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
                    p.children.push(p.name = identifier());
                    parent.phraseType = PhraseType.ClassConstantAccessExpression;
                } else {
                    //error
                    error();
                }
                break;
        }

        return end<ScopedMemberName>();

    }

    function propertyAccessExpression(lhs: Phrase | Token) {
        let p = start<PropertyAccessExpression>({
            phraseType: PhraseType.PropertyAccessExpression,
            variable: null,
            memberName: null,
            children: []
        }, true);
        p.children.push(p.variable = lhs);
        next(); //->
        p.children.push(p.memberName = memberName());
        return end();
    }

    function propertyOrMethodAccessExpression(lhs: Phrase | Token) {

        let p = start<ObjectAccessExpression>({
            phraseType: PhraseType.PropertyAccessExpression,
            variable: null,
            memberName: null,
            children: []
        }, true);
        p.children.push(p.variable = lhs);
        next(); //->
        p.children.push(p.memberName = memberName());

        if (optional(TokenType.OpenParenthesis)) {
            if (isArgumentStart(peek())) {
                p.children.push((<MethodCallExpression>p).argumentList = argumentList());
            }
            p.phraseType = PhraseType.MethodCallExpression;
            expect(TokenType.CloseParenthesis);
        }

        return end();

    }

    function memberName() {

        let p = start<MemberName>({
            phraseType: PhraseType.MemberName,
            name: null,
            children: []
        });

        switch (peek().tokenType) {
            case TokenType.Name:
                p.name = next();
                break;
            case TokenType.OpenBrace:
                p.children.push(p.name = encapsulatedExpression(TokenType.OpenBrace, TokenType.CloseBrace));
                break;
            case TokenType.Dollar:
            case TokenType.VariableName:
                p.children.push(p.name = simpleVariable());
                break;
            default:
                error();
                break;
        }

        return end<MemberName>();

    }

    function subscriptExpression(lhs: Phrase | Token, closeTokenType: TokenType) {

        let p = start<SubscriptExpression>({
            phraseType: PhraseType.SubscriptExpression,
            dereferencable: null,
            offset: null,
            children: []
        }, true);
        p.children.push(p.dereferencable = lhs);
        next(); // [ or {

        if (isExpressionStart(peek())) {
            p.children.push(p.offset = expression(0));
        }

        expect(closeTokenType);
        return end();

    }

    function argumentList() {

        return delimitedList(
            PhraseType.ArgumentExpressionList,
            argumentExpression,
            isArgumentStart,
            TokenType.Comma,
            [TokenType.CloseParenthesis]
        ) as ArgumentExpressionList;

    }

    function isArgumentStart(t: Token) {
        return t.tokenType === TokenType.Ellipsis || isExpressionStart(t);
    }

    function variadicUnpacking() {
        let p = start<VariadicUnpacking>({
            phraseType: PhraseType.VariadicUnpacking,
            expr: null,
            children: []
        });
        next(); //...
        p.children.push(p.expr = expression(0));
        return end();
    }

    function argumentExpression() {
        return peek().tokenType === TokenType.Ellipsis ?
            variadicUnpacking() : expression(0);
    }

    function qualifiedName() {

        let p = start<QualifiedName>({
            phraseType: PhraseType.QualifiedName,
            name: null,
            children: []
        });
        let t = peek();

        if (t.tokenType === TokenType.Backslash) {
            next();
            p.phraseType = PhraseType.FullyQualifiedName;
        } else if (t.tokenType === TokenType.Namespace) {
            p.phraseType = PhraseType.RelativeQualifiedName;
            next();
            expect(TokenType.Backslash);
        }

        p.children.push(p.name = namespaceName());
        return end<QualifiedName>();

    }

    function isQualifiedNameStart(t: Token) {
        switch (t.tokenType) {
            case TokenType.Backslash:
            case TokenType.Name:
            case TokenType.Namespace:
                return true;
            default:
                return false;
        }
    }

    function shortArrayCreationExpression() {

        let p = start<ArrayCreationExpression>({
            phraseType: PhraseType.ArrayCreationExpression,
            children: []
        });
        next(); //[
        if (isArrayElementStart(peek())) {
            p.children.push(p.initialiserList = arrayInitialiserList(TokenType.CloseBracket));
        }
        expect(TokenType.CloseBracket);
        return end();

    }

    function longArrayCreationExpression() {

        let p = start<ArrayCreationExpression>({
            phraseType: PhraseType.ArrayCreationExpression,
            children: []
        });
        next(); //array
        expect(TokenType.OpenParenthesis);

        if (isArrayElementStart(peek())) {
            p.children.push(p.initialiserList = arrayInitialiserList(TokenType.CloseParenthesis));
        }

        expect(TokenType.CloseParenthesis);
        return end();

    }

    function isArrayElementStart(t: Token) {
        return t.tokenType === TokenType.Ampersand || isExpressionStart(t);
    }

    function arrayInitialiserList(breakOn: TokenType) {

        let p = start<ArrayInitialiserList>({
            phraseType: PhraseType.ArrayInitialiserList,
            elements: [],
            children: []
        });
        let t: Token;
        let el: ArrayElement;

        while (true) {

            t = peek();

            //arrays can have empty elements
            if (isArrayElementStart(t)) {
                el = arrayElement();
                p.children.push(el);
                p.elements.push(el);
            } else if (t.tokenType === TokenType.Comma) {
                next();
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                error();
                break;
            }

        }

        return end<ArrayInitialiserList>();

    }

    function arrayValue() {

        let p = start<ArrayValue>({
            phraseType: PhraseType.ArrayValue,
            expr: null,
            children: []
        });
        p.byRef = optional(TokenType.Ampersand)
        p.children.push(p.expr = expression(0));
        return end<ArrayValue>();

    }

    function arrayKey() {
        let p = start<ArrayKey>({
            phraseType: PhraseType.ArrayKey,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        return end<ArrayKey>();
    }

    function arrayElement() {

        let p = start<ArrayElement>({
            phraseType: PhraseType.ArrayElement,
            value: null,
            children: []
        });

        if (peek().tokenType === TokenType.Ampersand) {
            p.children.push(p.value = arrayValue());
            return end<ArrayElement>();
        }

        let keyOrValue = arrayKey();
        p.children.push(keyOrValue);

        if (!optional(TokenType.FatArrow)) {
            keyOrValue.phraseType = PhraseType.ArrayValue;
            p.value = keyOrValue;
            return end<ArrayElement>();
        }

        p.key = keyOrValue;
        p.children.push(p.value = arrayValue());
        return end<ArrayElement>();

    }

    function encapsulatedExpression(openTokenType: TokenType, closeTokenType: TokenType) {

        let p = start<EncapsulatedExpression>({
            phraseType: PhraseType.EncapsulatedExpression,
            expr: null,
            children: []
        });
        expect(openTokenType);
        p.children.push(p.expr = expression(0));
        expect(closeTokenType);
        return end();

    }

    function relativeScope() {
        let p = start<RelativeScope>({
            phraseType: PhraseType.RelativeScope,
            identifier: null,
            children: []
        });
        p.identifier = next();
        return end();
    }

    function variableAtom(): Phrase | Token {

        let t = peek();
        switch (t.tokenType) {
            case TokenType.VariableName:
            case TokenType.Dollar:
                return simpleVariable();
            case TokenType.OpenParenthesis:
                return encapsulatedExpression(TokenType.OpenParenthesis, TokenType.CloseParenthesis);
            case TokenType.Array:
                return longArrayCreationExpression();
            case TokenType.OpenBracket:
                return shortArrayCreationExpression();
            case TokenType.StringLiteral:
                return next(true);
            case TokenType.Static:
                return relativeScope();
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Backslash:
                return qualifiedName();
            default:
                //error
                let p = start({ phraseType: PhraseType.ErrorVariableAtom, children: [] });
                error();
                return end();
        }

    }

    function simpleVariable() {

        let p = start<SimpleVariable>({
            phraseType: PhraseType.SimpleVariable,
            name: null,
            children: []
        });
        let t = expectOneOf([TokenType.VariableName, TokenType.Dollar]);

        if (t.tokenType === TokenType.Dollar) {
            t = peek();
            if (t.tokenType === TokenType.OpenBrace) {
                next();
                p.children.push(p.name = expression(0));
                expect(TokenType.CloseBrace);
            } else if (t.tokenType === TokenType.Dollar || t.tokenType === TokenType.VariableName) {
                p.children.push(p.name = simpleVariable());
            } else {
                error();
            }
        } else if (t.tokenType === TokenType.VariableName) {
            p.name = t;
        }

        return end();

    }

    function haltCompilerStatement() {

        let p = start({ phraseType: PhraseType.HaltCompilerStatement, children: [] });
        next(); // __halt_compiler
        expect(TokenType.OpenParenthesis);
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Semicolon);

        //all data is ignored after encountering __halt_compiler
        while (peek().tokenType !== TokenType.EndOfFile) {
            next();
        }

        return end();

    }

    function namespaceUseDeclaration() {

        let p = start<NamespaceUseDeclaration>({
            phraseType: PhraseType.NamespaceUseDeclaration,
            list: null,
            children: []
        });
        next(); //use
        p.kind = optionalOneOf([TokenType.Function, TokenType.Const]);
        optional(TokenType.Backslash);
        let nsNameNode = namespaceName();
        let t = peek();

        if (t.tokenType === TokenType.Backslash || t.tokenType === TokenType.OpenBrace) {
            p.children.push(p.prefix = nsNameNode);
            expect(TokenType.Backslash);
            expect(TokenType.OpenBrace);
            p.children.push(p.list = <NamespaceUseGroupClauseList>delimitedList(
                PhraseType.NamespaceUseGroupClauseList,
                namespaceUseGroupClause,
                isNamespaceUseGroupClauseStartToken,
                TokenType.Comma,
                [TokenType.CloseBrace]
            ));
            return end();
        }

        p.children.push(p.list = <NamespaceUseClauseList>delimitedList(
            PhraseType.NamespaceUseClauseList,
            namespaceUseClauseFunction(nsNameNode),
            isQualifiedNameStart,
            TokenType.Comma,
            [TokenType.Semicolon]));

        expect(TokenType.Semicolon);
        return end();

    }

    function namespaceUseClauseFunction(nsName: NamespaceName) {

        return () => {

            let p = start<NamespaceUseClause>({
                phraseType: PhraseType.NamespaceUseClause,
                name: null,
                children: []
            }, !!nsName);

            if (nsName) {
                p.children.push(p.name = nsName);
                nsName = null;
            } else {
                p.children.push(p.name = namespaceName());
            }

            if (peek().tokenType === TokenType.As) {
                p.children.push(p.aliasingClause = namespaceAliasingClause());
            }

            return end<NamespaceUseClause>();

        };

    }

    function delimitedList(phraseType: PhraseType, elementFunction: () => Phrase | Token,
        elementStartPredicate: Predicate, delimiter: TokenType, breakOn?: TokenType[]) {
        let p = start<List<Phrase | Token>>({
            phraseType: phraseType,
            elements: [],
            children: []
        });
        let t: Token;
        let element: Phrase | Token;
        let delimitedListRecoverSet = breakOn ? breakOn.slice(0) : [];
        delimitedListRecoverSet.push(delimiter);
        recoverSetStack.push(delimitedListRecoverSet);

        while (true) {

            element = elementFunction();
            p.children.push(element);
            p.elements.push(element);
            t = peek();

            if (t.tokenType === delimiter) {
                next();
            } else if (!breakOn || breakOn.indexOf(t.tokenType) >= 0) {
                break;
            } else {
                error();
                //check for missing delimeter
                if (elementStartPredicate(t)) {
                    continue;
                } else if (breakOn) {
                    //skip until breakOn or delimiter token or whatever else is in recover set
                    defaultSyncStrategy();
                    if (peek().tokenType === delimiter) {
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
        switch (t.tokenType) {
            case TokenType.Const:
            case TokenType.Function:
            case TokenType.Name:
                return true;
            default:
                return false;
        }
    }

    function namespaceUseGroupClause() {

        let p = start<NamespaceUseGroupClause>({
            phraseType: PhraseType.NamespaceUseGroupClause,
            name: null,
            children: []
        });
        p.kind = optionalOneOf([TokenType.Function, TokenType.Const]);
        p.children.push(p.name = namespaceName());

        if (peek().tokenType === TokenType.As) {
            p.children.push(p.aliasingClause = namespaceAliasingClause());
        }

        return end<NamespaceUseGroupClause>();

    }

    function namespaceAliasingClause() {

        let p = start<NamespaceAliasingClause>({
            phraseType: PhraseType.NamespaceAliasingClause,
            alias: null,
            children: []
        });
        next(); //as
        p.alias = expect(TokenType.Name);
        return end<NamespaceAliasingClause>();

    }

    function namespaceDefinition() {

        let p = start<NamespaceDefinition>({
            phraseType: PhraseType.NamespaceDefinition,
            children: []
        });
        next(); //namespace

        if (peek().tokenType === TokenType.Name) {

            p.children.push(p.name = namespaceName());
            let t = expectOneOf([TokenType.Semicolon, TokenType.OpenBrace]);
            if (!t || t.tokenType !== TokenType.OpenBrace) {
                return end();
            }

        } else {
            expect(TokenType.OpenBrace);
        }

        p.children.push(p.statementList = statementList([TokenType.CloseBrace]));
        expect(TokenType.CloseBrace);
        return end();

    }

    function namespaceName() {

        let p = start<NamespaceName>({
            phraseType: PhraseType.NamespaceName,
            parts: [],
            children: []
        });
        let part = expect(TokenType.Name);
        if (part) {
            p.parts.push(part);
        }

        while (true) {

            if (peek().tokenType === TokenType.Backslash &&
                peek(1).tokenType === TokenType.Name) {
                next();
                p.parts.push(next());
            } else {
                break;
            }

        }

        return end<NamespaceName>();

    }

    function isReservedToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.Include:
            case TokenType.IncludeOnce:
            case TokenType.Eval:
            case TokenType.Require:
            case TokenType.RequireOnce:
            case TokenType.Or:
            case TokenType.Xor:
            case TokenType.And:
            case TokenType.InstanceOf:
            case TokenType.New:
            case TokenType.Clone:
            case TokenType.Exit:
            case TokenType.If:
            case TokenType.ElseIf:
            case TokenType.Else:
            case TokenType.EndIf:
            case TokenType.Echo:
            case TokenType.Do:
            case TokenType.While:
            case TokenType.EndWhile:
            case TokenType.For:
            case TokenType.EndFor:
            case TokenType.ForEach:
            case TokenType.EndForeach:
            case TokenType.Declare:
            case TokenType.EndDeclare:
            case TokenType.As:
            case TokenType.Try:
            case TokenType.Catch:
            case TokenType.Finally:
            case TokenType.Throw:
            case TokenType.Use:
            case TokenType.InsteadOf:
            case TokenType.Global:
            case TokenType.Var:
            case TokenType.Unset:
            case TokenType.Isset:
            case TokenType.Empty:
            case TokenType.Continue:
            case TokenType.Goto:
            case TokenType.Function:
            case TokenType.Const:
            case TokenType.Return:
            case TokenType.Print:
            case TokenType.Yield:
            case TokenType.List:
            case TokenType.Switch:
            case TokenType.EndSwitch:
            case TokenType.Case:
            case TokenType.Default:
            case TokenType.Break:
            case TokenType.Array:
            case TokenType.Callable:
            case TokenType.Extends:
            case TokenType.Implements:
            case TokenType.Namespace:
            case TokenType.Trait:
            case TokenType.Interface:
            case TokenType.Class:
            case TokenType.ClassConstant:
            case TokenType.TraitConstant:
            case TokenType.FunctionConstant:
            case TokenType.MethodConstant:
            case TokenType.LineConstant:
            case TokenType.FileConstant:
            case TokenType.DirectoryConstant:
            case TokenType.NamespaceConstant:
                return true;
            default:
                return false;
        }
    }

    function isSemiReservedToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.Static:
            case TokenType.Abstract:
            case TokenType.Final:
            case TokenType.Private:
            case TokenType.Protected:
            case TokenType.Public:
                return true;
            default:
                return isReservedToken(t);
        }
    }

    function isStatementStart(t: Token) {

        switch (t.tokenType) {
            case TokenType.Namespace:
            case TokenType.Use:
            case TokenType.HaltCompiler:
            case TokenType.Const:
            case TokenType.Function:
            case TokenType.Class:
            case TokenType.Abstract:
            case TokenType.Final:
            case TokenType.Trait:
            case TokenType.Interface:
            case TokenType.OpenBrace:
            case TokenType.If:
            case TokenType.While:
            case TokenType.Do:
            case TokenType.For:
            case TokenType.Switch:
            case TokenType.Break:
            case TokenType.Continue:
            case TokenType.Return:
            case TokenType.Global:
            case TokenType.Static:
            case TokenType.Echo:
            case TokenType.Unset:
            case TokenType.ForEach:
            case TokenType.Declare:
            case TokenType.Try:
            case TokenType.Throw:
            case TokenType.Goto:
            case TokenType.Name:
            case TokenType.Semicolon:
            case TokenType.CloseTag:
            case TokenType.Text:
            case TokenType.OpenTag:
            case TokenType.OpenTagEcho:
                return true;
            default:
                return isExpressionStart(t);
        }
    }

}
