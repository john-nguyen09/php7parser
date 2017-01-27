/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType } from './lexer';

export const enum PhraseType {
    Unknown,
    Script,
    StatementList,
    ConstDeclaration,
    ConstElements,
    ConstElement,
    NamespaceUseDeclaration,
    NamespaceUseGroupClauses,
    NamespaceUseGroupClause,
    NamespaceUseClauses,
    NamespaceUseClause,
    NamespaceAliasingClause,
    QualifiedName,
    RelativeQualifiedName,
    FullyQualifiedName,
    FunctionDeclaration,
    FunctionDeclarationHeader,
    ParameterDeclarationList,
    ParameterDeclaration,
    ClassDeclaration,
    ClassDeclarationHeader,
    ClassDeclarationBody,
    ClassMemberDeclarations,
    TraitDeclaration,
    TraitDeclarationHeader,
    TraitDeclarationBody,
    TraitMemberDeclarations,
    InterfaceDeclaration,
    InterfaceDeclarationHeader,
    InterfaceDeclarationBody,
    InterfaceMemberDeclarations,
    EchoIntrinsic,
    ExpressionList,
    GlobalDeclaration,
    VariableNameList,
    FunctionStaticDeclaration,
    StaticVariableNameList,
    StaticVariableDeclaration,
    FunctionStaticInitialiser,
    DeclareStatement,
    DeclareDirective,
    ExpressionStatement,

    ForInitialiser,
    ForControl,
    ForEndOfLoop,
    ForExpressionGroup,

    ForeachCollectionName,
    ForeachKey,
    ForeachValue,

    IfStatement,
    ElseIfClauses,
    ElseIfClause,
    ElseClause,

    DefaultStatement,

    PropertyDeclaration,
    PropertyElementList,
    PropertyElement,
    PropertyInitialiser,

    InlineText,
    NullStatement,

    MethodDeclarationHeader,
    ReturnType,
    ClassConstElement,
    ClassConstDeclaration,
    ClassConstElements,

    TraitUseSpecification,

    AnonymousClassDeclarationHeader,

    PostfixIncrementExpression,
    PostfixDecrementExpression,
    PrefixIncrementExpression,
    PrefixDecrementExpression,

    ArrayCreationExpression,
    ArrayKey,
    ArrayValue,

    RelativeScope,
    VariadicUnpacking,

    ConstantAccessExpression,
    AnonymousFunctionHeader,
    AnonymousFunctionUseClause,

    UnaryOpExpression,
    CastExpression,
    ErrorControlExpression,

    ListIntrinsic,
    ClassTypeDesignator,

    MemberName,
    ScopedMemberName,

    IncludeExpression,
    IncludeOnceExpression,
    RequireExpression,
    RequireOnceExpression,

    InstanceofTypeDesignator,
    AssignmentExpression,
    InstanceOfExpression,
    AdditiveExpression,
    MultiplicativeExpression,
    ShiftExpression,
    RelationalExpression,
    EqualityExpression,
    SimpleAssignmentExpression,
    ByRefAssignmentExpression,
    CoalesceExpression,
    CompoundAssignmentExpression,
    LogicalExpression,
    BitwiseExpression,
    ExponentiationExpression,

    Literal,

    Error, NamespaceDefinition, NamespaceName, UseDeclaration,
    UseGroup, UseList, HaltCompilerStatement,
    ArrayElement, Name, FunctionCallExpression, Unpack, ArgumentExpressionList, SubscriptExpression, ClassConstantAccessExpression,
    ScopedPropertyAccessExpression, ScopedCallExpression, MethodCallExpression, PropertyAccessExpression, AnonymousFunctionCreationExpression, EncapsulatedExpression,
    ParameterList, IssetIntrinsic, EmptyIntrinsic, EvalIntrinsic, Include, YieldFrom, YieldExpression, PrintIntrinsic, TryStatement,
    Backticks, EncapsulatedVariableList, AnonymousClassDeclaration, ObjectCreationExpression, Identifier, VariableList,
    QualifiedNameList, Scalar, ClassModifiers,
    TypeDeclaration, CompoundStatement, ReservedNonModifier,
    InnerStatementList, MethodDeclaration, TraitUseClause, TraitAdaptationList,
    MethodReference, TraitPrecendence, TraitAlias, Expressions,
    SimpleVariable, ArrayInitialiserList, AnonymousFunctionUseVariable, ClosureUseList,
    CloneExpression, Heredoc, DoubleQuotes, EmptyStatement, If, WhileStatement, DoStatement, ClassInterfaceClause,
    ForExpressionList, ForStatement, BreakStatement, ContinueStatement, ReturnStatement,
    UnsetIntrinsic, ThrowStatement, GotoStatement, NamedLabelStatement, Foreach, CaseStatements, SwitchStatement, MemberModifierList,
    CaseStatement, Try, CatchClause, CatchNameList, FinallyClause, ConditionalExpression, BinaryExpression,
    UnaryExpression, MagicConstant, CatchClauses, FunctionBody, MethodDeclarationBody, ClassBaseClause, InterfaceBaseClause,
    EncapsulatedVariable, ErrorScopedAccessExpression, ErrorArgument, ErrorVariable, ErrorExpression, ErrorClassMemberDeclaration,
    ErrorPropertyName, ErrorTraitAdaptation, ErrorVariableAtom, ErrorClassTypeDesignatorAtom
}

export interface Phrase {
    phraseType: PhraseType;
    children: (Phrase | Token)[];
    errors?: Token[];
}

export namespace Parser {

    interface Predicate {
        (t: Token): boolean;
    }

    const enum Associativity {
        None,
        Left,
        Right
    }

    const opPrecedenceAndAssociativtyMap:
        { [index: string]: [number, number] } = {
            '**': [48, Associativity.Right],
            '++': [47, Associativity.Right],
            '--': [47, Associativity.Right],
            '~': [47, Associativity.Right],
            '(int)': [47, Associativity.Right],
            '(float)': [47, Associativity.Right],
            '(string)': [47, Associativity.Right],
            '(array)': [47, Associativity.Right],
            '(object)': [47, Associativity.Right],
            '(bool)': [47, Associativity.Right],
            '@': [47, Associativity.Right],
            'instanceof': [46, Associativity.None],
            '!': [45, Associativity.Right],
            '*': [44, Associativity.Left],
            '/': [44, Associativity.Left],
            '%': [44, Associativity.Left],
            '+': [43, Associativity.Left],
            '-': [43, Associativity.Left],
            '.': [43, Associativity.Left],
            '<<': [42, Associativity.Left],
            '>>': [42, Associativity.Left],
            '<': [41, Associativity.None],
            '>': [41, Associativity.None],
            '<=': [41, Associativity.None],
            '>=': [41, Associativity.None],
            '==': [40, Associativity.None],
            '===': [40, Associativity.None],
            '!=': [40, Associativity.None],
            '!==': [40, Associativity.None],
            '<>': [40, Associativity.None],
            '<=>': [40, Associativity.None],
            '&': [39, Associativity.Left],
            '^': [38, Associativity.Left],
            '|': [37, Associativity.Left],
            '&&': [36, Associativity.Left],
            '||': [35, Associativity.Left],
            '??': [34, Associativity.Right],
            '?': [33, Associativity.Left], //?: ternary
            ':': [33, Associativity.Left], //?: ternary
            '=': [32, Associativity.Right],
            '.=': [32, Associativity.Right],
            '+=': [32, Associativity.Right],
            '-=': [32, Associativity.Right],
            '*=': [32, Associativity.Right],
            '/=': [32, Associativity.Right],
            '%=': [32, Associativity.Right],
            '**=': [32, Associativity.Right],
            '&=': [32, Associativity.Right],
            '|=': [32, Associativity.Right],
            '^=': [32, Associativity.Right],
            '<<=': [32, Associativity.Right],
            '>>=': [32, Associativity.Right],
            'and': [31, Associativity.Left],
            'xor': [30, Associativity.Left],
            'or': [29, Associativity.Left],
        };

