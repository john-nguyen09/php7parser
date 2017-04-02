/* Copyright (c) Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
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
        case 86 /* FunctionDeclarationHeader */:
            return 'FunctionDeclarationHeader';
        case 87 /* FunctionStaticDeclaration */:
            return 'FunctionStaticDeclaration';
        case 88 /* FunctionStaticInitialiser */:
            return 'FunctionStaticInitialiser';
        case 89 /* GlobalDeclaration */:
            return 'GlobalDeclaration';
        case 90 /* GotoStatement */:
            return 'GotoStatement';
        case 91 /* HaltCompilerStatement */:
            return 'HaltCompilerStatement';
        case 92 /* HeredocStringLiteral */:
            return 'HeredocStringLiteral';
        case 93 /* Identifier */:
            return 'Identifier';
        case 94 /* IfStatement */:
            return 'IfStatement';
        case 95 /* IncludeExpression */:
            return 'IncludeExpression';
        case 96 /* IncludeOnceExpression */:
            return 'IncludeOnceExpression';
        case 97 /* InlineText */:
            return 'InlineText';
        case 98 /* InstanceOfExpression */:
            return 'InstanceOfExpression';
        case 99 /* InstanceofTypeDesignator */:
            return 'InstanceofTypeDesignator';
        case 100 /* InterfaceBaseClause */:
            return 'InterfaceBaseClause';
        case 101 /* InterfaceDeclaration */:
            return 'InterfaceDeclaration';
        case 102 /* InterfaceDeclarationBody */:
            return 'InterfaceDeclarationBody';
        case 103 /* InterfaceDeclarationHeader */:
            return 'InterfaceDeclarationHeader';
        case 104 /* InterfaceMemberDeclarationList */:
            return 'InterfaceMemberDeclarationList';
        case 105 /* IssetIntrinsic */:
            return 'IssetIntrinsic';
        case 106 /* ListIntrinsic */:
            return 'ListIntrinsic';
        case 107 /* LogicalExpression */:
            return 'LogicalExpression';
        case 108 /* MemberModifierList */:
            return 'MemberModifierList';
        case 109 /* MemberName */:
            return 'MemberName';
        case 110 /* MethodCallExpression */:
            return 'MethodCallExpression';
        case 111 /* MethodDeclaration */:
            return 'MethodDeclaration';
        case 112 /* MethodDeclarationBody */:
            return 'MethodDeclarationBody';
        case 113 /* MethodDeclarationHeader */:
            return 'MethodDeclarationHeader';
        case 114 /* MethodReference */:
            return 'MethodReference';
        case 115 /* MultiplicativeExpression */:
            return 'MultiplicativeExpression';
        case 116 /* NamedLabelStatement */:
            return 'NamedLabelStatement';
        case 117 /* NamespaceAliasingClause */:
            return 'NamespaceAliasingClause';
        case 118 /* NamespaceDefinition */:
            return 'NamespaceDefinition';
        case 119 /* NamespaceName */:
            return 'NamespaceName';
        case 120 /* NamespaceUseClause */:
            return 'NamespaceUseClause';
        case 121 /* NamespaceUseClauseList */:
            return 'NamespaceUseClauseList';
        case 122 /* NamespaceUseDeclaration */:
            return 'NamespaceUseDeclaration';
        case 123 /* NamespaceUseGroupClause */:
            return 'NamespaceUseGroupClause';
        case 124 /* NamespaceUseGroupClauseList */:
            return 'NamespaceUseGroupClauseList';
        case 125 /* NullStatement */:
            return 'NullStatement';
        case 126 /* ObjectCreationExpression */:
            return 'ObjectCreationExpression';
        case 127 /* ParameterDeclaration */:
            return 'ParameterDeclaration';
        case 128 /* ParameterDeclarationList */:
            return 'ParameterDeclarationList';
        case 129 /* PostfixDecrementExpression */:
            return 'PostfixDecrementExpression';
        case 130 /* PostfixIncrementExpression */:
            return 'PostfixIncrementExpression';
        case 131 /* PrefixDecrementExpression */:
            return 'PrefixDecrementExpression';
        case 132 /* PrefixIncrementExpression */:
            return 'PrefixIncrementExpression';
        case 133 /* PrintIntrinsic */:
            return 'PrintIntrinsic';
        case 134 /* PropertyAccessExpression */:
            return 'PropertyAccessExpression';
        case 135 /* PropertyDeclaration */:
            return 'PropertyDeclaration';
        case 136 /* PropertyElement */:
            return 'PropertyElement';
        case 137 /* PropertyElementList */:
            return 'PropertyElementList';
        case 138 /* PropertyInitialiser */:
            return 'PropertyInitialiser';
        case 139 /* QualifiedName */:
            return 'QualifiedName';
        case 140 /* QualifiedNameList */:
            return 'QualifiedNameList';
        case 141 /* RelationalExpression */:
            return 'RelationalExpression';
        case 142 /* RelativeQualifiedName */:
            return 'RelativeQualifiedName';
        case 143 /* RelativeScope */:
            return 'RelativeScope';
        case 144 /* RequireExpression */:
            return 'RequireExpression';
        case 145 /* RequireOnceExpression */:
            return 'RequireOnceExpression';
        case 146 /* ReturnStatement */:
            return 'ReturnStatement';
        case 147 /* ReturnType */:
            return 'ReturnType';
        case 148 /* ScopedCallExpression */:
            return 'ScopedCallExpression';
        case 149 /* ScopedMemberName */:
            return 'ScopedMemberName';
        case 150 /* ScopedPropertyAccessExpression */:
            return 'ScopedPropertyAccessExpression';
        case 151 /* ShellCommandExpression */:
            return 'ShellCommandExpression';
        case 152 /* ShiftExpression */:
            return 'ShiftExpression';
        case 153 /* SimpleAssignmentExpression */:
            return 'SimpleAssignmentExpression';
        case 154 /* SimpleVariable */:
            return 'SimpleVariable';
        case 155 /* StatementList */:
            return 'StatementList';
        case 156 /* StaticVariableDeclaration */:
            return 'StaticVariableDeclaration';
        case 157 /* StaticVariableDeclarationList */:
            return 'StaticVariableDeclarationList';
        case 158 /* SubscriptExpression */:
            return 'SubscriptExpression';
        case 159 /* SwitchStatement */:
            return 'SwitchStatement';
        case 160 /* ThrowStatement */:
            return 'ThrowStatement';
        case 161 /* TraitAdaptationList */:
            return 'TraitAdaptationList';
        case 162 /* TraitAlias */:
            return 'TraitAlias';
        case 163 /* TraitDeclaration */:
            return 'TraitDeclaration';
        case 164 /* TraitDeclarationBody */:
            return 'TraitDeclarationBody';
        case 165 /* TraitDeclarationHeader */:
            return 'TraitDeclarationHeader';
        case 166 /* TraitMemberDeclarationList */:
            return 'TraitMemberDeclarationList';
        case 167 /* TraitPrecedence */:
            return 'TraitPrecedence';
        case 168 /* TraitUseClause */:
            return 'TraitUseClause';
        case 169 /* TraitUseSpecification */:
            return 'TraitUseSpecification';
        case 170 /* TryStatement */:
            return 'TryStatement';
        case 171 /* TypeDeclaration */:
            return 'TypeDeclaration';
        case 172 /* UnaryOpExpression */:
            return 'UnaryOpExpression';
        case 173 /* UnsetIntrinsic */:
            return 'UnsetIntrinsic';
        case 174 /* VariableList */:
            return 'VariableList';
        case 175 /* VariableNameList */:
            return 'VariableNameList';
        case 176 /* VariadicUnpacking */:
            return 'VariadicUnpacking';
        case 177 /* WhileStatement */:
            return 'WhileStatement';
        case 178 /* YieldExpression */:
            return 'YieldExpression';
        case 179 /* YieldFromExpression */:
            return 'YieldFromExpression';
        default:
            return '';
    }
}
exports.phraseTypeToString = phraseTypeToString;
