/* Copyright (c) Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token } from './lexer';

export const enum PhraseType {
    Unknown,
    AdditiveExpression,
    AnonymousClassDeclaration,
    AnonymousClassDeclarationHeader,
    AnonymousFunctionCreationExpression,
    AnonymousFunctionHeader,
    AnonymousFunctionUseClause,
    AnonymousFunctionUseVariable,
    ArgumentExpressionList,
    ArrayCreationExpression,
    ArrayElement,
    ArrayInitialiserList,
    ArrayKey,
    ArrayValue,
    BitwiseExpression,
    BreakStatement,
    ByRefAssignmentExpression,
    CaseStatement,
    CaseStatementList,
    CastExpression,
    CatchClause,
    CatchClauseList,
    CatchNameList,
    ClassBaseClause,
    ClassConstantAccessExpression,
    ClassConstDeclaration,
    ClassConstElement,
    ClassConstElementList,
    ClassDeclaration,
    ClassDeclarationBody,
    ClassDeclarationHeader,
    ClassInterfaceClause,
    ClassMemberDeclarationList,
    ClassModifiers,
    ClassTypeDesignator,
    CloneExpression,
    ClosureUseList,
    CoalesceExpression,
    CompoundAssignmentExpression,
    CompoundStatement,
    TernaryExpression,
    ConstantAccessExpression,
    ConstDeclaration,
    ConstElement,
    ConstElementList,
    ContinueStatement,
    DeclareDirective,
    DeclareStatement,
    DefaultStatement,
    DoStatement,
    DoubleQuotedStringLiteral,
    EchoIntrinsic,
    ElseClause,
    ElseIfClause,
    ElseIfClauseList,
    EmptyIntrinsic,
    EncapsulatedExpression,
    EncapsulatedVariable,
    EncapsulatedVariableList,
    EqualityExpression,
    ErrorClassMemberDeclaration,
    ErrorClassTypeDesignatorAtom,
    ErrorControlExpression,
    ErrorExpression,
    ErrorScopedAccessExpression,
    ErrorTraitAdaptation,
    ErrorVariable,
    ErrorVariableAtom,
    EvalIntrinsic,
    ExitIntrinsic,
    ExponentiationExpression,
    ExpressionList,
    ExpressionStatement,
    FinallyClause,
    ForControl,
    ForeachCollection,
    ForeachKey,
    ForeachStatement,
    ForeachValue,
    ForEndOfLoop,
    ForExpressionGroup,
    ForInitialiser,
    ForStatement,
    FullyQualifiedName,
    FunctionCallExpression,
    FunctionDeclaration,
    FunctionDeclarationHeader,
    FunctionStaticDeclaration,
    FunctionStaticInitialiser,
    GlobalDeclaration,
    GotoStatement,
    HaltCompilerStatement,
    HeredocStringLiteral,
    Identifier,
    IfStatement,
    IncludeExpression,
    IncludeOnceExpression,
    InlineText,
    InstanceOfExpression,
    InstanceofTypeDesignator,
    InterfaceBaseClause,
    InterfaceDeclaration,
    InterfaceDeclarationBody,
    InterfaceDeclarationHeader,
    InterfaceMemberDeclarationList,
    IssetIntrinsic,
    ListIntrinsic,
    LogicalExpression,
    MemberModifierList,
    MemberName,
    MethodCallExpression,
    MethodDeclaration,
    MethodDeclarationBody,
    MethodDeclarationHeader,
    MethodReference,
    MultiplicativeExpression,
    NamedLabelStatement,
    NamespaceAliasingClause,
    NamespaceDefinition,
    NamespaceName,
    NamespaceUseClause,
    NamespaceUseClauseList,
    NamespaceUseDeclaration,
    NamespaceUseGroupClause,
    NamespaceUseGroupClauseList,
    NullStatement,
    ObjectCreationExpression,
    ParameterDeclaration,
    ParameterDeclarationList,
    PostfixDecrementExpression,
    PostfixIncrementExpression,
    PrefixDecrementExpression,
    PrefixIncrementExpression,
    PrintIntrinsic,
    PropertyAccessExpression,
    PropertyDeclaration,
    PropertyElement,
    PropertyElementList,
    PropertyInitialiser,
    QualifiedName,
    QualifiedNameList,
    RelationalExpression,
    RelativeQualifiedName,
    RelativeScope,
    RequireExpression,
    RequireOnceExpression,
    ReturnStatement,
    ReturnType,
    ScopedCallExpression,
    ScopedMemberName,
    ScopedPropertyAccessExpression,
    ShellCommandExpression,
    ShiftExpression,
    SimpleAssignmentExpression,
    SimpleVariable,
    StatementList,
    StaticVariableDeclaration,
    StaticVariableDeclarationList,
    SubscriptExpression,
    SwitchStatement,
    ThrowStatement,
    TraitAdaptationList,
    TraitAlias,
    TraitDeclaration,
    TraitDeclarationBody,
    TraitDeclarationHeader,
    TraitMemberDeclarationList,
    TraitPrecedence,
    TraitUseClause,
    TraitUseSpecification,
    TryStatement,
    TypeDeclaration,
    UnaryOpExpression,
    UnsetIntrinsic,
    VariableList,
    VariableNameList,
    VariadicUnpacking,
    WhileStatement,
    YieldExpression,
    YieldFromExpression
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

export interface List<T extends Phrase | Token> extends Phrase {
    elements: T[];
}

export interface AdditiveExpression extends BinaryExpression {

}

export interface AnonymousClassDeclaration extends Phrase {
    header: AnonymousClassDeclarationHeader;
    body: ClassDeclarationBody;
}

export interface AnonymousClassDeclarationHeader extends Phrase {
    argumentList: ArgumentExpressionList;
    baseClause: ClassBaseClause;
    interfaceClause: ClassInterfaceClause;
}

export interface AnonymousFunctionCreationExpression extends Phrase {
    header: AnonymousFunctionHeader;
    body: CompoundStatement;
}
export interface AnonymousFunctionHeader extends Phrase {
    modifier?: Token; //static
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
export interface ArgumentExpressionList extends List<Phrase|Token> {
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
export interface CaseStatementList extends List<CaseStatement|DefaultStatement> {
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

export interface ClassTypeDesignator extends Phrase {
    type: Phrase;
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
    trueExpr: Phrase | Token;
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
export interface EncapsulatedVariableList extends List<Phrase|Token> {
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
    expr: Phrase | Token;
}
export interface ExponentiationExpression extends BinaryExpression {

}
export interface ExpressionList extends List<Phrase|Token> {
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
    text: Token;
}
export interface InstanceOfExpression extends BinaryExpression {

}
export interface InstanceofTypeDesignator extends Phrase {
    type: Phrase | Token;
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
export interface MethodCallExpression extends Phrase {
    variable: Phrase | Token;
    name: Phrase | Token;
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
    statement: Phrase | Token;
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
export interface PropertyAccessExpression extends Phrase {
    variable: Phrase | Token;
    memberName: MemberName;
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
export interface StatementList extends List<Phrase|Token> {
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
export interface TraitAdaptationList extends List<TraitPrecedence|TraitAlias> {
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
export interface VariableList extends List<Phrase|Token> {
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
    key: Phrase | Token;
    value: Phrase | Token;
}
export interface YieldFromExpression extends Phrase {
    expr: Phrase | Token;
}

export interface ParseError {
    startErrorToken: Token;
    endErrorToken: Token;
}