    function precedenceAssociativityTuple(t: Token) {
        return opPrecedenceAndAssociativtyMap[t.text];
    }

    function binaryOpToPhraseType(t: Token) {
        switch (t.tokenType) {
            case TokenType.Question:
                return PhraseType.ConditionalExpression;
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
    var isRecovering = false;

    export function parseScript(text: string): Phrase {

        Lexer.setInput(text);
        phraseStack = [];
        tokenBuffer = [];

        let p = start(PhraseType.Script);
        optional(TokenType.Text);

        if(optionalOneOf([TokenType.OpenTag, TokenType.OpenTagEcho])){
            p.children.push(statementList([TokenType.EndOfFile]));
        }

        return end();

    }

    function start(phraseType?: PhraseType) {
        //parent node gets hidden tokens between children
        hidden();

        let phrase: Phrase = {
            phraseType: phraseType,
            children: []
        };

        phraseStack.push(phrase);
        return phrase;
    }

    function end() {
        return phraseStack.pop()
    }

    function hidden() {

        let node = phraseStackTop();

        while (pos < tokens.length - 1 && isHidden(tokens[pos + 1])) {
            ++pos;
            node.children.push(nodeFactory(tokens[pos]));
        }
    }

    function optional(tokenType: TokenType) {

        if (tokenType !== peek().tokenType) {
            return null;
        } else {
            isRecovering = false;
        }

        return next();

    }

    function optionalOneOf(tokenTypes: TokenType[]) {

        if (tokenTypes.indexOf(peek().tokenType) >= 0) {
            return next();
        } else {
            return null;
        }

    }

    function next(doNotPush?:boolean): Token {

        let t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();

        if (t.tokenType === TokenType.EndOfFile) {
            return t;
        }

        if (isHidden(t)) {
            phraseStackTop().children.push(t);
            return this.next();
        } else if(!doNotPush){
            phraseStackTop().children.push(t);
        }

        return t;

    }

    function expect(tokenType: TokenType, phraseRecoverSet?: TokenType[]) {

        if (peek().tokenType === tokenType) {
            isRecovering = false;
            return next();
        }
        else {
            error(tokenType, phraseRecoverSet, [tokenType]);
            return null;
        }

    }

    function expectOneOf(tokenTypes: TokenType[], phraseRecoverSet?: TokenType[]) {

        if (tokenTypes.indexOf(peek().tokenType) >= 0) {
            isRecovering = false;
            return next();
        } else {
            error(undefined, phraseRecoverSet, tokenTypes);
            return null;
        }

    }

    function peek(n?: number) {

        let k = n ? n + 1 : 1;
        let bufferPos = -1;
        let t: Token;

        while (k) {

            ++bufferPos;
            if (bufferPos === tokenBuffer.length) {
                tokenBuffer.push(Lexer.lex());
            }

            t = tokenBuffer[bufferPos];

            if (t.tokenType === TokenType.EndOfFile ||
                (!isHidden(t) && --k === 0)) {
                break;
            }

        }

        return t;
    }

    function skip(until: (TokenType | string)[]) {

        let t: Token;
        let skipped: Token[] = [];

        while (true) {
            t = peek();
            if (until.indexOf(t.tokenType) >= 0 || t.tokenType === TokenType.EndOfFile) {
                break;
            } else {
                ++pos;
                skipped.push(t);
            }
        }

        return skipped;
    }

    function discard() {

        let discarded: Token[] = [];
        let t: Token;

        while (true) {

            if (pos < tokens.length - 1) {
                t = tokens[++pos];
                discarded.push(t);
                if (!isHidden(t)) {
                    break;
                }
            } else {
                break;
            }
        }

        return discarded;
    }

    function isHidden(t: Token) {
        switch (t.tokenType) {
            case TokenType.DocumentComment:
            case TokenType.Whitespace:
            case TokenType.Comment:
                return true;
            default:
                return false;
        }
    }

    function error(expected?: (TokenType | string), phraseRecoverSet?: (TokenType | string)[], skipIfRecovered?: (TokenType | string)[]) {

        //dont report errors if recovering
        if (isRecovering) {
            return peek();
        }

        let tempNode = phraseStackTop<TempNode>(phraseStack);
        let unexpected = peek();
        let n = recoverSetStack.length;
        let syncTokens = phraseRecoverSet ? phraseRecoverSet.slice(0) : [];

        while (n--) {
            Array.prototype.push.apply(syncTokens, recoverSetStack[n]);
        }

        let skipped = skip(syncTokens);
        if (skipIfRecovered && skipIfRecovered.indexOf(peek().tokenType) >= 0) {
            Array.prototype.push.apply(skipped, discard());
        }

        if (!tempNode.phrase.errors) {
            tempNode.phrase.errors = [];
        }

        let err: ParseError = { unexpected: unexpected };

        if (expected) {
            err.expected = expected;
        }

        if (skipped.length) {
            err.skipped = skipped;
        }

        tempNode.phrase.errors.push(err);
        isRecovering = true;
        return peek();
    }

    function phraseStackTop() {
        return phraseStack.length ? phraseStack[phraseStack.length - 1] : null;
    }

    function script() {

        let p = start(PhraseType.Script);
        optional(TokenType.Text);
        expectOneOf([TokenType.OpenTag, TokenType.OpenTagEcho]);
        if (isStatementStart(peek())) {
            p.children.push(statementList([TokenType.EndOfFile]));
        }
        hidden(); //whitespace at end of file
        return p;
    }

    function list(phraseType: PhraseType, elementFunction: () => Phrase,
        elementStartPredicate: Predicate, breakOn?: TokenType[]) {

        let p = start(phraseType);
        let t: Token;

        while (true) {

            t = peek();
            if (elementStartPredicate(t)) {
                p.children.push(elementFunction());
            } else if (!breakOn || breakOn.indexOf(t.tokenType) >= 0) {
                break;
            } else {
                error();
            }

        }

        return p;

    }

    function statementList(breakOn: TokenType[]) {

        return list(
            PhraseType.StatementList,
            statement,
            isStatementStart,
            breakOn);

    }

    function constDeclaration() {

        let p = start(PhraseType.ConstDeclaration);
        next(); //const
        p.children.push(delimitedList(
            PhraseType.ConstElements,
            constElement,
            isConstElementStartToken,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return p;

    }

    function isClassConstElementStartToken(t: Token) {
        return t.tokenType === TokenType.Name || isSemiReservedToken(t);
    }

    function isConstElementStartToken(t: Token) {
        return t.tokenType === TokenType.Name;
    }

    function constElements() {

        let t: Token;
        let p = start(PhraseType.ConstElements);

        while (true) {

            p.children.push(constElement());
            t = peek();
            if (t.tokenType === TokenType.Comma) {
                next();
            } else if (t.tokenType === TokenType.Semicolon) {
                break;
            } else {
                error();
                break;
            }
        }

        return p;

    }

    function constElement() {

        let p = start(PhraseType.ConstElement);
        expect(TokenType.Name);
        expect(TokenType.Equals);
        p.children.push(expression(0));
        return p;

    }

    function expression(minPrecedence: number) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let lhs = expressionAtom();
        let p: Phrase;
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

            p = start(binaryPhraseType);
            p.children.push(lhs);

            if (associativity === Associativity.Left) {
                ++precedence;
            }

            next(); //operator

            if (binaryPhraseType === PhraseType.ConditionalExpression) {
                conditionalExpression(p, precedence);
            } else if (binaryPhraseType === PhraseType.SimpleAssignmentExpression &&
                peek().tokenType === TokenType.Ampersand) {
                next(); //&
                p.phraseType = PhraseType.ByRefAssignmentExpression;
                p.children.push(expression(precedence));
            } else if (binaryPhraseType === PhraseType.InstanceOfExpression) {
                p.children.push(typeDesignator(PhraseType.InstanceofTypeDesignator));
            } else {
                p.children.push(expression(precedence));
            }

            lhs = end();

        }

        return lhs;

    }

    function conditionalExpression(p: Phrase, precedence: number) {

        if (optional(TokenType.Colon)) {
            p.children.push(expression(precedence));
        } else {
            p.children.push(expression(precedence));
            expect(TokenType.Colon);
            p.children.push(expression(precedence));
        }

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
                    part = constantAccessExpression(<Phrase>part);
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

    function constantAccessExpression(qName: Phrase) {
        let p = start(PhraseType.ConstantAccessExpression);
        p.children.push(qName);
        return end();
    }

    function postfixExpression(phraseType: PhraseType, variableNode: Phrase) {
        let p = start(phraseType);
        p.children.push(variableNode);
        next(); //operator
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
                return next(true);
            case TokenType.LineConstant:
            case TokenType.FileConstant:
            case TokenType.DirectoryConstant:
            case TokenType.TraitConstant:
            case TokenType.MethodConstant:
            case TokenType.FunctionConstant:
            case TokenType.NamespaceConstant:
            case TokenType.ClassConstant:
                return magicConstant();
            case TokenType.StartHeredoc:
                return heredocStringLiteral();
            case TokenType.DoubleQuote:
                return quotedEncapsulatedVariableList(PhraseType.DoubleQuotes, TokenType.DoubleQuote);
            case TokenType.Backtick:
                return quotedEncapsulatedVariableList(PhraseType.Backticks, TokenType.Backtick);
            case TokenType.Print:
                return keywordExpression(PhraseType.PrintIntrinsic);
            case TokenType.Yield:
                return yieldExpression();
            case TokenType.YieldFrom:
                return keywordExpression(PhraseType.YieldExpression);
            case TokenType.Function:
                return anonymousFunctionCreationExpression();
            case TokenType.Include:
                return keywordExpression(PhraseType.IncludeExpression);
            case TokenType.IncludeOnce:
                return keywordExpression(PhraseType.IncludeOnceExpression);
            case TokenType.Require:
                return keywordExpression(PhraseType.RequireExpression);
            case TokenType.RequireOnce:
                return keywordExpression(PhraseType.RequireOnceExpression);
            case TokenType.Eval:
                return keywordEncapsulatedExpression(PhraseType.EvalIntrinsic);
            case TokenType.Empty:
                return keywordEncapsulatedExpression(PhraseType.EmptyIntrinsic);
            case TokenType.Isset:
                return issetIntrinsic();
            default:
                //error
                start(PhraseType.ErrorExpression);
                error();
                return end();
        }

    }

    function magicConstant() {
        let magic = start(PhraseType.MagicConstant);
        next();
        return end();
    }

    function issetIntrinsic() {

        let p = start(PhraseType.IssetIntrinsic);
        next(); //isset
        expect(TokenType.OpenParenthesis);
        p.children.push(variableList([TokenType.CloseParenthesis]));
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function keywordEncapsulatedExpression(type: PhraseType) {

        let p = start(type);
        next(); //keyword
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function keywordExpression(phraseType: PhraseType) {

        let p = start(phraseType);
        next(); //keyword
        p.children.push(expression(0));
        return end();
    }

    function yieldExpression() {

        let p = start(PhraseType.YieldExpression);
        next(); //yield

        if (!isExpressionStart(peek())) {
            return end();
        }

        p.children.push(expression(0));

        if (optional(TokenType.FatArrow)) {
            p.children.push(expression(0));
        }

        return end();

    }

    function quotedEncapsulatedVariableList(phraseType: PhraseType, closeTokenType: TokenType) {

        let p = start(phraseType);
        next(); //open encaps
        p.children.push(encapsulatedVariableList(closeTokenType));
        expect(closeTokenType);
        return end();

    }

    function encapsulatedVariableList(breakOn: TokenType) {

        return list(
            PhraseType.EncapsulatedVariableList,
            encapsulatedVariable,
            isEncapsulatedVariableStart,
            [breakOn]
        );

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

        let p = start(PhraseType.EncapsulatedVariable);
        next(); //{
        p.children.push(variable(variableAtom()));
        expect(TokenType.CloseBrace);
        return end();

    }

    function dollarCurlyOpenEncapsulatedVariable() {

        let p = start(PhraseType.EncapsulatedVariable);
        next(); //${
        let t = peek();

        if (t.tokenType === TokenType.VariableName) {

            if (peek(1).tokenType === TokenType.OpenBracket) {
                p.children.push(dollarCurlyEncapsulatedDimension());
            } else {
                start(PhraseType.SimpleVariable);
                next();
                p.children.push(end());
            }

        } else if (isExpressionStart(t)) {
            p.children.push(expression(0));
        } else {
            error();
        }

        expect(TokenType.CloseBrace);
        return end();
    }

    function dollarCurlyEncapsulatedDimension() {
        let p = start(PhraseType.SubscriptExpression);
        next(); //VariableName
        next(); // [
        p.children.push(expression(0));
        expect(TokenType.CloseBracket);
        return end();
    }

    function encapsulatedDimension() {

        let p = start(PhraseType.SubscriptExpression);

        p.children.push(simpleVariable()); //T_VARIABLE
        next(); //[

        switch (peek().tokenType) {
            case TokenType.Name:
            case TokenType.IntegerLiteral:
                next();
                break;
            case TokenType.VariableName:
                p.children.push(simpleVariable());
                break;
            case TokenType.Minus:
                start(PhraseType.UnaryOpExpression);
                next(); //-
                expect(TokenType.IntegerLiteral);
                p.children.push(end());
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
        let p = start(PhraseType.PropertyAccessExpression);
        p.children.push(simpleVariable());
        next(); //->
        expect(TokenType.Name);
        return end();
    }

    function heredocStringLiteral() {

        let p = start(PhraseType.Heredoc);
        next(); //StartHeredoc
        p.children.push(encapsulatedVariableList(TokenType.EndHeredoc));
        expect(TokenType.EndHeredoc);
        return end();

    }

    function anonymousClassDeclaration() {

        let p = start(PhraseType.AnonymousClassDeclaration);
        p.children.push(anonymousClassDeclarationHeader(),
            classTraitInterfaceDeclarationBody(
                PhraseType.ClassDeclarationBody, isClassMemberStart, classMemberDeclarations
            ));
        return end();

    }

    function anonymousClassDeclarationHeader() {

        let p = start(PhraseType.AnonymousClassDeclarationHeader);
        next(); //class

        if (peek().tokenType === TokenType.OpenParenthesis) {
            p.children.push(argumentList());
        }

        if (peek().tokenType === TokenType.Extends) {
            p.children.push(classBaseClause());
        }

        if (peek().tokenType === TokenType.Implements) {
            p.children.push(classInterfaceClause());
        }

        return end();

    }

    function classInterfaceClause() {

        let p = start(PhraseType.ClassInterfaceClause);
        next(); //implements
        p.children.push(qualifiedNameList([TokenType.OpenBrace]));
        return p;

    }

    function classMemberDeclarations() {

        return list(
            PhraseType.ClassMemberDeclarations,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenType.CloseBrace]
        );

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

        let p = start(PhraseType.ErrorClassMemberDeclaration);
        let t = peek();

        switch (t.tokenType) {
            case TokenType.Public:
            case TokenType.Protected:
            case TokenType.Private:
            case TokenType.Static:
            case TokenType.Abstract:
            case TokenType.Final:
                t = peek();
                if (t.tokenType === TokenType.VariableName) {
                    p.children.push(memberModifierList());
                    return propertyDeclaration(p);
                } else if (t.tokenType === TokenType.Function) {
                    return methodDeclaration(p, memberModifierList());
                } else if (t.tokenType === TokenType.Const) {
                    p.children.push(memberModifierList());
                    return classConstDeclaration(p);
                } else {
                    //error
                    error();
                    return end();
                }
            case TokenType.Function:
                return methodDeclaration(p, null);
            case TokenType.Var:
                next();
                return propertyDeclaration(p);
            case TokenType.Const:
                return classConstDeclaration(p);
            case TokenType.Use:
                return traitUseClause();
            default:
                //should not get here
                throwUnexpectedTokenError(t);
        }

    }

    function throwUnexpectedTokenError(t: Token) {
        throw new Error(`Unexpected token: ${t.text}`);
    }

    function traitUseClause() {

        let p = start(PhraseType.TraitUseClause);
        next(); //use
        p.children.push(qualifiedNameList([TokenType.Semicolon, TokenType.OpenBrace]));
        p.children.push(traitAdaptationList());
        return end();

    }

    function traitUseSpecification() {

        let p = start(PhraseType.TraitUseSpecification);
        let t = expectOneOf([TokenType.Semicolon, TokenType.OpenBrace]);

        if (t.tokenType === TokenType.CloseBrace) {
            if (isTraitAdaptationStart(peek())) {
                p.children.push(traitAdaptationList());
            }
            expect(TokenType.CloseBrace);
        }

        return end();

    }

    function traitAdaptationList() {

        return list(
            PhraseType.TraitAdaptationList,
            traitAdaptation,
            isTraitAdaptationStart,
            [TokenType.CloseBrace]
        );

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

        let p = start(PhraseType.ErrorTraitAdaptation);
        let t = peek();
        let t2 = peek(1);

        if (t.tokenType === TokenType.Namespace ||
            t.tokenType === TokenType.Backslash ||
            (t.tokenType === TokenType.Name &&
                (t2.tokenType === TokenType.ColonColon || t2.tokenType === TokenType.Backslash))) {

            p.children.push(methodReference());

            if (peek().tokenType === TokenType.InsteadOf) {
                next();
                return traitPrecedence(p);
            }

        } else if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {

            let methodRef = start(PhraseType.MethodReference);
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

        p.phraseType = PhraseType.TraitAlias;
        expect(TokenType.As);

        let t = peek();

        if (t.tokenType === TokenType.Name || isReservedToken(t)) {
            p.children.push(identifier());
        } else if (isMemberModifier(t)) {
            next();
            t = peek();
            if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
                p.children.push(identifier());
            }
        } else {
            error();
        }

        expect(TokenType.Semicolon);
        return end();

    }

    function traitPrecedence(p: Phrase) {

        p.phraseType = PhraseType.TraitPrecendence;
        p.children.push(qualifiedNameList([TokenType.Semicolon]));
        expect(TokenType.Semicolon);
        return end();

    }

    function methodReference() {

        let p = start(PhraseType.MethodReference);
        p.children.push(qualifiedName());
        expect(TokenType.ColonColon);
        p.children.push(identifier());
        return end();

    }

    function methodDeclarationHeader(memberModifers: Phrase) {

        let p = start(PhraseType.MethodDeclarationHeader);
        if (memberModifers) {
            p.children.push(memberModifers);
        }
        next(); //function
        optional(TokenType.Ampersand);
        p.children.push(identifier());
        expect(TokenType.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(delimitedList(
                PhraseType.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenType.Comma,
                [TokenType.CloseParenthesis]
            ));
        }

        expect(TokenType.CloseParenthesis);

        if (peek().tokenType === TokenType.Colon) {
            p.children.push(returnType());
        }

        return p;

    }

    function methodDeclaration(p: Phrase, memberModifers: Phrase) {

        p.phraseType = PhraseType.MethodDeclaration;
        p.children.push(methodDeclarationHeader(memberModifers));
        p.children.push(methodDeclarationBody());
        return end();

    }

    function methodDeclarationBody() {
        let n = start(PhraseType.MethodDeclarationBody);

        if (peek().tokenType === TokenType.Semicolon) {
            next();
        } else {
            n.children.push(compoundStatement());
        }
        return end();
    }

    function identifier() {
        let p = start(PhraseType.Identifier);
        let t = peek();
        if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
            next();
        } else {
            error();
        }
        return end();
    }

    function interfaceDeclaration() {

        let p = start(PhraseType.InterfaceDeclaration);
        p.children.push(interfaceDeclarationHeader(), classTraitInterfaceDeclarationBody(
            PhraseType.InterfaceDeclarationBody, isClassMemberStart, interfaceMemberDeclarations
        ));
        return end();

    }

    function classTraitInterfaceDeclarationBody(phraseType: PhraseType, isElementStartPredicate: Predicate, listFunction: () => Phrase) {

        let p = start(phraseType);
        expect(TokenType.OpenBrace);

        if (isElementStartPredicate(peek())) {
            p.children.push(listFunction());
        }

        expect(TokenType.CloseBrace);
        return end();

    }

    function interfaceMemberDeclarations() {

        return list(
            PhraseType.InterfaceMemberDeclarations,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenType.CloseBrace]
        );


    }

    function interfaceDeclarationHeader() {

        let p = start(PhraseType.InterfaceDeclarationHeader);
        next(); //interface
        expect(TokenType.Name);

        if (peek().tokenType === TokenType.Extends) {
            p.children.push(interfaceBaseClause());
        }

        return end();

    }

    function interfaceBaseClause() {

        let n = start(PhraseType.InterfaceBaseClause);
        next(); //extends
        n.children.push(qualifiedNameList([TokenType.OpenBrace]));
        return end();

    }

    function traitDeclaration() {

        let p = start(PhraseType.TraitDeclaration);
        p.children.push(traitDeclarationHeader(), classTraitInterfaceDeclarationBody(
            PhraseType.TraitDeclarationBody, isClassMemberStart, traitMemberDeclarations
        ));
        return end();

    }

    function traitDeclarationHeader() {
        start(PhraseType.TraitDeclarationHeader);
        next(); //trait
        expect(TokenType.Name);
        return end();

    }

    function traitMemberDeclarations() {

        return list(
            PhraseType.TraitMemberDeclarations,
            classMemberDeclaration,
            isClassMemberStart,
            [TokenType.CloseBrace]
        );

    }

    function functionDeclaration() {

        let p = start(PhraseType.FunctionDeclaration);
        p.children.push(functionDeclarationHeader(), compoundStatement());
        return p;

    }

    function functionDeclarationHeader() {

        let p = start(PhraseType.FunctionDeclarationHeader);

        next(); //function
        optional(TokenType.Ampersand);
        expect(TokenType.Name);
        expect(TokenType.OpenParenthesis);

        if (isParameterStart(peek())) {
            p.children.push(delimitedList(
                PhraseType.ParameterDeclarationList,
                parameterDeclaration,
                isParameterStart,
                TokenType.Comma,
                [TokenType.CloseParenthesis]
            ));
        }

        expect(TokenType.CloseParenthesis);

        if (peek().tokenType === TokenType.Colon) {
            p.children.push(returnType());
        }

        return p;

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

        let p = start(PhraseType.ClassDeclaration);
        p.children.push(classDeclarationHeader(), classTraitInterfaceDeclarationBody(
            PhraseType.ClassDeclarationBody, isClassMemberStart, classMemberDeclarations
        ));
        return p;

    }

    function classDeclarationHeader() {

        let p = start(PhraseType.ClassDeclarationHeader);
        optionalOneOf([TokenType.Abstract, TokenType.Final]);
        expect(TokenType.Class);
        expect(TokenType.Name);

        if (peek().tokenType === TokenType.Extends) {
            p.children.push(classBaseClause());
        }

        if (peek().tokenType === TokenType.Implements) {
            p.children.push(classInterfaceClause());
        }

        return p;

    }

    function classBaseClause() {
        let p = start(PhraseType.ClassBaseClause);
        next(); //extends
        p.children.push(qualifiedName());
        return p;
    }

    function classModifiers() {

        let n = start(PhraseType.ClassModifiers);
        let t: Token;

        while (true) {
            t = peek();
            if (t.tokenType === TokenType.Abstract || t.tokenType === TokenType.Final) {
                next();
            } else {
                break;
            }

        }

        return end();

    }

    function compoundStatement() {

        let p = start(PhraseType.CompoundStatement);
        expect(TokenType.OpenBrace);

        if (isStatementStart(peek())) {
            p.children.push(statementList([TokenType.CloseBrace]));
        }

        expect(TokenType.CloseBrace);
        return p;

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
                return breakOrContinueStatement(PhraseType.BreakStatement);
            case TokenType.Continue:
                return breakOrContinueStatement(PhraseType.ContinueStatement);
            case TokenType.Return:
                return returnStatement();
            case TokenType.Global:
                return globalDeclaration();
            case TokenType.Static:
                return functionStaticDeclaration();
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

    function nullStatement() {
        start(PhraseType.NullStatement);
        next(); //;
        return end();
    }

    function inlineText() {
        let p = start(PhraseType.InlineText);
        expect(TokenType.CloseTag);
        optional(TokenType.Text);
        optionalOneOf([TokenType.OpenTag, TokenType.OpenTagEcho]);
        return end();
    }

    function isCatchClauseStart(t: Token) {
        return t.tokenType === TokenType.Catch;
    }

    function tryStatement() {

        let p = start(PhraseType.TryStatement);
        next(); //try
        p.children.push(compoundStatement());

        let t = peek();

        if (t.tokenType === TokenType.Catch) {
            p.children.push(list(
                PhraseType.CatchClauses,
                catchClause,
                isCatchClauseStart
            ));
        } else if (t.tokenType !== TokenType.Finally) {
            error();
        }

        if (peek().tokenType === TokenType.Finally) {
            p.children.push(finallyClause());
        }

        return end();

    }

    function finallyClause() {

        let p = start(PhraseType.FinallyClause);
        next(); //finally
        p.children.push(compoundStatement());
        return end();

    }

    function catchClause() {

        let p = start(PhraseType.CatchClause);
        next(); //catch
        expect(TokenType.OpenParenthesis);
        p.children.push(list(
            PhraseType.CatchNameList,
            qualifiedName,
            isQualifiedNameStart,
            [TokenType.VariableName]
        ));
        expect(TokenType.VariableName);
        expect(TokenType.OpenParenthesis);
        p.children.push(compoundStatement());
        return end();

    }

    function declareDirective() {

        let p = start(PhraseType.DeclareDirective);
        expect(TokenType.Name);
        expect(TokenType.Equals);
        expectOneOf([TokenType.IntegerLiteral, TokenType.FloatingLiteral, TokenType.StringLiteral]);
        return end();

    }

    function declareStatement() {

        let p = start(PhraseType.DeclareStatement);
        next(); //declare
        expect(TokenType.OpenParenthesis);
        p.children.push(declareDirective());
        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {

            next();
            p.children.push(statementList([TokenType.EndDeclare]));
            expect(TokenType.EndDeclare);
            expect(TokenType.Semicolon);

        } else if (isStatementStart(t)) {

            p.children.push(statement());

        } else if (t.tokenType === TokenType.Semicolon) {

            next();

        } else {

            error();

        }

        return end();

    }

    function switchStatement() {

        let p = start(PhraseType.SwitchStatement);
        next(); //switch
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);

        let t = expectOneOf([TokenType.Colon, TokenType.OpenBrace]);

        if ([TokenType.Case, TokenType.Default].indexOf(peek().tokenType) >= 0) {
            p.children.push(caseStatements(t.tokenType === TokenType.Colon ?
                TokenType.EndSwitch : TokenType.CloseBrace));
        }

        if (t.tokenType === TokenType.Colon) {
            expect(TokenType.EndSwitch);
            expect(TokenType.Semicolon);
        } else {
            expect(TokenType.CloseBrace);
        }

        return end();

    }

    function caseStatements(breakOn: TokenType) {

        let p = start(PhraseType.CaseStatements);
        let t: Token;
        let caseBreakOn = [TokenType.Case, TokenType.Default];
        caseBreakOn.push(breakOn);

        while (true) {

            t = peek();

            if (t.tokenType === TokenType.Case) {
                p.children.push(caseStatement(caseBreakOn));
            } else if (t.tokenType === TokenType.Default) {
                p.children.push(defaultStatement(caseBreakOn));
            } else if (breakOn === t.tokenType) {
                break;
            } else {
                error();
                break;
            }

        }

        return end();

    }

    function caseStatement(breakOn: TokenType[]) {

        let p = start(PhraseType.CaseStatement);
        next(); //case
        p.children.push(expression(0));
        expectOneOf([TokenType.Colon, TokenType.Semicolon]);
        if (isStatementStart(peek())) {
            p.children.push(statementList(breakOn));
        }
        return end();

    }

    function defaultStatement(breakOn: TokenType[]) {
        let p = start(PhraseType.DefaultStatement);
        next(); //default
        expectOneOf([TokenType.Colon, TokenType.Semicolon]);
        if (isStatementStart(peek())) {
            p.children.push(statementList(breakOn));
        }
        return end();
    }

    function namedLabelStatement() {

        let p = start(PhraseType.NamedLabelStatement);
        next(); //name
        next(); //:
        p.children.push(statement());
        return end();
    }

    function gotoStatement() {

        let n = start(PhraseType.GotoStatement);
        next(); //goto
        expect(TokenType.Name);
        expect(TokenType.Semicolon);
        return end();

    }

    function throwStatement() {

        let p = start(PhraseType.ThrowStatement);
        next(); //throw
        p.children.push(expression(0));
        expect(TokenType.Semicolon);
        return end();
    }

    function foreachCollectionName() {
        let p = start(PhraseType.ForeachCollectionName);
        p.children.push(expression(0));
        return end();
    }

    function foreachKeyOrValue() {
        let p = start(PhraseType.ForeachValue);
        p.children.push(expression(0));
        if (peek().tokenType === TokenType.FatArrow) {
            next();
            p.phraseType = PhraseType.ForeachKey;
        }
        return p;
    }

    function foreachValue() {
        let p = start(PhraseType.ForeachValue);
        optional(TokenType.Ampersand);
        p.children.push(expression(0));
        return p;
    }

    function foreachStatement() {

        let p = start(PhraseType.Foreach);
        next(); //foreach
        expect(TokenType.OpenParenthesis);
        p.children.push(foreachCollectionName());
        let keyOrValue = peek().tokenType === TokenType.Ampersand ? foreachValue() : foreachKeyOrValue();
        p.children.push(keyOrValue);

        if (keyOrValue.phraseType === PhraseType.ForeachKey) {
            p.children.push(foreachValue());
        }

        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(statementList([TokenType.EndForeach]));
            expect(TokenType.EndForeach);
            expect(TokenType.Semicolon);
        } else if (isStatementStart(t)) {
            p.children.push(statement());
        } else {
            error();
        }

        return end();

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
        );
    }

