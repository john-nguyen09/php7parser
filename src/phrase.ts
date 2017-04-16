/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
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
    FunctionDeclarationBody,
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
    /**
     * Phrase type
     */
    phraseType: PhraseType;
    /**
     * Phrase and token child nodes
     */
    children: (Phrase | Token)[];
    /**
     * Parse errors encountered whilst parsing phrase
     */
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
    /**
     * The token that prompted the parse error
     */
    unexpected: Token;
    /**
     * The number of tokens skipped to recover from this error
     */
    numberSkipped: number;
}

export function phraseTypeToString(type: PhraseType) {

    switch (type) {
        case PhraseType.Unknown:
            return 'Unknown';
        case PhraseType.AdditiveExpression:
            return 'AdditiveExpression';
        case PhraseType.AnonymousClassDeclaration:
            return 'AnonymousClassDeclaration';
        case PhraseType.AnonymousClassDeclarationHeader:
            return 'AnonymousClassDeclarationHeader';
        case PhraseType.AnonymousFunctionCreationExpression:
            return 'AnonymousFunctionCreationExpression';
        case PhraseType.AnonymousFunctionHeader:
            return 'AnonymousFunctionHeader';
        case PhraseType.AnonymousFunctionUseClause:
            return 'AnonymousFunctionUseClause';
        case PhraseType.AnonymousFunctionUseVariable:
            return 'AnonymousFunctionUseVariable';
        case PhraseType.ArgumentExpressionList:
            return 'ArgumentExpressionList';
        case PhraseType.ArrayCreationExpression:
            return 'ArrayCreationExpression';
        case PhraseType.ArrayElement:
            return 'ArrayElement';
        case PhraseType.ArrayInitialiserList:
            return 'ArrayInitialiserList';
        case PhraseType.ArrayKey:
            return 'ArrayKey';
        case PhraseType.ArrayValue:
            return 'ArrayValue';
        case PhraseType.BitwiseExpression:
            return 'BitwiseExpression';
        case PhraseType.BreakStatement:
            return 'BreakStatement';
        case PhraseType.ByRefAssignmentExpression:
            return 'ByRefAssignmentExpression';
        case PhraseType.CaseStatement:
            return 'CaseStatement';
        case PhraseType.CaseStatementList:
            return 'CaseStatementList';
        case PhraseType.CastExpression:
            return 'CastExpression';
        case PhraseType.CatchClause:
            return 'CatchClause';
        case PhraseType.CatchClauseList:
            return 'CatchClauseList';
        case PhraseType.CatchNameList:
            return 'CatchNameList';
        case PhraseType.ClassBaseClause:
            return 'ClassBaseClause';
        case PhraseType.ClassConstantAccessExpression:
            return 'ClassConstantAccessExpression';
        case PhraseType.ClassConstDeclaration:
            return 'ClassConstDeclaration';
        case PhraseType.ClassConstElement:
            return 'ClassConstElement';
        case PhraseType.ClassConstElementList:
            return 'ClassConstElementList';
        case PhraseType.ClassDeclaration:
            return 'ClassDeclaration';
        case PhraseType.ClassDeclarationBody:
            return 'ClassDeclarationBody';
        case PhraseType.ClassDeclarationHeader:
            return 'ClassDeclarationHeader';
        case PhraseType.ClassInterfaceClause:
            return 'ClassInterfaceClause';
        case PhraseType.ClassMemberDeclarationList:
            return 'ClassMemberDeclarationList';
        case PhraseType.ClassModifiers:
            return 'ClassModifiers';
        case PhraseType.ClassTypeDesignator:
            return 'ClassTypeDesignator';
        case PhraseType.CloneExpression:
            return 'CloneExpression';
        case PhraseType.ClosureUseList:
            return 'ClosureUseList';
        case PhraseType.CoalesceExpression:
            return 'CoalesceExpression';
        case PhraseType.CompoundAssignmentExpression:
            return 'CompoundAssignmentExpression';
        case PhraseType.CompoundStatement:
            return 'CompoundStatement';
        case PhraseType.TernaryExpression:
            return 'TernaryExpression';
        case PhraseType.ConstantAccessExpression:
            return 'ConstantAccessExpression';
        case PhraseType.ConstDeclaration:
            return 'ConstDeclaration';
        case PhraseType.ConstElement:
            return 'ConstElement';
        case PhraseType.ConstElementList:
            return 'ConstElementList';
        case PhraseType.ContinueStatement:
            return 'ContinueStatement';
        case PhraseType.DeclareDirective:
            return 'DeclareDirective';
        case PhraseType.DeclareStatement:
            return 'DeclareStatement';
        case PhraseType.DefaultStatement:
            return 'DefaultStatement';
        case PhraseType.DoStatement:
            return 'DoStatement';
        case PhraseType.DoubleQuotedStringLiteral:
            return 'DoubleQuotedStringLiteral';
        case PhraseType.EchoIntrinsic:
            return 'EchoIntrinsic';
        case PhraseType.ElseClause:
            return 'ElseClause';
        case PhraseType.ElseIfClause:
            return 'ElseIfClause';
        case PhraseType.ElseIfClauseList:
            return 'ElseIfClauseList';
        case PhraseType.EmptyIntrinsic:
            return 'EmptyIntrinsic';
        case PhraseType.EncapsulatedExpression:
            return 'EncapsulatedExpression';
        case PhraseType.EncapsulatedVariable:
            return 'EncapsulatedVariable';
        case PhraseType.EncapsulatedVariableList:
            return 'EncapsulatedVariableList';
        case PhraseType.EqualityExpression:
            return 'EqualityExpression';
        case PhraseType.ErrorClassMemberDeclaration:
            return 'ErrorClassMemberDeclaration';
        case PhraseType.ErrorClassTypeDesignatorAtom:
            return 'ErrorClassTypeDesignatorAtom';
        case PhraseType.ErrorControlExpression:
            return 'ErrorControlExpression';
        case PhraseType.ErrorExpression:
            return 'ErrorExpression';
        case PhraseType.ErrorScopedAccessExpression:
            return 'ErrorScopedAccessExpression';
        case PhraseType.ErrorTraitAdaptation:
            return 'ErrorTraitAdaptation';
        case PhraseType.ErrorVariable:
            return 'ErrorVariable';
        case PhraseType.ErrorVariableAtom:
            return 'ErrorVariableAtom';
        case PhraseType.EvalIntrinsic:
            return 'EvalIntrinsic';
        case PhraseType.ExitIntrinsic:
            return 'ExitIntrinsic';
        case PhraseType.ExponentiationExpression:
            return 'ExponentiationExpression';
        case PhraseType.ExpressionList:
            return 'ExpressionList';
        case PhraseType.ExpressionStatement:
            return 'ExpressionStatement';
        case PhraseType.FinallyClause:
            return 'FinallyClause';
        case PhraseType.ForControl:
            return 'ForControl';
        case PhraseType.ForeachCollection:
            return 'ForeachCollection';
        case PhraseType.ForeachKey:
            return 'ForeachKey';
        case PhraseType.ForeachStatement:
            return 'ForeachStatement';
        case PhraseType.ForeachValue:
            return 'ForeachValue';
        case PhraseType.ForEndOfLoop:
            return 'ForEndOfLoop';
        case PhraseType.ForExpressionGroup:
            return 'ForExpressionGroup';
        case PhraseType.ForInitialiser:
            return 'ForInitialiser';
        case PhraseType.ForStatement:
            return 'ForStatement';
        case PhraseType.FullyQualifiedName:
            return 'FullyQualifiedName';
        case PhraseType.FunctionCallExpression:
            return 'FunctionCallExpression';
        case PhraseType.FunctionDeclaration:
            return 'FunctionDeclaration';
        case PhraseType.FunctionDeclarationHeader:
            return 'FunctionDeclarationHeader';
        case PhraseType.FunctionStaticDeclaration:
            return 'FunctionStaticDeclaration';
        case PhraseType.FunctionStaticInitialiser:
            return 'FunctionStaticInitialiser';
        case PhraseType.GlobalDeclaration:
            return 'GlobalDeclaration';
        case PhraseType.GotoStatement:
            return 'GotoStatement';
        case PhraseType.HaltCompilerStatement:
            return 'HaltCompilerStatement';
        case PhraseType.HeredocStringLiteral:
            return 'HeredocStringLiteral';
        case PhraseType.Identifier:
            return 'Identifier';
        case PhraseType.IfStatement:
            return 'IfStatement';
        case PhraseType.IncludeExpression:
            return 'IncludeExpression';
        case PhraseType.IncludeOnceExpression:
            return 'IncludeOnceExpression';
        case PhraseType.InlineText:
            return 'InlineText';
        case PhraseType.InstanceOfExpression:
            return 'InstanceOfExpression';
        case PhraseType.InstanceofTypeDesignator:
            return 'InstanceofTypeDesignator';
        case PhraseType.InterfaceBaseClause:
            return 'InterfaceBaseClause';
        case PhraseType.InterfaceDeclaration:
            return 'InterfaceDeclaration';
        case PhraseType.InterfaceDeclarationBody:
            return 'InterfaceDeclarationBody';
        case PhraseType.InterfaceDeclarationHeader:
            return 'InterfaceDeclarationHeader';
        case PhraseType.InterfaceMemberDeclarationList:
            return 'InterfaceMemberDeclarationList';
        case PhraseType.IssetIntrinsic:
            return 'IssetIntrinsic';
        case PhraseType.ListIntrinsic:
            return 'ListIntrinsic';
        case PhraseType.LogicalExpression:
            return 'LogicalExpression';
        case PhraseType.MemberModifierList:
            return 'MemberModifierList';
        case PhraseType.MemberName:
            return 'MemberName';
        case PhraseType.MethodCallExpression:
            return 'MethodCallExpression';
        case PhraseType.MethodDeclaration:
            return 'MethodDeclaration';
        case PhraseType.MethodDeclarationBody:
            return 'MethodDeclarationBody';
        case PhraseType.MethodDeclarationHeader:
            return 'MethodDeclarationHeader';
        case PhraseType.MethodReference:
            return 'MethodReference';
        case PhraseType.MultiplicativeExpression:
            return 'MultiplicativeExpression';
        case PhraseType.NamedLabelStatement:
            return 'NamedLabelStatement';
        case PhraseType.NamespaceAliasingClause:
            return 'NamespaceAliasingClause';
        case PhraseType.NamespaceDefinition:
            return 'NamespaceDefinition';
        case PhraseType.NamespaceName:
            return 'NamespaceName';
        case PhraseType.NamespaceUseClause:
            return 'NamespaceUseClause';
        case PhraseType.NamespaceUseClauseList:
            return 'NamespaceUseClauseList';
        case PhraseType.NamespaceUseDeclaration:
            return 'NamespaceUseDeclaration';
        case PhraseType.NamespaceUseGroupClause:
            return 'NamespaceUseGroupClause';
        case PhraseType.NamespaceUseGroupClauseList:
            return 'NamespaceUseGroupClauseList';
        case PhraseType.NullStatement:
            return 'NullStatement';
        case PhraseType.ObjectCreationExpression:
            return 'ObjectCreationExpression';
        case PhraseType.ParameterDeclaration:
            return 'ParameterDeclaration';
        case PhraseType.ParameterDeclarationList:
            return 'ParameterDeclarationList';
        case PhraseType.PostfixDecrementExpression:
            return 'PostfixDecrementExpression';
        case PhraseType.PostfixIncrementExpression:
            return 'PostfixIncrementExpression';
        case PhraseType.PrefixDecrementExpression:
            return 'PrefixDecrementExpression';
        case PhraseType.PrefixIncrementExpression:
            return 'PrefixIncrementExpression';
        case PhraseType.PrintIntrinsic:
            return 'PrintIntrinsic';
        case PhraseType.PropertyAccessExpression:
            return 'PropertyAccessExpression';
        case PhraseType.PropertyDeclaration:
            return 'PropertyDeclaration';
        case PhraseType.PropertyElement:
            return 'PropertyElement';
        case PhraseType.PropertyElementList:
            return 'PropertyElementList';
        case PhraseType.PropertyInitialiser:
            return 'PropertyInitialiser';
        case PhraseType.QualifiedName:
            return 'QualifiedName';
        case PhraseType.QualifiedNameList:
            return 'QualifiedNameList';
        case PhraseType.RelationalExpression:
            return 'RelationalExpression';
        case PhraseType.RelativeQualifiedName:
            return 'RelativeQualifiedName';
        case PhraseType.RelativeScope:
            return 'RelativeScope';
        case PhraseType.RequireExpression:
            return 'RequireExpression';
        case PhraseType.RequireOnceExpression:
            return 'RequireOnceExpression';
        case PhraseType.ReturnStatement:
            return 'ReturnStatement';
        case PhraseType.ReturnType:
            return 'ReturnType';
        case PhraseType.ScopedCallExpression:
            return 'ScopedCallExpression';
        case PhraseType.ScopedMemberName:
            return 'ScopedMemberName';
        case PhraseType.ScopedPropertyAccessExpression:
            return 'ScopedPropertyAccessExpression';
        case PhraseType.ShellCommandExpression:
            return 'ShellCommandExpression';
        case PhraseType.ShiftExpression:
            return 'ShiftExpression';
        case PhraseType.SimpleAssignmentExpression:
            return 'SimpleAssignmentExpression';
        case PhraseType.SimpleVariable:
            return 'SimpleVariable';
        case PhraseType.StatementList:
            return 'StatementList';
        case PhraseType.StaticVariableDeclaration:
            return 'StaticVariableDeclaration';
        case PhraseType.StaticVariableDeclarationList:
            return 'StaticVariableDeclarationList';
        case PhraseType.SubscriptExpression:
            return 'SubscriptExpression';
        case PhraseType.SwitchStatement:
            return 'SwitchStatement';
        case PhraseType.ThrowStatement:
            return 'ThrowStatement';
        case PhraseType.TraitAdaptationList:
            return 'TraitAdaptationList';
        case PhraseType.TraitAlias:
            return 'TraitAlias';
        case PhraseType.TraitDeclaration:
            return 'TraitDeclaration';
        case PhraseType.TraitDeclarationBody:
            return 'TraitDeclarationBody';
        case PhraseType.TraitDeclarationHeader:
            return 'TraitDeclarationHeader';
        case PhraseType.TraitMemberDeclarationList:
            return 'TraitMemberDeclarationList';
        case PhraseType.TraitPrecedence:
            return 'TraitPrecedence';
        case PhraseType.TraitUseClause:
            return 'TraitUseClause';
        case PhraseType.TraitUseSpecification:
            return 'TraitUseSpecification';
        case PhraseType.TryStatement:
            return 'TryStatement';
        case PhraseType.TypeDeclaration:
            return 'TypeDeclaration';
        case PhraseType.UnaryOpExpression:
            return 'UnaryOpExpression';
        case PhraseType.UnsetIntrinsic:
            return 'UnsetIntrinsic';
        case PhraseType.VariableList:
            return 'VariableList';
        case PhraseType.VariableNameList:
            return 'VariableNameList';
        case PhraseType.VariadicUnpacking:
            return 'VariadicUnpacking';
        case PhraseType.WhileStatement:
            return 'WhileStatement';
        case PhraseType.YieldExpression:
            return 'YieldExpression';
        case PhraseType.YieldFromExpression:
            return 'YieldFromExpression';
        default:
            return '';
    }
}
