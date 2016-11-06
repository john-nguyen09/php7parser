/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, Lexer, TokenIterator, TokenType } from './lexer';

export enum NodeType {
    None = 0,
    TopStatementList,
    Namespace,
    NamespaceName,
    UseElement,
    UseList,
    UseGroup,
    HaltCompiler,
    ConstDeclarationList,
    ConstElement,
    DynamicVariable,
    ArrayDeclaration,
    UnaryOp,
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
    ClosureUse,
    IssetList,
    Isset,
    Empty,
    Eval,
    Include,
    YieldFrom,
    Yield,
    Print,
    BackticksExpression,
    ComplexVariable,
    EncapsulatedVariableList,
    AnonymousClass,
    New,
    ClassExtends,
    Implements,
    InterfaceExtends,
    NameList,
    ClassStatementList,
    MemberModifierList,
    PropertyDeclaration,
    PropertyDeclarationList,
    ClassConstantDeclaration,
    ClassConstantDeclarationList,
    ReturnType,
    TypeExpression,
    ParenthesisedInnerStatementList,
    InnerStatementList,
    ExpressionStatement,
    FunctionDeclaration,
    MethodDeclaration,
    UseTrait,
    TraitAdaptationList,
    TraitAdaptation,
    MethodReference,
    TraitPrecendence,
    TraitAlias,
    ClassModifiers,
    ClassDeclaration,
    TraitDeclaration,
    InterfaceDeclaration,
    BinaryExpression,
    EncapsulatedVariable,
    Variable,
    ArrayElementList,
    ClosureUseVariable,
    ClosureUseList,
    List,
    Clone
}

export interface NodeFactory<T> {
    (type: NodeType, children: (T | Token)[], doc?: Token, error?: ParseError): T;
}

export interface ParseError {
    unexpected: Token,
    expected: (TokenType | string)[],
    nodeTypes?: NodeType[]
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
    '?:': [33, Associativity.Left, OpType.Binary],
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

var reservedTokens: (TokenType | string)[] = [
    TokenType.T_INCLUDE, TokenType.T_INCLUDE_ONCE, TokenType.T_EVAL, TokenType.T_REQUIRE, TokenType.T_REQUIRE_ONCE,
    TokenType.T_LOGICAL_OR, TokenType.T_LOGICAL_XOR, TokenType.T_LOGICAL_AND,
    TokenType.T_INSTANCEOF, TokenType.T_NEW, TokenType.T_CLONE, TokenType.T_EXIT, TokenType.T_IF, TokenType.T_ELSEIF,
    TokenType.T_ELSE, TokenType.T_ENDIF, TokenType.T_ECHO, TokenType.T_DO, TokenType.T_WHILE, TokenType.T_ENDWHILE,
    TokenType.T_FOR, TokenType.T_ENDFOR, TokenType.T_FOREACH, TokenType.T_ENDFOREACH, TokenType.T_DECLARE,
    TokenType.T_ENDDECLARE, TokenType.T_AS, TokenType.T_TRY, TokenType.T_CATCH, TokenType.T_FINALLY,
    TokenType.T_THROW, TokenType.T_USE, TokenType.T_INSTEADOF, TokenType.T_GLOBAL, TokenType.T_VAR, TokenType.T_UNSET,
    TokenType.T_ISSET, TokenType.T_EMPTY, TokenType.T_CONTINUE, TokenType.T_GOTO,
    TokenType.T_FUNCTION, TokenType.T_CONST, TokenType.T_RETURN, TokenType.T_PRINT, TokenType.T_YIELD, TokenType.T_LIST,
    TokenType.T_SWITCH, TokenType.T_ENDSWITCH, TokenType.T_CASE, TokenType.T_DEFAULT, TokenType.T_BREAK,
    TokenType.T_ARRAY, TokenType.T_CALLABLE, TokenType.T_EXTENDS, TokenType.T_IMPLEMENTS, TokenType.T_NAMESPACE, TokenType.T_TRAIT,
    TokenType.T_INTERFACE, TokenType.T_CLASS, TokenType.T_CLASS_C, TokenType.T_TRAIT_C, TokenType.T_FUNC_C, TokenType.T_METHOD_C,
    TokenType.T_LINE, TokenType.T_FILE, TokenType.T_DIR, TokenType.T_NS_C
];

var semiReservedTokens: (TokenType | string)[] = [
    TokenType.T_STATIC, TokenType.T_ABSTRACT, TokenType.T_FINAL, TokenType.T_PRIVATE, TokenType.T_PROTECTED, TokenType.T_PUBLIC
];

export class Parser<T> {

    private _lexer: Lexer;
    private _nodeFactory: NodeFactory<T>;
    private _errors: ParseError[];
    private _opPrecedenceMap = opPrecedenceMap;
    private _reserved = reservedTokens;
    private _semiReserved = semiReservedTokens;

    constructor(lexer: Lexer, nodeFactory: NodeFactory<T>) {
        this._lexer = lexer;
        this._nodeFactory = nodeFactory;
    }

    get errors() {
        return this._errors;
    }

    hasErrors() {
        return this._errors.length !== 0;
    }

    private isReserved(t: Token) {
        return this._reserved.indexOf(t.type) !== -1;
    }

    private isSemiReserved(t: Token) {
        return this._semiReserved.indexOf(t.type) !== -1 || this.isReserved(t);
    }

    private topStatementList(toks: TokenIterator) {

        let children: (T | Token)[] = [];
        let stopOn: (TokenType | string)[] = [TokenType.T_EOF];

        if (toks.current.type === '{') {
            children.push(toks.current);
            toks.next();
            stopOn.push('}');
        }

        while (true) {

            if (stopOn.indexOf(toks.current.type) !== -1) {
                break;
            }

            children.push(this.topStatement(toks));

        }

        if (stopOn.indexOf('{') === -1) {
            return this._nodeFactory(NodeType.TopStatementList, children);
        }

        if (toks.current.type !== '}') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.TopStatementList, children);

    }

    private topStatement(toks: TokenIterator) {

        switch (toks.current.type) {
            case TokenType.T_NAMESPACE:
                return this.namespace(toks);
            case TokenType.T_USE:
                return this.use(toks);
            case TokenType.T_HALT_COMPILER:
                return this.haltCompiler(toks);
            case TokenType.T_CONST:
                return this.constDeclarationList(toks);
            default:
                return this.statement(toks);
        }


    }

    private constDeclarationList(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];

        while (true) {

            children.push(this.constElement(toks));
            if (toks.current.type !== ',') {
                break;
            }
            children.push(toks.current);
            toks.next();
        }

