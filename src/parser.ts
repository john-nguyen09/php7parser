/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType } from './lexer';

export enum PhraseType {
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

    Error, NamespaceDefinition, NamespaceName, UseDeclaration,
    UseGroup, UseList, HaltCompilerStatement,
    ArrayPair, Name, Call, Unpack, ArgumentList, Dimension, ClassConstant,
    StaticProperty, StaticMethodCall, MethodCall, Property, Closure, EncapsulatedExpression,
    ParameterList, Isset, Empty, Eval, Include, YieldFrom, Yield, Print, TryGroup,
    Backticks, EncapsulatedVariableList, AnonymousClassDeclaration, New, identifier, Variables,
    NameList, ClassBody, PropertyDeclaration, PropertyDeclarationList, Scalar, ClassModifiers,
    ClassConstElement, ClassConstantDeclarationList, TypeDeclaration, CompoundStatement, ReservedNonModifier,
    InnerStatementList, MethodDeclaration, UseTraitStatement, TraitAdaptations,
    MethodReference, TraitPrecendence, TraitAlias, ClassDeclaration, TraitDeclaration, Expressions,
    InterfaceDeclaration, Variable, ArrayPairList, ClosureUseVariable, ClosureUseList,
    Clone, Heredoc, DoubleQuotes, EmptyStatement, IfList, If, While, DoWhile, Implements,
    ForExpressionList, For, Break, Continue, Return, GlobalVariableList, StaticVariableList,
    StaticVariable, Echo, Unset, Throw, Goto, Label, Foreach, Cases, Switch, MemberModifiers,
    Case, Declare, Try, Catch, CatchNameList, Finally, TernaryExpression, BinaryExpression,
    UnaryExpression, MagicConstant, Catches, FunctionBody, MethodBody, ExtendsClass, ExtendsInterfaces,
    EncapsulatedVariable, ErrorStaticMember, ErrorArgument, ErrorVariable, ErrorExpression, ErrorClassStatement,
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

