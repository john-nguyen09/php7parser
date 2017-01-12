/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType, Position, Range } from './lexer';

export enum PhraseType {
    None, Error, TopStatements, Namespace, NamespaceName, UseDeclaration, UseStatement,
    UseGroup, UseList, HaltCompiler, ConstantDeclarationStatement, ConstantDeclaration,
    ConstantDeclarations, ArrayPair, Name, Call, Unpack, ArgumentList, Dimension, ClassConstant,
    StaticProperty, StaticMethodCall, MethodCall, Property, Closure, EncapsulatedExpression,
    ParameterList, Parameter, Isset, Empty, Eval, Include, YieldFrom, Yield, Print,
    Backticks, EncapsulatedVariableList, AnonymousClassDeclaration, New, identifier,
    NameList, ClassBody, PropertyDeclaration, PropertyDeclarationList, Scalar, ClassModifiers,
    ClassConstantDeclaration, ClassConstantDeclarationList, TypeExpression, Block, ReservedNonModifier,
    InnerStatementList, FunctionDeclaration, MethodDeclaration, UseTraitStatement, TraitAdaptations,
    MethodReference, TraitPrecendence, TraitAlias, ClassDeclaration, TraitDeclaration,
    InterfaceDeclaration, Variable, ArrayPairList, ClosureUseVariable, ClosureUseList,
    Clone, Heredoc, DoubleQuotes, EmptyStatement, IfList, If, While, DoWhile, Implements,
    ForExpressionList, For, Break, Continue, Return, GlobalVariableList, StaticVariableList,
    StaticVariable, Echo, Unset, Throw, Goto, Label, Foreach, CaseList, Switch, MemberModifiers,
    Case, Declare, Try, Catch, CatchNameList, Finally, TernaryExpression, BinaryExpression,
    UnaryExpression, MagicConstant, CatchList, FunctionBody, MethodBody, ExtendsClass, ExtendsInterfaces,
    EncapsulatedVariable, ErrorStaticMember, ErrorArgument, ErrorVariable, ErrorExpression, ErrorClassStatement,
    ErrorPropertyName, ErrorTraitAdaptation
}

export interface NodeFactory<T> {
    (value: Phrase | Token, children?: T[]): T;
}

export interface Phrase {
    phraseType: PhraseType;
    errors?: ParseError[];
}

export interface ParseError {
    unexpected: Token;
    expected?: (TokenType | string);
    skipped?: Token[];
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

    const enum OpType {
        None,
        Unary,
        Binary
    }