        if (toks.current.type !== ';') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.ConstDeclarationList, children);

    }

    private constElement(toks: TokenIterator) {

        let children: (T | Token)[] = [];
        let doc = toks.lastDocComment;

        if (toks.current.type !== TokenType.T_CONST) {
            //error
        }

        children.push(toks.current);

        if (toks.next().type !== '=') {
            //error
        }

        children.push(toks.current);
        children.push(this.expression(toks));

        if (toks.current.type !== ';') {
            //error
        }

        children.push(toks.current);
        toks.next();

        return this._nodeFactory(NodeType.ConstElement, children, doc);

    }

    private expression(toks: TokenIterator, minPrecedence = 0) {

        let lhs = this.atom(toks);
        let precedence: number;
        let associativity: Associativity;
        let op: Token;
        let rhs: T | Token;

        while (true) {

            op = toks.current;

            if (!this.isBinaryOp(op)) {
                break;
            }

            [precedence, associativity] = this._opPrecedenceMap[op.text];

            if (precedence < minPrecedence) {
                break;
            }

            if (associativity === Associativity.Left) {
                ++precedence;
            }

            toks.next();
            rhs = this.expression(toks, precedence);
            lhs = this._nodeFactory(NodeType.BinaryExpression, [lhs, op, rhs]);

        }

        return lhs;


    }

    private atom(toks: TokenIterator) {

        switch (toks.current.type) {
            case TokenType.T_VARIABLE:
            case '$':
            case TokenType.T_ARRAY:
            case '[':
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_NS_SEPARATOR:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case '(':
                return this.variable(toks);
            case TokenType.T_STATIC:
                if (toks.lookahead().type === TokenType.T_FUNCTION) {
                    return this.closure(toks);
                } else {
                    return this.variable(toks);
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
                return this.unaryExpression(toks);
            case TokenType.T_LIST:
                return this.listAssignment(toks);
            case TokenType.T_CLONE:
                return this.cloneExpression(toks);
            case TokenType.T_NEW:
                return this.newExpression(toks);
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
                return toks.current;
            case TokenType.T_START_HEREDOC:
                return this.heredoc(toks);
            case '"':
                return this.encapsulatedVariableList(toks);
            case '`':
                return this.backticksExpression(toks);
            case TokenType.T_PRINT:
                return this.printExpression(toks);
            case TokenType.T_YIELD:
                return this.yieldExpression(toks);
            case TokenType.T_YIELD_FROM:
                return this.yieldFromExpression(toks);
            case TokenType.T_FUNCTION:
                return this.closure(toks);
            case TokenType.T_INCLUDE:
            case TokenType.T_INCLUDE_ONCE:
            case TokenType.T_REQUIRE:
            case TokenType.T_REQUIRE_ONCE:
                return this.includeExpression(toks);
            case TokenType.T_EVAL:
                return this.evalExpression(toks);
            case TokenType.T_EMPTY:
                return this.emptyExpression(toks);
            case TokenType.T_ISSET:
                return this.issetExpression(toks);
            default:
                //error
                break;
        }

    }

    private issetExpression(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];

        if (toks.next().type !== '(') {
            //error
        }

        children.push(toks.current);
        toks.next();

        while (true) {

            children.push(this.expression(toks));
            if (toks.current.type !== ',') {
                break;
            }

            children.push(toks.current);
        }

        if (toks.current.type !== ')') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.Isset, children);

    }

    private emptyExpression(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];

        if (toks.next().type !== '(') {
            //error
        }

        children.push(toks.current);
        toks.next();
        children.push(this.expression(toks));

        if (toks.current.type !== ')') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.Empty, children);

    }

    private evalExpression(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];

        if (toks.next().type !== '(') {
            //error
        }

        children.push(toks.current);
        toks.next();
        children.push(this.expression(toks));

        if (toks.current.type !== ')') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.Eval, children);

    }

    private includeExpression(toks: TokenIterator) {

        return this.keywordExpression(NodeType.Include, toks);

    }

    private yieldFromExpression(toks: TokenIterator) {

        return this.keywordExpression(NodeType.YieldFrom, toks);

    }

    private keywordExpression(nodeType: NodeType, toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        toks.next();
        children.push(this.expression(toks));
        return this._nodeFactory(nodeType, children);
    }

    private isExpressionStartToken(t: Token) {

    }

    private yieldExpression(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];

        if (!this.isExpressionStartToken(toks.next())) {
            return this._nodeFactory(NodeType.Yield, children);
        }

        children.push(this.expression(toks));

        if (toks.current.type !== TokenType.T_DOUBLE_ARROW) {
            return this._nodeFactory(NodeType.Yield, children);
        }

        children.push(toks.current);
        toks.next();
        children.push(this.expression(toks));
        return this._nodeFactory(NodeType.Yield, children);

    }

    private printExpression(toks: TokenIterator) {

        return this.keywordExpression(NodeType.Print, toks);

    }

    private backticksExpression(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];

        switch (toks.next().type) {
            case '`':
                //empty
                break;
            case TokenType.T_ENCAPSED_AND_WHITESPACE:
                if ([TokenType.T_VARIABLE,
                TokenType.T_DOLLAR_OPEN_CURLY_BRACES,
                TokenType.T_CURLY_OPEN].indexOf(<TokenType>toks.lookahead().type) === -1) {
                    children.push(toks.current);
                    toks.next();
                    break;
                }
            //fall through
            case TokenType.T_VARIABLE:
            case TokenType.T_DOLLAR_OPEN_CURLY_BRACES:
            case TokenType.T_CURLY_OPEN:
                children.push(this.encapsulatedVariableList(toks));
                break;
            default:
                //error
                break;

        }

        if (toks.current.type !== '`') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.BackticksExpression, children);
    }

    private encapsulatedVariableList(toks: TokenIterator) {

        let children: (T | Token)[] = [];

        while (true) {

            switch (toks.current.type) {
                case TokenType.T_ENCAPSED_AND_WHITESPACE:
                    children.push(toks.current);
                    toks.next();
                    continue;
                case TokenType.T_VARIABLE:
                    if (toks.lookahead().type === '[') {
                        children.push(this.encapsulatedDimension(toks));
                    } else if (toks.lookahead().type === TokenType.T_OBJECT_OPERATOR) {
                        children.push(this.encapsulatedProperty(toks));
                    } else {
                        children.push(this._nodeFactory(NodeType.EncapsulatedVariable, [this._nodeFactory(NodeType.Variable, [toks.current])]));
                        toks.next();
                    }
                    continue;
                case TokenType.T_DOLLAR_OPEN_CURLY_BRACES:
                    children.push(this.dollarCurlyOpenEncapsulatedVariable(toks));
                    continue;
                case TokenType.T_CURLY_OPEN:
                    children.push(this.curlyOpenEncapsulatedVariable(toks));
                    continue;
                default:
                    break;
            }

            break;

        }

        return this._nodeFactory(NodeType.EncapsulatedVariableList, children);

    }

    private curlyOpenEncapsulatedVariable(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current, this.variable(toks)];

        if (toks.current.type !== '}') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.EncapsulatedVariable, children);

    }

    private dollarCurlyOpenEncapsulatedVariable(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];

        if (toks.next().type === TokenType.T_STRING_VARNAME) {

            if (toks.lookahead().type === '[') {

                let dimChildren: (T | Token)[] = [this._nodeFactory(NodeType.Variable, [toks.current]), toks.next(), this.expression(toks)];
                if (toks.current.type !== ']') {
                    //error
                }
                dimChildren.push(toks.current);
                children.push(this._nodeFactory(NodeType.Dimension, dimChildren));
            } else {
                children.push(this._nodeFactory(NodeType.Variable, [toks.current]));
            }

            toks.next();

        } else {
            children.push(this.expression(toks));
        }

        if (toks.current.type !== '}') {
            //error
        }
        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.EncapsulatedVariable, children);

    }

    private encapsulatedDimension(toks: TokenIterator) {

        let children: (T | Token)[] = [this._nodeFactory(NodeType.Variable, [toks.current]), toks.next()];

        switch (toks.next().type) {
            case TokenType.T_STRING:
            case TokenType.T_NUM_STRING:
                children.push(toks.current);
                break;
            case TokenType.T_VARIABLE:
                children.push(this._nodeFactory(NodeType.Variable, [toks.current]));
                break;
            case '-':
                let unaryNodeChildren = [toks.current];
                if (toks.next().type !== TokenType.T_NUM_STRING) {
                    //error
                }
                unaryNodeChildren.push(toks.current);
                children.push(this._nodeFactory(NodeType.UnaryOp, unaryNodeChildren));
                break;
            default:
                //error
                break;
        }

        if (toks.next().type !== ']') {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.EncapsulatedVariable, [this._nodeFactory(NodeType.Dimension, children)]);

    }

    private encapsulatedProperty(toks: TokenIterator) {
        let children: (T | Token)[] = [this._nodeFactory(NodeType.Variable, [toks.current]), toks.next()];

        if (toks.next().type !== TokenType.T_STRING) {
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.EncapsulatedVariable, [this._nodeFactory(NodeType.Property, children)]);
    }

    private heredoc() {

    }

    private anonymousClassDeclaration(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        let doc = toks.lastDocComment;
        let t = toks.next();

        if (doc) {
            children.unshift(doc);
        }

        if (t.type === '(') {
            children.push(this.argumentList(toks));
            t = toks.current;
        }

        if (t.type === TokenType.T_EXTENDS) {
            children.push(this.extendsClass(toks));
            t = toks.current;
        }

        if (t.type === TokenType.T_IMPLEMENTS) {
            children.push(this.implementsInterfaces(toks));
            t = toks.current;
        }

        children.push(this.classStatementList(toks));
        return this._nodeFactory(NodeType.AnonymousClass, children);

    }

    private classStatementList(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];

        if (t.type !== '{') {
            //error
        }

        children.push(t);
        t = toks.next();

        while (true) {

            if (t.type === '}' || t.type === TokenType.T_EOF) {
                break;
            }

            children.push(this.classStatement(toks));
            t = toks.current;
        }

        if (t.type !== '}') {
            //error
        }

        children.push(t);
        toks.next();

        return this._nodeFactory(NodeType.ClassStatementList, children);

    }

    private classStatement(toks: TokenIterator) {

        let t = toks.current;

        switch (t.type) {
            case TokenType.T_PUBLIC:
            case TokenType.T_PROTECTED:
            case TokenType.T_PRIVATE:
            case TokenType.T_STATIC:
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
                let modifierList = this.memberModifierList(toks);
                t = toks.current;
                if (t.type === TokenType.T_VARIABLE) {
                    return this.propertyDeclarationList(toks, modifierList);
                } else if (t.type === TokenType.T_FUNCTION) {
                    return this.methodDeclaration(toks, modifierList);
                } else if (t.type === TokenType.T_CONST) {
                    return this.classConstantDeclarationList(toks, modifierList);
                } else {
                    //error
                }
            case TokenType.T_FUNCTION:
                return this.methodDeclaration(toks);
            case TokenType.T_VAR:
                toks.next();
                return this.propertyDeclarationList(toks, t);
            case TokenType.T_CONST:
                return this.classConstantDeclarationList(toks);
            case TokenType.T_USE:
                return this.useTrait(toks);
            default:
                //error
                break;

        }

    }

    private useTrait(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        let t = toks.next();

        children.push(this.nameList(toks));
        t = toks.current;

        if (t.type === ';') {
            children.push(t);
            toks.next();
            return this._nodeFactory(NodeType.UseTrait, children);
        }

        if (t.type !== '{') {
            //error
        }

        children.push(this.traitAdaptationList(toks));
        return this._nodeFactory(NodeType.TraitAdaptationList, children);

    }

    private traitAdaptationList(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        let t = toks.next();

        while (true) {
            if (t.type === '}' || t.type === TokenType.T_EOF) {
                break;
            }
            children.push(this.traitAdaptation(toks));
            t = toks.current;
        }

        if (t.type !== '}') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.TraitAdaptationList, children);
    }

    private traitAdaptation(toks: TokenIterator) {

        let t = toks.current;
        let methodRefOrIdent: T | Token;
        let t2 = toks.lookahead();

        if (t.type === TokenType.T_NAMESPACE ||
            t.type === TokenType.T_NS_SEPARATOR ||
            (t.type === TokenType.T_STRING &&
                (t2.type === TokenType.T_PAAMAYIM_NEKUDOTAYIM || t2.type === TokenType.T_NS_SEPARATOR))) {

            methodRefOrIdent = this.methodReference(toks);

            if (t.type === TokenType.T_INSTEADOF) {
                return this.traitPrecedence(toks, methodRefOrIdent);
            }

        } else if (t.type === TokenType.T_STRING || this.isSemiReserved(t)) {
            methodRefOrIdent = t;
            toks.next();
        } else {
            //error
        }

        return this.traitAlias(toks, methodRefOrIdent);


    }

    private traitAlias(toks: TokenIterator, methodReferenceOrIdentifier: T | Token) {
        let t = toks.current;
        let children: (T | Token)[] = [methodReferenceOrIdentifier];

        if (t.type !== TokenType.T_AS) {
            //error
        }

        children.push(t);
        t = toks.next();

        if (t.type === TokenType.T_STRING || this.isReserved(t)) {
            children.push(t);
            t = toks.next();
        } else if (t.type === TokenType.T_PUBLIC || t.type === TokenType.T_PROTECTED || t.type === TokenType.T_PRIVATE) {
            children.push(t);
            t = toks.next();
            if (t.type === TokenType.T_STRING || this.isSemiReserved(t)) {
                children.push(t);
                t = toks.next();
            }
        } else {
            //error
        }

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.TraitAlias, children);
    }

    private traitPrecedence(toks: TokenIterator, methodReference: T) {

        let children: (T | Token)[] = [methodReference, toks.current];
        toks.next();
        children.push(this.nameList(toks));
        let t = toks.current;

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.TraitPrecendence, children);

    }

    private methodReference(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];

        children.push(this.name(toks));
        t = toks.current;

        if (t.type !== TokenType.T_PAAMAYIM_NEKUDOTAYIM) {
            //error
        }

        children.push(t);
        t = toks.next();

        if (t.type !== TokenType.T_STRING || !this.isSemiReserved(t)) {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.MethodReference, children);

    }

    private methodDeclaration(toks: TokenIterator, modifiers: T = null) {

        let t = toks.current;
        let children: (T | Token)[] = [];
        let doc = toks.lastDocComment;

        if (modifiers) {
            children.push(modifiers);
        }

        children.push(t);
        t = toks.next();

        if (t.type === '&') {
            children.push(t);
            t = toks.next();
        }

        if (t.type !== TokenType.T_STRING && !this.isSemiReserved(t)) {
            //error
        }

        children.push(t);
        t = toks.next();
        children.push(this.parameterList(toks));
        t = toks.current;

        if (t.type === ':') {
            children.push(this.returnType(toks));
            t = toks.current;
        }

        children.push(this.parenthesisedInnerStatementList(toks));
        return this._nodeFactory(NodeType.MethodDeclaration, children);

    }

    private parenthesisedInnerStatementList(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];

        if (t.type !== '{') {
            //error
        }

        children.push(t);
        children.push(this.innerStatementList(toks, [TokenType.T_EOF, '}']));
        t = toks.current;

        if (t.type !== '}') {
            //error
        }

        children.push(t);
        return this._nodeFactory(NodeType.ParenthesisedInnerStatementList, children);

    }

    private innerStatementList(toks: TokenIterator, stopTokenTypeArray: (TokenType | string)[]) {

        let children: (T | Token)[] = [];

        while (true) {
            if (stopTokenTypeArray.indexOf(toks.current.type) !== -1) {
                break;
            }
            children.push(this.innerStatement(toks));
        }

        return this._nodeFactory(NodeType.InnerStatementList, children);
    }

    private innerStatement(toks: TokenIterator) {

        let t = toks.current;

        switch (t.type) {
            case TokenType.T_FUNCTION:
                return this.functionDeclaration(toks);
            case TokenType.T_ABSTRACT:
            case TokenType.T_FINAL:
            case TokenType.T_CLASS:
                return this.classDeclaration(toks);
            case TokenType.T_TRAIT:
                return this.traitDeclaration(toks);
            case TokenType.T_INTERFACE:
                return this.interfaceDeclaration(toks);
            default:
                return this.statement(toks);
        }

    }

    private interfaceDeclaration(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        let doc = toks.lastDocComment;
        let t = toks.next();

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        t = toks.next();

        if (t.type === TokenType.T_EXTENDS) {
            children.push(this.extendsInterface(toks));
        }

        children.push(this.classStatementList(toks));
        return this._nodeFactory(NodeType.InterfaceDeclaration, children, doc);

    }

    private extendsInterface(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        toks.next();
        children.push(this.nameList(toks));
        return this._nodeFactory(NodeType.InterfaceExtends, children);

    }

    private traitDeclaration(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        let doc = toks.lastDocComment;
        let t = toks.next();

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        toks.next();
        children.push(this.classStatementList(toks));
        return this._nodeFactory(NodeType.TraitDeclaration, children, doc);

    }

    private functionDeclaration(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        let doc = toks.lastDocComment;
        let t = toks.next();

        if (t.type === '&') {
            children.push(t);
            t = toks.next();
        }

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        children.push(this.parameterList(toks));
        t = toks.current;

        if (t.type === ':') {
            children.push(this.returnType(toks));
            t = toks.current;
        }

        children.push(this.parenthesisedInnerStatementList(toks));
        return this._nodeFactory(NodeType.FunctionDeclaration, children);

    }

    private classDeclaration(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];
        let doc = toks.lastDocComment;

        if (t.type === TokenType.T_ABSTRACT || t.type === TokenType.T_FINAL) {
            children.push(this.classModifiers(toks));
        }

        t = toks.current;
        if (t.type !== TokenType.T_CLASS) {
            //error
        }
        children.push(t);
        t = toks.next();

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);
        t = toks.next();

        if (t.type === TokenType.T_EXTENDS) {
            children.push(this.extendsClass(toks));
            t = toks.current;
        }

        if (t.type === TokenType.T_IMPLEMENTS) {
            children.push(this.implementsInterfaces(toks));
            t = toks.current;
        }

        children.push(this.classStatementList(toks));
        return this._nodeFactory(NodeType.ClassDeclaration, children, doc);

    }

    private classModifiers(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        let t = toks.next();

        while (true) {
            if (t.type !== TokenType.T_ABSTRACT && t.type !== TokenType.T_FINAL) {
                break;
            }
            children.push(t);
            t = toks.next();
        }

        return this._nodeFactory(NodeType.ClassModifiers, children);

    }

    private statement(toks: TokenIterator) {

        let t = toks.current;

        switch (t.type) {
            case '{':
                return this.parenthesisedInnerStatementList(toks);
            case TokenType.T_IF:
                return this.ifStatement(toks);
            case TokenType.T_WHILE:
                return this.whileStatement(toks);
            case TokenType.T_DO:
                return this.doWhileStatement(toks);
            case TokenType.T_FOR:
                return this.forStatement(toks);
            case TokenType.T_SWITCH:
                return this.switchStatement(toks);
            case TokenType.T_BREAK:
                return this.breakStatement(toks);
            case TokenType.T_CONTINUE:
                return this.continueStatement(toks);
            case TokenType.T_RETURN:
                return this.returnStatement(toks);
            case TokenType.T_GLOBAL:
                return this.globalVarList(toks);
            case TokenType.T_STATIC:
                return this.staticVarList(toks);
            case TokenType.T_ECHO:
                return this.echoExpressionList(toks);
            case TokenType.T_INLINE_HTML:
                return t;
            case TokenType.T_UNSET:
                return this.unsetVarList(toks);
            case TokenType.T_FOREACH:
                return this.foreachStatement(toks);
            case TokenType.T_DECLARE:
                return this.declareStatement(toks);
            case TokenType.T_TRY:
                return this.tryBlock(toks);
            case TokenType.T_THROW:
                return this.throwStatement(toks);
            case TokenType.T_GOTO:
                return this.gotoStatement(toks);
            case TokenType.T_STRING:
                return this.labelStatement(toks);
            case ';':
                return t;
            default:
                return this.expressionStatement(toks);

        }

    }

    private expressionStatement(toks: TokenIterator) {

        let children: (T | Token)[] = [this.expression(toks)];
        let t = toks.current;

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.ExpressionStatement, children);

    }

    private returnType(toks: TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        toks.next();
        children.push(this.typeExpression(toks));
        return this._nodeFactory(NodeType.ReturnType, children);

    }

    private typeExpression(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];

        if (t.type === '?') {
            children.push(t);
            t = toks.next();
        }

        switch (t.type) {
            case TokenType.T_CALLABLE:
            case TokenType.T_ARRAY:
                children.push(t);
                toks.next();
                break;
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                children.push(this.name(toks));
                break;
            default:
                //error
                break;
        }

        return this._nodeFactory(NodeType.TypeExpression, children);

    }

    private classConstantDeclarationList(toks: TokenIterator, modifiers: T = null) {
        let t = toks.current;
        let children: (T | Token)[] = [];

        if (modifiers) {
            children.push(modifiers);
        }

        children.push(t);
        t = toks.next();

        while (true) {
            children.push(this.classConstantDeclaration(toks));
            t = toks.current;

            if (t.type !== ',') {
                break;
            } else {
                children.push(t);
                t = toks.next();
            }
        }

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.ClassConstantDeclarationList, children);
    }

    private classConstantDeclaration(toks: TokenIterator) {
        let t = toks.current;
        let children: (T | Token)[] = [];
        let doc = toks.lastDocComment;

        if (t.type !== TokenType.T_STRING && !this.isSemiReserved(t)) {
            //error
        }

        children.push(t);
        t = toks.next();

        if (t.type !== '=') {
            //error
        }

        children.push(t);
        t = toks.next();

        children.push(this.expression(toks));
        return this._nodeFactory(NodeType.ClassConstantDeclaration, children, doc);

    }

    private propertyDeclarationList(toks: TokenIterator, modifiersOrVar: T | Token) {
        let t = toks.current;
        let children: (T | Token)[] = [modifiersOrVar];

        while (true) {

            children.push(this.propertyDeclaration(toks));
            t = toks.current;

            if (t.type !== ',') {
                break;
            } else {
                children.push(t);
                t = toks.next();
            }

        }

        if (t.type !== ';') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.PropertyDeclarationList, children);

    }

    private propertyDeclaration(toks: TokenIterator) {
        let t = toks.current;
        let children: (T | Token)[] = [];
        let doc = toks.lastDocComment;

        if (t.type !== TokenType.T_VARIABLE) {
            //error
        }

        children.push(t);
        t = toks.next();

        if (t.type !== '=') {
            return this._nodeFactory(NodeType.PropertyDeclaration, children, doc);
        }

        children.push(t);
        t = toks.next();

        children.push(this.expression(toks));
        return this._nodeFactory(NodeType.PropertyDeclaration, children, doc);

    }

    private memberModifierList(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [t];

        while (true) {
            t = toks.next();
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

    private extendsClass(toks: TokenIterator) {

        let t = toks.current;
        toks.next();
        return this._nodeFactory(NodeType.ClassExtends, [t, this.name(toks)]);

    }

    private implementsInterfaces(toks: TokenIterator) {

        let t = toks.current;
        toks.next();
        return this._nodeFactory(NodeType.Implements, [t, this.nameList(toks)]);

    }

    private nameList(toks: TokenIterator) {

        let children: (T | Token)[] = [];
        let t: Token;

        while (true) {
            children.push(this.name(toks));
            t = toks.current;
            if (t.type !== ',') {
                break;
            }
            children.push(t);
            toks.next();
        }

        return this._nodeFactory(NodeType.NameList, children);

    }

    private newExpression(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [t];
        t = toks.next();

        if (t.type === TokenType.T_CLASS) {
            children.push(this.anonymousClassDeclaration(toks));
            return this._nodeFactory(NodeType.New, children);
        }

        let name = this.newVariablePart(toks);

        if (!name) {
            //error
        }

        t = toks.current;
        if (t.type === '[' || t.type === '{' || t.type === TokenType.T_OBJECT_OPERATOR || t.type === TokenType.T_PAAMAYIM_NEKUDOTAYIM) {
            name = this.newVariable(toks, name);
            t = toks.current;
        }

        children.push(name);

        if (t.type === '(') {
            children.push(this.argumentList(toks));
        }

        return this._nodeFactory(NodeType.New, children);

    }

    private newVariable(toks: TokenIterator, part: T | Token = null) {

        if (!part) {
            part = this.newVariablePart(toks);
        }

        let t: Token;
        let next: Token;
        let propName: T | Token;

        while (true) {

            t = toks.current;

            switch (t.type) {
                case '[':
                case '{':
                    part = this.dimension(part, toks);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
                    toks.next();
                    propName = this.propertyName(toks);
                    if (!propName) {
                        //error
                    }
                    part = this._nodeFactory(NodeType.Property, [part, t, propName]);
                    continue;
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    next = toks.next();
                    if (next.type === TokenType.T_VARIABLE) {
                        part = this._nodeFactory(NodeType.StaticProperty, [part, t, next]);
                        toks.next();
                    } else if (next.type === '$') {
                        part = this._nodeFactory(NodeType.StaticProperty, [part, t, this.simpleVariable(toks)]);
                    } else {
                        //error
                    }
                    continue;
                default:
                    break;
            }

            break;

        }

        return part;

    }

    private newVariablePart(toks: TokenIterator) {

        let t = toks.current;
        let newVariablePart: T | Token = null;

        switch (t.type) {
            case TokenType.T_STATIC:
            case TokenType.T_VARIABLE:
                newVariablePart = t;
                toks.next();
                break;
            case '$':
                newVariablePart = this.simpleVariable(toks);
                break;
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                newVariablePart = this.name(toks);
                break;
            default:
                //error
                break;

        }

        return newVariablePart;

    }

    private cloneExpression(toks:TokenIterator) {

        let children:(T|Token)[] = [toks.current];
        toks.next();
        children.push(this.expression(toks));
        return this._nodeFactory(NodeType.Clone, children);

    }

    private listAssignment(toks:TokenIterator) {

        let children:(T|Token)[] = [toks.current];

        if(toks.next().type !== '('){
            //error
        }

        children.push(toks.current);
        toks.next();
        children.push(this.arrayElementList(toks, ')'));

        if(toks.current.type !== ')'){
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.List, children);

    }

    private unaryExpression(toks:TokenIterator) {

        let t = toks.current;
        let children:(T|Token)[] = [t];
        toks.next();
        children.push(this.expression(toks, this._opPrecedenceMap[t.text][0]));
        return this._nodeFactory(NodeType.UnaryOp, children);

    }

    private closure(toks:TokenIterator) {

        let children: (T | Token)[] = [];
        let doc = toks.lastDocComment;

        if (toks.current.type === TokenType.T_STATIC) {
            children.push(toks.current);
            toks.next();
        }

        children.push(toks.current);
        toks.next();

        if (toks.current.type === '&') {
            children.push(toks.current);
            toks.next();
        }

        children.push(this.parameterList(toks));

        if (toks.current.type === TokenType.T_USE) {
            children.push(this.closureUseList(toks));
        }

        if(toks.current.type === ':'){
            children.push(this.returnType(toks));
        }

        if(toks.current.type !== '{'){
            //error
        }

        children.push(toks.current);
        toks.next();
        children.push(this.innerStatementList(toks, ['}']));

        if(toks.current.type !== '}'){
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.Closure, children);

    }

    private closureUseList(toks:TokenIterator) {

        let children: (T | Token)[] = [toks.current];
        
        if (toks.next().type !== '(') {
            //error
        }

        children.push(toks.current);
        toks.next();

        while (true) {

            children.push(this.closureUseVariable(toks));

            if(toks.current.type !== ','){
                break;
            }

            children.push(toks.current);
            toks.next();

        }

        if(toks.current.type !== ')'){
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.ClosureUseList, children);

    }

    private closureUseVariable(toks:TokenIterator){

        let children:(T|Token)[] = [];

        if (toks.current.type === '&') {
            children.push(toks.current);
            toks.next();
        }

        if(toks.current.type !== TokenType.T_VARIABLE){
            //error
        }

        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.ClosureUseVariable, children);

    }

    private parameterList(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];

        if (t.type !== '(') {
            //error
        }
        children.push(t);
        t = toks.next();

        if (t.type === ')') {
            children.push(t);
            toks.next();
            return this._nodeFactory(NodeType.ParameterList, children);
        }

        while (true) {

            children.push(this.parameter());
            t = toks.current;

            if (t.type !== ',') {
                break;
            }
            children.push(t);
            t = toks.next();
        }

        if (t.type !== ')') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.ParameterList, children);

    }

    private parameter() {

        let t = this._lexer.current;
        let children: (T | Token)[] = [];

        if (t.type === TokenType.T_NS_SEPARATOR ||
            t.type === TokenType.T_STRING ||
            t.type === TokenType.T_NAMESPACE) {
            children.push(this.name());
        } else if (t.type === TokenType.T_ARRAY || t.type === TokenType.T_CALLABLE) {
            children.push(t);
            this._lexer.next();
        }

        t = this._lexer.current;

        if (t.type === '&') {
            children.push(t);
            t = this._lexer.next();
        }

        if (t.type === TokenType.T_ELLIPSIS) {
            children.push(t);
            t = this._lexer.next();
        }

        if (t.type !== TokenType.T_VARIABLE) {
            return this._nodeFactory(NodeType.Parameter, children, this.parseError(t, [TokenType.T_VARIABLE]));
        }

        children.push(t);
        t = this._lexer.next();

        if (t.type !== '=') {
            return this._nodeFactory(NodeType.Parameter, children);
        }

        children.push(t);
        t = this._lexer.next();

        children.push(this.expression(0));
        return this._nodeFactory(NodeType.Parameter, children);

    }

    private variable(toks:TokenIterator) {

        let variableAtom = this.variableAtom(toks);

        while (true) {

            switch (toks.current.type) {
                case TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    variableAtom = this.staticMember(toks, variableAtom);
                    continue;
                case TokenType.T_OBJECT_OPERATOR:
                    variableAtom = this.instanceMember(toks, variableAtom);
                    continue;
                case '[':
                case '{':
                    variableAtom = this.dimension(toks, variableAtom);
                    continue;
                case '(':
                    variableAtom = this._nodeFactory(NodeType.Call, [variableAtom, this.argumentList(toks)]);
                    continue;
                default:
                    break;
            }

            break;
        }

        return variableAtom;
    }

    private staticMember(toks:TokenIterator, lhs: T | Token) {

        let children: (T | Token)[] = [lhs, toks.current];
        let t = toks.next();
        let nodeType = NodeType.StaticMethodCall;

        switch (t.type) {
            case '{':
                children.push(this.parenthesisedExpression(toks));
                break;
            case '$':
            case TokenType.T_VARIABLE:
                children.push(this.simpleVariable(toks));
                nodeType = NodeType.StaticProperty;
                break;
            case TokenType.T_STRING:
                children.push(t);
                toks.next();
                nodeType = NodeType.ClassConstant;
                break;
            default:
                if (this.isSemiReserved(t)) {
                    children.push(t);
                    toks.next();
                    nodeType = NodeType.ClassConstant;
                } else {
                    //error
                }
                break;
        }

        t = toks.current;

        if (t.type === '(') {
            children.push(this.argumentList(toks));    
            return this._nodeFactory(NodeType.StaticMethodCall, children);
        } else if(nodeType !== NodeType.StaticMethodCall){
            return this._nodeFactory(nodeType, children);
        } else {
            //error
        }

    }

    private instanceMember(toks: TokenIterator, lhs: T | Token) {

        let children: (T | Token)[] = [lhs, toks.current];
        toks.next();
        let name = this.propertyName(toks);

        if (!name) {
            //error
        }

        children.push(name);
        
        if (toks.current.type === '(') {
            children.push(this.argumentList(toks));
            return this._nodeFactory(NodeType.MethodCall, children);       
        }

        return this._nodeFactory(NodeType.Property, children);

    }

    private propertyName(toks: TokenIterator): T | Token {

        let t = toks.current;

        switch (t.type) {
            case TokenType.T_STRING:        
                toks.next();
                return t;
            case '{':
                return this.parenthesisedExpression(toks);
            case '$':
            case TokenType.T_VARIABLE:
                return this.simpleVariable(toks);
            default:
                //error
                break;
        }

    }

    private dimension(toks: TokenIterator, lhs: T | Token) {
        let t = toks.current;
        let close = t.type === '[' ? ']' : '}';
        let children: (T | Token)[] = [lhs, t];

        t = toks.next();
        if (t.type !== close) {
            children.push(this.expression(toks));
            t = toks.current;
        }

        if (t.type !== close) {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.Dimension, children);

    }

    private argumentList(toks: TokenIterator) {

        let children: (T | Token)[] = [];
        let t = toks.current;

        if (t.type !== '(') {
            //error
        }

        children.push(t);
        t = toks.next();

        if (t.type === ')') {
            children.push(t);
            toks.next();
            return this._nodeFactory(NodeType.ArgumentList, children);
        }

        while (true) {

            if (t.type === TokenType.T_ELLIPSIS) {
                toks.next();
                children.push(this._nodeFactory(NodeType.UnaryOp, [t, this.expression(toks)]));
            } else {
                children.push(this.expression(toks));
            }

            t = toks.current;

            if (t.type !== ',') {
                break;
            }

            children.push(t);
            t = toks.next();
        }

        if (t.type !== ')') {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.ArgumentList, children);

    }

    private subAtom() {

        let t = this._lexer.current;
        let subAtom: T | Token;

        switch (t.type) {
            case TokenType.T_VARIABLE:
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_STATIC:
                subAtom = t;
                break;
            case '$':
                subAtom = this.simpleVariable();
                break;
            case TokenType.T_ARRAY:
                subAtom = this.longArray(toks);
                break;
            case '[':
                subAtom = this.shortArray(toks);
                break;
            case TokenType.T_NS_SEPARATOR:
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
                subAtom = this.name();
                break;
            case '(':
                subAtom = this.parenthesisedExpression();
                break;
            default:
                //unexpected tokens should be handled higher up
                throw new Error(`Unexpected token: ${t.type}`);
        }

        return subAtom;

    }

    private name(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];

        if (t.type === TokenType.T_NS_SEPARATOR) {
            children.push(t);
            t = toks.next();
        } else if (t.type === TokenType.T_NAMESPACE) {
            children.push(t);
            t = toks.next();
            if (t.type === TokenType.T_NS_SEPARATOR) {
                children.push(t);
                t = toks.next();
            } else {
                //error
            }
        }

        children.push(this.namespaceName(toks));

        return this._nodeFactory(NodeType.Name, children);

    }

    private shortArray(toks:TokenIterator){

        let children:(T|Token)[] = [toks.current];

        if(toks.next().type === ']'){
            children.push(toks.current);
            toks.next();
            return this._nodeFactory(NodeType.ArrayDeclaration, children);
        }

        children.push(this.arrayElementList(toks, ']'));

        if(toks.current.type !== ']'){
            //error
        }
        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.ArrayDeclaration, children);

    }

    private longArray(toks:TokenIterator){

        let children:(T|Token)[] = [toks.current];

        if(toks.next().type !== '('){
            //error
        }

        children.push(toks.current);
        if(toks.next().type === ')'){
            children.push(toks.current);
            toks.next();
            return this._nodeFactory(NodeType.ArrayDeclaration, children);
        }

        children.push(this.arrayElementList(toks, ')'));

        if(toks.current.type !== ')'){
            //error
        }
        children.push(toks.current);
        toks.next();
        return this._nodeFactory(NodeType.ArrayDeclaration, children);

    }

    private arrayElementList(toks:TokenIterator, closeTokenType:string){

        let children:(T|Token)[] = [];

        while(true){

            children.push(this.arrayElement(toks));
            if (toks.current.type !== ',') {
                break;
            }

            children.push(toks.current);
            if(toks.next().type === closeTokenType){
                break;
            }

        }

        return this._nodeFactory(NodeType.ArrayElementList, children);

    }

    private arrayElement(toks:TokenIterator) {

        let t = toks.current;

        if (t.type === '&') {
            toks.next();
            return this._nodeFactory(NodeType.UnaryOp, [t, this.variable(toks)]);
        }

        let expr = this.expression(toks);
        t = toks.current;

        if (t.type !== TokenType.T_DOUBLE_ARROW) {
            return expr;
        }

        let children: (T | Token)[] = [expr, t];
        t = toks.next();

        if (t.type === '&') {
            toks.next();
            children.push(this._nodeFactory(NodeType.UnaryOp, [t, this.variable(toks)]));
            return this._nodeFactory(NodeType.ArrayPair, children);
        }

        children.push(this.expression(toks));
        return this._nodeFactory(NodeType.ArrayPair, children);

    }


    private variableAtom(toks: TokenIterator) {
        let t = toks.current;

        switch (t.type) {
            case TokenType.T_VARIABLE:
            case '$':
                return this.simpleVariable(toks);
            case '(':
                return this.parenthesisedExpression(toks);
            case TokenType.T_ARRAY:
                return this.longArray(toks);
            case '[':
                return this.shortArray(toks);
            case TokenType.T_CONSTANT_ENCAPSED_STRING:
            case TokenType.T_STATIC:
                toks.next();
                return t;
            case TokenType.T_STRING:
            case TokenType.T_NAMESPACE:
            case TokenType.T_NS_SEPARATOR:
                return this.name(toks);
            default:
                //error
                break;
        }

    }

    private simpleVariable(toks: TokenIterator) {

        let children: (T | Token)[] = [];
        let t = toks.current;

        if (t.type === TokenType.T_VARIABLE) {
            children.push(toks.current);
            toks.next();
        } else if (t.type === '$') {
            children.push(toks.current);
            t = toks.next();
            if (t.type === '{') {
                children.push(t);
                toks.next();
                children.push(this.expression(toks));
                if (toks.current.type !== '}') {
                    //error
                }
                children.push(toks.current);
                toks.next();
            } else if (t.type === '$' || t.type === TokenType.T_VARIABLE) {
                children.push(this.simpleVariable(toks));
            } else {
                //error
            }
        } else {
            //error
        }

        return this._nodeFactory(NodeType.Variable, children);

    }

    private parenthesisedExpression(toks: TokenIterator) {

        let map: { [id: string]: string } = {
            '(': ')',
            '{': '}',
            '[': ']'
        };
        let t = toks.current;
        let close = map[t.type];
        let children: (T | Token)[] = [t];

        toks.next();
        children.push(this.expression(toks));
        t = toks.current;

        if (t.type !== close) {
            //error
        }

        children.push(t);
        toks.next();
        return this._nodeFactory(NodeType.ParenthesisedExpression, children);
    }

    private isBinaryOp(t: Token) {
        return this._opPrecedenceMap.hasOwnProperty(t.text) && (this._opPrecedenceMap[t.text][2] & OpType.Binary) === OpType.Binary;
    }

    private createBinaryNode(lhs: Node | Token, op: Token, rhs: Node | Token) {

    }

    private haltCompiler() {

        let node: Node = {
            type: NodeType.HaltCompiler
        }
        let t = this._lexer.current;
        let start = t.range;
        let expected = ['(', ')', ';'];

        for (let n = 0; n < expected.length; ++n) {
            t = this._lexer.next();
            if (t.type !== expected[n]) {
                return this.parseError(t, [expected[n]], node, start, this._lexer.lookBehind().range);
            }
        }

        node.location = this.mergeLocation(start, t.range);
        return node;

    }

    private use() {

        let start = this._lexer.current.range;
        let t = this._lexer.next();
        let name: Node;
        let node: Node = { type: NodeType.UseList };

        if (t.type === TokenType.T_FUNCTION || t.type === TokenType.T_CONST) {
            node.flag = t.type === TokenType.T_FUNCTION ? NodeFlag.UseFunction : NodeFlag.UseConst;
            t = this._lexer.next();
        }

        if (t.type === TokenType.T_NS_SEPARATOR) {
            t = this._lexer.next();
        }

        if (t.type !== TokenType.T_STRING) {
            return this.parseError(t, [TokenType.T_STRING], node, start, this._lexer.lookBehind().range);
        }

        name = this.namespaceName();
        t = this._lexer.current;

        if (t.type === TokenType.T_NS_SEPARATOR) {
            node.type = NodeType.UseGroup;
            node.children = [name, null];
            t = this._lexer.next();

            if (t.type !== '{') {
                return this.parseError(t, ['{'], node, start, this._lexer.lookBehind().range);
            }

            node.children[1] = this.useList(!node.flag);
            t = this._lexer.current;

            if (t.type !== '}') {
                return this.parseError(t, ['}'], node, start, this._lexer.lookBehind().range);
            }

            node.location = this.mergeLocation(start, t.range);
            return node;

        }

        if (!node.flag) {
            node.flag = NodeFlag.UseClassNamespaceInterface;
        }
        let useElem: Node = { type: NodeType.UseElement, children: [name, null] };
        node.children = [useElem]

        //should be T_AS | , | ;
        if (t.type === TokenType.T_AS) {
            t = this._lexer.next();

            if (t.type !== TokenType.T_STRING) {
                this.parseError(t, [TokenType.T_STRING], useElem, start, this._lexer.lookBehind().range);
                node.location = useElem.location;
                return node;
            }

            node.children[1] = t;
            t = this._lexer.next();
        }

        if (t.type === ',') {
            this.useList(false, node);
        }

        if (t.type !== ';') {
            return this.parseError(t, [';'], node, start, this._lexer.lookBehind().range);
        }

        node.location = this.mergeLocation(start, node.children[node.children.length - 1].range);
        return node;

    }

    private useList(isMixed: boolean, node: Node = null) {
        if (!node) {
            node = {
                type: NodeType.UseList,
                children: [],
            };
        }
        let t: Token;
        let elem: Node;

        while (true) {
            elem = isMixed ? this.kindUseElement() : this.useElement();
            node.children.push(elem);
            t = this._lexer.current;
            if (t.type !== ',') {
                break;
            }
            t = this._lexer.next();
        }

        node.location = this.mergeLocation(node.children[0].range, node.children[node.children.length - 1].range);
        return node;

    }

    private kindUseElement() {

        let t = this._lexer.current;
        let start = t.range;
        let flag = NodeFlag.UseClassNamespaceInterface;

        if (t.type === TokenType.T_FUNCTION) {
            flag = NodeFlag.UseFunction;
            this._lexer.next();
        } else if (t.type === TokenType.T_CONST) {
            flag = NodeFlag.UseConst;
            this._lexer.next();
        }

        let node = this.useElement();
        node.flag = flag;
        node.location = this.mergeLocation(start, node.location);
        return node;

    }

    private useElement() {

        let node: Node = {
            type: NodeType.UseElement,
            children: [null, null]
        };
        let t = this._lexer.current;
        let start = t.range;

        if (t.type === TokenType.T_NS_SEPARATOR) {
            t = this._lexer.next();
        }

        if (t.type !== TokenType.T_STRING) {
            return this.parseError(t, [TokenType.T_STRING], node, start, this._lexer.lookBehind().range);
        }

        node.children[0] = this.namespaceName();

        if (t.type !== TokenType.T_AS) {
            node.location = this.mergeLocation(start, node.children[0].range);
            return node;
        }

        t = this._lexer.next();

        if (t.type !== TokenType.T_STRING) {
            return this.parseError(t, [TokenType.T_STRING], node, start, this._lexer.lookBehind().range);
        }

        node.children[1] = t;
        node.location = this.mergeLocation(start, t.range);
        this._lexer.next();

        return node;

    }

    private namespace() {

        let node: Node = {
            type: NodeType.Namespace,
            children: [null, null]
        }

        let start = this._lexer.current.range;

        let t = this._lexer.next();
        if (t.type === TokenType.T_STRING) {
            node.children[0] = this.namespaceName();
        } else if (t.type === ';') {
            return this.parseError(t, ['T_STRING'], node, start, t.range);
        }

        node.doc = this.lastDocComment();
        t = this._lexer.current;
        if (t.type === ';') {
            node.location = this.mergeLocation(start, t.range);
        } else if (t.type === '{') {
            node.children[1] = this.topStatementList();
            t = this._lexer.current;
            if (t.type !== '}') {
                return this.parseError(t, ['}'], node, start, node.children[1].range);
            }
            node.location = this.mergeLocation(start, t.range);
        } else {
            return this.parseError(t, [';', '{'], node, start, this._lexer.lookBehind().range);
        }

        return node;
    }

    private namespaceName(toks: TokenIterator) {

        let t = toks.current;
        let children: (T | Token)[] = [];
        let t2: Token;

        if (t.type !== TokenType.T_STRING) {
            //error
        }

        children.push(t);

        while (true) {

            t = toks.next();
            if (t.type !== TokenType.T_NS_SEPARATOR || toks.lookahead().type !== TokenType.T_STRING) {
                break;
            }

            children.push(t, toks.next());
        }

        return this._nodeFactory(NodeType.NamespaceName, children);

    }

    private parseError(unexpected: Token, expected: (TokenType | string)[], nodeTypes?: NodeType[]): ParseError {
        let error: ParseError = {
            unexpected: unexpected,
            expected: expected
        }
        this._errors.push(error);
        return error;
    }

}