    var recoverTopStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.Namespace, TokenType.Use, TokenType.HaltCompiler, TokenType.Const,
        TokenType.Function, TokenType.Class, TokenType.Abstract, TokenType.Final,
        TokenType.Trait, TokenType.Interface, TokenType.If, TokenType.While, TokenType.Do,
        TokenType.For, TokenType.Switch, TokenType.Break, TokenType.Continue, TokenType.Return,
        TokenType.Global, TokenType.Static, TokenType.Echo, TokenType.Text,
        TokenType.Unset, TokenType.ForEach, TokenType.Declare, TokenType.Try,
        TokenType.Throw, TokenType.Goto, ';'
    ];

    var recoverInnerStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.Function, TokenType.Abstract, TokenType.Final, TokenType.Class, TokenType.Trait,
        TokenType.Interface, TokenType.If, TokenType.While, TokenType.Do,
        TokenType.For, TokenType.Switch, TokenType.Break, TokenType.Continue, TokenType.Return,
        TokenType.Global, TokenType.Static, TokenType.Echo, TokenType.Text,
        TokenType.Unset, TokenType.ForEach, TokenType.Declare, TokenType.Try,
        TokenType.Throw, TokenType.Goto, ';'
    ];

    var recoverClassStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.Public, TokenType.Protected, TokenType.Private, TokenType.Static,
        TokenType.Abstract, TokenType.Final, TokenType.Function, TokenType.Var,
        TokenType.Const, TokenType.Use
    ];

    var parameterStartTokenTypes: (TokenType | string)[] = [
        '&', TokenType.Ellipsis, TokenType.VariableName, TokenType.Backslash,
        TokenType.Name, TokenType.Namespace, '?', TokenType.Array,
        TokenType.Callable
    ];

    var recoverStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.If, TokenType.While, TokenType.Do, TokenType.For, TokenType.Switch,
        TokenType.Break, TokenType.Continue, TokenType.Return, '{', ';',
        TokenType.Global, TokenType.Static, TokenType.Echo, TokenType.Text, TokenType.Unset,
        TokenType.ForEach, TokenType.Declare, TokenType.Try, TokenType.Throw, TokenType.Goto
    ];

    var foreachVariableStartTokenTypes: (TokenType | string)[] = [
        '&', TokenType.List,
        TokenType.VariableName, '$', '(', TokenType.Array, '[',
        TokenType.StringLiteral, TokenType.Static,
        TokenType.Name, TokenType.Namespace, TokenType.Backslash
    ];

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

    function phrase(
        func: any,
        args: any[],
        recoverSet?: (TokenType | string)[],
        startTokenTypes?: (TokenType | string)[]
    ) {

        // if recovering from parse error make sure that the parser will recover
        // at start of this phrase
        if (isRecovering && startTokenTypes && startTokenTypes.indexOf(peek().tokenType) < 0) {
            return;
        }

        let n = phraseStackTop<TempNode>(phraseStack);
        recoverSetStack.push(recoverSet);
        let node = func.call(func, ...args);
        recoverSetStack.pop();

        if (node) {
            n.children.push(node);
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
        if (isStatementStartToken(peek())) {
            p.children.push(statementList(TokenType.EndOfFile))
        }
        optional(TokenType.CloseTag);
        optional(TokenType.Text);
        return p;
    }

    function statementList(breakOn: TokenType) {

        let p = start(PhraseType.StatementList);
        let t: Token;

        while (true) {

            t = peek();
            if (isStatementStartToken(t)) {
                p.children.push(statement());
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                error(undefined, recover);
            }

        }

        return p;

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

    function isConstElementStartToken(t:Token){
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

    function expression(minPrecedence = 0) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        isBinaryOpPredicate = isVariableAndExpressionBinaryOp;
        let lhs = expressionAtom();
        let n: TempNode;

        while (true) {

            op = peek();

            if (!isBinaryOpPredicate(op)) {
                break;
            }

            n = start(PhraseType.BinaryExpression);
            n.children.push(lhs);

            [precedence, associativity] = opPrecedenceMap[op.text];

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }

            next(); //operator
            if (op.tokenType === '?') {
                lhs = ternaryExpression(n, precedence);
            } else {
                let rhs: any;
                if (op.tokenType === '=' && peek().tokenType === '&') {
                    n.children.push(unaryExpression());
                } else {
                    n.children.push(op.tokenType === TokenType.InstanceOf ? newVariable() : expression(precedence));
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
            case TokenType.T_DIR:
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

        if (!isExpressionStartToken(peek())) {
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
                start(PhraseType.Variable);
                next();
                n.children.push(end());
            }

        } else if (isExpressionStartToken(t)) {
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
            phrase(extendsClass, [], [TokenType.Implements, '{']);
        }

        if (peek().tokenType === TokenType.Implements) {
            phrase(implementsInterfaces, [], ['{']);
        }

        phrase(classBody, [], [], ['{']);
        return end();

    }

    function implementsInterfaces() {

        start(PhraseType.Implements);
        next(); //implements
        phrase(nameList, []);
        return end();

    }

    function classBody() {

        let n = start(PhraseType.ClassBody);
        let t: Token;
        let recover: (TokenType | string)[] = recoverClassStatementStartTokenTypes.slice(0);

        if (!expect('{')) {
            return end();
        }

        recover.push('}');

        while (true) {
            t = peek();

            if (t.tokenType === '}') {
                break;
            } else if (isClassStatementStartToken(t)) {
                phrase(classStatement, [], recover);
            } else {
                //error
                t = error(undefined, recover);
                if (!isClassStatementStartToken(t) && t.tokenType !== '}') {
                    break;
                }
            }

        }

        return end();

    }

    function isClassStatementStartToken(t: Token) {
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

    function classStatement() {

        let n = start(PhraseType.ErrorClassStatement);
        let t = peek();

        switch (t.tokenType) {
            case TokenType.Public:
            case TokenType.Protected:
            case TokenType.Private:
            case TokenType.Static:
            case TokenType.Abstract:
            case TokenType.Final:
                n.children.push(memberModifiers());
                t = peek();
                if (t.tokenType === TokenType.VariableName) {
                    return propertyDeclarationStatement(n);
                } else if (t.tokenType === TokenType.Function) {
                    return methodDeclaration(n);
                } else if (t.tokenType === TokenType.Const) {
                    return classConstantDeclarationStatement(n);
                } else {
                    //error
                    error();
                    return end();
                }
            case TokenType.Function:
                return methodDeclaration(n);
            case TokenType.Var:
                next();
                return propertyDeclarationStatement(n);
            case TokenType.Const:
                return classConstantDeclarationStatement(n);
            case TokenType.Use:
                return useTraitStatement();
            default:
                //error
                //should never get here
                throw new Error(`Unexpected token ${t.tokenType}`);

        }

    }

    function useTraitStatement() {

        start(PhraseType.UseTraitStatement);
        next();
        phrase(nameList, [], [';', '{']);
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
        phrase(nameList, [], [';']);
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
                return classDeclarationStatement();
            case TokenType.Trait:
                return traitDeclarationStatement();
            case TokenType.Interface:
                return interfaceDeclarationStatement();
            default:
                return statement();

        }

    }

    function interfaceDeclarationStatement() {

        let n = start(PhraseType.InterfaceDeclaration);
        next(); //interface
        expect(TokenType.Name, [TokenType.Extends, '{']);

        if (peek().tokenType === TokenType.Extends) {
            phrase(extendsInterfaces, [], ['{']);
        }

        phrase(classBody, [], [], ['{']);
        return end();

    }

    function extendsInterfaces() {

        let n = start(PhraseType.ExtendsInterfaces);
        next(); //extends
        n.children.push(nameList());
        return end();

    }

    function traitDeclarationStatement() {

        start(PhraseType.TraitDeclaration);
        next(); //trait
        expect(TokenType.Name, ['{']);
        phrase(classBody, [], [], ['{']);
        return end();
    }

    function functionDefinition() {

        let p = start(PhraseType.FunctionDefinition);
        p.children.push(functionDefinitionHeader(), compoundStatement());
        return p;

    }

    function functionDefinitionHeader(){

        let p = start(PhraseType.FunctionDefinitionHeader);

        next(); //function
        optional(TokenType.Ampersand);
        expect(TokenType.Name);
        expect(TokenType.OpenParenthesis);
        
        if(isParameterStart(peek())){
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

    function isParameterStart(t:Token){

        switch(t.tokenType){
            case TokenType.Ampersand:
            case TokenType.Ellipsis:
            case TokenType.VariableName:
                return true;
            default:
                return isTypeDeclarationStart(t);
        }

    }

    function classDeclarationStatement() {

        let n = start(PhraseType.ClassDeclaration);
        let t = peek();

        if (t.tokenType === TokenType.Abstract || t.tokenType === TokenType.Final) {
            n.children.push(classModifiers());
        }

        expect(TokenType.Class, [TokenType.Extends, TokenType.Implements, '{']);
        expect(TokenType.Name, [TokenType.Extends, TokenType.Implements, '{']);

        if (peek().tokenType === TokenType.Extends) {
            phrase(extendsClass, [], [TokenType.Implements, '{']);
        }

        if (peek().tokenType === TokenType.Implements) {
            phrase(implementsInterfaces, [], ['{']);
        }

        phrase(classBody, [], [], ['{']);
        return end();

    }

    function extendsClass() {
        let n = start(PhraseType.ExtendsClass);
        next(); //extends
        n.children.push(nameList());
        return end();
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
        
        if(isStatementStartToken(peek())){
            p.children.push(statementList(TokenType.CloseBrace));
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
                return classDeclarationStatement();
            case TokenType.Trait:
                return traitDeclarationStatement();
            case TokenType.Interface:
                return interfaceDeclarationStatement();
            case '{':
                return compoundStatement();
            case TokenType.If:
                return ifStatementList();
            case TokenType.While:
                return whileStatement();
            case TokenType.Do:
                return doWhileStatement();
            case TokenType.For:
                return forStatement();
            case TokenType.Switch:
                return switchStatement();
            case TokenType.Break:
                return keywordOptionalExpressionStatement(PhraseType.Break);
            case TokenType.Continue:
                return keywordOptionalExpressionStatement(PhraseType.Continue);
            case TokenType.Return:
                return keywordOptionalExpressionStatement(PhraseType.Return);
            case TokenType.Global:
                return globalVariableDeclarationStatement();
            case TokenType.Static:
                return staticVariableDeclarationStatement();
            case TokenType.Echo:
                return echoStatement();
            case TokenType.Text:
                return t;
            case TokenType.Unset:
                return unsetStatement();
            case TokenType.ForEach:
                return foreachStatement();
            case TokenType.Declare:
                return declareStatement();
            case TokenType.Try:
                return tryGroup();
            case TokenType.Throw:
                return throwStatement();
            case TokenType.Goto:
                return gotoStatement();
            case ';':
                start(PhraseType.EmptyStatement);
                next();
                return end();
            case TokenType.Name:
                if (peek(1).tokenType === ':') {
                    return labelStatement();
                }
            //fall though
            default:
                return expressionStatement();

        }

    }

    function tryGroup() {

        let n = start(PhraseType.TryGroup);
        phrase(tryStmt, [][TokenType.Catch, TokenType.Finally]);

        if (peek().tokenType === TokenType.Catch) {
            phrase(catches, [], [TokenType.Finally]);
        }

        if (peek().tokenType === TokenType.Finally) {
            phrase(finallyStatement, []);
        }

        return end();

    }

    function tryStmt() {
        let n = start(PhraseType.Try);
        next(); //try
        n.children.push(compoundStatement());
        return end();
    }

    function catches() {

        start(PhraseType.Catches);
        let recover = [TokenType.Catch];

        while (true) {

            if (peek().tokenType === TokenType.Catch) {
                phrase(catchStatement, [], recover);
            } else {
                break;
            }

        }

        return end();

    }

    function finallyStatement() {

        let n = start(PhraseType.Finally);
        next(); //T_FINALLY
        n.children.push(compoundStatement());
        return end();

    }

    function catchStatement() {

        start(PhraseType.Catch);
        next(); //catch

        if (!expect('(')) {
            return end();
        }

        phrase(catchNameList, [], [')', '{']);
        expect(TokenType.VariableName, [')', '{']);
        expect(')', [')', '{']);
        phrase(compoundStatement, [], ['{']);
        return end();

    }

    function catchNameList() {

        let n = start(PhraseType.NameList);
        let t: Token;

        while (true) {

            n.children.push(qualifiedName());
            t = peek();

            if (t.tokenType === '|') {
                next();
            } else if (t.tokenType === TokenType.VariableName) {
                break;
            } else {
                error();
                break;
            }

        }

        return end();

    }

    function declareStatement() {

        start(PhraseType.Declare);
        let recover = recoverStatementStartTokenTypes.slice(0);
        recover.push(':');
        next(); //declare

        if (!expect('(')) {
            return end();
        }

        phrase(constElements, [PhraseType.ConstElements, ')'], [')']);
        expect(')', recover);

        let t = peek();

        if (t.tokenType === ':') {

            next();
            phrase(innerStatementList, [[TokenType.EndDeclare]], [TokenType.EndDeclare, ';']);
            expect(TokenType.EndDeclare, [';']);
            expect(';', [';']);

        } else if (isStatementStartToken(t)) {
            phrase(statement, []);
        } else {
            error();
        }

        return end();

    }

    function switchStatement() {

        start(PhraseType.Switch);
        next(); //switch
        let recover = [':', '{', TokenType.Case, TokenType.Default, TokenType.EndSwitch];
        phrase(encapsulatedExpression, ['(', ')'], recover);
        expectOneOf(['{', ':'], recover);

        next(';');
        phrase(cases, [], ['}', TokenType.EndSwitch], [TokenType.Case, TokenType.Default]);
        let t = peek();

        if (t.tokenType === '}') {
            next();
        } else if (t.tokenType === TokenType.EndSwitch) {
            next();
            expect(';', [';']);
        } else {
            error(undefined, ['}', ';'], ['}', ';']);
        }

        return end();

    }

    function cases() {

        let n = start(PhraseType.Cases);
        let recover: (TokenType | string)[] = [TokenType.Case, TokenType.Default];
        let t: Token;
        let breakOn = ['}', TokenType.EndSwitch];

        while (true) {

            t = peek();

            if (t.tokenType === TokenType.Case || t.tokenType === TokenType.Default) {
                phrase(caseStatement, [], recover);
            } else if (breakOn.indexOf(t.tokenType) >= 0) {
                break;
            } else {
                //error
                let rec = [TokenType.Case, TokenType.Default, '}', TokenType.EndSwitch];
                if (rec.indexOf(error(undefined, rec).tokenType) >= 0) {
                    break;
                }
            }

        }

        return end();

    }

    function caseStatement() {

        let n = start(PhraseType.Case);
        let t = peek();

        if (t.tokenType === TokenType.Case) {
            next();
            phrase(expression, [0], [';', ':']);
        } else if (t.tokenType === TokenType.Default) {
            next();
        } else {
            //error
            //should never reach here
            throw new Error(`Unexpected token ${peek().tokenType}`);
        }

        expectOneOf([':', ';'], [...recoverInnerStatementStartTokenTypes, ':']);

        if (isInnerStatementStartToken(peek())) {
            phrase(innerStatementList, [['}', TokenType.EndSwitch, TokenType.Case, TokenType.Default]]);
        }

        return end();

    }

    function labelStatement() {

        let n = start(PhraseType.Label);
        //T_STRING, :
        next();
        next();
        return end();
    }

    function gotoStatement() {

        let n = start(PhraseType.Goto);
        next();
        expect(TokenType.Name, [';']);
        expect(';', [';']);
        return end();

    }

    function throwStatement() {

        let n = start(PhraseType.Throw);
        next(); //throw
        phrase(expression, [0], [';']);
        expect(';', [';']);
        return end();
    }

    function foreachStatement() {

        let n = start(PhraseType.Foreach);
        next(); //foreach

        if (!expect('(')) {
            return end();
        }

        let recover = [...recoverStatementStartTokenTypes, ':', ')', TokenType.FatArrow, TokenType.As];
        phrase(expression, [0], recover);
        recover.pop();
        expect(TokenType.As, recover);
        phrase(foreachVariable, [], recover, foreachVariableStartTokenTypes);
        recover.pop();

        if (next(TokenType.FatArrow)) {
            phrase(foreachVariable, [], recover);
        }

        recover.pop();
        expect(')', recover);

        let t = peek();

        if (t.tokenType === ':') {
            next();
            phrase(innerStatementList, [[TokenType.EndForeach]], [TokenType.EndForeach, ';']);
            expect(TokenType.EndForeach, [';']);
            expect(';', [';']);
        } else if (isStatementStartToken(t)) {
            phrase(statement, []);
        } else {
            //error
            error();
        }

        return end();

    }

    function foreachVariable() {

        switch (peek().tokenType) {

            case '&':
                let unary = start(PhraseType.UnaryExpression);
                next();
                unary.children.push(variable());
                return end();
            case TokenType.List:
                return listExpression();
            case '[':
                return shortArray();
            default:
                if (isVariableStartToken(peek())) {
                    return variable();
                } else {
                    //error
                    start(PhraseType.ErrorVariable);
                    error();
                    return end();
                }

        }

    }

    function isVariableStartToken(t: Token) {

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

    function unsetStatement() {

        let n = start(PhraseType.Unset);
        let t = next();

        if (!expect('(', [';'], [';'])) {
            return end();
        }

        phrase(variables, [], undefined, [';', ')']);
        expect(')', [')', ';']);
        expect(';', [';'], [';']);

        return end();

    }

    function variables() {

        start(PhraseType.Variables);
        let recover = [','];
        let t: Token;

        while (true) {

            phrase(variable, [], undefined, recover);
            t = peek();
            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                error();
                break;
            }

        }

        return end();

    }

    function echoStatement() {

        let n = tempNode(PhraseType.Echo);
        let t: Token;
        next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            recoverPush(followOn);
            n.children.push(expression());
            recoverPop();
            t = peek();

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

    function staticVariableDeclarationStatement() {

        let n = tempNode(PhraseType.StaticVariableList);
        let t: Token;
        next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            recoverPush(followOn);
            n.children.push(staticVariableDeclaration());
            recoverPop();
            t = peek();

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



    function globalVariableDeclarationStatement() {

        let n = tempNode(PhraseType.GlobalVariableList);
        let t = next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            recoverPush(followOn);
            n.children.push(simpleVariable());
            recoverPop();
            t = peek();

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

    function staticVariableDeclaration() {

        let n = tempNode(PhraseType.StaticVariable);

        if (peek().tokenType === TokenType.VariableName) {
            n.children.push(nodeFactory(next()));
        } else {
            n.children.push(nodeFactory(null), nodeFactory(null));
            error([TokenType.VariableName]);
            return node(n);
        }

        if (!expect('=')) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function keywordOptionalExpressionStatement(nodeType: PhraseType) {
        let n = tempNode(nodeType);
        next();

        if (isExpressionStartToken(peek())) {
            recoverPush([';']);
            n.children.push(expression());
            recoverPop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);
    }


    function forStatement() {

        let n = tempNode(PhraseType.For);
        next(); //for

        if (!expect('(')) {
            //error
            n.children.push(nodeFactory(null), nodeFactory(null),
                nodeFactory(null), nodeFactory(null));
            error(['(']);
            return node(n);
        }

        for (let k = 0; k < 2; ++k) {

            if (isExpressionStartToken(peek())) {
                recoverPush([';', ')']);
                n.children.push(forExpressionList(';'));
                recoverPop();
            } else {
                n.children.push(nodeFactory(null));
            }

            if (!expect(';')) {
                //error
                error([';'], [...recoverStatementStartTokenTypes, ':', ')']);
                break;
            }

        }

        if (isExpressionStartToken(peek())) {
            recoverPush([')']);
            n.children.push(expression());
            recoverPop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (!expect(')')) {
            //error
            error([')'], [...recoverStatementStartTokenTypes, ':']);
            expect(';');
        }

        if (expect(':')) {

            recoverPush([TokenType.EndFor, ';']);
            n.children.push(innerStatementList([TokenType.EndFor]));
            recoverPop();

            if (!next(TokenType.EndFor)) {
                //error
                error([TokenType.EndFor], [';']);
            }

            if (!expect(';')) {
                //error
                error([';'], [';']);
                expect(';');
            }
        } else if (isStatementStartToken(peek())) {
            n.children.push(statement());
        } else {
            //error
            error([]);
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function forExpressionList(breakOn: TokenType | string) {

        let n = tempNode(PhraseType.ForExpressionList);
        let followOn = [',', breakOn];
        let t: Token;

        while (true) {

            recoverPush(followOn);
            n.children.push(expression());
            recoverPop();

            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType == breakOn) {
                break;
            } else {
                //error
                error(followOn);
                break;
            }

        }

        return node(n);

    }

    function doWhileStatement() {

        let n = tempNode(PhraseType.DoWhile);
        next();

        recoverPush([TokenType.While, ';']);
        n.children.push(statement());
        recoverPop();

        if (!next(TokenType.While)) {
            //error
            n.children.push(nodeFactory(null));
            error([TokenType.While], [';']);
            expect(';');
            return node(n);
        }

        recoverPush([';']);
        n.children.push(encapsulatedExpression('(', ')'));
        recoverPop();

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);

    }

    function whileStatement() {

        let n = tempNode(PhraseType.While);
        next();

        let recover = recoverStatementStartTokenTypes.slice(0);
        recover.push(':');
        recoverPush(recover);
        n.children.push(encapsulatedExpression('(', ')'));
        recoverPop();

        if (expect(':')) {
            recoverPush([TokenType.EndWhile, ';']);
            n.children.push(innerStatementList([TokenType.EndWhile]));
            recoverPop();

            if (!next(TokenType.EndWhile)) {
                //error
                error([TokenType.EndWhile], [';']);
            }

            if (!expect(';')) {
                error([';'], [';']);
                expect(';');
            }
        } else if (isStatementStartToken(peek())) {
            n.children.push(statement());
        } else {
            //error
            error([]);
        }

        return node(n);

    }

    function ifStatementList() {

        let n = tempNode(PhraseType.IfList);
        let discoverAlt = { isAlt: false };
        let followOn = [TokenType.ElseIf, TokenType.Else, TokenType.EndIf];
        recoverPush(followOn);
        n.children.push(ifStatement(false, discoverAlt));
        recoverPop();
        let t: Token;

        recoverPush(followOn);
        while (true) {

            t = peek();

            if (t.tokenType === TokenType.ElseIf || t.tokenType === TokenType.Else) {
                n.children.push(ifStatement(discoverAlt.isAlt));
            } else {
                break;
            }

        }

        recoverPop();

        if (discoverAlt.isAlt) {

            if (!next(TokenType.EndIf)) {
                //error
                error([TokenType.EndIf], [';']);
            }

            if (!expect(';')) {
                //error
                error([';'], [';']);
                expect(';');
            }
        }

        return node(n);

    }

    function ifStatement(isAlt: boolean, discoverAlt: { isAlt: boolean } = null) {

        let n = tempNode(PhraseType.If);
        let t = peek();

        if (t.tokenType === TokenType.If || t.tokenType === TokenType.ElseIf) {

            let recover = recoverStatementStartTokenTypes.slice(0);
            recover.push(':');
            recoverPush(recover);
            n.children.push(encapsulatedExpression('(', ')'));
            recoverPop();

        } else if (t.tokenType === TokenType.Else) {
            next();
            n.children.push(nodeFactory(null));
        } else {
            throw new Error(`Unexpected token ${peek().tokenType}`);
        }

        if ((isAlt || discoverAlt) && expect(':')) {
            if (discoverAlt) {
                discoverAlt.isAlt = true;
            }

            n.children.push(innerStatementList([TokenType.EndIf, TokenType.ElseIf, TokenType.Else]));
        } else if (isStatementStartToken(peek())) {
            n.children.push(statement());
        } else {
            //error
            n.children.push(nodeFactory(null));
            error([]);
        }

        return node(n);

    }

    function expressionStatement() {

        let n = tempNode(PhraseType.ErrorExpression);
        recoverPush([';']);
        n.children.push(expression());
        recoverPop();

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
            return node(n);
        }

        return n.children.pop();

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

    function isExpressionStartToken(t: Token) {

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

    function propertyDeclarationStatement(n: TempNode) {

        let t: Token;
        n.value.phraseType = PhraseType.PropertyDeclarationList;
        let followOn = [';', ','];

        while (true) {

            recoverPush(followOn);
            n.children.push(propertyDeclaration());
            recoverPop();

            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                //error
                error([',', ';'], [';']);
                expect(';');
                break;
            }

        }

        return node(n);

    }

    function propertyDeclaration() {

        let n = tempNode(PhraseType.PropertyDeclaration);

        if (!next(TokenType.VariableName)) {
            //error
            error([TokenType.VariableName]);
            n.children.push(nodeFactory(null), nodeFactory(null));
            return node(n);
        }

        n.value.doc = lastDocComment();
        n.children.push(nodeFactory(current()));

        if (!expect('=')) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function memberModifiers() {

        let n = start(PhraseType.MemberModifiers);

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


    function nameList() {

        let n = tempNode(PhraseType.NameList);

        while (true) {
            n.children.push(qualifiedName());

            if (!expect(',')) {
                break;
            }
        }

        return node(n);

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
        
        if(peek().tokenType === TokenType.Equals){
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
                    if (count === 1 && variableAtomType !== PhraseType.Variable) {
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

        if (isExpressionStartToken(peek())) {
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
        return t.tokenType === TokenType.Ellipsis || isExpressionStartToken(t);
    }

    function argument() {

        let n = start(PhraseType.ErrorArgument);
        let t = peek();

        if (t.tokenType === TokenType.Ellipsis) {
            next();
            n.value.phraseType = PhraseType.Unary;
            n.children.push(expression());
            return node(n);
        } else if (isExpressionStartToken(t)) {
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

    function isQualifiedNameStartToken(t:Token){
        switch(t.tokenType){
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
        return t.tokenType === '&' || isExpressionStartToken(t);
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
            if (isExpressionStartToken(peek())) {
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
                variableAtomType = PhraseType.Variable;
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

        let n = tempNode(PhraseType.Variable);
        let t = peek();

        if (t.tokenType === TokenType.VariableName) {
            n.children.push(nodeFactory(next()));
        } else if (t.tokenType === '$') {
            next();
            t = peek();
            if (t.tokenType === '{') {
                n.children.push(encapsulatedExpression('{', '}'));
            } else if (t.tokenType === '$' || t.tokenType === TokenType.VariableName) {
                n.children.push(simpleVariable());
            } else {
                //error
                error(['{', '$', TokenType.VariableName]);
            }
        } else {
            //shouldnt get here
            throw new Error(`Unexpected token ${t.tokenType}`);
        }

        return node(n);

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
            isQualifiedNameStartToken,
            TokenType.Comma,
            TokenType.Semicolon));

        expect(TokenType.Semicolon);
        return p;

    }

    function namespaceUseClauseFunction(qName:Phrase){

        return () => {

            let p = start(PhraseType.NamespaceUseClause);

            if(qName){
                p.children.push(qName);
                qName = undefined;
            } else {
                p.children.push(qualifiedName());
            }

            if(peek().tokenType === TokenType.As){
                p.children.push(namespaceAliasingClause());
            }

            return p;

        };

    }

    function delimitedList(phraseType: PhraseType, elementFunction: () => Phrase,
        elementStartTokenPredicate: Predicate, delimeter: TokenType, breakOn: TokenType) {
        let p = start(phraseType);

        while (true) {

            n.children.push(elementFunction);
            t = peek();

            if (t.tokenType === delimeter) {
                next();
            } else if (t.tokenType === breakOn) {
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

    function isStatementStartToken(t: Token) {

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
                return isStatementStartToken(t);
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
                return isStatementStartToken(t);
        }
    }

    function isStatementStartToken(t: Token) {

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
                return isExpressionStartToken(t);
        }
    }

}
