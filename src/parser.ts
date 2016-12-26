/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType, Position, Range } from './lexer';

export enum NonTerminalType {
    None, Error, TopStatementList, Namespace, NamespaceName, UseElement, UseStatement,
    UseGroup, UseList, HaltCompiler, ConstantDeclarationList, ConstantDeclaration,
    ArrayPair, Name, Call, Unpack, ArgumentList, Dimension, ClassConstant,
    StaticProperty, StaticMethodCall, MethodCall, Property, Closure, EncapsulatedExpression,
    ParameterList, Parameter, Isset, Empty, Eval, Include, YieldFrom, Yield, Print,
    Backticks, EncapsulatedVariableList, AnonymousClassDeclaration, New,
    NameList, ClassStatementList, PropertyDeclaration, PropertyDeclarationList,
    ClassConstantDeclaration, ClassConstantDeclarationList, TypeExpression, Block,
    InnerStatementList, FunctionDeclaration, MethodDeclaration, UseTrait, TraitAdaptationList,
    MethodReference, TraitPrecendence, TraitAlias, ClassDeclaration, TraitDeclaration,
    InterfaceDeclaration, Variable, ArrayPairList, ClosureUseVariable, ClosureUseList,
    Clone, Heredoc, DoubleQuotes, EmptyStatement, IfList, If, While, DoWhile,
    ForExpressionList, For, Break, Continue, Return, GlobalVariableList, StaticVariableList,
    StaticVariable, Echo, Unset, Throw, Goto, Label, Foreach, CaseList, Switch,
    Case, Declare, Try, Catch, CatchNameList, Finally, TernaryExpression, BinaryExpression,
    UnaryExpression, MagicConstant, CatchList, FunctionBody, MethodBody,
    ErrorStaticMember, ErrorArgument, ErrorVariable, ErrorExpression, ErrorClassStatement, 
    ErrorPropertyName, ErrorTraitAdaptation
}

export enum NonTerminalFlag {
    None = 0,
    ModifierPublic = 1 << 0,
    ModifierProtected = 1 << 1,
    ModifierPrivate = 1 << 2,
    ModifierStatic = 1 << 3,
    ModifierAbstract = 1 << 4,
    ModifierFinal = 1 << 5,
    ReturnsRef = 1 << 6,
    PassByRef = 1 << 7,
    Variadic = 1 << 8,
    Nullable = 1 << 16, NameFullyQualified, NameNotFullyQualified, NameRelative,
    MagicLine, MagicFile, MagicDir, MagicNamespace, MagicFunction, MagicMethod,
    MagicClass, MagicTrait, UseClass, UseFunction, UseConstant,
    UnaryBoolNot, UnaryBitwiseNot, UnaryMinus, UnaryPlus, UnarySilence, UnaryPreInc,
    UnaryPostInc, UnaryPreDec, UnaryPostDec, UnaryReference, BinaryBitwiseOr,
    BinaryBitwiseAnd, BinaryBitwiseXor, BinaryConcat, BinaryAdd, BinarySubtract,
    BinaryMultiply, BinaryDivide, BinaryModulus, BinaryPower, BinaryShiftLeft,
    BinaryShiftRight, BinaryBoolAnd, BinaryBoolOr, BinaryLogicalAnd, BinaryLogicalOr,
    BinaryLogicalXor, BinaryIsIdentical, BinaryIsNotIdentical, BinaryIsEqual,
    BinaryIsNotEqual, BinaryIsSmaller, BinaryIsSmallerOrEqual, BinaryIsGreater,
    BinaryIsGreaterOrEqual, BinarySpaceship, BinaryCoalesce, BinaryAssign, BinaryConcatAssign,
    BinaryAddAssign, BinarySubtractAssign, BinaryMultiplyAssign, BinaryDivideAssign,
    BinaryModulusAssign, BinaryPowerAssign, BinaryShiftLeftAssign, BinaryShiftRightAssign,
    BinaryBitwiseOrAssign, BinaryBitwiseAndAssign, BinaryBitwiseXorAssign, BinaryInstanceOf
}

export interface AstNodeFactory<T> {
    (value: NonTerminal | Token, children?: T[]): T;
}

export interface NonTerminal {
    nonTerminalType: NonTerminalType;
    startToken: Token;
    endToken: Token;
    flag?: NonTerminalFlag;
    doc?: Token;
    errors?: ParseError[];
}

export class ParseError {

    private _unexpected: Token;
    private _expected: (TokenType | string)[];

    constructor(unexpected: Token, expected: (TokenType | string)[] = []) {
        this._unexpected = unexpected;
        this._expected = expected;
    }

    get unexpected(){
        return this._unexpected;
    }

    get expected(){
        return this._expected;
    }

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
        value: NonTerminal;
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

    var nodeFactory: AstNodeFactory<any>;
    var tokens: Token[];
    var followOnStack: (TokenType | string)[][];
    var isBinaryOpPredicate: Predicate;
    var variableAtomType: NonTerminalType;
    var pos: number;
    var docComment: Token;

    export function parse<T>(tokenArray: Token[], astNodeFactory: AstNodeFactory<T>) : T {

        nodeFactory = astNodeFactory;
        tokens = tokenArray;
        pos = -1;

        if (!tokenArray.length) {
            return null;
        }

        return topStatementList(false);

    }

    function current() {
        return pos >= 0 ? tokens[pos] : null;
    }

    function lastDocComment() {
        let t = docComment;
        docComment = null;
        return t;
    }

    function consume(tokenType: TokenType | string) {
        return peek().tokenType === tokenType ? next() : null;
    }

    function next(): Token {

        if (pos === tokens.length - 1) {
            return endToken;
        }

        ++pos;

        switch (tokens[pos].tokenType) {
            case TokenType.T_DOC_COMMENT:
                docComment = tokens[pos];
                return this.next();
            case '}':
                docComment = null;
                break;
            case TokenType.T_WHITESPACE:
            case TokenType.T_COMMENT:
            case TokenType.T_OPEN_TAG:
            case TokenType.T_OPEN_TAG_WITH_ECHO:
            case TokenType.T_CLOSE_TAG:
                return this.next();
            default:
                break;
        }

        return tokens[pos];

    }