    function unsetIntrinsic() {

        let p = start(PhraseType.UnsetIntrinsic);
        next(); //unset
        expect(TokenType.OpenParenthesis);
        p.children.push(variableList([TokenType.CloseParenthesis]));
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Semicolon);
        return end();

    }

    function expressionInitial() {
        return expression(0);
    }

    function echoIntrinsic() {

        let p = start(PhraseType.EchoIntrinsic);
        next(); //echo
        p.children.push(delimitedList(
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

        let p = start(PhraseType.FunctionStaticDeclaration);
        next(); //static
        p.children.push(delimitedList(
            PhraseType.StaticVariableNameList,
            staticVariableDeclaration,
            isStaticVariableDclarationStart,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return end();

    }

    function globalDeclaration() {

        let p = start(PhraseType.GlobalDeclaration);
        next(); //global
        p.children.push(delimitedList(
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

        let p = start(PhraseType.StaticVariableDeclaration);
        expect(TokenType.VariableName);

        if (peek().tokenType === TokenType.Equals) {
            p.children.push(functionStaticInitialiser());
        }

        return end();

    }

    function functionStaticInitialiser() {

        let p = start(PhraseType.FunctionStaticInitialiser);
        next(); //=
        p.children.push(expression(0));
        return end();

    }

    function breakOrContinueStatement(phraseType: PhraseType) {
        let p = start(phraseType);
        next(); //break/continue
        optional(TokenType.IntegerLiteral);
        expect(TokenType.Semicolon);
        return end();
    }

    function returnStatement() {
        let p = start(PhraseType.ReturnStatement);
        next(); //return

        if (isExpressionStart(peek())) {
            p.children.push(expression(0));
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

        let p = start(PhraseType.ForStatement);
        next(); //for
        expect(TokenType.OpenParenthesis);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseType.ForInitialiser, [TokenType.Semicolon]));
        }

        expect(TokenType.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseType.ForControl, [TokenType.Semicolon]));
        }

        expect(TokenType.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseType.ForEndOfLoop, [TokenType.CloseParenthesis]));
        }

        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(statementList([TokenType.EndFor]));
            expect(TokenType.EndFor);
            expect(TokenType.Semicolon);
        } else if (isStatementStart(peek())) {
            p.children.push(statement());
        } else {
            error();
        }

        return end();

    }

    function doStatement() {

        let p = start(PhraseType.DoStatement);
        next(); // do
        p.children.push(statement());
        expect(TokenType.While);
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Semicolon);
        return end();

    }

    function whileStatement() {

        let p = start(PhraseType.WhileStatement);
        next(); //while
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(statementList([TokenType.EndWhile]));
            expect(TokenType.EndWhile);
            expect(TokenType.Semicolon);
        } else if (isStatementStart(t)) {
            p.children.push(statement());
        } else {
            //error
            error();
        }

        return end();

    }

    function elseIfClause1() {

        let p = start(PhraseType.ElseIfClause);
        next(); //elseif
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);
        p.children.push(statement());
        return end();
    }

    function elseIfClause2() {
        let p = start(PhraseType.ElseIfClause);
        next(); //elseif
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Colon);
        p.children.push(statementList([TokenType.EndIf, TokenType.Else]));
        return end();
    }

    function elseClause1() {
        let p = start(PhraseType.ElseClause);
        next(); //else
        p.children.push(statement());
        return end();
    }

    function elseClause2() {
        let p = start(PhraseType.ElseClause);
        next(); //else
        expect(TokenType.Colon);
        p.children.push(statementList([TokenType.EndIf]));
        return end();
    }

    function ifStatement() {

        let p = start(PhraseType.IfStatement);
        next(); //if
        expect(TokenType.OpenParenthesis);
        p.children.push(expression(0));
        expect(TokenType.CloseParenthesis);

        let t = peek();
        let elseIfClauseFunction = elseIfClause1;
        let elseClauseFunction = elseClause1;
        let expectEndIf = false;

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(statementList([TokenType.ElseIf, TokenType.Else, TokenType.EndIf]));
            elseIfClauseFunction = elseIfClause2;
            elseClauseFunction = elseClause2;
            expectEndIf = true;
        } else if (isStatementStart(t)) {
            p.children.push(statement());
        } else {
            error();
        }

        if (peek().tokenType === TokenType.ElseIf) {
            p.children.push(list(
                PhraseType.ElseIfClauses,
                elseIfClauseFunction,
                (t: Token) => { return t.tokenType === TokenType.ElseIf; }
            ));
        }

        if (peek().tokenType === TokenType.Else) {
            p.children.push(elseClauseFunction());
        }

        if (expectEndIf) {
            expect(TokenType.EndIf);
            expect(TokenType.Semicolon);
        }

        return end();

    }

    function expressionStatement() {

        let p = start(PhraseType.ExpressionStatement);
        p.children.push(expression(0));
        expect(TokenType.Semicolon);
        return end();

    }

    function returnType() {
        let p = start(PhraseType.ReturnType);
        next(); //:
        p.children.push(typeDeclaration());
        return end();
    }

    function typeDeclaration() {

        let p = start(PhraseType.TypeDeclaration);
        optional(TokenType.Question);

        switch (peek().tokenType) {
            case TokenType.Callable:
            case TokenType.Array:
                next();
                break;
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Backslash:
                p.children.push(qualifiedName());
                break;
            default:
                error();
                break;
        }

        return p;

    }

    function classConstDeclaration(p: Phrase) {

        p.phraseType = PhraseType.ClassConstDeclaration;
        next(); //const
        p.children.push(delimitedList(
            PhraseType.ClassConstElements,
            classConstElement,
            isClassConstElementStartToken,
            TokenType.Comma,
            [TokenType.Semicolon]
        ));
        expect(TokenType.Semicolon);
        return p;

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
                return true;
            default:
                return false;
        }

    }

    function classConstElement() {

        let p = start(PhraseType.ConstElement);
        p.children.push(identifier());
        expect(TokenType.Equals);
        p.children.push(expression(0));
        return p;

    }

    function isPropertyElementStart(t: Token) {
        return t.tokenType === TokenType.VariableName;
    }

    function propertyDeclaration(p: Phrase) {

        let t: Token;
        p.phraseType = PhraseType.PropertyDeclaration;
        p.children.push(delimitedList(
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

        let p = start(PhraseType.PropertyElement);
        expect(TokenType.VariableName);

        if (peek().tokenType === TokenType.Equals) {
            p.children.push(propertyInitialiser());
        }

        return end();

    }

    function propertyInitialiser() {

        let p = start(PhraseType.PropertyInitialiser);
        next(); //equals
        p.children.push(expression(0));
        return end();

    }

    function memberModifierList() {

        let n = start(PhraseType.MemberModifierList);

        while (isMemberModifier(peek())) {
            next();
        }

        return end();

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
        );
    }

    function objectCreationExpression() {

        let p = start(PhraseType.ObjectCreationExpression);
        next(); //new

        if (peek().tokenType === TokenType.Class) {
            p.children.push(anonymousClassDeclaration());
            return end();
        }

        p.children.push(typeDesignator(PhraseType.ClassTypeDesignator));

        if (optional(TokenType.OpenParenthesis)) {

            if (isArgumentStart(peek())) {
                p.children.push(argumentList());
            }

            expect(TokenType.CloseParenthesis);
        }

        return end();

    }

    function typeDesignator(phraseType: PhraseType) {

        let p = start(phraseType);
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
                    let staticPropNode = start(PhraseType.ScopedPropertyAccessExpression);
                    next(); //::
                    staticPropNode.children.push(part, simpleVariable());
                    part = end();
                    continue;
                default:
                    break;
            }

            break;

        }

        p.children.push(part);
        return part;

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
                if (isRelativeScopeName(t) && peek(1).tokenType !== TokenType.Backslash) {
                    return relativeScope();
                }
            //fall through
            case TokenType.Namespace:
            case TokenType.Backslash:
                return qualifiedName();
            default:
                start(PhraseType.ErrorClassTypeDesignatorAtom);
                error();
                return end();
        }

    }

    function cloneExpression() {

        let p = start(PhraseType.CloneExpression);
        next(); //clone
        p.children.push(expression(0));
        return end();

    }

    function listIntrinsic() {

        let p = start(PhraseType.ListIntrinsic);
        next(); //list
        expect(TokenType.OpenParenthesis);
        p.children.push(arrayInitialiserList(TokenType.CloseParenthesis));
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function unaryExpression(phraseType: PhraseType) {

        let p = start(phraseType);
        let t = next();//op

        switch (phraseType) {
            case PhraseType.PrefixDecrementExpression:
            case PhraseType.PrefixIncrementExpression:
                p.children.push(variable(variableAtom()));
                break;
            default:
                p.children.push(expression(precedenceAssociativityTuple(t)[0]));
                break;
        }

        return end();

    }

    function anonymousFunctionHeader() {
        let p = start(PhraseType.AnonymousFunctionHeader);
        optional(TokenType.Static);
        next(); //function
        optional(TokenType.Ampersand);
        expect(TokenType.OpenParenthesis);

        if (isArgumentStart(peek())) {
            p.children.push(argumentList());
        }

        expect(TokenType.CloseParenthesis);

        if (peek().tokenType === TokenType.Use) {
            p.children.push(anonymousFunctionUseClause());
        }

        if (peek().tokenType === TokenType.Colon) {
            p.children.push(returnType());
        }

        return end();

    }

    function anonymousFunctionCreationExpression() {

        let p = start(PhraseType.AnonymousFunctionCreationExpression);
        p.children.push(anonymousFunctionHeader(), compoundStatement());
        return end();

    }

    function isAnonymousFunctionUseVariableStart(t: Token) {
        return t.tokenType === TokenType.VariableName ||
            t.tokenType === TokenType.Ampersand;
    }

    function anonymousFunctionUseClause() {

        let p = start(PhraseType.AnonymousFunctionUseClause);
        next(); //use
        expect(TokenType.OpenParenthesis);
        p.children.push(delimitedList(
            PhraseType.ClosureUseList,
            anonymousFunctionUseVariable,
            isAnonymousFunctionUseVariableStart,
            TokenType.Comma,
            [TokenType.CloseParenthesis]
        ));
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function anonymousFunctionUseVariable() {

        let p = start(PhraseType.AnonymousFunctionUseVariable);
        optional(TokenType.Ampersand);
        expect(TokenType.VariableName);
        return end();

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

        let p = start(PhraseType.ParameterDeclaration);

        if (isTypeDeclarationStart(peek())) {
            p.children.push(typeDeclaration());
        }

        optional(TokenType.Ampersand);
        optional(TokenType.Ellipsis);
        expect(TokenType.VariableName);

        if (peek().tokenType === TokenType.Equals) {
            next();
            p.children.push(expression(0));
        }

        return p;

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
                        let errNode = start(PhraseType.ErrorVariable);
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
        let p = start(PhraseType.FunctionCallExpression);
        p.children.push(lhs);
        expect(TokenType.OpenParenthesis);
        if (isArgumentStart(peek())) {
            p.children.push(argumentList());
        }
        expect(TokenType.CloseParenthesis);
        return end();
    }

    function scopedAccessExpression(lhs: Phrase | Token) {

        let p = start(PhraseType.ErrorScopedAccessExpression);
        p.children.push(lhs);
        next() //::
        p.children.push(scopedMemberName(p));

        if (optional(TokenType.OpenParenthesis)) {
            p.children.push(argumentList());
            p.phraseType = PhraseType.ScopedCallExpression;
            expect(TokenType.CloseParenthesis);
            return end();
        } else if (p.phraseType === PhraseType.ScopedCallExpression) {
            //error
            error();
            return end();
        }

    }

    function scopedMemberName(parent: Phrase) {

        let p = start(PhraseType.ScopedMemberName);
        let t = peek();

        switch (t.tokenType) {
            case TokenType.OpenBrace:
                parent.phraseType = PhraseType.ScopedCallExpression;
                p.children.push(encapsulatedExpression(TokenType.OpenBrace, TokenType.CloseBrace));
                break;
            case TokenType.VariableName:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                parent.phraseType = PhraseType.ScopedPropertyAccessExpression;
                next();
                break;
            case TokenType.Dollar:
                p.children.push(simpleVariable());
                parent.phraseType = PhraseType.ScopedPropertyAccessExpression;
                break;
            default:
                if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
                    p.children.push(identifier());
                    parent.phraseType = PhraseType.ClassConstantAccessExpression;
                } else {
                    //error
                    error();
                }
                break;
        }

        return end();

    }

    function propertyAccessExpression(lhs: Phrase | Token) {
        let p = start(PhraseType.PropertyAccessExpression);
        p.children.push(lhs);
        next(); //->
        p.children.push(memberName());
        return end();
    }

    function propertyOrMethodAccessExpression(lhs: Phrase | Token) {

        let p = start(PhraseType.PropertyAccessExpression);
        p.children.push(lhs);
        next(); //->
        p.children.push(memberName());

        if (optional(TokenType.OpenParenthesis)) {
            p.children.push(argumentList());
            p.phraseType = PhraseType.MethodCallExpression;
            expect(TokenType.CloseParenthesis);
        }

        return end();

    }

    function memberName() {

        let p = start(PhraseType.MemberName);

        switch (peek().tokenType) {
            case TokenType.Name:
                next();
                break;
            case TokenType.OpenBrace:
                p.children.push(encapsulatedExpression(TokenType.OpenBrace, TokenType.CloseBrace));
                break;
            case TokenType.Dollar:
            case TokenType.VariableName:
                p.children.push(simpleVariable());
                break;
            default:
                error();
                break;
        }

        return end();

    }

    function subscriptExpression(lhs: Phrase | Token, closeTokenType: TokenType) {

        let p = start(PhraseType.SubscriptExpression);
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
            PhraseType.ArgumentExpressionList,
            argumentExpression,
            isArgumentStart,
            TokenType.Comma,
            [TokenType.CloseParenthesis]
        );

    }

    function isArgumentStart(t: Token) {
        return t.tokenType === TokenType.Ellipsis || isExpressionStart(t);
    }

    function variadicUnpacking() {
        let p = start(PhraseType.VariadicUnpacking);
        next(); //...
        p.children.push(expression(0));
        return end();
    }

    function argumentExpression() {
        return peek().tokenType === TokenType.Ellipsis ?
            variadicUnpacking() : expression(0);
    }

    function qualifiedName() {

        let p = start(PhraseType.QualifiedName);
        let t = peek();

        if (t.tokenType === TokenType.Backslash) {
            next();
            p.phraseType = PhraseType.FullyQualifiedName;
        } else if (t.tokenType === TokenType.Namespace) {
            p.phraseType = PhraseType.RelativeQualifiedName;
            next();
            expect(TokenType.Backslash);
        }

        p.children.push(namespaceName());
        return p;

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

        let p = start(PhraseType.ArrayCreationExpression);
        next(); //[
        p.children.push(arrayInitialiserList(TokenType.CloseBracket));
        expect(TokenType.CloseBracket);
        return end();

    }

    function longArrayCreationExpression() {

        let p = start(PhraseType.ArrayCreationExpression);
        next(); //array
        expect(TokenType.OpenParenthesis);

        if (isArrayElementStart(peek())) {
            p.children.push(arrayInitialiserList(TokenType.CloseParenthesis));
        }

        expect(TokenType.CloseParenthesis);
        return end();

    }

    function isArrayElementStart(t: Token) {
        return t.tokenType === TokenType.Ampersand || isExpressionStart(t);
    }

    function arrayInitialiserList(breakOn: TokenType) {

        let p = start(PhraseType.ArrayInitialiserList);
        let t: Token;

        while (true) {

            p.children.push(arrayElement());
            t = peek();

            if (t.tokenType === TokenType.Comma) {
                next();
                if (peek().tokenType === breakOn) {
                    break;
                }
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                error();
                break;
            }

        }

        return end();

    }

    function arrayValue() {

        let p = start(PhraseType.ArrayValue);
        optional(TokenType.Ampersand)
        p.children.push(expression(0));
        return end();

    }

    function arrayKey() {
        let p = start(PhraseType.ArrayKey);
        p.children.push(expression(0));
        return end();
    }

    function arrayElement() {

        let p = start(PhraseType.ArrayElement);

        if (peek().tokenType === TokenType.Ampersand) {
            p.children.push(arrayValue());
            return end();
        }

        let keyOrValue = arrayKey();
        p.children.push(keyOrValue);

        if (!optional(TokenType.FatArrow)) {
            keyOrValue.phraseType = PhraseType.ArrayValue;
            return end();
        }

        p.children.push(arrayValue());
        return end();

    }

    function encapsulatedExpression(openTokenType: TokenType, closeTokenType: TokenType) {

        let p = start(PhraseType.EncapsulatedExpression);
        expect(openTokenType);
        p.children.push(expression(0));
        expect(closeTokenType);
        return end();

    }

    function relativeScope() {
        start(PhraseType.RelativeScope);
        next();
        return end();
    }

    function isRelativeScopeName(t: Token) {
        return t.text === 'self' || t.text === 'parent';
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
                if (isRelativeScopeName(t) &&
                    peek(1).tokenType !== TokenType.Backslash) {
                    return relativeScope();
                }
            //fall through
            case TokenType.Namespace:
            case TokenType.Backslash:
                return qualifiedName();
            default:
                //error
                let p = start(PhraseType.ErrorVariableAtom);
                error();
                return end();
        }

    }

    function simpleVariable() {

        let p = start(PhraseType.SimpleVariable);
        let t = expectOneOf([TokenType.VariableName, TokenType.Dollar]);

        if (t.tokenType === TokenType.Dollar) {
            t = peek();
            if (t.tokenType === TokenType.OpenBrace) {
                next();
                p.children.push(expression(0));
                expect(TokenType.CloseBrace);
            } else if (t.tokenType === TokenType.Dollar || t.tokenType === TokenType.VariableName) {
                p.children.push(simpleVariable());
            } else {
                error();
            }
        }

        return end();

    }

    function haltCompilerStatement() {

        let p = start(PhraseType.HaltCompilerStatement);
        next(); // __halt_compiler
        expect(TokenType.OpenParenthesis);
        expect(TokenType.CloseParenthesis);
        expect(TokenType.Semicolon);
        return p;

    }

    function namespaceUseDeclaration() {

        let p = start(PhraseType.NamespaceUseDeclaration);
        next(); //use
        optionalOneOf([TokenType.Function, TokenType.Const]);
        let qualifiedNameNode = qualifiedName();
        let t = peek();

        if (t.tokenType === TokenType.Backslash || TokenType.OpenBrace) {
            p.children.push(qualifiedNameNode);
            expect(TokenType.Backslash);
            expect(TokenType.OpenBrace);
            p.children.push(delimitedList(
                PhraseType.NamespaceUseGroupClauses,
                namespaceUseGroupClause,
                isNamespaceUseGroupClauseStartToken,
                TokenType.Comma,
                [TokenType.CloseBrace]
            ));
            return p
        }

        p.children.push(delimitedList(
            PhraseType.NamespaceUseClauses,
            namespaceUseClauseFunction(qualifiedNameNode),
            isQualifiedNameStart,
            TokenType.Comma,
            [TokenType.Semicolon]));

        expect(TokenType.Semicolon);
        return p;

    }

    function namespaceUseClauseFunction(qName: Phrase) {

        return () => {

            let p = start(PhraseType.NamespaceUseClause);

            if (qName) {
                p.children.push(qName);
                qName = undefined;
            } else {
                p.children.push(qualifiedName());
            }

            if (peek().tokenType === TokenType.As) {
                p.children.push(namespaceAliasingClause());
            }

            return p;

        };

    }

    function delimitedList(phraseType: PhraseType, elementFunction: () => Phrase | Token,
        elementStartTokenPredicate: Predicate, delimeter: TokenType, breakOn?: TokenType[]) {
        let p = start(phraseType);
        let t: Token;

        while (true) {

            p.children.push(elementFunction());
            t = peek();

            if (t.tokenType === delimeter) {
                next();
            } else if (!breakOn || breakOn.indexOf(t.tokenType) >= 0) {
                break;
            } else {
                error();
                break;
            }

        }

        return p;
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

        let p = start(PhraseType.NamespaceUseGroupClause);
        optionalOneOf([TokenType.Function, TokenType.Const]);
        p.children.push(namespaceName());

        if (peek().tokenType === TokenType.As) {
            p.children.push(namespaceAliasingClause());
        }

        return p;

    }

    function namespaceAliasingClause() {

        let p = start(PhraseType.NamespaceAliasingClause);
        next(); //as
        expect(TokenType.Name);
        return p;

    }

    function namespaceDefinition() {

        let p = start(PhraseType.NamespaceDefinition);
        next(); //namespace

        if (peek().tokenType === TokenType.Name) {

            p.children.push(namespaceName());
            if (expectOneOf([TokenType.Semicolon, TokenType.OpenBrace]).tokenType !== TokenType.OpenBrace) {
                return p;
            }

        } else {
            expect(TokenType.OpenBrace);
        }

        p.children.push(statementList([TokenType.CloseBrace]));
        expect(TokenType.CloseBrace);
        return p;

    }

    function namespaceName() {

        let p = start(PhraseType.NamespaceName);
        expect(TokenType.Name);

        while (true) {

            if (peek().tokenType === TokenType.Backslash &&
                peek(1).tokenType === TokenType.Name) {
                next();
                next();
            } else {
                break;
            }

        }

        return p;

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
