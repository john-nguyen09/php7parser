/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType, Position, Range } from './lexer';
import { ParseError } from './parseError';
import { TokenIterator } from './tokenIterator';

export enum AstNodeType {
    None, Error, TopStatementList, Namespace, NamespaceName, UseElement, UseStatement,
    UseGroup, UseList, HaltCompiler, ConstantDeclarationList, ConstantDeclaration,
    ArrayPair, Name, Call, Unpack, ArgumentList, Dimension, ClassConstant,
    StaticProperty, StaticMethodCall, MethodCall, Property, Closure,
    ParameterList, Parameter, Isset, Empty, Eval, Include, YieldFrom, Yield, Print,
    Backticks, EncapsulatedVariableList, AnonymousClassDeclaration, New,
    NameList, ClassStatementList, PropertyDeclaration, PropertyDeclarationList,
    ClassConstantDeclaration, ClassConstantDeclarationList, TypeExpression,
    InnerStatementList, FunctionDeclaration, MethodDeclaration, UseTrait, TraitAdaptationList,
    MethodReference, TraitPrecendence, TraitAlias, ClassDeclaration, TraitDeclaration,
    InterfaceDeclaration, Variable, ArrayPairList, ClosureUseVariable, ClosureUseList,
    Clone, Heredoc, DoubleQuotes, EmptyStatement, IfList, If, While, DoWhile,
    ForExpressionList, For, Break, Continue, Return, GlobalVariableList, StaticVariableList,
    StaticVariable, Echo, Unset, Throw, Goto, Label, Foreach, CaseList, Switch,
    Case, Declare, Try, Catch, CatchNameList, Finally, TernaryExpression,
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
    BinaryBitwiseOrAssign, BinaryBitwiseAndAssign, BinaryBitwiseXorAssign, BinaryInstanceOf,
    MagicConstant, CatchList, ErrorStaticMember, ErrorArgument, ErrorVariable, ErrorExpression,
    ErrorClassStatement, ErrorPropertyName, ErrorTraitAdaptation
}

export enum AstNodeFlag {
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

    Nullable, NameFq, NameNotFq, NameRelative, MagicLine, MagicFile, MagicDir, MagicNamespace,
    MagicFunction, MagicMethod, MagicClass, MagicTrait, UseClass, UseFunction, UseConstant
}

export interface AstNodeFactory<T> {
    (value: AstNode | Token, children?: T[]): T;
}

interface Predicate {
    (t: Token): boolean;
}

enum Associativity {
    None,
    Left,
    Right
}

enum OpType {
    None = 0,
    Unary = 1,
    Binary = 2
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


interface TempNode<T> {
    value: AstNode;
    children: T[];
}

export interface AstNode {
    astNodeType: AstNodeType;
    startTokenIndex: number;
    endTokenIndex:number;
    flag?: AstNodeFlag;
    doc?: Token;
    errors?: ParseError[];
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

export class Parser<T> {

    private _nodeFactory: AstNodeFactory<T>;
    private _opPrecedenceMap = opPrecedenceMap;
    private _tokens: TokenIterator
    private _followOnStack: (TokenType | string)[][];
    private _isBinaryOpPredicate: Predicate;
    private _variableAtomType: AstNodeType;


    constructor(nodeFactory: AstNodeFactory<T>) {
        this._nodeFactory = nodeFactory;
    }

    parse(tokens: Token[]) {

        this._followOnStack = [];
        this._tokens = new TokenIterator(tokens);
        return this._topStatementList(false);

    }

    private _tempNode(type: AstNodeType = 0, startPos?: number): TempNode<T> {

        if (startPos === undefined) {
            startPos = this._startPos();
        }

        return {
            value: {
                astNodeType: type,
                startTokenIndex:startPos,
                endTokenIndex:0,
            },
            children: []
        };
    }


    private _node(tempNode: TempNode<T>, endPos?: number) {

        if (!endPos) {
            endPos = this._endPos();
        }
        tempNode.value.endTokenIndex = endPos;
        return this._nodeFactory(tempNode.value, tempNode.children);

    }

    private _startPos() {
        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_EOF) {
            return this._tokens.current.index;
        }

        return t.index;
    }

    private _endPos() {
        return this._tokens.current.index;
    }

    private _topStatementList(isCurly: boolean) {

        let n = this._tempNode(AstNodeType.TopStatementList);
        let t: Token;
        let breakOn = isCurly ? '}' : TokenType.T_EOF;
        let followOn = recoverTopStatementStartTokenTypes.slice(0);
        followOn.push(breakOn);

        while (true) {

            t = this._tokens.peek();
            if (this._isTopStatementStartToken(t)) {
                this._followOnStack.push(followOn)
                n.children.push(this._topStatement());
                this._followOnStack.pop();
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                //error
                t = this._error(n, followOn, followOn);
                if (t.tokenType === ';') {
                    this._tokens.next();
                } else if (t.tokenType === TokenType.T_EOF) {
                    break;
                }
            }

        }

        return this._node(n);

    }

    private _topStatement() {

        let t = this._tokens.peek();

        switch (t.tokenType) {
            case TokenType.T_NAMESPACE:
                return this._namespaceStatement();
            case TokenType.T_USE:
                return this._useStatement();
            case TokenType.T_HALT_COMPILER:
                return this._haltCompilerStatement();
            case TokenType.T_CONST:
                return this._constantDeclarationStatement();
            case TokenType.T_FUNCTION:
                return this._functionDeclarationStatement();
            case TokenType.T_CLASS:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                return this._classDeclarationStatement();
            case TokenType.T_TRAIT:
                return this._traitDeclarationStatement();
            case TokenType.T_INTERFACE:
                return this._interfaceDeclarationStatement();
            default:
                return this._statement();
        }

    }

