/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType, Iterator, Position, Range } from './lexer';
import { ParseError, ErrorRecovery } from './parseError';
import { TokenIterator } from './tokenIterator';

export enum NodeType {
    None = 0, Error, TopStatementList, NamespaceStatement, NamespaceName, UseElement, UseStatement, UseGroupStatement,
    UseList, HaltCompilerStatement, ConstantDeclarationStatement, ConstantDeclarationList, ConstantDeclaration, DynamicVariable,
    ArrayDeclaration, ArrayPair, Name, ParenthesisedExpression, Call, Unpack,
    ArgumentList, Dimension, ClassConstant, StaticProperty, StaticMethodCall, MethodCall,
    Property, Closure, ParameterList, Parameter, IssetList, Isset,
    Empty, Eval, Include, YieldFrom, Yield, Print,
    Backticks, ComplexVariable, EncapsulatedVariableList, AnonymousClassDeclaration, New, ClassExtends,
    Implements, InterfaceExtends, NameList, ClassStatementList, MemberModifierList, PropertyDeclaration,
    PropertyDeclarationStatement, ClassConstantDeclaration, ClassConstantDeclarationStatement, ReturnType, TypeExpression, CurlyInnerStatementList,
    InnerStatementList, ExpressionStatement, FunctionDeclaration, MethodDeclaration, UseTraitStatement, TraitAdaptationList,
    TraitAdaptation, MethodReference, TraitPrecendence, TraitAlias, ClassModifiers, ClassDeclaration, TraitDeclarationStatement,
    InterfaceDeclarationStatement, BinaryExpression, EncapsulatedVariable, Variable, ArrayPairList, ClosureUseVariable,
    ClosureUse, ListExpression, Clone, Heredoc, DoubleQuotes, TopStatement,
    EmptyStatement, IfStatementList, IfStatement, WhileStatement, DoWhileStatement, ForExpressionList, ForStatement,
    BreakStatement, ContinueStatement, ReturnStatement, GlobalVariableDeclarationStatement, StaticVariableDeclarationStatement, StaticVariableDeclaration,
    EchoStatement, UnsetStatement, ThrowStatement, GotoStatement, LabelStatement, ForeachStatement,
    CaseStatementList, SwitchStatement, CaseStatement, DeclareStatement, TryStatement, TryCatchFinallyStatement,
    Catch, CatchNameList, FinallyStatement, TernaryExpression, UnaryBoolNot, UnaryBitwiseNot, UnaryMinus, UnaryPlus,
    UnarySilence, UnaryPreInc, UnaryPostInc, UnaryPreDec, UnaryPostDec, UnaryReference, BinaryBitwiseOr, BinaryBitwiseAnd,
    BinaryBitwiseXor, BinaryConcat, BinaryAdd, BinarySubtract, BinaryMultiply, BinaryDivide, BinaryModulus, BinaryPower, BinaryShiftLeft,
    BinaryShiftRight, BinaryBoolAnd, BinaryBoolOr, BinaryLogicalAnd, BinaryLogicalOr, BinaryLogicalXor, BinaryIsIdentical,
    BinaryIsNotIdentical, BinaryIsEqual, BinaryIsNotEqual, BinaryIsSmaller, BinaryIsSmallerOrEqual, BinaryIsGreater,
    BinaryIsGreaterOrEqual, BinarySpaceship, BinaryCoalesce, BinaryAssign, BinaryConcatAssign, BinaryAddAssign, BinarySubtractAssign, BinaryMultiplyAssign,
    BinaryDivideAssign, BinaryModulusAssign, BinaryPowerAssign, BinaryShiftLeftAssign, BinaryShiftRightAssign, BinaryBitwiseOrAssign, BinaryBitwiseAndAssign,
    BinaryBitwiseXorAssign, BinaryInstanceOf, MagicConstant,CatchList
}

export enum Flag {
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

    Nullable, NameFq, NameNotFq, NameRelative, MagicLine, MagicFile, MagicDir, MagicNamespace, MagicFunction,
    MagicMethod, MagicClass, MagicTrait,
    UseClass,
    UseFunction,
    UseConstant
}

