/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenType, Iterator, Position, Range } from './lexer';
import { ParseError, ErrorRecovery } from './parseError';
import { TokenIterator } from './tokenIterator';

export enum NodeType {
    None = 0,
    TopStatementList,
    NamespaceStatement,
    NamespaceName,
    UseElement,
    UseStatement,
    UseGroupStatement,
    UseList,
    HaltCompilerStatement,
    ConstantDeclarationStatement,
    ConstantDeclarationList,
    ConstantDeclaration,
    DynamicVariable,
    ArrayDeclaration,
    UnaryExpression,
    ArrayPair,
    Name,
    ParenthesisedExpression,
    Call,
    ArgumentList,
    Dimension,
    ClassConstant,
    StaticProperty,
    StaticMethodCall,
    MethodCall,
    Property,
    Closure,
    ParameterList,
    Parameter,
    IssetList,
    Isset,
    Empty,
    Eval,
    Include,
    YieldFrom,
    Yield,
    Print,
    Backticks,
    ComplexVariable,
    EncapsulatedVariableList,
    AnonymousClassDeclaration,
    New,
    ClassExtends,
    Implements,
    InterfaceExtends,
    NameList,
    ClassStatementList,
    MemberModifierList,
    PropertyDeclaration,
    PropertyDeclarationStatement,
    ClassConstantDeclaration,
    ClassConstantDeclarationStatement,
    ReturnType,
    TypeExpression,
    CurlyInnerStatementList,
    InnerStatementList,
    ExpressionStatement,
    FunctionDeclaration,
    MethodDeclaration,
    UseTraitStatement,
    TraitAdaptationList,
    TraitAdaptation,
    MethodReference,
    TraitPrecendence,
    TraitAlias,
    ClassModifiers,
    ClassDeclaration,
    TraitDeclarationStatement,
    InterfaceDeclarationStatement,
    BinaryExpression,
    EncapsulatedVariable,
    Variable,
    ArrayElementList,
    ClosureUseVariable,
    ClosureUse,
    ListExpression,
    Clone,
    Heredoc,
    DoubleQuotes,
    TopStatement,
    Statement,
    IfStatementList,
    IfStatement,
    WhileStatement,
    DoWhileStatement,
    ExpressionList,
    ForStatement,
    BreakStatement,
    ContinueStatement,
    ReturnStatement,
    GlobalVariableDeclarationStatement,
    StaticVariableListStatement,
    StaticVariableDeclaration,
    EchoStatement,
    UnsetStatement,
    ThrowStatement,
    GotoStatement,
    LabelStatement,
    ForeachStatement,
    CaseStatementList,
    SwitchStatement,
    CaseStatement,
    DeclareStatement,
    TryStatement,
    TryCatchFinallyStatement,
    Catch,
    CatchNameList,
    FinallyStatement,
    TernaryExpression
}

export enum Flag {
    None = 0,
    UseClass,
    UseFunction,
    UseConstant
}

export interface NodeFactory<T> {
    (value: Element | string, children?: T[]): T;
}

