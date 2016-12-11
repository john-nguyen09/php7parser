'use strict';
const lexer_1 = require("./lexer");
const parseError_1 = require("./parseError");
const tokenIterator_1 = require("./tokenIterator");
var AstNodeType;
(function (AstNodeType) {
    AstNodeType[AstNodeType["None"] = 0] = "None";
    AstNodeType[AstNodeType["Error"] = 1] = "Error";
    AstNodeType[AstNodeType["TopStatementList"] = 2] = "TopStatementList";
    AstNodeType[AstNodeType["Namespace"] = 3] = "Namespace";
    AstNodeType[AstNodeType["NamespaceName"] = 4] = "NamespaceName";
    AstNodeType[AstNodeType["UseElement"] = 5] = "UseElement";
    AstNodeType[AstNodeType["UseGroup"] = 6] = "UseGroup";
    AstNodeType[AstNodeType["UseList"] = 7] = "UseList";
    AstNodeType[AstNodeType["HaltCompiler"] = 8] = "HaltCompiler";
    AstNodeType[AstNodeType["ConstantDeclarationList"] = 9] = "ConstantDeclarationList";
    AstNodeType[AstNodeType["ConstantDeclaration"] = 10] = "ConstantDeclaration";
    AstNodeType[AstNodeType["ArrayPair"] = 11] = "ArrayPair";
    AstNodeType[AstNodeType["Name"] = 12] = "Name";
    AstNodeType[AstNodeType["Call"] = 13] = "Call";
    AstNodeType[AstNodeType["Unpack"] = 14] = "Unpack";
    AstNodeType[AstNodeType["ArgumentList"] = 15] = "ArgumentList";
    AstNodeType[AstNodeType["Dimension"] = 16] = "Dimension";
    AstNodeType[AstNodeType["ClassConstant"] = 17] = "ClassConstant";
    AstNodeType[AstNodeType["StaticProperty"] = 18] = "StaticProperty";
    AstNodeType[AstNodeType["StaticMethodCall"] = 19] = "StaticMethodCall";
    AstNodeType[AstNodeType["MethodCall"] = 20] = "MethodCall";
    AstNodeType[AstNodeType["Property"] = 21] = "Property";
    AstNodeType[AstNodeType["Closure"] = 22] = "Closure";
    AstNodeType[AstNodeType["ParameterList"] = 23] = "ParameterList";
    AstNodeType[AstNodeType["Parameter"] = 24] = "Parameter";
    AstNodeType[AstNodeType["Isset"] = 25] = "Isset";
    AstNodeType[AstNodeType["Empty"] = 26] = "Empty";
    AstNodeType[AstNodeType["Eval"] = 27] = "Eval";
    AstNodeType[AstNodeType["Include"] = 28] = "Include";
    AstNodeType[AstNodeType["YieldFrom"] = 29] = "YieldFrom";
    AstNodeType[AstNodeType["Yield"] = 30] = "Yield";
    AstNodeType[AstNodeType["Print"] = 31] = "Print";
    AstNodeType[AstNodeType["Backticks"] = 32] = "Backticks";
    AstNodeType[AstNodeType["EncapsulatedVariableList"] = 33] = "EncapsulatedVariableList";
    AstNodeType[AstNodeType["AnonymousClassDeclaration"] = 34] = "AnonymousClassDeclaration";
    AstNodeType[AstNodeType["New"] = 35] = "New";
    AstNodeType[AstNodeType["NameList"] = 36] = "NameList";
    AstNodeType[AstNodeType["ClassStatementList"] = 37] = "ClassStatementList";
    AstNodeType[AstNodeType["PropertyDeclaration"] = 38] = "PropertyDeclaration";
    AstNodeType[AstNodeType["PropertyDeclarationList"] = 39] = "PropertyDeclarationList";
    AstNodeType[AstNodeType["ClassConstantDeclaration"] = 40] = "ClassConstantDeclaration";
    AstNodeType[AstNodeType["ClassConstantDeclarationList"] = 41] = "ClassConstantDeclarationList";
    AstNodeType[AstNodeType["TypeExpression"] = 42] = "TypeExpression";
    AstNodeType[AstNodeType["InnerStatementList"] = 43] = "InnerStatementList";
    AstNodeType[AstNodeType["FunctionDeclaration"] = 44] = "FunctionDeclaration";
    AstNodeType[AstNodeType["MethodDeclaration"] = 45] = "MethodDeclaration";
    AstNodeType[AstNodeType["UseTrait"] = 46] = "UseTrait";
    AstNodeType[AstNodeType["TraitAdaptationList"] = 47] = "TraitAdaptationList";
    AstNodeType[AstNodeType["MethodReference"] = 48] = "MethodReference";
    AstNodeType[AstNodeType["TraitPrecendence"] = 49] = "TraitPrecendence";
    AstNodeType[AstNodeType["TraitAlias"] = 50] = "TraitAlias";
    AstNodeType[AstNodeType["ClassDeclaration"] = 51] = "ClassDeclaration";
    AstNodeType[AstNodeType["TraitDeclaration"] = 52] = "TraitDeclaration";
    AstNodeType[AstNodeType["InterfaceDeclaration"] = 53] = "InterfaceDeclaration";
    AstNodeType[AstNodeType["Variable"] = 54] = "Variable";
    AstNodeType[AstNodeType["ArrayPairList"] = 55] = "ArrayPairList";
    AstNodeType[AstNodeType["ClosureUseVariable"] = 56] = "ClosureUseVariable";
    AstNodeType[AstNodeType["ClosureUseList"] = 57] = "ClosureUseList";
    AstNodeType[AstNodeType["Clone"] = 58] = "Clone";
    AstNodeType[AstNodeType["Heredoc"] = 59] = "Heredoc";
    AstNodeType[AstNodeType["DoubleQuotes"] = 60] = "DoubleQuotes";
    AstNodeType[AstNodeType["EmptyStatement"] = 61] = "EmptyStatement";
    AstNodeType[AstNodeType["IfList"] = 62] = "IfList";
    AstNodeType[AstNodeType["If"] = 63] = "If";
    AstNodeType[AstNodeType["While"] = 64] = "While";
    AstNodeType[AstNodeType["DoWhile"] = 65] = "DoWhile";
    AstNodeType[AstNodeType["ForExpressionList"] = 66] = "ForExpressionList";
    AstNodeType[AstNodeType["For"] = 67] = "For";
    AstNodeType[AstNodeType["Break"] = 68] = "Break";
    AstNodeType[AstNodeType["Continue"] = 69] = "Continue";
    AstNodeType[AstNodeType["Return"] = 70] = "Return";
    AstNodeType[AstNodeType["GlobalVariableList"] = 71] = "GlobalVariableList";
    AstNodeType[AstNodeType["StaticVariableList"] = 72] = "StaticVariableList";
    AstNodeType[AstNodeType["StaticVariable"] = 73] = "StaticVariable";
    AstNodeType[AstNodeType["Echo"] = 74] = "Echo";
    AstNodeType[AstNodeType["Unset"] = 75] = "Unset";
    AstNodeType[AstNodeType["Throw"] = 76] = "Throw";
    AstNodeType[AstNodeType["Goto"] = 77] = "Goto";
    AstNodeType[AstNodeType["Label"] = 78] = "Label";
    AstNodeType[AstNodeType["Foreach"] = 79] = "Foreach";
    AstNodeType[AstNodeType["CaseList"] = 80] = "CaseList";
    AstNodeType[AstNodeType["Switch"] = 81] = "Switch";
    AstNodeType[AstNodeType["Case"] = 82] = "Case";
    AstNodeType[AstNodeType["Declare"] = 83] = "Declare";
    AstNodeType[AstNodeType["Try"] = 84] = "Try";
    AstNodeType[AstNodeType["Catch"] = 85] = "Catch";
    AstNodeType[AstNodeType["CatchNameList"] = 86] = "CatchNameList";
    AstNodeType[AstNodeType["Finally"] = 87] = "Finally";
    AstNodeType[AstNodeType["TernaryExpression"] = 88] = "TernaryExpression";
    AstNodeType[AstNodeType["UnaryBoolNot"] = 89] = "UnaryBoolNot";
    AstNodeType[AstNodeType["UnaryBitwiseNot"] = 90] = "UnaryBitwiseNot";
    AstNodeType[AstNodeType["UnaryMinus"] = 91] = "UnaryMinus";
    AstNodeType[AstNodeType["UnaryPlus"] = 92] = "UnaryPlus";
    AstNodeType[AstNodeType["UnarySilence"] = 93] = "UnarySilence";
    AstNodeType[AstNodeType["UnaryPreInc"] = 94] = "UnaryPreInc";
    AstNodeType[AstNodeType["UnaryPostInc"] = 95] = "UnaryPostInc";
    AstNodeType[AstNodeType["UnaryPreDec"] = 96] = "UnaryPreDec";
    AstNodeType[AstNodeType["UnaryPostDec"] = 97] = "UnaryPostDec";
    AstNodeType[AstNodeType["UnaryReference"] = 98] = "UnaryReference";
    AstNodeType[AstNodeType["BinaryBitwiseOr"] = 99] = "BinaryBitwiseOr";
    AstNodeType[AstNodeType["BinaryBitwiseAnd"] = 100] = "BinaryBitwiseAnd";
    AstNodeType[AstNodeType["BinaryBitwiseXor"] = 101] = "BinaryBitwiseXor";
    AstNodeType[AstNodeType["BinaryConcat"] = 102] = "BinaryConcat";
    AstNodeType[AstNodeType["BinaryAdd"] = 103] = "BinaryAdd";
    AstNodeType[AstNodeType["BinarySubtract"] = 104] = "BinarySubtract";
    AstNodeType[AstNodeType["BinaryMultiply"] = 105] = "BinaryMultiply";
    AstNodeType[AstNodeType["BinaryDivide"] = 106] = "BinaryDivide";
    AstNodeType[AstNodeType["BinaryModulus"] = 107] = "BinaryModulus";
    AstNodeType[AstNodeType["BinaryPower"] = 108] = "BinaryPower";
    AstNodeType[AstNodeType["BinaryShiftLeft"] = 109] = "BinaryShiftLeft";
    AstNodeType[AstNodeType["BinaryShiftRight"] = 110] = "BinaryShiftRight";
    AstNodeType[AstNodeType["BinaryBoolAnd"] = 111] = "BinaryBoolAnd";
    AstNodeType[AstNodeType["BinaryBoolOr"] = 112] = "BinaryBoolOr";
    AstNodeType[AstNodeType["BinaryLogicalAnd"] = 113] = "BinaryLogicalAnd";
    AstNodeType[AstNodeType["BinaryLogicalOr"] = 114] = "BinaryLogicalOr";
    AstNodeType[AstNodeType["BinaryLogicalXor"] = 115] = "BinaryLogicalXor";
    AstNodeType[AstNodeType["BinaryIsIdentical"] = 116] = "BinaryIsIdentical";
    AstNodeType[AstNodeType["BinaryIsNotIdentical"] = 117] = "BinaryIsNotIdentical";
    AstNodeType[AstNodeType["BinaryIsEqual"] = 118] = "BinaryIsEqual";
    AstNodeType[AstNodeType["BinaryIsNotEqual"] = 119] = "BinaryIsNotEqual";
    AstNodeType[AstNodeType["BinaryIsSmaller"] = 120] = "BinaryIsSmaller";
    AstNodeType[AstNodeType["BinaryIsSmallerOrEqual"] = 121] = "BinaryIsSmallerOrEqual";
    AstNodeType[AstNodeType["BinaryIsGreater"] = 122] = "BinaryIsGreater";
    AstNodeType[AstNodeType["BinaryIsGreaterOrEqual"] = 123] = "BinaryIsGreaterOrEqual";
    AstNodeType[AstNodeType["BinarySpaceship"] = 124] = "BinarySpaceship";
    AstNodeType[AstNodeType["BinaryCoalesce"] = 125] = "BinaryCoalesce";
    AstNodeType[AstNodeType["BinaryAssign"] = 126] = "BinaryAssign";
    AstNodeType[AstNodeType["BinaryConcatAssign"] = 127] = "BinaryConcatAssign";
    AstNodeType[AstNodeType["BinaryAddAssign"] = 128] = "BinaryAddAssign";
    AstNodeType[AstNodeType["BinarySubtractAssign"] = 129] = "BinarySubtractAssign";
    AstNodeType[AstNodeType["BinaryMultiplyAssign"] = 130] = "BinaryMultiplyAssign";
    AstNodeType[AstNodeType["BinaryDivideAssign"] = 131] = "BinaryDivideAssign";
    AstNodeType[AstNodeType["BinaryModulusAssign"] = 132] = "BinaryModulusAssign";
    AstNodeType[AstNodeType["BinaryPowerAssign"] = 133] = "BinaryPowerAssign";
    AstNodeType[AstNodeType["BinaryShiftLeftAssign"] = 134] = "BinaryShiftLeftAssign";
    AstNodeType[AstNodeType["BinaryShiftRightAssign"] = 135] = "BinaryShiftRightAssign";
    AstNodeType[AstNodeType["BinaryBitwiseOrAssign"] = 136] = "BinaryBitwiseOrAssign";
    AstNodeType[AstNodeType["BinaryBitwiseAndAssign"] = 137] = "BinaryBitwiseAndAssign";
    AstNodeType[AstNodeType["BinaryBitwiseXorAssign"] = 138] = "BinaryBitwiseXorAssign";
    AstNodeType[AstNodeType["BinaryInstanceOf"] = 139] = "BinaryInstanceOf";
    AstNodeType[AstNodeType["MagicConstant"] = 140] = "MagicConstant";
    AstNodeType[AstNodeType["CatchList"] = 141] = "CatchList";
    AstNodeType[AstNodeType["ErrorStaticMember"] = 142] = "ErrorStaticMember";
    AstNodeType[AstNodeType["ErrorArgument"] = 143] = "ErrorArgument";
    AstNodeType[AstNodeType["ErrorVariable"] = 144] = "ErrorVariable";
    AstNodeType[AstNodeType["ErrorExpression"] = 145] = "ErrorExpression";
    AstNodeType[AstNodeType["ErrorClassStatement"] = 146] = "ErrorClassStatement";
    AstNodeType[AstNodeType["ErrorPropertyName"] = 147] = "ErrorPropertyName";
    AstNodeType[AstNodeType["ErrorTraitAdaptation"] = 148] = "ErrorTraitAdaptation";
})(AstNodeType = exports.AstNodeType || (exports.AstNodeType = {}));
var AstNodeFlag;
(function (AstNodeFlag) {
    AstNodeFlag[AstNodeFlag["None"] = 0] = "None";
    AstNodeFlag[AstNodeFlag["ModifierPublic"] = 1] = "ModifierPublic";
    AstNodeFlag[AstNodeFlag["ModifierProtected"] = 2] = "ModifierProtected";
    AstNodeFlag[AstNodeFlag["ModifierPrivate"] = 4] = "ModifierPrivate";
    AstNodeFlag[AstNodeFlag["ModifierStatic"] = 8] = "ModifierStatic";
    AstNodeFlag[AstNodeFlag["ModifierAbstract"] = 16] = "ModifierAbstract";
    AstNodeFlag[AstNodeFlag["ModifierFinal"] = 32] = "ModifierFinal";
    AstNodeFlag[AstNodeFlag["ReturnsRef"] = 64] = "ReturnsRef";
    AstNodeFlag[AstNodeFlag["PassByRef"] = 128] = "PassByRef";
    AstNodeFlag[AstNodeFlag["Variadic"] = 256] = "Variadic";
    AstNodeFlag[AstNodeFlag["Nullable"] = 257] = "Nullable";
    AstNodeFlag[AstNodeFlag["NameFq"] = 258] = "NameFq";
    AstNodeFlag[AstNodeFlag["NameNotFq"] = 259] = "NameNotFq";
    AstNodeFlag[AstNodeFlag["NameRelative"] = 260] = "NameRelative";
    AstNodeFlag[AstNodeFlag["MagicLine"] = 261] = "MagicLine";
    AstNodeFlag[AstNodeFlag["MagicFile"] = 262] = "MagicFile";
    AstNodeFlag[AstNodeFlag["MagicDir"] = 263] = "MagicDir";
    AstNodeFlag[AstNodeFlag["MagicNamespace"] = 264] = "MagicNamespace";
    AstNodeFlag[AstNodeFlag["MagicFunction"] = 265] = "MagicFunction";
    AstNodeFlag[AstNodeFlag["MagicMethod"] = 266] = "MagicMethod";
    AstNodeFlag[AstNodeFlag["MagicClass"] = 267] = "MagicClass";
    AstNodeFlag[AstNodeFlag["MagicTrait"] = 268] = "MagicTrait";
    AstNodeFlag[AstNodeFlag["UseClass"] = 269] = "UseClass";
    AstNodeFlag[AstNodeFlag["UseFunction"] = 270] = "UseFunction";
    AstNodeFlag[AstNodeFlag["UseConstant"] = 271] = "UseConstant";
})(AstNodeFlag = exports.AstNodeFlag || (exports.AstNodeFlag = {}));
var Associativity;
(function (Associativity) {
    Associativity[Associativity["None"] = 0] = "None";
    Associativity[Associativity["Left"] = 1] = "Left";
    Associativity[Associativity["Right"] = 2] = "Right";
})(Associativity || (Associativity = {}));
var OpType;
(function (OpType) {
    OpType[OpType["None"] = 0] = "None";
    OpType[OpType["Unary"] = 1] = "Unary";
    OpType[OpType["Binary"] = 2] = "Binary";
})(OpType || (OpType = {}));
var opPrecedenceMap = {
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
    '?': [33, Associativity.Left, OpType.Binary],
    ':': [33, Associativity.Left, OpType.Binary],
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
function isBinaryOp(t) {
    return isVariableOnlyBinaryOp(t) || isVariableAndExpressionBinaryOp(t);
}
function isVariableAndExpressionBinaryOp(t) {
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
        case lexer_1.TokenType.T_POW:
        case lexer_1.TokenType.T_SL:
        case lexer_1.TokenType.T_SR:
        case lexer_1.TokenType.T_BOOLEAN_AND:
        case lexer_1.TokenType.T_BOOLEAN_OR:
        case lexer_1.TokenType.T_LOGICAL_AND:
        case lexer_1.TokenType.T_LOGICAL_OR:
        case lexer_1.TokenType.T_LOGICAL_XOR:
        case lexer_1.TokenType.T_IS_IDENTICAL:
        case lexer_1.TokenType.T_IS_NOT_IDENTICAL:
        case lexer_1.TokenType.T_IS_EQUAL:
        case lexer_1.TokenType.T_IS_NOT_EQUAL:
        case '<':
        case lexer_1.TokenType.T_IS_SMALLER_OR_EQUAL:
        case '>':
        case lexer_1.TokenType.T_IS_GREATER_OR_EQUAL:
        case lexer_1.TokenType.T_SPACESHIP:
        case lexer_1.TokenType.T_COALESCE:
            return true;
        default:
            return false;
    }
}
function isAssignBinaryOp(t) {
    return t.type === '=';
}
function isVariableOnlyBinaryOp(t) {
    switch (t.type) {
        case '=':
        case lexer_1.TokenType.T_PLUS_EQUAL:
        case lexer_1.TokenType.T_MINUS_EQUAL:
        case lexer_1.TokenType.T_MUL_EQUAL:
        case lexer_1.TokenType.T_POW_EQUAL:
        case lexer_1.TokenType.T_DIV_EQUAL:
        case lexer_1.TokenType.T_CONCAT_EQUAL:
        case lexer_1.TokenType.T_MOD_EQUAL:
        case lexer_1.TokenType.T_AND_EQUAL:
        case lexer_1.TokenType.T_OR_EQUAL:
        case lexer_1.TokenType.T_XOR_EQUAL:
        case lexer_1.TokenType.T_SL_EQUAL:
        case lexer_1.TokenType.T_SR_EQUAL:
            return true;
        default:
            return false;
    }
}
var recoverTopStatementStartTokenTypes = [
    lexer_1.TokenType.T_NAMESPACE, lexer_1.TokenType.T_USE, lexer_1.TokenType.T_HALT_COMPILER, lexer_1.TokenType.T_CONST,
    lexer_1.TokenType.T_FUNCTION, lexer_1.TokenType.T_CLASS, lexer_1.TokenType.T_ABSTRACT, lexer_1.TokenType.T_FINAL,
    lexer_1.TokenType.T_TRAIT, lexer_1.TokenType.T_INTERFACE, lexer_1.TokenType.T_IF, lexer_1.TokenType.T_WHILE, lexer_1.TokenType.T_DO,
    lexer_1.TokenType.T_FOR, lexer_1.TokenType.T_SWITCH, lexer_1.TokenType.T_BREAK, lexer_1.TokenType.T_CONTINUE, lexer_1.TokenType.T_RETURN,
    lexer_1.TokenType.T_GLOBAL, lexer_1.TokenType.T_STATIC, lexer_1.TokenType.T_ECHO, lexer_1.TokenType.T_INLINE_HTML,
    lexer_1.TokenType.T_UNSET, lexer_1.TokenType.T_FOREACH, lexer_1.TokenType.T_DECLARE, lexer_1.TokenType.T_TRY,
    lexer_1.TokenType.T_THROW, lexer_1.TokenType.T_GOTO, ';'
];
var recoverInnerStatementStartTokenTypes = [
    lexer_1.TokenType.T_FUNCTION, lexer_1.TokenType.T_ABSTRACT, lexer_1.TokenType.T_FINAL, lexer_1.TokenType.T_CLASS, lexer_1.TokenType.T_TRAIT,
    lexer_1.TokenType.T_INTERFACE, lexer_1.TokenType.T_IF, lexer_1.TokenType.T_WHILE, lexer_1.TokenType.T_DO,
    lexer_1.TokenType.T_FOR, lexer_1.TokenType.T_SWITCH, lexer_1.TokenType.T_BREAK, lexer_1.TokenType.T_CONTINUE, lexer_1.TokenType.T_RETURN,
    lexer_1.TokenType.T_GLOBAL, lexer_1.TokenType.T_STATIC, lexer_1.TokenType.T_ECHO, lexer_1.TokenType.T_INLINE_HTML,
    lexer_1.TokenType.T_UNSET, lexer_1.TokenType.T_FOREACH, lexer_1.TokenType.T_DECLARE, lexer_1.TokenType.T_TRY,
    lexer_1.TokenType.T_THROW, lexer_1.TokenType.T_GOTO, ';'
];
var recoverClassStatementStartTokenTypes = [
    lexer_1.TokenType.T_PUBLIC, lexer_1.TokenType.T_PROTECTED, lexer_1.TokenType.T_PRIVATE, lexer_1.TokenType.T_STATIC,
    lexer_1.TokenType.T_ABSTRACT, lexer_1.TokenType.T_FINAL, lexer_1.TokenType.T_FUNCTION, lexer_1.TokenType.T_VAR,
    lexer_1.TokenType.T_CONST, lexer_1.TokenType.T_USE
];
var parameterStartTokenTypes = [
    '&', lexer_1.TokenType.T_ELLIPSIS, lexer_1.TokenType.T_VARIABLE, lexer_1.TokenType.T_NS_SEPARATOR,
    lexer_1.TokenType.T_STRING, lexer_1.TokenType.T_NAMESPACE, '?', lexer_1.TokenType.T_ARRAY,
    lexer_1.TokenType.T_CALLABLE
];
var recoverStatementStartTokenTypes = [
    lexer_1.TokenType.T_IF, lexer_1.TokenType.T_WHILE, lexer_1.TokenType.T_DO, lexer_1.TokenType.T_FOR, lexer_1.TokenType.T_SWITCH,
    lexer_1.TokenType.T_BREAK, lexer_1.TokenType.T_CONTINUE, lexer_1.TokenType.T_RETURN, '{', ';',
    lexer_1.TokenType.T_GLOBAL, lexer_1.TokenType.T_STATIC, lexer_1.TokenType.T_ECHO, lexer_1.TokenType.T_INLINE_HTML, lexer_1.TokenType.T_UNSET,
    lexer_1.TokenType.T_FOREACH, lexer_1.TokenType.T_DECLARE, lexer_1.TokenType.T_TRY, lexer_1.TokenType.T_THROW, lexer_1.TokenType.T_GOTO
];
class Parser {
    constructor(nodeFactory) {
        this._opPrecedenceMap = opPrecedenceMap;
        this._nodeFactory = nodeFactory;
    }
    parse(tokens) {
        this._followOnStack = [];
        this._tokens = new tokenIterator_1.TokenIterator(tokens);
        return this._topStatementList(false);
    }
    _tempNode(type = 0, startPos = null) {
        if (!startPos) {
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
    _node(tempNode, endPos = null) {
        if (!endPos) {
            endPos = this._endPos();
        }
        tempNode.value.range.end = endPos;
        return this._nodeFactory(tempNode.value, tempNode.children);
    }
    _startPos() {
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_EOF) {
            t = this._tokens.current;
        }
        return t.range.start;
    }
    _endPos() {
        return this._tokens.current.range.end;
    }
    _topStatementList(isCurly) {
        let n = this._tempNode(AstNodeType.TopStatementList);
        let t;
        let breakOn = isCurly ? '}' : lexer_1.TokenType.T_EOF;
        let followOn = recoverTopStatementStartTokenTypes.slice(0);
        followOn.push(breakOn);
        while (true) {
            t = this._tokens.peek();
            if (this._isTopStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._topStatement());
                this._followOnStack.pop();
            }
            else if (t.type === breakOn) {
                break;
            }
            else {
                t = this._error(n, followOn, followOn);
                if (t.type === ';') {
                    this._tokens.next();
                }
                else if (t.type === lexer_1.TokenType.T_EOF) {
                    break;
                }
            }
        }
        return this._node(n);
    }
    _topStatement() {
        let t = this._tokens.peek();
        switch (t.type) {
            case lexer_1.TokenType.T_NAMESPACE:
                return this._namespaceStatement();
            case lexer_1.TokenType.T_USE:
                return this._useStatement();
            case lexer_1.TokenType.T_HALT_COMPILER:
                return this._haltCompilerStatement();
            case lexer_1.TokenType.T_CONST:
                return this._constantDeclarationStatement();
            case lexer_1.TokenType.T_FUNCTION:
                return this._functionDeclarationStatement();
            case lexer_1.TokenType.T_CLASS:
            case lexer_1.TokenType.T_ABSTRACT:
            case lexer_1.TokenType.T_FINAL:
                return this._classDeclarationStatement();
            case lexer_1.TokenType.T_TRAIT:
                return this._traitDeclarationStatement();
            case lexer_1.TokenType.T_INTERFACE:
                return this._interfaceDeclarationStatement();
            default:
                return this._statement();
        }
    }
    _constantDeclarationStatement() {
        let n = this._tempNode(AstNodeType.ConstantDeclarationList);
        this._tokens.next();
        let followOn = [',', ';'];
        let t;
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._constantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ';') {
                this._tokens.next();
                break;
            }
            else {
                if (this._error(n, [',', ';'], [';']).type === ';') {
                    this._tokens.next();
                }
                break;
            }
        }
        return this._node(n);
    }
    _constantDeclaration() {
        let n = this._tempNode(AstNodeType.ConstantDeclaration);
        let t;
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
            n.value.doc = this._tokens.lastDocComment;
        }
        else {
            this._error(n, [lexer_1.TokenType.T_STRING]);
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
    _expression(minPrecedence = 0) {
        let precedence;
        let associativity;
        let op;
        let startPos = this._startPos();
        let opFlag;
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
            }
            else {
                let rhs;
                if (op.type === '=' && this._tokens.peek().type === '&') {
                    rhs = this._unaryExpression();
                }
                else {
                    rhs = op.type === lexer_1.TokenType.T_INSTANCEOF ? this._newVariable() : this._expression(precedence);
                }
                lhs = this._binaryNode(lhs, rhs, this._binaryOpToNodeType(op), startPos);
            }
        }
        return lhs;
    }
    _binaryNode(lhs, rhs, type, startPos) {
        let tempNode = this._tempNode(type, startPos);
        tempNode.children.push(lhs);
        tempNode.children.push(rhs);
        return this._node(tempNode);
    }
    _unaryOpToNodeType(op, isPost = false) {
        switch (op.type) {
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
            case lexer_1.TokenType.T_INC:
                return isPost ? AstNodeType.UnaryPreInc : AstNodeType.UnaryPostInc;
            case lexer_1.TokenType.T_DEC:
                return isPost ? AstNodeType.UnaryPreDec : AstNodeType.UnaryPostDec;
            default:
                throw new Error(`Unknow operator ${op.text}`);
        }
    }
    _binaryOpToNodeType(op) {
        switch (op.type) {
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
            case lexer_1.TokenType.T_POW:
                return AstNodeType.BinaryPower;
            case lexer_1.TokenType.T_SL:
                return AstNodeType.BinaryShiftLeft;
            case lexer_1.TokenType.T_SR:
                return AstNodeType.BinaryShiftRight;
            case lexer_1.TokenType.T_BOOLEAN_AND:
                return AstNodeType.BinaryBoolAnd;
            case lexer_1.TokenType.T_BOOLEAN_OR:
                return AstNodeType.BinaryBoolOr;
            case lexer_1.TokenType.T_LOGICAL_AND:
                return AstNodeType.BinaryLogicalAnd;
            case lexer_1.TokenType.T_LOGICAL_OR:
                return AstNodeType.BinaryLogicalOr;
            case lexer_1.TokenType.T_LOGICAL_XOR:
                return AstNodeType.BinaryLogicalXor;
            case lexer_1.TokenType.T_IS_IDENTICAL:
                return AstNodeType.BinaryIsIdentical;
            case lexer_1.TokenType.T_IS_NOT_IDENTICAL:
                return AstNodeType.BinaryIsNotIdentical;
            case lexer_1.TokenType.T_IS_EQUAL:
                return AstNodeType.BinaryIsEqual;
            case lexer_1.TokenType.T_IS_NOT_EQUAL:
                return AstNodeType.BinaryIsNotEqual;
            case '<':
                return AstNodeType.BinaryIsSmaller;
            case lexer_1.TokenType.T_IS_SMALLER_OR_EQUAL:
                return AstNodeType.BinaryIsSmallerOrEqual;
            case '>':
                return AstNodeType.BinaryIsGreater;
            case lexer_1.TokenType.T_IS_GREATER_OR_EQUAL:
                return AstNodeType.BinaryIsGreaterOrEqual;
            case lexer_1.TokenType.T_SPACESHIP:
                return AstNodeType.BinarySpaceship;
            case lexer_1.TokenType.T_COALESCE:
                return AstNodeType.BinaryCoalesce;
            case '=':
                return AstNodeType.BinaryAssign;
            case lexer_1.TokenType.T_CONCAT_EQUAL:
                return AstNodeType.BinaryConcatAssign;
            case lexer_1.TokenType.T_PLUS_EQUAL:
                return AstNodeType.BinaryAddAssign;
            case lexer_1.TokenType.T_MINUS_EQUAL:
                return AstNodeType.BinarySubtractAssign;
            case lexer_1.TokenType.T_MUL_EQUAL:
                return AstNodeType.BinaryMultiplyAssign;
            case lexer_1.TokenType.T_DIV_EQUAL:
                return AstNodeType.BinaryDivideAssign;
            case lexer_1.TokenType.T_MOD_EQUAL:
                return AstNodeType.BinaryModulusAssign;
            case lexer_1.TokenType.T_POW_EQUAL:
                return AstNodeType.BinaryPowerAssign;
            case lexer_1.TokenType.T_SL_EQUAL:
                return AstNodeType.BinaryShiftLeftAssign;
            case lexer_1.TokenType.T_SR_EQUAL:
                return AstNodeType.BinaryShiftRightAssign;
            case lexer_1.TokenType.T_OR_EQUAL:
                return AstNodeType.BinaryBitwiseOrAssign;
            case lexer_1.TokenType.T_AND_EQUAL:
                return AstNodeType.BinaryBitwiseAndAssign;
            case lexer_1.TokenType.T_XOR_EQUAL:
                return AstNodeType.BinaryBitwiseXorAssign;
            case lexer_1.TokenType.T_INSTEADOF:
                return AstNodeType.BinaryInstanceOf;
            default:
                throw new Error(`Unknown operator ${op.text}`);
        }
    }
    _ternaryExpression(lhs, precedence, startPos) {
        let n = this._tempNode(AstNodeType.TernaryExpression, startPos);
        n.children.push(lhs);
        if (this._tokens.consume(':')) {
            n.children.push(this._nodeFactory(null));
        }
        else {
            this._followOnStack.push([':']);
            n.children.push(this._expression(precedence));
            this._followOnStack.pop();
            if (!this._tokens.consume(':')) {
                this._error(n, [':']);
                n.children.push(this._nodeFactory(null));
                return this._node(n);
            }
        }
        n.children.push(this._expression(precedence));
        return this._node(n);
    }
    _atom() {
        let t = this._tokens.peek();
        switch (t.type) {
            case lexer_1.TokenType.T_STATIC:
                if (this._tokens.peek(1).type === lexer_1.TokenType.T_FUNCTION) {
                    return this._closure();
                }
            case lexer_1.TokenType.T_VARIABLE:
            case '$':
            case lexer_1.TokenType.T_ARRAY:
            case '[':
            case lexer_1.TokenType.T_CONSTANT_ENCAPSED_STRING:
            case lexer_1.TokenType.T_NS_SEPARATOR:
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NAMESPACE:
            case '(':
                this._isBinaryOpPredicate = isBinaryOp;
                let possibleUnaryStart = t.range.start;
                let variable = this._variable();
                t = this._tokens.peek();
                if (t.type === lexer_1.TokenType.T_INC || t.type === lexer_1.TokenType.T_DEC) {
                    this._tokens.next();
                    let unary = this._tempNode(t.type === lexer_1.TokenType.T_INC ? AstNodeType.UnaryPostInc : AstNodeType.UnaryPostDec, possibleUnaryStart);
                    unary.children.push(variable);
                    return this._node(unary);
                }
                else {
                    return variable;
                }
            case lexer_1.TokenType.T_INC:
            case lexer_1.TokenType.T_DEC:
            case '+':
            case '-':
            case '!':
            case '~':
            case '@':
            case lexer_1.TokenType.T_INT_CAST:
            case lexer_1.TokenType.T_DOUBLE_CAST:
            case lexer_1.TokenType.T_STRING_CAST:
            case lexer_1.TokenType.T_ARRAY_CAST:
            case lexer_1.TokenType.T_OBJECT_CAST:
            case lexer_1.TokenType.T_BOOL_CAST:
            case lexer_1.TokenType.T_UNSET_CAST:
                return this._unaryExpression();
            case lexer_1.TokenType.T_LIST:
                this._isBinaryOpPredicate = isAssignBinaryOp;
                return this._listExpression();
            case lexer_1.TokenType.T_CLONE:
                return this._cloneExpression();
            case lexer_1.TokenType.T_NEW:
                return this._newExpression();
            case lexer_1.TokenType.T_DNUMBER:
            case lexer_1.TokenType.T_LNUMBER:
                return this._nodeFactory(this._tokens.next());
            case lexer_1.TokenType.T_LINE:
            case lexer_1.TokenType.T_FILE:
            case lexer_1.TokenType.T_DIR:
            case lexer_1.TokenType.T_TRAIT_C:
            case lexer_1.TokenType.T_METHOD_C:
            case lexer_1.TokenType.T_FUNC_C:
            case lexer_1.TokenType.T_NS_C:
            case lexer_1.TokenType.T_CLASS_C:
                let magic = this._tempNode(AstNodeType.MagicConstant);
                magic.value.flag = this._magicConstantTokenToFlag(this._tokens.next());
                return this._node(magic);
            case lexer_1.TokenType.T_START_HEREDOC:
                return this._heredoc();
            case '"':
                return this._quotedEncapsulatedVariableList(AstNodeType.DoubleQuotes, '"');
            case '`':
                return this._quotedEncapsulatedVariableList(AstNodeType.Backticks, '`');
            case lexer_1.TokenType.T_PRINT:
                return this._keywordExpression(AstNodeType.Print);
            case lexer_1.TokenType.T_YIELD:
                return this._yield();
            case lexer_1.TokenType.T_YIELD_FROM:
                return this._keywordExpression(AstNodeType.YieldFrom);
            case lexer_1.TokenType.T_FUNCTION:
                return this._closure();
            case lexer_1.TokenType.T_INCLUDE:
            case lexer_1.TokenType.T_INCLUDE_ONCE:
            case lexer_1.TokenType.T_REQUIRE:
            case lexer_1.TokenType.T_REQUIRE_ONCE:
                return this._keywordExpression(AstNodeType.Include);
            case lexer_1.TokenType.T_EVAL:
                return this._keywordParenthesisedExpression(AstNodeType.Eval);
            case lexer_1.TokenType.T_EMPTY:
                return this._keywordParenthesisedExpression(AstNodeType.Empty);
            case lexer_1.TokenType.T_ISSET:
                return this._isset();
            default:
                let err = this._tempNode(AstNodeType.ErrorExpression);
                this._error(err, []);
                return this._node(err);
        }
    }
    _magicConstantTokenToFlag(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_LINE:
                return AstNodeFlag.MagicLine;
            case lexer_1.TokenType.T_FILE:
                return AstNodeFlag.MagicFile;
            case lexer_1.TokenType.T_DIR:
                return AstNodeFlag.MagicDir;
            case lexer_1.TokenType.T_TRAIT_C:
                return AstNodeFlag.MagicTrait;
            case lexer_1.TokenType.T_METHOD_C:
                return AstNodeFlag.MagicMethod;
            case lexer_1.TokenType.T_FUNC_C:
                return AstNodeFlag.MagicFunction;
            case lexer_1.TokenType.T_NS_C:
                return AstNodeFlag.MagicNamespace;
            case lexer_1.TokenType.T_CLASS_C:
                return AstNodeFlag.MagicClass;
            default:
                return 0;
        }
    }
    _isset() {
        let n = this._tempNode(AstNodeType.Isset);
        let t = this._tokens.next();
        if (!this._tokens.consume('(')) {
            this._error(n, ['(']);
            return this._node(n);
        }
        let followOn = [',', ')'];
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ')') {
                this._tokens.next();
                break;
            }
            else {
                if (this._error(n, followOn, [')']).type === ')') {
                    this._tokens.next();
                }
                break;
            }
        }
        return this._node(n);
    }
    _keywordParenthesisedExpression(type) {
        let n = this._tempNode(type);
        let t = this._tokens.next();
        if (!this._tokens.consume('(')) {
            this._error(n, ['(']);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        this._followOnStack.push([')']);
        n.children.push(this._expression());
        this._followOnStack.pop();
        if (!this._tokens.consume(')')) {
            if (this._error(n, [')'], [')']).type === ')') {
                this._tokens.next();
            }
        }
        return this._node(n);
    }
    _keywordExpression(nodeType) {
        let n = this._tempNode(nodeType);
        this._tokens.next();
        n.children.push(this._expression());
        return this._node(n);
    }
    _yield() {
        let n = this._tempNode(AstNodeType.Yield);
        this._tokens.next();
        if (!this._isExpressionStartToken(this._tokens.peek())) {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._node(n);
        }
        this._followOnStack.push([lexer_1.TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._expression());
        this._followOnStack.pop();
        if (!this._tokens.consume(lexer_1.TokenType.T_DOUBLE_ARROW)) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        n.children.push(this._expression());
        return this._node(n);
    }
    _quotedEncapsulatedVariableList(type, closeTokenType) {
        let n = this._tempNode(type);
        this._tokens.next();
        this._followOnStack.push([closeTokenType]);
        n.children.push(this._encapsulatedVariableList(closeTokenType));
        this._followOnStack.pop();
        if (!this._tokens.consume(closeTokenType)) {
            if (this._error(n, [closeTokenType], [closeTokenType]).type === closeTokenType) {
                this._tokens.next();
            }
        }
        return this._node(n);
    }
    _encapsulatedVariableList(breakOn) {
        let n = this._tempNode(AstNodeType.EncapsulatedVariableList);
        let followOn = [
            lexer_1.TokenType.T_ENCAPSED_AND_WHITESPACE, lexer_1.TokenType.T_VARIABLE,
            lexer_1.TokenType.T_DOLLAR_OPEN_CURLY_BRACES, lexer_1.TokenType.T_CURLY_OPEN, breakOn
        ];
        this._followOnStack.push(followOn);
        while (true) {
            switch (this._tokens.peek().type) {
                case lexer_1.TokenType.T_ENCAPSED_AND_WHITESPACE:
                    n.children.push(this._nodeFactory(this._tokens.next()));
                    continue;
                case lexer_1.TokenType.T_VARIABLE:
                    let t = this._tokens.peek(1);
                    if (t.type === '[') {
                        n.children.push(this._encapsulatedDimension());
                    }
                    else if (t.type === lexer_1.TokenType.T_OBJECT_OPERATOR) {
                        n.children.push(this._encapsulatedProperty());
                    }
                    else {
                        n.children.push(this._simpleVariable());
                    }
                    continue;
                case lexer_1.TokenType.T_DOLLAR_OPEN_CURLY_BRACES:
                    n.children.push(this._dollarCurlyOpenEncapsulatedVariable());
                    continue;
                case lexer_1.TokenType.T_CURLY_OPEN:
                    n.children.push(this._curlyOpenEncapsulatedVariable());
                    continue;
                case breakOn:
                    break;
                default:
                    if (followOn.indexOf(this._error(n, followOn).type) === -1) {
                        break;
                    }
            }
            break;
        }
        this._followOnStack.pop();
        return this._node(n);
    }
    _curlyOpenEncapsulatedVariable() {
        let errNode = this._tempNode(AstNodeType.ErrorVariable);
        this._tokens.next();
        this._followOnStack.push(['}']);
        errNode.children.push(this._variable());
        this._followOnStack.pop();
        if (this._tokens.consume('}')) {
            return errNode.children.pop();
        }
        else {
            if (this._error(errNode, ['}'], ['}']).type === '}') {
                this._tokens.next();
            }
            return this._node(errNode);
        }
    }
    _dollarCurlyOpenEncapsulatedVariable() {
        let errNode = this._tempNode(AstNodeType.ErrorVariable);
        let n;
        this._tokens.next();
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_STRING_VARNAME) {
            if (this._tokens.peek(1).type === '[') {
                n = this._tempNode(AstNodeType.Dimension);
                n.children.push(this._simpleVariable());
                this._tokens.next();
                this._followOnStack.push([']', '}']);
                n.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume(']')) {
                    if (this._error(n, [']'], [']', '}']).type === ']') {
                        this._tokens.next();
                    }
                }
            }
            else {
                n = this._tempNode(AstNodeType.Variable);
                n.children.push(this._nodeFactory(this._tokens.next()));
            }
            errNode.children.push(this._node(n));
        }
        else if (this._isExpressionStartToken(t)) {
            this._followOnStack.push(['}']);
            errNode.children.push(this._expression());
            this._followOnStack.pop();
        }
        else {
            this._error(errNode, [], ['}']);
        }
        if (this._tokens.consume('}')) {
            return errNode.value.errors.length ? this._node(errNode) : errNode.children.pop();
        }
        else {
            if (this._error(errNode, ['}'], ['}']).type === '}') {
                this._tokens.next();
            }
            return this._node(errNode);
        }
    }
    _encapsulatedDimension() {
        let n = this._tempNode(AstNodeType.Dimension);
        n.children.push(this._simpleVariable());
        this._tokens.next();
        this._followOnStack.push([']']);
        switch (this._tokens.peek().type) {
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NUM_STRING:
                n.children.push(this._nodeFactory(this._tokens.next()));
                break;
            case lexer_1.TokenType.T_VARIABLE:
                n.children.push(this._simpleVariable());
                break;
            case '-':
                let unary = this._tempNode(AstNodeType.UnaryMinus);
                this._tokens.next();
                if (this._tokens.consume(lexer_1.TokenType.T_NUM_STRING)) {
                    unary.children.push(this._nodeFactory(this._tokens.current));
                }
                else {
                    this._error(unary, [lexer_1.TokenType.T_NUM_STRING]);
                }
                n.children.push(this._node(unary));
                break;
            default:
                n.children.push(this._nodeFactory(null));
                this._error(n, [
                    lexer_1.TokenType.T_STRING, lexer_1.TokenType.T_NUM_STRING, lexer_1.TokenType.T_VARIABLE, '-'
                ]);
                break;
        }
        this._followOnStack.pop();
        if (!this._tokens.consume(']')) {
            if (this._error(n, [']'], [']']).type === ']') {
                this._tokens.next();
            }
        }
        return this._node(n);
    }
    _encapsulatedProperty() {
        let n = this._tempNode(AstNodeType.Property);
        n.children.push(this._simpleVariable());
        this._tokens.next();
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            this._error(n, [lexer_1.TokenType.T_STRING]);
        }
        return this._node(n);
    }
    _heredoc() {
        let n = this._tempNode(AstNodeType.Heredoc);
        let t = this._tokens.next();
        this._followOnStack.push([lexer_1.TokenType.T_END_HEREDOC]);
        n.children.push(this._encapsulatedVariableList(lexer_1.TokenType.T_END_HEREDOC));
        this._followOnStack.pop();
        if (!this._tokens.consume(lexer_1.TokenType.T_END_HEREDOC)) {
            if (this._error(n, [lexer_1.TokenType.T_END_HEREDOC], [lexer_1.TokenType.T_END_HEREDOC]).type === lexer_1.TokenType.T_END_HEREDOC) {
                this._tokens.next();
            }
        }
        return this._node(n);
    }
    _anonymousClassDeclaration() {
        let n = this._tempNode(AstNodeType.AnonymousClassDeclaration);
        this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;
        if (this._tokens.peek().type === '(') {
            this._followOnStack.push([lexer_1.TokenType.T_EXTENDS, lexer_1.TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._argumentList());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        if (this._tokens.consume(lexer_1.TokenType.T_EXTENDS)) {
            this._followOnStack.push([lexer_1.TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._name());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        if (this._tokens.consume(lexer_1.TokenType.T_IMPLEMENTS)) {
            this._followOnStack.push(['{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        n.children.push(this._classStatementList());
        return this._node(n);
    }
    _classStatementList() {
        let n = this._tempNode(AstNodeType.ClassStatementList);
        let t;
        if (!this._tokens.consume('{')) {
            this._error(n, ['{']);
            return this._node(n);
        }
        let followOn = recoverClassStatementStartTokenTypes.slice(0);
        followOn.push('}');
        while (true) {
            t = this._tokens.peek();
            if (t.type === '}') {
                this._tokens.next();
                break;
            }
            else if (this._isClassStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._classStatement());
                this._followOnStack.pop();
            }
            else {
                t = this._error(n, followOn, followOn);
                if (!this._isClassStatementStartToken(t) && t.type !== '}') {
                    break;
                }
            }
        }
        return this._node(n);
    }
    _isClassStatementStartToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_PUBLIC:
            case lexer_1.TokenType.T_PROTECTED:
            case lexer_1.TokenType.T_PRIVATE:
            case lexer_1.TokenType.T_STATIC:
            case lexer_1.TokenType.T_ABSTRACT:
            case lexer_1.TokenType.T_FINAL:
            case lexer_1.TokenType.T_FUNCTION:
            case lexer_1.TokenType.T_VAR:
            case lexer_1.TokenType.T_CONST:
            case lexer_1.TokenType.T_USE:
                return true;
            default:
                return false;
        }
    }
    _classStatement() {
        let n = this._tempNode(AstNodeType.ErrorClassStatement);
        let t = this._tokens.peek();
        switch (t.type) {
            case lexer_1.TokenType.T_PUBLIC:
            case lexer_1.TokenType.T_PROTECTED:
            case lexer_1.TokenType.T_PRIVATE:
            case lexer_1.TokenType.T_STATIC:
            case lexer_1.TokenType.T_ABSTRACT:
            case lexer_1.TokenType.T_FINAL:
                n.value.flag = this._memberModifierList();
                t = this._tokens.peek();
                if (t.type === lexer_1.TokenType.T_VARIABLE) {
                    return this._propertyDeclarationStatement(n);
                }
                else if (t.type === lexer_1.TokenType.T_FUNCTION) {
                    return this._methodDeclarationStatement(n);
                }
                else if (t.type === lexer_1.TokenType.T_CONST) {
                    return this._classConstantDeclarationStatement(n);
                }
                else {
                    this._error(n, [lexer_1.TokenType.T_VARIABLE, lexer_1.TokenType.T_FUNCTION, lexer_1.TokenType.T_CONST]);
                    return this._node(n);
                }
            case lexer_1.TokenType.T_FUNCTION:
                return this._methodDeclarationStatement(n);
            case lexer_1.TokenType.T_VAR:
                this._tokens.next();
                n.value.flag = AstNodeFlag.ModifierPublic;
                return this._propertyDeclarationStatement(n);
            case lexer_1.TokenType.T_CONST:
                n.value.flag = AstNodeFlag.ModifierPublic;
                return this._classConstantDeclarationStatement(n);
            case lexer_1.TokenType.T_USE:
                return this._useTraitStatement();
            default:
                throw new Error(`Unexpected token ${t.type}`);
        }
    }
    _useTraitStatement() {
        let n = this._tempNode(AstNodeType.UseTrait);
        let t = this._tokens.next();
        this._followOnStack.push([';', '{']);
        n.children.push(this._nameList());
        this._followOnStack.pop();
        n.children.push(this._traitAdaptationList());
        return this._node(n);
    }
    _traitAdaptationList() {
        let n = this._tempNode(AstNodeType.TraitAdaptationList);
        let t;
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
            if (t.type === '}') {
                this._tokens.next();
                break;
            }
            else if (t.type === lexer_1.TokenType.T_STRING ||
                t.type === lexer_1.TokenType.T_NAMESPACE ||
                t.type === lexer_1.TokenType.T_NS_SEPARATOR ||
                this._isSemiReservedToken(t)) {
                n.children.push(this._traitAdaptation());
            }
            else {
                t = this._error(n, [
                    '}', lexer_1.TokenType.T_STRING, lexer_1.TokenType.T_NAMESPACE, lexer_1.TokenType.T_NS_SEPARATOR
                ]);
                if (t.type !== '}') {
                    break;
                }
            }
        }
        this._followOnStack.pop();
        return this._node(n);
    }
    _traitAdaptation() {
        let n = this._tempNode(AstNodeType.ErrorTraitAdaptation);
        let t = this._tokens.peek();
        let t2 = this._tokens.peek(1);
        if (t.type === lexer_1.TokenType.T_NAMESPACE ||
            t.type === lexer_1.TokenType.T_NS_SEPARATOR ||
            (t.type === lexer_1.TokenType.T_STRING &&
                (t2.type === lexer_1.TokenType.T_PAAMAYIM_NEKUDOTAYIM || t2.type === lexer_1.TokenType.T_NS_SEPARATOR))) {
            this._followOnStack.push([lexer_1.TokenType.T_INSTEADOF, lexer_1.TokenType.T_AS]);
            n.children.push(this._methodReference());
            this._followOnStack.pop();
            if (this._tokens.consume(lexer_1.TokenType.T_INSTEADOF)) {
                return this._traitPrecedence(n);
            }
        }
        else if (t.type === lexer_1.TokenType.T_STRING || this._isSemiReservedToken(t)) {
            let methodRef = this._tempNode(AstNodeType.MethodReference, n.value.range.start);
            methodRef.children.push(this._nodeFactory(null), this._nodeFactory(this._tokens.next()));
            n.children.push(this._node(methodRef));
        }
        else {
            this._error(n, [lexer_1.TokenType.T_NAMESPACE, lexer_1.TokenType.T_NS_SEPARATOR, lexer_1.TokenType.T_STRING]);
            return this._node(n);
        }
        return this._traitAlias(n);
    }
    _traitAlias(n) {
        if (this._tokens.consume(lexer_1.TokenType.T_AS)) {
            this._error(n, [lexer_1.TokenType.T_AS]);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_STRING || this._isReservedToken(t)) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        }
        else if (t.type === lexer_1.TokenType.T_PUBLIC || t.type === lexer_1.TokenType.T_PROTECTED || t.type === lexer_1.TokenType.T_PRIVATE) {
            n.value.flag = this._memberModifierToFlag(this._tokens.next());
            t = this._tokens.peek();
            if (t.type === lexer_1.TokenType.T_STRING || this._isSemiReservedToken(t)) {
                n.children.push(this._nodeFactory(this._tokens.next()));
            }
            else {
                n.children.push(this._nodeFactory(null));
            }
        }
        else {
            this._error(n, [lexer_1.TokenType.T_STRING, lexer_1.TokenType.T_PUBLIC, lexer_1.TokenType.T_PROTECTED, lexer_1.TokenType.T_PRIVATE]);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        if (!this._tokens.consume(';')) {
            if (this._error(n, [';'], [';']).type === ';') {
                this._tokens.next();
            }
        }
        return this._node(n);
    }
    _traitPrecedence(n) {
        n.value.type = AstNodeType.TraitPrecendence;
        this._followOnStack.push([';']);
        n.children.push(this._nameList());
        this._followOnStack.pop();
        if (!this._tokens.consume(';')) {
            if (this._error(n, [';'], [';']).type === ';') {
                this._tokens.next();
            }
        }
        return this._node(n);
    }
    _methodReference() {
        let n = this._tempNode(AstNodeType.MethodReference, this._startPos());
        this._followOnStack.push([lexer_1.TokenType.T_PAAMAYIM_NEKUDOTAYIM]);
        n.children.push(this._name());
        this._followOnStack.pop();
        if (this._tokens.consume(lexer_1.TokenType.T_PAAMAYIM_NEKUDOTAYIM)) {
            this._error(n, [lexer_1.TokenType.T_PAAMAYIM_NEKUDOTAYIM], [lexer_1.TokenType.T_STRING]);
        }
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_STRING || this._isSemiReservedToken(t)) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_STRING]);
        }
        return this._node(n, this._endPos());
    }
    _methodDeclarationStatement(n) {
        n.value.type = AstNodeType.MethodDeclaration;
        this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;
        if (this._tokens.consume('&')) {
            n.value.flag |= AstNodeFlag.ReturnsRef;
        }
        let t = this._tokens.peek();
        if (t.type !== lexer_1.TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            this._error(n, [lexer_1.TokenType.T_STRING], [';', ':', '{', '(']);
            n.children.push(this._nodeFactory(null));
        }
        else {
            n.children.push(this._nodeFactory(this._tokens.next()));
        }
        this._followOnStack.push([':', ';', '{']);
        n.children.push(this._parameterList());
        this._followOnStack.pop();
        if (this._tokens.peek().type === ':') {
            n.children.push(this._returnType());
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        t = this._tokens.peek();
        if (t.type === ';' && (n.value.flag & AstNodeFlag.ModifierAbstract)) {
            this._tokens.next();
            n.children.push(this._nodeFactory(null));
        }
        else if (t.type === '{') {
            this._tokens.next();
            this._followOnStack.push(['}']);
            n.children.push(this._innerStatementList(['}']));
            this._followOnStack.pop();
            if (!this._tokens.consume('}')) {
                if (this._error(n, ['}'], ['}']).type === '}') {
                    this._tokens.next();
                }
            }
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [';', '{']);
        }
        return this._node(n);
    }
    _innerStatementList(breakOn, tempNode = null) {
        let n = tempNode ? tempNode : this._tempNode(AstNodeType.InnerStatementList);
        let t;
        let followOn = recoverInnerStatementStartTokenTypes;
        while (true) {
            t = this._tokens.peek();
            if (this._isInnerStatementStartToken(t)) {
                this._followOnStack.push(followOn);
                n.children.push(this._innerStatement());
                this._followOnStack.pop();
            }
            else if (breakOn.indexOf(t.type) !== -1) {
                break;
            }
            else {
                t = this._error(n, followOn, followOn);
                if (t.type === ';') {
                    this._tokens.next();
                }
                else if (!this._isInnerStatementStartToken(t) && breakOn.indexOf(t.type) === -1) {
                    break;
                }
            }
        }
        if (!tempNode) {
            return this._node(n);
        }
    }
    _innerStatement() {
        let t = this._tokens.peek();
        switch (t.type) {
            case lexer_1.TokenType.T_FUNCTION:
                return this._functionDeclarationStatement();
            case lexer_1.TokenType.T_ABSTRACT:
            case lexer_1.TokenType.T_FINAL:
            case lexer_1.TokenType.T_CLASS:
                return this._classDeclarationStatement();
            case lexer_1.TokenType.T_TRAIT:
                return this._traitDeclarationStatement();
            case lexer_1.TokenType.T_INTERFACE:
                return this._interfaceDeclarationStatement();
            default:
                return this._statement();
        }
    }
    _interfaceDeclarationStatement() {
        let n = this._tempNode(AstNodeType.InterfaceDeclaration);
        let t = this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_STRING], [lexer_1.TokenType.T_EXTENDS, '{']);
        }
        if (this._tokens.consume(lexer_1.TokenType.T_EXTENDS)) {
            this._followOnStack.push(['{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        n.children.push(this._classStatementList());
        return this._node(n);
    }
    _traitDeclarationStatement() {
        let n = this._tempNode(AstNodeType.TraitDeclaration);
        let t = this._tokens.next();
        n.value.doc = this._tokens.lastDocComment;
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_STRING], ['{']);
        }
        n.children.push(this._classStatementList());
        return this._node(n);
    }
    _functionDeclarationStatement() {
        let n = this._tempNode(AstNodeType.FunctionDeclaration);
        this._tokens.next();
        if (this._tokens.consume('&')) {
            n.value.flag = AstNodeFlag.ReturnsRef;
        }
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_STRING], ['(', ':', '{']);
        }
        n.children.push(this._parameterList());
        if (this._tokens.consume(':')) {
            this._followOnStack.push(['{']);
            n.children.push(this._returnType());
            this._followOnStack.pop();
        }
        else {
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
            if (this._error(n, ['}'], ['}']).type === '}') {
                this._tokens.next();
            }
        }
        return this._node(n);
    }
    _classDeclarationStatement() {
        let n = this._tempNode(AstNodeType.ClassDeclaration);
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_ABSTRACT || t.type === lexer_1.TokenType.T_FINAL) {
            n.value.flag = this._classModifiers();
        }
        if (!this._tokens.consume(lexer_1.TokenType.T_CLASS)) {
            this._error(n, [lexer_1.TokenType.T_CLASS], [lexer_1.TokenType.T_STRING, lexer_1.TokenType.T_EXTENDS, lexer_1.TokenType.T_IMPLEMENTS, '{']);
        }
        n.value.doc = this._tokens.lastDocComment;
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            this._error(n, [lexer_1.TokenType.T_STRING], [lexer_1.TokenType.T_EXTENDS, lexer_1.TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._nodeFactory(null));
        }
        if (this._tokens.consume(lexer_1.TokenType.T_EXTENDS)) {
            this._followOnStack.push([lexer_1.TokenType.T_IMPLEMENTS, '{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        if (this._tokens.consume(lexer_1.TokenType.T_IMPLEMENTS)) {
            this._followOnStack.push(['{']);
            n.children.push(this._nameList());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        n.children.push(this._classStatementList());
        return this._node(n);
    }
    _classModifiers() {
        let flag = 0;
        let t;
        while (true) {
            t = this._tokens.peek();
            if (t.type === lexer_1.TokenType.T_ABSTRACT || t.type === lexer_1.TokenType.T_FINAL) {
                flag |= this._memberModifierToFlag(this._tokens.next());
            }
            else {
                break;
            }
        }
        return flag;
    }
    _statement() {
        let t = this._tokens.peek();
        switch (t.type) {
            case '{':
                let n = this._tempNode(AstNodeType.InnerStatementList);
                this._tokens.next();
                this._followOnStack.push(['}']);
                this._innerStatementList(['}'], n);
                this._followOnStack.pop();
                if (!this._tokens.consume('}')) {
                    if (this._error(n, ['}'], ['}']).type === '}') {
                        this._tokens.next();
                    }
                }
                return this._node(n);
            case lexer_1.TokenType.T_IF:
                return this._ifStatementList();
            case lexer_1.TokenType.T_WHILE:
                return this._whileStatement();
            case lexer_1.TokenType.T_DO:
                return this._doWhileStatement();
            case lexer_1.TokenType.T_FOR:
                return this._forStatement();
            case lexer_1.TokenType.T_SWITCH:
                return this._switchStatement();
            case lexer_1.TokenType.T_BREAK:
                return this._keywordOptionalExpressionStatement(AstNodeType.Break);
            case lexer_1.TokenType.T_CONTINUE:
                return this._keywordOptionalExpressionStatement(AstNodeType.Continue);
            case lexer_1.TokenType.T_RETURN:
                return this._keywordOptionalExpressionStatement(AstNodeType.Return);
            case lexer_1.TokenType.T_GLOBAL:
                return this._globalVariableDeclarationStatement();
            case lexer_1.TokenType.T_STATIC:
                return this._staticVariableDeclarationStatement();
            case lexer_1.TokenType.T_ECHO:
                return this._echoStatement();
            case lexer_1.TokenType.T_INLINE_HTML:
                let echo = this._tempNode(AstNodeType.Echo, this._startPos());
                echo.children.push(this._nodeFactory(this._tokens.next()));
                return this._node(echo, this._endPos());
            case lexer_1.TokenType.T_UNSET:
                return this._unsetStatement();
            case lexer_1.TokenType.T_FOREACH:
                return this._foreachStatement();
            case lexer_1.TokenType.T_DECLARE:
                return this._declareStatement();
            case lexer_1.TokenType.T_TRY:
                return this._try();
            case lexer_1.TokenType.T_THROW:
                return this._throwStatement();
            case lexer_1.TokenType.T_GOTO:
                return this._gotoStatement();
            case ';':
                let empty = this._tempNode(AstNodeType.EmptyStatement);
                this._tokens.next();
                return this._node(empty);
            case lexer_1.TokenType.T_STRING:
                if (this._tokens.peek(1).type === ':') {
                    return this._labelStatement();
                }
            default:
                return this._expressionStatement();
        }
    }
    _try() {
        let n = this._tempNode(AstNodeType.Try);
        let t = this._tokens.next();
        if (!this._tokens.consume('{')) {
            this._error(n, ['{'], [...recoverInnerStatementStartTokenTypes, '{', '}', lexer_1.TokenType.T_CATCH, lexer_1.TokenType.T_FINALLY]);
            this._tokens.consume('{');
            this._tokens.consume(';');
        }
        this._followOnStack.push(['}', lexer_1.TokenType.T_CATCH, lexer_1.TokenType.T_FINALLY]);
        n.children.push(this._innerStatementList(['}']));
        this._followOnStack.pop();
        if (!this._tokens.consume('}')) {
            this._error(n, ['}'], ['}', lexer_1.TokenType.T_CATCH, lexer_1.TokenType.T_FINALLY]);
            this._tokens.consume('}');
        }
        this._followOnStack.push([lexer_1.TokenType.T_FINALLY]);
        n.children.push(this._catchList());
        this._followOnStack.pop();
        if (this._tokens.peek().type === lexer_1.TokenType.T_FINALLY) {
            n.children.push(this._finallyStatement());
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        return this._node(n);
    }
    _catchList() {
        let n = this._tempNode(AstNodeType.CatchList);
        this._followOnStack.push([lexer_1.TokenType.T_CATCH]);
        while (true) {
            if (this._tokens.peek().type === lexer_1.TokenType.T_CATCH) {
                n.children.push(this._catchStatement());
            }
            else {
                break;
            }
        }
        this._followOnStack.pop();
        return this._node(n);
    }
    _finallyStatement() {
        let n = this._tempNode(AstNodeType.InnerStatementList);
        let t = this._tokens.next();
        if (!this._tokens.consume('{')) {
            this._error(n, ['{'], [...recoverInnerStatementStartTokenTypes, '{', '}']);
            this._tokens.consume('{');
            this._tokens.consume(';');
        }
        this._followOnStack.push(['}']);
        this._innerStatementList(['}'], n);
        this._followOnStack.pop();
        if (!this._tokens.consume('}')) {
            this._error(n, ['}'], ['}']);
            this._tokens.consume('}');
        }
        return this._node(n);
    }
    _catchStatement() {
        let n = this._tempNode(AstNodeType.Catch);
        this._tokens.next();
        if (!this._tokens.consume('(')) {
            this._error(n, ['('], ['{', ')', lexer_1.TokenType.T_VARIABLE]);
            n.children.push(this._nodeFactory(null));
        }
        this._followOnStack.push([lexer_1.TokenType.T_VARIABLE, ')', '{']);
        n.children.push(this._catchNameList());
        this._followOnStack.pop();
        if (this._tokens.consume(lexer_1.TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            this._error(n, [lexer_1.TokenType.T_VARIABLE], [')', '{']);
            n.children.push(this._nodeFactory(null));
        }
        if (!this._tokens.consume(')')) {
            this._error(n, [')'], ['{']);
        }
        if (!this._tokens.consume('{')) {
            this._error(n, ['{'], ['}']);
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
    _catchNameList() {
        let n = this._tempNode(AstNodeType.NameList);
        let followOn = ['|'];
        let t;
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._name());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === '|') {
                this._tokens.next();
            }
            else if (t.type === ')') {
                break;
            }
            else {
                this._error(n, ['|', ')']);
                break;
            }
        }
        return this._node(n);
    }
    _declareStatement() {
        let n = this._tempNode(AstNodeType.Declare);
        this._tokens.next();
        if (this._tokens.consume('(')) {
            this._followOnStack.push([')']);
            n.children.push(this._declareConstantDeclarationList());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, ['('], [...recoverStatementStartTokenTypes, ':', ')']);
        }
        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }
        let t = this._tokens.peek();
        if (t.type === ':') {
            this._tokens.next();
            this._followOnStack.push([lexer_1.TokenType.T_ENDDECLARE, ';']);
            n.children.push(this._innerStatementList([lexer_1.TokenType.T_ENDDECLARE]));
            this._followOnStack.pop();
            if (!this._tokens.consume(lexer_1.TokenType.T_ENDDECLARE)) {
                this._error(n, [lexer_1.TokenType.T_ENDDECLARE], [';']);
            }
            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        }
        else if (this._isStatementStartToken(t)) {
            n.children.push(this._statement());
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, []);
        }
        return this._node(n);
    }
    _declareConstantDeclarationList() {
        let n = this._tempNode(AstNodeType.ConstantDeclarationList);
        let followOn = [','];
        let t;
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._constantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ')') {
                break;
            }
            else {
                this._error(n, [',', ')']);
                break;
            }
        }
        return this._node(n);
    }
    _switchStatement() {
        let n = this._tempNode(AstNodeType.Switch);
        this._tokens.next();
        if (this._tokens.consume('(')) {
            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }
        else {
            this._error(n, ['('], [':', '{', lexer_1.TokenType.T_CASE, lexer_1.TokenType.T_DEFAULT]);
            n.children.push(this._nodeFactory(null));
        }
        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [':', '{', lexer_1.TokenType.T_CASE, lexer_1.TokenType.T_DEFAULT]);
        }
        if (!this._tokens.consume('{') && !this._tokens.consume(':')) {
            this._error(n, ['{', ':'], [lexer_1.TokenType.T_CASE, lexer_1.TokenType.T_DEFAULT, '}', lexer_1.TokenType.T_ENDSWITCH]);
        }
        this._tokens.consume(';');
        this._followOnStack.push(['}', lexer_1.TokenType.T_ENDSWITCH]);
        n.children.push(this._caseStatementList());
        this._followOnStack.pop();
        let t = this._tokens.peek();
        if (t.type === '}') {
            this._tokens.next();
        }
        else if (t.type === lexer_1.TokenType.T_ENDSWITCH) {
            this._tokens.next();
            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        }
        else {
            this._error(n, ['}', lexer_1.TokenType.T_ENDSWITCH], ['}', ';']);
            this._tokens.consume('}');
            this._tokens.consume(';');
        }
        return this._node(n);
    }
    _caseStatementList() {
        let n = this._tempNode(AstNodeType.CaseList);
        let followOn = [lexer_1.TokenType.T_CASE, lexer_1.TokenType.T_DEFAULT];
        let t;
        let breakOn = ['}', lexer_1.TokenType.T_ENDSWITCH];
        while (true) {
            t = this._tokens.peek();
            if (t.type === lexer_1.TokenType.T_CASE || t.type === lexer_1.TokenType.T_DEFAULT) {
                this._followOnStack.push(followOn);
                n.children.push(this._caseStatement());
                this._followOnStack.pop();
            }
            else if (breakOn.indexOf(t.type) !== -1) {
                break;
            }
            else {
                let recover = [lexer_1.TokenType.T_CASE, lexer_1.TokenType.T_DEFAULT, '}', lexer_1.TokenType.T_ENDSWITCH];
                if (recover.indexOf(this._error(n, recover, recover).type) === -1) {
                    break;
                }
            }
        }
        return this._node(n);
    }
    _caseStatement() {
        let n = this._tempNode(AstNodeType.Case);
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_CASE) {
            this._tokens.next();
            this._followOnStack.push([';', ':']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }
        else if (t.type === lexer_1.TokenType.T_DEFAULT) {
            this._tokens.next();
            n.children.push(this._nodeFactory(null));
        }
        else {
            throw new Error(`Unexpected token ${this._tokens.peek().type}`);
        }
        if (!this._tokens.consume(':') && !this._tokens.consume(';')) {
            this._error(n, [';', ':'], recoverInnerStatementStartTokenTypes);
            this._tokens.consume(';');
        }
        if (this._isInnerStatementStartToken(this._tokens.peek())) {
            n.children.push(this._innerStatementList(['}', lexer_1.TokenType.T_ENDSWITCH, lexer_1.TokenType.T_CASE, lexer_1.TokenType.T_DEFAULT]));
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        return this._node(n);
    }
    _labelStatement() {
        let n = this._tempNode(AstNodeType.Label);
        n.children.push(this._nodeFactory(this._tokens.next()));
        this._tokens.next();
        return this._node(n);
    }
    _gotoStatement() {
        let n = this._tempNode(AstNodeType.Goto);
        let t = this._tokens.next();
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_STRING], [';']);
        }
        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }
        return this._node(n);
    }
    _throwStatement() {
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
    _foreachStatement() {
        let n = this._tempNode(AstNodeType.Foreach);
        let t = this._tokens.next();
        if (this._tokens.consume('(')) {
            this._followOnStack.push([')', lexer_1.TokenType.T_AS, lexer_1.TokenType.T_DOUBLE_ARROW]);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }
        else {
            this._error(n, ['('], [...recoverStatementStartTokenTypes, ':', ')', lexer_1.TokenType.T_AS, lexer_1.TokenType.T_DOUBLE_ARROW]);
            n.children.push(this._nodeFactory(null));
        }
        if (!this._tokens.consume(lexer_1.TokenType.T_AS)) {
            this._error(n, [lexer_1.TokenType.T_AS], [')', lexer_1.TokenType.T_DOUBLE_ARROW]);
        }
        this._followOnStack.push([')', lexer_1.TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._foreachVariable());
        if (this._tokens.consume(lexer_1.TokenType.T_DOUBLE_ARROW)) {
            n.children.push(this._foreachVariable());
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        this._followOnStack.pop();
        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }
        t = this._tokens.peek();
        if (t.type === ':') {
            this._tokens.next();
            this._followOnStack.push([lexer_1.TokenType.T_ENDFOREACH, ';']);
            n.children.push(this._innerStatementList([lexer_1.TokenType.T_ENDFOREACH]));
            this._followOnStack.pop();
            if (!this._tokens.consume(lexer_1.TokenType.T_ENDFOREACH)) {
                this._error(n, [lexer_1.TokenType.T_ENDFOREACH], [';']);
            }
            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        }
        else if (this._isStatementStartToken(t)) {
            n.children.push(this._statement());
        }
        else {
            this._error(n, []);
            n.children.push(this._nodeFactory(null));
        }
        return this._node(n);
    }
    _foreachVariable() {
        switch (this._tokens.peek().type) {
            case '&':
                let unary = this._tempNode(AstNodeType.UnaryReference);
                this._tokens.next();
                unary.children.push(this._variable());
                return this._node(unary);
            case lexer_1.TokenType.T_LIST:
                return this._listExpression();
            case '[':
                return this._shortArray();
            default:
                if (this._isVariableStartToken(this._tokens.peek())) {
                    return this._variable();
                }
                else {
                    let err = this._tempNode(AstNodeType.Error);
                    this._error(err, ['&', lexer_1.TokenType.T_LIST, '[', lexer_1.TokenType.T_VARIABLE]);
                    return this._node(err);
                }
        }
    }
    _isVariableStartToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_VARIABLE:
            case '$':
            case '(':
            case lexer_1.TokenType.T_ARRAY:
            case '[':
            case lexer_1.TokenType.T_CONSTANT_ENCAPSED_STRING:
            case lexer_1.TokenType.T_STATIC:
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NAMESPACE:
            case lexer_1.TokenType.T_NS_SEPARATOR:
                return true;
            default:
                return false;
        }
    }
    _unsetStatement() {
        let n = this._tempNode(AstNodeType.Unset);
        let t = this._tokens.next();
        if (!this._tokens.consume('(')) {
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
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ')') {
                this._tokens.next();
                break;
            }
            else {
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
    _echoStatement() {
        let n = this._tempNode(AstNodeType.Echo);
        let t;
        this._tokens.next();
        let followOn = [',', ';'];
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ';') {
                this._tokens.next();
                break;
            }
            else {
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }
        }
        return this._node(n);
    }
    _staticVariableDeclarationStatement() {
        let n = this._tempNode(AstNodeType.StaticVariableList);
        let t;
        this._tokens.next();
        let followOn = [',', ';'];
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._staticVariableDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ';') {
                this._tokens.next();
                break;
            }
            else {
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }
        }
        return this._node(n);
    }
    _globalVariableDeclarationStatement() {
        let n = this._tempNode(AstNodeType.GlobalVariableList);
        let t = this._tokens.next();
        let followOn = [',', ';'];
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._simpleVariable());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ';') {
                this._tokens.next();
                break;
            }
            else {
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }
        }
        return this._node(n);
    }
    _staticVariableDeclaration() {
        let n = this._tempNode(AstNodeType.StaticVariable);
        if (this._tokens.peek().type === lexer_1.TokenType.T_VARIABLE) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        }
        else {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_VARIABLE]);
            return this._node(n);
        }
        if (!this._tokens.consume('=')) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        n.children.push(this._expression());
        return this._node(n);
    }
    _keywordOptionalExpressionStatement(nodeType) {
        let n = this._tempNode(nodeType);
        this._tokens.next();
        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([';']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }
        return this._node(n);
    }
    _forStatement() {
        let n = this._tempNode(AstNodeType.For);
        this._tokens.next();
        if (!this._tokens.consume('(')) {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null), this._nodeFactory(null), this._nodeFactory(null));
            this._error(n, ['(']);
            return this._node(n);
        }
        for (let k = 0; k < 2; ++k) {
            if (this._isExpressionStartToken(this._tokens.peek())) {
                this._followOnStack.push([';', ')']);
                n.children.push(this._forExpressionList(';'));
                this._followOnStack.pop();
            }
            else {
                n.children.push(this._nodeFactory(null));
            }
            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [...recoverStatementStartTokenTypes, ':', ')']);
                break;
            }
        }
        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
            this._tokens.consume(';');
        }
        if (this._tokens.consume(':')) {
            this._followOnStack.push([lexer_1.TokenType.T_ENDFOR, ';']);
            n.children.push(this._innerStatementList([lexer_1.TokenType.T_ENDFOR]));
            this._followOnStack.pop();
            if (!this._tokens.consume(lexer_1.TokenType.T_ENDFOR)) {
                this._error(n, [lexer_1.TokenType.T_ENDFOR], [';']);
            }
            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        }
        else if (this._isStatementStartToken(this._tokens.peek())) {
            n.children.push(this._statement());
        }
        else {
            this._error(n, []);
            n.children.push(this._nodeFactory(null));
        }
        return this._node(n);
    }
    _forExpressionList(breakOn) {
        let n = this._tempNode(AstNodeType.ForExpressionList);
        let followOn = [',', breakOn];
        let t;
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._expression());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type == breakOn) {
                break;
            }
            else {
                this._error(n, followOn);
                break;
            }
        }
        return this._node(n);
    }
    _doWhileStatement() {
        let n = this._tempNode(AstNodeType.DoWhile);
        this._tokens.next();
        this._followOnStack.push([lexer_1.TokenType.T_WHILE, ';']);
        n.children.push(this._statement());
        this._followOnStack.pop();
        if (!this._tokens.consume(lexer_1.TokenType.T_WHILE)) {
            n.children.push(this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_WHILE], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }
        if (!this._tokens.consume('(')) {
            n.children.push(this._nodeFactory(null));
            this._error(n, ['('], [';']);
            this._tokens.consume(';');
            return this._node(n);
        }
        this._followOnStack.push([')', ';']);
        n.children.push(this._expression());
        this._followOnStack.pop();
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
    _whileStatement() {
        let n = this._tempNode(AstNodeType.While);
        this._tokens.next();
        if (!this._tokens.consume('(')) {
            this._followOnStack.push([')']);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }
        else {
            this._error(n, ['('], [...recoverStatementStartTokenTypes, ')', ':']);
            n.children.push(this._nodeFactory(null));
        }
        if (!this._tokens.consume(')')) {
            this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
        }
        if (this._tokens.consume(':')) {
            this._followOnStack.push([lexer_1.TokenType.T_ENDWHILE, ';']);
            n.children.push(this._innerStatementList([lexer_1.TokenType.T_ENDWHILE]));
            this._followOnStack.pop();
            if (!this._tokens.consume(lexer_1.TokenType.T_ENDWHILE)) {
                this._error(n, [lexer_1.TokenType.T_ENDWHILE], [';']);
            }
            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        }
        else if (this._isStatementStartToken(this._tokens.peek())) {
            n.children.push(this._statement());
        }
        else {
            this._error(n, []);
        }
        return this._node(n);
    }
    _ifStatementList() {
        let n = this._tempNode(AstNodeType.IfList);
        let discoverAlt = { isAlt: false };
        let followOn = [lexer_1.TokenType.T_ELSEIF, lexer_1.TokenType.T_ELSE, lexer_1.TokenType.T_ENDIF];
        this._followOnStack.push(followOn);
        n.children.push(this._ifStatement(false, discoverAlt));
        this._followOnStack.pop();
        let t;
        this._followOnStack.push(followOn);
        while (true) {
            t = this._tokens.peek();
            if (t.type === lexer_1.TokenType.T_ELSEIF || t.type === lexer_1.TokenType.T_ELSE) {
                n.children.push(this._ifStatement(discoverAlt.isAlt));
            }
            else {
                break;
            }
        }
        this._followOnStack.pop();
        if (discoverAlt.isAlt) {
            if (!this._tokens.consume(lexer_1.TokenType.T_ENDIF)) {
                this._error(n, [lexer_1.TokenType.T_ENDIF], [';']);
            }
            if (!this._tokens.consume(';')) {
                this._error(n, [';'], [';']);
                this._tokens.consume(';');
            }
        }
        return this._node(n);
    }
    _ifStatement(isAlt, discoverAlt = null) {
        let n = this._tempNode(AstNodeType.If);
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_IF || t.type === lexer_1.TokenType.T_ELSEIF) {
            this._tokens.next();
            if (this._tokens.consume('(')) {
                this._followOnStack.push([')']);
                n.children.push(this._expression());
                this._followOnStack.pop();
            }
            else {
                this._error(n, ['('], [...recoverStatementStartTokenTypes, ')', ':']);
                n.children.push(this._nodeFactory(null));
            }
            if (!this._tokens.consume(')')) {
                this._error(n, [')'], [...recoverStatementStartTokenTypes, ':']);
            }
        }
        else if (t.type === lexer_1.TokenType.T_ELSE) {
            this._tokens.next();
            n.children.push(this._nodeFactory(null));
        }
        else {
            throw new Error(`Unexpected token ${this._tokens.peek().type}`);
        }
        if ((isAlt || discoverAlt) && this._tokens.consume(':')) {
            if (discoverAlt) {
                discoverAlt.isAlt = true;
            }
            n.children.push(this._innerStatementList([lexer_1.TokenType.T_ENDIF, lexer_1.TokenType.T_ELSEIF, lexer_1.TokenType.T_ELSE]));
        }
        else if (this._isStatementStartToken(this._tokens.peek())) {
            n.children.push(this._statement());
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, []);
        }
        return this._node(n);
    }
    _expressionStatement() {
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
    _returnType() {
        this._tokens.next();
        return this._typeExpression();
    }
    _typeExpression() {
        let n = this._tempNode(AstNodeType.TypeExpression);
        if (this._tokens.consume('?')) {
            n.value.flag = AstNodeFlag.Nullable;
        }
        switch (this._tokens.peek().type) {
            case lexer_1.TokenType.T_CALLABLE:
            case lexer_1.TokenType.T_ARRAY:
                n.children.push(this._nodeFactory(this._tokens.next()));
                break;
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NAMESPACE:
            case lexer_1.TokenType.T_NS_SEPARATOR:
                n.children.push(this._name());
                break;
            default:
                this._error(n, [lexer_1.TokenType.T_CALLABLE, lexer_1.TokenType.T_ARRAY, lexer_1.TokenType.T_STRING, lexer_1.TokenType.T_NAMESPACE, lexer_1.TokenType.T_NS_SEPARATOR]);
                break;
        }
        return this._node(n);
    }
    _classConstantDeclarationStatement(n) {
        n.value.type = AstNodeType.ClassConstantDeclarationList;
        this._tokens.next();
        let followOn = [';', ','];
        let t;
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._classConstantDeclaration());
            this._followOnStack.pop();
            t = this._tokens.next();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ';') {
                this._tokens.next();
                break;
            }
            else {
                this._error(n, followOn, [';']);
                this._tokens.consume(';');
                break;
            }
        }
        return this._node(n);
    }
    _isExpressionStartToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_VARIABLE:
            case '$':
            case lexer_1.TokenType.T_ARRAY:
            case '[':
            case lexer_1.TokenType.T_CONSTANT_ENCAPSED_STRING:
            case lexer_1.TokenType.T_NS_SEPARATOR:
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NAMESPACE:
            case '(':
            case lexer_1.TokenType.T_STATIC:
            case lexer_1.TokenType.T_INC:
            case lexer_1.TokenType.T_DEC:
            case '+':
            case '-':
            case '!':
            case '~':
            case '@':
            case lexer_1.TokenType.T_INT_CAST:
            case lexer_1.TokenType.T_DOUBLE_CAST:
            case lexer_1.TokenType.T_STRING_CAST:
            case lexer_1.TokenType.T_ARRAY_CAST:
            case lexer_1.TokenType.T_OBJECT_CAST:
            case lexer_1.TokenType.T_BOOL_CAST:
            case lexer_1.TokenType.T_UNSET_CAST:
            case lexer_1.TokenType.T_LIST:
            case lexer_1.TokenType.T_CLONE:
            case lexer_1.TokenType.T_NEW:
            case lexer_1.TokenType.T_DNUMBER:
            case lexer_1.TokenType.T_LNUMBER:
            case lexer_1.TokenType.T_LINE:
            case lexer_1.TokenType.T_FILE:
            case lexer_1.TokenType.T_DIR:
            case lexer_1.TokenType.T_TRAIT_C:
            case lexer_1.TokenType.T_METHOD_C:
            case lexer_1.TokenType.T_FUNC_C:
            case lexer_1.TokenType.T_NS_C:
            case lexer_1.TokenType.T_CLASS_C:
            case lexer_1.TokenType.T_START_HEREDOC:
            case '"':
            case '`':
            case lexer_1.TokenType.T_PRINT:
            case lexer_1.TokenType.T_YIELD:
            case lexer_1.TokenType.T_YIELD_FROM:
            case lexer_1.TokenType.T_FUNCTION:
            case lexer_1.TokenType.T_INCLUDE:
            case lexer_1.TokenType.T_INCLUDE_ONCE:
            case lexer_1.TokenType.T_REQUIRE:
            case lexer_1.TokenType.T_REQUIRE_ONCE:
            case lexer_1.TokenType.T_EVAL:
            case lexer_1.TokenType.T_EMPTY:
            case lexer_1.TokenType.T_ISSET:
                return true;
            default:
                return false;
        }
    }
    _classConstantDeclaration() {
        let n = this._tempNode(AstNodeType.ClassConstantDeclarationList);
        let t = this._tokens.peek();
        if (t.type !== lexer_1.TokenType.T_STRING && !this._isSemiReservedToken(t)) {
            this._error(n, [lexer_1.TokenType.T_STRING]);
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            return this._node(n);
        }
        n.children.push(this._nodeFactory(this._tokens.next()));
        n.value.doc = this._tokens.lastDocComment;
        if (!this._tokens.consume('=')) {
            this._error(n, ['=']);
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        n.children.push(this._expression());
        return this._node(n);
    }
    _propertyDeclarationStatement(n) {
        let t;
        n.value.type = AstNodeType.PropertyDeclarationList;
        let followOn = [';', ','];
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._propertyDeclaration());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ';') {
                this._tokens.next();
                break;
            }
            else {
                this._error(n, [',', ';'], [';']);
                this._tokens.consume(';');
                break;
            }
        }
        return this._node(n);
    }
    _propertyDeclaration() {
        let n = this._tempNode(AstNodeType.PropertyDeclaration);
        if (!this._tokens.consume(lexer_1.TokenType.T_VARIABLE)) {
            this._error(n, [lexer_1.TokenType.T_VARIABLE]);
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
    _memberModifierList() {
        let flags = 0, flag = 0;
        while (true) {
            flag = this._memberModifierToFlag(this._tokens.peek());
            if (flag) {
                this._tokens.next();
                flags |= flag;
            }
            else {
                break;
            }
        }
        return flags;
    }
    _memberModifierToFlag(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_PUBLIC:
                return AstNodeFlag.ModifierPublic;
            case lexer_1.TokenType.T_PROTECTED:
                return AstNodeFlag.ModifierProtected;
            case lexer_1.TokenType.T_PRIVATE:
                return AstNodeFlag.ModifierPrivate;
            case lexer_1.TokenType.T_STATIC:
                return AstNodeFlag.ModifierStatic;
            case lexer_1.TokenType.T_ABSTRACT:
                return AstNodeFlag.ModifierAbstract;
            case lexer_1.TokenType.T_FINAL:
                return AstNodeFlag.ModifierFinal;
            default:
                return 0;
        }
    }
    _nameList() {
        let n = this._tempNode(AstNodeType.NameList);
        while (true) {
            n.children.push(this._name());
            if (!this._tokens.consume(',')) {
                break;
            }
        }
        return this._node(n);
    }
    _newExpression() {
        let n = this._tempNode(AstNodeType.New);
        this._tokens.next();
        if (this._tokens.peek().type === lexer_1.TokenType.T_CLASS) {
            n.children.push(this._anonymousClassDeclaration());
            return this._node(n);
        }
        this._followOnStack.push(['(']);
        n.children.push(this._newVariable());
        this._followOnStack.pop();
        if (this._tokens.peek().type === '(') {
            n.children.push(this._argumentList());
        }
        return this._node(n);
    }
    _newVariable() {
        let n;
        let startPos = this._startPos();
        let part = this._newVariablePart();
        let propName;
        while (true) {
            switch (this._tokens.peek().type) {
                case '[':
                case '{':
                    part = this._dimension(part, startPos);
                    continue;
                case lexer_1.TokenType.T_OBJECT_OPERATOR:
                    n = this._tempNode(AstNodeType.Property, startPos);
                    this._tokens.next();
                    n.children.push(part, this._propertyName());
                    part = this._node(n, this._endPos());
                    continue;
                case lexer_1.TokenType.T_PAAMAYIM_NEKUDOTAYIM:
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
    _newVariablePart() {
        let t = this._tokens.peek();
        let n = this._tempNode(AstNodeType.ErrorVariable);
        switch (t.type) {
            case lexer_1.TokenType.T_STATIC:
                n.value.type = AstNodeType.Name;
                n.value.flag = AstNodeFlag.NameNotFq;
                n.children.push(this._nodeFactory(this._tokens.next()));
                return this._node(n);
            case lexer_1.TokenType.T_VARIABLE:
            case '$':
                return this._simpleVariable();
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NAMESPACE:
            case lexer_1.TokenType.T_NS_SEPARATOR:
                return this._name();
            default:
                this._error(n, [lexer_1.TokenType.T_STATIC, lexer_1.TokenType.T_VARIABLE, '$', lexer_1.TokenType.T_STRING,
                    lexer_1.TokenType.T_NAMESPACE, lexer_1.TokenType.T_NS_SEPARATOR]);
                return this._node(n, this._endPos());
        }
    }
    _cloneExpression() {
        let n = this._tempNode(AstNodeType.Clone);
        this._tokens.next();
        n.children.push(this._expression());
        return this._node(n);
    }
    _listExpression() {
        let n = this._tempNode(AstNodeType.ArrayPairList);
        let t = this._tokens.next();
        if (!this._tokens.consume('(')) {
            this._error(n, ['('], [')']);
            this._tokens.consume(')');
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
    _unaryExpression() {
        let n = this._tempNode(AstNodeType.Error);
        let t = this._tokens.next();
        n.value.type = this._unaryOpToNodeType(t);
        if (n.value.type === AstNodeType.UnaryPreDec ||
            n.value.type === AstNodeType.UnaryPreInc ||
            n.value.type === AstNodeType.UnaryReference) {
            n.children.push(this._variable());
        }
        else {
            n.children.push(this._expression(this._opPrecedenceMap[t.text][0]));
        }
        return this._node(n);
    }
    _closure() {
        let n = this._tempNode(AstNodeType.Closure);
        if (this._tokens.consume(lexer_1.TokenType.T_STATIC)) {
            n.value.flag = AstNodeFlag.ModifierStatic;
        }
        this._tokens.next();
        if (this._tokens.consume('&')) {
            n.value.flag |= AstNodeFlag.ReturnsRef;
        }
        this._followOnStack.push([lexer_1.TokenType.T_USE, ':', '{']);
        n.children.push(this._parameterList());
        this._followOnStack.pop();
        if (this._tokens.peek().type === lexer_1.TokenType.T_USE) {
            this._followOnStack.push([':', '{']);
            n.children.push(this._closureUse());
            this._followOnStack.pop();
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        if (this._tokens.peek().type === ':') {
            this._followOnStack.push(['{']);
            n.children.push(this._returnType());
            this._followOnStack.pop();
        }
        else {
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
    _closureUse() {
        let n = this._tempNode(AstNodeType.ClosureUseList);
        let t = this._tokens.next();
        if (!this._tokens.consume('(')) {
            this._error(n, ['('], [')']);
            this._tokens.consume(')');
            return this._node(n);
        }
        let followOn = [',', ')'];
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._closureUseVariable());
            this._followOnStack.pop();
            t = this._tokens.next();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ')') {
                this._tokens.next();
                break;
            }
            else {
                this._error(n, followOn, [')']);
                this._tokens.consume(')');
                break;
            }
        }
        return this._node(n);
    }
    _closureUseVariable() {
        let n = this._tempNode(AstNodeType.ClosureUseVariable);
        if (this._tokens.consume('&')) {
            n.value.flag = AstNodeFlag.PassByRef;
        }
        if (this._tokens.consume(lexer_1.TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            this._error(n, [lexer_1.TokenType.T_VARIABLE]);
        }
        return this._node(n);
    }
    _parameterList() {
        let n = this._tempNode(AstNodeType.ParameterList);
        let t;
        if (!this._tokens.consume('(')) {
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
            n.children.push(this._parameter());
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === ')') {
                this._tokens.next();
                break;
            }
            else {
                this._error(n, followOn, [')']);
                this._tokens.consume(')');
                break;
            }
        }
        return this._node(n);
    }
    _isTypeExpressionStartToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_NS_SEPARATOR:
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NAMESPACE:
            case '?':
            case lexer_1.TokenType.T_ARRAY:
            case lexer_1.TokenType.T_CALLABLE:
                return true;
            default:
                return false;
        }
    }
    _parameter() {
        let n = this._tempNode(AstNodeType.Parameter);
        if (this._isTypeExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push(['&', lexer_1.TokenType.T_ELLIPSIS, lexer_1.TokenType.T_VARIABLE]);
            n.children.push(this._typeExpression());
            this._followOnStack.pop();
        }
        if (this._tokens.consume('&')) {
            n.value.flag = AstNodeFlag.PassByRef;
        }
        if (this._tokens.consume(lexer_1.TokenType.T_ELLIPSIS)) {
            n.value.flag = AstNodeFlag.Variadic;
        }
        if (this._tokens.consume(lexer_1.TokenType.T_VARIABLE)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            n.children.push(this._nodeFactory(null), this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_VARIABLE]);
            return this._node(n);
        }
        if (this._tokens.consume('=')) {
            n.children.push(this._expression());
        }
        else {
            n.children.push(this._nodeFactory(null));
        }
        return this._node(n);
    }
    _variable() {
        let startPos = this._startPos();
        this._variableAtomType = 0;
        let variableAtom = this._variableAtom();
        let count = 0;
        while (true) {
            ++count;
            switch (this._tokens.peek().type) {
                case lexer_1.TokenType.T_PAAMAYIM_NEKUDOTAYIM:
                    variableAtom = this._staticMember(variableAtom, startPos);
                    continue;
                case lexer_1.TokenType.T_OBJECT_OPERATOR:
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
                        let errNode = this._tempNode(AstNodeType.ErrorVariable, startPos);
                        errNode.children.push(variableAtom);
                        this._error(errNode, [lexer_1.TokenType.T_PAAMAYIM_NEKUDOTAYIM, lexer_1.TokenType.T_OBJECT_OPERATOR, '[', '{', '(']);
                        return this._node(errNode);
                    }
                    break;
            }
            break;
        }
        return variableAtom;
    }
    _staticMember(lhs, startPos) {
        let n = this._tempNode(AstNodeType.ErrorStaticMember, startPos);
        n.children.push(lhs);
        this._tokens.next();
        let t = this._tokens.peek();
        switch (t.type) {
            case '{':
                n.value.type = AstNodeType.StaticMethodCall;
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
            case lexer_1.TokenType.T_VARIABLE:
                n.children.push(this._simpleVariable());
                n.value.type = AstNodeType.StaticProperty;
                break;
            case lexer_1.TokenType.T_STRING:
                n.children.push(this._nodeFactory(this._tokens.next()));
                n.value.type = AstNodeType.ClassConstant;
                break;
            default:
                if (this._isSemiReservedToken(t)) {
                    n.children.push(this._nodeFactory(this._tokens.next()));
                    n.value.type = AstNodeType.ClassConstant;
                    break;
                }
                else {
                    this._error(n, ['{', '$', lexer_1.TokenType.T_VARIABLE, lexer_1.TokenType.T_STRING]);
                    return this._node(n);
                }
        }
        t = this._tokens.peek();
        if (t.type === '(') {
            n.children.push(this._argumentList());
            n.value.type = AstNodeType.StaticMethodCall;
            return this._node(n);
        }
        else if (n.value.type === AstNodeType.StaticMethodCall) {
            this._error(n, ['(']);
            n.children.push(this._nodeFactory(null));
        }
        return this._node(n);
    }
    _instanceMember(lhs, startPos) {
        let n = this._tempNode(AstNodeType.Property, startPos);
        n.children.push(lhs);
        this._tokens.next();
        n.children.push(this._propertyName());
        if (this._tokens.consume('(')) {
            n.children.push(this._argumentList());
            n.value.type = AstNodeType.MethodCall;
        }
        return this._node(n);
    }
    _propertyName() {
        switch (this._tokens.peek().type) {
            case lexer_1.TokenType.T_STRING:
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
            case lexer_1.TokenType.T_VARIABLE:
                return this._simpleVariable();
            default:
                let e = this._tempNode(AstNodeType.Error);
                this._error(e, [lexer_1.TokenType.T_STRING, '{', '$']);
                return this._node(e);
        }
    }
    _dimension(lhs, startPos) {
        let n = this._tempNode(AstNodeType.Dimension, startPos);
        let close = this._tokens.peek().type === '[' ? ']' : '}';
        n.children.push(lhs);
        this._tokens.next();
        if (this._isExpressionStartToken(this._tokens.peek())) {
            this._followOnStack.push([close]);
            n.children.push(this._expression());
            this._followOnStack.pop();
        }
        if (!this._tokens.consume(close)) {
            this._error(n, [close], [close]);
            this._tokens.consume(close);
        }
        return this._node(n);
    }
    _argumentList() {
        let n = this._tempNode(AstNodeType.ArgumentList);
        let t;
        if (!this._tokens.consume('(')) {
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
            if (t.type === ')') {
                this._tokens.next();
                break;
            }
            else if (t.type === ',') {
                this._tokens.next();
            }
            else {
                this._error(n, followOn, [')']);
                this._tokens.consume(')');
                break;
            }
        }
        return this._node(n);
    }
    _isArgumentStartToken(t) {
        return t.type === lexer_1.TokenType.T_ELLIPSIS || this._isExpressionStartToken(t);
    }
    _argument() {
        let n = this._tempNode(AstNodeType.ErrorArgument);
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_ELLIPSIS) {
            this._tokens.next();
            n.value.type = AstNodeType.Unpack;
            n.children.push(this._expression());
            return this._node(n);
        }
        else if (this._isExpressionStartToken(t)) {
            return this._expression();
        }
        else {
            this._error(n, []);
            return this._node(n);
        }
    }
    _name() {
        let n = this._tempNode(AstNodeType.Name);
        if (this._tokens.consume(lexer_1.TokenType.T_NS_SEPARATOR)) {
            n.value.flag = AstNodeFlag.NameFq;
        }
        else if (this._tokens.consume(lexer_1.TokenType.T_NAMESPACE)) {
            n.value.flag = AstNodeFlag.NameRelative;
            if (!this._tokens.consume(lexer_1.TokenType.T_NS_SEPARATOR)) {
                if (this._error(n, [lexer_1.TokenType.T_NS_SEPARATOR], [lexer_1.TokenType.T_STRING]).type !== lexer_1.TokenType.T_STRING) {
                    n.children.push(this._nodeFactory(null));
                    return this._node(n);
                }
            }
        }
        else {
            n.value.flag = AstNodeFlag.NameNotFq;
        }
        n.children.push(this._namespaceName());
        return this._node(n);
    }
    _shortArray() {
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
    _longArray() {
        let n = this._tempNode(AstNodeType.ArrayPairList);
        this._tokens.next();
        if (!this._tokens.consume('(')) {
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
    _isArrayPairStartToken(t) {
        return t.type === '&' || this._isExpressionStartToken(t);
    }
    _arrayPairList(n, breakOn) {
        let t;
        let followOn = [','];
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
            }
            else if (t.type === breakOn) {
                break;
            }
            else {
                if (this._error(n, followOn, [',']).type === ',' &&
                    this._tokens.peek(1).type !== breakOn) {
                    this._tokens.next();
                    continue;
                }
                break;
            }
        }
        return n;
    }
    _arrayPair() {
        let n = this._tempNode(AstNodeType.ArrayPair);
        if (this._tokens.peek().type === '&') {
            n.children.push(this._unaryExpression(), this._nodeFactory(null));
            return this._node(n);
        }
        this._followOnStack.push([lexer_1.TokenType.T_DOUBLE_ARROW]);
        n.children.push(this._expression());
        this._followOnStack.pop();
        if (!this._tokens.consume(lexer_1.TokenType.T_DOUBLE_ARROW)) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        if (this._tokens.peek().type === '&') {
            n.children.push(this._unaryExpression());
            return this._node(n);
        }
        n.children.push(this._expression());
        return this._node(n);
    }
    _variableAtom() {
        let n;
        switch (this._tokens.peek().type) {
            case lexer_1.TokenType.T_VARIABLE:
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
            case lexer_1.TokenType.T_ARRAY:
                this._variableAtomType = AstNodeType.ArrayPairList;
                return this._longArray();
            case '[':
                this._variableAtomType = AstNodeType.ArrayPairList;
                return this._shortArray();
            case lexer_1.TokenType.T_CONSTANT_ENCAPSED_STRING:
                return this._nodeFactory(this._tokens.next());
            case lexer_1.TokenType.T_STATIC:
                this._variableAtomType = AstNodeType.Name;
                n = this._tempNode(AstNodeType.Name);
                n.value.flag = AstNodeFlag.NameNotFq;
                n.children.push(this._nodeFactory(this._tokens.next()));
                return this._node(n);
            case lexer_1.TokenType.T_STRING:
            case lexer_1.TokenType.T_NAMESPACE:
            case lexer_1.TokenType.T_NS_SEPARATOR:
                this._variableAtomType = AstNodeType.Name;
                return this._name();
            default:
                this._variableAtomType = AstNodeType.ErrorVariable;
                n = this._tempNode(AstNodeType.ErrorVariable);
                this._error(n, [lexer_1.TokenType.T_VARIABLE, '$', '(', '[', lexer_1.TokenType.T_ARRAY, lexer_1.TokenType.T_CONSTANT_ENCAPSED_STRING,
                    lexer_1.TokenType.T_STATIC, lexer_1.TokenType.T_STRING, lexer_1.TokenType.T_NAMESPACE, lexer_1.TokenType.T_NS_SEPARATOR]);
                return this._node(n);
        }
    }
    _simpleVariable() {
        let n = this._tempNode(AstNodeType.Variable);
        let t = this._tokens.peek();
        if (t.type === lexer_1.TokenType.T_VARIABLE) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        }
        else if (t.type === '$') {
            this._tokens.next();
            t = this._tokens.peek();
            if (t.type === '{') {
                this._tokens.next();
                this._followOnStack.push(['}']);
                n.children.push(this._expression());
                this._followOnStack.pop();
                if (!this._tokens.consume('}')) {
                    this._error(n, ['}'], ['}']);
                    this._tokens.consume('}');
                }
            }
            else if (t.type === '$' || t.type === lexer_1.TokenType.T_VARIABLE) {
                n.children.push(this._simpleVariable());
            }
            else {
                this._error(n, ['{', '$', lexer_1.TokenType.T_VARIABLE]);
            }
        }
        else {
            throw new Error(`Unexpected token ${t.type}`);
        }
        return this._node(n);
    }
    _isBinaryOpToken(t) {
        return this._opPrecedenceMap.hasOwnProperty(t.text) && (this._opPrecedenceMap[t.text][2] & OpType.Binary) === OpType.Binary;
    }
    _haltCompilerStatement() {
        let n = this._tempNode(AstNodeType.HaltCompiler);
        this._tokens.next();
        let expected = ['(', ')', ';'];
        let t;
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
    _useStatement() {
        let n = this._tempNode(AstNodeType.UseList);
        this._tokens.next();
        if (this._tokens.consume(lexer_1.TokenType.T_FUNCTION)) {
            n.value.flag = AstNodeFlag.UseFunction;
        }
        else if (this._tokens.consume(lexer_1.TokenType.T_CONST)) {
            n.value.flag = AstNodeFlag.UseConstant;
        }
        let useElement = this._tempNode(AstNodeType.UseElement);
        this._tokens.consume(lexer_1.TokenType.T_NS_SEPARATOR);
        this._followOnStack.push([lexer_1.TokenType.T_NS_SEPARATOR, ',', ';']);
        let namespaceName = this._namespaceName();
        this._followOnStack.pop();
        let t = this._tokens.peek();
        if (this._tokens.consume(lexer_1.TokenType.T_NS_SEPARATOR) || t.type === '{') {
            if (t.type === '{') {
                n.value.errors.push(new parseError_1.ParseError(t, [lexer_1.TokenType.T_NS_SEPARATOR]));
            }
            n.value.type = AstNodeType.UseGroup;
            n.children.push(namespaceName);
            return this._useGroup(n);
        }
        if (!n.value.flag) {
            n.value.flag = AstNodeFlag.UseClass;
        }
        useElement.children.push(namespaceName);
        this._followOnStack.push([',', ';']);
        n.children.push(this._useElement(useElement, false, true));
        this._followOnStack.pop();
        if (this._tokens.consume(',')) {
            this._followOnStack.push([';']);
            this._useList(n, false, true, ';');
            this._followOnStack.pop();
        }
        if (!this._tokens.consume(';')) {
            this._error(n, [';'], [';']);
            this._tokens.consume(';');
        }
        return this._node(n);
    }
    _useGroup(n) {
        if (!this._tokens.consume('{')) {
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
    _useList(n, isMixed, lookForPrefix, breakOn) {
        let t;
        let followOn = [','];
        while (true) {
            this._followOnStack.push(followOn);
            n.children.push(this._useElement(this._tempNode(AstNodeType.UseElement), isMixed, lookForPrefix));
            this._followOnStack.pop();
            t = this._tokens.peek();
            if (t.type === ',') {
                this._tokens.next();
            }
            else if (t.type === breakOn) {
                break;
            }
            else {
                if (this._error(n, [',', breakOn], [',']).type === ',') {
                    this._tokens.next();
                    continue;
                }
                break;
            }
        }
        return this._node(n);
    }
    _useElement(n, isMixed, lookForPrefix) {
        if (!n.children.length) {
            if (isMixed) {
                if (this._tokens.consume(lexer_1.TokenType.T_FUNCTION)) {
                    n.value.flag = AstNodeFlag.UseFunction;
                }
                else if (this._tokens.consume(lexer_1.TokenType.T_CONST)) {
                    n.value.flag = AstNodeFlag.UseConstant;
                }
                else {
                    n.value.flag = AstNodeFlag.UseClass;
                }
            }
            else if (lookForPrefix) {
                this._tokens.consume(lexer_1.TokenType.T_NS_SEPARATOR);
            }
            this._followOnStack.push([lexer_1.TokenType.T_AS]);
            n.children.push(this._namespaceName());
            this._followOnStack.pop();
        }
        if (!this._tokens.consume(lexer_1.TokenType.T_AS)) {
            n.children.push(this._nodeFactory(null));
            return this._node(n);
        }
        if (this._tokens.consume(lexer_1.TokenType.T_STRING)) {
            n.children.push(this._nodeFactory(this._tokens.current));
        }
        else {
            n.children.push(this._nodeFactory(null));
            this._error(n, [lexer_1.TokenType.T_STRING]);
        }
        return this._node(n);
    }
    _namespaceStatement() {
        let n = this._tempNode(AstNodeType.Namespace);
        this._tokens.next();
        this._tokens.lastDocComment;
        if (this._tokens.peek().type === lexer_1.TokenType.T_STRING) {
            this._followOnStack.push([';', '{']);
            n.children.push(this._namespaceName());
            this._followOnStack.pop();
            if (this._tokens.consume(';')) {
                n.children.push(this._nodeFactory(null));
                return this._node(n);
            }
        }
        if (!this._tokens.consume('{')) {
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
    _namespaceName() {
        let n = this._tempNode(AstNodeType.NamespaceName);
        if (this._tokens.peek().type === lexer_1.TokenType.T_STRING) {
            n.children.push(this._nodeFactory(this._tokens.next()));
        }
        else {
            this._error(n, [lexer_1.TokenType.T_STRING]);
            return this._node(n);
        }
        while (true) {
            if (this._tokens.peek().type === lexer_1.TokenType.T_NS_SEPARATOR &&
                this._tokens.peek(1).type === lexer_1.TokenType.T_STRING) {
                this._tokens.next();
                n.children.push(this._nodeFactory(this._tokens.next()));
            }
            else {
                break;
            }
        }
        return this._node(n);
    }
    _error(tempNode, expected, followOn) {
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
        tempNode.value.errors.push(new parseError_1.ParseError(unexpected, expected));
        return this._tokens.peek();
    }
    _isReservedToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_INCLUDE:
            case lexer_1.TokenType.T_INCLUDE_ONCE:
            case lexer_1.TokenType.T_EVAL:
            case lexer_1.TokenType.T_REQUIRE:
            case lexer_1.TokenType.T_REQUIRE_ONCE:
            case lexer_1.TokenType.T_LOGICAL_OR:
            case lexer_1.TokenType.T_LOGICAL_XOR:
            case lexer_1.TokenType.T_LOGICAL_AND:
            case lexer_1.TokenType.T_INSTANCEOF:
            case lexer_1.TokenType.T_NEW:
            case lexer_1.TokenType.T_CLONE:
            case lexer_1.TokenType.T_EXIT:
            case lexer_1.TokenType.T_IF:
            case lexer_1.TokenType.T_ELSEIF:
            case lexer_1.TokenType.T_ELSE:
            case lexer_1.TokenType.T_ENDIF:
            case lexer_1.TokenType.T_ECHO:
            case lexer_1.TokenType.T_DO:
            case lexer_1.TokenType.T_WHILE:
            case lexer_1.TokenType.T_ENDWHILE:
            case lexer_1.TokenType.T_FOR:
            case lexer_1.TokenType.T_ENDFOR:
            case lexer_1.TokenType.T_FOREACH:
            case lexer_1.TokenType.T_ENDFOREACH:
            case lexer_1.TokenType.T_DECLARE:
            case lexer_1.TokenType.T_ENDDECLARE:
            case lexer_1.TokenType.T_AS:
            case lexer_1.TokenType.T_TRY:
            case lexer_1.TokenType.T_CATCH:
            case lexer_1.TokenType.T_FINALLY:
            case lexer_1.TokenType.T_THROW:
            case lexer_1.TokenType.T_USE:
            case lexer_1.TokenType.T_INSTEADOF:
            case lexer_1.TokenType.T_GLOBAL:
            case lexer_1.TokenType.T_VAR:
            case lexer_1.TokenType.T_UNSET:
            case lexer_1.TokenType.T_ISSET:
            case lexer_1.TokenType.T_EMPTY:
            case lexer_1.TokenType.T_CONTINUE:
            case lexer_1.TokenType.T_GOTO:
            case lexer_1.TokenType.T_FUNCTION:
            case lexer_1.TokenType.T_CONST:
            case lexer_1.TokenType.T_RETURN:
            case lexer_1.TokenType.T_PRINT:
            case lexer_1.TokenType.T_YIELD:
            case lexer_1.TokenType.T_LIST:
            case lexer_1.TokenType.T_SWITCH:
            case lexer_1.TokenType.T_ENDSWITCH:
            case lexer_1.TokenType.T_CASE:
            case lexer_1.TokenType.T_DEFAULT:
            case lexer_1.TokenType.T_BREAK:
            case lexer_1.TokenType.T_ARRAY:
            case lexer_1.TokenType.T_CALLABLE:
            case lexer_1.TokenType.T_EXTENDS:
            case lexer_1.TokenType.T_IMPLEMENTS:
            case lexer_1.TokenType.T_NAMESPACE:
            case lexer_1.TokenType.T_TRAIT:
            case lexer_1.TokenType.T_INTERFACE:
            case lexer_1.TokenType.T_CLASS:
            case lexer_1.TokenType.T_CLASS_C:
            case lexer_1.TokenType.T_TRAIT_C:
            case lexer_1.TokenType.T_FUNC_C:
            case lexer_1.TokenType.T_METHOD_C:
            case lexer_1.TokenType.T_LINE:
            case lexer_1.TokenType.T_FILE:
            case lexer_1.TokenType.T_DIR:
            case lexer_1.TokenType.T_NS_C:
                return true;
            default:
                return false;
        }
    }
    _isSemiReservedToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_STATIC:
            case lexer_1.TokenType.T_ABSTRACT:
            case lexer_1.TokenType.T_FINAL:
            case lexer_1.TokenType.T_PRIVATE:
            case lexer_1.TokenType.T_PROTECTED:
            case lexer_1.TokenType.T_PUBLIC:
                return true;
            default:
                return this._isReservedToken(t);
        }
    }
    _isTopStatementStartToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_NAMESPACE:
            case lexer_1.TokenType.T_USE:
            case lexer_1.TokenType.T_HALT_COMPILER:
            case lexer_1.TokenType.T_CONST:
            case lexer_1.TokenType.T_FUNCTION:
            case lexer_1.TokenType.T_CLASS:
            case lexer_1.TokenType.T_ABSTRACT:
            case lexer_1.TokenType.T_FINAL:
            case lexer_1.TokenType.T_TRAIT:
            case lexer_1.TokenType.T_INTERFACE:
                return true;
            default:
                return this._isStatementStartToken(t);
        }
    }
    _isInnerStatementStartToken(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_FUNCTION:
            case lexer_1.TokenType.T_ABSTRACT:
            case lexer_1.TokenType.T_FINAL:
            case lexer_1.TokenType.T_CLASS:
            case lexer_1.TokenType.T_TRAIT:
            case lexer_1.TokenType.T_INTERFACE:
                return true;
            default:
                return this._isStatementStartToken(t);
        }
    }
    _isStatementStartToken(t) {
        switch (t.type) {
            case '{':
            case lexer_1.TokenType.T_IF:
            case lexer_1.TokenType.T_WHILE:
            case lexer_1.TokenType.T_DO:
            case lexer_1.TokenType.T_FOR:
            case lexer_1.TokenType.T_SWITCH:
            case lexer_1.TokenType.T_BREAK:
            case lexer_1.TokenType.T_CONTINUE:
            case lexer_1.TokenType.T_RETURN:
            case lexer_1.TokenType.T_GLOBAL:
            case lexer_1.TokenType.T_STATIC:
            case lexer_1.TokenType.T_ECHO:
            case lexer_1.TokenType.T_INLINE_HTML:
            case lexer_1.TokenType.T_UNSET:
            case lexer_1.TokenType.T_FOREACH:
            case lexer_1.TokenType.T_DECLARE:
            case lexer_1.TokenType.T_TRY:
            case lexer_1.TokenType.T_THROW:
            case lexer_1.TokenType.T_GOTO:
            case lexer_1.TokenType.T_STRING:
            case ';':
                return true;
            default:
                return this._isExpressionStartToken(t);
        }
    }
}
exports.Parser = Parser;