export interface NodeFactory<T> {
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
    switch (t.type) {
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
    return t.type === '=';
}

function isVariableOnlyBinaryOp(t: Token) {
    switch (t.type) {
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

export interface DocComment {
    text: string;
    range: Range;
}

export interface AstNode {
    type: NodeType;
    range: Range;
    value?: string;
    flag?: Flag;
    doc?: DocComment;
    errors?: ParseError[];
}

var topStatementStartTokenTypes: (TokenType | string)[] = [
    TokenType.T_NAMESPACE, TokenType.T_USE, TokenType.T_HALT_COMPILER, TokenType.T_CONST,
    TokenType.T_FUNCTION, TokenType.T_CLASS, TokenType.T_ABSTRACT, TokenType.T_FINAL,
    TokenType.T_TRAIT, TokenType.T_INTERFACE, ';', '{', TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO,
    TokenType.T_FOR, TokenType.T_SWITCH, TokenType.T_BREAK, TokenType.T_CONTINUE, TokenType.T_RETURN,
    TokenType.T_GLOBAL, TokenType.T_STATIC, TokenType.T_ECHO, TokenType.T_INLINE_HTML, TokenType.T_UNSET,
    TokenType.T_FOREACH, TokenType.T_DECLARE, TokenType.T_TRY, TokenType.T_THROW, TokenType.T_GOTO,
    TokenType.T_STRING, TokenType.T_VARIABLE, '$', TokenType.T_ARRAY, '[', TokenType.T_CONSTANT_ENCAPSED_STRING,
    TokenType.T_NS_SEPARATOR, TokenType.T_STRING, TokenType.T_NAMESPACE, '(', TokenType.T_STATIC,
    TokenType.T_INC, TokenType.T_DEC, '+', '-', '!', '~', '@', TokenType.T_INT_CAST, TokenType.T_DOUBLE_CAST,
    TokenType.T_STRING_CAST, TokenType.T_ARRAY_CAST, TokenType.T_OBJECT_CAST, TokenType.T_BOOL_CAST,
    TokenType.T_UNSET_CAST, TokenType.T_LIST, TokenType.T_CLONE, TokenType.T_NEW, TokenType.T_DNUMBER,
    TokenType.T_LNUMBER, TokenType.T_LINE, TokenType.T_FILE, TokenType.T_DIR, TokenType.T_TRAIT_C,
    TokenType.T_METHOD_C, TokenType.T_FUNC_C, TokenType.T_NS_C, TokenType.T_CLASS_C,
    TokenType.T_START_HEREDOC, '"', '`', TokenType.T_PRINT, TokenType.T_YIELD, TokenType.T_YIELD_FROM,
    TokenType.T_FUNCTION, TokenType.T_INCLUDE, TokenType.T_INCLUDE_ONCE, TokenType.T_REQUIRE,
    TokenType.T_REQUIRE_ONCE, TokenType.T_EVAL, TokenType.T_EMPTY, TokenType.T_ISSET
];

var innerStatementStartTokenTypes: (TokenType | string)[] = [
    TokenType.T_FUNCTION, TokenType.T_ABSTRACT, TokenType.T_FINAL, TokenType.T_CLASS, TokenType.T_TRAIT, TokenType.T_INTERFACE,
    ';', '{', TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO,
    TokenType.T_FOR, TokenType.T_SWITCH, TokenType.T_BREAK, TokenType.T_CONTINUE, TokenType.T_RETURN,
    TokenType.T_GLOBAL, TokenType.T_STATIC, TokenType.T_ECHO, TokenType.T_INLINE_HTML, TokenType.T_UNSET,
    TokenType.T_FOREACH, TokenType.T_DECLARE, TokenType.T_TRY, TokenType.T_THROW, TokenType.T_GOTO,
    TokenType.T_STRING, TokenType.T_VARIABLE, '$', TokenType.T_ARRAY, '[', TokenType.T_CONSTANT_ENCAPSED_STRING,
    TokenType.T_NS_SEPARATOR, TokenType.T_STRING, TokenType.T_NAMESPACE, '(', TokenType.T_STATIC,
    TokenType.T_INC, TokenType.T_DEC, '+', '-', '!', '~', '@', TokenType.T_INT_CAST, TokenType.T_DOUBLE_CAST,
    TokenType.T_STRING_CAST, TokenType.T_ARRAY_CAST, TokenType.T_OBJECT_CAST, TokenType.T_BOOL_CAST,
    TokenType.T_UNSET_CAST, TokenType.T_LIST, TokenType.T_CLONE, TokenType.T_NEW, TokenType.T_DNUMBER,
    TokenType.T_LNUMBER, TokenType.T_LINE, TokenType.T_FILE, TokenType.T_DIR, TokenType.T_TRAIT_C,
    TokenType.T_METHOD_C, TokenType.T_FUNC_C, TokenType.T_NS_C, TokenType.T_CLASS_C,
    TokenType.T_START_HEREDOC, '"', '`', TokenType.T_PRINT, TokenType.T_YIELD, TokenType.T_YIELD_FROM,
    TokenType.T_FUNCTION, TokenType.T_INCLUDE, TokenType.T_INCLUDE_ONCE, TokenType.T_REQUIRE,
    TokenType.T_REQUIRE_ONCE, TokenType.T_EVAL, TokenType.T_EMPTY, TokenType.T_ISSET
];

var expressionStartTokenTypes: (TokenType | string)[] = [
    TokenType.T_VARIABLE, '$', TokenType.T_ARRAY, '[', TokenType.T_CONSTANT_ENCAPSED_STRING,
    TokenType.T_NS_SEPARATOR, TokenType.T_STRING, TokenType.T_NAMESPACE, '(', TokenType.T_STATIC,
    TokenType.T_INC, TokenType.T_DEC, '+', '-', '!', '~', '@', TokenType.T_INT_CAST, TokenType.T_DOUBLE_CAST,
    TokenType.T_STRING_CAST, TokenType.T_ARRAY_CAST, TokenType.T_OBJECT_CAST, TokenType.T_BOOL_CAST,
    TokenType.T_UNSET_CAST, TokenType.T_LIST, TokenType.T_CLONE, TokenType.T_NEW, TokenType.T_DNUMBER,
    TokenType.T_LNUMBER, TokenType.T_LINE, TokenType.T_FILE, TokenType.T_DIR, TokenType.T_TRAIT_C,
    TokenType.T_METHOD_C, TokenType.T_FUNC_C, TokenType.T_NS_C, TokenType.T_CLASS_C,
    TokenType.T_START_HEREDOC, '"', '`', TokenType.T_PRINT, TokenType.T_YIELD, TokenType.T_YIELD_FROM,
    TokenType.T_FUNCTION, TokenType.T_INCLUDE, TokenType.T_INCLUDE_ONCE, TokenType.T_REQUIRE,
    TokenType.T_REQUIRE_ONCE, TokenType.T_EVAL, TokenType.T_EMPTY, TokenType.T_ISSET
];

var classStatementStartTokenTypes: (TokenType | string)[] = [
    TokenType.T_PUBLIC, TokenType.T_PROTECTED, TokenType.T_PRIVATE, TokenType.T_STATIC,
    TokenType.T_ABSTRACT, TokenType.T_FINAL, TokenType.T_FUNCTION, TokenType.T_VAR,
    TokenType.T_CONST, TokenType.T_USE
];

var parameterStartTokenTypes: (TokenType | string)[] = [
    '&', TokenType.T_ELLIPSIS, TokenType.T_VARIABLE, TokenType.T_NS_SEPARATOR,
    TokenType.T_STRING, TokenType.T_NAMESPACE, '?', TokenType.T_ARRAY,
    TokenType.T_CALLABLE
];

var statementStartTokenTypes: (TokenType | string)[] = [
    ';', '{', TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO,
    TokenType.T_FOR, TokenType.T_SWITCH, TokenType.T_BREAK, TokenType.T_CONTINUE, TokenType.T_RETURN,
    TokenType.T_GLOBAL, TokenType.T_STATIC, TokenType.T_ECHO, TokenType.T_INLINE_HTML, TokenType.T_UNSET,
    TokenType.T_FOREACH, TokenType.T_DECLARE, TokenType.T_TRY, TokenType.T_THROW, TokenType.T_GOTO,
    TokenType.T_STRING, TokenType.T_VARIABLE, '$', TokenType.T_ARRAY, '[', TokenType.T_CONSTANT_ENCAPSED_STRING,
    TokenType.T_NS_SEPARATOR, TokenType.T_STRING, TokenType.T_NAMESPACE, '(', TokenType.T_STATIC,
    TokenType.T_INC, TokenType.T_DEC, '+', '-', '!', '~', '@', TokenType.T_INT_CAST, TokenType.T_DOUBLE_CAST,
    TokenType.T_STRING_CAST, TokenType.T_ARRAY_CAST, TokenType.T_OBJECT_CAST, TokenType.T_BOOL_CAST,
    TokenType.T_UNSET_CAST, TokenType.T_LIST, TokenType.T_CLONE, TokenType.T_NEW, TokenType.T_DNUMBER,
    TokenType.T_LNUMBER, TokenType.T_LINE, TokenType.T_FILE, TokenType.T_DIR, TokenType.T_TRAIT_C,
    TokenType.T_METHOD_C, TokenType.T_FUNC_C, TokenType.T_NS_C, TokenType.T_CLASS_C,
    TokenType.T_START_HEREDOC, '"', '`', TokenType.T_PRINT, TokenType.T_YIELD, TokenType.T_YIELD_FROM,
    TokenType.T_FUNCTION, TokenType.T_INCLUDE, TokenType.T_INCLUDE_ONCE, TokenType.T_REQUIRE,
    TokenType.T_REQUIRE_ONCE, TokenType.T_EVAL, TokenType.T_EMPTY, TokenType.T_ISSET
];

export class Parser<T> {

    private _nodeFactory: NodeFactory<T>;
    private _opPrecedenceMap = opPrecedenceMap;
    private _tokens: TokenIterator
    private _followOnStack: (TokenType | string)[][];
    private _isBinaryOpPredicate: Predicate;
    private _variableAtomType: NodeType;
    private _newVariableAtomType: NodeType;


    constructor(nodeFactory: NodeFactory<T>) {
        this._nodeFactory = nodeFactory;
    }

    parse(tokens: Token[]) {

        this._followOnStack = [];
        this._tokens = new TokenIterator(tokens);
        return this._topStatementList(false);

    }

    private _tempNode(type: NodeType = 0, startPos: Position = null): TempNode<T> {
        
        if(!startPos){
            startPos = this._startPos();
        }

        return {
            value: {
                type: type,
                range: {
                    start: startPos,
                    end: null
                }
            },
            children: []
        };
    }


    private _concreteNode(tempNode: TempNode<T>, endPos: Position = null) {

        if(!endPos){
            endPos = this._endPos();
        }
        tempNode.value.range.end = endPos;
        return this._nodeFactory(tempNode.value, tempNode.children);

    }

    private _startPos() {
        let t = this._tokens.peek();

        if (t.type === TokenType.T_EOF) {
            t = this._tokens.current;
        }

        return t.range.start;
    }

    private _endPos() {
        return this._tokens.current.range.end;
    }

    private _topStatementList(isCurly: boolean) {

        let n = this._tempNode(NodeType.TopStatementList, this._startPos());
        let t = this._tokens.peek();
        let breakOn = isCurly ? '}' : TokenType.T_EOF;
        let followOn = topStatementStartTokenTypes.slice(0);
        followOn.push(breakOn);

        while (true) {

            if (this._isTopStatementStartToken(t)) {
                this._followOnStack.push(followOn)
                n.children.push(this._topStatement());
                this._followOnStack.pop();
                t = this._tokens.peek();
            } else if (t.type === breakOn) {
                break;
            } else {
                //error
                t = this._error(n, followOn, followOn);
                if (t.type === ';') {
                    this._tokens.next();
                } else if (t.type === TokenType.T_EOF) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _topStatement() {

        let t = this._tokens.peek();

        switch (t.type) {
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
                if (this._isStatementStartToken(t)) {
                    return this._statement();
                } else {
                    //error
                    //shouldn't reach here
                    throw new Error(`Unexpected token ${t.type}`);
                }
        }

    }

    private _constantDeclarationStatement() {

        let n = this._tempNode(NodeType.ConstantDeclarationStatement, this._startPos());
        this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];
        let t: Token;

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._constantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ';') {
                this._tokens.next();
                break;
            } else {
                this._error(n, [',', ';']);
                break;
            }
        }

        return this._concreteNode(n, this._endPos());

    }

    private _constantDeclaration() {

        let n = this._tempNode(NodeType.ConstantDeclaration, this._startPos());
        let t: Token;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
            n.value.doc = this._tokens.lastDocComment;
        } else {
            this._error(n, [TokenType.T_STRING]);
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        if (!this._tokens.consume('=')) {
            this._error(n, ['=']);
            n.children.push(this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());

    }

    private _expression(minPrecedence = 0) {

        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let startPos = this._startPos();
        let opFlag: Flag;
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
            if (op.type === '?') {
                lhs = this._ternaryExpression(lhs, precedence, startPos);
            } else {
                let rhs: T;
                if (op.type === '=' && this._tokens.peek().type === '&') {
                    rhs = this._unaryExpression();
                } else {
                    rhs = op.type === TokenType.T_INSTANCEOF ? this._newVariable() : this._expression(precedence);
                }

                lhs = this._binaryNode(lhs, rhs, this._binaryOpToNodeType(op), startPos);
            }

        }

        return lhs;

    }

    private _binaryNode(lhs: T, rhs: T, type: NodeType, startPos: Position) {
        let tempNode = this._tempNode(type, startPos);
        tempNode.children.push(lhs);
        tempNode.children.push(rhs);
        return this._concreteNode(tempNode, this._endPos());
    }

    private _unaryOpToNodeType(op: Token, isPost = false) {
        switch (op.type) {
            case '&':
                return NodeType.UnaryReference;
            case '!':
                return NodeType.UnaryBoolNot;
            case '~':
                return NodeType.UnaryBitwiseNot;
            case '-':
                return NodeType.UnaryMinus;
            case '+':
                return NodeType.UnaryPlus;
            case '@':
                return NodeType.UnarySilence;
            case TokenType.T_INC:
                return isPost ? NodeType.UnaryPreInc : NodeType.UnaryPostInc;
            case TokenType.T_DEC:
                return isPost ? NodeType.UnaryPreDec : NodeType.UnaryPostDec;
            default:
                throw new Error(`Unknow operator ${op.text}`);
        }
    }

    private _binaryOpToNodeType(op: Token) {

        switch (op.type) {
            case '|':
                return NodeType.BinaryBitwiseOr;
            case '&':
                return NodeType.BinaryBitwiseAnd;
            case '^':
                return NodeType.BinaryBitwiseXor;
            case '.':
                return NodeType.BinaryConcat;
            case '+':
                return NodeType.BinaryAdd;
            case '-':
                return NodeType.BinarySubtract;
            case '*':
                return NodeType.BinaryMultiply;
            case '/':
                return NodeType.BinaryDivide;
            case '%':
                return NodeType.BinaryModulus;
            case TokenType.T_POW:
                return NodeType.BinaryPower;
            case TokenType.T_SL:
                return NodeType.BinaryShiftLeft;
            case TokenType.T_SR:
                return NodeType.BinaryShiftRight;
            case TokenType.T_BOOLEAN_AND:
                return NodeType.BinaryBoolAnd;
            case TokenType.T_BOOLEAN_OR:
                return NodeType.BinaryBoolOr;
            case TokenType.T_LOGICAL_AND:
                return NodeType.BinaryLogicalAnd;
            case TokenType.T_LOGICAL_OR:
                return NodeType.BinaryLogicalOr;
            case TokenType.T_LOGICAL_XOR:
                return NodeType.BinaryLogicalXor;
            case TokenType.T_IS_IDENTICAL:
                return NodeType.BinaryIsIdentical;
            case TokenType.T_IS_NOT_IDENTICAL:
                return NodeType.BinaryIsNotIdentical;
            case TokenType.T_IS_EQUAL:
                return NodeType.BinaryIsEqual;
            case TokenType.T_IS_NOT_EQUAL:
                return NodeType.BinaryIsNotEqual;
            case '<':
                return NodeType.BinaryIsSmaller;
            case TokenType.T_IS_SMALLER_OR_EQUAL:
                return NodeType.BinaryIsSmallerOrEqual;
            case '>':
                return NodeType.BinaryIsGreater;
            case TokenType.T_IS_GREATER_OR_EQUAL:
                return NodeType.BinaryIsGreaterOrEqual;
            case TokenType.T_SPACESHIP:
                return NodeType.BinarySpaceship;
            case TokenType.T_COALESCE:
                return NodeType.BinaryCoalesce;
            case '=':
                return NodeType.BinaryAssign;
            case TokenType.T_CONCAT_EQUAL:
                return NodeType.BinaryConcatAssign;
            case TokenType.T_PLUS_EQUAL:
                return NodeType.BinaryAddAssign;
            case TokenType.T_MINUS_EQUAL:
                return NodeType.BinarySubtractAssign;
            case TokenType.T_MUL_EQUAL:
                return NodeType.BinaryMultiplyAssign;
            case TokenType.T_DIV_EQUAL:
                return NodeType.BinaryDivideAssign;
            case TokenType.T_MOD_EQUAL:
                return NodeType.BinaryModulusAssign;
            case TokenType.T_POW_EQUAL:
                return NodeType.BinaryPowerAssign;
            case TokenType.T_SL_EQUAL:
                return NodeType.BinaryShiftLeftAssign;
            case TokenType.T_SR_EQUAL:
                return NodeType.BinaryShiftRightAssign;
            case TokenType.T_OR_EQUAL:
                return NodeType.BinaryBitwiseOrAssign;
            case TokenType.T_AND_EQUAL:
                return NodeType.BinaryBitwiseAndAssign;
            case TokenType.T_XOR_EQUAL:
                return NodeType.BinaryBitwiseXorAssign;
            case TokenType.T_INSTEADOF:
                return NodeType.BinaryInstanceOf;
            default:
                throw new Error(`Unknown operator ${op.text}`);

        }

    }

    private _ternaryExpression(lhs: T, precedence: number, startPos: Position) {

        let n = this._tempNode(NodeType.TernaryExpression, startPos);
        n.children.push(lhs);

        if (this._tokens.consume(':')) {
            n.children.push(this._nodeFactory(null));
        } else {
            this._followOnStack.push([':']);
            n.children.push(this._expression(precedence));
            this._followOnStack.pop();

            if (!this._tokens.consume(':')) {
                //error
                if (!this._isExpressionStartToken(this._error(n, [':'], expressionStartTokenTypes))) {
                    return this._concreteNode(n, this._endPos());
                }
            }

        }

        n.children.push(this._expression(precedence));
        return this._concreteNode(n, this._endPos());

    }

    private _variableOnlyOperators(): (TokenType | string)[] {
        return [
            '=',
            TokenType.T_PLUS_EQUAL,
            TokenType.T_MINUS_EQUAL,
            TokenType.T_MUL_EQUAL,
            TokenType.T_POW_EQUAL,
            TokenType.T_DIV_EQUAL,
            TokenType.T_CONCAT_EQUAL,
            TokenType.T_MOD_EQUAL,
            TokenType.T_AND_EQUAL,
            TokenType.T_OR_EQUAL,
            TokenType.T_XOR_EQUAL,
            TokenType.T_SL_EQUAL,
            TokenType.T_SR_EQUAL
        ];
    }

    private _atom() {

        let t = this._tokens.peek();

        switch (t.type) {
            case TokenType.T_STATIC:
                if (this._tokens.peek(1).type === TokenType.T_FUNCTION) {
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
                let possibleUnaryStart = t.range.start;
                let variable = this._variable();
                t = this._tokens.peek();
                if (t.type === TokenType.T_INC || t.type === TokenType.T_DEC) {
                    this._tokens.next();
                    let unary = this._tempNode(
                        t.type === TokenType.T_INC ? NodeType.UnaryPostInc : NodeType.UnaryPostDec, possibleUnaryStart
                    );
                    unary.children.push(variable);
                    return this._concreteNode(unary, this._endPos());
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
                let magic = this._tempNode(NodeType.MagicConstant, this._startPos());
                magic.value.flag = this._magicConstantTokenToFlag(this._tokens.next());
                return this._concreteNode(magic, this._endPos());
            case TokenType.T_START_HEREDOC:
                return this._heredoc();
            case '"':
                return this._quotedEncapsulatedVariableList(NodeType.DoubleQuotes, '"');
            case '`':
                return this._quotedEncapsulatedVariableList(NodeType.Backticks, '`');
            case TokenType.T_PRINT:
                return this._keywordExpression(NodeType.Print);
            case TokenType.T_YIELD:
                return this._yield();
            case TokenType.T_YIELD_FROM:
                return this._keywordExpression(NodeType.YieldFrom);
            case TokenType.T_FUNCTION:
                return this._closure();
            case TokenType.T_INCLUDE:
            case TokenType.T_INCLUDE_ONCE:
            case TokenType.T_REQUIRE:
            case TokenType.T_REQUIRE_ONCE:
                return this._keywordExpression(NodeType.Include);
            case TokenType.T_EVAL:
                return this._keywordParenthesisedExpression(NodeType.Eval);
            case TokenType.T_EMPTY:
                return this._keywordParenthesisedExpression(NodeType.Empty);
            case TokenType.T_ISSET:
                return this._isset();
            default:
                //error
                break;
        }

    }

    private _magicConstantTokenToFlag(t: Token) {
        switch (t.type) {
            case TokenType.T_LINE:
                return Flag.MagicLine;
            case TokenType.T_FILE:
                return Flag.MagicFile;
            case TokenType.T_DIR:
                return Flag.MagicDir;
            case TokenType.T_TRAIT_C:
                return Flag.MagicTrait;
            case TokenType.T_METHOD_C:
                return Flag.MagicMethod;
            case TokenType.T_FUNC_C:
                return Flag.MagicFunction;
            case TokenType.T_NS_C:
                return Flag.MagicNamespace;
            case TokenType.T_CLASS_C:
                return Flag.MagicClass;
            default:
                return 0;
        }
    }

    private _isset() {

        let n = this._tempNode(NodeType.Isset, this._startPos());
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['(']);
            return this._concreteNode(n, this._endPos());
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                let recover = expressionStartTokenTypes.slice(0);
                recover.push(')');
                t = this._error(n, followOn, recover);
                if (t.type === ')') {
                    this._tokens.next();
                    break;
                } else if (!this._isExpressionStartToken(t)) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _keywordParenthesisedExpression(type: NodeType) {

        let n = this._tempNode(type, this._startPos());
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            this._error(n, ['(']);
            n.children.push(this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([')']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            if (this._error(n, [')'], [')']).type === ')') {
                this._tokens.next();
            }
        }

        return this._concreteNode(n, this._endPos());

    }

    private _keywordExpression(nodeType: NodeType) {

        let n = this._tempNode(nodeType, this._startPos());
        this._tokens.next();
        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());
    }



    private _yield() {

        let n = this._tempNode(NodeType.Yield, this._startPos());
        this._tokens.next();

        if (!this._isExpressionStartToken(this._tokens.peek())) {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_DOUBLE_ARROW)) {
            n.children.push(this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());

    }

    private _quotedEncapsulatedVariableList(type: NodeType, closeTokenType: TokenType | string) {

        let n = this._tempNode(type, this._startPos());
        this._tokens.next();
        this._followOnStack.push([closeTokenType]);
        n.children.push(this._encapsulatedVariableList(closeTokenType));
        this._followOnStack.pop();

        if (!this._tokens.consume(closeTokenType)) {
            //error
            this._error(n, [closeTokenType]);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _encapsulatedVariableList(breakOn: TokenType | string) {

        let n = this._tempNode(NodeType.EncapsulatedVariableList, this._startPos());
        let followOn: (TokenType | string)[] = [
            TokenType.T_ENCAPSED_AND_WHITESPACE, TokenType.T_VARIABLE,
            TokenType.T_DOLLAR_OPEN_CURLY_BRACES, TokenType.T_CURLY_OPEN, breakOn
        ];

        this._followOnStack.push(followOn);
        while (true) {

            switch (this._tokens.peek().type) {
                case TokenType.T_ENCAPSED_AND_WHITESPACE:
                    n.children.push(this._nodeFactory(this._tokens.next()));
                    continue;
                case TokenType.T_VARIABLE:
                    let t = this._tokens.peek(1);
                    if (t.type === '[') {
                        n.children.push(this._encapsulatedDimension());
                    } else if (t.type === TokenType.T_OBJECT_OPERATOR) {
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
                    if (followOn.indexOf(this._error(n, followOn).type) === -1) {
                        break;
                    }
            }

            break;

        }

        this._followOnStack.pop();
        return this._concreteNode(n, this._endPos());

    }

    private _curlyOpenEncapsulatedVariable() {

        //errNode placeholder for unclosed braces
        let errNode = this._tempNode(NodeType.Error, this._startPos());
        this._tokens.next();
        errNode.children.push(this._variable());

        if (this._tokens.consume('}')) {
            //discard errNode
            return errNode.children.pop();
        } else {
            this._error(errNode, ['}']);
            return this._concreteNode(errNode, this._endPos());
        }

    }

    private _dollarCurlyOpenEncapsulatedVariable() {

        //err node is just a placeholder should closing brace not found
        let errNode = this._tempNode(NodeType.Error, this._startPos());
        let n: TempNode<T>;
        this._tokens.next(); //${
        let t = this._tokens.peek();

        if (t.type === TokenType.T_STRING_VARNAME) {

            if (this._tokens.peek(1).type === '[') {
                n = this._tempNode(NodeType.Dimension, this._startPos());
                n.children.push(this._simpleVariable());
                this._tokens.next();
                this._followOnStack.push([']', '}']);
                n.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume(']')) {
                    //error
                    this._error(n, [']']);
                }

            } else {
                n = this._tempNode(NodeType.Variable, this._startPos());
                n.children.push(this._nodeFactory(this._tokens.next()));
            }

            errNode.children.push(this._concreteNode(n, this._endPos()));

        } else if (this._isExpressionStartToken(t)) {
            this._followOnStack.push(['}']);
            errNode.children.push(this._expression());
            this._followOnStack.pop();
        } else {
            //error
            let expected = expressionStartTokenTypes.slice(0);
            expected.push(TokenType.T_STRING_VARNAME);
            this._error(errNode, expected);
            return this._concreteNode(errNode, this._endPos());
        }

        if (this._tokens.consume('}')) {
            //no error so return child and discard placeholder error node
            return errNode.children.pop();
        } else {
            //error
            this._error(errNode, ['}']);
            return this._concreteNode(errNode, this._endPos());
        }


    }

    private _encapsulatedDimension() {

        let n = this._tempNode(NodeType.Dimension, this._startPos());
        n.children.push(this._simpleVariable());

        //will always be [
        this._tokens.next();

        this._followOnStack.push([']']);

        switch (this._tokens.peek().type) {
            case TokenType.T_STRING:
            case TokenType.T_NUM_STRING:
                n.children.push(this._nodeFactory(this._tokens.next()));
                break;
            case TokenType.T_VARIABLE:
                n.children.push(this._simpleVariable());
                break;
            case '-':
                let unary = this._tempNode(NodeType.UnaryMinus, this._startPos());
                this._tokens.next();
                if (this._tokens.consume(TokenType.T_NUM_STRING)) {
                    unary.children.push(this._nodeFactory(this._tokens.current));
                } else {
                    this._error(unary, [TokenType.T_NUM_STRING]);
                }
                n.children.push(this._concreteNode(unary, this._endPos()));
                break;
            default:
                //error
                this._error(n, [
                    TokenType.T_STRING, TokenType.T_NUM_STRING, TokenType.T_VARIABLE, '-'
                ]);
                break;
        }

        this._followOnStack.pop();

        if (!this._tokens.consume(']')) {
            //error
            this._error(n, [']']);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _encapsulatedProperty() {
        let n = this._tempNode(NodeType.Property, this._startPos());
        n.children.push(this._simpleVariable());

        // will always be TokenType.T_OBJECT_OPERATOR
        this._tokens.next();

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            this._error(n, [TokenType.T_STRING]);
        }

        return this._concreteNode(n, this._endPos());
    }

    private _heredoc() {

        let n = this._tempNode(NodeType.Heredoc, this._startPos());
        let t = this._tokens.next();

        this._followOnStack.push([TokenType.T_END_HEREDOC]);
        n.children.push(this._encapsulatedVariableList(TokenType.T_END_HEREDOC));
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_END_HEREDOC)) {
            //error
            this._error(n, [TokenType.T_END_HEREDOC]);

        }

        return this._concreteNode(n, this._endPos());

    }

    private _anonymousClassDeclaration() {

        let n = this._tempNode(NodeType.AnonymousClassDeclaration, this._startPos());
        this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.peek().type === '(') {
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
        return this._concreteNode(n, this._endPos());

    }

    private _classStatementList() {

        let n = this._tempNode(NodeType.ClassStatementList, this._startPos());
        let t: Token;

        if (!this._tokens.consume('{')) {
            //error
            this._error(n, ['{']);
            return this._concreteNode(n, this._endPos());
        }

        let followOn: (TokenType | string)[] = classStatementStartTokenTypes.slice(0);
        followOn.push('}');

        while (true) {
            t = this._tokens.peek();

            if (t.type === '}') {
                this._tokens.next();
                break;
            } else if (this._isClassStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._classStatement());
                this._followOnStack.pop();
            } else {
                //error
                t = this._error(n, followOn, followOn);
                if (!this._isClassStatementStartToken(t) && t.type !== '}') {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _isClassStatementStartToken(t: Token) {
        switch (t.type) {
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

        let n = this._tempNode(NodeType.Error, this._startPos());
        let t = this._tokens.peek();

        switch (t.type) {
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                n.value.flag = this._memberModifierList();
                t = this._tokens.peek();
                if (t.type === TokenType.T_VARIABLE) {
                    return this._propertyDeclarationStatement(n);
                } else if (t.type === TokenType.T_FUNCTION) {
                    return this._methodDeclarationStatement(n);
                } else if (t.type === TokenType.T_CONST) {
                    return this._classConstantDeclarationStatement(n);
                } else {
                    //error
                    this._error(n,
                        [TokenType.T_VARIABLE, TokenType.T_FUNCTION, TokenType.T_CONST]
                    );
                    return this._concreteNode(n, this._endPos());
                }
            case TokenType.T_FUNCTION:
                return this._methodDeclarationStatement(n);
            case TokenType.T_VAR:
                this._tokens.next();
                n.value.flag = Flag.ModifierPublic;
                return this._propertyDeclarationStatement(n);
            case TokenType.T_CONST:
                n.value.flag = Flag.ModifierPublic;
                return this._classConstantDeclarationStatement(n);
            case TokenType.T_USE:
                return this._useTraitStatement();
            default:
                //error
                //should never get here
                throw new Error(`Unexpected token ${t.type}`);

        }

    }

    private _useTraitStatement() {

        let n = this._tempNode(NodeType.UseTraitStatement, this._startPos());
        let t = this._tokens.next();
        this._followOnStack.push([';', '{']);
        n.children.push(this._nameList());
        this._followOnStack.pop();
        n.children.push(this._traitAdaptationList());
        return this._concreteNode(n, this._endPos());

    }

    private _traitAdaptationList() {

        let n = this._tempNode(NodeType.TraitAdaptationList, this._startPos());
        let t: Token;

        if (this._tokens.consume(';')) {
            return this._concreteNode(n, this._endPos());
        }

        if (!this._tokens.consume('{')) {
            this._error(n, ['{']);
            return this._concreteNode(n, this._endPos());
        }

        let followOn: (TokenType | string)[] = [
            '}', TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR
        ];
        this._followOnStack.push(['}']);

        while (true) {

            t = this._tokens.peek();

            if (t.type === '}') {
                this._tokens.next();
                break;
            } else if (t.type === TokenType.T_STRING ||
                t.type === TokenType.T_NAMESPACE ||
                t.type === TokenType.T_NS_SEPARATOR ||
                this._isSemiReservedToken(t)) {
                n.children.push(this._traitAdaptation());
            } else {
                //error
                if (followOn.indexOf(this._error(n, followOn).type) == -1) {
                    break;
                }
            }

        }

        this._followOnStack.pop();
        return this._concreteNode(n, this._endPos());

    }

    private _traitAdaptation() {

        let n = this._tempNode(NodeType.Error, this._startPos());
        let t = this._tokens.peek();
        let t2 = this._tokens.peek(1);

        if (t.type === TokenType.T_NAMESPACE ||
            t.type === TokenType.T_NS_SEPARATOR ||
            (t.type === TokenType.T_STRING &&
                (t2.type === TokenType.T_PAAMAYIM_NEKUDOTAYIM || t2.type === TokenType.T_NS_SEPARATOR))) {

            this._followOnStack.push([TokenType.T_INSTEADOF, TokenType.T_AS]);
            n.children.push(this._methodReference());
            this._followOnStack.pop();

            if (this._tokens.consume(TokenType.T_INSTEADOF)) {
                return this._traitPrecedence(n);
            }

        } else if (t.type === TokenType.T_STRING || this._isSemiReservedToken(t)) {

            let methodRef = this._tempNode(NodeType.MethodReference, n.value.range.start);
            methodRef.children.push(this._nodeFactory(null), this._nodeFactory(this._tokens.next()));
            n.children.push(this._concreteNode(methodRef, this._endPos()));
        } else {
            //error
            this._error(n, [TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR, TokenType.T_STRING]);
            return this._concreteNode(n, this._endPos());
        }

        return this._traitAlias(n);


    }

    private _traitAlias(n: TempNode<T>) {


        if (this._tokens.consume(TokenType.T_AS)) {
            this._error(n, [TokenType.T_AS]);
            n.children.push(this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        let t = this._tokens.peek();

        if (t.type === TokenType.T_STRING || this._isReservedToken(t)) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else if (t.type === TokenType.T_PUBLIC || t.type === TokenType.T_PROTECTED || t.type === TokenType.T_PRIVATE) {
            n.value.flag = this._memberModifierToFlag(this._tokens.next());
            t = this._tokens.peek();
            if (t.type === TokenType.T_STRING || this._isSemiReservedToken(t)) {
                n.children.push(this._nodeFactory(this._tokens.next()));
            }
        } else {
            //error
            this._error(n, [TokenType.T_STRING, TokenType.T_PUBLIC, TokenType.T_PROTECTED, TokenType.T_PRIVATE]);
            n.children.push(this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        if (this._tokens.consume(';')) {
            //error
            this._error(n, [';']);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _traitPrecedence(n: TempNode<T>) {

        n.value.type = NodeType.TraitPrecendence;
        this._followOnStack.push([';']);
        n.children.push(this._nameList());
        this._followOnStack.pop();

        if (!this._tokens.consume(';')) {
            //error
            this._error(n, [';']);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _methodReference() {

        let n = this._tempNode(NodeType.MethodReference, this._startPos());

        this._followOnStack.push([TokenType.T_PAAMAYIM_NEKUDOTAYIM]);
        n.children.push(this._name());
        this._followOnStack.pop();

        if (this._tokens.consume(TokenType.T_PAAMAYIM_NEKUDOTAYIM)) {
            //error
            this._error(n, [TokenType.T_PAAMAYIM_NEKUDOTAYIM], [TokenType.T_STRING]);
        }

        let t = this._tokens.peek();

        if (t.type === TokenType.T_STRING || this._isSemiReservedToken(t)) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING]);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _methodDeclarationStatement(n: TempNode<T>) {

        n.value.type = NodeType.MethodDeclaration;
        this._tokens.next(); //T_FUNCTION
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume('&')) {
            n.value.flag |= Flag.ReturnsRef;
        }

        let t = this._tokens.peek();
        if (t.type !== TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            //error
            this._error(n, [TokenType.T_STRING], [';', ':', '{']);
            n.children.push(this._nodeFactory(null));
        }

        n.children.push(this._nodeFactory(this._tokens.next()));
        this._followOnStack.push([':', ';', '{']);
        n.children.push(this._parameterList());
        this._followOnStack.pop();

        if (this._tokens.peek().type === ':') {
            n.children.push(this._returnType());
        } else {
            n.children.push(this._nodeFactory(null));
        }

        t = this._tokens.peek();
        if (t.type === ';' && (n.value.flag & Flag.ModifierAbstract)) {
            this._tokens.next();
            n.children.push(this._nodeFactory(null));
        } else if (t.type === '{') {
            n.children.push(this._curlyInnerStatementList());
        } else {
            //error
            n.children.push(this._nodeFactory(null));
            this._error(n, [';', '{']);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _curlyInnerStatementList() {

        let n = this._tempNode(NodeType.InnerStatementList, this._startPos());

        if (!this._tokens.consume('{')) {
            this._error(n, ['{']);
            return this._concreteNode(n, this._endPos());
        }

        if (this._tokens.consume('}')) {
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push(['}']);
        this._innerStatementList(['}'], n);
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            this._error(n, ['}']);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _innerStatementList(breakOn: (TokenType | string)[], tempNode: TempNode<T> = null) {

        let n = tempNode ? tempNode : this._tempNode(NodeType.InnerStatementList, this._startPos());
        let t: Token;
        let followOn = innerStatementStartTokenTypes.slice(0);
        Array.prototype.push.apply(followOn, breakOn);

        while (true) {

            t = this._tokens.peek();

            if (this._isInnerStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._innerStatement());
                this._followOnStack.pop();
            } else if (breakOn.indexOf(t.type) !== -1) {
                break;
            } else {
                //error
                if (!this._isInnerStatementStartToken(this._error(n, followOn, followOn))) {
                    break;
                }
            }
        }

        if (!tempNode) {
            return this._concreteNode(n, this._endPos());
        }

    }

    private _innerStatement() {

        let t = this._tokens.peek();

        switch (t.type) {
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
                if (this._isStatementStartToken(t)) {
                    return this._statement();
                } else {
                    //error
                    throw new Error(`Unexpected token ${t.type}`);
                }

        }

    }

    private _interfaceDeclarationStatement() {

        let n = this._tempNode(NodeType.InterfaceDeclarationStatement, this._startPos());
        let t = this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (this._tokens.consume(TokenType.T_EXTENDS)) {
            this._followOnStack.push(['{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        n.children.push(this._classStatementList());
        return this._concreteNode(n, this._endPos());

    }

    private _traitDeclarationStatement() {

        let n = this._tempNode(NodeType.TraitDeclarationStatement, this._startPos());
        let t = this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [TokenType.T_STRING], ['{']);
        }

        n.children.push(this._classStatementList());
        return this._concreteNode(n, this._endPos());
    }

    private _functionDeclarationStatement() {

        let n = this._tempNode(NodeType.FunctionDeclaration, this._startPos());

        this._tokens.next(); //T_FUNCTION

        if (this._tokens.consume('&')) {
            n.value.flag = Flag.ReturnsRef;
        }

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.children.push(this._nodeFactory(null));
            this._error(n, ['(', ':', '{']);
        }

        n.children.push(this._parameterList());

        if (this._tokens.consume(':')) {
            this._followOnStack.push(['{']);
            n.children.push(this._returnType());
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        n.children.push(this._curlyInnerStatementList());
        return this._concreteNode(n, this._endPos());

    }

    private _classDeclarationStatement() {

        let n = this._tempNode(NodeType.ClassDeclaration, this._endPos());
        let t = this._tokens.peek();

        if (t.type === TokenType.T_ABSTRACT || t.type === TokenType.T_FINAL) {
            n.value.flag = this._classModifiers();
        }

        if (!this._tokens.consume(TokenType.T_CLASS)) {
            //error
            this._error(n, [TokenType.T_CLASS], [TokenType.T_STRING]);
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
        return this._concreteNode(n, this._endPos());

    }

    private _classModifiers() {

        let flag = 0;
        let t: Token;

        while (true) {
            t = this._tokens.peek();
            if (t.type === TokenType.T_ABSTRACT || t.type === TokenType.T_FINAL) {
                flag |= this._memberModifierToFlag(this._tokens.next());
            } else {
                break;
            }

        }

        return flag;

    }

    private _statement() {

        let t = this._tokens.peek();

        switch (t.type) {
            case '{':
                return this._curlyInnerStatementList();
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
                return this._keywordOptionalExpressionStatement(NodeType.BreakStatement);
            case TokenType.T_CONTINUE:
                return this._keywordOptionalExpressionStatement(NodeType.ContinueStatement);
            case TokenType.T_RETURN:
                return this._keywordOptionalExpressionStatement(NodeType.ReturnStatement);
            case TokenType.T_GLOBAL:
                return this._globalVariableDeclarationStatement();
            case TokenType.T_STATIC:
                return this._staticVariableDeclarationStatement();
            case TokenType.T_ECHO:
                return this._echoStatement();
            case TokenType.T_INLINE_HTML:
                let echo = this._tempNode(NodeType.EchoStatement, this._startPos());
                echo.children.push(this._nodeFactory(this._tokens.next()));
                return this._concreteNode(echo, this._endPos());
            case TokenType.T_UNSET:
                return this._unsetStatement();
            case TokenType.T_FOREACH:
                return this._foreachStatement();
            case TokenType.T_DECLARE:
                return this._declareStatement();
            case TokenType.T_TRY:
                return this._try();
            case TokenType.T_THROW:
                return this.throwStatement();
            case TokenType.T_GOTO:
                return this._gotoStatement();
            case TokenType.T_STRING:
                return this.labelStatement();
            case ';':
                let empty = this._tempNode(NodeType.EmptyStatement);
                this._tokens.next();
                return this._concreteNode(empty);
            default:
                if (this._isExpressionStartToken(t)) {
                    let expr = this._tempNode(NodeType.Error);
                    this._followOnStack.push([';']);
                    expr.children.push(this._expression());
                    this._followOnStack.pop();

                    if (!this._tokens.consume(';')) {
                        //error
                        if (this._error(expr, [';'], [';']).type === ';') {
                            this._tokens.next();
                        }
                        return this._concreteNode(expr, this._endPos());
                    }
                    return expr.children.pop();

                } else {
                    //error
                    //shouldnt get here
                    throw new Error(`Unexpected token ${t.type}`);
                }

        }

    }

    private _try() {

        let n = this._tempNode(NodeType.TryCatchFinallyStatement, this._startPos());
        let t = this._tokens.next(); //try

        if (!this._tokens.consume('{')) {
            let recover = innerStatementStartTokenTypes.slice(0);
            recover.push('}', TokenType.T_CATCH, TokenType.T_FINALLY);
            this._error(n, ['{'], recover);
        }

        t = this._tokens.next();

        if(t.type === '}' || this._isInnerStatementStartToken(t)){
            this._followOnStack.push(['}', TokenType.T_CATCH, TokenType.T_FINALLY]);
            n.children.push(this._innerStatementList(['}']));
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        this._followOnStack.push([TokenType.T_FINALLY]);
        n.children.push(this._catchList());
        this._followOnStack.pop();

        if(this._tokens.peek().type === TokenType.T_FINALLY){
            n.children.push(this._finallyStatement());
        } else {
            n.children.push(this._nodeFactory(null));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _catchList(){

        let n = this._tempNode(NodeType.CatchList, this._startPos());
        this._followOnStack.push([TokenType.T_CATCH]);

        while(true){

            if(this._tokens.peek().type === TokenType.T_CATCH){
                n.children.push(this._catchStatement());
            } else {
                break;
            }

        }

        this._followOnStack.pop();
        return this._concreteNode(n, this._endPos());

    }

    private _finallyStatement() {

        let n = this._tempNode(NodeType.Error);
        let t = this._tokens.next(); //T_FINALLY

        if (!this._tokens.consume('{')) {
            //error
            let recover = innerStatementStartTokenTypes.slice(0);
            recover.push('}');
            this._error(n, ['{'], recover);
        }

        if(t.type === '}' || this._isInnerStatementStartToken(t)){
            this._followOnStack.push(['}']);
            n.children.push(this._innerStatementList(['}']));
            this._followOnStack.pop();
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume('}')) {
            //error
            this._error(n, ['}']);
        }

        return n.value.errors.length ? this._concreteNode(n) : n.children.pop();

    }

    private _catchStatement() {

        let n = this._tempNode(NodeType.Catch);
        this._tokens.next();

        if (!this._expectNext('(', children)) {
            //error
        }

        children.push(this._catchNameList());

        if (!this._expectCurrent(TokenType.T_VARIABLE, children)) {
            //error
        }

        if (!this._expectNext(')', children)) {
            //error
        }

        if (!this._expectNext('{', children)) {
            //error
        }

        children.push(this._innerStatementList());

        if (!this._expectCurrent('}', children)) {
            //error
        }

        this._tokens.next();
        return this._nodeFactory(NodeType.Catch, children);

    }

    private _catchNameList() {

        let children: (T | Token)[] = [];

        while (true) {

            children.push(this._name());
            if (this._tokens.current.type !== '|') {
                break;
            }
            children.push(this._tokens.current)
            this._tokens.next();

        }

        return this._nodeFactory(NodeType.CatchNameList, children);

    }

    private _declareStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type === '(') {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }

        children.push(this._constantDeclarationList());

        if (!this._expectCurrent(')', children)) {
            //error
        }

        let t = this._tokens.next();
        if (t.type === ':') {
            children.push(t);
            this._tokens.next();
            children.push(this._innerStatementList());
            if (!this._expectCurrent(TokenType.T_ENDDECLARE, children)) {
                //error
            }
            if (!this._expectNext(';', children)) {
                //error
            }
            this._tokens.next();

        } else if (this._isStatementStartToken(t)) {
            children.push(this._statement());
        } else {
            //error
        }

        return this._nodeFactory(NodeType.DeclareStatement, children);

    }

    private _switchStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();


        if (t.type === '(') {
            children.push(t);
            this._tokens.next();
        } else {
            //error
        }

        children.push(this._expression());
        t = this._tokens.current;

        if (t.type === ')') {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }

        let close: TokenType | string = t.type === ':' ? TokenType.T_ENDSWITCH : '}';

        if (t.type === '{' || t.type === ':') {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }

        if (t.type === ';') {
            children.push(t);
            t = this._tokens.next();
        }

        if (t.type === TokenType.T_CASE || t.type === TokenType.T_DEFAULT) {
            children.push(this._caseStatementList());
            t = this._tokens.current;
        }

        if (t.type === close) {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }

        if (close === TokenType.T_ENDSWITCH) {

            if (t.type === ';') {
                children.push(t);
                this._tokens.next();
            } else {
                //error
            }

        }

        return this._nodeFactory(NodeType.SwitchStatement, children);

    }

    private _caseStatementList() {

        let children: (T | Token)[] = [];
        let t = this._tokens.current;


        while (true) {

            if (t.type === TokenType.T_CASE || t.type === TokenType.T_DEFAULT) {
                children.push(this._caseStatement());
                t = this._tokens.current;
            } else {
                break;
            }

        }

        return this._nodeFactory(NodeType.CaseStatementList, children);

    }

    private _caseStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type === ';' || t.type === ':') {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }

        children.push(this._innerStatementList());
        return this._nodeFactory(NodeType.CaseStatement, children);

    }

    private labelStatement(this._tokens: TokenIterator) {

        let children: (T | Token)[] = [this._tokens.current];
        if (!this._tokens.expectNext(':', children)) {
            //error
        }
        this._tokens.next();
        return this._nodeFactory(NodeType.LabelStatement, children);

    }

    private _gotoStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type === TokenType.T_STRING) {
            children.push(t)
        }

        if (!this._tokens.expectNext(TokenType.T_STRING, children)) {
            //error
        }

        if (!this._tokens.expectNext(';', children)) {
            //error
        }

        this._tokens.next();
        return this._nodeFactory(NodeType.GotoStatement, children);

    }

    private throwStatement(this._tokens: TokenIterator) {

        let children: (T | Token)[] = [this._tokens.current];
        this._tokens.next();
        children.push(this.expression(this._tokens));

        if (!this._tokens.expectCurrent(';', children)) {
            //error
        }
        this._tokens.next();

        return this._nodeFactory(NodeType.ThrowStatement, children);
    }

    private _foreachStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type = '(') {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }

        children.push(this._expression());
        t = this._tokens.current;

        if (t.type === TokenType.T_AS) {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }

        children.push(this._foreachVariable());
        t = this._tokens.current;

        if (t.type === TokenType.T_DOUBLE_ARROW) {
            children.push(t);
            t = this._tokens.next();
            children.push(this._foreachVariable());
            t = this._tokens.current;
        }

        if (t.type === ')') {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
        }


        if (t.type === ':') {

            children.push(t);
            t = this._tokens.next();
            children.push(this._innerStatementList());
            t = this._tokens.current;

            if (t.type === TokenType.T_ENDFOREACH) {
                children.push(t);
                t = this._tokens.next();
            } else {
                //error
            }

            if (t.type === ';') {
                children.push(t);
                t = this._tokens.next();
            } else {
                //error
            }

        } else if (this._isStatementStartToken(t)) {
            children.push(this._statement());
        } else {
            //error
        }

        return this._nodeFactory(NodeType.ForeachStatement, children);

    }

    private _foreachVariable() {

        let t = this._tokens.current;
        switch (t.type) {

            case '&':
                this._tokens.next();
                return this._nodeFactory(NodeType.UnaryExpression, [t, this._variable()]);
            case TokenType.T_LIST:
                return this._listExpression();
            case '[':
                return this._shortArray();
            default:
                if (this._isVariableStartToken(t)) {
                    return this._variable();
                } else {
                    //error
                }

        }

    }

    private _isVariableStartToken(t: Token) {

        switch (t.type) {
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

        let n = this._tempNode(NodeType.UnsetStatement, this._startPos());
        let t = this._tokens.next();
        let followOn = 

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['('], [';']));
            if (this._tokens.peek().type === ';') {
                this._tokens.next();
            }
            return this._concreteNode(n, this._endPos());
        }

        while (true) {

            children.push(this._variable());
            t = this._tokens.current;
            if (t.type === ',') {
                children.push(t);
                t = this._tokens.next();
            } else if (t.type === ')') {
                children.push(t);
                t = this._tokens.next();
                break;
            } else {
                //error
            }

        }

        if (t.type === ';') {
            children.push(t);
            this._tokens.next();
        } else {
            //error
        }

        return this._nodeFactory(NodeType.UnsetStatement, children);

    }

    private _echoStatement() {

        let n = this._tempNode(NodeType.EchoStatement, this._startPos());
        let t: Token;
        this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                let recover = expressionStartTokenTypes.slice(0);
                recover.push(';');
                n.value.errors.push(this._error(t, followOn, recover));
                t = this._tokens.peek();
                if (t.type === ';') {
                    this._tokens.next();
                    break;
                } else if (!this._isExpressionStartToken(t)) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _staticVariableDeclarationStatement() {

        let n = this._tempNode(NodeType.StaticVariableDeclarationStatement, this._startPos());
        let t: Token;
        this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._staticVariableDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, followOn, [TokenType.T_VARIABLE, ';']));
                if (this._tokens.peek().type === ';') {
                    this._tokens.next();
                    break;
                }
                if (this._tokens.peek().type !== TokenType.T_VARIABLE) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }



    private _globalVariableDeclarationStatement() {

        let n = this._tempNode(NodeType.GlobalVariableDeclarationStatement, this._startPos());
        let t: Token;
        this._tokens.next();
        let followOn: (TokenType | string)[] = [',', ';'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._simpleVariable());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, followOn, ['$', TokenType.T_VARIABLE, ';']));
                t = this._tokens.peek();
                if (t.type === ';') {
                    this._tokens.next();
                    break;
                }
                if (t.type !== '$' && t.type !== TokenType.T_VARIABLE) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _staticVariableDeclaration() {

        let n = this._tempNode(NodeType.StaticVariableDeclaration, this._startPos());
        n.children.push(this._nodeFactory(this._tokens.next()));

        if (!this._tokens.consume('=')) {
            n.children.push(this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());

    }

    private _keywordOptionalExpressionStatement(nodeType: NodeType) {
        let n = this._tempNode(nodeType);
        this._tokens.next();

        if (this._isExpressionStartToken(this._tokens.peek())) {
            n.children.push(this._expression());
        } else {
            n.children.push(this._nodeFactory(null));
        }

        if (!this._tokens.consume(';')) {
            n.value.errors.push(this._error(this._tokens.peek(), [';']));
        }

        return this._concreteNode(n, this._endPos());
    }


    private _forStatement() {

        let n = this._tempNode(NodeType.ForStatement, this._startPos());
        this._tokens.next(); //for

        if (!this._tokens.consume('(')) {
            //error
            n.children.push(this._nodeFactory(null), this._nodeFactory(null),
                this._nodeFactory(null), this._nodeFactory(null));
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._concreteNode(n, this._endPos());
        }

        for (let k = 0; k < 2; ++k) {

            if (this._isExpressionStartToken(this._tokens.peek())) {
                this._followOnStack.push([';']);
                n.children.push(this._forExpressionList(';'));
                this._followOnStack.pop();
            } else {
                n.children.push(this._nodeFactory(null));
            }

            if (!this._tokens.consume(';')) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [';'], [')']));
            }

        }

        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }

        if (!this._tokens.consume(')')) {
            //error
            let recover = statementStartTokenTypes.slice(0);
            recover.push(':');
            n.value.errors.push(this._error(this._tokens.peek(), [')'], recover));
        }

        if (this._tokens.consume(':')) {

            this._followOnStack.push([TokenType.T_ENDFOR]);
            n.children.push(this._innerStatementList([TokenType.T_ENDFOR]));
            this._followOnStack.pop();

            if (!this._tokens.consume(TokenType.T_ENDFOR)) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_ENDFOR]));
                return this._concreteNode(n, this._endPos());
            }

            if (!this._tokens.consume(';')) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [';']));
            }
        } else if (this._isStatementStartToken(this._tokens.peek())) {
            n.children.push(this._statement());
        } else {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), []));
            n.children.push(this._nodeFactory(null));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _forExpressionList(breakOn: TokenType | string) {

        let n = this._tempNode(NodeType.ForExpressionList, this._startPos());
        let followOn = [',', breakOn];
        let t: Token;

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();

            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type == breakOn) {
                break;
            } else {
                //error
                let recover = expressionStartTokenTypes.slice(0);
                recover.push(breakOn);
                n.value.errors.push(this._error(this._tokens.peek(), followOn, recover));
                t = this._tokens.peek();
                if (t.type === breakOn || !this._isExpressionStartToken(t)) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _doWhileStatement() {

        let n = this._tempNode(NodeType.DoWhileStatement, this._startPos());
        this._tokens.next();

        this._followOnStack.push([TokenType.T_WHILE]);
        n.children.push(this._statement());
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_WHILE)) {
            //error
            n.children.push(this._nodeFactory(null));
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_WHILE]));
            return this._concreteNode(n, this._endPos());
        }

        if (!this._tokens.consume('(')) {
            //error
            n.children.push(this._nodeFactory(null));
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([')']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [')']));
            return this._concreteNode(n, this._endPos());
        }

        if (!this._tokens.consume(';')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [';']));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _whileStatement() {

        let n = this._tempNode(NodeType.WhileStatement, this._startPos());
        this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([')']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            let recover = statementStartTokenTypes.slice(0);
            recover.push(':');
            n.value.errors.push(this._error(this._tokens.peek(), [')'], recover));
        }

        if (this._tokens.consume(':')) {
            this._followOnStack.push([TokenType.T_ENDWHILE]);
            n.children.push(this._innerStatementList([TokenType.T_ENDWHILE]));
            this._followOnStack.pop();

            if (!this._tokens.consume(TokenType.T_ENDWHILE)) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_ENDWHILE]));
                return this._concreteNode(n, this._endPos());
            }

            if (this._tokens.consume(';')) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [';']));
            }
        } else {
            n.children.push(this._statement());
        }

        return this._concreteNode(n, this._endPos());

    }

    private _ifStatementList() {

        let n = this._tempNode(NodeType.IfStatementList, this._startPos());
        let discoverAlt = { isAlt: false };
        let followOn = [TokenType.T_ELSEIF, TokenType.T_ELSE, TokenType.T_ENDIF];
        this._followOnStack.push(followOn);
        n.children.push(this._ifStatement(false, discoverAlt));
        this._followOnStack.pop();

        while (true) {

            if (this._tokens.peek().type === TokenType.T_ELSEIF) {
                this._followOnStack.push(followOn);
                n.children.push(this._ifStatement(discoverAlt.isAlt));
                this._followOnStack.pop();
            } else {
                break;
            }

        }

        if (this._tokens.peek().type === TokenType.T_ELSE) {
            n.children.push(this._ifStatement(discoverAlt.isAlt));
        }

        if (discoverAlt.isAlt) {

            if (!this._tokens.consume(TokenType.T_ENDIF)) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_ENDIF]));
                return this._concreteNode(n, this._endPos());
            }

            if (this._tokens.consume(';')) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [';']));
            }
        }

        return this._concreteNode(n, this._endPos());

    }

    private _ifStatement(isAlt: boolean, discoverAlt: { isAlt: boolean } = null) {

        let n = this._tempNode(NodeType.IfStatement, this._startPos());
        let t = this._tokens.peek();

        if (this._tokens.consume(TokenType.T_IF) || this._tokens.consume(TokenType.T_ELSEIF)) {

            if (!this._tokens.consume('(')) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), ['(']));
                n.children.push(this._nodeFactory(null), this._nodeFactory(null));
                return this._concreteNode(n, this._endPos());
            }

            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();

            if (this._tokens.consume(')')) {
                //error
                let recover = statementStartTokenTypes.slice(0);
                recover.push(':');
                n.value.errors.push(this._error(this._tokens.peek(), [')'], recover));
            }

        } else if (this._tokens.consume(TokenType.T_ELSE)) {
            n.children.push(this._nodeFactory(null));
        } else {
            throw new Error(`Unexpected token ${this._tokens.peek().type}`);
        }

        if ((isAlt || discoverAlt) && this._tokens.consume(':')) {
            if (discoverAlt) {
                discoverAlt.isAlt = true;
            }

            n.children.push(this._innerStatementList([TokenType.T_ENDIF, TokenType.T_ELSEIF, TokenType.T_ELSE]));
        } else if (this._isStatementStartToken(t)) {
            n.children.push(this._statement());
        } else {
            //error
            n.children.push(this._nodeFactory(null));
            n.value.errors.push(this._error(this._tokens.peek(), []));
        }

        return this._concreteNode(n, this._endPos());

    }

    private expressionStatement() {

        let n = this._tempNode(NodeType.Error, this._startPos());
        n.children.push(this._expression());

        if (!this._tokens.consume(';')) {
            n.value.errors.push(this._error(this._tokens.peek(), [';']));
            return this._concreteNode(n, this._endPos());
        }

        return n.children.pop();

    }

    private _returnType() {
        this._tokens.next(); //:
        return this._typeExpression();
    }

    private _typeExpression() {

        let n = this._tempNode(NodeType.TypeExpression, this._startPos());

        if (this._tokens.consume('?')) {
            n.value.flag = Flag.Nullable;
        }

        switch (this._tokens.peek().type) {
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
                n.value.errors.push(this._error(this._tokens.peek(),
                    [TokenType.T_CALLABLE, TokenType.T_ARRAY, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]
                ));
                break;
        }

        return this._concreteNode(n, this._endPos());

    }

    private _classConstantDeclarationStatement(n: TempNode<T>) {

        n.value.type = NodeType.ConstantDeclarationStatement;
        this._tokens.next(); //const
        let followOn = [';', ','];
        let t: Token;

        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._classConstantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.next();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, followOn));
                break;
            }
        }

        return this._concreteNode(n, this._endPos());
    }

    private _isExpressionStartToken(t: Token) {

        switch (t.type) {
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

        let n = this._tempNode(NodeType.ClassConstantDeclarationStatement, this._startPos());
        let t = this._tokens.peek();

        if (t.type !== TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            //error
            n.value.errors.push(this._error(t, [TokenType.T_STRING]));
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._nodeFactory(this._tokens.next()));
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.consume('=')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['=']));
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());

    }

    private _propertyDeclarationStatement(n: TempNode<T>) {

        let t: Token;
        n.value.type = NodeType.PropertyDeclarationStatement;

        while (true) {

            n.children.push(this._propertyDeclaration());
            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ';') {
                this._tokens.next();
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, [',', ';'], [TokenType.T_VARIABLE, ';']));
                t = this._tokens.peek();
                if (t.type === ';') {
                    this._tokens.next();
                    break;
                } else if (t.type !== TokenType.T_VARIABLE) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _propertyDeclaration() {

        let n = this._tempNode(NodeType.PropertyDeclaration, this._startPos());

        if (!this._tokens.consume(TokenType.T_VARIABLE)) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_VARIABLE]));
            return this._concreteNode(n, this._endPos());
        }

        n.value.doc = this._tokens.lastDocComment;
        n.children.push(this._nodeFactory(this._tokens.current));

        if (this._tokens.peek().type !== '=') {
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());

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
        switch (t.type) {
            case TokenType.T_PUBLIC:
                return Flag.ModifierPublic;
            case TokenType.T_PROTECTED:
                return Flag.ModifierProtected;
            case TokenType.T_PRIVATE:
                return Flag.ModifierPrivate;
            case TokenType.T_STATIC:
                return Flag.ModifierStatic;
            case TokenType.T_ABSTRACT:
                return Flag.ModifierAbstract;
            case TokenType.T_FINAL:
                return Flag.ModifierFinal;
            default:
                return 0;
        }
    }


    private _nameList() {

        let n = this._tempNode(NodeType.NameList, this._startPos());

        while (true) {
            n.children.push(this._name());

            if (!this._tokens.consume(',')) {
                break;
            }
        }

        return this._concreteNode(n, this._endPos());

    }

    private _newExpression() {

        let n = this._tempNode(NodeType.New, this._startPos());
        this._tokens.next(); //new

        if (this._tokens.peek().type === TokenType.T_CLASS) {
            n.children.push(this._anonymousClassDeclaration());
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push(['(']);
        n.children.push(this._newVariable());
        this._followOnStack.pop();

        if (this._tokens.peek().type === '(') {
            n.children.push(this._argumentList());
        }

        return this._concreteNode(n, this._endPos());

    }

    private _newVariable() {

        let n: TempNode<T>;
        let startPos = this._startPos();
        this._newVariableAtomType = 0;
        let part = this._newVariablePart();
        let propName: T | Token;

        while (true) {

            if (this._newVariableAtomType === NodeType.Name) {
                if (this._tokens.consume(TokenType.T_PAAMAYIM_NEKUDOTAYIM)) {
                    n = this._tempNode(NodeType.StaticProperty, startPos);
                    n.children.push(part, this._simpleVariable());
                    part = this._concreteNode(n, this._endPos());
                    continue;
                } else {
                    break;
                }

            }

            switch (this._tokens.peek().type) {
                case '[':
                case '{':
                    part = this._dimension(part, startPos);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
                    n = this._tempNode(NodeType.Property, startPos);
                    this._tokens.next();
                    n.children.push(part, this._propertyName());
                    part = this._concreteNode(n, this._endPos());
                    continue;
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    n = this._tempNode(NodeType.StaticProperty, startPos);
                    this._tokens.next();
                    n.children.push(part, this._simpleVariable());
                    part = this._concreteNode(n, this._endPos());
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
        let n = this._tempNode(NodeType.Error, this._startPos());

        switch (t.type) {
            case TokenType.T_STATIC:
                n.value.type = NodeType.Name;
                n.value.flag = Flag.NameNotFq;
                n.children.push(this._nodeFactory(this._tokens.next()));
                this._newVariableAtomType = NodeType.Name;
                return this._concreteNode(n, this._endPos());
            case TokenType.T_VARIABLE:
            case '$':
                this._newVariableAtomType = NodeType.Variable;
                return this._simpleVariable();
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                this._newVariableAtomType = NodeType.Name;
                return this._name();
            default:
                //error
                this._error(n,
                    [TokenType.T_STATIC, TokenType.T_VARIABLE, '$', TokenType.T_STRING,
                    TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR]
                );
                return this._concreteNode(n, this._endPos());
        }

    }

    private _cloneExpression() {

        let n = this._tempNode(NodeType.Clone, this._startPos());
        this._tokens.next();
        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());

    }

    private _listExpression() {

        let n = this._tempNode(NodeType.ArrayPairList, this._startPos());
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([')']);
        Array.prototype.push.apply(n.children, this._arrayPairList(n, ')'));
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [')']));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _unaryExpression() {

        let n = this._tempNode(NodeType.Error, this._startPos());
        let t = this._tokens.next();
        n.value.type = this._unaryOpToNodeType(t);
        if (n.value.type === NodeType.UnaryPreDec ||
            n.value.type === NodeType.UnaryPreInc ||
            n.value.type === NodeType.UnaryReference) {
            n.children.push(this._variable());
        } else {
            n.children.push(this._expression(this._opPrecedenceMap[t.text][0]))
        }
        return this._concreteNode(n, this._endPos());

    }

    private _closure() {

        let n = this._tempNode(NodeType.Closure, this._startPos());
        if (this._tokens.consume(TokenType.T_STATIC)) {
            n.value.flag = Flag.ModifierStatic;
        }

        this._tokens.next(); //T_FUNCTION

        if (this._tokens.consume('&')) {
            n.value.flag |= Flag.ReturnsRef;
        }

        this._followOnStack.push([TokenType.T_USE, ':', '{']);
        n.children.push(this._parameterList());
        this._followOnStack.pop();

        if (this._tokens.peek().type === TokenType.T_USE) {
            this._followOnStack.push([':', '{']);
            n.children.push(this._closureUse());
            this._followOnStack.pop();
        }

        if (this._tokens.peek().type === ':') {
            this._followOnStack.push(['{']);
            n.children.push(this._returnType());
            this._followOnStack.pop();
        }

        let block = this._curlyInnerStatementList();
        if (block) {
            n.children.push(block)
        }
        return this._concreteNode(n, this._endPos());

    }

    private _closureUse() {

        let n = this._tempNode(NodeType.ClosureUse, this._startPos());
        let t: Token;
        this._tokens.next();

        if (!this._tokens.consume('(')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._concreteNode(n, this._endPos());
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._closureUseVariable());
            this._followOnStack.pop();
            t = this._tokens.next();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                let recover = ['&', TokenType.T_VARIABLE, ')'];
                n.value.errors.push(this._error(t, [',', ')'], recover));
                t = this._tokens.peek();
                if (t.type === ')') {
                    this._tokens.next();
                    break;
                } else if (t.type !== '&' && t.type !== TokenType.T_VARIABLE) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _closureUseVariable() {

        let n = this._tempNode(NodeType.ClosureUseVariable, this._startPos());

        if (this._tokens.consume('&')) {
            n.value.flag = Flag.PassByRef;
        }

        if (this._tokens.consume(TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_VARIABLE]));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _parameterList() {

        let n = this._tempNode(NodeType.ParameterList, this._startPos());
        let t: Token;

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._concreteNode(n, this._endPos());
        }

        if (this._tokens.consume(')')) {
            return this._concreteNode(n, this._endPos());
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._parameter());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                let recover = parameterStartTokenTypes.slice(0);
                recover.push(')');
                n.value.errors.push(this._error(t, [',', ')'], recover));
                if (this._tokens.peek().type === ')') {
                    this._tokens.next();
                    break;
                } else if (!this._isParameterStartToken(this._tokens.peek())) {
                    break;
                }
            }
        }

        return this._concreteNode(n, this._endPos());

    }

    private _isParameterStartToken(t: Token) {
        switch (t.type) {
            case '&':
            case TokenType.T_ELLIPSIS:
            case TokenType.T_VARIABLE:
                return true;
            default:
                return this._isTypeExpressionStartToken(t);
        }
    }

    private _isTypeExpressionStartToken(t: Token) {
        switch (t.type) {
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

        let n = this._tempNode(NodeType.Parameter, this._startPos());

        if (this._isTypeExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push(['&', TokenType.T_ELLIPSIS, TokenType.T_VARIABLE]);
            n.children.push(this._typeExpression());
            this._followOnStack.pop();
        }

        if (this._tokens.consume('&')) {
            n.value.flag = Flag.PassByRef;
        } else if (this._tokens.consume(TokenType.T_ELLIPSIS)) {
            n.value.flag = Flag.Variadic;
        }

        if (this._tokens.consume(TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_VARIABLE]));
            return this._concreteNode(n, this._endPos());
        }

        if (this._tokens.consume('=')) {
            n.children.push(this._expression());
        }

        return this._concreteNode(n, this._endPos());

    }

    private _variable() {

        let startPos = this._startPos();
        this._variableAtomType = 0;
        let variableAtom = this._variableAtom();
        let count = 0;

        while (true) {
            ++count;
            switch (this._tokens.peek().type) {
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
                    let call = this._tempNode(NodeType.Call, startPos);
                    call.children.push(variableAtom, this._argumentList());
                    variableAtom = this._concreteNode(call, this._endPos());
                    continue;
                default:
                    if (count === 1 && this._variableAtomType !== NodeType.Variable) {
                        //error
                        let errNode = this._tempNode(NodeType.Error, startPos);
                        errNode.children.push(variableAtom);
                        errNode.value.errors.push(this._error(this._tokens.peek(),
                            [TokenType.T_PAAMAYIM_NEKUDOTAYIM, TokenType.T_OBJECT_OPERATOR, '[', '{', '(']));
                        return this._concreteNode(errNode, this._endPos());
                    }
                    break;
            }

            break;
        }

        return variableAtom;
    }

    private _staticMember(lhs: T, startPos: Position) {

        let n = this._tempNode(NodeType.StaticMethodCall, startPos)
        n.children.push(lhs);
        this._tokens.next() //::

        switch (this._tokens.peek().type) {
            case '{':
                n.children.push(this._parenthesisedExpression());
                break;
            case '$':
            case TokenType.T_VARIABLE:
                n.children.push(this._simpleVariable());
                n.value.type = NodeType.StaticProperty;
                break;
            case TokenType.T_STRING:
                n.children.push(this._nodeFactory(this._tokens.next()));
                n.value.type = NodeType.ClassConstant;
                break;
            default:
                if (this._isSemiReservedToken(this._tokens.peek())) {
                    n.children.push(this._nodeFactory(this._tokens.next()));
                    n.value.type = NodeType.ClassConstant;
                    break;
                } else {
                    //error
                    n.value.errors.push(this._error(this._tokens.peek(),
                        ['{', '$', TokenType.T_VARIABLE, TokenType.T_STRING]
                    ));
                    return this._concreteNode(n, this._endPos());
                }
        }

        let t = this._tokens.peek();

        if (t.type === '(') {
            n.children.push(this._argumentList());
            n.value.type = NodeType.StaticMethodCall;
            return this._concreteNode(n, this._endPos());
        } else if (n.value.type === NodeType.StaticMethodCall) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _instanceMember(lhs: T, startPos: Position) {

        let n = this._tempNode(NodeType.Property, startPos);
        n.children.push(lhs);
        this._tokens.next(); //->
        n.children.push(this._propertyName());

        if (this._tokens.consume('(')) {
            n.children.push(this._argumentList());
            n.value.type = NodeType.MethodCall;
        }

        return this._concreteNode(n, this._endPos());

    }

    private _propertyName() {

        switch (this._tokens.peek().type) {
            case TokenType.T_STRING:
                return this._nodeFactory(this._tokens.next());
            case '{':
                return this._parenthesisedExpression();
            case '$':
            case TokenType.T_VARIABLE:
                return this._simpleVariable();
            default:
                //error
                let e = this._tempNode(NodeType.Error, this._startPos());
                e.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_STRING, '{', '$']));
                return this._concreteNode(e, this._endPos());
        }

    }

    private _dimension(lhs: T, startPos: Position) {

        let n = this._tempNode(NodeType.Dimension, startPos);
        let close = this._tokens.peek().type === '[' ? ']' : '}';
        n.children.push(lhs);
        this._tokens.next();

        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([close]);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }

        if (!this._tokens.consume(close)) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [close]));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _argumentList() {

        let n = this._tempNode(NodeType.ArgumentList, this._startPos());
        let t: Token;

        if (this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._concreteNode(n, this._endPos());
        }

        if (this._tokens.consume(')')) {
            return this._concreteNode(n, this._endPos());
        }

        let followOn = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._argument());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.type === ')') {
                this._tokens.next();
                break;
            } else if (t.type === ',') {
                this._tokens.next();
            } else {
                //error
                let argTokenTypes = expressionStartTokenTypes.slice(0);
                argTokenTypes.push(TokenType.T_ELLIPSIS, ')');
                n.value.errors.push(this._error(this._tokens.peek(), followOn, argTokenTypes));
                let sync = this._tokens.peek().type;
                if (t.type === ')') {
                    this._tokens.next();
                    break;
                } else if (argTokenTypes.indexOf(t.type) === -1) {
                    break;
                }
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _isArgumentStartToken(t: Token) {
        return t.type === TokenType.T_ELLIPSIS || this._isExpressionStartToken(t);
    }

    private _argument() {

        let n = this._tempNode(NodeType.Error, this._startPos());
        let t = this._tokens.peek();

        if (t.type === TokenType.T_ELLIPSIS) {
            this._tokens.next();
            n.value.type = NodeType.Unpack;
            n.children.push(this._expression());
            return this._concreteNode(n, this._endPos());
        } else if (this._isExpressionStartToken(t)) {
            return this._expression();
        } else {
            //error
            let expected = expressionStartTokenTypes.slice(0);
            expected.push(TokenType.T_ELLIPSIS);
            n.value.errors.push(this._error(t, expected));
            return this._concreteNode(n, this._endPos());
        }

    }

    private _name() {

        let n = this._tempNode(NodeType.Name, this._startPos());

        if (this._tokens.consume(TokenType.T_NS_SEPARATOR)) {
            n.value.flag = Flag.NameFq;
        } else if (this._tokens.consume(TokenType.T_NAMESPACE)) {
            n.value.flag = Flag.NameRelative;
            if (!this._tokens.consume(TokenType.T_NS_SEPARATOR)) {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_NS_SEPARATOR], [TokenType.T_STRING]));
            }
        } else {
            n.value.flag = Flag.NameNotFq;
        }

        n.children.push(this._namespaceName());
        return this._concreteNode(n, this._endPos());

    }

    private _shortArray() {

        let n = this._tempNode(NodeType.ArrayPairList, this._startPos());
        let t = this._tokens.next();

        if (this._tokens.consume(']')) {
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([']']);
        this._arrayPairList(n, ')');
        this._followOnStack.pop();

        if (!this._tokens.consume(']')) {
            n.value.errors.push(this._error(this._tokens.peek(), [']']));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _longArray() {

        let n = this._tempNode(NodeType.ArrayPairList, this._startPos());
        this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._concreteNode(n, this._endPos());
        }

        if (this._tokens.consume(')')) {
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([')']);
        this._arrayPairList(n, ')');
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            n.value.errors.push(this._error(this._tokens.peek(), [')']));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _isArrayPairStartToken(t: Token) {
        return t.type === '&' || this._isExpressionStartToken(t);
    }

    private _arrayPairList(n: TempNode<T>, breakOn: TokenType | string) {

        let t: Token;
        let followOn: (TokenType | string)[] = [',', breakOn];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._arrayPair());
            this._followOnStack.pop();
            t = this._tokens.peek();

            if (t.type === ',') {
                this._tokens.next();
                if (this._tokens.peek().type === breakOn) {
                    break;
                }
            } else if (t.type === breakOn) {
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, followOn, expressionStartTokenTypes));
                if (!this._isArrayPairStartToken(this._tokens.peek())) {
                    break;
                }
            }

        }

        return n;

    }


    private _arrayPair() {

        let n = this._tempNode(NodeType.ArrayPair, this._startPos());

        if (this._tokens.peek().type === '&') {
            n.children.push(this._unaryExpression());
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (this._tokens.peek().type !== TokenType.T_DOUBLE_ARROW) {
            return this._concreteNode(n, this._endPos());
        }

        this._tokens.next();

        if (this._tokens.peek().type === '&') {
            n.children.push(this._unaryExpression());
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._expression());
        return this._concreteNode(n, this._endPos());

    }


    private _variableAtom() {

        let n: TempNode<T>;
        switch (this._tokens.peek().type) {
            case TokenType.T_VARIABLE:
            case '$':
                this._variableAtomType = NodeType.Variable;
                return this._simpleVariable();
            case '(':
                this._variableAtomType = NodeType.ParenthesisedExpression;
                return this._parenthesisedExpression();
            case TokenType.T_ARRAY:
                this._variableAtomType = NodeType.ArrayDeclaration;
                return this._longArray();
            case '[':
                this._variableAtomType = NodeType.ArrayDeclaration;
                return this._shortArray();
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
                return this._nodeFactory(this._tokens.next());
            case TokenType.T_STATIC:
                this._variableAtomType = NodeType.Name;
                n = this._tempNode(NodeType.Name, this._startPos());
                n.children.push(this._nodeFactory(this._tokens.next()));
                return this._concreteNode(n, this._endPos());
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                this._variableAtomType = NodeType.Name;
                return this._name();
            default:
                //error
                n = this._tempNode(NodeType.Error, this._startPos());
                n.value.errors.push(this._error(this._tokens.peek(),
                    [TokenType.T_VARIABLE, '$', '(', '[', TokenType.T_ARRAY, TokenType.T_CONSTANT_ENCAPSED_STRING,
                    TokenType.T_STATIC, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR],
                    [], [NodeType.Variable, NodeType.ParenthesisedExpression, NodeType.ArrayDeclaration, NodeType.Name]));
                return this._concreteNode(n, this._endPos());
        }

    }

    private _simpleVariable() {

        let n = this._tempNode(NodeType.Variable, this._startPos());
        let t = this._tokens.peek();

        if (t.type === TokenType.T_VARIABLE) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else if (t.type === '$') {
            this._tokens.next();
            t = this._tokens.peek();
            if (t.type === '{') {
                n.children.push(this._parenthesisedExpression());
            } else if (t.type === '$' || t.type === TokenType.T_VARIABLE) {
                n.children.push(this._simpleVariable());
            } else {
                //error
                n.value.errors.push(this._error(t, ['{', '$', TokenType.T_VARIABLE]));
            }
        } else {
            //shouldnt get here
            throw new Error(`Unexpected token ${t.type}`);
        }

        return this._concreteNode(n, this._endPos());

    }

    private _parenthesisedExpression() {

        let errNode = this._tempNode(NodeType.Error, this._startPos());
        let close: TokenType | string;

        switch (this._tokens.peek().type) {
            case '(':
                close = ')';
                break;
            case '{':
                close = '}';
                break;
            case '[':
                close = ']';
                break;
            default:
                throw new Error(`Unexpected token ${this._tokens.peek().type}`);
        }

        this._tokens.next();
        this._followOnStack.push([close]);
        errNode.children.push(this._expression());
        this._followOnStack.pop();

        if (this._tokens.consume(close)) {
            return errNode.children.pop();
        } else {
            //error
            errNode.value.errors.push(this._error(this._tokens.peek(), [close]));
            return this._concreteNode(errNode, this._endPos());
        }
    }

    private _isBinaryOpToken(t: Token) {
        return this._opPrecedenceMap.hasOwnProperty(t.text) && (this._opPrecedenceMap[t.text][2] & OpType.Binary) === OpType.Binary;
    }

    private _haltCompilerStatement() {

        let n = this._tempNode(NodeType.HaltCompilerStatement, this._startPos());
        this._tokens.next();

        let expected: (TokenType | string)[] = ['(', ')', ';'];
        let t: Token;

        for (let k = 0; k < expected.length; ++k) {
            if (!this._tokens.consume(expected[k])) {
                n.value.errors.push(this._error(this._tokens.peek(), [expected[k]]));
                break;
            }
        }

        return this._concreteNode(n, this._endPos());

    }

    private _useStatement() {

        let n = this._tempNode(NodeType.UseStatement, this._startPos());
        this._tokens.next();

        if (this._tokens.consume(TokenType.T_FUNCTION)) {
            n.value.flag = Flag.UseFunction;
        } else if (this._tokens.consume(TokenType.T_CONST)) {
            n.value.flag = Flag.UseConstant;
        }

        let useElementList = this._tempNode(NodeType.UseList, this._startPos());
        let useElement = this._tempNode(NodeType.UseElement, this._startPos());
        this._tokens.consume(TokenType.T_NS_SEPARATOR);

        this._followOnStack.push([TokenType.T_NS_SEPARATOR, ',', ';']);
        let namespaceName = this._namespaceName();
        this._followOnStack.pop();

        if (this._tokens.consume(TokenType.T_NS_SEPARATOR)) {
            n.value.type = NodeType.UseGroupStatement;
            n.children.push(namespaceName);
            return this._useGroup(n);
        }

        if (!n.value.flag) {
            n.value.flag = Flag.UseClass;
        }

        useElement.children.push(namespaceName);
        this._followOnStack.push([',', ';']);
        useElementList.children.push(this._useElement(useElement, false, true));
        this._followOnStack.pop();

        if (this._tokens.consume(',')) {
            this._followOnStack.push([';']);
            n.children.push(this._useList(useElementList, false, true, ';'));
            this._followOnStack.pop();
        } else {
            n.children.push(this._concreteNode(useElementList, this._endPos()));
        }

        if (!this._tokens.consume(';')) {
            n.value.errors.push(this._error(this._tokens.peek(), [';']));
        }

        return this._concreteNode(n, this._endPos());
    }

    private _useGroup(n: TempNode<T>) {

        if (!this._tokens.consume('{')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['{']));
            return this._concreteNode(n, this._endPos());
        }

        this._followOnStack.push(['}']);
        n.children.push(this._useList(this._tempNode(NodeType.UseList, this._startPos()), !n.value.flag, false, '}'));
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['}']));
        }

        return this._concreteNode(n, this._endPos());
    }

    private _useList(n: TempNode<T>, isMixed: boolean, lookForPrefix: boolean, breakOn: TokenType | string) {

        let t: Token;
        let followOn: (TokenType | string)[] = [',', breakOn];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._useElement(this._tempNode(NodeType.UseElement, this._startPos()), isMixed, lookForPrefix));
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === breakOn) {
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, [',', breakOn]));
                break;
            }

        }

        return this._concreteNode(n, this._endPos());

    }

    private _useElement(n: TempNode<T>, isMixed: boolean, lookForPrefix: boolean) {

        //if children not empty then it contains tokens to left of T_AS
        if (!n.children.length) {

            if (isMixed) {
                if (this._tokens.consume(TokenType.T_FUNCTION)) {
                    n.value.flag = Flag.UseFunction;
                } else if (this._tokens.consume(TokenType.T_CONST)) {
                    n.value.flag = Flag.UseConstant;
                } else {
                    n.value.flag = Flag.UseClass;
                }
            } else if (lookForPrefix) {
                this._tokens.consume(TokenType.T_NS_SEPARATOR);
            }

            this._followOnStack.push([TokenType.T_AS]);
            n.children.push(this._namespaceName());
            this._followOnStack.pop();
        }

        if (!this._tokens.consume(TokenType.T_AS)) {
            return this._concreteNode(n, this._endPos());
        }

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        } else {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_STRING]));
        }

        return this._concreteNode(n, this._endPos());
    }

    private _namespaceStatement() {

        let n = this._tempNode(NodeType.NamespaceStatement, this._startPos());
        this._tokens.next();
        this._tokens.lastDocComment;

        if (this._tokens.peek().type === TokenType.T_STRING) {

            this._followOnStack.push([';', '{']);
            n.children.push(this._namespaceName());
            this._followOnStack.pop();

            if (this._tokens.consume(';')) {
                return this._concreteNode(n, this._endPos());
            }

        }

        if (!this._tokens.consume('{')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['{']));
            return this._concreteNode(n, this._endPos());
        }

        n.children.push(this._topStatementList(true));

        if (!this._tokens.consume('}')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['}']));
        }

        return this._concreteNode(n, this._endPos());

    }

    private _namespaceName() {

        let n = this._tempNode(NodeType.NamespaceName, this._startPos());

        if (this._tokens.peek().type === TokenType.T_STRING) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        } else {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_STRING]));
            return this._concreteNode(n, this._endPos());
        }

        while (true) {

            if (this._tokens.peek().type === TokenType.T_NS_SEPARATOR &&
                this._tokens.peek(1).type === TokenType.T_STRING) {
                this._tokens.next();
                n.children.push(this._nodeFactory(this._tokens.next()));
            } else {
                break;
            }

        }

        return this._concreteNode(n, this._endPos());

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
        switch (t.type) {
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
        switch (t.type) {
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

        switch (t.type) {
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
        switch (t.type) {
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

        switch (t.type) {
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

