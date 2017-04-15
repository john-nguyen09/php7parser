import { Token } from './lexer';
export declare const enum PhraseType {
    Unknown = 0,
    AdditiveExpression = 1,
    AnonymousClassDeclaration = 2,
    AnonymousClassDeclarationHeader = 3,
    AnonymousFunctionCreationExpression = 4,
    AnonymousFunctionHeader = 5,
    AnonymousFunctionUseClause = 6,
    AnonymousFunctionUseVariable = 7,
    ArgumentExpressionList = 8,
    ArrayCreationExpression = 9,
    ArrayElement = 10,
    ArrayInitialiserList = 11,
    ArrayKey = 12,
    ArrayValue = 13,
    BitwiseExpression = 14,
    BreakStatement = 15,
    ByRefAssignmentExpression = 16,
    CaseStatement = 17,
    CaseStatementList = 18,
    CastExpression = 19,
    CatchClause = 20,
    CatchClauseList = 21,
    CatchNameList = 22,
    ClassBaseClause = 23,
    ClassConstantAccessExpression = 24,
    ClassConstDeclaration = 25,
    ClassConstElement = 26,
    ClassConstElementList = 27,
    ClassDeclaration = 28,
    ClassDeclarationBody = 29,
    ClassDeclarationHeader = 30,
    ClassInterfaceClause = 31,
    ClassMemberDeclarationList = 32,
    ClassModifiers = 33,
    ClassTypeDesignator = 34,
    CloneExpression = 35,
    ClosureUseList = 36,
    CoalesceExpression = 37,
    CompoundAssignmentExpression = 38,
    CompoundStatement = 39,
    TernaryExpression = 40,
    ConstantAccessExpression = 41,
    ConstDeclaration = 42,
    ConstElement = 43,
    ConstElementList = 44,
    ContinueStatement = 45,
    DeclareDirective = 46,
    DeclareStatement = 47,
    DefaultStatement = 48,
    DoStatement = 49,
    DoubleQuotedStringLiteral = 50,
    EchoIntrinsic = 51,
    ElseClause = 52,
    ElseIfClause = 53,
    ElseIfClauseList = 54,
    EmptyIntrinsic = 55,
    EncapsulatedExpression = 56,
    EncapsulatedVariable = 57,
    EncapsulatedVariableList = 58,
    EqualityExpression = 59,
    ErrorClassMemberDeclaration = 60,
    ErrorClassTypeDesignatorAtom = 61,
    ErrorControlExpression = 62,
    ErrorExpression = 63,
    ErrorScopedAccessExpression = 64,
    ErrorTraitAdaptation = 65,
    ErrorVariable = 66,
    ErrorVariableAtom = 67,
    EvalIntrinsic = 68,
    ExitIntrinsic = 69,
    ExponentiationExpression = 70,
    ExpressionList = 71,
    ExpressionStatement = 72,
    FinallyClause = 73,
    ForControl = 74,
    ForeachCollection = 75,
    ForeachKey = 76,
    ForeachStatement = 77,
    ForeachValue = 78,
    ForEndOfLoop = 79,
    ForExpressionGroup = 80,
    ForInitialiser = 81,
    ForStatement = 82,
    FullyQualifiedName = 83,
    FunctionCallExpression = 84,
    FunctionDeclaration = 85,
    FunctionDeclarationBody = 86,
    FunctionDeclarationHeader = 87,
    FunctionStaticDeclaration = 88,
    FunctionStaticInitialiser = 89,
    GlobalDeclaration = 90,
    GotoStatement = 91,
    HaltCompilerStatement = 92,
    HeredocStringLiteral = 93,
    Identifier = 94,
    IfStatement = 95,
    IncludeExpression = 96,
    IncludeOnceExpression = 97,
    InlineText = 98,
    InstanceOfExpression = 99,
    InstanceofTypeDesignator = 100,
    InterfaceBaseClause = 101,
    InterfaceDeclaration = 102,
    InterfaceDeclarationBody = 103,
    InterfaceDeclarationHeader = 104,
    InterfaceMemberDeclarationList = 105,
    IssetIntrinsic = 106,
    ListIntrinsic = 107,
    LogicalExpression = 108,
    MemberModifierList = 109,
    MemberName = 110,
    MethodCallExpression = 111,
    MethodDeclaration = 112,
    MethodDeclarationBody = 113,
    MethodDeclarationHeader = 114,
    MethodReference = 115,
    MultiplicativeExpression = 116,
    NamedLabelStatement = 117,
    NamespaceAliasingClause = 118,
    NamespaceDefinition = 119,
    NamespaceName = 120,
    NamespaceUseClause = 121,
    NamespaceUseClauseList = 122,
    NamespaceUseDeclaration = 123,
    NamespaceUseGroupClause = 124,
    NamespaceUseGroupClauseList = 125,
    NullStatement = 126,
    ObjectCreationExpression = 127,
    ParameterDeclaration = 128,
    ParameterDeclarationList = 129,
    PostfixDecrementExpression = 130,
    PostfixIncrementExpression = 131,
    PrefixDecrementExpression = 132,
    PrefixIncrementExpression = 133,
    PrintIntrinsic = 134,
    PropertyAccessExpression = 135,
    PropertyDeclaration = 136,
    PropertyElement = 137,
    PropertyElementList = 138,
    PropertyInitialiser = 139,
    QualifiedName = 140,
    QualifiedNameList = 141,
    RelationalExpression = 142,
    RelativeQualifiedName = 143,
    RelativeScope = 144,
    RequireExpression = 145,
    RequireOnceExpression = 146,
    ReturnStatement = 147,
    ReturnType = 148,
    ScopedCallExpression = 149,
    ScopedMemberName = 150,
    ScopedPropertyAccessExpression = 151,
    ShellCommandExpression = 152,
    ShiftExpression = 153,
    SimpleAssignmentExpression = 154,
    SimpleVariable = 155,
    StatementList = 156,
    StaticVariableDeclaration = 157,
    StaticVariableDeclarationList = 158,
    SubscriptExpression = 159,
    SwitchStatement = 160,
    ThrowStatement = 161,
    TraitAdaptationList = 162,
    TraitAlias = 163,
    TraitDeclaration = 164,
    TraitDeclarationBody = 165,
    TraitDeclarationHeader = 166,
    TraitMemberDeclarationList = 167,
    TraitPrecedence = 168,
    TraitUseClause = 169,
    TraitUseSpecification = 170,
    TryStatement = 171,
    TypeDeclaration = 172,
    UnaryOpExpression = 173,
    UnsetIntrinsic = 174,
    VariableList = 175,
    VariableNameList = 176,
    VariadicUnpacking = 177,
    WhileStatement = 178,
    YieldExpression = 179,
    YieldFromExpression = 180,
}
export interface Phrase {
    phraseType: PhraseType;
    children: (Phrase | Token)[];
    errors?: ParseError[];
}
export interface BinaryExpression extends Phrase {
    left: Phrase | Token;
    operator: Token;
    right: Phrase | Token;
}
export interface UnaryExpression extends Phrase {
    operator: Token;
    operand: Phrase | Token;
}
export interface ScriptInclusion extends Phrase {
    expr: Phrase | Token;
}
export interface TypeDeclarationBody<T> extends Phrase {
    memberList?: T;
}
export interface ScopedExpression extends Phrase {
    scope: Phrase | Token;
    memberName: ScopedMemberName;
}
export interface ObjectAccessExpression extends Phrase {
    variable: Phrase | Token;
    memberName: MemberName | Token;
}
export interface List<T> extends Phrase {
    elements: T[];
}
export interface TypeDesignator extends Phrase {
    type: Phrase | Token;
}
export interface AdditiveExpression extends BinaryExpression {
}
export interface AnonymousClassDeclaration extends Phrase {
    header: AnonymousClassDeclarationHeader;
    body: ClassDeclarationBody;
}
export interface AnonymousClassDeclarationHeader extends Phrase {
    argumentList?: ArgumentExpressionList;
    baseClause?: ClassBaseClause;
    interfaceClause?: ClassInterfaceClause;
}
export interface AnonymousFunctionCreationExpression extends Phrase {
    header: AnonymousFunctionHeader;
    body: CompoundStatement;
}
export interface AnonymousFunctionHeader extends Phrase {
    modifier?: Token;
    returnsRef?: Token;
    parameterList?: ParameterDeclarationList;
    useClause?: AnonymousFunctionUseClause;
    returnType?: ReturnType;
}
export interface AnonymousFunctionUseClause extends Phrase {
    useList: ClosureUseList;
}
export interface AnonymousFunctionUseVariable extends Phrase {
    byRef?: Token;
    name: Token;
}
export interface ArgumentExpressionList extends List<Phrase | Token> {
}
export interface ArrayCreationExpression extends Phrase {
    initialiserList?: ArrayInitialiserList;
}
export interface ArrayElement extends Phrase {
    key?: ArrayKey;
    value: ArrayValue;
}
export interface ArrayInitialiserList extends List<ArrayElement> {
}
export interface ArrayKey extends Phrase {
    expr: Phrase | Token;
}
export interface ArrayValue extends Phrase {
    byRef?: Token;
    expr: Phrase | Token;
}
export interface BitwiseExpression extends BinaryExpression {
}
export interface BreakStatement extends Phrase {
    expr?: Phrase | Token;
}
export interface ByRefAssignmentExpression extends BinaryExpression {
}
export interface CaseStatement extends Phrase {
    expr: Phrase | Token;
    statementList?: StatementList;
}
export interface CaseStatementList extends List<CaseStatement | DefaultStatement> {
}
export interface CastExpression extends UnaryExpression {
}
export interface CatchClause extends Phrase {
    nameList: CatchNameList;
    variable: Token;
    block: CompoundStatement;
}
export interface CatchClauseList extends List<CatchClause> {
}
export interface CatchNameList extends List<QualifiedName> {
}
export interface ClassBaseClause extends Phrase {
    name: QualifiedName;
}
export interface ClassConstantAccessExpression extends ScopedExpression {
}
export interface ClassConstDeclaration extends Phrase {
    modifierList: MemberModifierList;
    constElementList: ClassConstElementList;
}
export interface ClassConstElement extends Phrase {
    name: Identifier;
    value: Phrase | Token;
}
export interface ClassConstElementList extends List<ClassConstElement> {
}
export interface ClassDeclaration extends Phrase {
    header: ClassDeclarationHeader;
    body: ClassDeclarationBody;
}
export interface ClassDeclarationBody extends TypeDeclarationBody<ClassMemberDeclarationList> {
}
export interface ClassDeclarationHeader extends Phrase {
    modifier?: Token;
    name: Token;
    baseClause?: ClassBaseClause;
    interfaceClause?: ClassInterfaceClause;
}
export interface ClassInterfaceClause extends Phrase {
    nameList: QualifiedNameList;
}
export interface ClassMemberDeclarationList extends List<Phrase> {
}
export interface ClassTypeDesignator extends TypeDesignator {
}
export interface CloneExpression extends Phrase {
    expr: Phrase | Token;
}
export interface ClosureUseList extends List<AnonymousFunctionUseVariable> {
}
export interface CoalesceExpression extends BinaryExpression {
}
export interface CompoundAssignmentExpression extends BinaryExpression {
}
export interface CompoundStatement extends Phrase {
    statementList?: StatementList;
}
export interface TernaryExpression extends Phrase {
    testExpr: Phrase | Token;
    trueExpr?: Phrase | Token;
    falseExpr: Phrase | Token;
}
export interface ConstantAccessExpression extends Phrase {
    name: QualifiedName;
}
export interface ConstDeclaration extends Phrase {
    constElementList: ConstElementList;
}
export interface ConstElement extends Phrase {
    name: Token;
    value: Phrase | Token;
}
export interface ConstElementList extends List<ConstElement> {
}
export interface ContinueStatement extends Phrase {
    expr?: Phrase | Token;
}
export interface DeclareDirective extends Phrase {
    name: Token;
    value: Token;
}
export interface DeclareStatement extends Phrase {
    directive: DeclareDirective;
    statement: Phrase | Token;
}
export interface DefaultStatement extends Phrase {
    statementList?: StatementList;
}
export interface DoStatement extends Phrase {
    statement: Phrase | Token;
    expr: Phrase | Token;
}
export interface DoubleQuotedStringLiteral extends Phrase {
    encapsulatedVariableList: Phrase;
}
export interface EchoIntrinsic extends Phrase {
    exprList: ExpressionList;
}
export interface ElseClause extends Phrase {
    statement: Phrase | Token;
}
export interface ElseIfClause extends Phrase {
    expr: Phrase | Token;
    statement: Phrase | Token;
}
export interface ElseIfClauseList extends List<ElseIfClause> {
}
export interface EmptyIntrinsic extends Phrase {
    expr: Phrase | Token;
}
export interface EncapsulatedExpression extends Phrase {
    expr: Phrase | Token;
}
export interface EncapsulatedVariable extends Phrase {
    variable: Phrase | Token;
}
export interface EncapsulatedVariableList extends List<Phrase | Token> {
}
export interface EqualityExpression extends BinaryExpression {
}
export interface ErrorClassMemberDeclaration extends Phrase {
}
export interface ErrorClassTypeDesignatorAtom extends Phrase {
}
export interface ErrorControlExpression extends Phrase {
}
export interface ErrorExpression extends Phrase {
}
export interface ErrorScopedAccessExpression extends Phrase {
}
export interface ErrorTraitAdaptation extends Phrase {
}
export interface ErrorVariable extends Phrase {
}
export interface ErrorVariableAtom extends Phrase {
}
export interface EvalIntrinsic extends Phrase {
    expr: Phrase | Token;
}
export interface ExitIntrinsic extends Phrase {
    expr?: Phrase | Token;
}
export interface ExponentiationExpression extends BinaryExpression {
}
export interface ExpressionList extends List<Phrase | Token> {
}
export interface ExpressionStatement extends Phrase {
    expr: Phrase | Token;
}
export interface FinallyClause extends Phrase {
    block: CompoundStatement;
}
export interface ForControl extends Phrase {
    elements: (Phrase | Token)[];
}
export interface ForeachCollection extends Phrase {
    expr: Phrase | Token;
}
export interface ForeachKey extends Phrase {
    expr: Phrase | Token;
}
export interface ForeachStatement extends Phrase {
    collection: ForeachCollection;
    key?: ForeachKey;
    value: ForeachValue;
    statement: Phrase | Token;
}
export interface ForeachValue extends Phrase {
    byRef?: Token;
    expr: Phrase | Token;
}
export interface ForEndOfLoop extends Phrase {
    elements: (Phrase | Token)[];
}
export interface ForInitialiser extends Phrase {
    elements: (Phrase | Token)[];
}
export interface ForStatement extends Phrase {
    initialiser?: ForInitialiser;
    control?: ForControl;
    end?: ForEndOfLoop;
    statement: Phrase | Token;
}
export interface FullyQualifiedName extends Phrase {
    name: NamespaceName;
}
export interface FunctionCallExpression extends Phrase {
    callableExpr: Phrase | Token;
    argumentList?: ArgumentExpressionList;
}
export interface FunctionDeclaration extends Phrase {
    header: FunctionDeclarationHeader;
    body: CompoundStatement;
}
export interface FunctionDeclarationHeader extends Phrase {
    returnsRef?: Token;
    name: Token;
    parameterList?: ParameterDeclarationList;
    returnType?: ReturnType;
}
export interface FunctionStaticDeclaration extends Phrase {
    variableDeclarationList: StaticVariableDeclarationList;
}
export interface FunctionStaticInitialiser extends Phrase {
    value: Phrase | Token;
}
export interface GlobalDeclaration extends Phrase {
    variableNameList: VariableNameList;
}
export interface GotoStatement extends Phrase {
    label: Token;
}
export interface HaltCompilerStatement extends Phrase {
}
export interface HeredocStringLiteral extends Phrase {
    encapsulatedVariableList: EncapsulatedVariableList;
}
export interface Identifier extends Phrase {
    name: Token;
}
export interface IfStatement extends Phrase {
    expr: Phrase | Token;
    statement: Phrase | Token;
    elseIfClauseList?: ElseIfClauseList;
    elseClause?: ElseClause;
}
export interface IncludeExpression extends ScriptInclusion {
}
export interface IncludeOnceExpression extends ScriptInclusion {
}
export interface InlineText extends Phrase {
}
export interface InstanceOfExpression extends BinaryExpression {
}
export interface InstanceofTypeDesignator extends TypeDesignator {
}
export interface InterfaceBaseClause extends Phrase {
    nameList: QualifiedNameList;
}
export interface InterfaceDeclaration extends Phrase {
    header: InterfaceDeclarationHeader;
    body: InterfaceDeclarationBody;
}
export interface InterfaceDeclarationBody extends TypeDeclarationBody<InterfaceMemberDeclarationList> {
}
export interface InterfaceDeclarationHeader extends Phrase {
    name: Token;
    baseClause?: InterfaceBaseClause;
}
export interface InterfaceMemberDeclarationList extends List<Phrase> {
}
export interface IssetIntrinsic extends Phrase {
    variableList: VariableList;
}
export interface ListIntrinsic extends Phrase {
    initialiserList: ArrayInitialiserList;
}
export interface LogicalExpression extends BinaryExpression {
}
export interface MemberModifierList extends List<Token> {
}
export interface MemberName extends Phrase {
    name: Phrase | Token;
}
export interface MethodCallExpression extends ObjectAccessExpression {
    argumentList: ArgumentExpressionList;
}
export interface MethodDeclaration extends Phrase {
    header: MethodDeclarationHeader;
    body: MethodDeclarationBody;
}
export interface MethodDeclarationBody extends Phrase {
    block?: CompoundStatement;
}
export interface MethodDeclarationHeader extends Phrase {
    modifierList?: MemberModifierList;
    returnsRef?: Token;
    name: Identifier;
    parameterList?: ParameterDeclarationList;
    returnType?: ReturnType;
}
export interface MethodReference extends Phrase {
    typeName?: QualifiedName;
    methodName: Identifier;
}
export interface MultiplicativeExpression extends BinaryExpression {
}
export interface NamedLabelStatement extends Phrase {
    name: Token;
}
export interface NamespaceAliasingClause extends Phrase {
    alias: Token;
}
export interface NamespaceDefinition extends Phrase {
    name?: NamespaceName;
    statementList?: StatementList;
}
export interface NamespaceName extends Phrase {
    parts: Token[];
}
export interface NamespaceUseClause extends Phrase {
    name: NamespaceName;
    aliasingClause?: NamespaceAliasingClause;
}
export interface NamespaceUseClauseList extends List<NamespaceUseClause> {
    elements: NamespaceUseClause[];
}
export interface NamespaceUseDeclaration extends Phrase {
    kind?: Token;
    prefix?: NamespaceName;
    list: NamespaceUseClauseList | NamespaceUseGroupClauseList;
}
export interface NamespaceUseGroupClause extends Phrase {
    kind?: Token;
    name: NamespaceName;
    aliasingClause?: NamespaceAliasingClause;
}
export interface NamespaceUseGroupClauseList extends List<NamespaceUseGroupClause> {
}
export interface NullStatement extends Phrase {
}
export interface ObjectCreationExpression extends Phrase {
    type: ClassTypeDesignator | AnonymousClassDeclaration;
    argumentList?: ArgumentExpressionList;
}
export interface ParameterDeclaration extends Phrase {
    type?: TypeDeclaration;
    byRef?: Token;
    variadic?: Token;
    name: Token;
    value?: Phrase | Token;
}
export interface ParameterDeclarationList extends List<ParameterDeclaration> {
}
export interface PostfixDecrementExpression extends UnaryExpression {
}
export interface PostfixIncrementExpression extends UnaryExpression {
}
export interface PrefixDecrementExpression extends UnaryExpression {
}
export interface PrefixIncrementExpression extends UnaryExpression {
}
export interface PrintIntrinsic extends Phrase {
    expr: Phrase | Token;
}
export interface PropertyAccessExpression extends ObjectAccessExpression {
}
export interface PropertyDeclaration extends Phrase {
    modifierList: MemberModifierList;
    propertyList: PropertyElementList;
}
export interface PropertyElement extends Phrase {
    name: Token;
    initialiser?: PropertyInitialiser;
}
export interface PropertyElementList extends List<PropertyElement> {
}
export interface PropertyInitialiser extends Phrase {
    value: Phrase | Token;
}
export interface QualifiedName extends Phrase {
    name: NamespaceName;
}
export interface QualifiedNameList extends List<QualifiedName> {
}
export interface RelationalExpression extends BinaryExpression {
}
export interface RelativeQualifiedName extends Phrase {
    name: NamespaceName;
}
export interface RelativeScope extends Phrase {
    identifier: Token;
}
export interface RequireExpression extends ScriptInclusion {
}
export interface RequireOnceExpression extends Phrase {
}
export interface ReturnStatement extends Phrase {
    expr?: Phrase | Token;
}
export interface ReturnType extends Phrase {
    type: TypeDeclaration;
}
export interface ScopedCallExpression extends ScopedExpression {
    argumentList: ArgumentExpressionList;
}
export interface ScopedMemberName extends Phrase {
    name: Phrase | Token;
}
export interface ScopedPropertyAccessExpression extends ScopedExpression {
}
export interface ShellCommandExpression extends Phrase {
    encapsulatedVariableList: EncapsulatedVariableList;
}
export interface ShiftExpression extends BinaryExpression {
}
export interface SimpleAssignmentExpression extends BinaryExpression {
}
export interface SimpleVariable extends Phrase {
    name: Phrase | Token;
}
export interface StatementList extends List<Phrase | Token> {
}
export interface StaticVariableDeclaration extends Phrase {
    name: Token;
    initialiser?: FunctionStaticInitialiser;
}
export interface StaticVariableDeclarationList extends List<StaticVariableDeclaration> {
}
export interface SubscriptExpression extends Phrase {
    dereferencable: Phrase | Token;
    offset: Phrase | Token;
}
export interface SwitchStatement extends Phrase {
    expr: Phrase | Token;
    caseList?: CaseStatementList;
}
export interface ThrowStatement extends Phrase {
    expr: Phrase | Token;
}
export interface TraitAdaptationList extends List<TraitPrecedence | TraitAlias> {
}
export interface TraitAlias extends Phrase {
    method: MethodReference;
    modifier: Token;
    alias: Phrase | Token;
}
export interface TraitDeclaration extends Phrase {
    header: TraitDeclarationHeader;
    body: TraitDeclarationBody;
}
export interface TraitDeclarationBody extends TypeDeclarationBody<TraitMemberDeclarationList> {
}
export interface TraitDeclarationHeader extends Phrase {
    name: Token;
}
export interface TraitMemberDeclarationList extends List<Phrase> {
}
export interface TraitPrecedence extends Phrase {
    method: Phrase | Token;
    insteadOfNameList: Phrase | Token;
}
export interface TraitUseClause extends Phrase {
    nameList: QualifiedNameList;
    specification: TraitUseSpecification;
}
export interface TraitUseSpecification extends Phrase {
    adaptationList?: TraitAdaptationList;
}
export interface TryStatement extends Phrase {
    block: CompoundStatement;
    catchList: CatchClauseList;
    finally?: FinallyClause;
}
export interface TypeDeclaration extends Phrase {
    nullable?: Token;
    name: QualifiedName | Token;
}
export interface UnaryOpExpression extends UnaryExpression {
}
export interface UnsetIntrinsic extends Phrase {
    variableList: VariableList;
}
export interface VariableList extends List<Phrase | Token> {
}
export interface VariableNameList extends List<SimpleVariable> {
}
export interface VariadicUnpacking extends Phrase {
    expr: Phrase | Token;
}
export interface WhileStatement extends Phrase {
    expr: Phrase | Token;
    statement: Phrase | Token;
}
export interface YieldExpression extends Phrase {
    key?: Phrase | Token;
    value?: Phrase | Token;
}
export interface YieldFromExpression extends Phrase {
    expr: Phrase | Token;
}
export interface ParseError {
    unexpected: Token;
    numberSkipped: number;
}
export declare function phraseTypeToString(type: PhraseType): "Unknown" | "AdditiveExpression" | "AnonymousClassDeclaration" | "AnonymousClassDeclarationHeader" | "AnonymousFunctionCreationExpression" | "AnonymousFunctionHeader" | "AnonymousFunctionUseClause" | "AnonymousFunctionUseVariable" | "ArgumentExpressionList" | "ArrayCreationExpression" | "ArrayElement" | "ArrayInitialiserList" | "ArrayKey" | "ArrayValue" | "BitwiseExpression" | "BreakStatement" | "ByRefAssignmentExpression" | "CaseStatement" | "CaseStatementList" | "CastExpression" | "CatchClause" | "CatchClauseList" | "CatchNameList" | "ClassBaseClause" | "ClassConstantAccessExpression" | "ClassConstDeclaration" | "ClassConstElement" | "ClassConstElementList" | "ClassDeclaration" | "ClassDeclarationBody" | "ClassDeclarationHeader" | "ClassInterfaceClause" | "ClassMemberDeclarationList" | "ClassModifiers" | "ClassTypeDesignator" | "CloneExpression" | "ClosureUseList" | "CoalesceExpression" | "CompoundAssignmentExpression" | "CompoundStatement" | "TernaryExpression" | "ConstantAccessExpression" | "ConstDeclaration" | "ConstElement" | "ConstElementList" | "ContinueStatement" | "DeclareDirective" | "DeclareStatement" | "DefaultStatement" | "DoStatement" | "DoubleQuotedStringLiteral" | "EchoIntrinsic" | "ElseClause" | "ElseIfClause" | "ElseIfClauseList" | "EmptyIntrinsic" | "EncapsulatedExpression" | "EncapsulatedVariable" | "EncapsulatedVariableList" | "EqualityExpression" | "ErrorClassMemberDeclaration" | "ErrorClassTypeDesignatorAtom" | "ErrorControlExpression" | "ErrorExpression" | "ErrorScopedAccessExpression" | "ErrorTraitAdaptation" | "ErrorVariable" | "ErrorVariableAtom" | "EvalIntrinsic" | "ExitIntrinsic" | "ExponentiationExpression" | "ExpressionList" | "ExpressionStatement" | "FinallyClause" | "ForControl" | "ForeachCollection" | "ForeachKey" | "ForeachStatement" | "ForeachValue" | "ForEndOfLoop" | "ForExpressionGroup" | "ForInitialiser" | "ForStatement" | "FullyQualifiedName" | "FunctionCallExpression" | "FunctionDeclaration" | "FunctionDeclarationHeader" | "FunctionStaticDeclaration" | "FunctionStaticInitialiser" | "GlobalDeclaration" | "GotoStatement" | "HaltCompilerStatement" | "HeredocStringLiteral" | "Identifier" | "IfStatement" | "IncludeExpression" | "IncludeOnceExpression" | "InlineText" | "InstanceOfExpression" | "InstanceofTypeDesignator" | "InterfaceBaseClause" | "InterfaceDeclaration" | "InterfaceDeclarationBody" | "InterfaceDeclarationHeader" | "InterfaceMemberDeclarationList" | "IssetIntrinsic" | "ListIntrinsic" | "LogicalExpression" | "MemberModifierList" | "MemberName" | "MethodCallExpression" | "MethodDeclaration" | "MethodDeclarationBody" | "MethodDeclarationHeader" | "MethodReference" | "MultiplicativeExpression" | "NamedLabelStatement" | "NamespaceAliasingClause" | "NamespaceDefinition" | "NamespaceName" | "NamespaceUseClause" | "NamespaceUseClauseList" | "NamespaceUseDeclaration" | "NamespaceUseGroupClause" | "NamespaceUseGroupClauseList" | "NullStatement" | "ObjectCreationExpression" | "ParameterDeclaration" | "ParameterDeclarationList" | "PostfixDecrementExpression" | "PostfixIncrementExpression" | "PrefixDecrementExpression" | "PrefixIncrementExpression" | "PrintIntrinsic" | "PropertyAccessExpression" | "PropertyDeclaration" | "PropertyElement" | "PropertyElementList" | "PropertyInitialiser" | "QualifiedName" | "QualifiedNameList" | "RelationalExpression" | "RelativeQualifiedName" | "RelativeScope" | "RequireExpression" | "RequireOnceExpression" | "ReturnStatement" | "ReturnType" | "ScopedCallExpression" | "ScopedMemberName" | "ScopedPropertyAccessExpression" | "ShellCommandExpression" | "ShiftExpression" | "SimpleAssignmentExpression" | "SimpleVariable" | "StatementList" | "StaticVariableDeclaration" | "StaticVariableDeclarationList" | "SubscriptExpression" | "SwitchStatement" | "ThrowStatement" | "TraitAdaptationList" | "TraitAlias" | "TraitDeclaration" | "TraitDeclarationBody" | "TraitDeclarationHeader" | "TraitMemberDeclarationList" | "TraitPrecedence" | "TraitUseClause" | "TraitUseSpecification" | "TryStatement" | "TypeDeclaration" | "UnaryOpExpression" | "UnsetIntrinsic" | "VariableList" | "VariableNameList" | "VariadicUnpacking" | "WhileStatement" | "YieldExpression" | "YieldFromExpression" | "";
