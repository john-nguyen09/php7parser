/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType, Iterator, Position, Range } from './lexer';
import { ParseError, ErrorRecovery } from './parseError';
import { TokenIterator } from './tokenIterator';

export enum NodeType {
    None = 0,
    TopStatementList, NamespaceStatement, NamespaceName, UseElement, UseStatement, UseGroupStatement,
    UseList, HaltCompilerStatement, ConstantDeclarationStatement, ConstantDeclarationList, ConstantDeclaration, DynamicVariable,
    ArrayDeclaration, ArrayPair, UnaryExpression, ArrayPair, Name, ParenthesisedExpression, Call,
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
    Statement, IfStatementList, IfStatement, WhileStatement, DoWhileStatement, ExpressionList, ForStatement,
    BreakStatement, ContinueStatement, ReturnStatement, GlobalVariableDeclarationStatement, StaticVariableListStatement, StaticVariableDeclaration,
    EchoStatement, UnsetStatement, ThrowStatement, GotoStatement, LabelStatement, ForeachStatement,
    CaseStatementList, SwitchStatement, CaseStatement, DeclareStatement, TryStatement, TryCatchFinallyStatement,
    Catch, CatchNameList, FinallyStatement, TernaryExpression, UnaryBoolNot, UnaryBitwiseNot, UnaryMinus, UnaryPlus,
    UnarySilence, UnaryPreInc, UnaryPostInc, UnaryPreDec, UnaryPostDec, UnaryReference, BinaryBitwiseOr, BinaryBitwiseAnd,
    BinaryBitwiseXor, BinaryConcat, BinaryAdd, BinarySubtract, BinaryMultiply, BinaryDivide, BinaryModulus, BinaryPower, BinaryShiftLeft,
    BinaryShiftRight, BinaryBoolAnd, BinaryBoolOr, BinaryLogicalAnd, BinaryLogicalOr, BinaryLogicalXor, BinaryIsIdentical,
    BinaryIsNotIdentical, BinaryIsEqual, BinaryIsNotEqual, BinaryIsSmaller, BinaryIsSmallerOrEqual, BinaryIsGreater,
    BinaryIsGreaterOrEqual, BinarySpaceship, BinaryCoalesce, BinaryAssign, BinaryConcatAssign, BinaryAddAssign, BinarySubtractAssign, BinaryMultiplyAssign,
    BinaryDivideAssign, BinaryModulusAssign, BinaryPowerAssign, BinaryShiftLeftAssign, BinaryShiftRightAssign, BinaryBitwiseOrAssign, BinaryBitwiseAndAssign,
    BinaryBitwiseXorAssign
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

    Nullable, NameFq, NameNotFq, NameRelative,
    UseClass,
    UseFunction,
    UseConstant
}