    var opPrecedenceMap: { [op: string]: [number, number, number] } = {
        'clone': [50, Associativity.None, OpType.Unary],
        'new': [50, Associativity.None, OpType.Unary],
        '[': [49, Associativity.Left, OpType.Unary],
        '**': [48, Associativity.Right, OpType.Binary],
        '++': [47, Associativity.Right, OpType.Unary],
        '--': [47, Associativity.Right, OpType.Unary],
        '@': [47, Associativity.Right, OpType.Unary],
        '~': [47, Associativity.Right, OpType.Unary],
        '(int)': [47, Associativity.Right, OpType.Unary],
        '(string)': [47, Associativity.Right, OpType.Unary],
        '(float)': [47, Associativity.Right, OpType.Unary],
        '(array)': [47, Associativity.Right, OpType.Unary],
        '(object)': [47, Associativity.Right, OpType.Unary],
        '(bool)': [47, Associativity.Right, OpType.Unary],
        'instanceof': [46, Associativity.None, OpType.Binary],
        '!': [45, Associativity.Right, OpType.Unary],
        '*': [44, Associativity.Left, OpType.Binary],
        '/': [44, Associativity.Left, OpType.Binary],
        '%': [44, Associativity.Left, OpType.Binary],
        '+': [43, Associativity.Left, OpType.Binary | OpType.Unary],
        '-': [43, Associativity.Left, OpType.Binary | OpType.Unary],
        '.': [43, Associativity.Left, OpType.Binary],
        '<<': [42, Associativity.Left, OpType.Binary],
        '>>': [42, Associativity.Left, OpType.Binary],
        '<': [41, Associativity.None, OpType.Binary],
        '>': [41, Associativity.None, OpType.Binary],
        '<=': [41, Associativity.None, OpType.Binary],
        '>=': [41, Associativity.None, OpType.Binary],
        '==': [40, Associativity.None, OpType.Binary],
        '===': [40, Associativity.None, OpType.Binary],
        '!=': [40, Associativity.None, OpType.Binary],
        '!==': [40, Associativity.None, OpType.Binary],
        '<>': [40, Associativity.None, OpType.Binary],
        '<=>': [40, Associativity.None, OpType.Binary],
        '&': [39, Associativity.Left, OpType.Binary | OpType.Unary],
        '^': [38, Associativity.Left, OpType.Binary],
        '|': [37, Associativity.Left, OpType.Binary],
        '&&': [36, Associativity.Left, OpType.Binary],
        '||': [35, Associativity.Left, OpType.Binary],
        '??': [34, Associativity.Right, OpType.Binary],
        '?': [33, Associativity.Left, OpType.Binary], //?: ternary
        ':': [33, Associativity.Left, OpType.Binary], //?: ternary
        '=': [32, Associativity.Right, OpType.Binary],
        '.=': [32, Associativity.Right, OpType.Binary],
        '+=': [32, Associativity.Right, OpType.Binary],
        '-=': [32, Associativity.Right, OpType.Binary],
        '*=': [32, Associativity.Right, OpType.Binary],
        '/=': [32, Associativity.Right, OpType.Binary],
        '%=': [32, Associativity.Right, OpType.Binary],
        '**=': [32, Associativity.Right, OpType.Binary],
        '&=': [32, Associativity.Right, OpType.Binary],
        '|=': [32, Associativity.Right, OpType.Binary],
        '^=': [32, Associativity.Right, OpType.Binary],
        '<<=': [32, Associativity.Right, OpType.Binary],
        '>>=': [32, Associativity.Right, OpType.Binary],
        'and': [31, Associativity.Left, OpType.Binary],
        'xor': [30, Associativity.Left, OpType.Binary],
        'or': [29, Associativity.Left, OpType.Binary],
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
            case TokenType.T_POW:
            case TokenType.T_SL:
            case TokenType.T_SR:
            case TokenType.T_BOOLEAN_AND:
            case TokenType.T_BOOLEAN_OR:
            case TokenType.T_LOGICAL_AND:
            case TokenType.T_LOGICAL_OR:
            case TokenType.T_LOGICAL_XOR:
            case TokenType.T_IS_IDENTICAL:
            case TokenType.T_IS_NOT_IDENTICAL:
            case TokenType.T_IS_EQUAL:
            case TokenType.T_IS_NOT_EQUAL:
            case '<':
            case TokenType.T_IS_SMALLER_OR_EQUAL:
            case '>':
            case TokenType.T_IS_GREATER_OR_EQUAL:
            case TokenType.T_SPACESHIP:
            case TokenType.T_COALESCE:
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
            case TokenType.T_PLUS_EQUAL:
            case TokenType.T_MINUS_EQUAL:
            case TokenType.T_MUL_EQUAL:
            case TokenType.T_POW_EQUAL:
            case TokenType.T_DIV_EQUAL:
            case TokenType.T_CONCAT_EQUAL:
            case TokenType.T_MOD_EQUAL:
            case TokenType.T_AND_EQUAL:
            case TokenType.T_OR_EQUAL:
            case TokenType.T_XOR_EQUAL:
            case TokenType.T_SL_EQUAL:
            case TokenType.T_SR_EQUAL:
                return true;
            default:
                return false;
        }
    }

    interface TempNode {
        phrase: Phrase;
        children: any[];
    }

    var recoverTopStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.T_NAMESPACE, TokenType.T_USE, TokenType.T_HALT_COMPILER, TokenType.T_CONST,
        TokenType.T_FUNCTION, TokenType.T_CLASS, TokenType.T_ABSTRACT, TokenType.T_FINAL,
        TokenType.T_TRAIT, TokenType.T_INTERFACE, TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO,
        TokenType.T_FOR, TokenType.T_SWITCH, TokenType.T_BREAK, TokenType.T_CONTINUE, TokenType.T_RETURN,
        TokenType.T_GLOBAL, TokenType.T_STATIC, TokenType.T_ECHO, TokenType.T_INLINE_HTML,
        TokenType.T_UNSET, TokenType.T_FOREACH, TokenType.T_DECLARE, TokenType.T_TRY,
        TokenType.T_THROW, TokenType.T_GOTO, ';'
    ];

    var recoverInnerStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.T_FUNCTION, TokenType.T_ABSTRACT, TokenType.T_FINAL, TokenType.T_CLASS, TokenType.T_TRAIT,
        TokenType.T_INTERFACE, TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO,
        TokenType.T_FOR, TokenType.T_SWITCH, TokenType.T_BREAK, TokenType.T_CONTINUE, TokenType.T_RETURN,
        TokenType.T_GLOBAL, TokenType.T_STATIC, TokenType.T_ECHO, TokenType.T_INLINE_HTML,
        TokenType.T_UNSET, TokenType.T_FOREACH, TokenType.T_DECLARE, TokenType.T_TRY,
        TokenType.T_THROW, TokenType.T_GOTO, ';'
    ];

    var recoverClassStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.T_PUBLIC, TokenType.T_PROTECTED, TokenType.T_PRIVATE, TokenType.T_STATIC,
        TokenType.T_ABSTRACT, TokenType.T_FINAL, TokenType.T_FUNCTION, TokenType.T_VAR,
        TokenType.T_CONST, TokenType.T_USE
    ];

    var parameterStartTokenTypes: (TokenType | string)[] = [
        '&', TokenType.T_ELLIPSIS, TokenType.T_VARIABLE, TokenType.T_NS_SEPARATOR,
        TokenType.T_STRING, TokenType.T_NAMESPACE, '?', TokenType.T_ARRAY,
        TokenType.T_CALLABLE
    ];

    var recoverStatementStartTokenTypes: (TokenType | string)[] = [
        TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO, TokenType.T_FOR, TokenType.T_SWITCH,
        TokenType.T_BREAK, TokenType.T_CONTINUE, TokenType.T_RETURN, '{', ';',
        TokenType.T_GLOBAL, TokenType.T_STATIC, TokenType.T_ECHO, TokenType.T_INLINE_HTML, TokenType.T_UNSET,
        TokenType.T_FOREACH, TokenType.T_DECLARE, TokenType.T_TRY, TokenType.T_THROW, TokenType.T_GOTO
    ];

    var endToken: Token = {
        tokenType: TokenType.T_EOF,
        index: -1,
        text: null,
        mode: null,
        range: null
    };

    export var nodeFactory: NodeFactory<any>;
    var tokens: Token[];
    var recoverSetStack: (TokenType | string)[][];
    var isBinaryOpPredicate: Predicate;
    var variableAtomType: PhraseType;
    var pos: number;
    var tempNodeStack: TempNode[];
    var isRecovering = false;

    export function parse<T>(tokenArray: Token[]): T {

        assertNodeFactory();
        tokens = tokenArray;
        pos = -1;
        tempNodeStack = [];

        if (!tokenArray.length) {
            return null;
        }

        return topStatements(TokenType.T_EOF);

    }

    function assertNodeFactory() {
        if (typeof nodeFactory !== 'function') {
            throw new Error('Invalid operation -- nodeFactory');
        }
    }

    function start(phraseType?: PhraseType) {
        //parent node gets hidden tokens between children
        hidden();

        let node: TempNode = {
            phrase: {
                phraseType: phraseType
            },
            children: []
        };

        tempNodeStack.push(node);
        return node;
    }

    function end() {
        let node = tempNodeStack.pop();
        return nodeFactory(node.phrase, node.children);
    }

    function hidden() {

        let node = top<TempNode>(tempNodeStack);

        while (pos < tokens.length - 1 && isHidden(tokens[pos + 1])) {
            ++pos;
            node.children.push(nodeFactory(tokens[pos]));
        }
    }

    function current() {
        return pos >= 0 ? tokens[pos] : null;
    }

    function next(tokenType?: TokenType | string): Token {

        if (tokenType) {
            if (tokenType !== peek().tokenType) {
                return null;
            } else {
                isRecovering = false;
            }
        }

        if (pos === tokens.length - 1) {
            return endToken;
        }

        ++pos;
        let node = top<TempNode>(tempNodeStack);
        node.children.push(nodeFactory(tokens[pos]));

        if (isHidden(tokens[pos])) {
            return this.next();
        }

        return tokens[pos];

    }

    function expect(tokenType: TokenType | string, 
        phraseRecoverSet?: (TokenType | string)[], 
        recoverAndDiscard?:TokenType|string) {
        if (peek().tokenType === tokenType) {
            isRecovering = false;
            return next();
        }
        //Dont report errors if recovering from another error
        else if (!isRecovering) {
            error(tokenType, phraseRecoverSet, recoverAndDiscard);
        }

        return null;
    }

    function peek(n = 0) {

        let k = n + 1
        let peekPos = pos;

        while (k) {
            if (++peekPos < tokens.length) {
                if (!isHidden(tokens[peekPos])) {
                    --k;
                }
            } else {
                return endToken;
            }
        }

        return tokens[peekPos];
    }

    function skip(until: (TokenType | string)[]) {

        let t: Token;
        let skipped: Token[] = [];

        while (true) {
            t = peek();
            if (until.indexOf(t.tokenType) >= 0 || t.tokenType === TokenType.T_EOF) {
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
            case TokenType.T_DOC_COMMENT:
            case TokenType.T_WHITESPACE:
            case TokenType.T_COMMENT:
            case TokenType.T_OPEN_TAG:
            case TokenType.T_OPEN_TAG_WITH_ECHO:
            case TokenType.T_CLOSE_TAG:
                return true;
            default:
                return false;
        }
    }

    function phrase(func: any, args: any[], startTokenTypes?: (TokenType | string)[], recoverSet?: (TokenType | string)[]) {

        // if recovering from parse error make sure that the parser will recover
        // at start of this phrase
        if (isRecovering && startTokenTypes && startTokenTypes.indexOf(peek().tokenType) < 0) {
            return;
        }

        let n = top<TempNode>(tempNodeStack);
        recoverSetStack.push(recoverSet);
        let node = func.call(func, ...args);
        recoverSetStack.pop();
        n.children.push(node);

    }

    function error(expected?: (TokenType | string), phraseRecoverSet?: (TokenType | string)[], recoverAndSkip?: TokenType | string) {

        let tempNode = top<TempNode>(tempNodeStack);
        let unexpected = peek();
        let n = recoverSetStack.length;
        let syncTokens = phraseRecoverSet ? phraseRecoverSet.slice(0) : [];

        while (n--) {
            Array.prototype.push.apply(syncTokens, recoverSetStack[n]);
        }

        let skipped = skip(syncTokens);
        if (recoverAndSkip && peek().tokenType === recoverAndSkip) {
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

    function top<T>(array: T[]) {
        return array.length ? array[array.length - 1] : null;
    }

    function topStatements(breakOn: TokenType | string) {

        let n = start(PhraseType.TopStatements);
        let t: Token;
        let recover = recoverTopStatementStartTokenTypes.slice(0);
        recover.push(breakOn);

        while (true) {

            t = peek();
            if (isTopStatementStartToken(t)) {
                phrase(topStatement, [], undefined, recover);
            } else if (t.tokenType === breakOn) {
                break;
            } else if (error(undefined, recover).tokenType === TokenType.T_EOF) {
                break;
            }

        }

        return end();

    }

    function topStatement() {

        let t = peek();

        switch (t.tokenType) {
            case TokenType.T_NAMESPACE:
                return namespaceStatement();
            case TokenType.T_USE:
                return useStatement();
            case TokenType.T_HALT_COMPILER:
                return haltCompilerStatement();
            case TokenType.T_CONST:
                return constantDeclarationStatement();
            case TokenType.T_FUNCTION:
                return functionDeclaration();
            case TokenType.T_CLASS:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                return classDeclarationStatement();
            case TokenType.T_TRAIT:
                return traitDeclarationStatement();
            case TokenType.T_INTERFACE:
                return interfaceDeclarationStatement();
            default:
                return statement();
        }

    }

    function constantDeclarationStatement() {

        start(PhraseType.ConstantDeclarationStatement);
        next(); //const
        phrase(constantDeclarations, [PhraseType.ConstantDeclarations], [TokenType.T_STRING], [';']);
        expect(';', [';'], ';');
        return end();

    }

    function constantDeclarations(type: PhraseType) {

        let recover: (TokenType | string)[] = [','];
        let t: Token;
        let func = type === PhraseType.ConstantDeclarations ?
                constantDeclaration : classConstantDeclaration;
            
        start(type);

        while (true) {

            phrase(func, [], [TokenType.T_STRING], recover);
            t = peek();
            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                break;
            } else {
                error();
                break;
            }
        }

        return end();

    }

    function constantDeclaration() {

        let t: Token;

        start(PhraseType.ConstantDeclaration);

        if (!expect(TokenType.T_STRING) || !expect('=')) {
            return end();
        }

        phrase(expression, [0]);
        return end();

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
                    n.children.push(op.tokenType === TokenType.T_INSTANCEOF ? newVariable() : expression(precedence));
                }
                lhs = end();
            }

        }

        return lhs;

    }

    function ternaryExpression(n: TempNode, precedence: number) {

        n.phrase.phraseType = PhraseType.TernaryExpression;

        if (!expect(':')) {
            recoverPush([':']);
            n.children.push(expression(precedence));
            recoverPop();

            if (!expect(':')) {
                return end();
            }

        }

        n.children.push(expression(precedence));
        return end();

    }

    function variableCheckForPostUnaryExpression() {
        isBinaryOpPredicate = isBinaryOp;
        let variableNode = variable();
        let t = peek();
        //post inc/dec
        if (t.tokenType === TokenType.T_INC || t.tokenType === TokenType.T_DEC) {
            let unary = start(PhraseType.UnaryExpression);
            unary.children.push(variableNode);
            next();
            unary.children.push(variableNode);
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
            case TokenType.T_STATIC:
                if (peek(1).tokenType === TokenType.T_FUNCTION) {
                    return closure();
                } else {
                    return variableCheckForPostUnaryExpression();
                }
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
                let derefToken = peek(1);
                if (derefToken.tokenType === '[' || derefToken.tokenType === '{' ||
                    derefToken.tokenType === TokenType.T_OBJECT_OPERATOR || derefToken.tokenType === '(') {
                    return variableCheckForPostUnaryExpression();
                } else {
                    return scalar();
                }
            case TokenType.T_VARIABLE:
            case '$':
            case TokenType.T_ARRAY:
            case '[':
            case TokenType.T_NS_SEPARATOR:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case '(':
                return variableCheckForPostUnaryExpression();
            case TokenType.T_INC:
            case TokenType.T_DEC:
            case '+':
            case '-':
            case '!':
            case '~':
            case '@':
            case TokenType.T_INT_CAST:
            case TokenType.T_DOUBLE_CAST:
            case TokenType.T_STRING_CAST:
            case TokenType.T_ARRAY_CAST:
            case TokenType.T_OBJECT_CAST:
            case TokenType.T_BOOL_CAST:
            case TokenType.T_UNSET_CAST:
                return unaryExpression();
            case TokenType.T_LIST:
                isBinaryOpPredicate = isAssignBinaryOp;
                return listExpression();
            case TokenType.T_CLONE:
                return cloneExpression();
            case TokenType.T_NEW:
                return newExpression();
            case TokenType.T_DNUMBER:
            case TokenType.T_LNUMBER:
                return scalar();
            case TokenType.T_LINE:
            case TokenType.T_FILE:
            case TokenType.T_DIR:
            case TokenType.T_TRAIT_C:
            case TokenType.T_METHOD_C:
            case TokenType.T_FUNC_C:
            case TokenType.T_NS_C:
            case TokenType.T_CLASS_C:
                return magicConstant();
            case TokenType.T_START_HEREDOC:
                return heredoc();
            case '"':
                return quotedEncapsulatedVariableList(PhraseType.DoubleQuotes, '"');
            case '`':
                return quotedEncapsulatedVariableList(PhraseType.Backticks, '`');
            case TokenType.T_PRINT:
                return keywordExpression(PhraseType.Print);
            case TokenType.T_YIELD:
                return yieldExpression();
            case TokenType.T_YIELD_FROM:
                return keywordExpression(PhraseType.YieldFrom);
            case TokenType.T_FUNCTION:
                return closure();
            case TokenType.T_INCLUDE:
            case TokenType.T_INCLUDE_ONCE:
            case TokenType.T_REQUIRE:
            case TokenType.T_REQUIRE_ONCE:
                return keywordExpression(PhraseType.Include);
            case TokenType.T_EVAL:
                return keywordParenthesisedExpression(PhraseType.Eval);
            case TokenType.T_EMPTY:
                return keywordParenthesisedExpression(PhraseType.Empty);
            case TokenType.T_ISSET:
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
        let t = next(); //isset

        if (!expect('(')) {
            return end();
        }

        let recover: (TokenType | string)[] = [',', ')'];

        while (true) {

            phrase(expression, [0], undefined, recover);
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                next();
                break;
            } else {
                //error
                error(undefined, [')'], ')');
                break;
            }

        }

        return end();

    }

    function keywordParenthesisedExpression(type: PhraseType) {

        start(type);
        next(); //keyword
        phrase(encapsulatedExpression, ['(', ')']);
        return end();

    }

    function keywordExpression(nodeType: PhraseType) {

        let n = start(nodeType);
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

        phrase(expression, [0], undefined, [TokenType.T_DOUBLE_ARROW]);

        if (peek().tokenType !== TokenType.T_DOUBLE_ARROW) {
            return end();
        }

        phrase(expression, [0]);
        return end();

    }

    function quotedEncapsulatedVariableList(type: PhraseType, closeTokenType: TokenType | string) {

        start(type);
        next(); //open encaps
        phrase(encapsulatedVariableList, [closeTokenType], undefined, [closeTokenType]);
        expect(closeTokenType, [closeTokenType], closeTokenType);
        return end();

    }

    function encapsulatedVariableList(breakOn: TokenType | string) {

        let n = start(PhraseType.EncapsulatedVariableList);
        let recover: (TokenType | string)[] = [
            TokenType.T_ENCAPSED_AND_WHITESPACE, TokenType.T_VARIABLE,
            TokenType.T_DOLLAR_OPEN_CURLY_BRACES, TokenType.T_CURLY_OPEN, breakOn
        ];

        recoverPush(recover);
        while (true) {

            switch (peek().tokenType) {
                case TokenType.T_ENCAPSED_AND_WHITESPACE:
                    next();
                    continue;
                case TokenType.T_VARIABLE:
                    let t = peek(1);
                    if (t.tokenType === '[') {
                        n.children.push(encapsulatedDimension());
                    } else if (t.tokenType === TokenType.T_OBJECT_OPERATOR) {
                        n.children.push(encapsulatedProperty());
                    } else {
                        n.children.push(simpleVariable());
                    }
                    continue;
                case TokenType.T_DOLLAR_OPEN_CURLY_BRACES:
                    n.children.push(dollarCurlyOpenEncapsulatedVariable());
                    continue;
                case TokenType.T_CURLY_OPEN:
                    n.children.push(curlyOpenEncapsulatedVariable());
                    continue;
                case breakOn:
                    break;
                default:
                    //error
                    if (recover.indexOf(error().tokenType) === -1) {
                        break;
                    }
            }

            break;

        }

        recoverPop();
        return end();

    }

    function curlyOpenEncapsulatedVariable() {

        let n = start(PhraseType.EncapsulatedVariable);
        next();
        recoverPush(['}']);
        n.children.push(variable());
        recoverPop();

        if (!expect('}') && current().tokenType === '}') {
            discard();
        }

        return end();

    }

    function dollarCurlyOpenEncapsulatedVariable() {

        let n = start(PhraseType.EncapsulatedVariable);
        next(); //${
        let t = peek();

        if (t.tokenType === TokenType.T_STRING_VARNAME) {

            if (peek(1).tokenType === '[') {
                recoverPush(['}']);
                n.children.push(dollarCurlyEncapsulatedDimension());
                recoverPop();

            } else {
                let v = start(PhraseType.Variable);
                next();
                n.children.push(end());
            }

        } else if (isExpressionStartToken(t)) {
            recoverPush(['}']);
            n.children.push(expression());
            recoverPop();
        } else {
            //error
            error(undefined, ['}']);
        }

        if (!expect('}', ['}']) && current().tokenType === '}') {
            discard();
        }

        return end();
    }

    function dollarCurlyEncapsulatedDimension() {
        let n = start(PhraseType.Dimension);
        next(); //T_STRING_VARNAME
        next(); // [ 
        recoverPush([']']);
        n.children.push(expression());
        recoverPop();
        if (!expect(']', [']']) && current().tokenType === ']') {
            discard();
        }
        return end();
    }

    function encapsulatedDimension() {

        let n = start(PhraseType.Dimension);
        n.children.push(simpleVariable());

        //will always be [
        next();

        recoverPush([']']);

        switch (peek().tokenType) {
            case TokenType.T_STRING:
            case TokenType.T_NUM_STRING:
                next();
                break;
            case TokenType.T_VARIABLE:
                n.children.push(simpleVariable());
                break;
            case '-':
                let unary = start(PhraseType.UnaryExpression);
                next(); //-
                expect(TokenType.T_NUM_STRING);
                n.children.push(end());
                break;
            default:
                //error
                error();
                break;
        }

        recoverPop();

        if (!expect(']', [']']) && current().tokenType === ']') {
            discard();
        }

        return end();

    }

    function encapsulatedProperty() {
        let n = start(PhraseType.Property);
        n.children.push(simpleVariable());

        // will always be TokenType.T_OBJECT_OPERATOR
        next();
        expect(TokenType.T_STRING);
        return end();
    }

    function heredoc() {

        let n = start(PhraseType.Heredoc);
        next();

        recoverPush([TokenType.T_END_HEREDOC]);
        n.children.push(encapsulatedVariableList(TokenType.T_END_HEREDOC));
        recoverPop();

        if (!expect(TokenType.T_END_HEREDOC, [TokenType.T_END_HEREDOC]) &&
            current().tokenType === TokenType.T_END_HEREDOC) {
            discard();
        }

        return end();

    }

    function anonymousClassDeclaration() {

        let n = start(PhraseType.AnonymousClassDeclaration);
        next();

        if (peek().tokenType === '(') {
            recoverPush([TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
            n.children.push(argumentList());
            recoverPop();
        }

        if (peek().tokenType === TokenType.T_EXTENDS) {
            recoverPush([TokenType.T_IMPLEMENTS, '{']);
            n.children.push(extendsClass());
            recoverPop();
        }

        if (peek().tokenType === TokenType.T_IMPLEMENTS) {
            recoverPush(['{']);
            n.children.push(implementsInterfaces());
            recoverPop();
        }

        n.children.push(classBody());
        return end();

    }

    function implementsInterfaces() {

        let n = start(PhraseType.Implements);
        next();
        n.children.push(nameList());
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
                recoverPush(recover);
                n.children.push(classStatement());
                recoverPop();
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
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_FUNCTION:
            case TokenType.T_VAR:
            case TokenType.T_CONST:
            case TokenType.T_USE:
                return true;
            default:
                return false;
        }
    }

    function classStatement() {

        let n = start(PhraseType.ErrorClassStatement);
        let t = peek();

        switch (t.tokenType) {
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                n.children.push(memberModifiers());
                t = peek();
                if (t.tokenType === TokenType.T_VARIABLE) {
                    return propertyDeclarationStatement(n);
                } else if (t.tokenType === TokenType.T_FUNCTION) {
                    return methodDeclaration(n);
                } else if (t.tokenType === TokenType.T_CONST) {
                    return classConstantDeclarationStatement(n);
                } else {
                    //error
                    error();
                    return end();
                }
            case TokenType.T_FUNCTION:
                return methodDeclaration(n);
            case TokenType.T_VAR:
                next();
                return propertyDeclarationStatement(n);
            case TokenType.T_CONST:
                return classConstantDeclarationStatement(n);
            case TokenType.T_USE:
                return useTraitStatement();
            default:
                //error
                //should never get here
                throw new Error(`Unexpected token ${t.tokenType}`);

        }

    }

    function useTraitStatement() {

        let n = start(PhraseType.UseTraitStatement);
        next();
        recoverPush([';', '{']);
        n.children.push(nameList());
        recoverPop();
        n.children.push(traitAdaptationList());
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

        recoverPush(['}']);

        while (true) {

            t = peek();

            if (t.tokenType === '}') {
                next();
                break;
            } else if (t.tokenType === TokenType.T_STRING ||
                t.tokenType === TokenType.T_NAMESPACE ||
                t.tokenType === TokenType.T_NS_SEPARATOR ||
                isSemiReservedToken(t)) {
                n.children.push(traitAdaptation());
            } else {
                //error
                t = error();
                if (t.tokenType !== '}') {
                    break;
                }
            }

        }

        recoverPop();
        return end();

    }

    function traitAdaptation() {

        let n = start(PhraseType.ErrorTraitAdaptation);
        let t = peek();
        let t2 = peek(1);

        if (t.tokenType === TokenType.T_NAMESPACE ||
            t.tokenType === TokenType.T_NS_SEPARATOR ||
            (t.tokenType === TokenType.T_STRING &&
                (t2.tokenType === TokenType.T_PAAMAYIM_NEKUDOTAYIM || t2.tokenType === TokenType.T_NS_SEPARATOR))) {

            recoverPush([TokenType.T_INSTEADOF, TokenType.T_AS]);
            n.children.push(methodReference());
            recoverPop();

            if (peek().tokenType === TokenType.T_INSTEADOF) {
                next();
                return traitPrecedence(n);
            }

        } else if (t.tokenType === TokenType.T_STRING || isSemiReservedToken(t)) {

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

        if (!expect(TokenType.T_AS)) {
            return end();
        }

        let t = peek();

        if (t.tokenType === TokenType.T_STRING) {
            next();
        } else if (isReservedToken(t)) {
            n.children.push(reservedNonModifier());
        } else if (isMemberModifier(t)) {
            next();
            t = peek();
            if (t.tokenType === TokenType.T_STRING || isSemiReservedToken(t)) {
                n.children.push(identifier);
            }
        } else {
            //error
            error();
            return end();
        }

        if (!expect(';', [';']) && current().tokenType === ';') {
            discard();
        }

        return end();

    }

    function reservedNonModifier() {
        let n = start(PhraseType.ReservedNonModifier);
        next();
        return end();
    }

    function traitPrecedence(n: TempNode) {

        n.phrase.phraseType = PhraseType.TraitPrecendence;
        recoverPush([';']);
        n.children.push(nameList());
        recoverPop();

        if (!expect(';', [';']) && current().tokenType === ';') {
            discard();
        }

        return end();

    }

    function methodReference() {

        let n = start(PhraseType.MethodReference);

        recoverPush([TokenType.T_PAAMAYIM_NEKUDOTAYIM]);
        n.children.push(name());
        recoverPop();

        if (!expect(TokenType.T_PAAMAYIM_NEKUDOTAYIM)) {
            return end();
        }

        n.children.push(identifier());
        return end();

    }

    function methodDeclaration(n: TempNode) {

        n.phrase.phraseType = PhraseType.MethodDeclaration;
        next(); //T_FUNCTION
        next('&'); //returns ref

        recoverPush([';', ':', '{', '(']);
        n.children.push(identifier());
        recoverPop();

        recoverPush([':', ';', '{']);
        n.children.push(parameterList());
        recoverPop();

        if (peek().tokenType === ':') {
            n.children.push(returnType());
        }

        n.children.push(methodBody());
        return end();

    }

    function methodBody() {
        let n = start();
        if (peek().tokenType === ';') {
            next();
        } else {
            n.children.push(block(PhraseType.MethodBody));
        }
        return end();
    }

    function identifier() {
        let n = start(PhraseType.identifier);
        let t = peek();
        if (t.tokenType === TokenType.T_STRING || isSemiReservedToken(t)) {
            next();
        } else {
            error();
        }
        return end();
    }

    function innerStatementList(breakOn: (TokenType | string)[]) {

        let n = start(PhraseType.InnerStatementList);
        let t: Token;
        let followOn = recoverInnerStatementStartTokenTypes;

        while (true) {

            t = peek();

            if (isInnerStatementStartToken(t)) {
                recoverPush(followOn);
                n.children.push(innerStatement());
                recoverPop();
            } else if (breakOn.indexOf(t.tokenType) >= 0) {
                break;
            } else {
                //error
                t = error(undefined, followOn);
                if (t.tokenType === ';') {
                    discard();
                } else if (!isInnerStatementStartToken(t) && breakOn.indexOf(t.tokenType) < 0) {
                    break;
                }
            }
        }

        return end();

    }

    function innerStatement() {

        switch (peek().tokenType) {
            case TokenType.T_FUNCTION:
                return functionDeclaration();
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_CLASS:
                return classDeclarationStatement();
            case TokenType.T_TRAIT:
                return traitDeclarationStatement();
            case TokenType.T_INTERFACE:
                return interfaceDeclarationStatement();
            default:
                return statement();

        }

    }

    function interfaceDeclarationStatement() {

        let n = start(PhraseType.InterfaceDeclaration);
        next(); //interface
        expect(TokenType.T_STRING, [TokenType.T_EXTENDS, '{']);

        if (peek().tokenType === TokenType.T_EXTENDS) {
            recoverPush(['{']);
            n.children.push(extendsInterfaces());
            recoverPop();
        }

        n.children.push(classBody());
        return end();

    }

    function extendsInterfaces() {

        let n = start(PhraseType.ExtendsInterfaces);
        next(); //extends
        n.children.push(nameList());
        return end();

    }

    function traitDeclarationStatement() {

        let n = start(PhraseType.TraitDeclaration);
        next(); //trait

        if (!expect(TokenType.T_STRING)) {
            return end();
        }

        recoverPush(['}']);
        n.children.push(classBody());
        recoverPop();

        return end();
    }

    function functionDeclaration() {

        let n = start(PhraseType.FunctionDeclaration);
        next(); //T_FUNCTION
        next('&');
        expect(TokenType.T_STRING, ['(', ':', '{']);

        recoverPush([':', '{']);
        n.children.push(parameterList());
        recoverPop();

        if (peek().tokenType === ':') {
            recoverPush(['{']);
            n.children.push(returnType());
            recoverPop();
        }

        n.children.push(block(PhraseType.FunctionBody));
        return end();

    }

    function classDeclarationStatement() {

        let n = start(PhraseType.ClassDeclaration);
        let t = peek();

        if (t.tokenType === TokenType.T_ABSTRACT || t.tokenType === TokenType.T_FINAL) {
            n.children.push(classModifiers());
        }

        expect(TokenType.T_CLASS, [TokenType.T_STRING, TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
        expect(TokenType.T_STRING, [TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);

        if (peek().tokenType === TokenType.T_EXTENDS) {
            recoverPush([TokenType.T_IMPLEMENTS, '{']);
            n.children.push(extendsClass());
            recoverPop();
        }

        if (peek().tokenType === TokenType.T_IMPLEMENTS) {
            recoverPush(['{']);
            n.children.push(implementsInterfaces());
            recoverPop();
        }

        n.children.push(classBody());
        return end();

    }

    function extendsClass() {
        let n = start(PhraseType.ExtendsClass);
        next();
        n.children.push(nameList());
        return end();
    }

    function classModifiers() {

        let n = start(PhraseType.ClassModifiers);
        let t: Token;

        while (true) {
            t = peek();
            if (t.tokenType === TokenType.T_ABSTRACT || t.tokenType === TokenType.T_FINAL) {
                next();
            } else {
                break;
            }

        }

        return end();

    }

    function block(type: PhraseType = PhraseType.Block) {

        start(type);
        expect('{');
        recoverPush(['}']);
        innerStatementList(['}']);
        recoverPop();
        expect('}');
        return end();

    }

    function statement() {

        let t = peek();

        switch (t.tokenType) {
            case '{':
                return block();
            case TokenType.T_IF:
                return ifStatementList();
            case TokenType.T_WHILE:
                return whileStatement();
            case TokenType.T_DO:
                return doWhileStatement();
            case TokenType.T_FOR:
                return forStatement();
            case TokenType.T_SWITCH:
                return switchStatement();
            case TokenType.T_BREAK:
                return keywordOptionalExpressionStatement(PhraseType.Break);
            case TokenType.T_CONTINUE:
                return keywordOptionalExpressionStatement(PhraseType.Continue);
            case TokenType.T_RETURN:
                return keywordOptionalExpressionStatement(PhraseType.Return);
            case TokenType.T_GLOBAL:
                return globalVariableDeclarationStatement();
            case TokenType.T_STATIC:
                return staticVariableDeclarationStatement();
            case TokenType.T_ECHO:
                return echoStatement();
            case TokenType.T_INLINE_HTML:
                return nodeFactory(t);
            case TokenType.T_UNSET:
                return unsetStatement();
            case TokenType.T_FOREACH:
                return foreachStatement();
            case TokenType.T_DECLARE:
                return declareStatement();
            case TokenType.T_TRY:
                return tryStatement();
            case TokenType.T_THROW:
                return throwStatement();
            case TokenType.T_GOTO:
                return gotoStatement();
            case ';':
                start(PhraseType.EmptyStatement);
                next();
                return end();
            case TokenType.T_STRING:
                if (peek(1).tokenType === ':') {
                    return labelStatement();
                }
            //fall though
            default:
                return expressionStatement();

        }

    }

    function tryStatement() {

        let n = tempNode(PhraseType.Try);
        let t = next(); //try

        recoverPush([TokenType.T_CATCH, TokenType.T_FINALLY]);
        n.children.push(block());
        recoverPop();
        recoverPush([TokenType.T_FINALLY]);
        n.children.push(catchList());
        recoverPop();

        if (peek().tokenType === TokenType.T_FINALLY) {
            n.children.push(finallyStatement());
        } else {
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function catchList() {

        let n = tempNode(PhraseType.CatchList);
        recoverPush([TokenType.T_CATCH]);

        while (true) {

            if (peek().tokenType === TokenType.T_CATCH) {
                n.children.push(catchStatement());
            } else {
                break;
            }

        }

        recoverPop();
        return node(n);

    }

    function finallyStatement() {

        let n = tempNode(PhraseType.Finally);
        next(); //T_FINALLY
        n.children.push(block());
        return node(n);

    }

    function catchStatement() {

        let n = tempNode(PhraseType.Catch);
        next();

        if (!expect('(')) {
            error(['('], ['{', ')', TokenType.T_VARIABLE]);
            n.children.push(nodeFactory(null));
        }

        recoverPush([TokenType.T_VARIABLE, ')', '{']);
        n.children.push(catchNameList());
        recoverPop();

        if (next(TokenType.T_VARIABLE)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            error([TokenType.T_VARIABLE], [')', '{']);
            n.children.push(nodeFactory(null));
        }

        if (!expect(')')) {
            //error
            error([')'], ['{']);
        }

        if (!expect('{')) {
            //error
            error(['{'], ['}']);
        }

        recoverPush(['}']);
        n.children.push(innerStatementList(['}']));
        recoverPop();

        if (!expect('}')) {
            //error
            error(['}'], ['}'])
            expect('}');
        }

        return node(n);

    }

    function catchNameList() {

        let n = tempNode(PhraseType.NameList);
        let followOn = ['|'];
        let t: Token;

        while (true) {

            recoverPush(followOn);
            n.children.push(name());
            recoverPop();
            t = peek();

            if (t.tokenType === '|') {
                next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                //error
                error(['|', ')']);
                break;
            }

        }

        return node(n);

    }

    function declareStatement() {

        let n = tempNode(PhraseType.Declare);
        next();

        if (expect('(')) {
            recoverPush([')']);
            n.children.push(declareConstantDeclarationList());
            recoverPop();
        } else {
            n.children.push(nodeFactory(null));
            error(['('], [...recoverStatementStartTokenTypes, ':', ')']);
        }

        if (!expect(')')) {
            //error
            error([')'], [...recoverStatementStartTokenTypes, ':']);
        }

        let t = peek();

        if (t.tokenType === ':') {

            next();
            recoverPush([TokenType.T_ENDDECLARE, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDDECLARE]));
            recoverPop();

            if (!next(TokenType.T_ENDDECLARE)) {
                //error
                error([TokenType.T_ENDDECLARE], [';']);
            }

            if (!expect(';')) {
                //error
                error([';'], [';']);
                expect(';');
            }

        } else if (isStatementStartToken(t)) {
            n.children.push(statement());
        } else {
            //error
            n.children.push(nodeFactory(null));
            error([]);
        }

        return node(n);

    }

    function declareConstantDeclarationList() {

        let n = tempNode(PhraseType.ConstantDeclarationStatement);
        let followOn = [','];
        let t: Token;

        while (true) {

            recoverPush(followOn);
            n.children.push(constantDeclaration());
            recoverPop();
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                error([',', ')']);
                break;
            }

        }

        return node(n);

    }



    function switchStatement() {

        let n = tempNode(PhraseType.Switch);
        next();

        recoverPush([':', '{', TokenType.T_CASE, TokenType.T_DEFAULT]);
        n.children.push(encapsulatedExpression('(', ')'));
        recoverPop();

        if (!expect('{') && !expect(':')) {
            error(['{', ':'], [TokenType.T_CASE, TokenType.T_DEFAULT, '}', TokenType.T_ENDSWITCH]);
        }

        expect(';');
        recoverPush(['}', TokenType.T_ENDSWITCH]);
        n.children.push(caseStatementList());
        recoverPop();

        let t = peek();

        if (t.tokenType === '}') {
            next();
        } else if (t.tokenType === TokenType.T_ENDSWITCH) {
            next();
            if (!expect(';')) {
                //error
                error([';'], [';']);
                expect(';');
            }
        } else {
            error(['}', TokenType.T_ENDSWITCH], ['}', ';']);
            expect('}');
            expect(';');
        }

        return node(n);

    }

    function caseStatementList() {

        let n = tempNode(PhraseType.CaseList);
        let followOn: (TokenType | string)[] = [TokenType.T_CASE, TokenType.T_DEFAULT];
        let t: Token;
        let breakOn = ['}', TokenType.T_ENDSWITCH];

        while (true) {

            t = peek();

            if (t.tokenType === TokenType.T_CASE || t.tokenType === TokenType.T_DEFAULT) {
                recoverPush(followOn);
                n.children.push(caseStatement());
                recoverPop();
            } else if (breakOn.indexOf(t.tokenType) !== -1) {
                break;
            } else {
                //error
                let recover = [TokenType.T_CASE, TokenType.T_DEFAULT, '}', TokenType.T_ENDSWITCH];
                if (recover.indexOf(error(recover, recover).tokenType) === -1) {
                    break;
                }
            }

        }

        return node(n);

    }

    function caseStatement() {

        let n = tempNode(PhraseType.Case);
        let t = peek();

        if (t.tokenType === TokenType.T_CASE) {
            next();
            recoverPush([';', ':']);
            n.children.push(expression());
            recoverPop();
        } else if (t.tokenType === TokenType.T_DEFAULT) {
            next();
            n.children.push(nodeFactory(null));
        } else {
            //error
            //should never reach here
            throw new Error(`Unexpected token ${peek().tokenType}`);
        }

        if (!expect(':') && !expect(';')) {
            error([';', ':'], recoverInnerStatementStartTokenTypes);
            expect(';');
        }

        if (isInnerStatementStartToken(peek())) {
            n.children.push(innerStatementList(['}', TokenType.T_ENDSWITCH, TokenType.T_CASE, TokenType.T_DEFAULT]));
        } else {
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function labelStatement() {

        let n = tempNode(PhraseType.Label);
        n.children.push(nodeFactory(next()));
        next();
        return node(n);
    }

    function gotoStatement() {

        let n = tempNode(PhraseType.Goto);
        let t = next();

        if (next(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            n.children.push(nodeFactory(null));
            error([TokenType.T_STRING], [';']);
        }

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);

    }

    function throwStatement() {

        let n = tempNode(PhraseType.Throw);
        next();

        recoverPush([';']);
        n.children.push(expression());
        recoverPop();

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);
    }

    function foreachStatement() {

        let n = tempNode(PhraseType.Foreach);
        let t = next();

        if (expect('(')) {
            recoverPush([')', TokenType.T_AS, TokenType.T_DOUBLE_ARROW]);
            n.children.push(expression());
            recoverPop();
        } else {
            error(['('], [...recoverStatementStartTokenTypes, ':', ')', TokenType.T_AS, TokenType.T_DOUBLE_ARROW]);
            n.children.push(nodeFactory(null));
        }

        if (!next(TokenType.T_AS)) {
            error([TokenType.T_AS], [')', TokenType.T_DOUBLE_ARROW]);
        }

        recoverPush([')', TokenType.T_DOUBLE_ARROW]);
        n.children.push(foreachVariable());

        if (next(TokenType.T_DOUBLE_ARROW)) {
            n.children.push(foreachVariable());
        } else {
            n.children.push(nodeFactory(null));
        }

        recoverPop();

        if (!expect(')')) {
            error([')'], [...recoverStatementStartTokenTypes, ':']);
        }

        t = peek();

        if (t.tokenType === ':') {

            next();

            recoverPush([TokenType.T_ENDFOREACH, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDFOREACH]));
            recoverPop();

            if (!next(TokenType.T_ENDFOREACH)) {
                error([TokenType.T_ENDFOREACH], [';']);
            }

            if (!expect(';')) {
                error([';'], [';']);
                expect(';');
            }

        } else if (isStatementStartToken(t)) {
            n.children.push(statement());
        } else {
            //error
            error([]);
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function foreachVariable() {

        switch (peek().tokenType) {

            case '&':
                let unary = tempNode(PhraseType.UnaryExpression);
                unary.value.flag = PhraseFlag.UnaryReference;
                next();
                unary.children.push(variable());
                return node(unary);
            case TokenType.T_LIST:
                return listExpression();
            case '[':
                return shortArray();
            default:
                if (isVariableStartToken(peek())) {
                    return variable();
                } else {
                    //error
                    let err = tempNode(PhraseType.Error);
                    error(err, ['&', TokenType.T_LIST, '[', TokenType.T_VARIABLE]);
                    return node(err);
                }

        }

    }

    function isVariableStartToken(t: Token) {

        switch (t.tokenType) {
            case TokenType.T_VARIABLE:
            case '$':
            case '(':
            case TokenType.T_ARRAY:
            case '[':
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_STATIC:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                return true;
            default:
                return false;
        }

    }

    function unsetStatement() {

        let n = tempNode(PhraseType.Unset);
        let t = next();

        if (!expect('(')) {
            //error
            error(['('], [';']);
            expect(';');
            return node(n);
        }

        let followOn = [';', ')', ','];

        while (true) {

            recoverPush(followOn);
            n.children.push(variable());
            recoverPop();

            t = peek();
            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                next();
                break;
            } else {
                //error
                error([',', ')'], [';']);
                break;
            }

        }

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);

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

        if (peek().tokenType === TokenType.T_VARIABLE) {
            n.children.push(nodeFactory(next()));
        } else {
            n.children.push(nodeFactory(null), nodeFactory(null));
            error([TokenType.T_VARIABLE]);
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

            recoverPush([TokenType.T_ENDFOR, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDFOR]));
            recoverPop();

            if (!next(TokenType.T_ENDFOR)) {
                //error
                error([TokenType.T_ENDFOR], [';']);
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

        recoverPush([TokenType.T_WHILE, ';']);
        n.children.push(statement());
        recoverPop();

        if (!next(TokenType.T_WHILE)) {
            //error
            n.children.push(nodeFactory(null));
            error([TokenType.T_WHILE], [';']);
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
            recoverPush([TokenType.T_ENDWHILE, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDWHILE]));
            recoverPop();

            if (!next(TokenType.T_ENDWHILE)) {
                //error
                error([TokenType.T_ENDWHILE], [';']);
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
        let followOn = [TokenType.T_ELSEIF, TokenType.T_ELSE, TokenType.T_ENDIF];
        recoverPush(followOn);
        n.children.push(ifStatement(false, discoverAlt));
        recoverPop();
        let t: Token;

        recoverPush(followOn);
        while (true) {

            t = peek();

            if (t.tokenType === TokenType.T_ELSEIF || t.tokenType === TokenType.T_ELSE) {
                n.children.push(ifStatement(discoverAlt.isAlt));
            } else {
                break;
            }

        }

        recoverPop();

        if (discoverAlt.isAlt) {

            if (!next(TokenType.T_ENDIF)) {
                //error
                error([TokenType.T_ENDIF], [';']);
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

        if (t.tokenType === TokenType.T_IF || t.tokenType === TokenType.T_ELSEIF) {

            let recover = recoverStatementStartTokenTypes.slice(0);
            recover.push(':');
            recoverPush(recover);
            n.children.push(encapsulatedExpression('(', ')'));
            recoverPop();

        } else if (t.tokenType === TokenType.T_ELSE) {
            next();
            n.children.push(nodeFactory(null));
        } else {
            throw new Error(`Unexpected token ${peek().tokenType}`);
        }

        if ((isAlt || discoverAlt) && expect(':')) {
            if (discoverAlt) {
                discoverAlt.isAlt = true;
            }

            n.children.push(innerStatementList([TokenType.T_ENDIF, TokenType.T_ELSEIF, TokenType.T_ELSE]));
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
        return typeExpression();
    }

    function typeExpression() {

        let n = tempNode(PhraseType.TypeExpression);

        if (expect('?')) {
            n.value.flag = PhraseFlag.Nullable;
        }

        switch (peek().tokenType) {
            case TokenType.T_CALLABLE:
            case TokenType.T_ARRAY:
                n.children.push(nodeFactory(next()));
                break;
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                n.children.push(name());
                break;
            default:
                //error
                error(n,
                    [TokenType.T_CALLABLE, TokenType.T_ARRAY, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]
                );
                break;
        }

        return node(n);

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
            case TokenType.T_VARIABLE:
            case '$':
            case TokenType.T_ARRAY:
            case '[':
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_NS_SEPARATOR:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case '(':
            case TokenType.T_STATIC:
            case TokenType.T_INC:
            case TokenType.T_DEC:
            case '+':
            case '-':
            case '!':
            case '~':
            case '@':
            case TokenType.T_INT_CAST:
            case TokenType.T_DOUBLE_CAST:
            case TokenType.T_STRING_CAST:
            case TokenType.T_ARRAY_CAST:
            case TokenType.T_OBJECT_CAST:
            case TokenType.T_BOOL_CAST:
            case TokenType.T_UNSET_CAST:
            case TokenType.T_LIST:
            case TokenType.T_CLONE:
            case TokenType.T_NEW:
            case TokenType.T_DNUMBER:
            case TokenType.T_LNUMBER:
            case TokenType.T_LINE:
            case TokenType.T_FILE:
            case TokenType.T_DIR:
            case TokenType.T_TRAIT_C:
            case TokenType.T_METHOD_C:
            case TokenType.T_FUNC_C:
            case TokenType.T_NS_C:
            case TokenType.T_CLASS_C:
            case TokenType.T_START_HEREDOC:
            case '"':
            case '`':
            case TokenType.T_PRINT:
            case TokenType.T_YIELD:
            case TokenType.T_YIELD_FROM:
            case TokenType.T_FUNCTION:
            case TokenType.T_INCLUDE:
            case TokenType.T_INCLUDE_ONCE:
            case TokenType.T_REQUIRE:
            case TokenType.T_REQUIRE_ONCE:
            case TokenType.T_EVAL:
            case TokenType.T_EMPTY:
            case TokenType.T_ISSET:
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

        if (!next(TokenType.T_VARIABLE)) {
            //error
            error([TokenType.T_VARIABLE]);
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
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                return true;
            default:
                return false;
        }
    }


    function nameList() {

        let n = tempNode(PhraseType.NameList);

        while (true) {
            n.children.push(name());

            if (!expect(',')) {
                break;
            }
        }

        return node(n);

    }

    function newExpression() {

        let n = tempNode(PhraseType.New);
        next(); //new

        if (peek().tokenType === TokenType.T_CLASS) {
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
                case TokenType.T_OBJECT_OPERATOR:
                    n = tempNode(PhraseType.Property, startToken);
                    next();
                    n.children.push(part, propertyName());
                    part = node(n);
                    continue;
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
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
            case TokenType.T_STATIC:
                n.value.phraseType = PhraseType.Name;
                n.value.flag = PhraseFlag.NameNotFullyQualified;
                n.children.push(nodeFactory(next()));
                return node(n);
            case TokenType.T_VARIABLE:
            case '$':
                return simpleVariable();
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                return name();
            default:
                //error
                error(n,
                    [TokenType.T_STATIC, TokenType.T_VARIABLE, '$', TokenType.T_STRING,
                    TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]
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
        if (next(TokenType.T_STATIC)) {
            n.value.flag = PhraseFlag.ModifierStatic;
        }

        next(); //T_FUNCTION

        if (expect('&')) {
            n.value.flag |= PhraseFlag.ReturnsRef;
        }

        recoverPush([TokenType.T_USE, ':', '{']);
        n.children.push(parameterList());
        recoverPop();

        if (peek().tokenType === TokenType.T_USE) {
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

        if (next(TokenType.T_VARIABLE)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            error([TokenType.T_VARIABLE]);
        }

        return node(n);

    }

    function parameterList() {

        let n = tempNode(PhraseType.ParameterList);
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

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            recoverPush(followOn);
            n.children.push(parameter());
            recoverPop();
            t = peek();

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

    function isTypeExpressionStartToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_NS_SEPARATOR:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case '?':
            case TokenType.T_ARRAY:
            case TokenType.T_CALLABLE:
                return true;
            default:
                return false;
        }
    }

    function parameter() {

        let n = tempNode(PhraseType.Parameter);

        if (isTypeExpressionStartToken(peek())) {
            recoverPush(['&', TokenType.T_ELLIPSIS, TokenType.T_VARIABLE]);
            n.children.push(typeExpression());
            recoverPop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (expect('&')) {
            n.value.flag = PhraseFlag.PassByRef;
        }

        if (next(TokenType.T_ELLIPSIS)) {
            n.value.flag = PhraseFlag.Variadic;
        }

        if (next(TokenType.T_VARIABLE)) {
            n.children.push(nodeFactory(current()));
        } else {
            n.children.push(nodeFactory(null));
            error([TokenType.T_VARIABLE]);
            return node(n);
        }

        if (expect('=')) {
            n.children.push(expression());
        } else {
            n.children.push(nodeFactory(null));
        }

        return node(n);

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
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    variableAtomNode = staticMember(variableAtomNode, startToken);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
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
                            [TokenType.T_PAAMAYIM_NEKUDOTAYIM, TokenType.T_OBJECT_OPERATOR, '[', '{', '(']);
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
            case TokenType.T_VARIABLE:
                n.children.push(simpleVariable());
                n.value.phraseType = PhraseType.StaticProperty;
                break;
            case TokenType.T_STRING:
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
                        ['{', '$', TokenType.T_VARIABLE, TokenType.T_STRING]
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
            case TokenType.T_STRING:
                return nodeFactory(next());
            case '{':
                return encapsulatedExpression('{', '}');
            case '$':
            case TokenType.T_VARIABLE:
                return simpleVariable();
            default:
                //error
                let e = tempNode(PhraseType.Error);
                error(e, [TokenType.T_STRING, '{', '$']);
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
        return t.tokenType === TokenType.T_ELLIPSIS || isExpressionStartToken(t);
    }

    function argument() {

        let n = tempNode(PhraseType.ErrorArgument);
        let t = peek();

        if (t.tokenType === TokenType.T_ELLIPSIS) {
            next();
            n.value.phraseType = PhraseType.Unpack;
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

    function name() {

        let n = tempNode(PhraseType.Name);

        if (next(TokenType.T_NS_SEPARATOR)) {
            n.value.flag = PhraseFlag.NameFullyQualified;
        } else if (next(TokenType.T_NAMESPACE)) {
            n.value.flag = PhraseFlag.NameRelative;
            if (!next(TokenType.T_NS_SEPARATOR)) {
                //error
                if (error([TokenType.T_NS_SEPARATOR], [TokenType.T_STRING]).tokenType !== TokenType.T_STRING) {
                    n.children.push(nodeFactory(null));
                    return node(n);
                }
            }
        } else {
            n.value.flag = PhraseFlag.NameNotFullyQualified;
        }

        n.children.push(namespaceName());
        return node(n);

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

        recoverPush([TokenType.T_DOUBLE_ARROW]);
        n.children.push(expression());
        recoverPop();

        if (!next(TokenType.T_DOUBLE_ARROW)) {
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
            case TokenType.T_VARIABLE:
            case '$':
                variableAtomType = PhraseType.Variable;
                return simpleVariable();
            case '(':
                return encapsulatedExpression('(', ')');
            case TokenType.T_ARRAY:
                variableAtomType = PhraseType.ArrayPairList;
                return longArray();
            case '[':
                variableAtomType = PhraseType.ArrayPairList;
                return shortArray();
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
                return nodeFactory(next());
            case TokenType.T_STATIC:
                variableAtomType = PhraseType.Name;
                n = tempNode(PhraseType.Name);
                n.value.flag = PhraseFlag.NameNotFullyQualified;
                n.children.push(nodeFactory(next()));
                return node(n);
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                variableAtomType = PhraseType.Name;
                return name();
            default:
                //error
                variableAtomType = PhraseType.ErrorVariable;
                n = tempNode(PhraseType.ErrorVariable);
                error(n,
                    [TokenType.T_VARIABLE, '$', '(', '[', TokenType.T_ARRAY, TokenType.T_CONSTANT_ENCAPSED_STRING,
                    TokenType.T_STATIC, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]);
                return node(n);
        }

    }

    function simpleVariable() {

        let n = tempNode(PhraseType.Variable);
        let t = peek();

        if (t.tokenType === TokenType.T_VARIABLE) {
            n.children.push(nodeFactory(next()));
        } else if (t.tokenType === '$') {
            next();
            t = peek();
            if (t.tokenType === '{') {
                n.children.push(encapsulatedExpression('{', '}'));
            } else if (t.tokenType === '$' || t.tokenType === TokenType.T_VARIABLE) {
                n.children.push(simpleVariable());
            } else {
                //error
                error(['{', '$', TokenType.T_VARIABLE]);
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

        let n = tempNode(PhraseType.HaltCompiler);
        next();

        let expected: (TokenType | string)[] = ['(', ')', ';'];
        let t: Token;

        if (!expect('(')) {
            error(['('], [';']);
            expect(';');
            return node(n);
        }

        if (!expect(')')) {
            error([')'], [';']);
            expect(';');
            return node(n);
        }

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);

    }

    function useStatement() {

        let n = tempNode(PhraseType.UseStatement);
        next();

        if (next(TokenType.T_FUNCTION)) {
            n.value.flag = PhraseFlag.UseFunction;
        } else if (next(TokenType.T_CONST)) {
            n.value.flag = PhraseFlag.UseConstant;
        }

        let useListNode = tempNode(PhraseType.UseStatement);
        let useElementNode = tempNode(PhraseType.UseDeclaration);
        next(TokenType.T_NS_SEPARATOR);

        recoverPush([TokenType.T_NS_SEPARATOR, ',', ';']);
        let nsName = namespaceName();
        recoverPop();

        let t = peek();
        if (next(TokenType.T_NS_SEPARATOR) || t.tokenType === '{') {
            if (t.tokenType === '{') {
                n.value.errors.push(new ParseError(t, [TokenType.T_NS_SEPARATOR]));
            }
            n.value.phraseType = PhraseType.UseGroup;
            n.children.push(nsName);
            return useGroup(n);
        }

        if (!n.value.flag) {
            n.value.flag = PhraseFlag.UseClass;
        }

        useElementNode.children.push(nsName);
        recoverPush([',', ';']);
        useListNode.children.push(useElement(useElementNode, false, true));
        recoverPop();

        if (expect(',')) {
            recoverPush([';']);
            n.children.push(useList(useListNode, false, true, ';'));
            recoverPop();
        }

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);
    }

    function useGroup(n: TempNode) {

        if (!expect('{')) {
            //error
            error(['{'], [';']);
            expect(';');
            n.children.push(nodeFactory(null));
            return node(n);
        }

        recoverPush(['}', ';']);
        n.children.push(useList(tempNode(PhraseType.UseList), !n.value.flag, false, '}'));
        recoverPop();

        if (!expect('}')) {
            error(['}'], [';']);
        }

        if (!expect(';')) {
            error([';'], [';']);
            expect(';');
        }

        return node(n);
    }

    function useList(n: TempNode, isMixed: boolean, lookForPrefix: boolean, breakOn: TokenType | string) {

        let t: Token;
        let followOn: (TokenType | string)[] = [','];

        while (true) {

            recoverPush(followOn);
            n.children.push(useElement(tempNode(PhraseType.UseDeclaration), isMixed, lookForPrefix));
            recoverPop();
            t = peek();
            if (t.tokenType === ',') {
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

        return node(n);

    }

    function useElement(n: TempNode, isMixed: boolean, lookForPrefix: boolean) {

        //if children not empty then it contains tokens to left of T_AS
        if (!n.children.length) {

            if (isMixed) {
                if (next(TokenType.T_FUNCTION)) {
                    n.value.flag = PhraseFlag.UseFunction;
                } else if (next(TokenType.T_CONST)) {
                    n.value.flag = PhraseFlag.UseConstant;
                } else {
                    n.value.flag = PhraseFlag.UseClass;
                }
            } else if (lookForPrefix) {
                next(TokenType.T_NS_SEPARATOR);
            }

            recoverPush([TokenType.T_AS]);
            n.children.push(namespaceName());
            recoverPop();
        }

        if (!next(TokenType.T_AS)) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        if (next(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            n.children.push(nodeFactory(null));
            error([TokenType.T_STRING]);
        }

        return node(n);
    }

    function namespaceStatement() {

        let n = tempNode(PhraseType.Namespace);
        next();
        lastDocComment;

        if (peek().tokenType === TokenType.T_STRING) {

            recoverPush([';', '{']);
            n.children.push(namespaceName());
            recoverPop();

            if (expect(';')) {
                n.children.push(nodeFactory(null));
                return node(n);
            }

        }

        if (!expect('{')) {
            //error
            n.children.push(nodeFactory(null));
            error(['{']);
            return node(n);
        }

        n.children.push(topStatements(true));

        if (!expect('}')) {
            error(['}'], ['}']);
            expect('}');

        }

        return node(n);

    }

    function namespaceName() {

        let n = tempNode(PhraseType.NamespaceName);

        if (peek().tokenType === TokenType.T_STRING) {
            n.children.push(nodeFactory(next()));
        } else {
            //error
            error([TokenType.T_STRING]);
            return node(n);
        }

        while (true) {

            if (peek().tokenType === TokenType.T_NS_SEPARATOR &&
                peek(1).tokenType === TokenType.T_STRING) {
                next();
                n.children.push(nodeFactory(next()));
            } else {
                break;
            }

        }

        return node(n);

    }


    function isReservedToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_INCLUDE:
            case TokenType.T_INCLUDE_ONCE:
            case TokenType.T_EVAL:
            case TokenType.T_REQUIRE:
            case TokenType.T_REQUIRE_ONCE:
            case TokenType.T_LOGICAL_OR:
            case TokenType.T_LOGICAL_XOR:
            case TokenType.T_LOGICAL_AND:
            case TokenType.T_INSTANCEOF:
            case TokenType.T_NEW:
            case TokenType.T_CLONE:
            case TokenType.T_EXIT:
            case TokenType.T_IF:
            case TokenType.T_ELSEIF:
            case TokenType.T_ELSE:
            case TokenType.T_ENDIF:
            case TokenType.T_ECHO:
            case TokenType.T_DO:
            case TokenType.T_WHILE:
            case TokenType.T_ENDWHILE:
            case TokenType.T_FOR:
            case TokenType.T_ENDFOR:
            case TokenType.T_FOREACH:
            case TokenType.T_ENDFOREACH:
            case TokenType.T_DECLARE:
            case TokenType.T_ENDDECLARE:
            case TokenType.T_AS:
            case TokenType.T_TRY:
            case TokenType.T_CATCH:
            case TokenType.T_FINALLY:
            case TokenType.T_THROW:
            case TokenType.T_USE:
            case TokenType.T_INSTEADOF:
            case TokenType.T_GLOBAL:
            case TokenType.T_VAR:
            case TokenType.T_UNSET:
            case TokenType.T_ISSET:
            case TokenType.T_EMPTY:
            case TokenType.T_CONTINUE:
            case TokenType.T_GOTO:
            case TokenType.T_FUNCTION:
            case TokenType.T_CONST:
            case TokenType.T_RETURN:
            case TokenType.T_PRINT:
            case TokenType.T_YIELD:
            case TokenType.T_LIST:
            case TokenType.T_SWITCH:
            case TokenType.T_ENDSWITCH:
            case TokenType.T_CASE:
            case TokenType.T_DEFAULT:
            case TokenType.T_BREAK:
            case TokenType.T_ARRAY:
            case TokenType.T_CALLABLE:
            case TokenType.T_EXTENDS:
            case TokenType.T_IMPLEMENTS:
            case TokenType.T_NAMESPACE:
            case TokenType.T_TRAIT:
            case TokenType.T_INTERFACE:
            case TokenType.T_CLASS:
            case TokenType.T_CLASS_C:
            case TokenType.T_TRAIT_C:
            case TokenType.T_FUNC_C:
            case TokenType.T_METHOD_C:
            case TokenType.T_LINE:
            case TokenType.T_FILE:
            case TokenType.T_DIR:
            case TokenType.T_NS_C:
                return true;
            default:
                return false;
        }
    }

    function isSemiReservedToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_PRIVATE:
            case TokenType.T_PROTECTED:
            case TokenType.T_PUBLIC:
                return true;
            default:
                return isReservedToken(t);
        }
    }

    function isTopStatementStartToken(t: Token) {

        switch (t.tokenType) {
            case TokenType.T_NAMESPACE:
            case TokenType.T_USE:
            case TokenType.T_HALT_COMPILER:
            case TokenType.T_CONST:
            case TokenType.T_FUNCTION:
            case TokenType.T_CLASS:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_TRAIT:
            case TokenType.T_INTERFACE:
                return true;
            default:
                return isStatementStartToken(t);
        }

    }

    function isInnerStatementStartToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_FUNCTION:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_CLASS:
            case TokenType.T_TRAIT:
            case TokenType.T_INTERFACE:
                return true;
            default:
                return isStatementStartToken(t);
        }
    }

    function isStatementStartToken(t: Token) {

        switch (t.tokenType) {
            case '{':
            case TokenType.T_IF:
            case TokenType.T_WHILE:
            case TokenType.T_DO:
            case TokenType.T_FOR:
            case TokenType.T_SWITCH:
            case TokenType.T_BREAK:
            case TokenType.T_CONTINUE:
            case TokenType.T_RETURN:
            case TokenType.T_GLOBAL:
            case TokenType.T_STATIC:
            case TokenType.T_ECHO:
            case TokenType.T_INLINE_HTML:
            case TokenType.T_UNSET:
            case TokenType.T_FOREACH:
            case TokenType.T_DECLARE:
            case TokenType.T_TRY:
            case TokenType.T_THROW:
            case TokenType.T_GOTO:
            case TokenType.T_STRING:
            case ';':
                return true;
            default:
                return isExpressionStartToken(t);
        }
    }

}