    function peek(n = 0) {

        let k = n + 1
        let peekPos = pos;

        while (k) {
            if (++peekPos < tokens.length) {
                if (!shouldSkip(tokens[peekPos])) {
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

        while (true) {
            t = peek();
            if (until.indexOf(t.tokenType) !== -1 || t.tokenType === TokenType.T_EOF) {
                break;
            }
        }

        return t;
    }

    function shouldSkip(t: Token) {
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


    function tempNode(type: NonTerminalType = 0, startToken?: Token): TempNode {

        if (startToken === undefined) {
            startToken = start();
        }

        return {
            value: {
                nonTerminalType: type,
                startToken: startToken,
                endToken: null,
            },
            children: []
        };
    }


    function node(temp: TempNode, endToken?: Token) {

        if (!endToken) {
            endToken = end();
        }
        temp.value.endToken = endToken;
        return nodeFactory(temp.value, temp.children);

    }

    function start() {
        let t = peek();

        if (t.tokenType === TokenType.T_EOF) {
            return current();
        }

        return t;
    }

    function end() {
        return current();
    }

    function topStatementList(isCurly: boolean) {

        let n = tempNode(NonTerminalType.TopStatementList);
        let t: Token;
        let breakOn = isCurly ? '}' : TokenType.T_EOF;
        let followOn = recoverTopStatementStartTokenTypes.slice(0);
        followOn.push(breakOn);

        while (true) {

            t = peek();
            if (isTopStatementStartToken(t)) {
                followOnStack.push(followOn)
                n.children.push(topStatement());
                followOnStack.pop();
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                //error
                t = error(n, followOn, followOn);
                if (t.tokenType === ';') {
                    next();
                } else if (t.tokenType === TokenType.T_EOF) {
                    break;
                }
            }

        }

        return node(n);

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

        let n = tempNode(NonTerminalType.ConstantDeclarationList);
        next();
        let followOn: (TokenType | string)[] = [',', ';'];
        let t: Token;

        while (true) {

            followOnStack.push(followOn);
            n.children.push(constantDeclaration());
            followOnStack.pop();
            t = peek();
            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                error(n, [',', ';'], [';']);
                consume(';');
                break;
            }
        }

        return node(n);

    }

    function constantDeclaration() {

        let n = tempNode(NonTerminalType.ConstantDeclaration);
        let t: Token;

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
            n.value.doc = lastDocComment();
        } else {
            error(n, [TokenType.T_STRING]);
            n.children.push(nodeFactory(null), nodeFactory(null));
            return node(n);
        }

        if (!consume('=')) {
            error(n, ['=']);
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function expression(minPrecedence = 0) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let startToken = start();
        let opFlag: NonTerminalFlag;
        isBinaryOpPredicate = isVariableAndExpressionBinaryOp;
        let lhs = atom();

        while (true) {

            op = peek();

            if (!isBinaryOpPredicate(op)) {
                break;
            }

            [precedence, associativity] = opPrecedenceMap[op.text];

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }

            next();
            if (op.tokenType === '?') {
                lhs = ternaryExpression(lhs, precedence, startToken);
            } else {
                let rhs: any;
                if (op.tokenType === '=' && peek().tokenType === '&') {
                    rhs = unaryExpression();
                } else {
                    rhs = op.tokenType === TokenType.T_INSTANCEOF ? newVariable() : expression(precedence);
                }

                lhs = binaryNode(lhs, rhs, binaryOpToNodeFlag(op), startToken);
            }

        }

        return lhs;

    }

    function binaryNode(lhs: any, rhs: any, flag: NonTerminalFlag, startToken: Token) {
        let n = tempNode(NonTerminalType.BinaryExpression, startToken);
        n.value.flag = flag;
        n.children.push(lhs);
        n.children.push(rhs);
        return node(n);
    }

    function unaryOpToNodeFlag(op: Token, isPost = false) {
        switch (op.tokenType) {
            case '&':
                return NonTerminalFlag.UnaryReference;
            case '!':
                return NonTerminalFlag.UnaryBoolNot;
            case '~':
                return NonTerminalFlag.UnaryBitwiseNot;
            case '-':
                return NonTerminalFlag.UnaryMinus;
            case '+':
                return NonTerminalFlag.UnaryPlus;
            case '@':
                return NonTerminalFlag.UnarySilence;
            case TokenType.T_INC:
                return isPost ? NonTerminalFlag.UnaryPreInc : NonTerminalFlag.UnaryPostInc;
            case TokenType.T_DEC:
                return isPost ? NonTerminalFlag.UnaryPreDec : NonTerminalFlag.UnaryPostDec;
            default:
                throw new Error(`Unknow operator ${op.text}`);
        }
    }

    function binaryOpToNodeFlag(op: Token) {

        switch (op.tokenType) {
            case '|':
                return NonTerminalFlag.BinaryBitwiseOr;
            case '&':
                return NonTerminalFlag.BinaryBitwiseAnd;
            case '^':
                return NonTerminalFlag.BinaryBitwiseXor;
            case '.':
                return NonTerminalFlag.BinaryConcat;
            case '+':
                return NonTerminalFlag.BinaryAdd;
            case '-':
                return NonTerminalFlag.BinarySubtract;
            case '*':
                return NonTerminalFlag.BinaryMultiply;
            case '/':
                return NonTerminalFlag.BinaryDivide;
            case '%':
                return NonTerminalFlag.BinaryModulus;
            case TokenType.T_POW:
                return NonTerminalFlag.BinaryPower;
            case TokenType.T_SL:
                return NonTerminalFlag.BinaryShiftLeft;
            case TokenType.T_SR:
                return NonTerminalFlag.BinaryShiftRight;
            case TokenType.T_BOOLEAN_AND:
                return NonTerminalFlag.BinaryBoolAnd;
            case TokenType.T_BOOLEAN_OR:
                return NonTerminalFlag.BinaryBoolOr;
            case TokenType.T_LOGICAL_AND:
                return NonTerminalFlag.BinaryLogicalAnd;
            case TokenType.T_LOGICAL_OR:
                return NonTerminalFlag.BinaryLogicalOr;
            case TokenType.T_LOGICAL_XOR:
                return NonTerminalFlag.BinaryLogicalXor;
            case TokenType.T_IS_IDENTICAL:
                return NonTerminalFlag.BinaryIsIdentical;
            case TokenType.T_IS_NOT_IDENTICAL:
                return NonTerminalFlag.BinaryIsNotIdentical;
            case TokenType.T_IS_EQUAL:
                return NonTerminalFlag.BinaryIsEqual;
            case TokenType.T_IS_NOT_EQUAL:
                return NonTerminalFlag.BinaryIsNotEqual;
            case '<':
                return NonTerminalFlag.BinaryIsSmaller;
            case TokenType.T_IS_SMALLER_OR_EQUAL:
                return NonTerminalFlag.BinaryIsSmallerOrEqual;
            case '>':
                return NonTerminalFlag.BinaryIsGreater;
            case TokenType.T_IS_GREATER_OR_EQUAL:
                return NonTerminalFlag.BinaryIsGreaterOrEqual;
            case TokenType.T_SPACESHIP:
                return NonTerminalFlag.BinarySpaceship;
            case TokenType.T_COALESCE:
                return NonTerminalFlag.BinaryCoalesce;
            case '=':
                return NonTerminalFlag.BinaryAssign;
            case TokenType.T_CONCAT_EQUAL:
                return NonTerminalFlag.BinaryConcatAssign;
            case TokenType.T_PLUS_EQUAL:
                return NonTerminalFlag.BinaryAddAssign;
            case TokenType.T_MINUS_EQUAL:
                return NonTerminalFlag.BinarySubtractAssign;
            case TokenType.T_MUL_EQUAL:
                return NonTerminalFlag.BinaryMultiplyAssign;
            case TokenType.T_DIV_EQUAL:
                return NonTerminalFlag.BinaryDivideAssign;
            case TokenType.T_MOD_EQUAL:
                return NonTerminalFlag.BinaryModulusAssign;
            case TokenType.T_POW_EQUAL:
                return NonTerminalFlag.BinaryPowerAssign;
            case TokenType.T_SL_EQUAL:
                return NonTerminalFlag.BinaryShiftLeftAssign;
            case TokenType.T_SR_EQUAL:
                return NonTerminalFlag.BinaryShiftRightAssign;
            case TokenType.T_OR_EQUAL:
                return NonTerminalFlag.BinaryBitwiseOrAssign;
            case TokenType.T_AND_EQUAL:
                return NonTerminalFlag.BinaryBitwiseAndAssign;
            case TokenType.T_XOR_EQUAL:
                return NonTerminalFlag.BinaryBitwiseXorAssign;
            case TokenType.T_INSTEADOF:
                return NonTerminalFlag.BinaryInstanceOf;
            default:
                throw new Error(`Unknown operator ${op.text}`);

        }

    }

    function ternaryExpression(lhs: any, precedence: number, startToken: Token) {

        let n = tempNode(NonTerminalType.TernaryExpression, startToken);
        n.children.push(lhs);

        if (consume(':')) {
            n.children.push(nodeFactory(null));
        } else {
            followOnStack.push([':']);
            n.children.push(expression(precedence));
            followOnStack.pop();

            if (!consume(':')) {
                //error
                error(n, [':']);
                n.children.push(nodeFactory(null));
                return node(n);
            }

        }

        n.children.push(expression(precedence));
        return node(n);

    }

    function atom() {

        let t = peek();

        switch (t.tokenType) {
            case TokenType.T_STATIC:
                if (peek(1).tokenType === TokenType.T_FUNCTION) {
                    return closure();
                }
            //fall through
            case TokenType.T_VARIABLE:
            case '$':
            case TokenType.T_ARRAY:
            case '[':
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_NS_SEPARATOR:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case '(':
                isBinaryOpPredicate = isBinaryOp;
                let possibleUnaryStart = t;
                let variableNode = variable();
                t = peek();
                if (t.tokenType === TokenType.T_INC || t.tokenType === TokenType.T_DEC) {
                    next();
                    let unary = tempNode(NonTerminalType.UnaryExpression, possibleUnaryStart);
                    unary.value.flag = t.tokenType === TokenType.T_INC ?
                        NonTerminalFlag.UnaryPostInc : NonTerminalFlag.UnaryPostDec
                    unary.children.push(variableNode);
                    return node(unary);
                } else {
                    return variableNode;
                }
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
                return nodeFactory(next());
            case TokenType.T_LINE:
            case TokenType.T_FILE:
            case TokenType.T_DIR:
            case TokenType.T_TRAIT_C:
            case TokenType.T_METHOD_C:
            case TokenType.T_FUNC_C:
            case TokenType.T_NS_C:
            case TokenType.T_CLASS_C:
                let magic = tempNode(NonTerminalType.MagicConstant);
                magic.value.flag = magicConstantTokenToFlag(next());
                return node(magic);
            case TokenType.T_START_HEREDOC:
                return heredoc();
            case '"':
                return quotedEncapsulatedVariableList(NonTerminalType.DoubleQuotes, '"');
            case '`':
                return quotedEncapsulatedVariableList(NonTerminalType.Backticks, '`');
            case TokenType.T_PRINT:
                return keywordExpression(NonTerminalType.Print);
            case TokenType.T_YIELD:
                return yieldExpression();
            case TokenType.T_YIELD_FROM:
                return keywordExpression(NonTerminalType.YieldFrom);
            case TokenType.T_FUNCTION:
                return closure();
            case TokenType.T_INCLUDE:
            case TokenType.T_INCLUDE_ONCE:
            case TokenType.T_REQUIRE:
            case TokenType.T_REQUIRE_ONCE:
                return keywordExpression(NonTerminalType.Include);
            case TokenType.T_EVAL:
                return keywordParenthesisedExpression(NonTerminalType.Eval);
            case TokenType.T_EMPTY:
                return keywordParenthesisedExpression(NonTerminalType.Empty);
            case TokenType.T_ISSET:
                return isset();
            default:
                //error
                let err = tempNode(NonTerminalType.ErrorExpression);
                error(err, []);
                return node(err);
        }

    }

    function magicConstantTokenToFlag(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_LINE:
                return NonTerminalFlag.MagicLine;
            case TokenType.T_FILE:
                return NonTerminalFlag.MagicFile;
            case TokenType.T_DIR:
                return NonTerminalFlag.MagicDir;
            case TokenType.T_TRAIT_C:
                return NonTerminalFlag.MagicTrait;
            case TokenType.T_METHOD_C:
                return NonTerminalFlag.MagicMethod;
            case TokenType.T_FUNC_C:
                return NonTerminalFlag.MagicFunction;
            case TokenType.T_NS_C:
                return NonTerminalFlag.MagicNamespace;
            case TokenType.T_CLASS_C:
                return NonTerminalFlag.MagicClass;
            default:
                return 0;
        }
    }

    function isset() {

        let n = tempNode(NonTerminalType.Isset);
        let t = next();

        if (!consume('(')) {
            //error
            error(n, ['(']);
            return node(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(expression());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                next();
                break;
            } else {
                //error
                if (error(n, followOn, [')']).tokenType === ')') {
                    next();
                }
                break;
            }

        }

        return node(n);

    }

    function keywordParenthesisedExpression(type: NonTerminalType) {

        let n = tempNode(type);
        let t = next();
        n.children.push(encapsulatedExpression('(', ')'));
        return node(n);

    }

    function keywordExpression(nodeType: NonTerminalType) {

        let n = tempNode(nodeType);
        next();
        n.children.push(expression());
        return node(n);
    }

    function yieldExpression() {

        let n = tempNode(NonTerminalType.Yield);
        next();

        if (!isExpressionStartToken(peek())) {
            n.children.push(nodeFactory(null), nodeFactory(null));
            return node(n);
        }

        followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        n.children.push(expression());
        followOnStack.pop();

        if (!consume(TokenType.T_DOUBLE_ARROW)) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function quotedEncapsulatedVariableList(type: NonTerminalType, closeTokenType: TokenType | string) {

        let n = tempNode(type);
        next();
        followOnStack.push([closeTokenType]);
        n.children.push(encapsulatedVariableList(closeTokenType));
        followOnStack.pop();

        if (!consume(closeTokenType)) {
            //error
            if (error(n, [closeTokenType], [closeTokenType]).tokenType === closeTokenType) {
                next();
            }
        }

        return node(n);

    }

    function encapsulatedVariableList(breakOn: TokenType | string) {

        let n = tempNode(NonTerminalType.EncapsulatedVariableList);
        let followOn: (TokenType | string)[] = [
            TokenType.T_ENCAPSED_AND_WHITESPACE, TokenType.T_VARIABLE,
            TokenType.T_DOLLAR_OPEN_CURLY_BRACES, TokenType.T_CURLY_OPEN, breakOn
        ];

        followOnStack.push(followOn);
        while (true) {

            switch (peek().tokenType) {
                case TokenType.T_ENCAPSED_AND_WHITESPACE:
                    n.children.push(nodeFactory(next()));
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
                    if (followOn.indexOf(error(n, followOn).tokenType) === -1) {
                        break;
                    }
            }

            break;

        }

        followOnStack.pop();
        return node(n);

    }

    function curlyOpenEncapsulatedVariable() {

        //errNode placeholder for unclosed braces
        let errNode = tempNode(NonTerminalType.ErrorVariable);
        next();
        followOnStack.push(['}']);
        errNode.children.push(variable());
        followOnStack.pop();

        if (consume('}')) {
            //discard errNode
            return errNode.children.pop();
        } else {
            if (error(errNode, ['}'], ['}']).tokenType === '}') {
                next();
            }
            return node(errNode);
        }

    }

    function dollarCurlyOpenEncapsulatedVariable() {

        //err node is just a placeholder should closing brace not found
        let errNode = tempNode(NonTerminalType.ErrorVariable);
        let n: TempNode;
        next(); //${
        let t = peek();

        if (t.tokenType === TokenType.T_STRING_VARNAME) {

            if (peek(1).tokenType === '[') {
                n = tempNode(NonTerminalType.Dimension);
                n.children.push(simpleVariable());
                next();
                followOnStack.push([']', '}']);
                n.children.push(expression());
                followOnStack.pop();
                if (!consume(']')) {
                    //error
                    if (error(n, [']'], [']', '}']).tokenType === ']') {
                        next();
                    }
                }

            } else {
                n = tempNode(NonTerminalType.Variable);
                n.children.push(nodeFactory(next()));
            }

            errNode.children.push(node(n));

        } else if (isExpressionStartToken(t)) {
            followOnStack.push(['}']);
            errNode.children.push(expression());
            followOnStack.pop();
        } else {
            //error
            error(errNode, [], ['}']);
        }

        if (consume('}')) {
            return errNode.value.errors.length ? node(errNode) : errNode.children.pop();
        } else {
            //error
            if (error(errNode, ['}'], ['}']).tokenType === '}') {
                next();
            }
            return node(errNode);
        }


    }

    function encapsulatedDimension() {

        let n = tempNode(NonTerminalType.Dimension);
        n.children.push(simpleVariable());

        //will always be [
        next();

        followOnStack.push([']']);

        switch (peek().tokenType) {
            case TokenType.T_STRING:
            case TokenType.T_NUM_STRING:
                n.children.push(nodeFactory(next()));
                break;
            case TokenType.T_VARIABLE:
                n.children.push(simpleVariable());
                break;
            case '-':
                let unary = tempNode(NonTerminalType.UnaryExpression);
                unary.value.flag = NonTerminalFlag.UnaryMinus;
                next();
                if (consume(TokenType.T_NUM_STRING)) {
                    unary.children.push(nodeFactory(current()));
                } else {
                    error(unary, [TokenType.T_NUM_STRING]);
                }
                n.children.push(node(unary));
                break;
            default:
                //error
                n.children.push(nodeFactory(null));
                error(n, [
                    TokenType.T_STRING, TokenType.T_NUM_STRING, TokenType.T_VARIABLE, '-'
                ]);
                break;
        }

        followOnStack.pop();

        if (!consume(']')) {
            //error
            if (error(n, [']'], [']']).tokenType === ']') {
                next();
            }
        }

        return node(n);

    }

    function encapsulatedProperty() {
        let n = tempNode(NonTerminalType.Property);
        n.children.push(simpleVariable());

        // will always be TokenType.T_OBJECT_OPERATOR
        next();

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            error(n, [TokenType.T_STRING]);
        }

        return node(n);
    }

    function heredoc() {

        let n = tempNode(NonTerminalType.Heredoc);
        let t = next();

        followOnStack.push([TokenType.T_END_HEREDOC]);
        n.children.push(encapsulatedVariableList(TokenType.T_END_HEREDOC));
        followOnStack.pop();

        if (!consume(TokenType.T_END_HEREDOC)) {
            //error
            if (error(n, [TokenType.T_END_HEREDOC], [TokenType.T_END_HEREDOC]).tokenType === TokenType.T_END_HEREDOC) {
                next();
            }

        }

        return node(n);

    }

    function anonymousClassDeclaration() {

        let n = tempNode(NonTerminalType.AnonymousClassDeclaration);
        next();
        n.value.doc = lastDocComment();

        if (peek().tokenType === '(') {
            followOnStack.push([TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
            n.children.push(argumentList());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (consume(TokenType.T_EXTENDS)) {
            followOnStack.push([TokenType.T_IMPLEMENTS, '{']);
            n.children.push(name());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (consume(TokenType.T_IMPLEMENTS)) {
            followOnStack.push(['{']);
            n.children.push(nameList());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        n.children.push(classStatementList());
        return node(n);

    }

    function classStatementList() {

        let n = tempNode(NonTerminalType.ClassStatementList);
        let t: Token;

        if (!consume('{')) {
            //error
            error(n, ['{']);
            return node(n);
        }

        let followOn: (TokenType | string)[] = recoverClassStatementStartTokenTypes.slice(0);
        followOn.push('}');

        while (true) {
            t = peek();

            if (t.tokenType === '}') {
                next();
                break;
            } else if (isClassStatementStartToken(t)) {
                followOnStack.push(followOn);
                n.children.push(classStatement());
                followOnStack.pop();
            } else {
                //error
                t = error(n, followOn, followOn);
                if (!isClassStatementStartToken(t) && t.tokenType !== '}') {
                    break;
                }
            }

        }

        return node(n);

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

        let n = tempNode(NonTerminalType.ErrorClassStatement);
        let t = peek();

        switch (t.tokenType) {
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                n.value.flag = memberModifierList();
                t = peek();
                if (t.tokenType === TokenType.T_VARIABLE) {
                    return propertyDeclarationStatement(n);
                } else if (t.tokenType === TokenType.T_FUNCTION) {
                    return methodDeclaration(n);
                } else if (t.tokenType === TokenType.T_CONST) {
                    return classConstantDeclarationStatement(n);
                } else {
                    //error
                    error(n,
                        [TokenType.T_VARIABLE, TokenType.T_FUNCTION, TokenType.T_CONST]
                    );
                    return node(n);
                }
            case TokenType.T_FUNCTION:
                return methodDeclaration(n);
            case TokenType.T_VAR:
                next();
                n.value.flag = NonTerminalFlag.ModifierPublic;
                return propertyDeclarationStatement(n);
            case TokenType.T_CONST:
                n.value.flag = NonTerminalFlag.ModifierPublic;
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

        let n = tempNode(NonTerminalType.UseTrait);
        let t = next();
        followOnStack.push([';', '{']);
        n.children.push(nameList());
        followOnStack.pop();
        n.children.push(traitAdaptationList());
        return node(n);

    }

    function traitAdaptationList() {

        let n = tempNode(NonTerminalType.TraitAdaptationList);
        let t: Token;

        if (consume(';')) {
            return node(n);
        }

        if (!consume('{')) {
            error(n, ['{']);
            return node(n, end());
        }

        followOnStack.push(['}']);

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
                t = error(n, [
                    '}', TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR
                ]);
                if (t.tokenType !== '}') {
                    break;
                }
            }

        }

        followOnStack.pop();
        return node(n);

    }

    function traitAdaptation() {

        let n = tempNode(NonTerminalType.ErrorTraitAdaptation);
        let t = peek();
        let t2 = peek(1);

        if (t.tokenType === TokenType.T_NAMESPACE ||
            t.tokenType === TokenType.T_NS_SEPARATOR ||
            (t.tokenType === TokenType.T_STRING &&
                (t2.tokenType === TokenType.T_PAAMAYIM_NEKUDOTAYIM || t2.tokenType === TokenType.T_NS_SEPARATOR))) {

            followOnStack.push([TokenType.T_INSTEADOF, TokenType.T_AS]);
            n.children.push(methodReference());
            followOnStack.pop();

            if (consume(TokenType.T_INSTEADOF)) {
                return traitPrecedence(n);
            }

        } else if (t.tokenType === TokenType.T_STRING || isSemiReservedToken(t)) {

            let methodRef = tempNode(NonTerminalType.MethodReference, n.value.startToken);
            methodRef.children.push(nodeFactory(null), nodeFactory(next()));
            n.children.push(node(methodRef));
        } else {
            //error
            error(n, [TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR, TokenType.T_STRING]);
            return node(n);
        }

        return traitAlias(n);


    }

    function traitAlias(n: TempNode) {


        if (consume(TokenType.T_AS)) {
            error(n, [TokenType.T_AS]);
            n.children.push(nodeFactory(null));
            return node(n);
        }

        let t = peek();

        if (t.tokenType === TokenType.T_STRING || isReservedToken(t)) {
            n.children.push(nodeFactory(next()));
        } else if (t.tokenType === TokenType.T_PUBLIC || t.tokenType === TokenType.T_PROTECTED || t.tokenType === TokenType.T_PRIVATE) {
            n.value.flag = memberModifierToFlag(next());
            t = peek();
            if (t.tokenType === TokenType.T_STRING || isSemiReservedToken(t)) {
                n.children.push(nodeFactory(next()));
            } else {
                n.children.push(nodeFactory(null));
            }
        } else {
            //error
            error(n, [TokenType.T_STRING, TokenType.T_PUBLIC, TokenType.T_PROTECTED, TokenType.T_PRIVATE]);
            n.children.push(nodeFactory(null));
            return node(n);
        }

        if (!consume(';')) {
            //error
            if (error(n, [';'], [';']).tokenType === ';') {
                next();
            }
        }

        return node(n);

    }

    function traitPrecedence(n: TempNode) {

        n.value.nonTerminalType = NonTerminalType.TraitPrecendence;
        followOnStack.push([';']);
        n.children.push(nameList());
        followOnStack.pop();

        if (!consume(';')) {
            //error
            if (error(n, [';'], [';']).tokenType === ';') {
                next();
            }
        }

        return node(n);

    }

    function methodReference() {

        let n = tempNode(NonTerminalType.MethodReference);

        followOnStack.push([TokenType.T_PAAMAYIM_NEKUDOTAYIM]);
        n.children.push(name());
        followOnStack.pop();

        if (consume(TokenType.T_PAAMAYIM_NEKUDOTAYIM)) {
            //error
            error(n, [TokenType.T_PAAMAYIM_NEKUDOTAYIM], [TokenType.T_STRING]);
        }

        let t = peek();

        if (t.tokenType === TokenType.T_STRING || isSemiReservedToken(t)) {
            n.children.push(nodeFactory(next()));
        } else {
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_STRING]);
        }

        return node(n);

    }

    function methodDeclaration(n: TempNode) {

        n.value.nonTerminalType = NonTerminalType.MethodDeclaration;
        next(); //T_FUNCTION
        n.value.doc = lastDocComment();

        if (consume('&')) {
            n.value.flag |= NonTerminalFlag.ReturnsRef;
        }

        let t = peek();
        if (t.tokenType !== TokenType.T_STRING && !isSemiReservedToken(t)) {
            //error
            error(n, [TokenType.T_STRING], [';', ':', '{', '(']);
            n.children.push(nodeFactory(null));
        } else {
            n.children.push(nodeFactory(next()));
        }

        followOnStack.push([':', ';', '{']);
        n.children.push(parameterList());
        followOnStack.pop();

        if (peek().tokenType === ':') {
            n.children.push(returnType());
        } else {
            n.children.push(nodeFactory(null));
        }

        t = peek();
        if (t.tokenType === ';' && (n.value.flag & NonTerminalFlag.ModifierAbstract)) {
            next();
            n.children.push(nodeFactory(null));
        } else {
            n.children.push(block(NonTerminalType.MethodBody));
        }

        return node(n);

    }

    function innerStatementList(breakOn: (TokenType | string)[]) {

        let n = tempNode(NonTerminalType.InnerStatementList);
        let t: Token;
        let followOn = recoverInnerStatementStartTokenTypes;

        while (true) {

            t = peek();

            if (isInnerStatementStartToken(t)) {
                followOnStack.push(followOn);
                n.children.push(innerStatement());
                followOnStack.pop();
            } else if (breakOn.indexOf(t.tokenType) !== -1) {
                break;
            } else {
                //error
                t = error(n, followOn, followOn);
                if (t.tokenType === ';') {
                    next();
                } else if (!isInnerStatementStartToken(t) && breakOn.indexOf(t.tokenType) === -1) {
                    break;
                }
            }
        }

        return node(n);

    }

    function innerStatement() {

        let t = peek();

        switch (t.tokenType) {
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

        let n = tempNode(NonTerminalType.InterfaceDeclaration);
        let t = next();
        n.value.doc = lastDocComment();

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_STRING], [TokenType.T_EXTENDS, '{']);
        }

        if (consume(TokenType.T_EXTENDS)) {
            followOnStack.push(['{']);
            n.children.push(nameList());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        n.children.push(classStatementList());
        return node(n);

    }

    function traitDeclarationStatement() {

        let n = tempNode(NonTerminalType.TraitDeclaration);
        let t = next();
        n.value.doc = lastDocComment();

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_STRING], ['{']);
        }