export interface NodeFactory<T> {
    (value: Element | string, children?: T[]): T;
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

function isReservedToken(t: Token) {
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

function isSemiReservedToken(t: Token) {
    switch (t.type) {
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
            return isStatementStartToken(t);
    }

}

function isInnerStatementStartToken(t: Token) {
    switch (t.type) {
        case TokenType.T_FUNCTION:
        case TokenType.T_ABSTRACT:
        case TokenType.T_FINAL:
        case TokenType.T_CLASS:
        case TokenType.T_TRAIT:
        case TokenType.T_INTERFACE:
            return true;
        default:
            return this.isStatementStartToken(t);
    }
}

function isStatementStartToken(t: Token) {

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
            return isExpressionStartToken(t);
    }
}



interface TempNode<T> {
    value: Element;
    children: T[];
}

export interface DocComment {
    text: string;
    range: Range;
}

export interface Element {
    type: NodeType;
    flag: Flag;
    doc: DocComment;
    range: Range;
    errors: ParseError[];
}

var topStatementStartTokenTypes: (TokenType | string)[] = [
    TokenType.T_NAMESPACE, TokenType.T_USE, TokenType.T_HALT_COMPILER, TokenType.T_CONST,
    TokenType.T_FUNCTION, TokenType.T_CLASS, TokenType.T_ABSTRACT, TokenType.T_FINAL,
    TokenType.T_TRAIT, TokenType.T_INTERFACE, '{', TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO,
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
    '{', TokenType.T_IF, TokenType.T_WHILE, TokenType.T_DO,
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

export class Parser<T> {

    private _nodeFactory: NodeFactory<T>;
    private _opPrecedenceMap = opPrecedenceMap;
    private _tokens: TokenIterator
    private _followOnStack: (TokenType | string)[][];
    private _isBinaryOpPredicate: Predicate;
    private _variableAtomType: NodeType;

    constructor(nodeFactory: NodeFactory<T>) {
        this._nodeFactory = nodeFactory;
    }

    parse(tokens: Token[]) {

        this._followOnStack = [];
        this._tokens = new TokenIterator(tokens);
        return this._topStatementList(false);

    }

    private _start(type: NodeType = 0): TempNode<T> {

        let pos = this._startPos();
        let n = this._tempNode();
        n.value.type = type;
        n.value.range.start = pos;
        return n;
    }

    private _tempNode(): TempNode<T> {
        return {
            value: {
                type: 0,
                flag: 0,
                doc: null,
                range: {
                    start: null,
                    end: null
                },
                errors: []
            },
            children: []
        };
    }


    private _end(tempNode: TempNode<T>) {

        let t = this._tokens.current;
        tempNode.value.range.end = t.range.end;
        return this._nodeFactory(tempNode.value, tempNode.children);

    }

    private _startPos() {
        let t = this._tokens.peek();

        if (t.type === TokenType.T_EOF) {
            t = this._tokens.current;
        }

        return t.range.start;
    }

    private _topStatementList(isCurly: boolean) {

        let n = this._start(NodeType.TopStatementList);
        let t = this._tokens.peek();
        let breakOn = isCurly ? '}' : TokenType.T_EOF;
        let followOn = topStatementStartTokenTypes.slice(0);
        followOn.push(breakOn);

        while (true) {

            if (isTopStatementStartToken(t)) {
                this._followOnStack.push(followOn)
                n.children.push(this._topStatement());
                this._followOnStack.pop();
                t = this._tokens.peek();
            } else if (t.type === breakOn) {
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, followOn, followOn));
                if (this._tokens.peek().type === TokenType.T_EOF) {
                    break;
                }
            }

        }

        return this._end(n);

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
                if (isStatementStartToken(t)) {
                    return this._statement();
                } else {
                    //error
                    //shouldn't reach here
                    throw new Error(`Unexpected token ${t.type}`);
                }
        }

    }

    private _constantDeclarationStatement() {

        let n = this._start(NodeType.ConstantDeclarationStatement);
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
                n.value.errors.push(this._error(t, [',', ';'], [TokenType.T_STRING]));
                if (this._tokens.peek().type !== TokenType.T_STRING) {
                    break;
                }
            }
        }

        return this._end(n);

    }

    private _constantDeclaration() {

        let n = this._start(NodeType.ConstantDeclaration);
        let t: Token;

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current.text));
            n.value.doc = this._tokens.lastDocComment;
        } else {
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_STRING]));
            return this._end(n);
        }

        if (!this._tokens.consume('=')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['=']));
            return this._end(n);
        }

        n.children.push(this._expression());
        return this._end(n);

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
                    rhs = this._expression(precedence);
                }

                lhs = this._binaryNode(lhs, rhs, this._binaryOpToNodeType(op), startPos);
            }

        }

        return lhs;


    }

    private _binaryNode(lhs: T, rhs: T, type: NodeType, startPos: Position) {
        let tempNode = this._tempNode();
        tempNode.value.type = type;
        tempNode.value.range.start = startPos;
        tempNode.value.range.end = this._tokens.current.range.end;
        tempNode.children.push(lhs);
        tempNode.children.push(rhs);
        return this._nodeFactory(tempNode.value, tempNode.children);
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
            default:
                throw new Error(`Unknown operator ${op.text}`);

        }

    }

    private _ternaryExpression(lhs: T, precedence: number, startPos: Position) {

        let n = this._tempNode();
        n.value.type === NodeType.TernaryExpression;
        n.value.range.start = startPos;
        n.children.push(lhs);
        this._followOnStack.push([':']);
        n.children.push(this._expression(precedence));
        this._followOnStack.pop();

        if (!this._tokens.consume(':')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [':'], expressionStartTokenTypes));
        }

        n.children.push(this._expression(precedence));
        return this._end(n);

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
                    let unary = this._tempNode();
                    unary.value.type = t.type === TokenType.T_INC ? NodeType.UnaryPostInc : NodeType.UnaryPostDec;
                    unary.value.range.start = possibleUnaryStart;
                    unary.value.range.end = t.range.end;
                    unary.children.push(variable);
                    return this._nodeFactory(unary.value, unary.children);
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
            case TokenType.T_LINE:
            case TokenType.T_FILE:
            case TokenType.T_DIR:
            case TokenType.T_TRAIT_C:
            case TokenType.T_METHOD_C:
            case TokenType.T_FUNC_C:
            case TokenType.T_NS_C:
            case TokenType.T_CLASS_C:
                return t;
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

    private _isset() {

        let n = this._start(NodeType.Isset);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._end(n);
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
                n.value.errors.push(this._error(this._tokens.peek(), followOn, expressionStartTokenTypes));
                if (!this._isExpressionStartToken(this._tokens.peek())) {
                    break;
                }
            }

        }

        return this._end(n);

    }

    private _keywordParenthesisedExpression(type: NodeType) {

        let n = this._start(type);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            n.children.push(this._nodeFactory(null));
            return this._end(n);
        }

        this._followOnStack.push([')']);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [')']));
        }

        return this._end(n);

    }

    private _keywordExpression(nodeType: NodeType) {

        let n = this._start(nodeType);
        this._tokens.next();
        n.children.push(this._expression());
        return this._end(n);
    }



    private _yield() {

        let n = this._start(NodeType.Yield);
        this._tokens.next();

        if (!this._isExpressionStartToken(this._tokens.peek())) {
            return this._end(n);
        }

        this._followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(TokenType.T_DOUBLE_ARROW)) {
            return this._end(n);
        }

        n.children.push(this._expression());
        return this._end(n);

    }

    private _quotedEncapsulatedVariableList(type: NodeType, closeTokenType: TokenType | string) {

        let n = this._start(type);
        this._tokens.next();
        this._followOnStack.push([closeTokenType]);
        n.children.push(this._encapsulatedVariableList());
        this._followOnStack.pop();

        if (!this._tokens.consume(closeTokenType)) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [closeTokenType]));
        }

        return this._end(n);

    }

    private _encapsulatedVariableList() {

        let children: (T | Token)[] = [];

        while (true) {

            switch (this._tokens.current.type) {
                case TokenType.T_ENCAPSED_AND_WHITESPACE:
                    children.push(this._tokens.current);
                    this._tokens.next();
                    continue;
                case TokenType.T_VARIABLE:
                    let next = this._tokens.peek();
                    if (next.type === '[') {
                        children.push(this._encapsulatedDimension());
                    } else if (next.type === TokenType.T_OBJECT_OPERATOR) {
                        children.push(this._encapsulatedProperty());
                    } else {
                        children.push(this._nodeFactory(NodeType.Variable, [this._tokens.current]));
                        this._tokens.next();
                    }
                    continue;
                case TokenType.T_DOLLAR_OPEN_CURLY_BRACES:
                    children.push(this._dollarCurlyOpenEncapsulatedVariable());
                    continue;
                case TokenType.T_CURLY_OPEN:
                    children.push(this._curlyOpenEncapsulatedVariable());
                    continue;
                default:
                    break;
            }

            break;

        }

        return this._nodeFactory(NodeType.EncapsulatedVariableList, children);

    }

    private _curlyOpenEncapsulatedVariable() {

        let children: (T | Token)[] = [this._tokens.current, this._variable()];
        let t = this._tokens.current;

        if (t.type !== '}') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.EncapsulatedVariable, children);

    }

    private _dollarCurlyOpenEncapsulatedVariable() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type === TokenType.T_STRING_VARNAME) {

            if (this._tokens.peek().type === '[') {

                let dimChildren: (T | Token)[] = [this._nodeFactory(NodeType.Variable, [t]), this._tokens.next(), this._expression()];
                t = this._tokens.current;
                if (t.type !== ']') {
                    //error
                }
                dimChildren.push(t);
                children.push(this._nodeFactory(NodeType.Dimension, dimChildren));
            } else {
                children.push(this._nodeFactory(NodeType.Variable, [t]));
            }

            this._tokens.next();

        } else if (this._isExpressionStartToken(t)) {
            children.push(this._expression());
        } else {
            //error
        }

        t = this._tokens.current;
        if (t.type !== '}') {
            //error
        }
        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.EncapsulatedVariable, children);

    }

    private _encapsulatedDimension() {

        let children: (T | Token)[] = [this._nodeFactory(NodeType.Variable, [this._tokens.current]), this._tokens.next()];
        let t = this._tokens.next();

        switch (t.type) {
            case TokenType.T_STRING:
            case TokenType.T_NUM_STRING:
                children.push(t);
                break;
            case TokenType.T_VARIABLE:
                children.push(this._nodeFactory(NodeType.Variable, [t]));
                break;
            case '-':
                let unaryNodeChildren = [t];
                t = this._tokens.next();
                if (t.type !== TokenType.T_NUM_STRING) {
                    //error
                }
                unaryNodeChildren.push(t);
                children.push(this._nodeFactory(NodeType.UnaryExpression, unaryNodeChildren));
                break;
            default:
                //error
                break;
        }

        t = this._tokens.next();
        if (t.type !== ']') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.Dimension, children);

    }

    private _encapsulatedProperty() {
        let children: (T | Token)[] = [this._nodeFactory(NodeType.Variable, [this._tokens.current]), this._tokens.next()];
        let t = this._tokens.next();

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.Property, children);
    }

    private _heredoc() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();
        children.push(this._encapsulatedVariableList());
        t = this._tokens.current;

        if (t.type !== TokenType.T_END_HEREDOC) {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.Heredoc, children);

    }

    private _anonymousClassDeclaration() {

        let n = this._start(NodeType.AnonymousClassDeclaration);
        this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;

        if (this._tokens.peek().type === '(') {
            this._followOnStack.push([TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._argumentList());
            this._followOnStack.pop();
        }

        if (this._tokens.peek().type === TokenType.T_EXTENDS) {
            this._followOnStack.push([TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._extendsClass());
            this._followOnStack.pop();
        }

        if (this._tokens.peek().type === TokenType.T_IMPLEMENTS) {
            this._followOnStack.push(['{']);
            n.children.push(this._implements());
            this._followOnStack.pop();
        }

        n.children.push(this._classStatementList());
        return this._end(n);

    }

    private _classStatementList() {

        let n = this._start(NodeType.ClassStatementList);
        let t:Token;

        if (!this._tokens.consume('{')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['{']));
            return this._end(n);
        }

        let followOn:(TokenType|string)[] = classStatementStartTokenTypes.slice(0);
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
                n.value.errors.push(this._error(t, followOn, followOn));
                t = this._tokens.peek();
                if(!this._isClassStatementStartToken(t) && t.type === '}'){
                    break;
                }
            }

        }

        return this._end(n);

    }

    private _isClassStatementStartToken(t: Token) {
        return t.type === TokenType.T_PUBLIC ||
            t.type === TokenType.T_PROTECTED ||
            t.type === TokenType.T_PRIVATE ||
            t.type === TokenType.T_STATIC ||
            t.type === TokenType.T_ABSTRACT ||
            t.type === TokenType.T_FINAL ||
            t.type === TokenType.T_FUNCTION ||
            t.type === TokenType.T_VAR ||
            t.type === TokenType.T_CONST ||
            t.type === TokenType.T_USE;
    }

    private _classStatement() {

        let t = this._tokens.current;

        switch (t.type) {
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                let modifierList = this._memberModifierList();
                t = this._tokens.current;
                if (t.type === TokenType.T_VARIABLE) {
                    return this._propertyDeclarationStatement(modifierList);
                } else if (t.type === TokenType.T_FUNCTION) {
                    return this._methodDeclarationStatement(modifierList);
                } else if (t.type === TokenType.T_CONST) {
                    return this._classConstantDeclarationStatement(modifierList);
                } else {
                    //error
                }
            case TokenType.T_FUNCTION:
                return this._methodDeclarationStatement();
            case TokenType.T_VAR:
                this._tokens.next();
                return this._propertyDeclarationStatement(t);
            case TokenType.T_CONST:
                return this._classConstantDeclarationStatement();
            case TokenType.T_USE:
                return this._useTraitStatement();
            default:
                //error
                break;

        }

    }

    private _useTraitStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        children.push(this._nameList());
        t = this._tokens.current;

        if (t.type === ';') {
            children.push(t);
            this._tokens.next();
            return this._nodeFactory(NodeType.UseTraitStatement, children);
        }

        if (t.type !== '{') {
            //error
        }

        children.push(this._traitAdaptationList());
        return this._nodeFactory(NodeType.TraitAdaptationList, children);

    }

    private _traitAdaptationList() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        while (true) {

            if (t.type === '}' || t.type === TokenType.T_EOF) {
                children.push(t);
                this._tokens.next();
                break;
            } else if (t.type === TokenType.T_STRING ||
                t.type === TokenType.T_NAMESPACE ||
                t.type === TokenType.T_NS_SEPARATOR ||
                this._isSemiReservedToken(t)) {
                children.push(this._traitAdaptation());
                t = this._tokens.current;
            } else {
                //error
                break;
            }

        }

        return this._nodeFactory(NodeType.TraitAdaptationList, children);
    }

    private _traitAdaptation() {

        let t = this._tokens.current;
        let methodRefOrIdent: T | Token;
        let t2 = this._tokens.peek();

        if (t.type === TokenType.T_NAMESPACE ||
            t.type === TokenType.T_NS_SEPARATOR ||
            (t.type === TokenType.T_STRING &&
                (t2.type === TokenType.T_PAAMAYIM_NEKUDOTAYIM || t2.type === TokenType.T_NS_SEPARATOR))) {

            methodRefOrIdent = this._methodReference();
            t = this._tokens.current;

            if (t.type === TokenType.T_INSTEADOF) {
                return this._traitPrecedence(methodRefOrIdent);
            }

        } else if (t.type === TokenType.T_STRING || this._isSemiReservedToken(t)) {
            methodRefOrIdent = t;
            this._tokens.next();
        } else {
            //error
        }

        return this._traitAlias(methodRefOrIdent);


    }

    private _traitAlias(methodReferenceOrIdentifier: T | Token) {
        let t = this._tokens.current;
        let children: (T | Token)[] = [methodReferenceOrIdentifier];

        if (t.type !== TokenType.T_AS) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type === TokenType.T_STRING || this._isReservedToken(t)) {
            children.push(t);
            t = this._tokens.next();
        } else if (t.type === TokenType.T_PUBLIC || t.type === TokenType.T_PROTECTED || t.type === TokenType.T_PRIVATE) {
            children.push(t);
            t = this._tokens.next();
            if (t.type === TokenType.T_STRING || this._isSemiReservedToken(t)) {
                children.push(t);
                t = this._tokens.next();
            }
        } else {
            //error
        }

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.TraitAlias, children);
    }

    private _traitPrecedence(methodReference: T) {

        let children: (T | Token)[] = [methodReference, this._tokens.current];
        this._tokens.next();
        children.push(this._nameList());
        let t = this._tokens.current;

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.TraitPrecendence, children);

    }

    private _methodReference() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        children.push(this._name());
        t = this._tokens.current;

        if (t.type !== TokenType.T_PAAMAYIM_NEKUDOTAYIM) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type !== TokenType.T_STRING || !this._isSemiReservedToken(t)) {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.MethodReference, children);

    }

    private _methodDeclarationStatement(modifiers: T = null) {

        let t = this._tokens.current;
        let children: (T | Token)[] = [];
        let doc = this._tokens.lastDocComment;

        if (modifiers) {
            children.push(modifiers);
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type === '&') {
            children.push(t);
            t = this._tokens.next();
        }

        if (t.type !== TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            //error
        }

        children.push(t);
        t = this._tokens.next();
        children.push(this._parameterList());
        t = this._tokens.current;

        if (t.type === ':') {
            children.push(this._returnType());
            t = this._tokens.current;
        }

        if (t.type === ';') {
            children.push(t);
            this._tokens.next();
        } else if (t.type === '{') {
            children.push(this._curlyInnerStatementList());
        } else {
            //error
        }

        return this._nodeFactory(NodeType.MethodDeclaration, children);

    }

    private _curlyInnerStatementList() {

        let n = this._start(NodeType.CurlyInnerStatementList);

        if (!this._tokens.consume('{')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['{']));
            return this._end(n);
        }

        if (this._tokens.consume('}')) {
            return this._end(n);
        }

        n.children.push(this._innerStatementList('}'));

        if (!this._tokens.consume('}')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['}']));
        }

        return this._end(n);

    }

    private _innerStatementList(breakOn: TokenType | string) {

        let n = this._start(NodeType.InnerStatementList);
        let t: Token;
        let followOn = innerStatementStartTokenTypes.slice(0);
        followOn.push(breakOn);

        while (true) {

            t = this._tokens.peek();

            if (isInnerStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._innerStatement());
                this._followOnStack.pop();
            } else if (t.type === breakOn) {
                break;
            } else {
                //error
                n.value.errors.push(this._error(this._tokens.peek(), followOn, followOn));
                t = this._tokens.peek();
                if (!isInnerStatementStartToken(t)) {
                    break;
                }
            }
        }

        return this._end(n);
    }



    private _innerStatement() {

        let t = this._tokens.current;

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
                }

        }

    }

    private _interfaceDeclarationStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let doc = this._tokens.lastDocComment;
        let t = this._tokens.next();

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type === TokenType.T_EXTENDS) {
            children.push(this._extendsInterface());
        }

        children.push(this._classStatementList());
        return this._nodeFactory(NodeType.InterfaceDeclarationStatement, children, doc);

    }

    private _extendsInterface() {

        let children: (T | Token)[] = [this._tokens.current];
        this._tokens.next();
        children.push(this._nameList());
        return this._nodeFactory(NodeType.InterfaceExtends, children);

    }

    private _traitDeclarationStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let doc = this._tokens.lastDocComment;
        let t = this._tokens.next();

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        this._tokens.next();
        children.push(this._classStatementList());
        return this._nodeFactory(NodeType.TraitDeclarationStatement, children, doc);

    }

    private _functionDeclarationStatement(followOn: Predicate) {

        let n = this._tempNode(NodeType.FunctionDeclaration, [this._tokens.next(), this._tokens.lastDocComment]);

        if (this._tokens.peek().type === '&') {
            n.children.push(this._tokens.next());
        }

        if (this._tokens.consume(TokenType.T_STRING)) {
            //error
        }

        children.push(t);
        children.push(this._parameterList());
        t = this._tokens.current;

        if (t.type === ':') {
            children.push(this._returnType());
            t = this._tokens.current;
        }

        children.push(this._curlyInnerStatementList());
        return this._nodeFactory(NodeType.FunctionDeclaration, children);

    }

    private _classDeclarationStatement() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [];
        let doc = this._tokens.lastDocComment;

        if (t.type === TokenType.T_ABSTRACT || t.type === TokenType.T_FINAL) {
            children.push(this._classModifiers());
        }

        t = this._tokens.current;
        if (t.type !== TokenType.T_CLASS) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type === TokenType.T_EXTENDS) {
            children.push(this._extendsClass());
            t = this._tokens.current;
        }

        if (t.type === TokenType.T_IMPLEMENTS) {
            children.push(this._implements());
            t = this._tokens.current;
        }

        children.push(this._classStatementList());
        return this._nodeFactory(NodeType.ClassDeclaration, children, doc);

    }

    private _classModifiers() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        while (true) {
            if (t.type === TokenType.T_ABSTRACT || t.type === TokenType.T_FINAL) {
                children.push(t);
                t = this._tokens.next();
            } else {
                break;
            }

        }

        return this._nodeFactory(NodeType.ClassModifiers, children);

    }

    private _statement() {

        let t = this._tokens.current;

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
                return t;
            case TokenType.T_UNSET:
                return this._unsetStatement();
            case TokenType.T_FOREACH:
                return this._foreachStatement();
            case TokenType.T_DECLARE:
                return this._declareStatement();
            case TokenType.T_TRY:
                return this._tryCatchFinallyStatement();
            case TokenType.T_THROW:
                return this.throwStatement(this._tokens);
            case TokenType.T_GOTO:
                return this._gotoStatement(this._tokens);
            case TokenType.T_STRING:
                return this.labelStatement(this._tokens);
            case ';':
                this._tokens.next();
                return this._nodeFactory(NodeType.Statement, [t]);
            default:
                if (this._isExpressionStartToken(t)) {
                    let children: (T | Token)[] = [this._expression()];
                    let t = this._tokens.current;

                    if (t.type !== ';') {
                        //error
                    }

                    children.push(t);
                    this._tokens.next();
                    return this._nodeFactory(NodeType.Statement, children);
                } else {
                    //error
                }

        }

    }

    private _tryStatement() {

        let children: (T | Token)[] = [this._tokens.current];

        if (!this._expectNext('{', children)) {
            //error
        }

        children.push(this._innerStatementList());

        if (!this._expectCurrent('}', children)) {
            //error
        }

        this._tokens.next();
        return this._nodeFactory(NodeType.TryStatement, children);

    }

    private _tryCatchFinallyStatement() {

        let children: (T | Token)[] = [];

        children.push(this._tryStatement());

        while (true) {

            if (this._tokens.current.type !== TokenType.T_CATCH) {
                break;
            }

            children.push(this._catchStatement());

        }



        return this._nodeFactory(NodeType.CatchList, children);

    }

    private _finallyStatement() {

        let children: (T | Token)[] = [this._tokens.current];

        if (!this._expectNext('{', children)) {
            //error
        }

        this._tokens.next();
        children.push(this._innerStatementList());

        if (!this._expectCurrent('{', children)) {
            //error
        }
        this._tokens.next();
        return this._nodeFactory(NodeType.FinallyStatement, children);

    }

    private _catchStatement() {

        let children: (T | Token)[] = [this._tokens.current];

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

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type === '(') {
            children.push(t);
            t = this._tokens.next();
        } else {
            //error
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

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        while (true) {

            children.push(this._expression());
            t = this._tokens.current;
            if (t.type === ',') {
                children.push(t);
                t = this._tokens.next();
            } else if (t.type === ';') {
                children.push(t);
                t = this._tokens.next();
                break;
            } else {
                //error
            }

        }

        return this._nodeFactory(NodeType.EchoStatement, children);

    }

    private _staticVariableDeclarationStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        while (true) {

            children.push(this._staticVariableDeclaration());
            t = this._tokens.current;
            if (t.type === ',') {
                children.push(this._tokens.current);
                t = this._tokens.next();
            } else if (t.type === ';') {
                children.push(t);
                this._tokens.next();
                break;
            } else {
                //error
                break;
            }


        }

        return this._nodeFactory(NodeType.StaticVariableListStatement, children);

    }



    private _globalVariableDeclarationStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        while (true) {

            children.push(this._simpleVariable());
            t = this._tokens.current;
            if (t.type === ',') {
                children.push(this._tokens.current);
                t = this._tokens.next();
            } else if (t.type === ';') {
                children.push(this._tokens.current);
                this._tokens.next();
                break;
            } else {
                //error
                break;
            }

        }

        return this._nodeFactory(NodeType.GlobalVariableDeclarationStatement, children);

    }

    private _staticVariableDeclaration() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type !== '=') {
            return this._nodeFactory(NodeType.StaticVariableDeclaration, children);
        }

        children.push(t);
        t = this._tokens.next();
        children.push(this._expression());
        return this._nodeFactory(NodeType.StaticVariableDeclaration, children);

    }

    private _keywordOptionalExpressionStatement(nodeType: NodeType) {
        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.current;

        if (this._isExpressionStartToken(t)) {
            children.push(this._expression());
            t = this._tokens.current;
        }

        if (t.type === ';') {
            children.push(t);
            this._tokens.next();
        } else {
            //error
        }

        return this._nodeFactory(nodeType, children);
    }


    private _forStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        for (let n = 0; n < 2; ++n) {
            if (this._isExpressionStartToken(t)) {
                children.push(this._expressionList());
                t = this._tokens.current;
            }

            if (t.type !== ';') {
                //error
            }

            children.push(t);
            t = this._tokens.next();
        }

        if (this._isExpressionStartToken(t)) {
            children.push(this._expression());
            t = this._tokens.current;
        }

        if (t.type !== ')') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type === ':') {
            children.push(t);
            t = this._tokens.next();
            children.push(this._innerStatementList());
            t = this._tokens.current;
            if (t.type !== TokenType.T_ENDFOR) {
                //error
            }
            children.push(t);
            t = this._tokens.next();
            if (t.type !== ';') {
                //error
            }
            children.push(t);
            t = this._tokens.next();
        } else if (this._isStatementStartToken(t)) {
            children.push(this._statement())
        } else {
            //error
        }

        return this._nodeFactory(NodeType.ForStatement, children);



    }

    private _expressionList() {

        let children: (T | Token)[] = [];
        let t = this._tokens.current;

        while (true) {

            children.push(this._expression());
            t = this._tokens.current;

            if (t.type === ',') {
                children.push(t);
                this._tokens.next();
            } else {
                break;
            }

        }

        return this._nodeFactory(NodeType.ExpressionList, children);

    }

    private _doWhileStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        children.push(this._statement());
        t = this._tokens.current;

        if (t.type !== TokenType.T_WHILE) {
            //error
        }

        children.push(t);
        t = this._tokens.next();
        if (t.type !== '(') {
            //error
        }
        children.push(t);
        t = this._tokens.next();
        children.push(this._expression());
        t = this._tokens.current;
        if (t.type !== ')') {
            //error
        }
        children.push(t);
        t = this._tokens.next();
        if (t.type !== ';') {
            //error
        }
        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.DoWhileStatement, children);

    }

    private _whileStatement() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = this._tokens.next();
        children.push(this._expression());

        t = this._tokens.current;
        if (t.type !== ')') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type === ':') {
            children.push(t);
            this._tokens.next();
            children.push(this._innerStatementList());
            t = this._tokens.current;
            if (t.type !== TokenType.T_ENDWHILE) {
                //error
            }
            children.push(t);
            t = this._tokens.next();
            if (t.type !== ';') {
                //error
            }
            children.push(t);
            this._tokens.next();
        } else {
            children.push(this._statement());
        }

        return this._nodeFactory(NodeType.WhileStatement, children);

    }

    private _ifStatementList() {

        let children: (T | Token)[] = [];
        let t = this._tokens.current;
        let discoverAlt = { isAlt: false };

        children.push(this._ifStatement(false, discoverAlt));
        t = this._tokens.current;

        while (true) {

            if (t.type === TokenType.T_ELSEIF) {
                children.push(this._ifStatement(discoverAlt.isAlt));
                t = this._tokens.current;
            } else {
                break;
            }

        }

        if (t.type === TokenType.T_ELSE) {
            children.push(this._ifStatement(discoverAlt.isAlt));
            t = this._tokens.current;
        }

        if (discoverAlt.isAlt) {

            if (t.type !== TokenType.T_ENDIF) {
                //error
            }

            let endIfchildren: (T | Token)[] = [t];
            t = this._tokens.next();
            if (t.type !== ';') {
                //error
            }
            endIfchildren.push(t);
            this._tokens.next();
            children.push(this._nodeFactory(NodeType.IfStatement, endIfchildren));
        }

        return this._nodeFactory(NodeType.IfStatementList, children);

    }

    private _ifStatement(isAlt: boolean, discoverAlt: { isAlt: boolean } = null) {

        let t = this._tokens.current;
        let children: (T | Token)[] = [t];

        if (t.type === TokenType.T_IF || t.type === TokenType.T_ELSEIF) {

            t = this._tokens.next();

            if (t.type !== '(') {
                //error
            }

            children.push(t);
            this._tokens.next();
            children.push(this._expression());
            t = this._tokens.current;

            if (t.type !== ')') {
                //error
            }

            children.push(t);
            t = this._tokens.next();
        } else {
            //must be else
            children.push(t);
            t = this._tokens.next();
        }

        if ((isAlt || discoverAlt) && t.type === ':') {
            if (discoverAlt) {
                discoverAlt.isAlt = true;
            }

            children.push(t);
            t = this._tokens.next();
            children.push(this._innerStatementList());
        } else if (this._isStatementStartToken(t)) {
            children.push(this._statement());
        } else {
            //error

        }

        return this._nodeFactory(NodeType.IfStatement, children);

    }

    private expressionStatement(this._tokens: TokenIterator) {

        let children: (T | Token)[] = [this.expression(this._tokens)];
        let t = this._tokens.current;

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ExpressionStatement, children);

    }

    private _returnType() {

        let n = this._start(NodeType.ReturnType);
        this._tokens.next();
        n.children.push(this._typeExpression());
        return this._end(n);

    }

    private _typeExpression() {

        let n = this._start(NodeType.TypeExpression);

        if (this._tokens.consume('?')) {
            n.value.flag = Flag.Nullable;
        }

        switch (this._tokens.peek().type) {
            case TokenType.T_CALLABLE:
            case TokenType.T_ARRAY:
                n.children.push(this._nodeFactory(this._tokens.next().text));
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

        return this._end(n);

    }

    private _classConstantDeclarationStatement(modifiers: T = null) {
        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        if (modifiers) {
            children.push(modifiers);
        }

        children.push(t);
        t = this._tokens.next();

        while (true) {
            children.push(this._classConstantDeclaration());
            t = this._tokens.current;

            if (t.type === ',') {
                children.push(t);
                t = this._tokens.next();
            } else if (t.type === ';') {
                children.push(t);
                this._tokens.next();
                break;
            } else {
                //error
                break;
            }
        }

        return this._nodeFactory(NodeType.ClassConstantDeclarationStatement, children);
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
        let t = this._tokens.current;
        let children: (T | Token)[] = [];
        let doc = this._tokens.lastDocComment;

        if (t.type !== TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type !== '=') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        children.push(this._expression());
        return this._nodeFactory(NodeType.ClassConstantDeclaration, children, doc);

    }

    private _propertyDeclarationStatement(modifiersOrVar: T | Token) {
        let t = this._tokens.current;
        let children: (T | Token)[] = [modifiersOrVar];

        while (true) {

            children.push(this._propertyDeclaration());
            t = this._tokens.current;

            if (t.type === ',') {
                children.push(t);
                t = this._tokens.next();
            } else if (t.type === ';') {
                children.push(t);
                this._tokens.next();
                break;
            } else {
                //error
                break;
            }

        }

        return this._nodeFactory(NodeType.PropertyDeclarationStatement, children);

    }

    private _propertyDeclaration() {
        let t = this._tokens.current;
        let children: (T | Token)[] = [];
        let doc = this._tokens.lastDocComment;

        if (t.type !== TokenType.T_VARIABLE) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type !== '=') {
            return this._nodeFactory(NodeType.PropertyDeclaration, children, doc);
        }

        children.push(t);
        t = this._tokens.next();

        children.push(this._expression());
        return this._nodeFactory(NodeType.PropertyDeclaration, children, doc);

    }

    private _memberModifierList() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [t];

        while (true) {
            t = this._tokens.next();
            if (t.type === TokenType.T_PUBLIC ||
                t.type === TokenType.T_PROTECTED ||
                t.type === TokenType.T_PRIVATE ||
                t.type === TokenType.T_STATIC ||
                t.type === TokenType.T_ABSTRACT ||
                t.type === TokenType.T_FINAL) {
                children.push(t);
            } else {
                break;
            }
        }

        return this._nodeFactory(NodeType.MemberModifierList, children);

    }

    private _extendsClass() {

        let n = this._start(NodeType.ClassExtends);
        this._tokens.next();
        n.children.push(this._name());
        return this._end(n);

    }

    private _implements() {

        let n = this._start(NodeType.Implements);
        this._tokens.next();
        n.children.push(this._nameList());
        return this._end(n);

    }

    private _nameList() {

        let n = this._start(NodeType.NameList);

        while (true) {
            n.children.push(this._name());

            if (!this._tokens.consume(',')) {
                break;
            }
        }

        return this._end(n);

    }

    private _newExpression() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [t];
        t = this._tokens.next();

        if (t.type === TokenType.T_CLASS) {
            children.push(this._anonymousClassDeclaration());
            return this._nodeFactory(NodeType.New, children);
        }

        children.push(this._newVariable());
        t = this._tokens.current;

        if (t.type === '(') {
            children.push(this._argumentList());
        }

        return this._nodeFactory(NodeType.New, children);

    }

    private _newVariable() {

        let part = this._newVariablePart();
        let t: Token;
        let propName: T | Token;

        while (true) {

            t = this._tokens.current;

            switch (t.type) {
                case '[':
                case '{':
                    part = this._dimension(part);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
                    this._tokens.next();
                    part = this._nodeFactory(NodeType.Property, [part, t, this._propertyName()]);
                    continue;
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    this._tokens.next();
                    part = this._nodeFactory(NodeType.StaticProperty, [part, t, this._simpleVariable()]);
                    continue;
                default:
                    break;
            }

            break;

        }

        return part;

    }

    private _newVariablePart(): T | Token {

        let t = this._tokens.current;

        switch (t.type) {
            case TokenType.T_STATIC:
                this._tokens.next();
                return t;
            case TokenType.T_VARIABLE:
            case '$':
                return this._simpleVariable();
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                return this._name();
            default:
                //error
                break;
        }

    }

    private _cloneExpression() {

        let n = this._start(NodeType.Clone);
        this._tokens.next();
        n.children.push(this._expression());
        return this._end(n);

    }

    private _listExpression() {

        let n = this._start(NodeType.ArrayPairList);
        let t = this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._end(n);
        }

        this._followOnStack.push([')']);
        Array.prototype.push.apply(n.children, this._arrayPairList(n, ')'));
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [')']));
        }

        return this._end(n);

    }

    private _unaryExpression() {

        let n = this._start();
        let t = this._tokens.next();
        n.value.type = this._unaryOpToNodeType(t);
        if (n.value.type === NodeType.UnaryPreDec ||
            n.value.type === NodeType.UnaryPreInc ||
            n.value.type === NodeType.UnaryReference) {
            n.children.push(this._variable());
        } else {
            n.children.push(this._expression(this._opPrecedenceMap[t.text][0]))
        }
        return this._end(n);

    }

    private _closure() {

        let n = this._start(NodeType.Closure);
        if (this._tokens.consume(TokenType.T_STATIC)) {
            n.value.flag = Flag.ModifierStatic;
        }

        //should be T_FUNCTION
        if (!this._tokens.consume(TokenType.T_FUNCTION)) {
            throw new Error(`Unexpected token ${this._tokens.peek().type}`);
        }

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

        n.children.push(this._curlyInnerStatementList());
        return this._end(n);

    }

    private _closureUse() {

        let n = this._start(NodeType.ClosureUse);
        let t: Token;
        this._tokens.next();

        if (!this._tokens.consume('(')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._end(n);
        }

        let followOn: (TokenType | string)[] = [',', ')'];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._closureUseVariable());
            this._followOnStack.pop();
            t = this._tokens.current;

            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ')') {
                this._tokens.next();
                break;
            } else {
                //error
                n.value.errors.push(this._error(t, [',', ')']));
                break;
            }

        }

        return this._end(n);

    }

    private _closureUseVariable() {

        let n = this._start(NodeType.ClosureUseVariable);

        if (this._tokens.consume('&')) {
            n.value.flag = Flag.PassByRef;
        }

        if (this._tokens.consume(TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current.text));
        } else {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_VARIABLE]));
        }

        return this._end(n);

    }

    private _parameterList() {

        let n = this._start(NodeType.ParameterList);
        let t: Token;

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._end(n);
        }

        if (this._tokens.consume(')')) {
            return this._end(n);
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
                n.value.errors.push(this._error(t, [',', ')']));
                break;
            }
        }

        return this._end(n);

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

        let n = this._start(NodeType.Parameter);

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
            n.children.push(this._nodeFactory(this._tokens.current.text));
        } else {
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_VARIABLE]));
            return this._end(n);
        }

        if (this._tokens.consume('=')) {
            n.children.push(this._expression());
        }

        return this._end(n);

    }

    private _variable() {

        this._variableAtomType = 0;
        let variableAtom = this._variableAtom();
        let startPos = this._startPos();

        while (true) {

            switch (this._tokens.peek().type) {
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    variableAtom = this._staticMember(variableAtom);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
                    variableAtom = this._instanceMember(variableAtom);
                    continue;
                case '[':
                case '{':
                    variableAtom = this._dimension(variableAtom);
                    continue;
                case '(':
                    variableAtom = this._nodeFactory(NodeType.Call, [variableAtom, this._argumentList()]);
                    continue;
                default:
                    if (this._variableAtomType !== NodeType.Variable) {
                        //error

                    }
                    break;
            }

            break;
        }

        return variableAtom;
    }

    private _staticMember(lhs: T | Token) {

        let children: (T | Token)[] = [lhs, this._tokens.current];
        let t = this._tokens.next();
        let nodeType = NodeType.StaticMethodCall;

        switch (t.type) {
            case '{':
                children.push(this._parenthesisedExpression());
                break;
            case '$':
            case TokenType.T_VARIABLE:
                children.push(this._simpleVariable());
                nodeType = NodeType.StaticProperty;
                break;
            case TokenType.T_STRING:
                children.push(t);
                this._tokens.next();
                nodeType = NodeType.ClassConstant;
                break;
            default:
                if (this._isSemiReservedToken(t)) {
                    children.push(t);
                    this._tokens.next();
                    nodeType = NodeType.ClassConstant;
                } else {
                    //error
                }
                break;
        }

        t = this._tokens.current;

        if (t.type === '(') {
            children.push(this._argumentList());
            return this._nodeFactory(NodeType.StaticMethodCall, children);
        } else if (nodeType !== NodeType.StaticMethodCall) {
            return this._nodeFactory(nodeType, children);
        } else {
            //error
        }

    }

    private _instanceMember(lhs: T | Token) {

        let children: (T | Token)[] = [lhs, this._tokens.current];
        let t = this._tokens.next();
        children.push(this._propertyName());
        t = this._tokens.current;

        if (t.type === '(') {
            children.push(this._argumentList());
            return this._nodeFactory(NodeType.MethodCall, children);
        }

        return this._nodeFactory(NodeType.Property, children);

    }

    private _propertyName(): T | Token {

        let t = this._tokens.current;

        switch (t.type) {
            case TokenType.T_STRING:
                this._tokens.next();
                return t;
            case '{':
                return this._parenthesisedExpression();
            case '$':
            case TokenType.T_VARIABLE:
                return this._simpleVariable();
            default:
                //error
                break;
        }

    }

    private _dimension(lhs: T | Token) {
        let t = this._tokens.current;
        let close = t.type === '[' ? ']' : '}';
        let children: (T | Token)[] = [lhs, t];

        t = this._tokens.next();
        if (this._isExpressionStartToken(t)) {
            children.push(this._expression());
            t = this._tokens.current;
        }

        if (t.type !== close) {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.Dimension, children);

    }

    private _argumentList() {

        let children: (T | Token)[] = [];
        let t = this._tokens.current;

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (this._isArgumentStartToken(t)) {

            while (true) {

                children.push(this._argument());
                t = this._tokens.current;

                if (t.type === ')') {
                    break;
                } else if (t.type === ',') {
                    children.push(t);
                    t = this._tokens.next();
                } else {
                    //error
                    break;
                }

            }

        }

        if (t.type !== ')') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ArgumentList, children);

    }

    private _isArgumentStartToken(t: Token) {
        return t.type === TokenType.T_ELLIPSIS || this._isExpressionStartToken(t);
    }

    private _argument() {

        let t = this._tokens.current;
        if (t.type === TokenType.T_ELLIPSIS) {
            this._tokens.next();
            return this._nodeFactory(NodeType.UnaryExpression, [t, this._expression()]);
        } else if (this._isExpressionStartToken(t)) {
            return this._expression();
        } else {
            //error
        }

    }

    private _name() {

        let n = this._start(NodeType.Name);

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
        return this._end(n);

    }

    private _shortArray() {

        let n = this._start(NodeType.ArrayPairList);
        let t = this._tokens.next();

        if (this._tokens.consume(']')) {
            return this._end(n);
        }

        this._followOnStack.push([']']);
        Array.prototype.push.apply(n.children, this._arrayPairList(n, ')'));
        this._followOnStack.pop();

        if (!this._tokens.consume(']')) {
            n.value.errors.push(this._error(this._tokens.peek(), [']']));
        }

        return this._end(n);

    }

    private _longArray() {

        let n = this._start(NodeType.ArrayPairList);
        this._tokens.next();

        if (!this._tokens.consume('(')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['(']));
            return this._end(n);
        }

        if (this._tokens.consume(')')) {
            return this._end(n);
        }

        this._followOnStack.push([')']);
        Array.prototype.push.apply(n.children, this._arrayPairList(n, ')'));
        this._followOnStack.pop();

        if (!this._tokens.consume(')')) {
            n.value.errors.push(this._error(this._tokens.peek(), [')']));
        }

        return this._end(n);

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

        let n = this._start(NodeType.ArrayPair);
        let t = this._tokens.peek();

        if (t.type === '&') {
            n.children.push(this._nodeFactory(null), this._unaryExpression());
            return this._end(n);
        }

        this._followOnStack.push([TokenType.T_DOUBLE_ARROW]);
        let expr = this._expression();
        this._followOnStack.pop();

        if (this._tokens.peek().type !== TokenType.T_DOUBLE_ARROW) {
            n.children.push(this._nodeFactory(null), expr);
            return this._end(n);
        }

        this._tokens.next();

        if (this._tokens.peek().type === '&') {
            n.children.push(this._nodeFactory(null), this._unaryExpression());
            return this._end(n);
        }

        n.children.push(this._expression());
        return this._end(n);

    }


    private _variableAtom(): T | Token {

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
                return this._nodeFactory(this._tokens.next().text);
            case TokenType.T_STATIC:
                this._variableAtomType = NodeType.Name;
                n = this._start(NodeType.Name);
                n.children.push(this._nodeFactory(this._tokens.next().text));
                return this._end(n);
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                this._variableAtomType = NodeType.Name;
                return this._name();
            default:
                //error
                n = this._start(0);
                n.value.errors.push(this._error(this._tokens.peek(),
                    [TokenType.T_VARIABLE, '$', '(', '[', TokenType.T_ARRAY, TokenType.T_CONSTANT_ENCAPSED_STRING,
                    TokenType.T_STATIC, TokenType.T_STRING, TokenType.T_NAMESPACE, TokenType.T_NS_SEPARATOR],
                    [], [NodeType.Variable, NodeType.ParenthesisedExpression, NodeType.ArrayDeclaration, NodeType.Name]));
                break;
        }

    }

    private _simpleVariable() {

        let n = this._start(NodeType.Variable);
        let t = this._tokens.peek();

        if (t.type === TokenType.T_VARIABLE) {
            n.children.push(this._nodeFactory(this._tokens.next().text));
        } else if (t.type === '$') {
            this._tokens.next();
            t = this._tokens.peek();
            if (t.type === '{') {
                this._tokens.next();
                this._followOnStack.push(['}']);
                n.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume('}')) {
                    //error
                    n.value.errors.push(this._error(this._tokens.peek(), ['}']));
                }
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

        return this._end(n);

    }

    private _parenthesisedExpression() {

        let n = this._start(NodeType.ParenthesisedExpression);
        let t = this._tokens.next();
        let close: TokenType | string;

        switch (t.type) {
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
                throw new Error(`Unexpected token ${t.type}`);
        }

        this._followOnStack.push([close]);
        n.children.push(this._expression());
        this._followOnStack.pop();

        if (!this._tokens.consume(close)) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [close]));
        }

        return this._end(n);
    }

    private _isBinaryOpToken(t: Token) {
        return this._opPrecedenceMap.hasOwnProperty(t.text) && (this._opPrecedenceMap[t.text][2] & OpType.Binary) === OpType.Binary;
    }

    private _haltCompilerStatement() {

        let n = this._start(NodeType.HaltCompilerStatement);
        this._tokens.next();
        let expected: (TokenType | string)[] = ['(', ')', ';'];
        let t: Token;

        for (let k = 0; k < expected.length; ++k) {
            if (!this._tokens.consume(expected[k])) {
                n.value.errors.push(this._error(this._tokens.peek(), [expected[k]]));
                break;
            }
        }

        return this._end(n);

    }

    private _useStatement() {

        let n = this._start(NodeType.UseStatement);
        this._tokens.next();

        if (this._tokens.consume(TokenType.T_FUNCTION)) {
            n.value.flag = Flag.UseFunction;
        } else if (this._tokens.consume(TokenType.T_CONST)) {
            n.value.flag = Flag.UseConstant;
        }

        let useElementList = this._start(NodeType.UseList);
        let useElement = this._start(NodeType.UseElement);
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
            n.children.push(this._end(useElementList));
        }

        if (!this._tokens.consume(';')) {
            n.value.errors.push(this._error(this._tokens.peek(), [';']));
        }

        return this._end(n);
    }

    private _useGroup(tempNode: TempNode<T>) {

        let n = tempNode;

        if (!this._tokens.consume('{')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['{']));
            return this._end(n);
        }

        this._followOnStack.push(['}']);
        n.children.push(this._useList(this._start(NodeType.UseList), !n.value.flag, false, '}'));
        this._followOnStack.pop();

        if (!this._tokens.consume('}')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['}']));
        }

        return this._end(n);
    }

    private _useList(tempNode: TempNode<T>, isMixed: boolean, lookForPrefix: boolean, breakOn: TokenType | string) {

        let t: Token;
        let n = tempNode;
        let followOn: (TokenType | string)[] = [',', breakOn];

        while (true) {

            this._followOnStack.push(followOn);
            n.children.push(this._useElement(this._start(NodeType.UseElement), isMixed, lookForPrefix));
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

        return this._end(n);

    }

    private _useElement(tempNode: TempNode<T>, isMixed: boolean, lookForPrefix: boolean) {

        let n = tempNode;
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
            return this._end(n);
        }

        if (this._tokens.consume(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current.text));
        } else {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_STRING]));
        }

        return this._end(n);
    }

    private _namespaceStatement() {

        let n = this._start(NodeType.NamespaceStatement);
        this._tokens.next();
        this._tokens.lastDocComment;

        if (this._tokens.consume(TokenType.T_STRING)) {

            this._followOnStack.push([';', '{']);
            n.children.push(this._namespaceName());
            this._followOnStack.pop();

            if (this._tokens.consume(';')) {
                return this._end(n);
            }

        }

        if (!this._tokens.consume('{')) {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), ['{']));
            return this._end(n);
        }

        n.children.push(this._topStatementList(true));

        if (!this._tokens.consume('}')) {
            n.value.errors.push(this._error(this._tokens.peek(), ['}']));
        }

        return this._end(n);

    }

    private _namespaceName() {

        let n = this._start(NodeType.NamespaceName);
        let text: string;

        if (this._tokens.peek().type === TokenType.T_STRING) {
            text = this._tokens.next().text;
        } else {
            //error
            n.value.errors.push(this._error(this._tokens.peek(), [TokenType.T_STRING]));
            return this._end(n);
        }

        while (true) {

            if (this._tokens.peek().type === TokenType.T_NS_SEPARATOR &&
                this._tokens.peek(1).type === TokenType.T_STRING) {
                text += this._tokens.next().text
                text += this._tokens.next().text;
            } else {
                break;
            }

        }

        n.children.push(this._nodeFactory(text));
        return this._end(n);

    }

    private _error(unexpected: Token, expected: (TokenType | string)[], followOn?: (TokenType | string)[], elementTypes?: NodeType[]) {

        let n = this._followOnStack.length;
        let syncTokens = followOn ? followOn.slice(0) : [];

        while (n--) {
            Array.prototype.push.apply(syncTokens, this._followOnStack[n]);
        }

        this._tokens.skip(syncTokens);
        return new ParseError(unexpected, expected, elementTypes);
    }


}