    private _constantDeclarationStatement() {

        let n = this._tempNode(AstNodeType.ConstantDeclarationList);
        this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];
        let t: Token;

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._constantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ';') {
                this._tokens.next();
                break;
            } else {
                if (this._error(n, [',', ';'], [';']).tokenType === ';') {
                    this._tokens.next();
                }
                break;
            }
        }

        return this._node(n);

    }

    private _constantDeclaration() {

        let n = this._tempNode(AstNodeType.ConstantDeclaration);
        let t: Token;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
            n.value.doc = this._tokens.lastDocComment;
        } else {
            this._error(n, [TokenType.T_STRING]);
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._node(n);
        }

        if (!this._tokens.consume('=')) {
            this._error(n, ['=']);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        n.children.push(this._expression());
        return this._node(n);

    }

    private _expression(minPrecedence = 0) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let startPos = this._startPos();
        let opFlag: AstNodeFlag;
        this._isBinaryOpPredicate = isVariableAndExpressionBinaryOp;
        let lhs = this._atom();

        while (true) {

            op = this._tokens.peek();

            if (!this._isBinaryOpPredicate(op)) {
                break;
            }

            [precedence, associativity] = this._opPrecedenceMap[op.text];

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }

            this._tokens.next();
            if (op.tokenType === '?') {
                lhs = this._ternaryExpression(lhs, precedence, startPos);
            } else {
                let rhs: T;
                if (op.tokenType === '=' && this._tokens.peek().tokenType === '&') {
                    rhs = this._unaryExpression();
                } else {
                    rhs = op.tokenType === TokenType.T_INSTANCEOF ? this._newVariable() : this._expression(precedence);
                }

                lhs = this._binaryNode(lhs, rhs, this._binaryOpToNodeType(op), startPos);
            }

        }

        return lhs;

    }

    private _binaryNode(lhs: T, rhs: T, type: AstNodeType, startPos: number) {
        let tempNode = this._tempNode(type, startPos);
        tempNode.children.push(lhs);
        tempNode.children.push(rhs);
        return this._node(tempNode);
    }

    private _unaryOpToNodeType(op: Token, isPost = false) {
        switch (op.tokenType) {
            case '&':
                return AstNodeType.UnaryReference;
            case '!':
                return AstNodeType.UnaryBoolNot;
            case '~':
                return AstNodeType.UnaryBitwiseNot;
            case '-':
                return AstNodeType.UnaryMinus;
            case '+':
                return AstNodeType.UnaryPlus;
            case '@':
                return AstNodeType.UnarySilence;
            case TokenType.T_INC:
                return isPost ? AstNodeType.UnaryPreInc : AstNodeType.UnaryPostInc;
            case TokenType.T_DEC:
                return isPost ? AstNodeType.UnaryPreDec : AstNodeType.UnaryPostDec;
            default:
                throw new Error(`Unknow operator ${op.text}`);
        }
    }

    private _binaryOpToNodeType(op: Token) {

        switch (op.tokenType) {
            case '|':
                return AstNodeType.BinaryBitwiseOr;
            case '&':
                return AstNodeType.BinaryBitwiseAnd;
            case '^':
                return AstNodeType.BinaryBitwiseXor;
            case '.':
                return AstNodeType.BinaryConcat;
            case '+':
                return AstNodeType.BinaryAdd;
            case '-':
                return AstNodeType.BinarySubtract;
            case '*':
                return AstNodeType.BinaryMultiply;
            case '/':
                return AstNodeType.BinaryDivide;
            case '%':
                return AstNodeType.BinaryModulus;
            case TokenType.T_POW:
                return AstNodeType.BinaryPower;
            case TokenType.T_SL:
                return AstNodeType.BinaryShiftLeft;
            case TokenType.T_SR:
                return AstNodeType.BinaryShiftRight;
            case TokenType.T_BOOLEAN_AND:
                return AstNodeType.BinaryBoolAnd;
            case TokenType.T_BOOLEAN_OR:
                return AstNodeType.BinaryBoolOr;
            case TokenType.T_LOGICAL_AND:
                return AstNodeType.BinaryLogicalAnd;
            case TokenType.T_LOGICAL_OR:
                return AstNodeType.BinaryLogicalOr;
            case TokenType.T_LOGICAL_XOR:
                return AstNodeType.BinaryLogicalXor;
            case TokenType.T_IS_IDENTICAL:
                return AstNodeType.BinaryIsIdentical;
            case TokenType.T_IS_NOT_IDENTICAL:
                return AstNodeType.BinaryIsNotIdentical;
            case TokenType.T_IS_EQUAL:
                return AstNodeType.BinaryIsEqual;
            case TokenType.T_IS_NOT_EQUAL:
                return AstNodeType.BinaryIsNotEqual;
            case '<':
                return AstNodeType.BinaryIsSmaller;
            case TokenType.T_IS_SMALLER_OR_EQUAL:
                return AstNodeType.BinaryIsSmallerOrEqual;
            case '>':
                return AstNodeType.BinaryIsGreater;
            case TokenType.T_IS_GREATER_OR_EQUAL:
                return AstNodeType.BinaryIsGreaterOrEqual;
            case TokenType.T_SPACESHIP:
                return AstNodeType.BinarySpaceship;
            case TokenType.T_COALESCE:
                return AstNodeType.BinaryCoalesce;
            case '=':
                return AstNodeType.BinaryAssign;
            case TokenType.T_CONCAT_EQUAL:
                return AstNodeType.BinaryConcatAssign;
            case TokenType.T_PLUS_EQUAL:
                return AstNodeType.BinaryAddAssign;
            case TokenType.T_MINUS_EQUAL:
                return AstNodeType.BinarySubtractAssign;
            case TokenType.T_MUL_EQUAL:
                return AstNodeType.BinaryMultiplyAssign;
            case TokenType.T_DIV_EQUAL:
                return AstNodeType.BinaryDivideAssign;
            case TokenType.T_MOD_EQUAL:
                return AstNodeType.BinaryModulusAssign;
            case TokenType.T_POW_EQUAL:
                return AstNodeType.BinaryPowerAssign;
            case TokenType.T_SL_EQUAL:
                return AstNodeType.BinaryShiftLeftAssign;
            case TokenType.T_SR_EQUAL:
                return AstNodeType.BinaryShiftRightAssign;
            case TokenType.T_OR_EQUAL:
                return AstNodeType.BinaryBitwiseOrAssign;
            case TokenType.T_AND_EQUAL:
                return AstNodeType.BinaryBitwiseAndAssign;
            case TokenType.T_XOR_EQUAL:
                return AstNodeType.BinaryBitwiseXorAssign;
            case TokenType.T_INSTEADOF:
                return AstNodeType.BinaryInstanceOf;
            default:
                throw new Error(`Unknown operator ${op.text}`);

        }

    }

    private _ternaryExpression(lhs: T, precedence: number, startPos: number) {

        let n = this._tempNode(AstNodeType.TernaryExpression, startPos);
        n.children.push(lhs);

        if (this._tokens.consume(':')) {
            n.children.push(this._nodeFactory(null));
        } else {
            this._followOnStack.push([':']);
            n.children.push(this._expression(precedence));
            this._followOnStack.pop();

            if (!this._tokens.consume(':')) {
                //error
                this._error(n, [':']);
                n.children.push(this._nodeFactory(null));
                return this._node(n);
            }

        }

        n.children.push(this._expression(precedence));
        return this._node(n);

    }

    private _atom() {

        let t = this._tokens.peek();

        switch (t.tokenType) {
            case TokenType.T_STATIC:
                if (this._tokens.peek(1).tokenType === TokenType.T_FUNCTION) {
                    return this._closure();
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
                this._isBinaryOpPredicate = isBinaryOp;
                let possibleUnaryStart = t.index;
                let variable = this._variable();
                t = this._tokens.peek();
                if (t.tokenType === TokenType.T_INC || t.tokenType === TokenType.T_DEC) {
                    this._tokens.next();
                    let unary = this._tempNode(
                        t.tokenType === TokenType.T_INC ? AstNodeType.UnaryPostInc : AstNodeType.UnaryPostDec, possibleUnaryStart
                    );
                    unary.children.push(variable);
                    return this._node(unary);
                } else {
                    return variable;
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
                return this._unaryExpression();
            case TokenType.T_LIST:
                this._isBinaryOpPredicate = isAssignBinaryOp;
                return this._listExpression();
            case TokenType.T_CLONE:
                return this._cloneExpression();
            case TokenType.T_NEW:
                return this._newExpression();
            case TokenType.T_DNUMBER:
            case TokenType.T_LNUMBER:
                return this._nodeFactory(this._tokens.next());
            case TokenType.T_LINE:
            case TokenType.T_FILE:
            case TokenType.T_DIR:
            case TokenType.T_TRAIT_C:
            case TokenType.T_METHOD_C:
            case TokenType.T_FUNC_C:
            case TokenType.T_NS_C:
            case TokenType.T_CLASS_C:
                let magic = this._tempNode(AstNodeType.MagicConstant);
                magic.value.flag = this._magicConstantTokenToFlag(this._tokens.next());
                return this._node(magic);
            case TokenType.T_START_HEREDOC:
                return this._heredoc();
            case '"':
                return this._quotedEncapsulatedVariableList(AstNodeType.DoubleQuotes, '"');
            case '`':
                return this._quotedEncapsulatedVariableList(AstNodeType.Backticks, '`');
            case TokenType.T_PRINT:
                return this._keywordExpression(AstNodeType.Print);
            case TokenType.T_YIELD:
                return this._yield();
            case TokenType.T_YIELD_FROM:
                return this._keywordExpression(AstNodeType.YieldFrom);
            case TokenType.T_FUNCTION:
                return this._closure();
            case TokenType.T_INCLUDE:
            case TokenType.T_INCLUDE_ONCE:
            case TokenType.T_REQUIRE:
            case TokenType.T_REQUIRE_ONCE:
                return this._keywordExpression(AstNodeType.Include);
            case TokenType.T_EVAL:
                return this._keywordParenthesisedExpression(AstNodeType.Eval);
            case TokenType.T_EMPTY:
                return this._keywordParenthesisedExpression(AstNodeType.Empty);
            case TokenType.T_ISSET:
                return this._isset();
            default:
                //error
                let err = this._tempNode(AstNodeType.ErrorExpression);
                this._error(err, []);
                return this._node(err);
        }

    }

    private _magicConstantTokenToFlag(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_LINE:
                return AstNodeFlag.MagicLine;
            case TokenType.T_FILE:
                return AstNodeFlag.MagicFile;
            case TokenType.T_DIR:
                return AstNodeFlag.MagicDir;
            case TokenType.T_TRAIT_C:
                return AstNodeFlag.MagicTrait;
            case TokenType.T_METHOD_C:
                return AstNodeFlag.MagicMethod;
            case TokenType.T_FUNC_C:
                return AstNodeFlag.MagicFunction;
            case TokenType.T_NS_C:
                return AstNodeFlag.MagicNamespace;
            case TokenType.T_CLASS_C:
                return AstNodeFlag.MagicClass;
            default:
                return 0;
        }
    }

    private _isset() {

        let n = this._tempNode(AstNodeType.Isset);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['(']);
            return this._node(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                if (this._error(n, followOn, [')']).tokenType === ')') {
                    this._tokens.next();
                }
                break;
            }

        }

        return this._node(n);

    }

    private _keywordParenthesisedExpression(type: AstNodeType) {

        let n = this._tempNode(type);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['(']);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        this._followOnStack.push([')']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            if (this._error(n, [')'], [')']).tokenType === ')') {
                this._tokens.next();
            }
        }

        return this._node(n);

    }

    private _keywordExpression(nodeType: AstNodeType) {

        let n = this._tempNode(nodeType);
        this._tokens.next();
        n.children.push(this._expression());
        return this._node(n);
    }



    private _yield() {

        let n = this._tempNode(AstNodeType.Yield);
        this._tokens.next();

        if (!this._isExpressionStartToken(this._tokens.peek())) {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._node(n);
        }

        this._followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_DOUBLE_ARROW)) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        n.children.push(this._expression());
        return this._node(n);

    }

    private _quotedEncapsulatedVariableList(type: AstNodeType, closeTokenType: TokenType | string) {

        let n = this._tempNode(type);
        this._tokens.next();
        this._followOnStack.push([closeTokenType]);
        n.children.push(this._encapsulatedVariableList(closeTokenType));
        this._followOnStack.pop();

        if (!this._tokens.consume(closeTokenType)) {
            //error
            if (this._error(n, [closeTokenType], [closeTokenType]).tokenType === closeTokenType) {
                this._tokens.next();
            }
        }

        return this._node(n);

    }

    private _encapsulatedVariableList(breakOn: TokenType | string) {

        let n = this._tempNode(AstNodeType.EncapsulatedVariableList);
        let followOn: (TokenType | string)[] = [
            TokenType.T_ENCAPSED_AND_WHITESPACE, TokenType.T_VARIABLE,
            TokenType.T_DOLLAR_OPEN_CURLY_BRACES, TokenType.T_CURLY_OPEN, breakOn
        ];

        this._followOnStack.push(followOn);
        while (true) {

            switch (this._tokens.peek().tokenType) {
                case TokenType.T_ENCAPSED_AND_WHITESPACE:
                    n.children.push(this._nodeFactory(this._tokens.next()));
                    continue;
                case TokenType.T_VARIABLE:
                    let t = this._tokens.peek(1);
                    if (t.tokenType === '[') {
                        n.children.push(this._encapsulatedDimension());
                    } else if (t.tokenType === TokenType.T_OBJECT_OPERATOR) {
                        n.children.push(this._encapsulatedProperty());
                    } else {
                        n.children.push(this._simpleVariable());
                    }
                    continue;
                case TokenType.T_DOLLAR_OPEN_CURLY_BRACES:
                    n.children.push(this._dollarCurlyOpenEncapsulatedVariable());
                    continue;
                case TokenType.T_CURLY_OPEN:
                    n.children.push(this._curlyOpenEncapsulatedVariable());
                    continue;
                case breakOn:
                    break;
                default:
                    //error
                    if (followOn.indexOf(this._error(n, followOn).tokenType) === -1) {
                        break;
                    }
            }

            break;

        }

        this._followOnStack.pop();
        return this._node(n);

    }

    private _curlyOpenEncapsulatedVariable() {

        //errNode placeholder for unclosed braces
        let errNode = this._tempNode(AstNodeType.ErrorVariable);
        this._tokens.next();
        this._followOnStack.push(['}']);
        errNode.children.push(this._variable());
        this._followOnStack.pop();

        if (this._tokens.consume('}')) {
            //discard errNode
            return errNode.children.pop();
        } else {
            if (this._error(errNode, ['}'], ['}']).tokenType === '}') {
                this._tokens.next();
            }
            return this._node(errNode);
        }

    }

    private _dollarCurlyOpenEncapsulatedVariable() {

        //err node is just a placeholder should closing brace not found
        let errNode = this._tempNode(AstNodeType.ErrorVariable);
        let n: TempNode<T>;
        this._tokens.next(); //${
        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_STRING_VARNAME) {

            if (this._tokens.peek(1).tokenType === '[') {
                n = this._tempNode(AstNodeType.Dimension);
                n.children.push(this._simpleVariable());
                this._tokens.next();
                this._followOnStack.push([']', '}']);
                n.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume(']')) {
                    //error
                    if (this._error(n, [']'], [']', '}']).tokenType === ']') {
                        this._tokens.next();
                    }
                }

            } else {
                n = this._tempNode(AstNodeType.Variable);
                n.children.push(this._nodeFactory(this._tokens.next()));
            }

            errNode.children.push(this._node(n));

        } else if (this._isExpressionStartToken(t)) {
            this._followOnStack.push(['}']);
            errNode.children.push(this._expression());
            this._followOnStack.pop();
        } else {
            //error
            this._error(errNode, [], ['}']);
        }

        if (this._tokens.consume('}')) {
            return errNode.value.errors.length ? this._node(errNode) : errNode.children.pop();
        } else {
            //error
            if (this._error(errNode, ['}'], ['}']).tokenType === '}') {
                this._tokens.next();
            }
            return this._node(errNode);
        }


    }

    private _encapsulatedDimension() {

        let n = this._tempNode(AstNodeType.Dimension);
        n.children.push(this._simpleVariable());

        //will always be [
        this._tokens.next();

        this._followOnStack.push([']']);

        switch (this._tokens.peek().tokenType) {
            case TokenType.T_STRING:
            case TokenType.T_NUM_STRING:
                n.children.push(this._nodeFactory(this._tokens.next()));
                break;
            case TokenType.T_VARIABLE:
                n.children.push(this._simpleVariable());
                break;
            case '-':
                let unary = this._tempNode(AstNodeType.UnaryMinus);
                this._tokens.next();
                if (this._tokens.consume(TokenType.T_NUM_STRING)) {
                    unary.children.push(this._nodeFactory(this._tokens.current));
                } else {
                    this._error(unary, [TokenType.T_NUM_STRING]);
                }
                n.children.push(this._node(unary));
                break;
            default:
                //error
                n.children.push(this._nodeFactory(null));
                this._error(n, [
                    TokenType.T_STRING, TokenType.T_NUM_STRING, TokenType.T_VARIABLE, '-'
                ]);
                break;
        }

        this._followOnStack.pop();

        if (!this._tokens.consume(']')) {
            //error
            if (this._error(n, [']'], [']']).tokenType === ']') {
                this._tokens.next();
            }
        }

        return this._node(n);

    }

    private _encapsulatedProperty() {
        let n = this._tempNode(AstNodeType.Property);
        n.children.push(this._simpleVariable());

        // will always be TokenType.T_OBJECT_OPERATOR
        this._tokens.next();

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            this._error(n, [TokenType.T_STRING]);
        }

        return this._node(n);
    }

    private _heredoc() {

        let n = this._tempNode(AstNodeType.Heredoc);
        let t = this._tokens.next();

        this._followOnStack.push([TokenType.T_END_HEREDOC]);
        n.children.push(this._encapsulatedVariableList(TokenType.T_END_HEREDOC));
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_END_HEREDOC)) {
            //error
            if (this._error(n, [TokenType.T_END_HEREDOC], [TokenType.T_END_HEREDOC]).tokenType === TokenType.T_END_HEREDOC) {
                this._tokens.next();
            }

        }

        return this._node(n);

    }

    private _anonymousClassDeclaration() {

        let n = this._tempNode(AstNodeType.AnonymousClassDeclaration);
        this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.peek().tokenType === '(') {
            this._followOnStack.push([TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._argumentList());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (this._tokens.consume(TokenType.T_EXTENDS)) {
            this._followOnStack.push([TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._name());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (this._tokens.consume(TokenType.T_IMPLEMENTS)) {
            this._followOnStack.push(['{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        n.children.push(this._classStatementList());
        return this._node(n);

    }

    private _classStatementList() {

        let n = this._tempNode(AstNodeType.ClassStatementList);
        let t: Token;

        if (!this._tokens.consume('{')) {
            //error
            this._error(n, ['{']);
            return this._node(n);
        }

        let followOn: (TokenType | string)[] = recoverClassStatementStartTokenTypes.slice(0);
        followOn.push('}');

        while (true) {
            t = this._tokens.peek();

            if (t.tokenType === '}') {
                this._tokens.next();
                break;
            } else if (this._isClassStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._classStatement());
                this._followOnStack.pop();
            } else {
                //error
                t = this._error(n, followOn, followOn);
                if (!this._isClassStatementStartToken(t) && t.tokenType !== '}') {
                    break;
                }
            }

        }

        return this._node(n);

    }

    private _isClassStatementStartToken(t: Token) {
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

    private _classStatement() {

        let n = this._tempNode(AstNodeType.ErrorClassStatement);
        let t = this._tokens.peek();

        switch (t.tokenType) {
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                n.value.flag = this._memberModifierList();
                t = this._tokens.peek();
                if (t.tokenType === TokenType.T_VARIABLE) {
                    return this._propertyDeclarationStatement(n);
                } else if (t.tokenType === TokenType.T_FUNCTION) {
                    return this._methodDeclarationStatement(n);
                } else if (t.tokenType === TokenType.T_CONST) {
                    return this._classConstantDeclarationStatement(n);
                } else {
                    //error
                    this._error(n,
                        [TokenType.T_VARIABLE, TokenType.T_FUNCTION, TokenType.T_CONST]
                    );
                    return this._node(n);
                }
            case TokenType.T_FUNCTION:
                return this._methodDeclarationStatement(n);
            case TokenType.T_VAR:
                this._tokens.next();
                n.value.flag = AstNodeFlag.ModifierPublic;
                return this._propertyDeclarationStatement(n);
            case TokenType.T_CONST:
                n.value.flag = AstNodeFlag.ModifierPublic;
                return this._classConstantDeclarationStatement(n);
            case TokenType.T_USE:
                return this._useTraitStatement();
            default:
                //error
                //should never get here
                throw new Error(`Unexpected token ${t.tokenType}`);

        }

    }

    private _useTraitStatement() {

        let n = this._tempNode(AstNodeType.UseTrait);
        let t = this._tokens.next();
        this._followOnStack.push([';', '{']);
        n.children.push(this._nameList());
        this._followOnStack.pop();
        n.children.push(this._traitAdaptationList());
        return this._node(n);

    }

    private _traitAdaptationList() {

        let n = this._tempNode(AstNodeType.TraitAdaptationList);
        let t: Token;

        if (this._tokens.consume(';')) {
            return this._node(n);
        }

        if (!this._tokens.consume('{')) {
            this._error(n, ['{']);
            return this._node(n, this._endPos());
        }

        this._followOnStack.push(['}']);

        while (true) {

            t = this._tokens.peek();

            if (t.tokenType === '}') {
                this._tokens.next();
                break;
            } else if (t.tokenType === TokenType.T_STRING ||
                t.tokenType === TokenType.T_NAMESPACE ||
                t.tokenType === TokenType.T_NS_SEPARATOR ||
                this._isSemiReservedToken(t)) {
                n.children.push(this._traitAdaptation());
            } else {
                //error
                t = this._error(n, [
                    '}', TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR
                ]);
                if (t.tokenType !== '}') {
                    break;
                }
            }

        }

        this._followOnStack.pop();
        return this._node(n);

    }

    private _traitAdaptation() {

        let n = this._tempNode(AstNodeType.ErrorTraitAdaptation);
        let t = this._tokens.peek();
        let t2 = this._tokens.peek(1);

        if (t.tokenType === TokenType.T_NAMESPACE ||
            t.tokenType === TokenType.T_NS_SEPARATOR ||
            (t.tokenType === TokenType.T_STRING &&
                (t2.tokenType === TokenType.T_PAAMAYIM_NEKUDOTAYIM || t2.tokenType === TokenType.T_NS_SEPARATOR))) {

            this._followOnStack.push([TokenType.T_INSTEADOF, TokenType.T_AS]);
            n.children.push(this._methodReference());
            this._followOnStack.pop();

            if (this._tokens.consume(TokenType.T_INSTEADOF)) {
                return this._traitPrecedence(n);
            }

        } else if (t.tokenType === TokenType.T_STRING || this._isSemiReservedToken(t)) {

            let methodRef = this._tempNode(AstNodeType.MethodReference, n.value.startTokenIndex);
            methodRef.children.push(this._nodeFactory(null), this._nodeFactory(this._tokens.next()));
            n.children.push(this._node(methodRef));
        } else {
            //error
            this._error(n, [TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR, TokenType.T_STRING]);
            return this._node(n);
        }

        return this._traitAlias(n);


    }

    private _traitAlias(n: TempNode<T>) {


        if (this._tokens.consume(TokenType.T_AS)) {
            this._error(n, [TokenType.T_AS]);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_STRING || this._isReservedToken(t)) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else if (t.tokenType === TokenType.T_PUBLIC || t.tokenType === TokenType.T_PROTECTED || t.tokenType === TokenType.T_PRIVATE) {
            n.value.flag = this._memberModifierToFlag(this._tokens.next());
            t = this._tokens.peek();
            if (t.tokenType === TokenType.T_STRING || this._isSemiReservedToken(t)) {
                n.children.push(this._nodeFactory(this._tokens.next()));
            } else {
                n.children.push(this._nodeFactory(null));
            }
        } else {
            //error
            this._error(n, [TokenType.T_STRING, TokenType.T_PUBLIC, TokenType.T_PROTECTED, TokenType.T_PRIVATE]);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        if (!this._tokens.consume(';')) {
            //error
            if (this._error(n, [';'], [';']).tokenType === ';') {
                this._tokens.next();
            }
        }

        return this._node(n);

    }

    private _traitPrecedence(n: TempNode<T>) {

        n.value.astNodeType = AstNodeType.TraitPrecendence;
        this._followOnStack.push([';']);
        n.children.push(this._nameList());
        this._followOnStack.pop();

        if (!this._tokens.consume(';')) {
            //error
            if (this._error(n, [';'], [';']).tokenType === ';') {
                this._tokens.next();
            }
        }

        return this._node(n);

    }

    private _methodReference() {

        let n = this._tempNode(AstNodeType.MethodReference, this._startPos());

        this._followOnStack.push([TokenType.T_PAAMAYIM_NEKUDOTAYIM]);
        n.children.push(this._name());
        this._followOnStack.pop();

        if (this._tokens.consume(TokenType.T_PAAMAYIM_NEKUDOTAYIM)) {
            //error
            this._error(n, [TokenType.T_PAAMAYIM_NEKUDOTAYIM], [TokenType.T_STRING]);
        }

        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_STRING || this._isSemiReservedToken(t)) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING]);
        }

        return this._node(n, this._endPos());

    }

    private _methodDeclarationStatement(n: TempNode<T>) {

        n.value.astNodeType = AstNodeType.MethodDeclaration;
        this._tokens.next(); //T_FUNCTION
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume('&')) {
            n.value.flag |= AstNodeFlag.ReturnsRef;
        }

        let t = this._tokens.peek();
        if (t.tokenType !== TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            //error
            this._error(n, [TokenType.T_STRING], [';', ':', '{', '(']);
            n.children.push(this._nodeFactory(null));
        } else {
            n.children.push(this._nodeFactory(this._tokens.next()));
        }

        this._followOnStack.push([':', ';', '{']);
        n.children.push(this._parameterList());
        this._followOnStack.pop();

        if (this._tokens.peek().tokenType === ':') {
            n.children.push(this._returnType());
        } else {
            n.children.push(this._nodeFactory(null));
        }

        t = this._tokens.peek();
        if (t.tokenType === ';' && (n.value.flag & AstNodeFlag.ModifierAbstract)) {
            this._tokens.next();
            n.children.push(this._nodeFactory(null));
        } else if (t.tokenType === '{') {
            this._tokens.next();
            this._followOnStack.push(['}']);
            n.children.push(this._innerStatementList(['}']));
            this._followOnStack.pop();
            if (!this._tokens.consume('}')) {
                if (this._error(n, ['}'], ['}']).tokenType === '}') {
                    this._tokens.next();
                }
            }
        } else {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, [';', '{']);
        }

        return this._node(n);

    }

    private _innerStatementList(breakOn: (TokenType | string)[], tempNode: TempNode<T> = null) {

        let n = tempNode ? tempNode : this._tempNode(AstNodeType.InnerStatementList);
        let t: Token;
        let followOn = recoverInnerStatementStartTokenTypes;

        while (true) {

            t = this._tokens.peek();

            if (this._isInnerStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._innerStatement());
                this._followOnStack.pop();
            } else if (breakOn.indexOf(t.tokenType) !== -1) {
                break;
            } else {
                //error
                t = this._error(n, followOn, followOn);
                if (t.tokenType === ';') {
                    this._tokens.next();
                } else if (!this._isInnerStatementStartToken(t) && breakOn.indexOf(t.tokenType) === -1) {
                    break;
                }
            }
        }

        if (!tempNode) {
            return this._node(n);
        }

    }

    private _innerStatement() {

        let t = this._tokens.peek();

        switch (t.tokenType) {
            case TokenType.T_FUNCTION:
                return this._functionDeclarationStatement();
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_CLASS:
                return this._classDeclarationStatement();
            case TokenType.T_TRAIT:
                return this._traitDeclarationStatement();
            case TokenType.T_INTERFACE:
                return this._interfaceDeclarationStatement();
            default:
                return this._statement();

        }

    }

    private _interfaceDeclarationStatement() {

        let n = this._tempNode(AstNodeType.InterfaceDeclaration);
        let t = this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING], [TokenType.T_EXTENDS, '{']);
        }

        if (this._tokens.consume(TokenType.T_EXTENDS)) {
            this._followOnStack.push(['{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        n.children.push(this._classStatementList());
        return this._node(n);

    }

    private _traitDeclarationStatement() {

        let n = this._tempNode(AstNodeType.TraitDeclaration);
        let t = this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING], ['{']);
        }

        n.children.push(this._classStatementList());
        return this._node(n);
    }

    private _functionDeclarationStatement() {

        let n = this._tempNode(AstNodeType.FunctionDeclaration);

        this._tokens.next(); //T_FUNCTION

        if (this._tokens.consume('&')) {
            n.value.flag = AstNodeFlag.ReturnsRef;
        }

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING], ['(', ':', '{']);
        }

        n.children.push(this._parameterList());

        if (this._tokens.consume(':')) {
            this._followOnStack.push(['{']);
            n.children.push(this._returnType());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume('{')) {
            n.children.push(this._nodeFactory(null));
            this._error(n, ['{']);
            return this._node(n);
        }

        this._followOnStack.push(['}']);
        n.children.push(this._innerStatementList(['}']));
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            if (this._error(n, ['}'], ['}']).tokenType === '}') {
                this._tokens.next();
            }
        }
        return this._node(n);

    }

    private _classDeclarationStatement() {

        let n = this._tempNode(AstNodeType.ClassDeclaration);
        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_ABSTRACT || t.tokenType === TokenType.T_FINAL) {
            n.value.flag = this._classModifiers();
        }

        if (!this._tokens.consume(TokenType.T_CLASS)) {
            //error
            this._error(n, [TokenType.T_CLASS], [TokenType.T_STRING, TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
        }

        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            this._error(n, [TokenType.T_STRING], [TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._nodeFactory(null));
        }

        if (this._tokens.consume(TokenType.T_EXTENDS)) {
            this._followOnStack.push([TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (this._tokens.consume(TokenType.T_IMPLEMENTS)) {
            this._followOnStack.push(['{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        n.children.push(this._classStatementList());
        return this._node(n);

    }

    private _classModifiers() {

        let flag = 0;
        let t: Token;

        while (true) {
            t = this._tokens.peek();
            if (t.tokenType === TokenType.T_ABSTRACT || t.tokenType === TokenType.T_FINAL) {
                flag |= this._memberModifierToFlag(this._tokens.next());
            } else {
                break;
            }

        }

        return flag;

    }

    private _statement() {

        let t = this._tokens.peek();

        switch (t.tokenType) {
            case '{':
                let n = this._tempNode(AstNodeType.InnerStatementList);
                this._tokens.next();
                this._followOnStack.push(['}']);
                this._innerStatementList(['}'], n);
                this._followOnStack.pop();
                if (!this._tokens.consume('}')) {
                    if (this._error(n, ['}'], ['}']).tokenType === '}') {
                        this._tokens.next();
                    }
                }
                return this._node(n);
            case TokenType.T_IF:
                return this._ifStatementList();
            case TokenType.T_WHILE:
                return this._whileStatement();
            case TokenType.T_DO:
                return this._doWhileStatement();
            case TokenType.T_FOR:
                return this._forStatement();
            case TokenType.T_SWITCH:
                return this._switchStatement();
            case TokenType.T_BREAK:
                return this._keywordOptionalExpressionStatement(AstNodeType.Break);
            case TokenType.T_CONTINUE:
                return this._keywordOptionalExpressionStatement(AstNodeType.Continue);
            case TokenType.T_RETURN:
                return this._keywordOptionalExpressionStatement(AstNodeType.Return);
            case TokenType.T_GLOBAL:
                return this._globalVariableDeclarationStatement();
            case TokenType.T_STATIC:
                return this._staticVariableDeclarationStatement();
            case TokenType.T_ECHO:
                return this._echoStatement();
            case TokenType.T_INLINE_HTML:
                let echo = this._tempNode(AstNodeType.Echo, this._startPos());
                echo.children.push(this._nodeFactory(this._tokens.next()));
                return this._node(echo, this._endPos());
            case TokenType.T_UNSET:
                return this._unsetStatement();
            case TokenType.T_FOREACH:
                return this._foreachStatement();
            case TokenType.T_DECLARE:
                return this._declareStatement();
            case TokenType.T_TRY:
                return this._try();
            case TokenType.T_THROW:
                return this._throwStatement();
            case TokenType.T_GOTO:
                return this._gotoStatement();
            case ';':
                let empty = this._tempNode(AstNodeType.EmptyStatement);
                this._tokens.next();
                return this._node(empty);
            case TokenType.T_STRING:
                if (this._tokens.peek(1).tokenType === ':') {
                    return this._labelStatement();
                }
            //fall though
            default:
                return this._expressionStatement();

        }

    }

    private _try() {

        let n = this._tempNode(AstNodeType.Try);
        let t = this._tokens.next(); //try

        if (!this._tokens.consume('{')) {
            this._error(n, ['{'], [...recoverInnerStatementStartTokenTypes, '{', '}', TokenType.T_CATCH, TokenType.T_FINALLY]);
            this._tokens.consume('{');
            this._tokens.consume(';');
        }

        this._followOnStack.push(['}', TokenType.T_CATCH, TokenType.T_FINALLY]);
        n.children.push(this._innerStatementList(['}']));
        this._followOnStack.pop();
        if (!this._tokens.consume('}')) {
            this._error(n, ['}'], ['}', TokenType.T_CATCH, TokenType.T_FINALLY]);
            this._tokens.consume('}');
        }

        this._followOnStack.push([TokenType.T_FINALLY]);
        n.children.push(this._catchList());
        this._followOnStack.pop();

        if (this._tokens.peek().tokenType === TokenType.T_FINALLY) {
            n.children.push(this._finallyStatement());
        } else {
            n.children.push(this._nodeFactory(null));
        }

        return this._node(n);

    }

    private _catchList() {

        let n = this._tempNode(AstNodeType.CatchList);
        this._followOnStack.push([TokenType.T_CATCH]);

        while (true) {

            if (this._tokens.peek().tokenType === TokenType.T_CATCH) {
                n.children.push(this._catchStatement());
            } else {
                break;
            }

        }

        this._followOnStack.pop();
        return this._node(n);

    }

    private _finallyStatement() {

        let n = this._tempNode(AstNodeType.InnerStatementList);
        let t = this._tokens.next(); //T_FINALLY

        if (!this._tokens.consume('{')) {
            //error
            this._error(n, ['{'], [...recoverInnerStatementStartTokenTypes, '{', '}']);
            this._tokens.consume('{');
            this._tokens.consume(';');
        }

        this._followOnStack.push(['}']);
        this._innerStatementList(['}'], n);
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            //error
            this._error(n, ['}'], ['}']);
            this._tokens.consume('}');
        }

        return this._node(n);

    }

    private _catchStatement() {

        let n = this._tempNode(AstNodeType.Catch);
        this._tokens.next();

        if (!this._tokens.consume('(')) {
            this._error(n, ['('], ['{', ')', TokenType.T_VARIABLE]);
            n.children.push(this._nodeFactory(null));
        }

        this._followOnStack.push([TokenType.T_VARIABLE, ')', '{']);
        n.children.push(this._catchNameList());
        this._followOnStack.pop();

        if (this._tokens.consume(TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            this._error(n, [TokenType.T_VARIABLE], [')', '{']);
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume(')')) {
            //error
            this._error(n, [')'], ['{']);
        }

        if (!this._tokens.consume('{')) {
            //error
            this._error(n, ['{'], ['}']);
        }

        this._followOnStack.push(['}']);
        n.children.push(this._innerStatementList(['}']));
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            //error
            this._error(n, ['}'], ['}'])
            this._tokens.consume('}');
        }

        return this._node(n);

    }

    private _catchNameList() {

        let n = this._tempNode(AstNodeType.NameList);
        let followOn = ['|'];
        let t: Token;

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._name());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === '|') {
                this._tokens.next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                //error
                this._error(n, ['|', ')']);
                break;
            }

        }

        return this._node(n);

    }

    private _declareStatement() {

        let n = this._tempNode(AstNodeType.Declare);
        this._tokens.next();

        if (this._tokens.consume('(')) {
            this._followOnStack.push([')']);
            n.children.push(this._declareConstantDeclarationList());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, ['('], [...recoverStatementStartTokenTypes, ':', ')']);
        }

        if (!this._tokens.consume(')')) {
            //error
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }

        let t = this._tokens.peek();

        if (t.tokenType === ':') {

            this._tokens.next();
            this._followOnStack.push([TokenType.T_ENDDECLARE, ';']);
            n.children.push(this._innerStatementList([TokenType.T_ENDDECLARE]));
            this._followOnStack.pop();

            if (!this._tokens.consume(TokenType.T_ENDDECLARE)) {
                //error
                this._error(n, [TokenType.T_ENDDECLARE], [';']);
            }

            if (!this._tokens.consume(';')) {
                //error
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }

        } else if (this._isStatementStartToken(t)) {
            n.children.push(this._statement());
        } else {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, []);
        }

        return this._node(n);

    }

    private _declareConstantDeclarationList() {

        let n = this._tempNode(AstNodeType.ConstantDeclarationList);
        let followOn = [','];
        let t: Token;

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._constantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ')') {
                break;
            } else {
                this._error(n, [',', ')']);
                break;
            }

        }

        return this._node(n);

    }



    private _switchStatement() {

        let n = this._tempNode(AstNodeType.Switch);
        this._tokens.next();

        if (this._tokens.consume('(')) {
            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();

        } else {
            //error
            this._error(n, ['('], [':', '{', TokenType.T_CASE, TokenType.T_DEFAULT]);
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [':', '{', TokenType.T_CASE, TokenType.T_DEFAULT]);
        }

        if (!this._tokens.consume('{') && !this._tokens.consume(':')) {
            this._error(n, ['{', ':'], [TokenType.T_CASE, TokenType.T_DEFAULT, '}', TokenType.T_ENDSWITCH]);
        }

        this._tokens.consume(';');
        this._followOnStack.push(['}', TokenType.T_ENDSWITCH]);
        n.children.push(this._caseStatementList());
        this._followOnStack.pop();

        let t = this._tokens.peek();

        if (t.tokenType === '}') {
            this._tokens.next();
        } else if (t.tokenType === TokenType.T_ENDSWITCH) {
            this._tokens.next();
            if (!this._tokens.consume(';')) {
                //error
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        } else {
            this._error(n, ['}', TokenType.T_ENDSWITCH], ['}', ';']);
            this._tokens.consume('}');
            this._tokens.consume(';');
        }

        return this._node(n);

    }

    private _caseStatementList() {

        let n = this._tempNode(AstNodeType.CaseList);
        let followOn: (TokenType | string)[] = [TokenType.T_CASE, TokenType.T_DEFAULT];
        let t: Token;
        let breakOn = ['}', TokenType.T_ENDSWITCH];

        while (true) {

            t = this._tokens.peek();

            if (t.tokenType === TokenType.T_CASE || t.tokenType === TokenType.T_DEFAULT) {
                this._followOnStack.push(followOn);
                n.children.push(this._caseStatement());
                this._followOnStack.pop();
            } else if (breakOn.indexOf(t.tokenType) !== -1) {
                break;
            } else {
                //error
                let recover = [TokenType.T_CASE, TokenType.T_DEFAULT, '}', TokenType.T_ENDSWITCH];
                if (recover.indexOf(this._error(n, recover, recover).tokenType) === -1) {
                    break;
                }
            }

        }

        return this._node(n);

    }

    private _caseStatement() {

        let n = this._tempNode(AstNodeType.Case);
        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_CASE) {
            this._tokens.next();
            this._followOnStack.push([';', ':']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        } else if (t.tokenType === TokenType.T_DEFAULT) {
            this._tokens.next();
            n.children.push(this._nodeFactory(null));
        } else {
            //error
            //should never reach here
            throw new Error(`Unexpected token ${this._tokens.peek().tokenType}`);
        }

        if (!this._tokens.consume(':') && !this._tokens.consume(';')) {
            this._error(n, [';', ':'], recoverInnerStatementStartTokenTypes);
            this._tokens.consume(';');
        }

        if (this._isInnerStatementStartToken(this._tokens.peek())) {
            n.children.push(this._innerStatementList(['}', TokenType.T_ENDSWITCH, TokenType.T_CASE, TokenType.T_DEFAULT]));
        } else {
            n.children.push(this._nodeFactory(null));
        }

        return this._node(n);

    }

    private _labelStatement() {

        let n = this._tempNode(AstNodeType.Label);
        n.children.push(this._nodeFactory(this._tokens.next()));
        this._tokens.next();
        return this._node(n);
    }

    private _gotoStatement() {

        let n = this._tempNode(AstNodeType.Goto);
        let t = this._tokens.next();

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING], [';']);
        }

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);

    }

    private _throwStatement() {

        let n = this._tempNode(AstNodeType.Throw);
        this._tokens.next();

        this._followOnStack.push([';']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);
    }

    private _foreachStatement() {

        let n = this._tempNode(AstNodeType.Foreach);
        let t = this._tokens.next();

        if (this._tokens.consume('(')) {
            this._followOnStack.push([')', TokenType.T_AS, TokenType.T_DOUBLE_ARROW]);
            n.children.push(this._expression());
            this._followOnStack.pop();
        } else {
            this._error(n, ['('], [...recoverStatementStartTokenTypes, ':', ')', TokenType.T_AS, TokenType.T_DOUBLE_ARROW]);
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume(TokenType.T_AS)) {
            this._error(n, [TokenType.T_AS], [')', TokenType.T_DOUBLE_ARROW]);
        }

        this._followOnStack.push([')', TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._foreachVariable());

        if (this._tokens.consume(TokenType.T_DOUBLE_ARROW)) {
            n.children.push(this._foreachVariable());
        } else {
            n.children.push(this._nodeFactory(null));
        }

        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }

        t = this._tokens.peek();

        if (t.tokenType === ':') {

            this._tokens.next();

            this._followOnStack.push([TokenType.T_ENDFOREACH, ';']);
            n.children.push(this._innerStatementList([TokenType.T_ENDFOREACH]));
            this._followOnStack.pop();

            if (!this._tokens.consume(TokenType.T_ENDFOREACH)) {
                this._error(n, [TokenType.T_ENDFOREACH], [';']);
            }

            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }

        } else if (this._isStatementStartToken(t)) {
            n.children.push(this._statement());
        } else {
            //error
            this._error(n, []);
            n.children.push(this._nodeFactory(null));
        }

        return this._node(n);

    }

    private _foreachVariable() {

        switch (this._tokens.peek().tokenType) {

            case '&':
                let unary = this._tempNode(AstNodeType.UnaryReference);
                this._tokens.next();
                unary.children.push(this._variable());
                return this._node(unary);
            case TokenType.T_LIST:
                return this._listExpression();
            case '[':
                return this._shortArray();
            default:
                if (this._isVariableStartToken(this._tokens.peek())) {
                    return this._variable();
                } else {
                    //error
                    let err = this._tempNode(AstNodeType.Error);
                    this._error(err, ['&', TokenType.T_LIST, '[', TokenType.T_VARIABLE]);
                    return this._node(err);
                }

        }

    }

    private _isVariableStartToken(t: Token) {

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

    private _unsetStatement() {

        let n = this._tempNode(AstNodeType.Unset);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['('], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }

        let followOn = [';', ')', ','];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._variable());
            this._followOnStack.pop();

            t = this._tokens.peek();
            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, [',', ')'], [';']);
                break;
            }

        }

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);

    }

    private _echoStatement() {

        let n = this._tempNode(AstNodeType.Echo);
        let t: Token;
        this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }

        }

        return this._node(n);

    }

    private _staticVariableDeclarationStatement() {

        let n = this._tempNode(AstNodeType.StaticVariableList);
        let t: Token;
        this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._staticVariableDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }

        }

        return this._node(n);

    }



    private _globalVariableDeclarationStatement() {

        let n = this._tempNode(AstNodeType.GlobalVariableList);
        let t = this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._simpleVariable());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }

        }

        return this._node(n);

    }

    private _staticVariableDeclaration() {

        let n = this._tempNode(AstNodeType.StaticVariable);

        if (this._tokens.peek().tokenType === TokenType.T_VARIABLE) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            this._error(n, [TokenType.T_VARIABLE]);
            return this._node(n);
        }

        if (!this._tokens.consume('=')) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        n.children.push(this._expression());
        return this._node(n);

    }

    private _keywordOptionalExpressionStatement(nodeType: AstNodeType) {
        let n = this._tempNode(nodeType);
        this._tokens.next();

        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([';']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);
    }


    private _forStatement() {

        let n = this._tempNode(AstNodeType.For);
        this._tokens.next(); //for

        if (!this._tokens.consume('(')) {
            //error
            n.children.push(this._nodeFactory(null), this._nodeFactory(null),
                this._nodeFactory(null), this._nodeFactory(null));
            this._error(n, ['(']);
            return this._node(n);
        }

        for (let k = 0; k < 2; ++k) {

            if (this._isExpressionStartToken(this._tokens.peek())) {
                this._followOnStack.push([';', ')']);
                n.children.push(this._forExpressionList(';'));
                this._followOnStack.pop();
            } else {
                n.children.push(this._nodeFactory(null));
            }

            if (!this._tokens.consume(';')) {
                //error
                this._error(n, [';'], [...recoverStatementStartTokenTypes, ':', ')']);
                break;
            }

        }

        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume(')')) {
            //error
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
            this._tokens.consume(';');
        }

        if (this._tokens.consume(':')) {

            this._followOnStack.push([TokenType.T_ENDFOR, ';']);
            n.children.push(this._innerStatementList([TokenType.T_ENDFOR]));
            this._followOnStack.pop();

            if (!this._tokens.consume(TokenType.T_ENDFOR)) {
                //error
                this._error(n, [TokenType.T_ENDFOR], [';']);
            }

            if (!this._tokens.consume(';')) {
                //error
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        } else if (this._isStatementStartToken(this._tokens.peek())) {
            n.children.push(this._statement());
        } else {
            //error
            this._error(n, []);
            n.children.push(this._nodeFactory(null));
        }

        return this._node(n);

    }

    private _forExpressionList(breakOn: TokenType | string) {

        let n = this._tempNode(AstNodeType.ForExpressionList);
        let followOn = [',', breakOn];
        let t: Token;

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();

            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType == breakOn) {
                break;
            } else {
                //error
                this._error(n, followOn);
                break;
            }

        }

        return this._node(n);

    }

    private _doWhileStatement() {

        let n = this._tempNode(AstNodeType.DoWhile);
        this._tokens.next();

        this._followOnStack.push([TokenType.T_WHILE, ';']);
        n.children.push(this._statement());
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_WHILE)) {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_WHILE], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }

        if (!this._tokens.consume('(')) {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, ['('], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }

        this._followOnStack.push([')', ';']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            this._error(n, [')'], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);

    }

    private _whileStatement() {

        let n = this._tempNode(AstNodeType.While);
        this._tokens.next();

        if (!this._tokens.consume('(')) {

            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        } else {
            //error
            this._error(n, ['('], [...recoverStatementStartTokenTypes, ')', ':']);
            n.children.push(this._nodeFactory(null));

        }


        if (!this._tokens.consume(')')) {
            //error
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }

        if (this._tokens.consume(':')) {
            this._followOnStack.push([TokenType.T_ENDWHILE, ';']);
            n.children.push(this._innerStatementList([TokenType.T_ENDWHILE]));
            this._followOnStack.pop();

            if (!this._tokens.consume(TokenType.T_ENDWHILE)) {
                //error
                this._error(n, [TokenType.T_ENDWHILE], [';']);
            }

            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        } else if (this._isStatementStartToken(this._tokens.peek())) {
            n.children.push(this._statement());
        } else {
            //error
            this._error(n, []);
        }

        return this._node(n);

    }

    private _ifStatementList() {

        let n = this._tempNode(AstNodeType.IfList);
        let discoverAlt = { isAlt: false };
        let followOn = [TokenType.T_ELSEIF, TokenType.T_ELSE, TokenType.T_ENDIF];
        this._followOnStack.push(followOn);
        n.children.push(this._ifStatement(false, discoverAlt));
        this._followOnStack.pop();
        let t: Token;

        this._followOnStack.push(followOn);
        while (true) {

            t = this._tokens.peek();

            if (t.tokenType === TokenType.T_ELSEIF || t.tokenType === TokenType.T_ELSE) {
                n.children.push(this._ifStatement(discoverAlt.isAlt));
            } else {
                break;
            }

        }

        this._followOnStack.pop();

        if (discoverAlt.isAlt) {

            if (!this._tokens.consume(TokenType.T_ENDIF)) {
                //error
                this._error(n, [TokenType.T_ENDIF], [';']);
            }

            if (!this._tokens.consume(';')) {
                //error
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        }

        return this._node(n);

    }

    private _ifStatement(isAlt: boolean, discoverAlt: { isAlt: boolean } = null) {

        let n = this._tempNode(AstNodeType.If);
        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_IF || t.tokenType === TokenType.T_ELSEIF) {
            this._tokens.next();
            if (this._tokens.consume('(')) {
                this._followOnStack.push([')']);
                n.children.push(this._expression());
                this._followOnStack.pop();

            } else {
                //error
                this._error(n, ['('], [...recoverStatementStartTokenTypes, ')', ':']);
                n.children.push(this._nodeFactory(null));
            }

            if (!this._tokens.consume(')')) {
                //error
                this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
            }

        } else if (t.tokenType === TokenType.T_ELSE) {
            this._tokens.next();
            n.children.push(this._nodeFactory(null));
        } else {
            throw new Error(`Unexpected token ${this._tokens.peek().tokenType}`);
        }

        if ((isAlt || discoverAlt) && this._tokens.consume(':')) {
            if (discoverAlt) {
                discoverAlt.isAlt = true;
            }

            n.children.push(this._innerStatementList([TokenType.T_ENDIF, TokenType.T_ELSEIF, TokenType.T_ELSE]));
        } else if (this._isStatementStartToken(this._tokens.peek())) {
            n.children.push(this._statement());
        } else {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, []);
        }

        return this._node(n);

    }

    private _expressionStatement() {

        let n = this._tempNode(AstNodeType.ErrorExpression);
        this._followOnStack.push([';']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }

        return n.children.pop();

    }

    private _returnType() {
        this._tokens.next(); //:
        return this._typeExpression();
    }

    private _typeExpression() {

        let n = this._tempNode(AstNodeType.TypeExpression);

        if (this._tokens.consume('?')) {
            n.value.flag = AstNodeFlag.Nullable;
        }

        switch (this._tokens.peek().tokenType) {
            case TokenType.T_CALLABLE:
            case TokenType.T_ARRAY:
                n.children.push(this._nodeFactory(this._tokens.next()));
                break;
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                n.children.push(this._name());
                break;
            default:
                //error
                this._error(n,
                    [TokenType.T_CALLABLE, TokenType.T_ARRAY, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]
                );
                break;
        }

        return this._node(n);

    }

    private _classConstantDeclarationStatement(n: TempNode<T>) {

        n.value.astNodeType = AstNodeType.ClassConstantDeclarationList;
        this._tokens.next(); //const
        let followOn = [';', ','];
        let t: Token;

        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._classConstantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.next();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }
        }

        return this._node(n);
    }

    private _isExpressionStartToken(t: Token) {

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

    private _classConstantDeclaration() {

        let n = this._tempNode(AstNodeType.ClassConstantDeclarationList);
        let t = this._tokens.peek();

        if (t.tokenType !== TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            //error
            this._error(n, [TokenType.T_STRING]);
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._node(n);
        }

        n.children.push(this._nodeFactory(this._tokens.next()));
        n.value.doc = this._tokens.lastDocComment;

        if (!this._tokens.consume('=')) {
            //error
            this._error(n, ['=']);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        n.children.push(this._expression());
        return this._node(n);

    }

    private _propertyDeclarationStatement(n: TempNode<T>) {

        let t: Token;
        n.value.astNodeType = AstNodeType.PropertyDeclarationList;
        let followOn = [';', ','];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._propertyDeclaration());
            this._followOnStack.pop();

            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, [',', ';'], [';']);
                this._tokens.consume(';');
                break;
            }

        }

        return this._node(n);

    }

    private _propertyDeclaration() {

        let n = this._tempNode(AstNodeType.PropertyDeclaration);

        if (!this._tokens.consume(TokenType.T_VARIABLE)) {
            //error
            this._error(n, [TokenType.T_VARIABLE]);
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._node(n);
        }

        n.value.doc = this._tokens.lastDocComment;
        n.children.push(this._nodeFactory(this._tokens.current));

        if (!this._tokens.consume('=')) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        n.children.push(this._expression());
        return this._node(n);

    }

    private _memberModifierList() {

        let flags = 0, flag = 0;

        while (true) {
            flag = this._memberModifierToFlag(this._tokens.peek());
            if (flag) {
                this._tokens.next();
                flags |= flag;
            } else {
                break;
            }
        }

        return flags;

    }

    private _memberModifierToFlag(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_PUBLIC:
                return AstNodeFlag.ModifierPublic;
            case TokenType.T_PROTECTED:
                return AstNodeFlag.ModifierProtected;
            case TokenType.T_PRIVATE:
                return AstNodeFlag.ModifierPrivate;
            case TokenType.T_STATIC:
                return AstNodeFlag.ModifierStatic;
            case TokenType.T_ABSTRACT:
                return AstNodeFlag.ModifierAbstract;
            case TokenType.T_FINAL:
                return AstNodeFlag.ModifierFinal;
            default:
                return 0;
        }
    }


    private _nameList() {

        let n = this._tempNode(AstNodeType.NameList);

        while (true) {
            n.children.push(this._name());

            if (!this._tokens.consume(',')) {
                break;
            }
        }

        return this._node(n);

    }

    private _newExpression() {

        let n = this._tempNode(AstNodeType.New);
        this._tokens.next(); //new

        if (this._tokens.peek().tokenType === TokenType.T_CLASS) {
            n.children.push(this._anonymousClassDeclaration());
            return this._node(n);
        }

        this._followOnStack.push(['(']);
        n.children.push(this._newVariable());
        this._followOnStack.pop();

        if (this._tokens.peek().tokenType === '(') {
            n.children.push(this._argumentList());
        }

        return this._node(n);

    }

    private _newVariable() {

        let n: TempNode<T>;
        let startPos = this._startPos();
        let part = this._newVariablePart();
        let propName: T | Token;

        while (true) {

            switch (this._tokens.peek().tokenType) {
                case '[':
                case '{':
                    part = this._dimension(part, startPos);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
                    n = this._tempNode(AstNodeType.Property, startPos);
                    this._tokens.next();
                    n.children.push(part, this._propertyName());
                    part = this._node(n, this._endPos());
                    continue;
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    n = this._tempNode(AstNodeType.StaticProperty, startPos);
                    this._tokens.next();
                    n.children.push(part, this._simpleVariable());
                    part = this._node(n, this._endPos());
                    continue;
                default:
                    break;
            }

            break;

        }

        return part;

    }

    private _newVariablePart() {

        let t = this._tokens.peek();
        let n = this._tempNode(AstNodeType.ErrorVariable);

        switch (t.tokenType) {
            case TokenType.T_STATIC:
                n.value.astNodeType = AstNodeType.Name;
                n.value.flag = AstNodeFlag.NameNotFq;
                n.children.push(this._nodeFactory(this._tokens.next()));
                return this._node(n);
            case TokenType.T_VARIABLE:
            case '$':
                return this._simpleVariable();
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                return this._name();
            default:
                //error
                this._error(n,
                    [TokenType.T_STATIC, TokenType.T_VARIABLE, '$', TokenType.T_STRING,
                    TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]
                );
                return this._node(n, this._endPos());
        }

    }

    private _cloneExpression() {

        let n = this._tempNode(AstNodeType.Clone);
        this._tokens.next();
        n.children.push(this._expression());
        return this._node(n);

    }

    private _listExpression() {

        let n = this._tempNode(AstNodeType.ArrayPairList);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['('], [')']);
            this._tokens.consume(')');
            return this._node(n);
        }

        this._followOnStack.push([')']);
        this._arrayPairList(n, ')');
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            this._error(n, [')'], [')']);
            this._tokens.consume(')');
        }

        return this._node(n);

    }

    private _unaryExpression() {

        let n = this._tempNode(AstNodeType.Error);
        let t = this._tokens.next();
        n.value.astNodeType = this._unaryOpToNodeType(t);
        if (n.value.astNodeType === AstNodeType.UnaryPreDec ||
            n.value.astNodeType === AstNodeType.UnaryPreInc ||
            n.value.astNodeType === AstNodeType.UnaryReference) {
            n.children.push(this._variable());
        } else {
            n.children.push(this._expression(this._opPrecedenceMap[t.text][0]))
        }
        return this._node(n);

    }

    private _closure() {

        let n = this._tempNode(AstNodeType.Closure);
        if (this._tokens.consume(TokenType.T_STATIC)) {
            n.value.flag = AstNodeFlag.ModifierStatic;
        }

        this._tokens.next(); //T_FUNCTION

        if (this._tokens.consume('&')) {
            n.value.flag |= AstNodeFlag.ReturnsRef;
        }

        this._followOnStack.push([TokenType.T_USE, ':', '{']);
        n.children.push(this._parameterList());
        this._followOnStack.pop();

        if (this._tokens.peek().tokenType === TokenType.T_USE) {
            this._followOnStack.push([':', '{']);
            n.children.push(this._closureUse());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (this._tokens.peek().tokenType === ':') {
            this._followOnStack.push(['{']);
            n.children.push(this._returnType());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume('{')) {
            this._error(n, ['{'], [...recoverInnerStatementStartTokenTypes, '}']);
        }

        this._followOnStack.push(['}']);
        n.children.push(this._innerStatementList(['}']));
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            this._error(n, ['}'], ['}']);
            this._tokens.consume('}');
        }

        return this._node(n);

    }

    private _closureUse() {

        let n = this._tempNode(AstNodeType.ClosureUseList);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            this._error(n, ['('], [')']);
            this._tokens.consume(')');
            return this._node(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._closureUseVariable());
            this._followOnStack.pop();
            t = this._tokens.next();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, followOn, [')']);
                this._tokens.consume(')');
                break;
            }

        }

        return this._node(n);

    }

    private _closureUseVariable() {

        let n = this._tempNode(AstNodeType.ClosureUseVariable);

        if (this._tokens.consume('&')) {
            n.value.flag = AstNodeFlag.PassByRef;
        }

        if (this._tokens.consume(TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            this._error(n, [TokenType.T_VARIABLE]);
        }

        return this._node(n);

    }

    private _parameterList() {

        let n = this._tempNode(AstNodeType.ParameterList);
        let t: Token;

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['('], [')']);
            this._tokens.consume(')');
            return this._node(n);
        }

        if (this._tokens.consume(')')) {
            return this._node(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._parameter());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                this._error(n, followOn, [')']);
                this._tokens.consume(')');
                break;
            }
        }

        return this._node(n);

    }

    private _isTypeExpressionStartToken(t: Token) {
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

    private _parameter() {

        let n = this._tempNode(AstNodeType.Parameter);

        if (this._isTypeExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push(['&', TokenType.T_ELLIPSIS, TokenType.T_VARIABLE]);
            n.children.push(this._typeExpression());
            this._followOnStack.pop();
        }

        if (this._tokens.consume('&')) {
            n.value.flag = AstNodeFlag.PassByRef;
        }

        if (this._tokens.consume(TokenType.T_ELLIPSIS)) {
            n.value.flag = AstNodeFlag.Variadic;
        }

        if (this._tokens.consume(TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            this._error(n, [TokenType.T_VARIABLE]);
            return this._node(n);
        }

        if (this._tokens.consume('=')) {
            n.children.push(this._expression());
        } else {
            n.children.push(this._nodeFactory(null));
        }

        return this._node(n);

    }

    private _variable() {

        let startPos = this._startPos();
        this._variableAtomType = 0;
        let variableAtom = this._variableAtom();
        let count = 0;

        while (true) {
            ++count;
            switch (this._tokens.peek().tokenType) {
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    variableAtom = this._staticMember(variableAtom, startPos);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
                    variableAtom = this._instanceMember(variableAtom, startPos);
                    continue;
                case '[':
                case '{':
                    variableAtom = this._dimension(variableAtom, startPos);
                    continue;
                case '(':
                    let call = this._tempNode(AstNodeType.Call, startPos);
                    call.children.push(variableAtom, this._argumentList());
                    variableAtom = this._node(call);
                    continue;
                default:
                    if (count === 1 && this._variableAtomType !== AstNodeType.Variable) {
                        //error
                        let errNode = this._tempNode(AstNodeType.ErrorVariable, startPos);
                        errNode.children.push(variableAtom);
                        this._error(errNode,
                            [TokenType.T_PAAMAYIM_NEKUDOTAYIM, TokenType.T_OBJECT_OPERATOR, '[', '{', '(']);
                        return this._node(errNode);
                    }
                    break;
            }

            break;
        }

        return variableAtom;
    }

    private _staticMember(lhs: T, startPos: number) {

        let n = this._tempNode(AstNodeType.ErrorStaticMember, startPos)
        n.children.push(lhs);
        this._tokens.next() //::
        let t = this._tokens.peek();

        switch (t.tokenType) {
            case '{':
                n.value.astNodeType = AstNodeType.StaticMethodCall;
                this._tokens.next();
                this._followOnStack.push(['}']);
                n.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume('}')) {
                    this._error(n, ['}'], ['}']);
                    this._tokens.consume('}');
                }
                break;
            case '$':
            case TokenType.T_VARIABLE:
                n.children.push(this._simpleVariable());
                n.value.astNodeType = AstNodeType.StaticProperty;
                break;
            case TokenType.T_STRING:
                n.children.push(this._nodeFactory(this._tokens.next()));
                n.value.astNodeType = AstNodeType.ClassConstant;
                break;
            default:
                if (this._isSemiReservedToken(t)) {
                    n.children.push(this._nodeFactory(this._tokens.next()));
                    n.value.astNodeType = AstNodeType.ClassConstant;
                    break;
                } else {
                    //error
                    this._error(n,
                        ['{', '$', TokenType.T_VARIABLE, TokenType.T_STRING]
                    );
                    return this._node(n);
                }
        }

        t = this._tokens.peek();

        if (t.tokenType === '(') {
            n.children.push(this._argumentList());
            n.value.astNodeType = AstNodeType.StaticMethodCall;
            return this._node(n);
        } else if (n.value.astNodeType === AstNodeType.StaticMethodCall) {
            //error
            this._error(n, ['(']);
            n.children.push(this._nodeFactory(null));
        }

        return this._node(n);

    }

    private _instanceMember(lhs: T, startPos: number) {

        let n = this._tempNode(AstNodeType.Property, startPos);
        n.children.push(lhs);
        this._tokens.next(); //->
        n.children.push(this._propertyName());

        if (this._tokens.consume('(')) {
            n.children.push(this._argumentList());
            n.value.astNodeType = AstNodeType.MethodCall;
        }

        return this._node(n);

    }

    private _propertyName() {

        switch (this._tokens.peek().tokenType) {
            case TokenType.T_STRING:
                return this._nodeFactory(this._tokens.next());
            case '{':
                let err = this._tempNode(AstNodeType.ErrorPropertyName);
                this._tokens.next();
                this._followOnStack.push(['{']);
                err.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume('}')) {
                    this._error(err, ['}'], ['}']);
                    this._tokens.consume('}');
                    return this._node(err);
                }
                return err.children.pop();
            case '$':
            case TokenType.T_VARIABLE:
                return this._simpleVariable();
            default:
                //error
                let e = this._tempNode(AstNodeType.Error);
                this._error(e, [TokenType.T_STRING, '{', '$']);
                return this._node(e);
        }

    }

    private _dimension(lhs: T, startPos: number) {

        let n = this._tempNode(AstNodeType.Dimension, startPos);
        let close = this._tokens.peek().tokenType === '[' ? ']' : '}';
        n.children.push(lhs);
        this._tokens.next();

        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([close]);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }

        if (!this._tokens.consume(close)) {
            //error
            this._error(n, [close], [close]);
            this._tokens.consume(close);
        }

        return this._node(n);

    }

    private _argumentList() {

        let n = this._tempNode(AstNodeType.ArgumentList);
        let t: Token;

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['('], [')']);
            this._tokens.consume(')');
            return this._node(n);
        }

        if (this._tokens.consume(')')) {
            return this._node(n);
        }

        let followOn = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._argument());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ')') {
                this._tokens.next();
                break;
            } else if (t.tokenType === ',') {
                this._tokens.next();
            } else {
                //error
                this._error(n, followOn, [')']);
                this._tokens.consume(')');
                break;
            }

        }

        return this._node(n);

    }

    private _isArgumentStartToken(t: Token) {
        return t.tokenType === TokenType.T_ELLIPSIS || this._isExpressionStartToken(t);
    }

    private _argument() {

        let n = this._tempNode(AstNodeType.ErrorArgument);
        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_ELLIPSIS) {
            this._tokens.next();
            n.value.astNodeType = AstNodeType.Unpack;
            n.children.push(this._expression());
            return this._node(n);
        } else if (this._isExpressionStartToken(t)) {
            return this._expression();
        } else {
            //error
            this._error(n, []);
            return this._node(n);
        }

    }

    private _name() {

        let n = this._tempNode(AstNodeType.Name);

        if (this._tokens.consume(TokenType.T_NS_SEPARATOR)) {
            n.value.flag = AstNodeFlag.NameFq;
        } else if (this._tokens.consume(TokenType.T_NAMESPACE)) {
            n.value.flag = AstNodeFlag.NameRelative;
            if (!this._tokens.consume(TokenType.T_NS_SEPARATOR)) {
                //error
                if (this._error(n, [TokenType.T_NS_SEPARATOR], [TokenType.T_STRING]).tokenType !== TokenType.T_STRING) {
                    n.children.push(this._nodeFactory(null));
                    return this._node(n);
                }
            }
        } else {
            n.value.flag = AstNodeFlag.NameNotFq;
        }

        n.children.push(this._namespaceName());
        return this._node(n);

    }

    private _shortArray() {

        let n = this._tempNode(AstNodeType.ArrayPairList);
        let t = this._tokens.next();

        if (this._tokens.consume(']')) {
            return this._node(n);
        }

        this._followOnStack.push([']']);
        this._arrayPairList(n, ']');
        this._followOnStack.pop();

        if (!this._tokens.consume(']')) {
            this._error(n, [']'], [']']);
            this._tokens.consume(']');
        }

        return this._node(n);

    }

    private _longArray() {

        let n = this._tempNode(AstNodeType.ArrayPairList);
        this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['('], [')']);
            this._tokens.consume(')');
            return this._node(n);
        }

        if (this._tokens.consume(')')) {
            return this._node(n);
        }

        this._followOnStack.push([')']);
        this._arrayPairList(n, ')');
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [')']);
            this._tokens.consume(')');
        }

        return this._node(n);

    }

    private _isArrayPairStartToken(t: Token) {
        return t.tokenType === '&' || this._isExpressionStartToken(t);
    }

    private _arrayPairList(n: TempNode<T>, breakOn: TokenType | string) {

        let t: Token;
        let followOn: (TokenType | string)[] = [','];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._arrayPair());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.tokenType === ',') {
                this._tokens.next();
                if (this._tokens.peek().tokenType === breakOn) {
                    break;
                }
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                //error
                if (this._error(n, followOn, [',']).tokenType === ',' &&
                    this._tokens.peek(1).tokenType !== breakOn) {
                    this._tokens.next();
                    continue;
                }
                break;
            }

        }

        return n;

    }


    private _arrayPair() {

        let n = this._tempNode(AstNodeType.ArrayPair);

        if (this._tokens.peek().tokenType === '&') {
            n.children.push(this._unaryExpression(), this._nodeFactory(null));
            return this._node(n);
        }

        this._followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_DOUBLE_ARROW)) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        if (this._tokens.peek().tokenType === '&') {
            n.children.push(this._unaryExpression());
            return this._node(n);
        }

        n.children.push(this._expression());
        return this._node(n);

    }


    private _variableAtom() {

        let n: TempNode<T>;
        switch (this._tokens.peek().tokenType) {
            case TokenType.T_VARIABLE:
            case '$':
                this._variableAtomType = AstNodeType.Variable;
                return this._simpleVariable();
            case '(':
                this._variableAtomType = AstNodeType.ErrorVariable;
                let err = this._tempNode(AstNodeType.ErrorVariable);
                this._followOnStack.push([')']);
                err.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume(')')) {
                    this._error(err, [')'], [')']);
                    this._tokens.consume(')');
                    return this._node(err);
                }
                return err.children.pop();
            case TokenType.T_ARRAY:
                this._variableAtomType = AstNodeType.ArrayPairList;
                return this._longArray();
            case '[':
                this._variableAtomType = AstNodeType.ArrayPairList;
                return this._shortArray();
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
                return this._nodeFactory(this._tokens.next());
            case TokenType.T_STATIC:
                this._variableAtomType = AstNodeType.Name;
                n = this._tempNode(AstNodeType.Name);
                n.value.flag = AstNodeFlag.NameNotFq;
                n.children.push(this._nodeFactory(this._tokens.next()));
                return this._node(n);
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                this._variableAtomType = AstNodeType.Name;
                return this._name();
            default:
                //error
                this._variableAtomType = AstNodeType.ErrorVariable;
                n = this._tempNode(AstNodeType.ErrorVariable);
                this._error(n,
                    [TokenType.T_VARIABLE, '$', '(', '[', TokenType.T_ARRAY, TokenType.T_CONSTANT_ENCAPSED_STRING,
                    TokenType.T_STATIC, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]);
                return this._node(n);
        }

    }

    private _simpleVariable() {

        let n = this._tempNode(AstNodeType.Variable);
        let t = this._tokens.peek();

        if (t.tokenType === TokenType.T_VARIABLE) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else if (t.tokenType === '$') {
            this._tokens.next();
            t = this._tokens.peek();
            if (t.tokenType === '{') {
                this._tokens.next();
                this._followOnStack.push(['}']);
                n.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume('}')) {
                    this._error(n, ['}'], ['}']);
                    this._tokens.consume('}');
                }
            } else if (t.tokenType === '$' || t.tokenType === TokenType.T_VARIABLE) {
                n.children.push(this._simpleVariable());
            } else {
                //error
                this._error(n, ['{', '$', TokenType.T_VARIABLE]);
            }
        } else {
            //shouldnt get here
            throw new Error(`Unexpected token ${t.tokenType}`);
        }

        return this._node(n);

    }

    private _isBinaryOpToken(t: Token) {
        return this._opPrecedenceMap.hasOwnProperty(t.text) && (this._opPrecedenceMap[t.text][2] & OpType.Binary) === OpType.Binary;
    }

    private _haltCompilerStatement() {

        let n = this._tempNode(AstNodeType.HaltCompiler);
        this._tokens.next();

        let expected: (TokenType | string)[] = ['(', ')', ';'];
        let t: Token;

        if (!this._tokens.consume('(')) {
            this._error(n, ['('], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }

        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);

    }

    private _useStatement() {

        let n = this._tempNode(AstNodeType.UseStatement);
        this._tokens.next();

        if (this._tokens.consume(TokenType.T_FUNCTION)) {
            n.value.flag = AstNodeFlag.UseFunction;
        } else if (this._tokens.consume(TokenType.T_CONST)) {
            n.value.flag = AstNodeFlag.UseConstant;
        }

        let useList = this._tempNode(AstNodeType.UseStatement);
        let useElement = this._tempNode(AstNodeType.UseElement);
        this._tokens.consume(TokenType.T_NS_SEPARATOR);

        this._followOnStack.push([TokenType.T_NS_SEPARATOR, ',', ';']);
        let namespaceName = this._namespaceName();
        this._followOnStack.pop();

        let t = this._tokens.peek();
        if (this._tokens.consume(TokenType.T_NS_SEPARATOR) || t.tokenType === '{') {
            if (t.tokenType === '{') {
                n.value.errors.push(new ParseError(t, [TokenType.T_NS_SEPARATOR]));
            }
            n.value.astNodeType = AstNodeType.UseGroup;
            n.children.push(namespaceName);
            return this._useGroup(n);
        }

        if (!n.value.flag) {
            n.value.flag = AstNodeFlag.UseClass;
        }

        useElement.children.push(namespaceName);
        this._followOnStack.push([',', ';']);
        useList.children.push(this._useElement(useElement, false, true));
        this._followOnStack.pop();

        if (this._tokens.consume(',')) {
            this._followOnStack.push([';']);
            n.children.push(this._useList(useList, false, true, ';'));
            this._followOnStack.pop();
        }

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);
    }

    private _useGroup(n: TempNode<T>) {

        if (!this._tokens.consume('{')) {
            //error
            this._error(n, ['{'], [';']);
            this._tokens.consume(';');
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        this._followOnStack.push(['}', ';']);
        n.children.push(this._useList(this._tempNode(AstNodeType.UseList), !n.value.flag, false, '}'));
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            this._error(n, ['}'], [';']);
        }

        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }

        return this._node(n);
    }

    private _useList(n: TempNode<T>, isMixed: boolean, lookForPrefix: boolean, breakOn: TokenType | string) {

        let t: Token;
        let followOn: (TokenType | string)[] = [','];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._useElement(this._tempNode(AstNodeType.UseElement), isMixed, lookForPrefix));
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.tokenType === ',') {
                this._tokens.next();
            } else if (t.tokenType === breakOn) {
                break;
            } else {
                //error
                if (this._error(n, [',', breakOn], [',']).tokenType === ',') {
                    this._tokens.next();
                    continue;
                }
                break;
            }

        }

        return this._node(n);

    }

    private _useElement(n: TempNode<T>, isMixed: boolean, lookForPrefix: boolean) {

        //if children not empty then it contains tokens to left of T_AS
        if (!n.children.length) {

            if (isMixed) {
                if (this._tokens.consume(TokenType.T_FUNCTION)) {
                    n.value.flag = AstNodeFlag.UseFunction;
                } else if (this._tokens.consume(TokenType.T_CONST)) {
                    n.value.flag = AstNodeFlag.UseConstant;
                } else {
                    n.value.flag = AstNodeFlag.UseClass;
                }
            } else if (lookForPrefix) {
                this._tokens.consume(TokenType.T_NS_SEPARATOR);
            }

            this._followOnStack.push([TokenType.T_AS]);
            n.children.push(this._namespaceName());
            this._followOnStack.pop();
        }

        if (!this._tokens.consume(TokenType.T_AS)) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING]);
        }

        return this._node(n);
    }

    private _namespaceStatement() {

        let n = this._tempNode(AstNodeType.Namespace);
        this._tokens.next();
        this._tokens.lastDocComment;

        if (this._tokens.peek().tokenType === TokenType.T_STRING) {

            this._followOnStack.push([';', '{']);
            n.children.push(this._namespaceName());
            this._followOnStack.pop();

            if (this._tokens.consume(';')) {
                n.children.push(this._nodeFactory(null));
                return this._node(n);
            }

        }

        if (!this._tokens.consume('{')) {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, ['{']);
            return this._node(n);
        }

        n.children.push(this._topStatementList(true));

        if (!this._tokens.consume('}')) {
            this._error(n, ['}'], ['}']);
            this._tokens.consume('}');

        }

        return this._node(n);

    }

    private _namespaceName() {

        let n = this._tempNode(AstNodeType.NamespaceName);

        if (this._tokens.peek().tokenType === TokenType.T_STRING) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else {
            //error
            this._error(n, [TokenType.T_STRING]);
            return this._node(n);
        }

        while (true) {

            if (this._tokens.peek().tokenType === TokenType.T_NS_SEPARATOR &&
                this._tokens.peek(1).tokenType === TokenType.T_STRING) {
                this._tokens.next();
                n.children.push(this._nodeFactory(this._tokens.next()));
            } else {
                break;
            }

        }

        return this._node(n);

    }

    private _error(tempNode: TempNode<T>, expected: (TokenType | string)[], followOn?: (TokenType | string)[]) {

        let unexpected = this._tokens.peek();
        let n = this._followOnStack.length;
        let syncTokens = followOn ? followOn.slice(0) : [];

        while (n--) {
            Array.prototype.push.apply(syncTokens, this._followOnStack[n]);
        }

        this._tokens.skip(syncTokens);
        if (!tempNode.value.errors) {
            tempNode.value.errors = [];
        }
        tempNode.value.errors.push(new ParseError(unexpected, expected));
        return this._tokens.peek();
    }


    private _isReservedToken(t: Token) {
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

    private _isSemiReservedToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_PRIVATE:
            case TokenType.T_PROTECTED:
            case TokenType.T_PUBLIC:
                return true;
            default:
                return this._isReservedToken(t);
        }
    }

    private _isTopStatementStartToken(t: Token) {

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
                return this._isStatementStartToken(t);
        }

    }

    private _isInnerStatementStartToken(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_FUNCTION:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_CLASS:
            case TokenType.T_TRAIT:
            case TokenType.T_INTERFACE:
                return true;
            default:
                return this._isStatementStartToken(t);
        }
    }

    private _isStatementStartToken(t: Token) {

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
                return this._isExpressionStartToken(t);
        }
    }




}