        n.children.push(classStatementList());
        return node(n);
    }

    function functionDeclaration() {

        let n = tempNode(NonTerminalType.FunctionDeclaration);

        next(); //T_FUNCTION

        if (consume('&')) {
            n.value.flag = NonTerminalFlag.ReturnsRef;
        }

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_STRING], ['(', ':', '{']);
        }

        n.children.push(parameterList());

        if (consume(':')) {
            followOnStack.push(['{']);
            n.children.push(returnType());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        n.children.push(block(NonTerminalType.FunctionDeclaration));

        return node(n);

    }

    function classDeclarationStatement() {

        let n = tempNode(NonTerminalType.ClassDeclaration);
        let t = peek();

        if (t.tokenType === TokenType.T_ABSTRACT || t.tokenType === TokenType.T_FINAL) {
            n.value.flag = classModifiers();
        }

        if (!consume(TokenType.T_CLASS)) {
            //error
            error(n, [TokenType.T_CLASS], [TokenType.T_STRING, TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
        }

        n.value.doc = lastDocComment();

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            error(n, [TokenType.T_STRING], [TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
            n.children.push(nodeFactory(null));
        }

        if (consume(TokenType.T_EXTENDS)) {
            followOnStack.push([TokenType.T_IMPLEMENTS, '{']);
            n.children.push(nameList());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (consume(TokenType.T_IMPLEMENTS)) {
            followOnStack.push(['{']);
            n.children.push(nameList());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        n.children.push(classStatementList());
        return node(n);

    }

    function classModifiers() {

        let flag = 0;
        let t: Token;

        while (true) {
            t = peek();
            if (t.tokenType === TokenType.T_ABSTRACT || t.tokenType === TokenType.T_FINAL) {
                flag |= memberModifierToFlag(next());
            } else {
                break;
            }

        }

        return flag;

    }

    function block(type:NonTerminalType = NonTerminalType.Block) {

        let n = tempNode(type);

        if (!consume('{')) {
            let err = new ParseError(current(), ['{']);
            if (isInnerStatementStartToken(peek())) {
                n.value.errors = [err];
            } else if (peek(1).tokenType === '{') {
                next();
                next();
                n.value.errors = [err];
            } else {
                error(n, ['{']);
                n.children.push(nodeFactory(null));
                return node(n);
            }
        }

        followOnStack.push(['}']);
        innerStatementList(['}']);
        followOnStack.pop();

        if (!consume('}')) {
            error(n, ['}'], ['}']);
            consume('}');
        }

        return node(n);

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
                return keywordOptionalExpressionStatement(NonTerminalType.Break);
            case TokenType.T_CONTINUE:
                return keywordOptionalExpressionStatement(NonTerminalType.Continue);
            case TokenType.T_RETURN:
                return keywordOptionalExpressionStatement(NonTerminalType.Return);
            case TokenType.T_GLOBAL:
                return globalVariableDeclarationStatement();
            case TokenType.T_STATIC:
                return staticVariableDeclarationStatement();
            case TokenType.T_ECHO:
                return echoStatement();
            case TokenType.T_INLINE_HTML:
                let echo = tempNode(NonTerminalType.Echo, start());
                echo.children.push(nodeFactory(next()));
                return node(echo, end());
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
                let empty = tempNode(NonTerminalType.EmptyStatement);
                next();
                return node(empty);
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

        let n = tempNode(NonTerminalType.Try);
        let t = next(); //try

        followOnStack.push([TokenType.T_CATCH, TokenType.T_FINALLY]);
        n.children.push(block());
        followOnStack.pop();
        followOnStack.push([TokenType.T_FINALLY]);
        n.children.push(catchList());
        followOnStack.pop();

        if (peek().tokenType === TokenType.T_FINALLY) {
            n.children.push(finallyStatement());
        } else {
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function catchList() {

        let n = tempNode(NonTerminalType.CatchList);
        followOnStack.push([TokenType.T_CATCH]);

        while (true) {

            if (peek().tokenType === TokenType.T_CATCH) {
                n.children.push(catchStatement());
            } else {
                break;
            }

        }

        followOnStack.pop();
        return node(n);

    }

    function finallyStatement() {

        let n = tempNode(NonTerminalType.Finally);
        next(); //T_FINALLY
        n.children.push(block());
        return node(n);

    }

    function catchStatement() {

        let n = tempNode(NonTerminalType.Catch);
        next();

        if (!consume('(')) {
            error(n, ['('], ['{', ')', TokenType.T_VARIABLE]);
            n.children.push(nodeFactory(null));
        }

        followOnStack.push([TokenType.T_VARIABLE, ')', '{']);
        n.children.push(catchNameList());
        followOnStack.pop();

        if (consume(TokenType.T_VARIABLE)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            error(n, [TokenType.T_VARIABLE], [')', '{']);
            n.children.push(nodeFactory(null));
        }

        if (!consume(')')) {
            //error
            error(n, [')'], ['{']);
        }

        if (!consume('{')) {
            //error
            error(n, ['{'], ['}']);
        }

        followOnStack.push(['}']);
        n.children.push(innerStatementList(['}']));
        followOnStack.pop();

        if (!consume('}')) {
            //error
            error(n, ['}'], ['}'])
            consume('}');
        }

        return node(n);

    }

    function catchNameList() {

        let n = tempNode(NonTerminalType.NameList);
        let followOn = ['|'];
        let t: Token;

        while (true) {

            followOnStack.push(followOn);
            n.children.push(name());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === '|') {
                next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                //error
                error(n, ['|', ')']);
                break;
            }

        }

        return node(n);

    }

    function declareStatement() {

        let n = tempNode(NonTerminalType.Declare);
        next();

        if (consume('(')) {
            followOnStack.push([')']);
            n.children.push(declareConstantDeclarationList());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
            error(n, ['('], [...recoverStatementStartTokenTypes, ':', ')']);
        }

        if (!consume(')')) {
            //error
            error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }

        let t = peek();

        if (t.tokenType === ':') {

            next();
            followOnStack.push([TokenType.T_ENDDECLARE, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDDECLARE]));
            followOnStack.pop();

            if (!consume(TokenType.T_ENDDECLARE)) {
                //error
                error(n, [TokenType.T_ENDDECLARE], [';']);
            }

            if (!consume(';')) {
                //error
                error(n, [';'], [';']);
                consume(';');
            }

        } else if (isStatementStartToken(t)) {
            n.children.push(statement());
        } else {
            //error
            n.children.push(nodeFactory(null));
            error(n, []);
        }

        return node(n);

    }

    function declareConstantDeclarationList() {

        let n = tempNode(NonTerminalType.ConstantDeclarationList);
        let followOn = [','];
        let t: Token;

        while (true) {

            followOnStack.push(followOn);
            n.children.push(constantDeclaration());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                error(n, [',', ')']);
                break;
            }

        }

        return node(n);

    }



    function switchStatement() {

        let n = tempNode(NonTerminalType.Switch);
        next();

        followOnStack.push([':', '{', TokenType.T_CASE, TokenType.T_DEFAULT]);
        n.children.push(encapsulatedExpression('(', ')'));
        followOnStack.pop();

        if (!consume('{') && !consume(':')) {
            error(n, ['{', ':'], [TokenType.T_CASE, TokenType.T_DEFAULT, '}', TokenType.T_ENDSWITCH]);
        }

        consume(';');
        followOnStack.push(['}', TokenType.T_ENDSWITCH]);
        n.children.push(caseStatementList());
        followOnStack.pop();

        let t = peek();

        if (t.tokenType === '}') {
            next();
        } else if (t.tokenType === TokenType.T_ENDSWITCH) {
            next();
            if (!consume(';')) {
                //error
                error(n, [';'], [';']);
                consume(';');
            }
        } else {
            error(n, ['}', TokenType.T_ENDSWITCH], ['}', ';']);
            consume('}');
            consume(';');
        }

        return node(n);

    }

    function caseStatementList() {

        let n = tempNode(NonTerminalType.CaseList);
        let followOn: (TokenType | string)[] = [TokenType.T_CASE, TokenType.T_DEFAULT];
        let t: Token;
        let breakOn = ['}', TokenType.T_ENDSWITCH];

        while (true) {

            t = peek();

            if (t.tokenType === TokenType.T_CASE || t.tokenType === TokenType.T_DEFAULT) {
                followOnStack.push(followOn);
                n.children.push(caseStatement());
                followOnStack.pop();
            } else if (breakOn.indexOf(t.tokenType) !== -1) {
                break;
            } else {
                //error
                let recover = [TokenType.T_CASE, TokenType.T_DEFAULT, '}', TokenType.T_ENDSWITCH];
                if (recover.indexOf(error(n, recover, recover).tokenType) === -1) {
                    break;
                }
            }

        }

        return node(n);

    }

    function caseStatement() {

        let n = tempNode(NonTerminalType.Case);
        let t = peek();

        if (t.tokenType === TokenType.T_CASE) {
            next();
            followOnStack.push([';', ':']);
            n.children.push(expression());
            followOnStack.pop();
        } else if (t.tokenType === TokenType.T_DEFAULT) {
            next();
            n.children.push(nodeFactory(null));
        } else {
            //error
            //should never reach here
            throw new Error(`Unexpected token ${peek().tokenType}`);
        }

        if (!consume(':') && !consume(';')) {
            error(n, [';', ':'], recoverInnerStatementStartTokenTypes);
            consume(';');
        }

        if (isInnerStatementStartToken(peek())) {
            n.children.push(innerStatementList(['}', TokenType.T_ENDSWITCH, TokenType.T_CASE, TokenType.T_DEFAULT]));
        } else {
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function labelStatement() {

        let n = tempNode(NonTerminalType.Label);
        n.children.push(nodeFactory(next()));
        next();
        return node(n);
    }

    function gotoStatement() {

        let n = tempNode(NonTerminalType.Goto);
        let t = next();

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_STRING], [';']);
        }

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);

    }

    function throwStatement() {

        let n = tempNode(NonTerminalType.Throw);
        next();

        followOnStack.push([';']);
        n.children.push(expression());
        followOnStack.pop();

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);
    }

    function foreachStatement() {

        let n = tempNode(NonTerminalType.Foreach);
        let t = next();

        if (consume('(')) {
            followOnStack.push([')', TokenType.T_AS, TokenType.T_DOUBLE_ARROW]);
            n.children.push(expression());
            followOnStack.pop();
        } else {
            error(n, ['('], [...recoverStatementStartTokenTypes, ':', ')', TokenType.T_AS, TokenType.T_DOUBLE_ARROW]);
            n.children.push(nodeFactory(null));
        }

        if (!consume(TokenType.T_AS)) {
            error(n, [TokenType.T_AS], [')', TokenType.T_DOUBLE_ARROW]);
        }

        followOnStack.push([')', TokenType.T_DOUBLE_ARROW]);
        n.children.push(foreachVariable());

        if (consume(TokenType.T_DOUBLE_ARROW)) {
            n.children.push(foreachVariable());
        } else {
            n.children.push(nodeFactory(null));
        }

        followOnStack.pop();

        if (!consume(')')) {
            error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }

        t = peek();

        if (t.tokenType === ':') {

            next();

            followOnStack.push([TokenType.T_ENDFOREACH, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDFOREACH]));
            followOnStack.pop();

            if (!consume(TokenType.T_ENDFOREACH)) {
                error(n, [TokenType.T_ENDFOREACH], [';']);
            }

            if (!consume(';')) {
                error(n, [';'], [';']);
                consume(';');
            }

        } else if (isStatementStartToken(t)) {
            n.children.push(statement());
        } else {
            //error
            error(n, []);
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function foreachVariable() {

        switch (peek().tokenType) {

            case '&':
                let unary = tempNode(NonTerminalType.UnaryExpression);
                unary.value.flag = NonTerminalFlag.UnaryReference;
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
                    let err = tempNode(NonTerminalType.Error);
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

        let n = tempNode(NonTerminalType.Unset);
        let t = next();

        if (!consume('(')) {
            //error
            error(n, ['('], [';']);
            consume(';');
            return node(n);
        }

        let followOn = [';', ')', ','];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(variable());
            followOnStack.pop();

            t = peek();
            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                next();
                break;
            } else {
                //error
                error(n, [',', ')'], [';']);
                break;
            }

        }

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);

    }

    function echoStatement() {

        let n = tempNode(NonTerminalType.Echo);
        let t: Token;
        next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(expression());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                //error
                error(n, followOn, [';']);
                consume(';');
                break;
            }

        }

        return node(n);

    }

    function staticVariableDeclarationStatement() {

        let n = tempNode(NonTerminalType.StaticVariableList);
        let t: Token;
        next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(staticVariableDeclaration());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                //error
                error(n, followOn, [';']);
                consume(';');
                break;
            }

        }

        return node(n);

    }



    function globalVariableDeclarationStatement() {

        let n = tempNode(NonTerminalType.GlobalVariableList);
        let t = next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(simpleVariable());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                //error
                error(n, followOn, [';']);
                consume(';');
                break;
            }

        }

        return node(n);

    }

    function staticVariableDeclaration() {

        let n = tempNode(NonTerminalType.StaticVariable);

        if (peek().tokenType === TokenType.T_VARIABLE) {
            n.children.push(nodeFactory(next()));
        } else {
            n.children.push(nodeFactory(null), nodeFactory(null));
            error(n, [TokenType.T_VARIABLE]);
            return node(n);
        }

        if (!consume('=')) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function keywordOptionalExpressionStatement(nodeType: NonTerminalType) {
        let n = tempNode(nodeType);
        next();

        if (isExpressionStartToken(peek())) {
            followOnStack.push([';']);
            n.children.push(expression());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);
    }


    function forStatement() {

        let n = tempNode(NonTerminalType.For);
        next(); //for

        if (!consume('(')) {
            //error
            n.children.push(nodeFactory(null), nodeFactory(null),
                nodeFactory(null), nodeFactory(null));
            error(n, ['(']);
            return node(n);
        }

        for (let k = 0; k < 2; ++k) {

            if (isExpressionStartToken(peek())) {
                followOnStack.push([';', ')']);
                n.children.push(forExpressionList(';'));
                followOnStack.pop();
            } else {
                n.children.push(nodeFactory(null));
            }

            if (!consume(';')) {
                //error
                error(n, [';'], [...recoverStatementStartTokenTypes, ':', ')']);
                break;
            }

        }

        if (isExpressionStartToken(peek())) {
            followOnStack.push([')']);
            n.children.push(expression());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (!consume(')')) {
            //error
            error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
            consume(';');
        }

        if (consume(':')) {

            followOnStack.push([TokenType.T_ENDFOR, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDFOR]));
            followOnStack.pop();

            if (!consume(TokenType.T_ENDFOR)) {
                //error
                error(n, [TokenType.T_ENDFOR], [';']);
            }

            if (!consume(';')) {
                //error
                error(n, [';'], [';']);
                consume(';');
            }
        } else if (isStatementStartToken(peek())) {
            n.children.push(statement());
        } else {
            //error
            error(n, []);
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function forExpressionList(breakOn: TokenType | string) {

        let n = tempNode(NonTerminalType.ForExpressionList);
        let followOn = [',', breakOn];
        let t: Token;

        while (true) {

            followOnStack.push(followOn);
            n.children.push(expression());
            followOnStack.pop();

            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType == breakOn) {
                break;
            } else {
                //error
                error(n, followOn);
                break;
            }

        }

        return node(n);

    }

    function doWhileStatement() {

        let n = tempNode(NonTerminalType.DoWhile);
        next();

        followOnStack.push([TokenType.T_WHILE, ';']);
        n.children.push(statement());
        followOnStack.pop();

        if (!consume(TokenType.T_WHILE)) {
            //error
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_WHILE], [';']);
            consume(';');
            return node(n);
        }

        followOnStack.push([';']);
        n.children.push(encapsulatedExpression('(', ')'));
        followOnStack.pop();

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);

    }

    function whileStatement() {

        let n = tempNode(NonTerminalType.While);
        next();

        let recover = recoverStatementStartTokenTypes.slice(0);
        recover.push(':');
        followOnStack.push(recover);
        n.children.push(encapsulatedExpression('(', ')'));
        followOnStack.pop();

        if (consume(':')) {
            followOnStack.push([TokenType.T_ENDWHILE, ';']);
            n.children.push(innerStatementList([TokenType.T_ENDWHILE]));
            followOnStack.pop();

            if (!consume(TokenType.T_ENDWHILE)) {
                //error
                error(n, [TokenType.T_ENDWHILE], [';']);
            }

            if (!consume(';')) {
                error(n, [';'], [';']);
                consume(';');
            }
        } else if (isStatementStartToken(peek())) {
            n.children.push(statement());
        } else {
            //error
            error(n, []);
        }

        return node(n);

    }

    function ifStatementList() {

        let n = tempNode(NonTerminalType.IfList);
        let discoverAlt = { isAlt: false };
        let followOn = [TokenType.T_ELSEIF, TokenType.T_ELSE, TokenType.T_ENDIF];
        followOnStack.push(followOn);
        n.children.push(ifStatement(false, discoverAlt));
        followOnStack.pop();
        let t: Token;

        followOnStack.push(followOn);
        while (true) {

            t = peek();

            if (t.tokenType === TokenType.T_ELSEIF || t.tokenType === TokenType.T_ELSE) {
                n.children.push(ifStatement(discoverAlt.isAlt));
            } else {
                break;
            }

        }

        followOnStack.pop();

        if (discoverAlt.isAlt) {

            if (!consume(TokenType.T_ENDIF)) {
                //error
                error(n, [TokenType.T_ENDIF], [';']);
            }

            if (!consume(';')) {
                //error
                error(n, [';'], [';']);
                consume(';');
            }
        }

        return node(n);

    }

    function ifStatement(isAlt: boolean, discoverAlt: { isAlt: boolean } = null) {

        let n = tempNode(NonTerminalType.If);
        let t = peek();

        if (t.tokenType === TokenType.T_IF || t.tokenType === TokenType.T_ELSEIF) {

            let recover = recoverStatementStartTokenTypes.slice(0);
            recover.push(':');
            followOnStack.push(recover);
            n.children.push(encapsulatedExpression('(', ')'));
            followOnStack.pop();

        } else if (t.tokenType === TokenType.T_ELSE) {
            next();
            n.children.push(nodeFactory(null));
        } else {
            throw new Error(`Unexpected token ${peek().tokenType}`);
        }

        if ((isAlt || discoverAlt) && consume(':')) {
            if (discoverAlt) {
                discoverAlt.isAlt = true;
            }

            n.children.push(innerStatementList([TokenType.T_ENDIF, TokenType.T_ELSEIF, TokenType.T_ELSE]));
        } else if (isStatementStartToken(peek())) {
            n.children.push(statement());
        } else {
            //error
            n.children.push(nodeFactory(null));
            error(n, []);
        }

        return node(n);

    }

    function expressionStatement() {

        let n = tempNode(NonTerminalType.ErrorExpression);
        followOnStack.push([';']);
        n.children.push(expression());
        followOnStack.pop();

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
            return node(n);
        }

        return n.children.pop();

    }

    function returnType() {
        next(); //:
        return typeExpression();
    }

    function typeExpression() {

        let n = tempNode(NonTerminalType.TypeExpression);

        if (consume('?')) {
            n.value.flag = NonTerminalFlag.Nullable;
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

        n.value.nonTerminalType = NonTerminalType.ClassConstantDeclarationList;
        next(); //const
        let followOn = [';', ','];
        let t: Token;

        while (true) {
            followOnStack.push(followOn);
            n.children.push(classConstantDeclaration());
            followOnStack.pop();
            t = next();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                //error
                error(n, followOn, [';']);
                consume(';');
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

        let n = tempNode(NonTerminalType.ClassConstantDeclarationList);
        let t = peek();

        if (t.tokenType !== TokenType.T_STRING && !isSemiReservedToken(t)) {
            //error
            error(n, [TokenType.T_STRING]);
            n.children.push(nodeFactory(null), nodeFactory(null));
            return node(n);
        }

        n.children.push(nodeFactory(next()));
        n.value.doc = lastDocComment();

        if (!consume('=')) {
            //error
            error(n, ['=']);
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function propertyDeclarationStatement(n: TempNode) {

        let t: Token;
        n.value.nonTerminalType = NonTerminalType.PropertyDeclarationList;
        let followOn = [';', ','];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(propertyDeclaration());
            followOnStack.pop();

            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ';') {
                next();
                break;
            } else {
                //error
                error(n, [',', ';'], [';']);
                consume(';');
                break;
            }

        }

        return node(n);

    }

    function propertyDeclaration() {

        let n = tempNode(NonTerminalType.PropertyDeclaration);

        if (!consume(TokenType.T_VARIABLE)) {
            //error
            error(n, [TokenType.T_VARIABLE]);
            n.children.push(nodeFactory(null), nodeFactory(null));
            return node(n);
        }

        n.value.doc = lastDocComment();
        n.children.push(nodeFactory(current()));

        if (!consume('=')) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        n.children.push(expression());
        return node(n);

    }

    function memberModifierList() {

        let flags = 0, flag = 0;

        while (true) {
            flag = memberModifierToFlag(peek());
            if (flag) {
                next();
                flags |= flag;
            } else {
                break;
            }
        }

        return flags;

    }

    function memberModifierToFlag(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_PUBLIC:
                return NonTerminalFlag.ModifierPublic;
            case TokenType.T_PROTECTED:
                return NonTerminalFlag.ModifierProtected;
            case TokenType.T_PRIVATE:
                return NonTerminalFlag.ModifierPrivate;
            case TokenType.T_STATIC:
                return NonTerminalFlag.ModifierStatic;
            case TokenType.T_ABSTRACT:
                return NonTerminalFlag.ModifierAbstract;
            case TokenType.T_FINAL:
                return NonTerminalFlag.ModifierFinal;
            default:
                return 0;
        }
    }


    function nameList() {

        let n = tempNode(NonTerminalType.NameList);

        while (true) {
            n.children.push(name());

            if (!consume(',')) {
                break;
            }
        }

        return node(n);

    }

    function newExpression() {

        let n = tempNode(NonTerminalType.New);
        next(); //new

        if (peek().tokenType === TokenType.T_CLASS) {
            n.children.push(anonymousClassDeclaration());
            return node(n);
        }

        followOnStack.push(['(']);
        n.children.push(newVariable());
        followOnStack.pop();

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
                    n = tempNode(NonTerminalType.Property, startToken);
                    next();
                    n.children.push(part, propertyName());
                    part = node(n);
                    continue;
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    n = tempNode(NonTerminalType.StaticProperty, startToken);
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
        let n = tempNode(NonTerminalType.ErrorVariable);

        switch (t.tokenType) {
            case TokenType.T_STATIC:
                n.value.nonTerminalType = NonTerminalType.Name;
                n.value.flag = NonTerminalFlag.NameNotFullyQualified;
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

        let n = tempNode(NonTerminalType.Clone);
        next();
        n.children.push(expression());
        return node(n);

    }

    function listExpression() {

        let n = tempNode(NonTerminalType.ArrayPairList);
        let t = next();

        if (!consume('(')) {
            //error
            error(n, ['('], [')']);
            consume(')');
            return node(n);
        }

        followOnStack.push([')']);
        arrayPairList(n, ')');
        followOnStack.pop();

        if (!consume(')')) {
            //error
            error(n, [')'], [')']);
            consume(')');
        }

        return node(n);

    }

    function unaryExpression() {

        let n = tempNode(NonTerminalType.UnaryExpression);
        let t = next();
        n.value.flag = unaryOpToNodeFlag(t);

        switch (n.value.flag) {
            case NonTerminalFlag.UnaryPreDec:
            case NonTerminalFlag.UnaryPreInc:
            case NonTerminalFlag.UnaryReference:
                n.children.push(variable());
                break;
            default:
                n.children.push(expression(opPrecedenceMap[t.text][0]));
                break;
        }

        return node(n);

    }

    function closure() {

        let n = tempNode(NonTerminalType.Closure);
        if (consume(TokenType.T_STATIC)) {
            n.value.flag = NonTerminalFlag.ModifierStatic;
        }

        next(); //T_FUNCTION

        if (consume('&')) {
            n.value.flag |= NonTerminalFlag.ReturnsRef;
        }

        followOnStack.push([TokenType.T_USE, ':', '{']);
        n.children.push(parameterList());
        followOnStack.pop();

        if (peek().tokenType === TokenType.T_USE) {
            followOnStack.push([':', '{']);
            n.children.push(closureUse());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (peek().tokenType === ':') {
            followOnStack.push(['{']);
            n.children.push(returnType());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (!consume('{')) {
            error(n, ['{'], [...recoverInnerStatementStartTokenTypes, '}']);
        }

        followOnStack.push(['}']);
        n.children.push(innerStatementList(['}']));
        followOnStack.pop();

        if (!consume('}')) {
            error(n, ['}'], ['}']);
            consume('}');
        }

        return node(n);

    }

    function closureUse() {

        let n = tempNode(NonTerminalType.ClosureUseList);
        let t = next();

        if (!consume('(')) {
            error(n, ['('], [')']);
            consume(')');
            return node(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(closureUseVariable());
            followOnStack.pop();
            t = next();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                next();
                break;
            } else {
                //error
                error(n, followOn, [')']);
                consume(')');
                break;
            }

        }

        return node(n);

    }

    function closureUseVariable() {

        let n = tempNode(NonTerminalType.ClosureUseVariable);

        if (consume('&')) {
            n.value.flag = NonTerminalFlag.PassByRef;
        }

        if (consume(TokenType.T_VARIABLE)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            error(n, [TokenType.T_VARIABLE]);
        }

        return node(n);

    }

    function parameterList() {

        let n = tempNode(NonTerminalType.ParameterList);
        let t: Token;

        if (!consume('(')) {
            //error
            error(n, ['('], [')']);
            consume(')');
            return node(n);
        }

        if (consume(')')) {
            return node(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(parameter());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === ')') {
                next();
                break;
            } else {
                //error
                error(n, followOn, [')']);
                consume(')');
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

        let n = tempNode(NonTerminalType.Parameter);

        if (isTypeExpressionStartToken(peek())) {
            followOnStack.push(['&', TokenType.T_ELLIPSIS, TokenType.T_VARIABLE]);
            n.children.push(typeExpression());
            followOnStack.pop();
        } else {
            n.children.push(nodeFactory(null));
        }

        if (consume('&')) {
            n.value.flag = NonTerminalFlag.PassByRef;
        }

        if (consume(TokenType.T_ELLIPSIS)) {
            n.value.flag = NonTerminalFlag.Variadic;
        }

        if (consume(TokenType.T_VARIABLE)) {
            n.children.push(nodeFactory(current()));
        } else {
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_VARIABLE]);
            return node(n);
        }

        if (consume('=')) {
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
                    let call = tempNode(NonTerminalType.Call, startToken);
                    call.children.push(variableAtomNode, argumentList());
                    variableAtomNode = node(call);
                    continue;
                default:
                    if (count === 1 && variableAtomType !== NonTerminalType.Variable) {
                        //error
                        let errNode = tempNode(NonTerminalType.ErrorVariable, startToken);
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

        let n = tempNode(NonTerminalType.ErrorStaticMember, startToken);
        n.children.push(lhs);
        next() //::
        let t = peek();

        switch (t.tokenType) {
            case '{':
                n.value.nonTerminalType = NonTerminalType.StaticMethodCall;
                n.children.push(encapsulatedExpression('{', '}'));
                break;
            case '$':
            case TokenType.T_VARIABLE:
                n.children.push(simpleVariable());
                n.value.nonTerminalType = NonTerminalType.StaticProperty;
                break;
            case TokenType.T_STRING:
                n.children.push(nodeFactory(next()));
                n.value.nonTerminalType = NonTerminalType.ClassConstant;
                break;
            default:
                if (isSemiReservedToken(t)) {
                    n.children.push(nodeFactory(next()));
                    n.value.nonTerminalType = NonTerminalType.ClassConstant;
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
            n.value.nonTerminalType = NonTerminalType.StaticMethodCall;
            return node(n);
        } else if (n.value.nonTerminalType === NonTerminalType.StaticMethodCall) {
            //error
            error(n, ['(']);
            n.children.push(nodeFactory(null));
        }

        return node(n);

    }

    function instanceMember(lhs: any, startToken: Token) {

        let n = tempNode(NonTerminalType.Property, startToken);
        n.children.push(lhs);
        next(); //->
        n.children.push(propertyName());

        if (consume('(')) {
            n.children.push(argumentList());
            n.value.nonTerminalType = NonTerminalType.MethodCall;
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
                let e = tempNode(NonTerminalType.Error);
                error(e, [TokenType.T_STRING, '{', '$']);
                return node(e);
        }

    }

    function dimension(lhs: any, startToken: Token) {

        let n = tempNode(NonTerminalType.Dimension, startToken);
        let close = peek().tokenType === '[' ? ']' : '}';
        n.children.push(lhs);
        next();

        if (isExpressionStartToken(peek())) {
            followOnStack.push([close]);
            n.children.push(expression());
            followOnStack.pop();
        }

        if (!consume(close)) {
            //error
            error(n, [close], [close]);
            consume(close);
        }

        return node(n);

    }

    function argumentList() {

        let n = tempNode(NonTerminalType.ArgumentList);
        let t: Token;

        if (!consume('(')) {
            //error
            error(n, ['('], [')']);
            consume(')');
            return node(n);
        }

        if (consume(')')) {
            return node(n);
        }

        let followOn = [',', ')'];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(argument());
            followOnStack.pop();
            t = peek();

            if (t.tokenType === ')') {
                next();
                break;
            } else if (t.tokenType === ',') {
                next();
            } else {
                //error
                error(n, followOn, [')']);
                consume(')');
                break;
            }

        }

        return node(n);

    }

    function isArgumentStartToken(t: Token) {
        return t.tokenType === TokenType.T_ELLIPSIS || isExpressionStartToken(t);
    }

    function argument() {

        let n = tempNode(NonTerminalType.ErrorArgument);
        let t = peek();

        if (t.tokenType === TokenType.T_ELLIPSIS) {
            next();
            n.value.nonTerminalType = NonTerminalType.Unpack;
            n.children.push(expression());
            return node(n);
        } else if (isExpressionStartToken(t)) {
            return expression();
        } else {
            //error
            error(n, []);
            return node(n);
        }

    }

    function name() {

        let n = tempNode(NonTerminalType.Name);

        if (consume(TokenType.T_NS_SEPARATOR)) {
            n.value.flag = NonTerminalFlag.NameFullyQualified;
        } else if (consume(TokenType.T_NAMESPACE)) {
            n.value.flag = NonTerminalFlag.NameRelative;
            if (!consume(TokenType.T_NS_SEPARATOR)) {
                //error
                if (error(n, [TokenType.T_NS_SEPARATOR], [TokenType.T_STRING]).tokenType !== TokenType.T_STRING) {
                    n.children.push(nodeFactory(null));
                    return node(n);
                }
            }
        } else {
            n.value.flag = NonTerminalFlag.NameNotFullyQualified;
        }

        n.children.push(namespaceName());
        return node(n);

    }

    function shortArray() {

        let n = tempNode(NonTerminalType.ArrayPairList);
        let t = next();

        if (consume(']')) {
            return node(n);
        }

        followOnStack.push([']']);
        arrayPairList(n, ']');
        followOnStack.pop();

        if (!consume(']')) {
            error(n, [']'], [']']);
            consume(']');
        }

        return node(n);

    }

    function longArray() {

        let n = tempNode(NonTerminalType.ArrayPairList);
        next();

        if (!consume('(')) {
            //error
            error(n, ['('], [')']);
            consume(')');
            return node(n);
        }

        if (consume(')')) {
            return node(n);
        }

        followOnStack.push([')']);
        arrayPairList(n, ')');
        followOnStack.pop();

        if (!consume(')')) {
            error(n, [')'], [')']);
            consume(')');
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

            followOnStack.push(followOn);
            n.children.push(arrayPair());
            followOnStack.pop();
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
                if (error(n, followOn, [',']).tokenType === ',' &&
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

        let n = tempNode(NonTerminalType.ArrayPair);

        if (peek().tokenType === '&') {
            n.children.push(unaryExpression(), nodeFactory(null));
            return node(n);
        }

        followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        n.children.push(expression());
        followOnStack.pop();

        if (!consume(TokenType.T_DOUBLE_ARROW)) {
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

        let n = tempNode(NonTerminalType.EncapsulatedExpression);

        if (!consume(open)) {
            let err = new ParseError(peek(), [open]);
            if (isExpressionStartToken(peek())) {
                n.value.errors = [err];
            } else if (peek(1).tokenType === open) {
                next();
                next();
                n.value.errors = [err];
            } else {
                error(n, [open], [close]);
                consume(close);
                n.children.push(nodeFactory(null));
                return node(n);
            }
        }

        followOnStack.push([close]);
        n.children.push(expression());
        followOnStack.pop();

        if (!consume(close)) {
            error(n, [close], [close]);
            consume(close);
        }

        return node(n);

    }

    function variableAtom() {

        let n: TempNode;
        switch (peek().tokenType) {
            case TokenType.T_VARIABLE:
            case '$':
                variableAtomType = NonTerminalType.Variable;
                return simpleVariable();
            case '(':
                return encapsulatedExpression('(', ')');
            case TokenType.T_ARRAY:
                variableAtomType = NonTerminalType.ArrayPairList;
                return longArray();
            case '[':
                variableAtomType = NonTerminalType.ArrayPairList;
                return shortArray();
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
                return nodeFactory(next());
            case TokenType.T_STATIC:
                variableAtomType = NonTerminalType.Name;
                n = tempNode(NonTerminalType.Name);
                n.value.flag = NonTerminalFlag.NameNotFullyQualified;
                n.children.push(nodeFactory(next()));
                return node(n);
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                variableAtomType = NonTerminalType.Name;
                return name();
            default:
                //error
                variableAtomType = NonTerminalType.ErrorVariable;
                n = tempNode(NonTerminalType.ErrorVariable);
                error(n,
                    [TokenType.T_VARIABLE, '$', '(', '[', TokenType.T_ARRAY, TokenType.T_CONSTANT_ENCAPSED_STRING,
                    TokenType.T_STATIC, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]);
                return node(n);
        }

    }

    function simpleVariable() {

        let n = tempNode(NonTerminalType.Variable);
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
                error(n, ['{', '$', TokenType.T_VARIABLE]);
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

        let n = tempNode(NonTerminalType.HaltCompiler);
        next();

        let expected: (TokenType | string)[] = ['(', ')', ';'];
        let t: Token;

        if (!consume('(')) {
            error(n, ['('], [';']);
            consume(';');
            return node(n);
        }

        if (!consume(')')) {
            error(n, [')'], [';']);
            consume(';');
            return node(n);
        }

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);

    }

    function useStatement() {

        let n = tempNode(NonTerminalType.UseStatement);
        next();

        if (consume(TokenType.T_FUNCTION)) {
            n.value.flag = NonTerminalFlag.UseFunction;
        } else if (consume(TokenType.T_CONST)) {
            n.value.flag = NonTerminalFlag.UseConstant;
        }

        let useListNode = tempNode(NonTerminalType.UseStatement);
        let useElementNode = tempNode(NonTerminalType.UseElement);
        consume(TokenType.T_NS_SEPARATOR);

        followOnStack.push([TokenType.T_NS_SEPARATOR, ',', ';']);
        let nsName = namespaceName();
        followOnStack.pop();

        let t = peek();
        if (consume(TokenType.T_NS_SEPARATOR) || t.tokenType === '{') {
            if (t.tokenType === '{') {
                n.value.errors.push(new ParseError(t, [TokenType.T_NS_SEPARATOR]));
            }
            n.value.nonTerminalType = NonTerminalType.UseGroup;
            n.children.push(nsName);
            return useGroup(n);
        }

        if (!n.value.flag) {
            n.value.flag = NonTerminalFlag.UseClass;
        }

        useElementNode.children.push(nsName);
        followOnStack.push([',', ';']);
        useListNode.children.push(useElement(useElementNode, false, true));
        followOnStack.pop();

        if (consume(',')) {
            followOnStack.push([';']);
            n.children.push(useList(useListNode, false, true, ';'));
            followOnStack.pop();
        }

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);
    }

    function useGroup(n: TempNode) {

        if (!consume('{')) {
            //error
            error(n, ['{'], [';']);
            consume(';');
            n.children.push(nodeFactory(null));
            return node(n);
        }

        followOnStack.push(['}', ';']);
        n.children.push(useList(tempNode(NonTerminalType.UseList), !n.value.flag, false, '}'));
        followOnStack.pop();

        if (!consume('}')) {
            error(n, ['}'], [';']);
        }

        if (!consume(';')) {
            error(n, [';'], [';']);
            consume(';');
        }

        return node(n);
    }

    function useList(n: TempNode, isMixed: boolean, lookForPrefix: boolean, breakOn: TokenType | string) {

        let t: Token;
        let followOn: (TokenType | string)[] = [','];

        while (true) {

            followOnStack.push(followOn);
            n.children.push(useElement(tempNode(NonTerminalType.UseElement), isMixed, lookForPrefix));
            followOnStack.pop();
            t = peek();
            if (t.tokenType === ',') {
                next();
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                //error
                if (error(n, [',', breakOn], [',']).tokenType === ',') {
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
                if (consume(TokenType.T_FUNCTION)) {
                    n.value.flag = NonTerminalFlag.UseFunction;
                } else if (consume(TokenType.T_CONST)) {
                    n.value.flag = NonTerminalFlag.UseConstant;
                } else {
                    n.value.flag = NonTerminalFlag.UseClass;
                }
            } else if (lookForPrefix) {
                consume(TokenType.T_NS_SEPARATOR);
            }

            followOnStack.push([TokenType.T_AS]);
            n.children.push(namespaceName());
            followOnStack.pop();
        }

        if (!consume(TokenType.T_AS)) {
            n.children.push(nodeFactory(null));
            return node(n);
        }

        if (consume(TokenType.T_STRING)) {
            n.children.push(nodeFactory(current()));
        } else {
            //error
            n.children.push(nodeFactory(null));
            error(n, [TokenType.T_STRING]);
        }

        return node(n);
    }

    function namespaceStatement() {

        let n = tempNode(NonTerminalType.Namespace);
        next();
        lastDocComment;

        if (peek().tokenType === TokenType.T_STRING) {

            followOnStack.push([';', '{']);
            n.children.push(namespaceName());
            followOnStack.pop();

            if (consume(';')) {
                n.children.push(nodeFactory(null));
                return node(n);
            }

        }

        if (!consume('{')) {
            //error
            n.children.push(nodeFactory(null));
            error(n, ['{']);
            return node(n);
        }

        n.children.push(topStatementList(true));

        if (!consume('}')) {
            error(n, ['}'], ['}']);
            consume('}');

        }

        return node(n);

    }

    function namespaceName() {

        let n = tempNode(NonTerminalType.NamespaceName);

        if (peek().tokenType === TokenType.T_STRING) {
            n.children.push(nodeFactory(next()));
        } else {
            //error
            error(n, [TokenType.T_STRING]);
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

    function error(tempNode: TempNode, expected: (TokenType | string)[], followOn?: (TokenType | string)[]) {

        let unexpected = peek();
        let n = followOnStack.length;
        let syncTokens = followOn ? followOn.slice(0) : [];

        while (n--) {
            Array.prototype.push.apply(syncTokens, followOnStack[n]);
        }

        skip(syncTokens);
        if (!tempNode.value.errors) {
            tempNode.value.errors = [];
        }
        tempNode.value.errors.push(new ParseError(unexpected, expected));
        return peek();
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
