/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType } from './lexer';

export const enum PhraseType {
    None,
    Script,
    StatementList,
    ConstDeclaration,
    ClassConstDeclaration,
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
    FunctionDefinition,
    FunctionDefinitionHeader,
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
    PropertyInititaliser,


    Error, NamespaceDefinition, NamespaceName, UseDeclaration,
    UseGroup, UseList, HaltCompilerStatement,
    ArrayPair, Name, Call, Unpack, ArgumentList, Dimension, ClassConstant,
    StaticProperty, StaticMethodCall, MethodCall, Property, Closure, EncapsulatedExpression,
    ParameterList, Isset, Empty, Eval, Include, YieldFrom, Yield, Print, TryStatement,
    Backticks, EncapsulatedVariableList, AnonymousClassDeclaration, New, identifier, VariableList,
    QualifiedNameList, Scalar, ClassModifiers,
    ClassConstElement, ClassConstantDeclarationList, TypeDeclaration, CompoundStatement, ReservedNonModifier,
    InnerStatementList, MethodDeclaration, UseTraitStatement, TraitAdaptations,
    MethodReference, TraitPrecendence, TraitAlias, Expressions,
    SimpleVariable, ArrayPairList, ClosureUseVariable, ClosureUseList,
    Clone, Heredoc, DoubleQuotes, EmptyStatement, If, WhileStatement, DoStatement, ClassInterfaceClause,
    ForExpressionList, ForStatement, BreakStatement, ContinueStatement, ReturnStatement,
    UnsetIntrinsic, ThrowStatement, GotoStatement, NamedLabelStatement, Foreach, CaseStatements, SwitchStatement, MemberModifierList,
    CaseStatement, Try, CatchClause, CatchNameList, FinallyClause, TernaryExpression, BinaryExpression,
    UnaryExpression, MagicConstant, CatchClauses, FunctionBody, MethodBody, ClassBaseClause, InterfaceBaseClause,
    EncapsulatedVariable, ErrorStaticMember, ErrorArgument, ErrorVariable, ErrorExpression, ErrorClassMemberDeclaration,
    ErrorPropertyName, ErrorTraitAdaptation
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

    const opPrecedenceMap: { [index: string]: [number, number] } = {
        '**': [47, Associativity.Right],
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

    function isBinaryOp(t: Token) {
        return isVariableOnlyBinaryOp(t) || isVariableAndExpressionBinaryOp(t);
    }

    function isVariableAndExpressionBinaryOp(t: Token) {
        switch (t.tokenType) {
            case '|':
            case '&':
            case '^':
            case '.':
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
            case TokenType.AsteriskAsterisk:
            case TokenType.LessThanLessThan:
            case TokenType.GreaterThanGreaterThan:
            case TokenType.AmpersandAmpersand:
            case TokenType.BarBar:
            case TokenType.And:
            case TokenType.Or:
            case TokenType.Xor:
            case TokenType.EqualsEqualsEquals:
            case TokenType.ExclamationEqualsEquals:
            case TokenType.EqualsEquals:
            case TokenType.ExclamationEquals:
            case '<':
            case TokenType.LessThanEquals:
            case '>':
            case TokenType.GreaterThanEquals:
            case TokenType.Spaceship:
            case TokenType.QuestionQuestion:
                return true;
            default:
                return false;

        }
    }

    function isAssignBinaryOp(t: Token) {
        return t.tokenType === '=';
    }

    function isVariableOnlyBinaryOp(t: Token) {
        switch (t.tokenType) {
            case '=':
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
                return true;
            default:
                return false;
        }
    }

    var tokenBuffer: Token[];
    var recoverSetStack: (TokenType | string)[][];
    var isBinaryOpPredicate: Predicate;
    var variableAtomType: PhraseType;
    var pos: number;
    var phraseStack: Phrase[];
    var isRecovering = false;


    export function parseScript(text: string): Phrase {

        Lexer.setInput(text);

        tokens = tokenArray;
        pos = -1;
        phraseStack = [];

        if (!tokenArray.length) {
            return null;
        }

        return statementList(TokenType.EndOfFile);

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

    function next(): Token {

        let t = tokenBuffer.length ? tokenBuffer.shift() : Lexer.lex();

        if (t.tokenType === TokenType.EndOfFile) {
            return t;
        }

        phraseStackTop().children.push(t);
        if (isHidden(t)) {
            return this.next();
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
            p.children.push(statementList([TokenType.EndOfFile]))
        }
        optional(TokenType.CloseTag);
        optional(TokenType.Text);
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
            TokenType.Semicolon
        ));
        expect(TokenType.Semicolon);
        return p;

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

    function expression(minPrecedence:number) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        isBinaryOpPredicate = isVariableAndExpressionBinaryOp;
        let lhs = expressionAtom();
        let p: Phrase;

        while (true) {

            op = peek();

            if (!isBinaryOpPredicate(op)) {
                break;
            }

            p = start(PhraseType.BinaryExpression);
            p.children.push(lhs);

            [precedence, associativity] = opPrecedenceMap[op.text];

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }

            next(); //operator
            if (op.tokenType === '?') {
                lhs = ternaryExpression(p, precedence);
            } else {
                let rhs: any;
                if (op.tokenType === '=' && peek().tokenType === '&') {
                    p.children.push(unaryExpression());
                } else {
                    p.children.push(op.tokenType === TokenType.InstanceOf ? newVariable() : expression(precedence));
                }
                lhs = end();
            }

        }

        return lhs;

    }

    function ternaryExpression(n: TempNode, precedence: number) {

        n.phrase.phraseType = PhraseType.TernaryExpression;

        if (!next(':')) {
            phrase(expression, [precedence], [':']);

            if (!expect(':')) {
                return end();
            }

        }

        phrase(expression, [precedence]);
        return end();

    }

    function variableCheckForPostUnaryExpression() {
        isBinaryOpPredicate = isBinaryOp;
        let variableNode = variable();
        let t = peek();
        //post inc/dec
        if (t.tokenType === TokenType.PlusPlus || t.tokenType === TokenType.MinusMinus) {
            let unary = start(PhraseType.UnaryExpression);
            unary.children.push(variableNode);
            next();
            return end();
        } else {
            return variableNode;
        }
    }

    function scalar() {
        let scalar = start(PhraseType.Scalar);
        next();
        return end();
    }

    function expressionAtom() {

        let t = peek();

        switch (t.tokenType) {
            case TokenType.Static:
                if (peek(1).tokenType === TokenType.Function) {
                    return closure();
                } else {
                    return variableCheckForPostUnaryExpression();
                }
            case TokenType.StringLiteral:
                let derefToken = peek(1);
                if (derefToken.tokenType === '[' || derefToken.tokenType === '{' ||
                    derefToken.tokenType === TokenType.Arrow || derefToken.tokenType === '(') {
                    return variableCheckForPostUnaryExpression();
                } else {
                    return scalar();
                }
            case TokenType.VariableName:
            case '$':
            case TokenType.Array:
            case '[':
            case TokenType.Backslash:
            case TokenType.Name:
            case TokenType.Namespace:
            case '(':
                return variableCheckForPostUnaryExpression();
            case TokenType.PlusPlus:
            case TokenType.MinusMinus:
            case '+':
            case '-':
            case '!':
            case '~':
            case '@':
            case TokenType.IntegerCast:
            case TokenType.FloatCast:
            case TokenType.StringCast:
            case TokenType.ArrayCast:
            case TokenType.ObjectCast:
            case TokenType.BooleanCast:
            case TokenType.UnsetCast:
                return unaryExpression();
            case TokenType.List:
                isBinaryOpPredicate = isAssignBinaryOp;
                return listExpression();
            case TokenType.Clone:
                return cloneExpression();
            case TokenType.New:
                return newExpression();
            case TokenType.FloatingLiteral:
            case TokenType.IntegerLiteral:
                return scalar();
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
                return heredoc();
            case '"':
                return quotedEncapsulatedVariableList(PhraseType.DoubleQuotes, '"');
            case '`':
                return quotedEncapsulatedVariableList(PhraseType.Backticks, '`');
            case TokenType.Print:
                return keywordExpression(PhraseType.Print);
            case TokenType.Yield:
                return yieldExpression();
            case TokenType.YieldFrom:
                return keywordExpression(PhraseType.YieldFrom);
            case TokenType.Function:
                return closure();
            case TokenType.Include:
            case TokenType.IncludeOnce:
            case TokenType.Require:
            case TokenType.RequireOnce:
                return keywordExpression(PhraseType.Include);
            case TokenType.Eval:
                return keywordEncapsulatedExpression(PhraseType.Eval);
            case TokenType.Empty:
                return keywordEncapsulatedExpression(PhraseType.Empty);
            case TokenType.Isset:
                return isset();
            case TokenType.Echo:
                return echoIntrinsic();
            case TokenType.Unset:
                return unsetIntrinsic();
            default:
                //error
                let err = start(PhraseType.ErrorExpression);
                error();
                return end();
        }

    }

    function magicConstant() {
        let magic = start(PhraseType.MagicConstant);
        next();
        return end();
    }

    function isset() {

        start(PhraseType.Isset);
        next(); //isset

        if (!expect('(')) {
            return end();
        }

        phrase(expressions, [], [')']);
        expect(')', [')']);
        return end();

    }

    function expressions() {

        start(PhraseType.Expressions);
        let recover = [','];
        let t: Token;

        while (true) {

            phrase(expression, [0], undefined, recover);
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                //error
                error();
                break;
            }

        }

        return end();

    }

    function keywordEncapsulatedExpression(type: PhraseType) {

        start(type);
        next(); //keyword
        phrase(encapsulatedExpression, ['(', ')']);
        return end();

    }

    function keywordExpression(nodeType: PhraseType) {

        start(nodeType);
        next(); //keyword
        phrase(expression, [0]);
        return end();
    }

    function yieldExpression() {

        start(PhraseType.Yield);
        next(); //yield

        if (!isExpressionStart(peek())) {
            return end();
        }

        phrase(expression, [0], [TokenType.FatArrow]);

        if (peek().tokenType !== TokenType.FatArrow) {
            return end();
        }

        phrase(expression, [0]);
        return end();

    }

    function quotedEncapsulatedVariableList(type: PhraseType, closeTokenType: TokenType | string) {

        start(type);
        next(); //open encaps
        phrase(encapsulatedVariableList, [closeTokenType], [closeTokenType]);
        expect(closeTokenType, [closeTokenType]);
        return end();

    }

    function encapsulatedVariableList(breakOn: TokenType | string) {

        let n = start(PhraseType.EncapsulatedVariableList);
        let recover: (TokenType | string)[] = [
            TokenType.EncapsulatedAndWhitespace, TokenType.VariableName,
            TokenType.DollarCurlyOpen, TokenType.CurlyOpen, breakOn
        ];
        let t: Token;

        while (true) {

            t = peek();
            if (isEncapsulatedVariableStartToken(t)) {
                phrase(encapsulatedVariable, [], recover);
            } else if (t.tokenType === breakOn) {
                break;
            } else if (recover.indexOf(error(undefined, recover).tokenType) < 0) {
                break;
            }

        }

        return end();

    }

    function isEncapsulatedVariableStartToken(t: Token) {

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
                next();
                break;
            case TokenType.VariableName:
                let t = peek(1);
                if (t.tokenType === '[') {
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
                //error
                //should not get here
                throw new Error(`Unexpected token ${peek().tokenType}`);
        }

    }

    function curlyOpenEncapsulatedVariable() {

        start(PhraseType.EncapsulatedVariable);
        next(); //{
        phrase(variable, [], ['}']);
        expect('}', ['}']);
        return end();

    }

    function dollarCurlyOpenEncapsulatedVariable() {

        let n = start(PhraseType.EncapsulatedVariable);
        next(); //${
        let t = peek();

        if (t.tokenType === TokenType.VariableName) {

            if (peek(1).tokenType === '[') {
                phrase(dollarCurlyOpenEncapsulatedVariable, [], ['}']);
            } else {
                start(PhraseType.SimpleVariable);
                next();
                n.children.push(end());
            }

        } else if (isExpressionStart(t)) {
            phrase(expression, [0], ['}']);
        } else {
            //error
            error(undefined, ['}']);
        }

        expect('}', ['}']);
        return end();
    }

    function dollarCurlyEncapsulatedDimension() {
        start(PhraseType.Dimension);
        next(); //T_STRING_VARNAME
        next(); // [
        phrase(expression, [0], [']']);
        expect(']', [']']);
        return end();
    }

    function encapsulatedDimension() {

        let n = start(PhraseType.Dimension);

        n.children.push(simpleVariable()); //T_VARIABLE
        next(); //[

        switch (peek().tokenType) {
            case TokenType.Name:
            case TokenType.T_NUM_STRING:
                next();
                break;
            case TokenType.VariableName:
                phrase(simpleVariable, [], [']']);
                break;
            case '-':
                start(PhraseType.UnaryExpression);
                next(); //-
                expect(TokenType.T_NUM_STRING, [']']);
                n.children.push(end());
                break;
            default:
                //error
                error();
                break;
        }

        expect(']', [']']);
        return end();

    }

    function encapsulatedProperty() {
        start(PhraseType.Property);
        phrase(simpleVariable, []); //T_VARIABLE
        next(); //T_OBJECT_OPERATOR
        expect(TokenType.Name);
        return end();
    }

    function heredoc() {

        start(PhraseType.Heredoc);
        next();
        phrase(encapsulatedVariableList, [TokenType.EndHeredoc], [TokenType.EndHeredoc]);
        expect(TokenType.EndHeredoc, [TokenType.EndHeredoc]);
        return end();

    }

    function anonymousClassDeclaration() {

        start(PhraseType.AnonymousClassDeclaration);
        next(); //class

        if (peek().tokenType === '(') {
            phrase(argumentList, [], [TokenType.Extends, TokenType.Implements, '{']);
        }

        if (peek().tokenType === TokenType.Extends) {
            phrase(classBaseClause, [], [TokenType.Implements, '{']);
        }

        if (peek().tokenType === TokenType.Implements) {
            phrase(classInterfaceClause, [], ['{']);
        }

        phrase(classMemberDeclarations, [], [], ['{']);
        return end();

    }

    function classInterfaceClause() {

        let p = start(PhraseType.ClassInterfaceClause);
        next(); //implements
        p.children.push(qualifiedNameList(TokenType.OpenBrace));
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
                p.children.push(memberModifierList());
                t = peek();
                if (t.tokenType === TokenType.VariableName) {
                    return propertyDeclaration(p);
                } else if (t.tokenType === TokenType.Function) {
                    return methodDeclaration(p);
                } else if (t.tokenType === TokenType.Const) {
                    return classConstantDeclarationStatement(p);
                } else {
                    //error
                    error();
                    return end();
                }
            case TokenType.Function:
                return methodDeclaration(p);
            case TokenType.Var:
                next();
                return propertyDeclaration(p);
            case TokenType.Const:
                return classConstantDeclarationStatement(p);
            case TokenType.Use:
                return useTraitStatement();
            default:
                //should not get here
                throwUnexpectedTokenError(t);
        }

    }

    function throwUnexpectedTokenError(t:Token){
        throw new Error(`Unexpected token: ${t.text}`);
    }

    function useTraitStatement() {

        start(PhraseType.UseTraitStatement);
        next();
        phrase(qualifiedNameList, [], [';', '{']);
        phrase(traitAdaptationList, [], [], [';', '{']);
        return end();

    }

    function traitAdaptationList() {

        let n = start(PhraseType.TraitAdaptations);
        let t: Token;

        if (peek().tokenType === ';') {
            next();
            return end();
        }

        if (!expect('{')) {
            return end();
        }

        while (true) {

            t = peek();

            if (t.tokenType === '}') {
                next();
                break;
            } else if (t.tokenType === TokenType.Name ||
                t.tokenType === TokenType.Namespace ||
                t.tokenType === TokenType.Backslash ||
                isSemiReservedToken(t)) {
                phrase(traitAdaptation, [], ['}']);
            } else if (error(undefined, ['}']).tokenType !== '}') {
                break;
            }

        }

        return end();

    }

    function traitAdaptation() {

        let n = start(PhraseType.ErrorTraitAdaptation);
        let t = peek();
        let t2 = peek(1);

        if (t.tokenType === TokenType.Namespace ||
            t.tokenType === TokenType.Backslash ||
            (t.tokenType === TokenType.Name &&
                (t2.tokenType === TokenType.ColonColon || t2.tokenType === TokenType.Backslash))) {

            phrase(methodReference, [], [TokenType.InsteadOf, TokenType.As]);

            if (peek().tokenType === TokenType.InsteadOf) {
                next();
                return traitPrecedence(n);
            }

        } else if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {

            let methodRef = start(PhraseType.MethodReference);
            methodRef.children.push(identifier());
            n.children.push(end());
        } else {
            //error
            error();
            return end();
        }

        return traitAlias(n);


    }

    function traitAlias(n: TempNode) {

        n.phrase.phraseType = PhraseType.TraitAlias;
        expect(TokenType.As, [';']);

        let t = peek();

        if (t.tokenType === TokenType.Name || isReservedToken(t)) {
            n.children.push(identifier());
        } else if (isMemberModifier(t)) {
            next();
            t = peek();
            if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
                n.children.push(identifier());
            }
        } else {
            //error
            error(undefined, [';']);
        }

        expect(';', [';']);
        return end();

    }

    function traitPrecedence(n: TempNode) {

        n.phrase.phraseType = PhraseType.TraitPrecendence;
        phrase(qualifiedNameList, [], [';']);
        expect(';', [';']);
        return end();

    }

    function methodReference() {

        let n = start(PhraseType.MethodReference);
        phrase(qualifiedName, [], [TokenType.ColonColon]);
        if (!expect(TokenType.ColonColon)) {
            return end();
        }

        n.children.push(identifier());
        return end();

    }

    function methodDeclaration(n: TempNode) {

        n.phrase.phraseType = PhraseType.MethodDeclaration;
        next(); //T_FUNCTION
        next('&'); //returns ref

        phrase(identifier, [], [';', ':', '{', '(']);
        phrase(parameterList, [], [':', ';', '{'], ['(']);

        if (peek().tokenType === ':') {
            phrase(returnType, [], ['{', ';']);
        }

        phrase(methodBody, [], [], [';', '{']);
        return end();

    }

    function methodBody() {
        let n = start(PhraseType.MethodBody);
        if (peek().tokenType === ';') {
            next();
        } else {
            n.children.push(compoundStatement());
        }
        return end();
    }

    function identifier() {
        let n = start(PhraseType.identifier);
        let t = peek();
        if (t.tokenType === TokenType.Name || isSemiReservedToken(t)) {
            next();
        } else {
            error();
        }
        return end();
    }

    function innerStatementList(breakOn: (TokenType | string)[]) {

        let n = start(PhraseType.InnerStatementList);
        let t: Token;
        let recover = recoverInnerStatementStartTokenTypes;

        while (true) {

            t = peek();

            if (isInnerStatementStartToken(t)) {
                phrase(innerStatement, [], recover);
            } else if (breakOn.indexOf(t.tokenType) >= 0) {
                break;
            } else {
                //error
                t = error(undefined, recover, [';']);
                if (!isInnerStatementStartToken(t) && breakOn.indexOf(t.tokenType) < 0) {
                    break;
                }
            }
        }

        return end();

    }

    function innerStatement() {

        switch (peek().tokenType) {
            case TokenType.Function:
                return functionDefinition();
            case TokenType.Abstract:
            case TokenType.Final:
            case TokenType.Class:
                return classDeclaration();
            case TokenType.Trait:
                return traitDeclaration();
            case TokenType.Interface:
                return interfaceDeclaration();
            default:
                return statement();

        }

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
        n.children.push(qualifiedNameList(TokenType.OpenBrace));
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
            TokenType.CloseBrace
        );

    }

    function functionDefinition() {

        let p = start(PhraseType.FunctionDefinition);
        p.children.push(functionDefinitionHeader(), compoundStatement());
        return p;

    }

    function functionDefinitionHeader() {

        let p = start(PhraseType.FunctionDefinitionHeader);

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
                TokenType.CloseParenthesis
            ));
        }

        expect(TokenType.CloseParenthesis);

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
                return functionDefinition();
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
            case TokenType.Text:
                return t;
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
            case TokenType.Semicolon:
                start(PhraseType.ExpressionStatement);
                next(); //;
                return end();
            case TokenType.Name:
                if (peek(1).tokenType === TokenType.Colon) {
                    return namedLabelStatement();
                }
            //fall though
            default:
                return expressionStatement();

        }

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
            p.children.push(statementList(TokenType.EndForeach));
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
            case '$':
            case '(':
            case TokenType.Array:
            case '[':
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

    function variableList(breakOn?:TokenType){
        return delimitedList(
            PhraseType.VariableList,
            variable,
            isVariableStart,
            TokenType.Comma,
            breakOn
        );
    }

    function unsetIntrinsic() {

        let p = start(PhraseType.UnsetIntrinsic);
        next(); //unset
        expect(TokenType.OpenParenthesis);
        p.children.push(variableList(TokenType.CloseParenthesis));
        expect(TokenType.CloseParenthesis);
        return end();

    }

    function expressionInitial(){
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
        return end();

    }

    function functionStaticDeclaration() {

        let p = start(PhraseType.FunctionStaticDeclaration);
        next(); //static
        p.children.push(delimitedList(
            PhraseType.StaticVariableNameList,
            staticVariableDeclaration,
            (t: Token) => { return t.tokenType === TokenType.VariableName; },
            TokenType.Comma,
            TokenType.Semicolon
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
            TokenType.Semicolon
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

    function forExpressionGroup(phraseType: PhraseType, breakOn: TokenType) {

        return delimitedList(
            phraseType,
            () => { return expression(0); },
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
            p.children.push(forExpressionGroup(PhraseType.ForInitialiser, TokenType.Semicolon));
        }

        expect(TokenType.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseType.ForControl, TokenType.Semicolon));
        }

        expect(TokenType.Semicolon);

        if (isExpressionStart(peek())) {
            p.children.push(forExpressionGroup(PhraseType.ForEndOfLoop, TokenType.CloseParenthesis));
        }

        expect(TokenType.CloseParenthesis);

        let t = peek();

        if (t.tokenType === TokenType.Colon) {
            next();
            p.children.push(statementList(TokenType.EndFor));
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
        next(); //:
        return typeDeclaration();
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
                //error
                error(p,
                    [TokenType.Callable, TokenType.Array, TokenType.Name, TokenType.Namespace, TokenType.Backslash]
                );
                break;
        }

        return p;

    }

    function classConstantDeclarationStatement(n: TempNode) {

        n.value.phraseType = PhraseType.ClassConstantDeclarationList;
        next(); //const
        let followOn = [';', ','];
        let t: Token;

        while (true) {
            recoverPush(followOn);
            n.children.push(classConstantDeclaration());
            recoverPop();
            t = next();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                //error
                error(followOn, [';']);
                expect(';');
                break;
            }
        }

        return node(n);
    }

    function isExpressionStart(t: Token) {

        switch (t.tokenType) {
            case TokenType.VariableName:
            case '$':
            case TokenType.Array:
            case '[':
            case TokenType.StringLiteral:
            case TokenType.Backslash:
            case TokenType.Name:
            case TokenType.Namespace:
            case '(':
            case TokenType.Static:
            case TokenType.PlusPlus:
            case TokenType.MinusMinus:
            case '+':
            case '-':
            case '!':
            case '~':
            case '@':
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
            case TokenType.T_DIR:
            case TokenType.TraitConstant:
            case TokenType.MethodConstant:
            case TokenType.FunctionConstant:
            case TokenType.NamespaceConstant:
            case TokenType.ClassConstant:
            case TokenType.StartHeredoc:
            case '"':
            case '`':
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

    function classConstantDeclaration() {

        let n = tempNode(PhraseType.ClassConstantDeclarationList);

        recoverPush(['=']);
        n.children.push(identifier());
        recoverPop();

        n.value.doc = lastDocComment();

        if (!expect('=')) {
            //error
            error(['=']);
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function isPropertyElementStart(t:Token){
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
            TokenType.Semicolon
        ));
        return end();

    }

    function propertyElement() {

        let p = start(PhraseType.PropertyElement);
        expect(TokenType.VariableName);

        if(peek().tokenType === TokenType.Equals){
            p.children.push(propertyInitialiser());
        }

        return end();

    }

    function propertyInitialiser(){

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


    function qualifiedNameList(breakOn: TokenType) {

        return delimitedList(
            PhraseType.QualifiedNameList,
            qualifiedName,
            isQualifiedNameStart,
            TokenType.Comma,
            breakOn
        );
    }

    function newExpression() {

        let n = tempNode(PhraseType.New);
        next(); //new

        if (peek().tokenType === TokenType.Class) {
            n.children.push(anonymousClassDeclaration());
            return node(n);
        }

        recoverPush(['(']);
        n.children.push(newVariable());
        recoverPop();

        if (peek().tokenType === '(') {
            n.children.push(argumentList());
        }

        return node(n);

    }

    function newVariable() {

        let n: TempNode;
        let startToken = start();
        let part = newVariablePart();
        let propName: any;

        while (true) {

            switch (peek().tokenType) {
                case '[':
                case '{':
                    part = dimension(part, startToken);
                    continue;
                case TokenType.Arrow:
                    n = tempNode(PhraseType.Property, startToken);
                    next();
                    n.children.push(part, propertyName());
                    part = node(n);
                    continue;
                case TokenType.ColonColon:
                    n = tempNode(PhraseType.StaticProperty, startToken);
                    next();
                    n.children.push(part, simpleVariable());
                    part = node(n);
                    continue;
                default:
                    break;
            }

            break;

        }

        return part;

    }

    function newVariablePart() {

        let t = peek();
        let n = tempNode(PhraseType.ErrorVariable);

        switch (t.tokenType) {
            case TokenType.Static:
                n.value.phraseType = PhraseType.Name;
                n.value.flag = PhraseFlag.NameNotFullyQualified;
                n.children.push(nodeFactory(next()));
                return node(n);
            case TokenType.VariableName:
            case '$':
                return simpleVariable();
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Backslash:
                return qualifiedName();
            default:
                //error
                error(n,
                    [TokenType.Static, TokenType.VariableName, '$', TokenType.Name,
                    TokenType.Namespace, TokenType.Backslash]
                );
                return node(n);
        }

    }

    function cloneExpression() {

        let n = tempNode(PhraseType.Clone);
        next();
        n.children.push(expression());
        return node(n);

    }

    function listExpression() {

        let n = tempNode(PhraseType.ArrayPairList);
        let t = next();

        if (!expect('(')) {
            //error
            error(['('], [')']);
            expect(')');
            return node(n);
        }

        recoverPush([')']);
        arrayPairList(n, ')');
        recoverPop();

        if (!expect(')')) {
            //error
            error([')'], [')']);
            expect(')');
        }

        return node(n);

    }

    function unaryExpression() {

        let n = tempNode(PhraseType.UnaryExpression);
        let t = next();
        n.value.flag = unaryOpToNodeFlag(t);

        switch (n.value.flag) {
            case PhraseFlag.UnaryPreDec:
            case PhraseFlag.UnaryPreInc:
            case PhraseFlag.UnaryReference:
                n.children.push(variable());
                break;
            default:
                n.children.push(expression(opPrecedenceMap[t.text][0]));
                break;
        }

        return node(n);

    }

    function closure() {

        let n = tempNode(PhraseType.Closure);
        if (next(TokenType.Static)) {
            n.value.flag = PhraseFlag.ModifierStatic;
        }

        next(); //T_FUNCTION

        if (expect('&')) {
            n.value.flag |= PhraseFlag.ReturnsRef;
        }

        recoverPush([TokenType.Use, ':', '{']);
        n.children.push(parameterList());
        recoverPop();

        if (peek().tokenType === TokenType.Use) {
            recoverPush([':', '{']);
            n.children.push(closureUse());
            recoverPop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (peek().tokenType === ':') {
            recoverPush(['{']);
            n.children.push(returnType());
            recoverPop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (!expect('{')) {
            error(['{'], [...recoverInnerStatementStartTokenTypes, '}']);
        }

        recoverPush(['}']);
        n.children.push(innerStatementList(['}']));
        recoverPop();

        if (!expect('}')) {
            error(['}'], ['}']);
            expect('}');
        }

        return node(n);

    }

    function closureUse() {

        let n = tempNode(PhraseType.ClosureUseList);
        let t = next();

        if (!expect('(')) {
            error(['('], [')']);
            expect(')');
            return node(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            recoverPush(followOn);
            n.children.push(closureUseVariable());
            recoverPop();
            t = next();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                next();
                break;
            } else {
                //error
                error(followOn, [')']);
                expect(')');
                break;
            }

        }

        return node(n);

    }

    function closureUseVariable() {

        let n = tempNode(PhraseType.ClosureUseVariable);

        if (expect('&')) {
            n.value.flag = PhraseFlag.PassByRef;
        }

        if (next(TokenType.VariableName)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            error([TokenType.VariableName]);
        }

        return node(n);

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

    function variable() {

        //TODO - expressions can be a name node (const) or dereferencable scalar

        let startToken = start();
        variableAtomType = 0;
        let variableAtomNode = variableAtom();
        let count = 0;

        while (true) {
            ++count;
            switch (peek().tokenType) {
                case TokenType.ColonColon:
                    variableAtomNode = staticMember(variableAtomNode, startToken);
                    continue;
                case TokenType.Arrow:
                    variableAtomNode = instanceMember(variableAtomNode, startToken);
                    continue;
                case '[':
                case '{':
                    variableAtomNode = dimension(variableAtomNode, startToken);
                    continue;
                case '(':
                    let call = tempNode(PhraseType.Call, startToken);
                    call.children.push(variableAtomNode, argumentList());
                    variableAtomNode = node(call);
                    continue;
                default:
                    if (count === 1 && variableAtomType !== PhraseType.SimpleVariable) {
                        //error
                        let errNode = tempNode(PhraseType.ErrorVariable, startToken);
                        errNode.children.push(variableAtomNode);
                        error(errNode,
                            [TokenType.ColonColon, TokenType.Arrow, '[', '{', '(']);
                        return node(errNode);
                    }
                    break;
            }

            break;
        }

        return variableAtom;
    }

    function staticMember(lhs: any, startToken: Token) {

        let n = tempNode(PhraseType.ErrorStaticMember, startToken);
        n.children.push(lhs);
        next() //::
        let t = peek();

        switch (t.tokenType) {
            case '{':
                n.value.phraseType = PhraseType.StaticMethodCall;
                n.children.push(encapsulatedExpression('{', '}'));
                break;
            case '$':
            case TokenType.VariableName:
                n.children.push(simpleVariable());
                n.value.phraseType = PhraseType.StaticProperty;
                break;
            case TokenType.Name:
                n.children.push(identifier());
                n.value.phraseType = PhraseType.ClassConstant;
                break;
            default:
                if (isSemiReservedToken(t)) {
                    n.children.push(identifier());
                    n.value.phraseType = PhraseType.ClassConstant;
                    break;
                } else {
                    //error
                    error(n,
                        ['{', '$', TokenType.VariableName, TokenType.Name]
                    );
                    return node(n);
                }
        }

        t = peek();

        if (t.tokenType === '(') {
            n.children.push(argumentList());
            n.value.phraseType = PhraseType.StaticMethodCall;
            return node(n);
        } else if (n.value.phraseType === PhraseType.StaticMethodCall) {
            //error
            error(['(']);
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function instanceMember(lhs: any, startToken: Token) {

        let n = tempNode(PhraseType.Property, startToken);
        n.children.push(lhs);
        next(); //->
        n.children.push(propertyName());

        if (expect('(')) {
            n.children.push(argumentList());
            n.value.phraseType = PhraseType.MethodCall;
        }

        return node(n);

    }

    function propertyName() {

        switch (peek().tokenType) {
            case TokenType.Name:
                return nodeFactory(next());
            case '{':
                return encapsulatedExpression('{', '}');
            case '$':
            case TokenType.VariableName:
                return simpleVariable();
            default:
                //error
                let e = tempNode(PhraseType.Error);
                error(e, [TokenType.Name, '{', '$']);
                return node(e);
        }

    }

    function dimension(lhs: any, startToken: Token) {

        let n = tempNode(PhraseType.Dimension, startToken);
        let close = peek().tokenType === '[' ? ']' : '}';
        n.children.push(lhs);
        next();

        if (isExpressionStart(peek())) {
            recoverPush([close]);
            n.children.push(expression());
            recoverPop();
        }

        if (!next(close)) {
            //error
            error([close], [close]);
            next(close);
        }

        return node(n);

    }

    function argumentList() {

        let n = tempNode(PhraseType.ArgumentList);
        let t: Token;

        if (!expect('(')) {
            //error
            error(['('], [')']);
            expect(')');
            return node(n);
        }

        if (expect(')')) {
            return node(n);
        }

        let followOn = [',', ')'];

        while (true) {

            recoverPush(followOn);
            n.children.push(argument());
            recoverPop();
            t = peek();

            if (t.tokenType === ')') {
                next();
                break;
            } else if (t.tokenType === ',') {
                next();
            } else {
                //error
                error(followOn, [')']);
                expect(')');
                break;
            }

        }

        return node(n);

    }

    function isArgumentStartToken(t: Token) {
        return t.tokenType === TokenType.Ellipsis || isExpressionStart(t);
    }

    function argument() {

        let n = start(PhraseType.ErrorArgument);
        let t = peek();

        if (t.tokenType === TokenType.Ellipsis) {
            next();
            n.value.phraseType = PhraseType.Unary;
            n.children.push(expression());
            return node(n);
        } else if (isExpressionStart(t)) {
            return expression();
        } else {
            //error
            error([]);
            return node(n);
        }

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

    function shortArray() {

        let n = tempNode(PhraseType.ArrayPairList);
        let t = next();

        if (expect(']')) {
            return node(n);
        }

        recoverPush([']']);
        arrayPairList(n, ']');
        recoverPop();

        if (!expect(']')) {
            error([']'], [']']);
            expect(']');
        }

        return node(n);

    }

    function longArray() {

        let n = tempNode(PhraseType.ArrayPairList);
        next();

        if (!expect('(')) {
            //error
            error(['('], [')']);
            expect(')');
            return node(n);
        }

        if (expect(')')) {
            return node(n);
        }

        recoverPush([')']);
        arrayPairList(n, ')');
        recoverPop();

        if (!expect(')')) {
            error([')'], [')']);
            expect(')');
        }

        return node(n);

    }

    function isArrayPairStartToken(t: Token) {
        return t.tokenType === '&' || isExpressionStart(t);
    }

    function arrayPairList(n: TempNode, breakOn: TokenType | string) {

        let t: Token;
        let followOn: (TokenType | string)[] = [','];

        while (true) {

            recoverPush(followOn);
            n.children.push(arrayPair());
            recoverPop();
            t = peek();

            if (t.tokenType === ',') {
                next();
                if (peek().tokenType === breakOn) {
                    break;
                }
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                //error
                if (error(followOn, [',']).tokenType === ',' &&
                    peek(1).tokenType !== breakOn) {
                    next();
                    continue;
                }
                break;
            }

        }

        return n;

    }


    function arrayPair() {

        let n = tempNode(PhraseType.ArrayPair);

        if (peek().tokenType === '&') {
            n.children.push(unaryExpression(), nodeFactory(null));
            return node(n);
        }

        recoverPush([TokenType.FatArrow]);
        n.children.push(expression());
        recoverPop();

        if (!next(TokenType.FatArrow)) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        if (peek().tokenType === '&') {
            n.children.push(unaryExpression());
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function encapsulatedExpression(open: string | TokenType, close: string | TokenType) {

        let n = tempNode(PhraseType.EncapsulatedExpression);

        if (!next(open)) {
            let err = new ParseError(peek(), [open]);
            if (isExpressionStart(peek())) {
                n.value.errors = [err];
            } else if (peek(1).tokenType === open) {
                next();
                next();
                n.value.errors = [err];
            } else {
                error([open], [close]);
                next(close);
                n.children.push(nodeFactory(null));
                return node(n);
            }
        }

        recoverPush([close]);
        n.children.push(expression());
        recoverPop();

        if (!next(close)) {
            error([close], [close]);
            next(close);
        }

        return node(n);

    }

    function variableAtom() {

        let n: TempNode;
        switch (peek().tokenType) {
            case TokenType.VariableName:
            case '$':
                variableAtomType = PhraseType.SimpleVariable;
                return simpleVariable();
            case '(':
                return encapsulatedExpression('(', ')');
            case TokenType.Array:
                variableAtomType = PhraseType.ArrayPairList;
                return longArray();
            case '[':
                variableAtomType = PhraseType.ArrayPairList;
                return shortArray();
            case TokenType.StringLiteral:
                return nodeFactory(next());
            case TokenType.Static:
                variableAtomType = PhraseType.Name;
                n = tempNode(PhraseType.Name);
                n.value.flag = PhraseFlag.NameNotFullyQualified;
                n.children.push(nodeFactory(next()));
                return node(n);
            case TokenType.Name:
            case TokenType.Namespace:
            case TokenType.Backslash:
                variableAtomType = PhraseType.Name;
                return qualifiedName();
            default:
                //error
                variableAtomType = PhraseType.ErrorVariable;
                n = tempNode(PhraseType.ErrorVariable);
                error(n,
                    [TokenType.VariableName, '$', '(', '[', TokenType.Array, TokenType.StringLiteral,
                    TokenType.Static, TokenType.Name, TokenType.Namespace, TokenType.Backslash]);
                return node(n);
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

    function isBinaryOpToken(t: Token) {
        return opPrecedenceMap.hasOwnProperty(t.text) && (opPrecedenceMap[t.text][2] & OpType.Binary) === OpType.Binary;
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
        let qualifiedName = qualifiedName();
        let t = peek();

        if (t.tokenType === TokenType.Backslash || TokenType.OpenBrace) {
            p.children.push(qualifiedName);
            expect(TokenType.Backslash);
            expect(TokenType.OpenBrace);
            p.children.push(delimitedList(
                PhraseType.NamespaceUseGroupClauses,
                namespaceUseGroupClause,
                isNamespaceUseGroupClauseStartToken,
                TokenType.Comma,
                TokenType.CloseBrace
            ));
            return p
        }

        p.children.push(delimitedList(
            PhraseType.NamespaceUseClauses,
            namespaceUseClauseFunction(qualifiedName),
            isQualifiedNameStart,
            TokenType.Comma,
            TokenType.Semicolon));

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

    function delimitedList(phraseType: PhraseType, elementFunction: () => Phrase,
        elementStartTokenPredicate: Predicate, delimeter: TokenType, breakOn?: TokenType) {
        let p = start(phraseType);

        while (true) {

            n.children.push(elementFunction);
            t = peek();

            if (t.tokenType === delimeter) {
                next();
            } else if (breakOn === undefined || t.tokenType === breakOn) {
                break;
            } else {
                //error
                if (error([',', breakOn], [',']).tokenType === ',') {
                    next();
                    continue;
                }
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

        p.children.push(statementList(TokenType.CloseBrace));
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
                return true;
            default:
                return isStatementStart(t);
        }

    }

    function isInnerStatementStartToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.Function:
            case TokenType.Abstract:
            case TokenType.Final:
            case TokenType.Class:
            case TokenType.Trait:
            case TokenType.Interface:
                return true;
            default:
                return isStatementStart(t);
        }
    }

    function isStatementStart(t: Token) {

        switch (t.tokenType) {
            case '{':
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
            case TokenType.Text:
            case TokenType.Unset:
            case TokenType.ForEach:
            case TokenType.Declare:
            case TokenType.Try:
            case TokenType.Throw:
            case TokenType.Goto:
            case TokenType.Name:
            case ';':
                return true;
            default:
                return isExpressionStart(t);
        }
    }

}
