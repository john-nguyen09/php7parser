/* Copyright (c) Ben Robert Mewburn
 * Licensed under the ISC Licence.
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function phraseTypeToString(type) {
    switch (type) {
        case 0 /* Unknown */:
            return 'Unknown';
        case 1 /* AdditiveExpression */:
            return 'AdditiveExpression';
        case 2 /* AnonymousClassDeclaration */:
            return 'AnonymousClassDeclaration';
        case 3 /* AnonymousClassDeclarationHeader */:
            return 'AnonymousClassDeclarationHeader';
        case 4 /* AnonymousFunctionCreationExpression */:
            return 'AnonymousFunctionCreationExpression';
        case 5 /* AnonymousFunctionHeader */:
            return 'AnonymousFunctionHeader';
        case 6 /* AnonymousFunctionUseClause */:
            return 'AnonymousFunctionUseClause';
        case 7 /* AnonymousFunctionUseVariable */:
            return 'AnonymousFunctionUseVariable';
        case 8 /* ArgumentExpressionList */:
            return 'ArgumentExpressionList';
        case 9 /* ArrayCreationExpression */:
            return 'ArrayCreationExpression';
        case 10 /* ArrayElement */:
            return 'ArrayElement';
        case 11 /* ArrayInitialiserList */:
            return 'ArrayInitialiserList';
        case 12 /* ArrayKey */:
            return 'ArrayKey';
        case 13 /* ArrayValue */:
            return 'ArrayValue';
        case 14 /* BitwiseExpression */:
            return 'BitwiseExpression';
        case 15 /* BreakStatement */:
            return 'BreakStatement';
        case 16 /* ByRefAssignmentExpression */:
            return 'ByRefAssignmentExpression';
        case 17 /* CaseStatement */:
            return 'CaseStatement';
        case 18 /* CaseStatementList */:
            return 'CaseStatementList';
        case 19 /* CastExpression */:
            return 'CastExpression';
        case 20 /* CatchClause */:
            return 'CatchClause';
        case 21 /* CatchClauseList */:
            return 'CatchClauseList';
        case 22 /* CatchNameList */:
            return 'CatchNameList';
        case 23 /* ClassBaseClause */:
            return 'ClassBaseClause';
        case 24 /* ClassConstantAccessExpression */:
            return 'ClassConstantAccessExpression';
        case 25 /* ClassConstDeclaration */:
            return 'ClassConstDeclaration';
        case 26 /* ClassConstElement */:
            return 'ClassConstElement';
        case 27 /* ClassConstElementList */:
            return 'ClassConstElementList';
        case 28 /* ClassDeclaration */:
            return 'ClassDeclaration';
        case 29 /* ClassDeclarationBody */:
            return 'ClassDeclarationBody';
        case 30 /* ClassDeclarationHeader */:
            return 'ClassDeclarationHeader';
        case 31 /* ClassInterfaceClause */:
            return 'ClassInterfaceClause';
        case 32 /* ClassMemberDeclarationList */:
            return 'ClassMemberDeclarationList';
        case 33 /* ClassModifiers */:
            return 'ClassModifiers';
        case 34 /* ClassTypeDesignator */:
            return 'ClassTypeDesignator';
        case 35 /* CloneExpression */:
            return 'CloneExpression';
        case 36 /* ClosureUseList */:
            return 'ClosureUseList';
        case 37 /* CoalesceExpression */:
            return 'CoalesceExpression';
        case 38 /* CompoundAssignmentExpression */:
            return 'CompoundAssignmentExpression';
        case 39 /* CompoundStatement */:
            return 'CompoundStatement';
        case 40 /* TernaryExpression */:
            return 'TernaryExpression';
        case 41 /* ConstantAccessExpression */:
            return 'ConstantAccessExpression';
        case 42 /* ConstDeclaration */:
            return 'ConstDeclaration';
        case 43 /* ConstElement */:
            return 'ConstElement';
        case 44 /* ConstElementList */:
            return 'ConstElementList';
        case 45 /* ContinueStatement */:
            return 'ContinueStatement';
        case 46 /* DeclareDirective */:
            return 'DeclareDirective';
        case 47 /* DeclareStatement */:
            return 'DeclareStatement';
        case 48 /* DefaultStatement */:
            return 'DefaultStatement';
        case 49 /* DoStatement */:
            return 'DoStatement';
        case 50 /* DoubleQuotedStringLiteral */:
            return 'DoubleQuotedStringLiteral';
        case 51 /* EchoIntrinsic */:
            return 'EchoIntrinsic';
        case 52 /* ElseClause */:
            return 'ElseClause';
        case 53 /* ElseIfClause */:
            return 'ElseIfClause';
        case 54 /* ElseIfClauseList */:
            return 'ElseIfClauseList';
        case 55 /* EmptyIntrinsic */:
            return 'EmptyIntrinsic';
        case 56 /* EncapsulatedExpression */:
            return 'EncapsulatedExpression';
        case 57 /* EncapsulatedVariable */:
            return 'EncapsulatedVariable';
        case 58 /* EncapsulatedVariableList */:
            return 'EncapsulatedVariableList';
        case 59 /* EqualityExpression */:
            return 'EqualityExpression';
        case 60 /* ErrorClassMemberDeclaration */:
            return 'ErrorClassMemberDeclaration';
        case 61 /* ErrorClassTypeDesignatorAtom */:
            return 'ErrorClassTypeDesignatorAtom';
        case 62 /* ErrorControlExpression */:
            return 'ErrorControlExpression';
        case 63 /* ErrorExpression */:
            return 'ErrorExpression';
        case 64 /* ErrorScopedAccessExpression */:
            return 'ErrorScopedAccessExpression';
        case 65 /* ErrorTraitAdaptation */:
            return 'ErrorTraitAdaptation';
        case 66 /* ErrorVariable */:
            return 'ErrorVariable';
        case 67 /* ErrorVariableAtom */:
            return 'ErrorVariableAtom';
        case 68 /* EvalIntrinsic */:
            return 'EvalIntrinsic';
        case 69 /* ExitIntrinsic */:
            return 'ExitIntrinsic';
        case 70 /* ExponentiationExpression */:
            return 'ExponentiationExpression';
        case 71 /* ExpressionList */:
            return 'ExpressionList';
        case 72 /* ExpressionStatement */:
            return 'ExpressionStatement';
        case 73 /* FinallyClause */:
            return 'FinallyClause';
        case 74 /* ForControl */:
            return 'ForControl';
        case 75 /* ForeachCollection */:
            return 'ForeachCollection';
        case 76 /* ForeachKey */:
            return 'ForeachKey';
        case 77 /* ForeachStatement */:
            return 'ForeachStatement';
        case 78 /* ForeachValue */:
            return 'ForeachValue';
        case 79 /* ForEndOfLoop */:
            return 'ForEndOfLoop';
        case 80 /* ForExpressionGroup */:
            return 'ForExpressionGroup';
        case 81 /* ForInitialiser */:
            return 'ForInitialiser';
        case 82 /* ForStatement */:
            return 'ForStatement';
        case 83 /* FullyQualifiedName */:
            return 'FullyQualifiedName';
        case 84 /* FunctionCallExpression */:
            return 'FunctionCallExpression';
        case 85 /* FunctionDeclaration */:
            return 'FunctionDeclaration';
        case 87 /* FunctionDeclarationHeader */:
            return 'FunctionDeclarationHeader';
        case 88 /* FunctionStaticDeclaration */:
            return 'FunctionStaticDeclaration';
        case 89 /* FunctionStaticInitialiser */:
            return 'FunctionStaticInitialiser';
        case 90 /* GlobalDeclaration */:
            return 'GlobalDeclaration';
        case 91 /* GotoStatement */:
            return 'GotoStatement';
        case 92 /* HaltCompilerStatement */:
            return 'HaltCompilerStatement';
        case 93 /* HeredocStringLiteral */:
            return 'HeredocStringLiteral';
        case 94 /* Identifier */:
            return 'Identifier';
        case 95 /* IfStatement */:
            return 'IfStatement';
        case 96 /* IncludeExpression */:
            return 'IncludeExpression';
        case 97 /* IncludeOnceExpression */:
            return 'IncludeOnceExpression';
        case 98 /* InlineText */:
            return 'InlineText';
        case 99 /* InstanceOfExpression */:
            return 'InstanceOfExpression';
        case 100 /* InstanceofTypeDesignator */:
            return 'InstanceofTypeDesignator';
        case 101 /* InterfaceBaseClause */:
            return 'InterfaceBaseClause';
        case 102 /* InterfaceDeclaration */:
            return 'InterfaceDeclaration';
        case 103 /* InterfaceDeclarationBody */:
            return 'InterfaceDeclarationBody';
        case 104 /* InterfaceDeclarationHeader */:
            return 'InterfaceDeclarationHeader';
        case 105 /* InterfaceMemberDeclarationList */:
            return 'InterfaceMemberDeclarationList';
        case 106 /* IssetIntrinsic */:
            return 'IssetIntrinsic';
        case 107 /* ListIntrinsic */:
            return 'ListIntrinsic';
        case 108 /* LogicalExpression */:
            return 'LogicalExpression';
        case 109 /* MemberModifierList */:
            return 'MemberModifierList';
        case 110 /* MemberName */:
            return 'MemberName';
        case 111 /* MethodCallExpression */:
            return 'MethodCallExpression';
        case 112 /* MethodDeclaration */:
            return 'MethodDeclaration';
        case 113 /* MethodDeclarationBody */:
            return 'MethodDeclarationBody';
        case 114 /* MethodDeclarationHeader */:
            return 'MethodDeclarationHeader';
        case 115 /* MethodReference */:
            return 'MethodReference';
        case 116 /* MultiplicativeExpression */:
            return 'MultiplicativeExpression';
        case 117 /* NamedLabelStatement */:
            return 'NamedLabelStatement';
        case 118 /* NamespaceAliasingClause */:
            return 'NamespaceAliasingClause';
        case 119 /* NamespaceDefinition */:
            return 'NamespaceDefinition';
        case 120 /* NamespaceName */:
            return 'NamespaceName';
        case 121 /* NamespaceUseClause */:
            return 'NamespaceUseClause';
        case 122 /* NamespaceUseClauseList */:
            return 'NamespaceUseClauseList';
        case 123 /* NamespaceUseDeclaration */:
            return 'NamespaceUseDeclaration';
        case 124 /* NamespaceUseGroupClause */:
            return 'NamespaceUseGroupClause';
        case 125 /* NamespaceUseGroupClauseList */:
            return 'NamespaceUseGroupClauseList';
        case 126 /* NullStatement */:
            return 'NullStatement';
        case 127 /* ObjectCreationExpression */:
            return 'ObjectCreationExpression';
        case 128 /* ParameterDeclaration */:
            return 'ParameterDeclaration';
        case 129 /* ParameterDeclarationList */:
            return 'ParameterDeclarationList';
        case 130 /* PostfixDecrementExpression */:
            return 'PostfixDecrementExpression';
        case 131 /* PostfixIncrementExpression */:
            return 'PostfixIncrementExpression';
        case 132 /* PrefixDecrementExpression */:
            return 'PrefixDecrementExpression';
        case 133 /* PrefixIncrementExpression */:
            return 'PrefixIncrementExpression';
        case 134 /* PrintIntrinsic */:
            return 'PrintIntrinsic';
        case 135 /* PropertyAccessExpression */:
            return 'PropertyAccessExpression';
        case 136 /* PropertyDeclaration */:
            return 'PropertyDeclaration';
        case 137 /* PropertyElement */:
            return 'PropertyElement';
        case 138 /* PropertyElementList */:
            return 'PropertyElementList';
        case 139 /* PropertyInitialiser */:
            return 'PropertyInitialiser';
        case 140 /* QualifiedName */:
            return 'QualifiedName';
        case 141 /* QualifiedNameList */:
            return 'QualifiedNameList';
        case 142 /* RelationalExpression */:
            return 'RelationalExpression';
        case 143 /* RelativeQualifiedName */:
            return 'RelativeQualifiedName';
        case 144 /* RelativeScope */:
            return 'RelativeScope';
        case 145 /* RequireExpression */:
            return 'RequireExpression';
        case 146 /* RequireOnceExpression */:
            return 'RequireOnceExpression';
        case 147 /* ReturnStatement */:
            return 'ReturnStatement';
        case 148 /* ReturnType */:
            return 'ReturnType';
        case 149 /* ScopedCallExpression */:
            return 'ScopedCallExpression';
        case 150 /* ScopedMemberName */:
            return 'ScopedMemberName';
        case 151 /* ScopedPropertyAccessExpression */:
            return 'ScopedPropertyAccessExpression';
        case 152 /* ShellCommandExpression */:
            return 'ShellCommandExpression';
        case 153 /* ShiftExpression */:
            return 'ShiftExpression';
        case 154 /* SimpleAssignmentExpression */:
            return 'SimpleAssignmentExpression';
        case 155 /* SimpleVariable */:
            return 'SimpleVariable';
        case 156 /* StatementList */:
            return 'StatementList';
        case 157 /* StaticVariableDeclaration */:
            return 'StaticVariableDeclaration';
        case 158 /* StaticVariableDeclarationList */:
            return 'StaticVariableDeclarationList';
        case 159 /* SubscriptExpression */:
            return 'SubscriptExpression';
        case 160 /* SwitchStatement */:
            return 'SwitchStatement';
        case 161 /* ThrowStatement */:
            return 'ThrowStatement';
        case 162 /* TraitAdaptationList */:
            return 'TraitAdaptationList';
        case 163 /* TraitAlias */:
            return 'TraitAlias';
        case 164 /* TraitDeclaration */:
            return 'TraitDeclaration';
        case 165 /* TraitDeclarationBody */:
            return 'TraitDeclarationBody';
        case 166 /* TraitDeclarationHeader */:
            return 'TraitDeclarationHeader';
        case 167 /* TraitMemberDeclarationList */:
            return 'TraitMemberDeclarationList';
        case 168 /* TraitPrecedence */:
            return 'TraitPrecedence';
        case 169 /* TraitUseClause */:
            return 'TraitUseClause';
        case 170 /* TraitUseSpecification */:
            return 'TraitUseSpecification';
        case 171 /* TryStatement */:
            return 'TryStatement';
        case 172 /* TypeDeclaration */:
            return 'TypeDeclaration';
        case 173 /* UnaryOpExpression */:
            return 'UnaryOpExpression';
        case 174 /* UnsetIntrinsic */:
            return 'UnsetIntrinsic';
        case 175 /* VariableList */:
            return 'VariableList';
        case 176 /* VariableNameList */:
            return 'VariableNameList';
        case 177 /* VariadicUnpacking */:
            return 'VariadicUnpacking';
        case 178 /* WhileStatement */:
            return 'WhileStatement';
        case 179 /* YieldExpression */:
            return 'YieldExpression';
        case 180 /* YieldFromExpression */:
            return 'YieldFromExpression';
        default:
            return '';
    }
}
exports.phraseTypeToString = phraseTypeToString;