interface TokenPredicate {
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

function isExpressionStartToken(t: Token) {

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

export class Parser<T> {

    private _nodeFactory: NodeFactory<T>;
    private _opPrecedenceMap = opPrecedenceMap;
    private _tokens: TokenIterator

    constructor(nodeFactory: NodeFactory<T>) {
        this._nodeFactory = nodeFactory;
    }

    parse(tokens: Token[]) {

        this._tokens = new TokenIterator(tokens);
        return this._topStatementList(false);

    }

    private _start(type: NodeType): TempNode<T> {
        let t = this._tokens.peek();

        if (t.type === TokenType.T_EOF) {
            t = this._tokens.current;
        }

        return {
            value: {
                type: type,
                flag: 0,
                doc: null,
                range: {
                    start: t.range.start,
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

    private _topStatementStartTokenTypes(): (TokenType | string)[] {

    }

    private _topStatementList(isCurly: boolean) {

        let n = this._start(NodeType.TopStatementList);
        let t = this._tokens.peek();
        let breakOn = isCurly ? '}' : TokenType.T_EOF;

        let followOn: TokenPredicate = (x) => {
            //; is valid (empty) statement but don't include in error recovery to avoid stopping at end of 
            //a child statement with error
            return (x.type !== ';' && isTopStatementStartToken(x)) || x.type === breakOn;
        };

        while (true) {

            if (isTopStatementStartToken(t)) {
                n.children.push(this._topStatement(followOn));
                t = this._tokens.peek();
            } else if (t.type === breakOn) {
                break;
            } else {
                //error
                let expected = this._topStatementStartTokenTypes();
                expected.push(breakOn);
                n.value.errors.push(new ParseError(t, expected));
                if (this._tokens.skip(followOn).type === TokenType.T_EOF) {
                    break;
                }
            }

        }

        return this._end(n);

    }

    private _topStatement(followOn: TokenPredicate) {

        let t = this._tokens.peek();

        switch (t.type) {
            case TokenType.T_NAMESPACE:
                return this._namespaceStatement(followOn);
            case TokenType.T_USE:
                return this._useStatement(followOn);
            case TokenType.T_HALT_COMPILER:
                return this._haltCompilerStatement(followOn);
            case TokenType.T_CONST:
                return this._constantDeclarationStatement(followOn);
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

    private _constantDeclarationStatement(followOn: TokenPredicate) {

        let n = this._start(NodeType.ConstantDeclarationStatement);
        this._tokens.next();
        let childFollowOn: TokenPredicate = (x) => {
            return x.type === ',' || x.type === ';' || followOn(x);
        }
        let t: Token;

        while (true) {

            n.children.push(this._constantDeclaration(childFollowOn));
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === ';') {
                this._tokens.next();
                break;
            } else {
                n.value.errors.push(new ParseError(t, [',', ';']));
                this._tokens.skip(followOn);
                break;
            }
        }

        return this._end(n);

    }

    private _constantDeclarationList() {

        let children: (T | Token)[] = [];

        while (true) {

            children.push(this._constantDeclaration());
            if (this._tokens.current.type !== ',') {
                break;
            }
            children.push(this._tokens.current);
            this._tokens.next();
        }

        return this._nodeFactory(NodeType.ConstantDeclarationList, children);

    }

    private _constantDeclaration(followOn: TokenPredicate) {

        let n = this._tempNode(NodeType.ConstantDeclaration);
        let expected: (TokenType | string)[] = [TokenType.T_STRING, '='];
        let t: Token;

        for (let k = 0; k < expected.length; ++k) {
            t = this._tokens.expect(expected[k]);
            if (t) {
                n.children.push(t);
            } else {
                //error
                n.errors.push(new ParseError(t, [expected[k]]));
                n.doc = this._tokens.lastDocComment;
                this._tokens.skip(followOn);
                return this._createNode(n);
            }
        }

        n.doc = this._tokens.lastDocComment;
        n.children.push(this._expression(followOn));
        return this._createNode(n);

    }

    private _expression(followOn: TokenPredicate, minPrecedence = 0, lookForVariable = false) {

        let restrictOperators: (TokenType | string)[];
        let lhs: T | Token;
        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let rhs: T | Token;

        if (lookForVariable) {
            lhs = this._variable();
            restrictOperators = this._variableOnlyOperators();
        } else {
            restrictOperators = [];
            lhs = this._atom(restrictOperators);
        }

        while (true) {

            op = this._tokens.current;

            if (!this._isBinaryOpToken(op)) {
                break;
            }

            if (restrictOperators.length && restrictOperators.indexOf(op.type) === -1) {
                //error
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
                lhs = this._ternaryExpression(lhs, op, precedence);
            } else {
                rhs = this._expression(precedence);
                lhs = this._nodeFactory(NodeType.BinaryExpression, [lhs, op, rhs]);
            }

        }

        return lhs;


    }

    private _ternaryExpression(lhs: T | Token, op: Token, precedence: number) {

        let children: (T | Token)[] = [lhs, op];
        children.push(this._expression(precedence));
        op = this._tokens.current;

        if (op.type !== ':') {
            //error
        }

        children.push(op);
        this._tokens.next();
        children.push(this._expression(precedence));
        return this._nodeFactory(NodeType.TernaryExpression, children);

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

    private _atom(restrictOperators: (TokenType | string)[]) {

        let t = this._tokens.current;

        switch (t.type) {
            case TokenType.T_STATIC:
                if (this._tokens.peek().type === TokenType.T_FUNCTION) {
                    return this._closure();
                } else {
                    //fall through
                }
            case TokenType.T_VARIABLE:
            case '$':
            case TokenType.T_ARRAY:
            case '[':
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_NS_SEPARATOR:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case '(':
                let variable = this._variable();
                t = this._tokens.current;
                if (t.type === TokenType.T_INC || t.type === TokenType.T_DEC) {
                    this._tokens.next();
                    return this._nodeFactory(NodeType.UnaryExpression, [variable, t]);
                } else {
                    restrictOperators.push(...this._variableOnlyOperators());
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
                restrictOperators.push('=');
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

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        while (true) {

            children.push(this._expression());
            t = this._tokens.current;

            if (this._tokens.current.type === ',') {
                children.push(t);
                this._tokens.next();
            } else if (t.type === ')') {
                children.push(t);
                this._tokens.next();
                break;
            } else {
                //error
                break;
            }


        }

        return this._nodeFactory(NodeType.Isset, children);

    }

    private _keywordParenthesisedExpression(type: NodeType) {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

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
        this._tokens.next();
        return this._nodeFactory(type, children);

    }

    private _keywordExpression(nodeType: NodeType) {

        let children: (T | Token)[] = [this._tokens.current];
        this._tokens.next();
        children.push(this._expression());
        return this._nodeFactory(nodeType, children);
    }



    private _yield() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (!this._isExpressionStartToken(t)) {
            return this._nodeFactory(NodeType.Yield, children);
        }

        children.push(this._expression());
        t = this._tokens.current;

        if (t.type !== TokenType.T_DOUBLE_ARROW) {
            return this._nodeFactory(NodeType.Yield, children);
        }

        children.push(t);
        this._tokens.next();
        children.push(this._expression());
        return this._nodeFactory(NodeType.Yield, children);

    }

    private _quotedEncapsulatedVariableList(type: NodeType, closeTokenType: Token | string) {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();
        children.push(this._encapsulatedVariableList());
        t = this._tokens.current;

        if (t.type !== closeTokenType) {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(type, children);

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

        let children: (T | Token)[] = [this._tokens.current];
        let doc = this._tokens.lastDocComment;
        let t = this._tokens.next();

        if (t.type === '(') {
            children.push(this._argumentList());
            t = this._tokens.current;
        }

        if (t.type === TokenType.T_EXTENDS) {
            children.push(this._extendsClass());
            t = this._tokens.current;
        }

        if (t.type === TokenType.T_IMPLEMENTS) {
            children.push(this._implements());
            t = this._tokens.current;
        }

        children.push(this._classStatementList());
        return this._nodeFactory(NodeType.AnonymousClassDeclaration, children, doc);

    }

    private _classStatementList() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        if (t.type !== '{') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        while (true) {

            if (t.type === '}') {
                children.push(t);
                this._tokens.next();
                break;
            } else if (this._isClassStatementStartToken(t)) {
                children.push(this._classStatement());
                t = this._tokens.current;
            } else {
                //error
                break;
            }

        }

        return this._nodeFactory(NodeType.ClassStatementList, children);

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

        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        if (t.type !== '{') {
            //error
        }

        children.push(t);
        children.push(this._innerStatementList());
        t = this._tokens.current;

        if (t.type !== '}') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.CurlyInnerStatementList, children);

    }

    private _innerStatementList() {

        let children: (T | Token)[] = [];

        while (true) {
            if (!this._isInnerStatementStartToken(this._tokens.current)) {
                break;
            }
            children.push(this._innerStatement());
        }

        return this._nodeFactory(NodeType.InnerStatementList, children);
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

    private _functionDeclarationStatement(followOn: TokenPredicate) {

        let n = this._tempNode(NodeType.FunctionDeclaration, [this._tokens.next(), this._tokens.lastDocComment]);

        if (this._tokens.peek().type === '&') {
            n.children.push(this._tokens.next());
        }

        if (this._tokens.expect(TokenType.T_STRING)) {
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

        let children: (T | Token)[] = [this._tokens.current];
        this._tokens.next();
        children.push(this._typeExpression());
        return this._nodeFactory(NodeType.ReturnType, children);

    }

    private _typeExpression() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        if (t.type === '?') {
            children.push(t);
            t = this._tokens.next();
        }

        switch (t.type) {
            case TokenType.T_CALLABLE:
            case TokenType.T_ARRAY:
                children.push(t);
                this._tokens.next();
                break;
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                children.push(this._name());
                break;
            default:
                //error
                break;
        }

        return this._nodeFactory(NodeType.TypeExpression, children);

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

        let t = this._tokens.current;
        this._tokens.next();
        return this._nodeFactory(NodeType.ClassExtends, [t, this._name()]);

    }

    private _implements() {

        let t = this._tokens.current;
        this._tokens.next();
        return this._nodeFactory(NodeType.Implements, [t, this._nameList()]);

    }

    private _nameList() {

        let children: (T | Token)[] = [];
        let t: Token;

        while (true) {
            children.push(this._name());
            t = this._tokens.current;
            if (t.type !== ',') {
                break;
            }
            children.push(t);
            this._tokens.next();
        }

        return this._nodeFactory(NodeType.NameList, children);

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

        let children: (T | Token)[] = [this._tokens.current];
        this._tokens.next();
        children.push(this._expression());
        return this._nodeFactory(NodeType.Clone, children);

    }

    private _listExpression() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = this._tokens.next();
        children.push(this._arrayElementList(')'));
        t = this._tokens.current;

        if (t.type !== ')') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ListExpression, children);

    }

    private _unaryExpression() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [t];
        let lookForVariable = t.type === TokenType.T_INC || t.type === TokenType.T_DEC || t.type === '&';
        this._tokens.next();
        children.push(this._expression(this._opPrecedenceMap[t.text][0], lookForVariable));
        return this._nodeFactory(NodeType.UnaryExpression, children);

    }

    private _closure() {

        let children: (T | Token)[] = [];
        let doc = this._tokens.lastDocComment;
        let t = this._tokens.current;

        if (t.type === TokenType.T_STATIC) {
            children.push(t);
            t = this._tokens.next();
        }

        //should be T_FUNCTION
        children.push(t);
        t = this._tokens.next();

        if (t.type === '&') {
            children.push(t);
            t = this._tokens.next();
        }

        children.push(this._parameterList());
        t = this._tokens.current;

        if (t.type === TokenType.T_USE) {
            children.push(this._closureUse());
            t = this._tokens.current;
        }

        if (t.type === ':') {
            children.push(this._returnType());
            t = this._tokens.current;
        }

        children.push(this._curlyInnerStatementList());
        return this._nodeFactory(NodeType.Closure, children);

    }

    private _closureUse() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        while (true) {

            children.push(this._closureUseVariable());
            t = this._tokens.current;

            if (t.type === ',') {
                children.push(t);
                t = this._tokens.next();
            } else if (t.type === ')') {
                children.push(t);
                this._tokens.next();
            } else {
                //error
                break;
            }

        }

        return this._nodeFactory(NodeType.ClosureUse, children);

    }

    private _closureUseVariable() {

        let children: (T | Token)[] = [];
        let t = this._tokens.current;

        if (t.type === '&') {
            children.push(t);
            t = this._tokens.next();
        }

        if (t.type !== TokenType.T_VARIABLE) {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ClosureUseVariable, children);

    }

    private _parameterList() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        if (t.type !== '(') {
            //error
        }
        children.push(t);
        t = this._tokens.next();

        if (t.type !== ')') {

            while (true) {

                children.push(this._parameter());
                t = this._tokens.current;

                if (t.type !== ',') {
                    break;
                }
                children.push(t);
                t = this._tokens.next();
            }

            if (t.type !== ')') {
                //error
            }

        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ParameterList, children);

    }

    private _parameter() {

        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        if (t.type === TokenType.T_NS_SEPARATOR ||
            t.type === TokenType.T_STRING ||
            t.type === TokenType.T_NAMESPACE) {
            children.push(this._name());
        } else if (t.type === TokenType.T_ARRAY || t.type === TokenType.T_CALLABLE) {
            children.push(t);
            this._tokens.next();
        }

        t = this._tokens.current;

        if (t.type === '&' || t.type === TokenType.T_ELLIPSIS) {
            children.push(t);
            t = this._tokens.next();
        }

        if (t.type !== TokenType.T_VARIABLE) {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (t.type === '=') {
            children.push(t);
            this._tokens.next();
            children.push(this._expression());

        }

        return this._nodeFactory(NodeType.Parameter, children);

    }

    private _variable() {

        let variableAtom = this._variableAtom();
        let t = this._tokens.current;

        while (true) {

            switch (t.type) {
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

        let t = this._tokens.current;
        let children: (T | Token)[] = [];

        if (t.type === TokenType.T_NS_SEPARATOR) {
            children.push(t);
            t = this._tokens.next();
        } else if (t.type === TokenType.T_NAMESPACE) {
            children.push(t);
            t = this._tokens.next();
            if (t.type === TokenType.T_NS_SEPARATOR) {
                children.push(t);
                t = this._tokens.next();
            } else {
                //error
            }
        }

        children.push(this._namespaceName());

        return this._nodeFactory(NodeType.Name, children);

    }

    private _shortArray() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (this._isArrayElementStartToken(t)) {
            children.push(this._arrayElementList(']'));
            t = this._tokens.current;
        }

        if (t.type !== ']') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ArrayDeclaration, children);

    }

    private _longArray() {

        let children: (T | Token)[] = [this._tokens.current];
        let t = this._tokens.next();

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = this._tokens.next();

        if (this._isArrayElementStartToken(t)) {
            children.push(this._arrayElementList(')'));
            t = this._tokens.current;
        }

        if (t.type !== ')') {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ArrayDeclaration, children);

    }

    private _isArrayElementStartToken(t: Token) {
        return t.type === '&' || this._isExpressionStartToken(t);
    }

    private _arrayElementList(closeTokenType: string) {

        let children: (T | Token)[] = [];
        let t = this._tokens.current;

        while (true) {

            children.push(this._arrayElement());
            if (t.type === ',') {
                children.push(this._tokens.current);
                t = this._tokens.next();
                if (t.type === closeTokenType) {
                    break;
                }
            } else if (t.type === closeTokenType) {
                break;
            } else {
                //error
                break;
            }

        }

        return this._nodeFactory(NodeType.ArrayElementList, children);

    }

    private _arrayElement() {

        let t = this._tokens.current;

        if (t.type === '&') {
            this._tokens.next();
            return this._nodeFactory(NodeType.UnaryExpression, [t, this.variable(this._tokens)]);
        }

        let expr = this._expression(this._tokens);
        t = this._tokens.current;

        if (t.type !== TokenType.T_DOUBLE_ARROW) {
            return expr;
        }

        let children: (T | Token)[] = [expr, t];
        t = this._tokens.next();

        if (t.type === '&') {
            this._tokens.next();
            children.push(this._nodeFactory(NodeType.UnaryExpression, [t, this.variable(this._tokens)]));
            return this._nodeFactory(NodeType.ArrayPair, children);
        }

        children.push(this._expression(this._tokens));
        return this._nodeFactory(NodeType.ArrayPair, children);

    }


    private _variableAtom(): T | Token {
        let t = this._tokens.current;

        switch (t.type) {
            case TokenType.T_VARIABLE:
            case '$':
                return this._simpleVariable();
            case '(':
                return this._parenthesisedExpression();
            case TokenType.T_ARRAY:
                return this._longArray();
            case '[':
                return this._shortArray();
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_STATIC:
                this._tokens.next();
                return t;
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                return this._name();
            default:
                //error
                break;
        }

    }

    private _simpleVariable() {

        let children: (T | Token)[] = [];
        let t = this._tokens.current;

        if (t.type === TokenType.T_VARIABLE) {
            children.push(this._tokens.current);
            this._tokens.next();
        } else if (t.type === '$') {
            children.push(this._tokens.current);
            t = this._tokens.next();
            if (t.type === '{') {
                children.push(t);
                this._tokens.next();
                children.push(this._expression());
                t = this._tokens.current;
                if (t.type !== '}') {
                    //error
                }
                children.push(t);
                this._tokens.next();
            } else if (t.type === '$' || t.type === TokenType.T_VARIABLE) {
                children.push(this._simpleVariable());
            } else {
                //error
            }
        } else {
            //error
        }

        return this._nodeFactory(NodeType.Variable, children);

    }

    private _parenthesisedExpression() {

        let t = this._tokens.current;
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

        let children: (T | Token)[] = [t];

        this._tokens.next();
        children.push(this._expression());
        t = this._tokens.current;

        if (t.type !== close) {
            //error
        }

        children.push(t);
        this._tokens.next();
        return this._nodeFactory(NodeType.ParenthesisedExpression, children);
    }

    private _isBinaryOpToken(t: Token) {
        return this._opPrecedenceMap.hasOwnProperty(t.text) && (this._opPrecedenceMap[t.text][2] & OpType.Binary) === OpType.Binary;
    }

    private _haltCompilerStatement(followOn: TokenPredicate) {

        let n = this._start(NodeType.HaltCompilerStatement);
        this._tokens.next();
        let expected: (TokenType | string)[] = ['(', ')', ';'];
        let t: Token;

        for (let k = 0; k < expected.length; ++k) {
            if (!this._tokens.expect(expected[k])) {
                n.value.errors.push(new ParseError(this._tokens.peek(), [expected[k]]));
                this._tokens.skip(followOn);
                break;
            }
        }

        return this._end(n);

    }

    private _useStatement(followOn: TokenPredicate) {

        let n = this._start(NodeType.UseStatement);
        this._tokens.next();
        let t = this._tokens.peek();

        if (this._tokens.expect(TokenType.T_FUNCTION)) {
            n.value.flag = Flag.UseFunction;
        } else if (this._tokens.expect(TokenType.T_CONST)) {
            n.value.flag = Flag.UseConstant;
        }

        let useElementList = this._start(NodeType.UseList);
        let useElement = this._start(NodeType.UseElement);
        this._tokens.expect(TokenType.T_NS_SEPARATOR);

        let namespaceName = this._namespaceName((x) => {
            return x.type === TokenType.T_NS_SEPARATOR || x.type === ',' || x.type === ';' || followOn(x);
        });

        if (this._tokens.expect(TokenType.T_NS_SEPARATOR)) {
            n.value.type = NodeType.UseGroupStatement;
            n.children.push(namespaceName);
            return this._useGroup(n, followOn);
        }

        useElement.children.push(namespaceName);
        useElementList.children.push(this._useElement(useElement, false, true, (x) => { return x.type === ',' || x.type === ';' || followOn(x) }));

        if (this._tokens.expect(',')) {
            n.children.push(this._useList(useElementList, false, true, (x) => { return x.type === ';' || followOn(x) }, ';'));
        } else {
            n.children.push(this._end(useElementList));
        }

        if (!this._tokens.expect(';')) {
            n.value.errors.push(new ParseError(this._tokens.peek(), [';']));
            this._tokens.skip(followOn);
        }

        return this._end(n);
    }

    private _useGroup(tempNode: TempNode<T>, followOn: TokenPredicate) {

        let n = tempNode;

        if (!this._tokens.expect('{')) {
            //error
            n.value.errors.push(new ParseError(this._tokens.peek(), ['{']));
            this._tokens.skip(followOn);
            return this._end(n);
        }

        n.children.push(this._useList(this._start(NodeType.UseList), !n.value.flag, false, (x) => { return x.type === '}' || followOn(x) }, '}'));

        if (!this._tokens.expect('}')) {
            n.value.errors.push(new ParseError(this._tokens.peek(), ['}']));
            this._tokens.skip(followOn);
        }

        return this._end(n);
    }

    private _useList(tempNode: TempNode<T>, isMixed: boolean, lookForPrefix: boolean, followOn: TokenPredicate, breakOn: TokenType | string) {

        let t: Token;
        let n = tempNode;
        let childFollowOn: TokenPredicate = (x) => {
            return x.type === ',' || followOn(x); //followOn should contain break token
        };

        while (true) {

            n.children.push(this._useElement(this._start(NodeType.UseElement), isMixed, lookForPrefix, childFollowOn));
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            } else if (t.type === breakOn) {
                break;
            } else {
                //error
                n.value.errors.push(new ParseError(t, [',', breakOn]));
                this._tokens.skip(followOn);
                break;
            }

        }

        return this._end(n);

    }

    private _useElement(tempNode: TempNode<T>, isMixed: boolean, lookForPrefix: boolean, followOn: TokenPredicate) {

        let n = tempNode;
        //if children not empty then it contains tokens to left of T_AS
        if (!n.children.length) {

            if (isMixed) {
                if (this._tokens.expect(TokenType.T_FUNCTION)) {
                    n.value.flag = Flag.UseFunction;
                } else if (this._tokens.expect(TokenType.T_CONST)) {
                    n.value.flag = Flag.UseConstant;
                } else {
                    n.value.flag = Flag.UseClass;
                }
            } else if (lookForPrefix) {
                this._tokens.expect(TokenType.T_NS_SEPARATOR);
            }

            n.children.push(this._namespaceName((x) => { return x.type === TokenType.T_AS || followOn(x) }));
        }

        if (!this._tokens.expect(TokenType.T_AS)) {
            return this._end(n);
        }

        if (this._tokens.expect(TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current.text));
        } else {
            //error
            n.value.errors.push(new ParseError(this._tokens.peek(), [TokenType.T_STRING]));
            this._tokens.skip(followOn);
        }

        return this._end(n);
    }

    private _namespaceStatement(followOn: TokenPredicate) {

        let n = this._start(NodeType.NamespaceStatement);
        this._tokens.next();
        this._tokens.lastDocComment;

        if (this._tokens.expect(TokenType.T_STRING)) {

            n.children.push(this._namespaceName((x) => { return x.type === ';' || x.type === '{' || followOn(x) }));

            if (this._tokens.expect(';')) {
                this._tokens.next();
                return this._end(n);
            } 

        } 
        
        if (!this._tokens.expect('{')) {
            //error
            n.value.errors.push(new ParseError(this._tokens.peek(), ['{']));
            this._tokens.skip(followOn);
            return this._end(n);
        }

        n.children.push(this._topStatementList(true));

        if(!this._tokens.expect('}')){
            n.value.errors.push(new ParseError(this._tokens.peek(), ['}']));
            this._tokens.skip(followOn);
        }

        return this._end(n);

    }

    private _namespaceName(followOn: TokenPredicate) {

        let n = this._start(NodeType.NamespaceName);
        let text: string;

        if (this._tokens.peek().type === TokenType.T_STRING) {
            text = this._tokens.next().text;
        } else {
            //error
            n.value.errors.push(new ParseError(this._tokens.peek(), [TokenType.T_STRING]));
            this._tokens.skip(followOn);
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


}

