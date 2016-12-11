import { Token, Range } from './lexer';
import { ParseError } from './parseError';
export declare enum AstNodeType {
    None = 0,
    Error = 1,
    TopStatementList = 2,
    Namespace = 3,
    NamespaceName = 4,
    UseElement = 5,
    UseGroup = 6,
    UseList = 7,
    HaltCompiler = 8,
    ConstantDeclarationList = 9,
    ConstantDeclaration = 10,
    ArrayPair = 11,
    Name = 12,
    Call = 13,
    Unpack = 14,
    ArgumentList = 15,
    Dimension = 16,
    ClassConstant = 17,
    StaticProperty = 18,
    StaticMethodCall = 19,
    MethodCall = 20,
    Property = 21,
    Closure = 22,
    ParameterList = 23,
    Parameter = 24,
    Isset = 25,
    Empty = 26,
    Eval = 27,
    Include = 28,
    YieldFrom = 29,
    Yield = 30,
    Print = 31,
    Backticks = 32,
    EncapsulatedVariableList = 33,
    AnonymousClassDeclaration = 34,
    New = 35,
    NameList = 36,
    ClassStatementList = 37,
    PropertyDeclaration = 38,
    PropertyDeclarationList = 39,
    ClassConstantDeclaration = 40,
    ClassConstantDeclarationList = 41,
    TypeExpression = 42,
    InnerStatementList = 43,
    FunctionDeclaration = 44,
    MethodDeclaration = 45,
    UseTrait = 46,
    TraitAdaptationList = 47,
    MethodReference = 48,
    TraitPrecendence = 49,
    TraitAlias = 50,
    ClassDeclaration = 51,
    TraitDeclaration = 52,
    InterfaceDeclaration = 53,
    Variable = 54,
    ArrayPairList = 55,
    ClosureUseVariable = 56,
    ClosureUseList = 57,
    Clone = 58,
    Heredoc = 59,
    DoubleQuotes = 60,
    EmptyStatement = 61,
    IfList = 62,
    If = 63,
    While = 64,
    DoWhile = 65,
    ForExpressionList = 66,
    For = 67,
    Break = 68,
    Continue = 69,
    Return = 70,
    GlobalVariableList = 71,
    StaticVariableList = 72,
    StaticVariable = 73,
    Echo = 74,
    Unset = 75,
    Throw = 76,
    Goto = 77,
    Label = 78,
    Foreach = 79,
    CaseList = 80,
    Switch = 81,
    Case = 82,
    Declare = 83,
    Try = 84,
    Catch = 85,
    CatchNameList = 86,
    Finally = 87,
    TernaryExpression = 88,
    UnaryBoolNot = 89,
    UnaryBitwiseNot = 90,
    UnaryMinus = 91,
    UnaryPlus = 92,
    UnarySilence = 93,
    UnaryPreInc = 94,
    UnaryPostInc = 95,
    UnaryPreDec = 96,
    UnaryPostDec = 97,
    UnaryReference = 98,
    BinaryBitwiseOr = 99,
    BinaryBitwiseAnd = 100,
    BinaryBitwiseXor = 101,
    BinaryConcat = 102,
    BinaryAdd = 103,
    BinarySubtract = 104,
    BinaryMultiply = 105,
    BinaryDivide = 106,
    BinaryModulus = 107,
    BinaryPower = 108,
    BinaryShiftLeft = 109,
    BinaryShiftRight = 110,
    BinaryBoolAnd = 111,
    BinaryBoolOr = 112,
    BinaryLogicalAnd = 113,
    BinaryLogicalOr = 114,
    BinaryLogicalXor = 115,
    BinaryIsIdentical = 116,
    BinaryIsNotIdentical = 117,
    BinaryIsEqual = 118,
    BinaryIsNotEqual = 119,
    BinaryIsSmaller = 120,
    BinaryIsSmallerOrEqual = 121,
    BinaryIsGreater = 122,
    BinaryIsGreaterOrEqual = 123,
    BinarySpaceship = 124,
    BinaryCoalesce = 125,
    BinaryAssign = 126,
    BinaryConcatAssign = 127,
    BinaryAddAssign = 128,
    BinarySubtractAssign = 129,
    BinaryMultiplyAssign = 130,
    BinaryDivideAssign = 131,
    BinaryModulusAssign = 132,
    BinaryPowerAssign = 133,
    BinaryShiftLeftAssign = 134,
    BinaryShiftRightAssign = 135,
    BinaryBitwiseOrAssign = 136,
    BinaryBitwiseAndAssign = 137,
    BinaryBitwiseXorAssign = 138,
    BinaryInstanceOf = 139,
    MagicConstant = 140,
    CatchList = 141,
    ErrorStaticMember = 142,
    ErrorArgument = 143,
    ErrorVariable = 144,
    ErrorExpression = 145,
    ErrorClassStatement = 146,
    ErrorPropertyName = 147,
    ErrorTraitAdaptation = 148,
}
export declare enum AstNodeFlag {
    None = 0,
    ModifierPublic = 1,
    ModifierProtected = 2,
    ModifierPrivate = 4,
    ModifierStatic = 8,
    ModifierAbstract = 16,
    ModifierFinal = 32,
    ReturnsRef = 64,
    PassByRef = 128,
    Variadic = 256,
    Nullable = 257,
    NameFq = 258,
    NameNotFq = 259,
    NameRelative = 260,
    MagicLine = 261,
    MagicFile = 262,
    MagicDir = 263,
    MagicNamespace = 264,
    MagicFunction = 265,
    MagicMethod = 266,
    MagicClass = 267,
    MagicTrait = 268,
    UseClass = 269,
    UseFunction = 270,
    UseConstant = 271,
}
export interface AstNodeFactory<T> {
    (value: AstNode | Token, children?: T[]): T;
}
export interface AstNode {
    type: AstNodeType;
    range: Range;
    value?: string;
    flag?: AstNodeFlag;
    doc?: Token;
    errors?: ParseError[];
}
export declare class Parser<T> {
    private _nodeFactory;
    private _opPrecedenceMap;
    private _tokens;
    private _followOnStack;
    private _isBinaryOpPredicate;
    private _variableAtomType;
    constructor(nodeFactory: AstNodeFactory<T>);
    parse(tokens: Token[]): T;
    private _tempNode(type?, startPos?);
    private _node(tempNode, endPos?);
    private _startPos();
    private _endPos();
    private _topStatementList(isCurly);
    private _topStatement();
    private _constantDeclarationStatement();
    private _constantDeclaration();
    private _expression(minPrecedence?);
    private _binaryNode(lhs, rhs, type, startPos);
    private _unaryOpToNodeType(op, isPost?);
    private _binaryOpToNodeType(op);
    private _ternaryExpression(lhs, precedence, startPos);
    private _atom();
    private _magicConstantTokenToFlag(t);
    private _isset();
    private _keywordParenthesisedExpression(type);
    private _keywordExpression(nodeType);
    private _yield();
    private _quotedEncapsulatedVariableList(type, closeTokenType);
    private _encapsulatedVariableList(breakOn);
    private _curlyOpenEncapsulatedVariable();
    private _dollarCurlyOpenEncapsulatedVariable();
    private _encapsulatedDimension();
    private _encapsulatedProperty();
    private _heredoc();
    private _anonymousClassDeclaration();
    private _classStatementList();
    private _isClassStatementStartToken(t);
    private _classStatement();
    private _useTraitStatement();
    private _traitAdaptationList();
    private _traitAdaptation();
    private _traitAlias(n);
    private _traitPrecedence(n);
    private _methodReference();
    private _methodDeclarationStatement(n);
    private _innerStatementList(breakOn, tempNode?);
    private _innerStatement();
    private _interfaceDeclarationStatement();
    private _traitDeclarationStatement();
    private _functionDeclarationStatement();
    private _classDeclarationStatement();
    private _classModifiers();
    private _statement();
    private _try();
    private _catchList();
    private _finallyStatement();
    private _catchStatement();
    private _catchNameList();
    private _declareStatement();
    private _declareConstantDeclarationList();
    private _switchStatement();
    private _caseStatementList();
    private _caseStatement();
    private _labelStatement();
    private _gotoStatement();
    private _throwStatement();
    private _foreachStatement();
    private _foreachVariable();
    private _isVariableStartToken(t);
    private _unsetStatement();
    private _echoStatement();
    private _staticVariableDeclarationStatement();
    private _globalVariableDeclarationStatement();
    private _staticVariableDeclaration();
    private _keywordOptionalExpressionStatement(nodeType);
    private _forStatement();
    private _forExpressionList(breakOn);
    private _doWhileStatement();
    private _whileStatement();
    private _ifStatementList();
    private _ifStatement(isAlt, discoverAlt?);
    private _expressionStatement();
    private _returnType();
    private _typeExpression();
    private _classConstantDeclarationStatement(n);
    private _isExpressionStartToken(t);
    private _classConstantDeclaration();
    private _propertyDeclarationStatement(n);
    private _propertyDeclaration();
    private _memberModifierList();
    private _memberModifierToFlag(t);
    private _nameList();
    private _newExpression();
    private _newVariable();
    private _newVariablePart();
    private _cloneExpression();
    private _listExpression();
    private _unaryExpression();
    private _closure();
    private _closureUse();
    private _closureUseVariable();
    private _parameterList();
    private _isTypeExpressionStartToken(t);
    private _parameter();
    private _variable();
    private _staticMember(lhs, startPos);
    private _instanceMember(lhs, startPos);
    private _propertyName();
    private _dimension(lhs, startPos);
    private _argumentList();
    private _isArgumentStartToken(t);
    private _argument();
    private _name();
    private _shortArray();
    private _longArray();
    private _isArrayPairStartToken(t);
    private _arrayPairList(n, breakOn);
    private _arrayPair();
    private _variableAtom();
    private _simpleVariable();
    private _isBinaryOpToken(t);
    private _haltCompilerStatement();
    private _useStatement();
    private _useGroup(n);
    private _useList(n, isMixed, lookForPrefix, breakOn);
    private _useElement(n, isMixed, lookForPrefix);
    private _namespaceStatement();
    private _namespaceName();
    private _error(tempNode, expected, followOn?);
    private _isReservedToken(t);
    private _isSemiReservedToken(t);
    private _isTopStatementStartToken(t);
    private _isInnerStatementStartToken(t);
    private _isStatementStartToken(t);
}
