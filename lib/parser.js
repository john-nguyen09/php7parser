/* Copyright (c) Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("./lexer");
var Parser;
(function (Parser) {
    function precedenceAssociativityTuple(t) {
        switch (t.tokenType) {
            case 113 /* AsteriskAsterisk */:
                return [48, 2 /* Right */];
            case 135 /* PlusPlus */:
                return [47, 2 /* Right */];
            case 129 /* MinusMinus */:
                return [47, 2 /* Right */];
            case 86 /* Tilde */:
                return [47, 2 /* Right */];
            case 152 /* IntegerCast */:
                return [47, 2 /* Right */];
            case 153 /* FloatCast */:
                return [47, 2 /* Right */];
            case 150 /* StringCast */:
                return [47, 2 /* Right */];
            case 155 /* ArrayCast */:
                return [47, 2 /* Right */];
            case 151 /* ObjectCast */:
                return [47, 2 /* Right */];
            case 148 /* BooleanCast */:
                return [47, 2 /* Right */];
            case 94 /* AtSymbol */:
                return [47, 2 /* Right */];
            case 43 /* InstanceOf */:
                return [46, 0 /* None */];
            case 89 /* Exclamation */:
                return [45, 2 /* Right */];
            case 101 /* Asterisk */:
                return [44, 1 /* Left */];
            case 91 /* ForwardSlash */:
                return [44, 1 /* Left */];
            case 92 /* Percent */:
                return [44, 1 /* Left */];
            case 111 /* Plus */:
                return [43, 1 /* Left */];
            case 143 /* Minus */:
                return [43, 1 /* Left */];
            case 126 /* Dot */:
                return [43, 1 /* Left */];
            case 106 /* LessThanLessThan */:
                return [42, 1 /* Left */];
            case 108 /* GreaterThanGreaterThan */:
                return [42, 1 /* Left */];
            case 99 /* LessThan */:
                return [41, 0 /* None */];
            case 100 /* GreaterThan */:
                return [41, 0 /* None */];
            case 141 /* LessThanEquals */:
                return [41, 0 /* None */];
            case 137 /* GreaterThanEquals */:
                return [41, 0 /* None */];
            case 136 /* EqualsEquals */:
                return [40, 0 /* None */];
            case 138 /* EqualsEqualsEquals */:
                return [40, 0 /* None */];
            case 139 /* ExclamationEquals */:
                return [40, 0 /* None */];
            case 140 /* ExclamationEqualsEquals */:
                return [40, 0 /* None */];
            case 142 /* Spaceship */:
                return [40, 0 /* None */];
            case 103 /* Ampersand */:
                return [39, 1 /* Left */];
            case 125 /* Caret */:
                return [38, 1 /* Left */];
            case 123 /* Bar */:
                return [37, 1 /* Left */];
            case 102 /* AmpersandAmpersand */:
                return [36, 1 /* Left */];
            case 124 /* BarBar */:
                return [35, 1 /* Left */];
            case 122 /* QuestionQuestion */:
                return [34, 2 /* Right */];
            case 96 /* Question */:
                return [33, 1 /* Left */]; //?: ternary
            case 85 /* Equals */:
                return [32, 2 /* Right */];
            case 127 /* DotEquals */:
                return [32, 2 /* Right */];
            case 112 /* PlusEquals */:
                return [32, 2 /* Right */];
            case 144 /* MinusEquals */:
                return [32, 2 /* Right */];
            case 146 /* AsteriskEquals */:
                return [32, 2 /* Right */];
            case 130 /* ForwardslashEquals */:
                return [32, 2 /* Right */];
            case 145 /* PercentEquals */:
                return [32, 2 /* Right */];
            case 114 /* AsteriskAsteriskEquals */:
                return [32, 2 /* Right */];
            case 104 /* AmpersandEquals */:
                return [32, 2 /* Right */];
            case 110 /* BarEquals */:
                return [32, 2 /* Right */];
            case 105 /* CaretEquals */:
                return [32, 2 /* Right */];
            case 107 /* LessThanLessThanEquals */:
                return [32, 2 /* Right */];
            case 109 /* GreaterThanGreaterThanEquals */:
                return [32, 2 /* Right */];
            case 48 /* And */:
                return [31, 1 /* Left */];
            case 50 /* Xor */:
                return [30, 1 /* Left */];
            case 49 /* Or */:
                return [29, 1 /* Left */];
            default:
                throwUnexpectedTokenError(t);
        }
    }
    const statementListRecoverSet = [
        66 /* Use */,
        38 /* HaltCompiler */,
        12 /* Const */,
        35 /* Function */,
        9 /* Class */,
        2 /* Abstract */,
        31 /* Final */,
        63 /* Trait */,
        45 /* Interface */,
        116 /* OpenBrace */,
        39 /* If */,
        68 /* While */,
        16 /* Do */,
        33 /* For */,
        61 /* Switch */,
        5 /* Break */,
        13 /* Continue */,
        59 /* Return */,
        36 /* Global */,
        60 /* Static */,
        17 /* Echo */,
        65 /* Unset */,
        34 /* ForEach */,
        14 /* Declare */,
        64 /* Try */,
        62 /* Throw */,
        37 /* Goto */,
        88 /* Semicolon */,
        158 /* CloseTag */,
    ];
    const classMemberDeclarationListRecoverSet = [
        55 /* Public */,
        56 /* Protected */,
        54 /* Private */,
        60 /* Static */,
        2 /* Abstract */,
        31 /* Final */,
        35 /* Function */,
        67 /* Var */,
        12 /* Const */,
        66 /* Use */
    ];
    const encapsulatedVariableListRecoverSet = [
        80 /* EncapsulatedAndWhitespace */,
        131 /* DollarCurlyOpen */,
        128 /* CurlyOpen */
    ];
    function binaryOpToPhraseType(t) {
        switch (t.tokenType) {
            case 96 /* Question */:
                return 40 /* TernaryExpression */;
            case 126 /* Dot */:
            case 111 /* Plus */:
            case 143 /* Minus */:
                return 1 /* AdditiveExpression */;
            case 123 /* Bar */:
            case 103 /* Ampersand */:
            case 125 /* Caret */:
                return 14 /* BitwiseExpression */;
            case 101 /* Asterisk */:
            case 91 /* ForwardSlash */:
            case 92 /* Percent */:
                return 115 /* MultiplicativeExpression */;
            case 113 /* AsteriskAsterisk */:
                return 70 /* ExponentiationExpression */;
            case 106 /* LessThanLessThan */:
            case 108 /* GreaterThanGreaterThan */:
                return 152 /* ShiftExpression */;
            case 102 /* AmpersandAmpersand */:
            case 124 /* BarBar */:
            case 48 /* And */:
            case 49 /* Or */:
            case 50 /* Xor */:
                return 107 /* LogicalExpression */;
            case 138 /* EqualsEqualsEquals */:
            case 140 /* ExclamationEqualsEquals */:
            case 136 /* EqualsEquals */:
            case 139 /* ExclamationEquals */:
                return 59 /* EqualityExpression */;
            case 99 /* LessThan */:
            case 141 /* LessThanEquals */:
            case 100 /* GreaterThan */:
            case 137 /* GreaterThanEquals */:
            case 142 /* Spaceship */:
                return 141 /* RelationalExpression */;
            case 122 /* QuestionQuestion */:
                return 37 /* CoalesceExpression */;
            case 85 /* Equals */:
                return 153 /* SimpleAssignmentExpression */;
            case 112 /* PlusEquals */:
            case 144 /* MinusEquals */:
            case 146 /* AsteriskEquals */:
            case 114 /* AsteriskAsteriskEquals */:
            case 130 /* ForwardslashEquals */:
            case 127 /* DotEquals */:
            case 145 /* PercentEquals */:
            case 104 /* AmpersandEquals */:
            case 110 /* BarEquals */:
            case 105 /* CaretEquals */:
            case 107 /* LessThanLessThanEquals */:
            case 109 /* GreaterThanGreaterThanEquals */:
                return 38 /* CompoundAssignmentExpression */;
            case 43 /* InstanceOf */:
                return 98 /* InstanceOfExpression */;
            default:
                return 0 /* Unknown */;
        }
    }
    var tokenBuffer;
    var phraseStack;
    var errorPhrase;
    var recoverSetStack;
    function parse(text) {
        init(text);
        return statementList([1 /* EndOfFile */]);
    }
    Parser.parse = parse;
    function init(text, lexerModeStack) {
        lexer_1.Lexer.setInput(text, lexerModeStack);
        phraseStack = [];
        tokenBuffer = [];
        recoverSetStack = [];
        errorPhrase = null;
    }
    function start(phrase, dontPushHiddenToParent) {
        //parent node gets hidden tokens between children
        if (!dontPushHiddenToParent) {
            hidden();
        }
        phraseStack.push(phrase);
        return phrase;
    }
    function end() {
        return phraseStack.pop();
    }
    function hidden() {
        let p = phraseStack[phraseStack.length - 1];
        let t;
        while (true) {
            t = tokenBuffer.length ? tokenBuffer.shift() : lexer_1.Lexer.lex();
            if (t.tokenType < 159 /* Comment */) {
                tokenBuffer.unshift(t);
                break;
            }
            else {
                p.children.push(t);
            }
        }
    }
    function optional(tokenType) {
        if (tokenType === peek().tokenType) {
            errorPhrase = null;
            return next();
        }
        else {
            return null;
        }
    }
    function optionalOneOf(tokenTypes) {
        if (tokenTypes.indexOf(peek().tokenType) >= 0) {
            errorPhrase = null;
            return next();
        }
        else {
            return null;
        }
    }
    function next(doNotPush) {
        let t = tokenBuffer.length ? tokenBuffer.shift() : lexer_1.Lexer.lex();
        if (t.tokenType === 1 /* EndOfFile */) {
            return t;
        }
        if (t.tokenType >= 159 /* Comment */) {
            //hidden token
            phraseStack[phraseStack.length - 1].children.push(t);
            return next(doNotPush);
        }
        else if (!doNotPush) {
            phraseStack[phraseStack.length - 1].children.push(t);
        }
        return t;
    }
    function expect(tokenType) {
        let t = peek();
        if (t.tokenType === tokenType) {
            errorPhrase = null;
            return next();
        }
        else if (tokenType === 88 /* Semicolon */ && t.tokenType === 158 /* CloseTag */) {
            //implicit end statement
            return t;
        }
        else {
            error();
            //test skipping a single token to sync
            if (peek(1).tokenType === tokenType) {
                let predicate = (x) => { return x.tokenType === tokenType; };
                skip(predicate);
                errorPhrase = null;
                return next(); //tokenType
            }
            return null;
        }
    }
    function expectOneOf(tokenTypes) {
        let t = peek();
        if (tokenTypes.indexOf(t.tokenType) >= 0) {
            errorPhrase = null;
            return next();
        }
        else if (tokenTypes.indexOf(88 /* Semicolon */) >= 0 && t.tokenType === 158 /* CloseTag */) {
            //implicit end statement
            return t;
        }
        else {
            error();
            //test skipping single token to sync
            if (tokenTypes.indexOf(peek(1).tokenType) >= 0) {
                let predicate = (x) => { return tokenTypes.indexOf(x.tokenType) >= 0; };
                skip(predicate);
                errorPhrase = null;
                return next(); //tokenType
            }
            return null;
        }
    }
    function peek(n) {
        let k = n ? n + 1 : 1;
        let bufferPos = -1;
        let t;
        while (true) {
            ++bufferPos;
            if (bufferPos === tokenBuffer.length) {
                tokenBuffer.push(lexer_1.Lexer.lex());
            }
            t = tokenBuffer[bufferPos];
            if (t.tokenType < 159 /* Comment */) {
                //not a hidden token
                --k;
            }
            if (t.tokenType === 1 /* EndOfFile */ || k === 0) {
                break;
            }
        }
        return t;
    }
    /**
     * skipped tokens get pushed to error phrase children
     */
    function skip(predicate) {
        let t;
        let nSkipped = 0;
        while (true) {
            t = tokenBuffer.length ? tokenBuffer.shift() : lexer_1.Lexer.lex();
            if (predicate(t) || t.tokenType === 1 /* EndOfFile */) {
                tokenBuffer.unshift(t);
                errorPhrase.errors[errorPhrase.errors.length - 1].numberSkipped = nSkipped;
                break;
            }
            else {
                ++nSkipped;
                errorPhrase.children.push(t);
            }
        }
    }
    function error() {
        //dont report errors if recovering from another
        if (errorPhrase) {
            return;
        }
        errorPhrase = phraseStack[phraseStack.length - 1];
        if (!errorPhrase.errors) {
            errorPhrase.errors = [];
        }
        let t = peek();
        errorPhrase.errors.push({
            unexpected: t,
            numberSkipped: 0
        });
    }
    function list(phraseType, elementFunction, elementStartPredicate, breakOn, recoverSet) {
        let p = start({
            phraseType: phraseType,
            elements: [],
            children: []
        });
        let t;
        let recoveryAttempted = false;
        let listRecoverSet = recoverSet ? recoverSet.slice(0) : [];
        let element;
        if (breakOn) {
            Array.prototype.push.apply(listRecoverSet, breakOn);
        }
        recoverSetStack.push(listRecoverSet);
        while (true) {
            t = peek();
            if (elementStartPredicate(t)) {
                recoveryAttempted = false;
                element = elementFunction();
                p.children.push(element);
                p.elements.push(element);
            }
            else if (!breakOn || breakOn.indexOf(t.tokenType) >= 0 || recoveryAttempted) {
                break;
            }
            else {
                error();
                //attempt to sync with token stream
                t = peek(1);
                if (elementStartPredicate(t) || breakOn.indexOf(t.tokenType) >= 0) {
                    skip((x) => { return x === t; });
                }
                else {
                    defaultSyncStrategy();
                }
                recoveryAttempted = true;
            }
        }
        recoverSetStack.pop();
        return end();
    }
    function defaultSyncStrategy() {
        let mergedRecoverTokenTypeArray = [];
        for (let n = recoverSetStack.length - 1; n >= 0; --n) {
            Array.prototype.push.apply(mergedRecoverTokenTypeArray, recoverSetStack[n]);
        }
        let mergedRecoverTokenTypeSet = new Set(mergedRecoverTokenTypeArray);
        let predicate = (x) => { return mergedRecoverTokenTypeSet.has(x.tokenType); };
        skip(predicate);
    }
    function isListPhrase(phraseType) {
        switch (phraseType) {
            case 155 /* StatementList */:
                return true;
            default:
                false;
        }
    }
    function statementList(breakOn) {
        return list(155 /* StatementList */, statement, isStatementStart, breakOn, statementListRecoverSet);
    }
    function constDeclaration() {
        let p = start({
            phraseType: 42 /* ConstDeclaration */,
            constElementList: null,
            children: []
        });
        next(); //const
        p.children.push(p.constElementList = delimitedList(44 /* ConstElementList */, constElement, isConstElementStartToken, 93 /* Comma */, [88 /* Semicolon */]));
        expect(88 /* Semicolon */);
        return end();
    }
    function isClassConstElementStartToken(t) {
        return t.tokenType === 83 /* Name */ || isSemiReservedToken(t);
    }
    function isConstElementStartToken(t) {
        return t.tokenType === 83 /* Name */;
    }
    function constElement() {
        let p = start({
            phraseType: 43 /* ConstElement */,
            name: null,
            value: null,
            children: []
        });
        p.name = expect(83 /* Name */);
        expect(85 /* Equals */);
        p.children.push(p.value = expression(0));
        return end();
    }
    function expression(minPrecedence) {
        let precedence;
        let associativity;
        let op;
        let lhs = expressionAtom();
        let p;
        let rhs;
        let binaryPhraseType;
        while (true) {
            op = peek();
            binaryPhraseType = binaryOpToPhraseType(op);
            if (binaryPhraseType === 0 /* Unknown */) {
                break;
            }
            [precedence, associativity] = precedenceAssociativityTuple(op);
            if (precedence < minPrecedence) {
                break;
            }
            if (associativity === 1 /* Left */) {
                ++precedence;
            }
            if (binaryPhraseType === 40 /* TernaryExpression */) {
                lhs = ternaryExpression(lhs);
                continue;
            }
            p = start({
                phraseType: binaryPhraseType,
                left: lhs,
                operator: null,
                right: null,
                children: []
            }, true);
            p.children.push(lhs);
            p.operator = next();
            if (binaryPhraseType === 98 /* InstanceOfExpression */) {
                p.children.push(p.right = typeDesignator(99 /* InstanceofTypeDesignator */));
            }
            else {
                if (binaryPhraseType === 153 /* SimpleAssignmentExpression */ &&
                    peek().tokenType === 103 /* Ampersand */) {
                    next(); //&
                    p.phraseType = 16 /* ByRefAssignmentExpression */;
                }
                p.children.push(p.right = expression(precedence));
            }
            lhs = end();
        }
        return lhs;
    }
    function ternaryExpression(testExpr) {
        let p = start({
            phraseType: 40 /* TernaryExpression */,
            testExpr: testExpr,
            falseExpr: null,
            children: []
        }, true);
        p.children.push(testExpr);
        next(); //?
        if (optional(87 /* Colon */)) {
            p.children.push(p.falseExpr = expression(0));
        }
        else {
            p.children.push(p.trueExpr = expression(0));
            expect(87 /* Colon */);
            p.children.push(p.falseExpr = expression(0));
        }
        return end();
    }
    function variableOrExpression() {
        let part = variableAtom();
        let isVariable = part.phraseType === 154 /* SimpleVariable */;
        if (isDereferenceOperator(peek())) {
            part = variable(part);
            isVariable = true;
        }
        else {
            switch (part.phraseType) {
                case 139 /* QualifiedName */:
                    part = constantAccessExpression(part);
                    break;
                default:
                    break;
            }
        }
        if (!isVariable) {
            return part;
        }
        //check for post increment/decrement
        let t = peek();
        if (t.tokenType === 135 /* PlusPlus */) {
            return postfixExpression(130 /* PostfixIncrementExpression */, part);
        }
        else if (t.tokenType === 129 /* MinusMinus */) {
            return postfixExpression(129 /* PostfixDecrementExpression */, part);
        }
        else {
            return part;
        }
    }
    function constantAccessExpression(qName) {
        let p = start({
            phraseType: 41 /* ConstantAccessExpression */,
            name: null,
            children: []
        }, true);
        p.children.push(p.name = qName);
        return end();
    }
    function postfixExpression(phraseType, variableNode) {
        let p = start({
            phraseType: phraseType,
            operand: null,
            operator: null,
            children: []
        }, true);
        p.children.push(p.operand = variableNode);
        p.operator = next(); //operator
        return end();
    }
    function isDereferenceOperator(t) {
        switch (t.tokenType) {
            case 117 /* OpenBracket */:
            case 116 /* OpenBrace */:
            case 115 /* Arrow */:
            case 118 /* OpenParenthesis */:
            case 133 /* ColonColon */:
                return true;
            default:
                return false;
        }
    }
    function expressionAtom() {
        let t = peek();
        switch (t.tokenType) {
            case 60 /* Static */:
                if (peek(1).tokenType === 35 /* Function */) {
                    return anonymousFunctionCreationExpression();
                }
                else {
                    return variableOrExpression();
                }
            case 78 /* StringLiteral */:
                if (isDereferenceOperator(peek(1))) {
                    return variableOrExpression();
                }
                else {
                    return next(true);
                }
            case 84 /* VariableName */:
            case 90 /* Dollar */:
            case 3 /* Array */:
            case 117 /* OpenBracket */:
            case 147 /* Backslash */:
            case 83 /* Name */:
            case 51 /* Namespace */:
            case 118 /* OpenParenthesis */:
                return variableOrExpression();
            case 135 /* PlusPlus */:
                return unaryExpression(132 /* PrefixIncrementExpression */);
            case 129 /* MinusMinus */:
                return unaryExpression(131 /* PrefixDecrementExpression */);
            case 111 /* Plus */:
            case 143 /* Minus */:
            case 89 /* Exclamation */:
            case 86 /* Tilde */:
                return unaryExpression(172 /* UnaryOpExpression */);
            case 94 /* AtSymbol */:
                return unaryExpression(62 /* ErrorControlExpression */);
            case 152 /* IntegerCast */:
            case 153 /* FloatCast */:
            case 150 /* StringCast */:
            case 155 /* ArrayCast */:
            case 151 /* ObjectCast */:
            case 148 /* BooleanCast */:
            case 149 /* UnsetCast */:
                return unaryExpression(19 /* CastExpression */);
            case 47 /* List */:
                return listIntrinsic();
            case 11 /* Clone */:
                return cloneExpression();
            case 52 /* New */:
                return objectCreationExpression();
            case 79 /* FloatingLiteral */:
            case 82 /* IntegerLiteral */:
            case 73 /* LineConstant */:
            case 72 /* FileConstant */:
            case 71 /* DirectoryConstant */:
            case 77 /* TraitConstant */:
            case 75 /* MethodConstant */:
            case 74 /* FunctionConstant */:
            case 76 /* NamespaceConstant */:
            case 10 /* ClassConstant */:
                return next(true);
            case 154 /* StartHeredoc */:
                return heredocStringLiteral();
            case 97 /* DoubleQuote */:
                return doubleQuotedStringLiteral();
            case 95 /* Backtick */:
                return shellCommandExpression();
            case 53 /* Print */:
                return printIntrinsic();
            case 69 /* Yield */:
                return yieldExpression();
            case 70 /* YieldFrom */:
                return yieldFromExpression();
            case 35 /* Function */:
                return anonymousFunctionCreationExpression();
            case 41 /* Include */:
                return scriptInclusion(95 /* IncludeExpression */);
            case 42 /* IncludeOnce */:
                return scriptInclusion(96 /* IncludeOnceExpression */);
            case 57 /* Require */:
                return scriptInclusion(144 /* RequireExpression */);
            case 58 /* RequireOnce */:
                return scriptInclusion(145 /* RequireOnceExpression */);
            case 28 /* Eval */:
                return evalIntrinsic();
            case 20 /* Empty */:
                return emptyIntrinsic();
            case 29 /* Exit */:
                return exitIntrinsic();
            case 46 /* Isset */:
                return issetIntrinsic();
            default:
                //error
                start({ phraseType: 63 /* ErrorExpression */, children: [] });
                error();
                return end();
        }
    }
    function exitIntrinsic() {
        let p = start({
            phraseType: 69 /* ExitIntrinsic */,
            children: []
        });
        next(); //exit or die
        if (optional(118 /* OpenParenthesis */)) {
            if (isExpressionStart(peek())) {
                p.expr = expression(0);
                p.children.push(p.expr);
            }
            expect(121 /* CloseParenthesis */);
        }
        return end();
    }
    function issetIntrinsic() {
        let p = start({
            phraseType: 105 /* IssetIntrinsic */,
            variableList: null,
            children: []
        });
        next(); //isset
        expect(118 /* OpenParenthesis */);
        p.variableList = variableList([121 /* CloseParenthesis */]);
        p.children.push(p.variableList);
        expect(121 /* CloseParenthesis */);
        return end();
    }
    function emptyIntrinsic() {
        let p = start({
            phraseType: 55 /* EmptyIntrinsic */,
            expr: null,
            children: []
        });
        next(); //keyword
        expect(118 /* OpenParenthesis */);
        p.expr = expression(0);
        p.children.push(p.expr);
        expect(121 /* CloseParenthesis */);
        return end();
    }
    function evalIntrinsic() {
        let p = start({
            phraseType: 68 /* EvalIntrinsic */,
            expr: null,
            children: []
        });
        next(); //keyword
        expect(118 /* OpenParenthesis */);
        p.expr = expression(0);
        p.children.push(p.expr);
        expect(121 /* CloseParenthesis */);
        return end();
    }
    function scriptInclusion(phraseType) {
        let p = start({
            phraseType: phraseType,
            expr: null,
            children: []
        });
        next(); //keyword
        p.expr = expression(0);
        p.children.push(p.expr);
        return end();
    }
    function printIntrinsic() {
        let p = start({
            phraseType: 133 /* PrintIntrinsic */,
            expr: null,
            children: []
        });
        next(); //keyword
        p.expr = expression(0);
        p.children.push(p.expr);
        return end();
    }
    function yieldFromExpression() {
        let p = start({
            phraseType: 179 /* YieldFromExpression */,
            expr: null,
            children: []
        });
        next(); //keyword
        p.expr = expression(0);
        p.children.push(p.expr);
        return end();
    }
    function yieldExpression() {
        let p = start({
            phraseType: 178 /* YieldExpression */,
            children: []
        });
        next(); //yield
        if (!isExpressionStart(peek())) {
            return end();
        }
        let keyOrValue = expression(0);
        p.children.push(keyOrValue);
        if (optional(132 /* FatArrow */)) {
            p.key = keyOrValue;
            p.value = expression(0);
            p.children.push(p.value);
        }
        else {
            p.value = keyOrValue;
        }
        return end();
    }
    function shellCommandExpression() {
        let p = start({
            phraseType: 151 /* ShellCommandExpression */,
            encapsulatedVariableList: null,
            children: []
        });
        next(); //`
        p.encapsulatedVariableList = encapsulatedVariableList(95 /* Backtick */);
        p.children.push(p.encapsulatedVariableList);
        expect(95 /* Backtick */);
        return end();
    }
    function doubleQuotedStringLiteral() {
        let p = start({
            phraseType: 50 /* DoubleQuotedStringLiteral */,
            encapsulatedVariableList: null,
            children: []
        });
        next(); //"
        p.encapsulatedVariableList = encapsulatedVariableList(97 /* DoubleQuote */);
        p.children.push(p.encapsulatedVariableList);
        expect(97 /* DoubleQuote */);
        return end();
    }
    function encapsulatedVariableList(breakOn) {
        return list(58 /* EncapsulatedVariableList */, encapsulatedVariable, isEncapsulatedVariableStart, [breakOn], encapsulatedVariableListRecoverSet);
    }
    function isEncapsulatedVariableStart(t) {
        switch (t.tokenType) {
            case 80 /* EncapsulatedAndWhitespace */:
            case 84 /* VariableName */:
            case 131 /* DollarCurlyOpen */:
            case 128 /* CurlyOpen */:
                return true;
            default:
                return false;
        }
    }
    function encapsulatedVariable() {
        switch (peek().tokenType) {
            case 80 /* EncapsulatedAndWhitespace */:
                return next(true);
            case 84 /* VariableName */:
                let t = peek(1);
                if (t.tokenType === 117 /* OpenBracket */) {
                    return encapsulatedDimension();
                }
                else if (t.tokenType === 115 /* Arrow */) {
                    return encapsulatedProperty();
                }
                else {
                    return simpleVariable();
                }
            case 131 /* DollarCurlyOpen */:
                return dollarCurlyOpenEncapsulatedVariable();
            case 128 /* CurlyOpen */:
                return curlyOpenEncapsulatedVariable();
            default:
                throwUnexpectedTokenError(peek());
        }
    }
    function curlyOpenEncapsulatedVariable() {
        let p = start({
            phraseType: 57 /* EncapsulatedVariable */,
            variable: null,
            children: []
        });
        next(); //{
        p.variable = variable(variableAtom());
        p.children.push(p.variable);
        expect(119 /* CloseBrace */);
        return end();
    }
    function dollarCurlyOpenEncapsulatedVariable() {
        let p = start({
            phraseType: 57 /* EncapsulatedVariable */,
            variable: null,
            children: []
        });
        next(); //${
        let t = peek();
        if (t.tokenType === 84 /* VariableName */) {
            if (peek(1).tokenType === 117 /* OpenBracket */) {
                p.variable = dollarCurlyEncapsulatedDimension();
                p.children.push(p.variable);
            }
            else {
                let sv = start({
                    phraseType: 154 /* SimpleVariable */,
                    name: null,
                    children: []
                });
                sv.name = next();
                p.variable = end();
                p.children.push(p.variable);
            }
        }
        else if (isExpressionStart(t)) {
            p.children.push(p.variable = expression(0));
        }
        else {
            error();
        }
        expect(119 /* CloseBrace */);
        return end();
    }
    function dollarCurlyEncapsulatedDimension() {
        let p = start({
            phraseType: 158 /* SubscriptExpression */,
            dereferencable: null,
            offset: null,
            children: []
        });
        p.dereferencable = next(); //VariableName
        next(); // [
        p.children.push(p.offset = expression(0));
        expect(120 /* CloseBracket */);
        return end();
    }
    function encapsulatedDimension() {
        let p = start({
            phraseType: 158 /* SubscriptExpression */,
            dereferencable: null,
            offset: null,
            children: []
        });
        p.children.push(p.dereferencable = simpleVariable()); //T_VARIABLE
        next(); //[
        switch (peek().tokenType) {
            case 83 /* Name */:
            case 82 /* IntegerLiteral */:
                p.offset = next();
                break;
            case 84 /* VariableName */:
                p.children.push(p.offset = simpleVariable());
                break;
            case 143 /* Minus */:
                let u = start({
                    phraseType: 172 /* UnaryOpExpression */,
                    operand: null,
                    operator: null,
                    children: []
                });
                u.operator = next(); //-
                u.operand = expect(82 /* IntegerLiteral */);
                p.children.push(p.offset = end());
                break;
            default:
                //error
                error();
                break;
        }
        expect(120 /* CloseBracket */);
        return end();
    }
    function encapsulatedProperty() {
        let p = start({
            phraseType: 134 /* PropertyAccessExpression */,
            variable: null,
            memberName: null,
            children: []
        });
        p.children.push(p.variable = simpleVariable());
        next(); //->
        p.memberName = expect(83 /* Name */);
        return end();
    }
    function heredocStringLiteral() {
        let p = start({
            phraseType: 92 /* HeredocStringLiteral */,
            encapsulatedVariableList: null,
            children: []
        });
        next(); //StartHeredoc
        p.children.push(p.encapsulatedVariableList = encapsulatedVariableList(27 /* EndHeredoc */));
        expect(27 /* EndHeredoc */);
        return end();
    }
    function anonymousClassDeclaration() {
        let p = start({
            phraseType: 2 /* AnonymousClassDeclaration */,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = anonymousClassDeclarationHeader(), p.body = TypeDeclarationBody(29 /* ClassDeclarationBody */, isClassMemberStart, classMemberDeclarationList));
        return end();
    }
    function anonymousClassDeclarationHeader() {
        let p = start({
            phraseType: 3 /* AnonymousClassDeclarationHeader */,
            children: []
        });
        next(); //class
        if (optional(118 /* OpenParenthesis */)) {
            if (isArgumentStart(peek())) {
                p.children.push(p.argumentList = argumentList());
            }
            expect(121 /* CloseParenthesis */);
        }
        if (peek().tokenType === 30 /* Extends */) {
            p.children.push(p.baseClause = classBaseClause());
        }
        if (peek().tokenType === 40 /* Implements */) {
            p.children.push(p.interfaceClause = classInterfaceClause());
        }
        return end();
    }
    function classInterfaceClause() {
        let p = start({
            phraseType: 31 /* ClassInterfaceClause */,
            nameList: null,
            children: []
        });
        next(); //implements
        p.children.push(p.nameList = qualifiedNameList([116 /* OpenBrace */]));
        return end();
    }
    function classMemberDeclarationList() {
        return list(32 /* ClassMemberDeclarationList */, classMemberDeclaration, isClassMemberStart, [119 /* CloseBrace */], classMemberDeclarationListRecoverSet);
    }
    function isClassMemberStart(t) {
        switch (t.tokenType) {
            case 55 /* Public */:
            case 56 /* Protected */:
            case 54 /* Private */:
            case 60 /* Static */:
            case 2 /* Abstract */:
            case 31 /* Final */:
            case 35 /* Function */:
            case 67 /* Var */:
            case 12 /* Const */:
            case 66 /* Use */:
                return true;
            default:
                return false;
        }
    }
    function classMemberDeclaration() {
        let p = start({
            phraseType: 60 /* ErrorClassMemberDeclaration */,
            children: []
        });
        let t = peek();
        switch (t.tokenType) {
            case 55 /* Public */:
            case 56 /* Protected */:
            case 54 /* Private */:
            case 60 /* Static */:
            case 2 /* Abstract */:
            case 31 /* Final */:
                let modifiers = memberModifierList();
                t = peek();
                if (t.tokenType === 84 /* VariableName */) {
                    p.children.push(p.modifierList = modifiers);
                    return propertyDeclaration(p);
                }
                else if (t.tokenType === 35 /* Function */) {
                    return methodDeclaration(p, modifiers);
                }
                else if (t.tokenType === 12 /* Const */) {
                    p.children.push(modifiers);
                    return classConstDeclaration(p);
                }
                else {
                    //error
                    error();
                    return end();
                }
            case 35 /* Function */:
                return methodDeclaration(p, null);
            case 67 /* Var */:
                next();
                return propertyDeclaration(p);
            case 12 /* Const */:
                return classConstDeclaration(p);
            case 66 /* Use */:
                return traitUseClause();
            default:
                //should not get here
                throwUnexpectedTokenError(t);
        }
    }
    function throwUnexpectedTokenError(t) {
        throw new Error(`Unexpected token: ${t.tokenType}`);
    }
    function traitUseClause() {
        let p = start({
            phraseType: 168 /* TraitUseClause */,
            nameList: null,
            specification: null,
            children: []
        });
        next(); //use
        p.children.push(p.nameList = qualifiedNameList([88 /* Semicolon */, 116 /* OpenBrace */]));
        p.children.push(p.specification = traitUseSpecification());
        return end();
    }
    function traitUseSpecification() {
        let p = start({
            phraseType: 169 /* TraitUseSpecification */,
            children: []
        });
        let t = expectOneOf([88 /* Semicolon */, 116 /* OpenBrace */]);
        if (t.tokenType === 116 /* OpenBrace */) {
            if (isTraitAdaptationStart(peek())) {
                p.children.push(p.adaptationList = traitAdaptationList());
            }
            expect(119 /* CloseBrace */);
        }
        return end();
    }
    function traitAdaptationList() {
        return list(161 /* TraitAdaptationList */, traitAdaptation, isTraitAdaptationStart, [119 /* CloseBrace */]);
    }
    function isTraitAdaptationStart(t) {
        switch (t.tokenType) {
            case 83 /* Name */:
            case 147 /* Backslash */:
            case 51 /* Namespace */:
                return true;
            default:
                return isSemiReservedToken(t);
        }
    }
    function traitAdaptation() {
        let p = start({
            phraseType: 65 /* ErrorTraitAdaptation */,
            children: []
        });
        let t = peek();
        let t2 = peek(1);
        if (t.tokenType === 51 /* Namespace */ ||
            t.tokenType === 147 /* Backslash */ ||
            (t.tokenType === 83 /* Name */ &&
                (t2.tokenType === 133 /* ColonColon */ || t2.tokenType === 147 /* Backslash */))) {
            p.children.push(p.method = methodReference());
            if (peek().tokenType === 44 /* InsteadOf */) {
                next();
                return traitPrecedence(p);
            }
        }
        else if (t.tokenType === 83 /* Name */ || isSemiReservedToken(t)) {
            let methodRef = start({
                phraseType: 114 /* MethodReference */,
                methodName: null,
                children: []
            });
            methodRef.children.push(methodRef.methodName = identifier());
            p.children.push(p.method = end());
        }
        else {
            //error
            error();
            return end();
        }
        return traitAlias(p);
    }
    function traitAlias(p) {
        p.phraseType = 162 /* TraitAlias */;
        expect(4 /* As */);
        let t = peek();
        if (t.tokenType === 83 /* Name */ || isReservedToken(t)) {
            p.children.push(p.alias = identifier());
        }
        else if (isMemberModifier(t)) {
            p.modifier = next();
            t = peek();
            if (t.tokenType === 83 /* Name */ || isSemiReservedToken(t)) {
                p.children.push(p.alias = identifier());
            }
        }
        else {
            error();
        }
        expect(88 /* Semicolon */);
        return end();
    }
    function traitPrecedence(p) {
        p.phraseType = 167 /* TraitPrecedence */;
        p.children.push(p.insteadOfNameList = qualifiedNameList([88 /* Semicolon */]));
        expect(88 /* Semicolon */);
        return end();
    }
    function methodReference() {
        let p = start({
            phraseType: 114 /* MethodReference */,
            methodName: null,
            typeName: null,
            children: []
        });
        p.children.push(p.typeName = qualifiedName());
        expect(133 /* ColonColon */);
        p.children.push(p.methodName = identifier());
        return end();
    }
    function methodDeclarationHeader(memberModifers) {
        let p = start({
            phraseType: 113 /* MethodDeclarationHeader */,
            name: null,
            children: []
        }, true);
        if (memberModifers) {
            p.children.push(p.modifierList = memberModifers);
        }
        next(); //function
        p.returnsRef = optional(103 /* Ampersand */);
        p.children.push(p.name = identifier());
        expect(118 /* OpenParenthesis */);
        if (isParameterStart(peek())) {
            p.children.push(p.parameterList = delimitedList(128 /* ParameterDeclarationList */, parameterDeclaration, isParameterStart, 93 /* Comma */, [121 /* CloseParenthesis */]));
        }
        expect(121 /* CloseParenthesis */);
        if (peek().tokenType === 87 /* Colon */) {
            p.children.push(p.returnType = returnType());
        }
        return end();
    }
    function methodDeclaration(p, memberModifers) {
        p.phraseType = 111 /* MethodDeclaration */;
        p.children.push(p.header = methodDeclarationHeader(memberModifers));
        p.children.push(p.body = methodDeclarationBody());
        return end();
    }
    function methodDeclarationBody() {
        let p = start({
            phraseType: 112 /* MethodDeclarationBody */,
            children: []
        });
        if (peek().tokenType === 88 /* Semicolon */) {
            next();
        }
        else {
            p.children.push(p.block = compoundStatement());
        }
        return end();
    }
    function identifier() {
        let p = start({
            phraseType: 93 /* Identifier */,
            name: null,
            children: []
        });
        let t = peek();
        if (t.tokenType === 83 /* Name */ || isSemiReservedToken(t)) {
            p.name = next();
        }
        else {
            error();
        }
        return end();
    }
    function interfaceDeclaration() {
        let p = start({
            phraseType: 101 /* InterfaceDeclaration */,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = interfaceDeclarationHeader(), p.body = TypeDeclarationBody(102 /* InterfaceDeclarationBody */, isClassMemberStart, interfaceMemberDeclarations));
        return end();
    }
    function TypeDeclarationBody(phraseType, elementStartPredicate, listFunction) {
        let p = start({
            phraseType: phraseType,
            children: []
        });
        expect(116 /* OpenBrace */);
        if (elementStartPredicate(peek())) {
            p.children.push(p.memberList = listFunction());
        }
        expect(119 /* CloseBrace */);
        return end();
    }
    function interfaceMemberDeclarations() {
        return list(104 /* InterfaceMemberDeclarationList */, classMemberDeclaration, isClassMemberStart, [119 /* CloseBrace */], classMemberDeclarationListRecoverSet);
    }
    function interfaceDeclarationHeader() {
        let p = start({
            phraseType: 103 /* InterfaceDeclarationHeader */,
            name: null,
            children: []
        });
        next(); //interface
        p.name = expect(83 /* Name */);
        if (peek().tokenType === 30 /* Extends */) {
            p.children.push(p.baseClause = interfaceBaseClause());
        }
        return end();
    }
    function interfaceBaseClause() {
        let p = start({
            phraseType: 100 /* InterfaceBaseClause */,
            nameList: null,
            children: []
        });
        next(); //extends
        p.children.push(p.nameList = qualifiedNameList([116 /* OpenBrace */]));
        return end();
    }
    function traitDeclaration() {
        let p = start({
            phraseType: 163 /* TraitDeclaration */,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = traitDeclarationHeader(), p.body = TypeDeclarationBody(164 /* TraitDeclarationBody */, isClassMemberStart, traitMemberDeclarations));
        return end();
    }
    function traitDeclarationHeader() {
        let p = start({
            phraseType: 165 /* TraitDeclarationHeader */,
            name: null,
            children: []
        });
        next(); //trait
        p.name = expect(83 /* Name */);
        return end();
    }
    function traitMemberDeclarations() {
        return list(166 /* TraitMemberDeclarationList */, classMemberDeclaration, isClassMemberStart, [119 /* CloseBrace */], classMemberDeclarationListRecoverSet);
    }
    function functionDeclaration() {
        let p = start({
            phraseType: 85 /* FunctionDeclaration */,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = functionDeclarationHeader(), p.body = compoundStatement());
        return end();
    }
    function functionDeclarationHeader() {
        let p = start({
            phraseType: 86 /* FunctionDeclarationHeader */,
            name: null,
            children: []
        });
        next(); //function
        p.returnsRef = optional(103 /* Ampersand */);
        p.name = expect(83 /* Name */);
        expect(118 /* OpenParenthesis */);
        if (isParameterStart(peek())) {
            p.children.push(p.parameterList = delimitedList(128 /* ParameterDeclarationList */, parameterDeclaration, isParameterStart, 93 /* Comma */, [121 /* CloseParenthesis */]));
        }
        expect(121 /* CloseParenthesis */);
        if (peek().tokenType === 87 /* Colon */) {
            p.children.push(p.returnType = returnType());
        }
        return end();
    }
    function isParameterStart(t) {
        switch (t.tokenType) {
            case 103 /* Ampersand */:
            case 134 /* Ellipsis */:
            case 84 /* VariableName */:
                return true;
            default:
                return isTypeDeclarationStart(t);
        }
    }
    function classDeclaration() {
        let p = start({
            phraseType: 28 /* ClassDeclaration */,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = classDeclarationHeader(), p.body = TypeDeclarationBody(29 /* ClassDeclarationBody */, isClassMemberStart, classMemberDeclarationList));
        return end();
    }
    function classDeclarationHeader() {
        let p = start({
            phraseType: 30 /* ClassDeclarationHeader */,
            name: null,
            children: []
        });
        p.modifier = optionalOneOf([2 /* Abstract */, 31 /* Final */]);
        expect(9 /* Class */);
        p.name = expect(83 /* Name */);
        if (peek().tokenType === 30 /* Extends */) {
            p.children.push(p.baseClause = classBaseClause());
        }
        if (peek().tokenType === 40 /* Implements */) {
            p.children.push(p.interfaceClause = classInterfaceClause());
        }
        return end();
    }
    function classBaseClause() {
        let p = start({
            phraseType: 23 /* ClassBaseClause */,
            name: null,
            children: []
        });
        next(); //extends
        p.children.push(p.name = qualifiedName());
        return end();
    }
    function compoundStatement() {
        let p = start({
            phraseType: 39 /* CompoundStatement */,
            children: []
        });
        expect(116 /* OpenBrace */);
        if (isStatementStart(peek())) {
            p.children.push(p.statementList = statementList([119 /* CloseBrace */]));
        }
        expect(119 /* CloseBrace */);
        return end();
    }
    function statement() {
        let t = peek();
        switch (t.tokenType) {
            case 51 /* Namespace */:
                return namespaceDefinition();
            case 66 /* Use */:
                return namespaceUseDeclaration();
            case 38 /* HaltCompiler */:
                return haltCompilerStatement();
            case 12 /* Const */:
                return constDeclaration();
            case 35 /* Function */:
                return functionDeclaration();
            case 9 /* Class */:
            case 2 /* Abstract */:
            case 31 /* Final */:
                return classDeclaration();
            case 63 /* Trait */:
                return traitDeclaration();
            case 45 /* Interface */:
                return interfaceDeclaration();
            case 116 /* OpenBrace */:
                return compoundStatement();
            case 39 /* If */:
                return ifStatement();
            case 68 /* While */:
                return whileStatement();
            case 16 /* Do */:
                return doStatement();
            case 33 /* For */:
                return forStatement();
            case 61 /* Switch */:
                return switchStatement();
            case 5 /* Break */:
                return breakStatement();
            case 13 /* Continue */:
                return continueStatement();
            case 59 /* Return */:
                return returnStatement();
            case 36 /* Global */:
                return globalDeclaration();
            case 60 /* Static */:
                if (peek(1).tokenType === 84 /* VariableName */ &&
                    [88 /* Semicolon */, 93 /* Comma */,
                        158 /* CloseTag */, 85 /* Equals */].indexOf(peek(2).tokenType) >= 0) {
                    return functionStaticDeclaration();
                }
                else {
                    return expressionStatement();
                }
            case 81 /* Text */:
            case 156 /* OpenTag */:
            case 157 /* OpenTagEcho */:
            case 158 /* CloseTag */:
                return inlineText();
            case 34 /* ForEach */:
                return foreachStatement();
            case 14 /* Declare */:
                return declareStatement();
            case 64 /* Try */:
                return tryStatement();
            case 62 /* Throw */:
                return throwStatement();
            case 37 /* Goto */:
                return gotoStatement();
            case 17 /* Echo */:
                return echoIntrinsic();
            case 65 /* Unset */:
                return unsetIntrinsic();
            case 88 /* Semicolon */:
                return nullStatement();
            case 83 /* Name */:
                if (peek(1).tokenType === 87 /* Colon */) {
                    return namedLabelStatement();
                }
            //fall though
            default:
                return expressionStatement();
        }
    }
    function inlineText() {
        let p = start({
            phraseType: 97 /* InlineText */,
            children: []
        });
        optional(158 /* CloseTag */);
        optional(81 /* Text */);
        optionalOneOf([157 /* OpenTagEcho */, 156 /* OpenTag */]);
        return end();
    }
    function nullStatement() {
        start({
            phraseType: 125 /* NullStatement */,
            children: []
        });
        next(); //;
        return end();
    }
    function isCatchClauseStart(t) {
        return t.tokenType === 8 /* Catch */;
    }
    function tryStatement() {
        let p = start({
            phraseType: 170 /* TryStatement */,
            block: null,
            catchList: null,
            children: []
        });
        next(); //try
        p.children.push(p.block = compoundStatement());
        let t = peek();
        if (t.tokenType === 8 /* Catch */) {
            p.children.push(p.catchList = list(21 /* CatchClauseList */, catchClause, isCatchClauseStart));
        }
        else if (t.tokenType !== 32 /* Finally */) {
            error();
        }
        if (peek().tokenType === 32 /* Finally */) {
            p.children.push(p.finally = finallyClause());
        }
        return end();
    }
    function finallyClause() {
        let p = start({
            phraseType: 73 /* FinallyClause */,
            block: null,
            children: []
        });
        next(); //finally
        p.children.push(p.block = compoundStatement());
        return end();
    }
    function catchClause() {
        let p = start({
            phraseType: 20 /* CatchClause */,
            nameList: null,
            variable: null,
            block: null,
            children: []
        });
        next(); //catch
        expect(118 /* OpenParenthesis */);
        p.children.push(p.nameList = delimitedList(22 /* CatchNameList */, qualifiedName, isQualifiedNameStart, 123 /* Bar */, [84 /* VariableName */]));
        p.variable = expect(84 /* VariableName */);
        expect(121 /* CloseParenthesis */);
        p.children.push(p.block = compoundStatement());
        return end();
    }
    function declareDirective() {
        let p = start({
            phraseType: 46 /* DeclareDirective */,
            name: null,
            value: null,
            children: []
        });
        p.name = expect(83 /* Name */);
        expect(85 /* Equals */);
        p.value = expectOneOf([82 /* IntegerLiteral */, 79 /* FloatingLiteral */, 78 /* StringLiteral */]);
        return end();
    }
    function declareStatement() {
        let p = start({
            phraseType: 47 /* DeclareStatement */,
            directive: null,
            statement: null,
            children: []
        });
        next(); //declare
        expect(118 /* OpenParenthesis */);
        p.children.push(p.directive = declareDirective());
        expect(121 /* CloseParenthesis */);
        let t = peek();
        if (t.tokenType === 87 /* Colon */) {
            next(); //:
            p.children.push(p.statement = statementList([21 /* EndDeclare */]));
            expect(21 /* EndDeclare */);
            expect(88 /* Semicolon */);
        }
        else if (isStatementStart(t)) {
            p.children.push(p.statement = statement());
        }
        else if (t.tokenType === 88 /* Semicolon */) {
            next();
        }
        else {
            error();
        }
        return end();
    }
    function switchStatement() {
        let p = start({
            phraseType: 159 /* SwitchStatement */,
            expr: null,
            children: []
        });
        next(); //switch
        expect(118 /* OpenParenthesis */);
        p.children.push(expression(0));
        expect(121 /* CloseParenthesis */);
        let t = expectOneOf([87 /* Colon */, 116 /* OpenBrace */]);
        let tCase = peek();
        if (tCase.tokenType === 7 /* Case */ || tCase.tokenType === 15 /* Default */) {
            p.children.push(p.caseList = caseStatements(t.tokenType === 87 /* Colon */ ?
                25 /* EndSwitch */ : 119 /* CloseBrace */));
        }
        if (t.tokenType === 87 /* Colon */) {
            expect(25 /* EndSwitch */);
            expect(88 /* Semicolon */);
        }
        else {
            expect(119 /* CloseBrace */);
        }
        return end();
    }
    function caseStatements(breakOn) {
        let p = start({
            phraseType: 18 /* CaseStatementList */,
            elements: [],
            children: []
        });
        let t;
        let caseBreakOn = [7 /* Case */, 15 /* Default */];
        let element;
        caseBreakOn.push(breakOn);
        while (true) {
            t = peek();
            if (t.tokenType === 7 /* Case */) {
                element = caseStatement(caseBreakOn);
                p.children.push(element);
                p.elements.push(element);
            }
            else if (t.tokenType === 15 /* Default */) {
                element = defaultStatement(caseBreakOn);
                p.children.push(element);
                p.elements.push(element);
            }
            else if (breakOn === t.tokenType) {
                break;
            }
            else {
                error();
                break;
            }
        }
        return end();
    }
    function caseStatement(breakOn) {
        let p = start({
            phraseType: 17 /* CaseStatement */,
            expr: null,
            children: []
        });
        next(); //case
        p.children.push(p.expr = expression(0));
        expectOneOf([87 /* Colon */, 88 /* Semicolon */]);
        if (isStatementStart(peek())) {
            p.children.push(p.statementList = statementList(breakOn));
        }
        return end();
    }
    function defaultStatement(breakOn) {
        let p = start({
            phraseType: 48 /* DefaultStatement */,
            children: []
        });
        next(); //default
        expectOneOf([87 /* Colon */, 88 /* Semicolon */]);
        if (isStatementStart(peek())) {
            p.children.push(p.statementList = statementList(breakOn));
        }
        return end();
    }
    function namedLabelStatement() {
        let p = start({
            phraseType: 116 /* NamedLabelStatement */,
            name: null,
            children: []
        });
        p.name = next(); //name
        next(); //:
        return end();
    }
    function gotoStatement() {
        let p = start({
            phraseType: 90 /* GotoStatement */,
            label: null,
            children: []
        });
        next(); //goto
        p.label = expect(83 /* Name */);
        expect(88 /* Semicolon */);
        return end();
    }
    function throwStatement() {
        let p = start({
            phraseType: 160 /* ThrowStatement */,
            expr: null,
            children: []
        });
        next(); //throw
        p.children.push(p.expr = expression(0));
        expect(88 /* Semicolon */);
        return end();
    }
    function foreachCollection() {
        let p = start({
            phraseType: 75 /* ForeachCollection */,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        return end();
    }
    function foreachKeyOrValue() {
        let p = start({
            phraseType: 78 /* ForeachValue */,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        if (peek().tokenType === 132 /* FatArrow */) {
            next();
            p.phraseType = 76 /* ForeachKey */;
        }
        return end();
    }
    function foreachValue() {
        let p = start({
            phraseType: 78 /* ForeachValue */,
            expr: null,
            children: []
        });
        p.byRef = optional(103 /* Ampersand */);
        p.children.push(p.expr = expression(0));
        return end();
    }
    function foreachStatement() {
        let p = start({
            phraseType: 77 /* ForeachStatement */,
            collection: null,
            value: null,
            statement: null,
            children: []
        });
        next(); //foreach
        expect(118 /* OpenParenthesis */);
        p.children.push(p.collection = foreachCollection());
        expect(4 /* As */);
        let keyOrValue = peek().tokenType === 103 /* Ampersand */ ? foreachValue() : foreachKeyOrValue();
        p.children.push(keyOrValue);
        if (keyOrValue.phraseType === 76 /* ForeachKey */) {
            p.key = keyOrValue;
            p.children.push(p.value = foreachValue());
        }
        else {
            p.value = keyOrValue;
        }
        expect(121 /* CloseParenthesis */);
        let t = peek();
        if (t.tokenType === 87 /* Colon */) {
            next();
            p.children.push(p.statement = statementList([23 /* EndForeach */]));
            expect(23 /* EndForeach */);
            expect(88 /* Semicolon */);
        }
        else if (isStatementStart(t)) {
            p.children.push(p.statement = statement());
        }
        else {
            error();
        }
        return end();
    }
    function isVariableStart(t) {
        switch (t.tokenType) {
            case 84 /* VariableName */:
            case 90 /* Dollar */:
            case 118 /* OpenParenthesis */:
            case 3 /* Array */:
            case 117 /* OpenBracket */:
            case 78 /* StringLiteral */:
            case 60 /* Static */:
            case 83 /* Name */:
            case 51 /* Namespace */:
            case 147 /* Backslash */:
                return true;
            default:
                return false;
        }
    }
    function variableInitial() {
        return variable(variableAtom());
    }
    function variableList(breakOn) {
        return delimitedList(174 /* VariableList */, variableInitial, isVariableStart, 93 /* Comma */, breakOn);
    }
    function unsetIntrinsic() {
        let p = start({
            phraseType: 173 /* UnsetIntrinsic */,
            variableList: null,
            children: []
        });
        next(); //unset
        expect(118 /* OpenParenthesis */);
        p.children.push(p.variableList = variableList([121 /* CloseParenthesis */]));
        expect(121 /* CloseParenthesis */);
        expect(88 /* Semicolon */);
        return end();
    }
    function expressionInitial() {
        return expression(0);
    }
    function echoIntrinsic() {
        let p = start({
            phraseType: 51 /* EchoIntrinsic */,
            exprList: null,
            children: []
        });
        next(); //echo
        p.children.push(p.exprList = delimitedList(71 /* ExpressionList */, expressionInitial, isExpressionStart, 93 /* Comma */));
        expect(88 /* Semicolon */);
        return end();
    }
    function isStaticVariableDclarationStart(t) {
        return t.tokenType === 84 /* VariableName */;
    }
    function functionStaticDeclaration() {
        let p = start({
            phraseType: 87 /* FunctionStaticDeclaration */,
            variableDeclarationList: null,
            children: []
        });
        next(); //static
        p.children.push(p.variableDeclarationList = delimitedList(157 /* StaticVariableDeclarationList */, staticVariableDeclaration, isStaticVariableDclarationStart, 93 /* Comma */, [88 /* Semicolon */]));
        expect(88 /* Semicolon */);
        return end();
    }
    function globalDeclaration() {
        let p = start({
            phraseType: 89 /* GlobalDeclaration */,
            variableNameList: null,
            children: []
        });
        next(); //global
        p.children.push(p.variableNameList = delimitedList(175 /* VariableNameList */, simpleVariable, isSimpleVariableStart, 93 /* Comma */, [88 /* Semicolon */]));
        expect(88 /* Semicolon */);
        return end();
    }
    function isSimpleVariableStart(t) {
        switch (t.tokenType) {
            case 84 /* VariableName */:
            case 90 /* Dollar */:
                return true;
            default:
                return false;
        }
    }
    function staticVariableDeclaration() {
        let p = start({
            phraseType: 156 /* StaticVariableDeclaration */,
            name: null,
            children: []
        });
        p.name = expect(84 /* VariableName */);
        if (peek().tokenType === 85 /* Equals */) {
            p.children.push(p.initialiser = functionStaticInitialiser());
        }
        return end();
    }
    function functionStaticInitialiser() {
        let p = start({
            phraseType: 88 /* FunctionStaticInitialiser */,
            value: null,
            children: []
        });
        next(); //=
        p.children.push(p.value = expression(0));
        return end();
    }
    function continueStatement() {
        let p = start({
            phraseType: 45 /* ContinueStatement */,
            children: []
        });
        next(); //break/continue
        p.expr = optional(82 /* IntegerLiteral */);
        expect(88 /* Semicolon */);
        return end();
    }
    function breakStatement() {
        let p = start({
            phraseType: 15 /* BreakStatement */,
            children: []
        });
        next(); //break/continue
        p.expr = optional(82 /* IntegerLiteral */);
        expect(88 /* Semicolon */);
        return end();
    }
    function returnStatement() {
        let p = start({
            phraseType: 146 /* ReturnStatement */,
            children: []
        });
        next(); //return
        if (isExpressionStart(peek())) {
            p.children.push(p.expr = expression(0));
        }
        expect(88 /* Semicolon */);
        return end();
    }
    function forExpressionGroup(phraseType, breakOn) {
        return delimitedList(phraseType, expressionInitial, isExpressionStart, 93 /* Comma */, breakOn);
    }
    function forStatement() {
        let p = start({
            phraseType: 82 /* ForStatement */,
            statement: null,
            children: []
        });
        next(); //for
        expect(118 /* OpenParenthesis */);
        if (isExpressionStart(peek())) {
            p.children.push(p.initialiser = forExpressionGroup(81 /* ForInitialiser */, [88 /* Semicolon */]));
        }
        expect(88 /* Semicolon */);
        if (isExpressionStart(peek())) {
            p.children.push(p.control = forExpressionGroup(74 /* ForControl */, [88 /* Semicolon */]));
        }
        expect(88 /* Semicolon */);
        if (isExpressionStart(peek())) {
            p.children.push(p.end = forExpressionGroup(79 /* ForEndOfLoop */, [121 /* CloseParenthesis */]));
        }
        expect(121 /* CloseParenthesis */);
        let t = peek();
        if (t.tokenType === 87 /* Colon */) {
            next();
            p.children.push(p.statement = statementList([22 /* EndFor */]));
            expect(22 /* EndFor */);
            expect(88 /* Semicolon */);
        }
        else if (isStatementStart(peek())) {
            p.children.push(p.statement = statement());
        }
        else {
            error();
        }
        return end();
    }
    function doStatement() {
        let p = start({
            phraseType: 49 /* DoStatement */,
            statement: null,
            expr: null,
            children: []
        });
        next(); // do
        p.children.push(p.statement = statement());
        expect(68 /* While */);
        expect(118 /* OpenParenthesis */);
        p.children.push(p.expr = expression(0));
        expect(121 /* CloseParenthesis */);
        expect(88 /* Semicolon */);
        return end();
    }
    function whileStatement() {
        let p = start({
            phraseType: 177 /* WhileStatement */,
            expr: null,
            statement: null,
            children: []
        });
        next(); //while
        expect(118 /* OpenParenthesis */);
        p.children.push(p.expr = expression(0));
        expect(121 /* CloseParenthesis */);
        let t = peek();
        if (t.tokenType === 87 /* Colon */) {
            next();
            p.children.push(p.statement = statementList([26 /* EndWhile */]));
            expect(26 /* EndWhile */);
            expect(88 /* Semicolon */);
        }
        else if (isStatementStart(t)) {
            p.children.push(p.statement = statement());
        }
        else {
            //error
            error();
        }
        return end();
    }
    function elseIfClause1() {
        let p = start({
            phraseType: 53 /* ElseIfClause */,
            expr: null,
            statement: null,
            children: []
        });
        next(); //elseif
        expect(118 /* OpenParenthesis */);
        p.children.push(p.expr = expression(0));
        expect(121 /* CloseParenthesis */);
        p.children.push(p.statement = statement());
        return end();
    }
    function elseIfClause2() {
        let p = start({
            phraseType: 53 /* ElseIfClause */,
            expr: null,
            statement: null,
            children: []
        });
        next(); //elseif
        expect(118 /* OpenParenthesis */);
        p.children.push(p.expr = expression(0));
        expect(121 /* CloseParenthesis */);
        expect(87 /* Colon */);
        p.children.push(p.statement = statementList([24 /* EndIf */, 18 /* Else */, 19 /* ElseIf */]));
        return end();
    }
    function elseClause1() {
        let p = start({
            phraseType: 52 /* ElseClause */,
            statement: null,
            children: []
        });
        next(); //else
        p.children.push(p.statement = statement());
        return end();
    }
    function elseClause2() {
        let p = start({
            phraseType: 52 /* ElseClause */,
            statement: null,
            children: []
        });
        next(); //else
        expect(87 /* Colon */);
        p.children.push(p.statement = statementList([24 /* EndIf */]));
        return end();
    }
    function isElseIfClauseStart(t) {
        return t.tokenType === 19 /* ElseIf */;
    }
    function ifStatement() {
        let p = start({
            phraseType: 94 /* IfStatement */,
            expr: null,
            statement: null,
            children: []
        });
        next(); //if
        expect(118 /* OpenParenthesis */);
        p.children.push(p.expr = expression(0));
        expect(121 /* CloseParenthesis */);
        let t = peek();
        let elseIfClauseFunction = elseIfClause1;
        let elseClauseFunction = elseClause1;
        let expectEndIf = false;
        if (t.tokenType === 87 /* Colon */) {
            next();
            p.children.push(p.statement = statementList([19 /* ElseIf */, 18 /* Else */, 24 /* EndIf */]));
            elseIfClauseFunction = elseIfClause2;
            elseClauseFunction = elseClause2;
            expectEndIf = true;
        }
        else if (isStatementStart(t)) {
            p.children.push(p.statement = statement());
        }
        else {
            error();
        }
        if (peek().tokenType === 19 /* ElseIf */) {
            p.children.push(p.elseIfClauseList = list(54 /* ElseIfClauseList */, elseIfClauseFunction, isElseIfClauseStart));
        }
        if (peek().tokenType === 18 /* Else */) {
            p.children.push(p.elseClause = elseClauseFunction());
        }
        if (expectEndIf) {
            expect(24 /* EndIf */);
            expect(88 /* Semicolon */);
        }
        return end();
    }
    function expressionStatement() {
        let p = start({
            phraseType: 72 /* ExpressionStatement */,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        expect(88 /* Semicolon */);
        return end();
    }
    function returnType() {
        let p = start({
            phraseType: 147 /* ReturnType */,
            type: null,
            children: []
        });
        next(); //:
        p.children.push(p.type = typeDeclaration());
        return end();
    }
    function typeDeclaration() {
        let p = start({
            phraseType: 171 /* TypeDeclaration */,
            name: null,
            children: []
        });
        p.nullable = optional(96 /* Question */);
        switch (peek().tokenType) {
            case 6 /* Callable */:
            case 3 /* Array */:
                p.name = next();
                break;
            case 83 /* Name */:
            case 51 /* Namespace */:
            case 147 /* Backslash */:
                p.children.push(p.name = qualifiedName());
                break;
            default:
                error();
                break;
        }
        return end();
    }
    function classConstDeclaration(p) {
        p.phraseType = 25 /* ClassConstDeclaration */;
        next(); //const
        p.children.push(p.constElementList = delimitedList(27 /* ClassConstElementList */, classConstElement, isClassConstElementStartToken, 93 /* Comma */, [88 /* Semicolon */]));
        expect(88 /* Semicolon */);
        return end();
    }
    function isExpressionStart(t) {
        switch (t.tokenType) {
            case 84 /* VariableName */:
            case 90 /* Dollar */:
            case 3 /* Array */:
            case 117 /* OpenBracket */:
            case 78 /* StringLiteral */:
            case 147 /* Backslash */:
            case 83 /* Name */:
            case 51 /* Namespace */:
            case 118 /* OpenParenthesis */:
            case 60 /* Static */:
            case 135 /* PlusPlus */:
            case 129 /* MinusMinus */:
            case 111 /* Plus */:
            case 143 /* Minus */:
            case 89 /* Exclamation */:
            case 86 /* Tilde */:
            case 94 /* AtSymbol */:
            case 152 /* IntegerCast */:
            case 153 /* FloatCast */:
            case 150 /* StringCast */:
            case 155 /* ArrayCast */:
            case 151 /* ObjectCast */:
            case 148 /* BooleanCast */:
            case 149 /* UnsetCast */:
            case 47 /* List */:
            case 11 /* Clone */:
            case 52 /* New */:
            case 79 /* FloatingLiteral */:
            case 82 /* IntegerLiteral */:
            case 73 /* LineConstant */:
            case 72 /* FileConstant */:
            case 71 /* DirectoryConstant */:
            case 77 /* TraitConstant */:
            case 75 /* MethodConstant */:
            case 74 /* FunctionConstant */:
            case 76 /* NamespaceConstant */:
            case 10 /* ClassConstant */:
            case 154 /* StartHeredoc */:
            case 97 /* DoubleQuote */:
            case 95 /* Backtick */:
            case 53 /* Print */:
            case 69 /* Yield */:
            case 70 /* YieldFrom */:
            case 35 /* Function */:
            case 41 /* Include */:
            case 42 /* IncludeOnce */:
            case 57 /* Require */:
            case 58 /* RequireOnce */:
            case 28 /* Eval */:
            case 20 /* Empty */:
            case 46 /* Isset */:
            case 29 /* Exit */:
                return true;
            default:
                return false;
        }
    }
    function classConstElement() {
        let p = start({
            phraseType: 43 /* ConstElement */,
            name: null,
            value: null,
            children: []
        });
        p.children.push(p.name = identifier());
        expect(85 /* Equals */);
        p.children.push(p.value = expression(0));
        return end();
    }
    function isPropertyElementStart(t) {
        return t.tokenType === 84 /* VariableName */;
    }
    function propertyDeclaration(p) {
        let t;
        p.phraseType = 135 /* PropertyDeclaration */;
        p.children.push(p.propertyList = delimitedList(137 /* PropertyElementList */, propertyElement, isPropertyElementStart, 93 /* Comma */, [88 /* Semicolon */]));
        expect(88 /* Semicolon */);
        return end();
    }
    function propertyElement() {
        let p = start({
            phraseType: 136 /* PropertyElement */,
            name: null,
            children: []
        });
        p.name = expect(84 /* VariableName */);
        if (peek().tokenType === 85 /* Equals */) {
            p.children.push(p.initialiser = propertyInitialiser());
        }
        return end();
    }
    function propertyInitialiser() {
        let p = start({
            phraseType: 138 /* PropertyInitialiser */,
            value: null,
            children: []
        });
        next(); //equals
        p.children.push(p.value = expression(0));
        return end();
    }
    function memberModifierList() {
        let p = start({
            phraseType: 108 /* MemberModifierList */,
            elements: [],
            children: []
        });
        while (isMemberModifier(peek())) {
            p.elements.push(next());
        }
        return end();
    }
    function isMemberModifier(t) {
        switch (t.tokenType) {
            case 55 /* Public */:
            case 56 /* Protected */:
            case 54 /* Private */:
            case 60 /* Static */:
            case 2 /* Abstract */:
            case 31 /* Final */:
                return true;
            default:
                return false;
        }
    }
    function qualifiedNameList(breakOn) {
        return delimitedList(140 /* QualifiedNameList */, qualifiedName, isQualifiedNameStart, 93 /* Comma */, breakOn);
    }
    function objectCreationExpression() {
        let p = start({
            phraseType: 126 /* ObjectCreationExpression */,
            type: null,
            children: []
        });
        next(); //new
        if (peek().tokenType === 9 /* Class */) {
            p.children.push(p.type = anonymousClassDeclaration());
            return end();
        }
        p.children.push(p.type = typeDesignator(34 /* ClassTypeDesignator */));
        if (optional(118 /* OpenParenthesis */)) {
            if (isArgumentStart(peek())) {
                p.children.push(p.argumentList = argumentList());
            }
            expect(121 /* CloseParenthesis */);
        }
        return end();
    }
    function typeDesignator(phraseType) {
        let p = start({
            phraseType: phraseType,
            type: null,
            children: []
        });
        let part = classTypeDesignatorAtom();
        while (true) {
            switch (peek().tokenType) {
                case 117 /* OpenBracket */:
                    part = subscriptExpression(part, 120 /* CloseBracket */);
                    continue;
                case 116 /* OpenBrace */:
                    part = subscriptExpression(part, 119 /* CloseBrace */);
                    continue;
                case 115 /* Arrow */:
                    part = propertyAccessExpression(part);
                    continue;
                case 133 /* ColonColon */:
                    let staticPropNode = start({
                        phraseType: 150 /* ScopedPropertyAccessExpression */,
                        scope: part,
                        memberName: null,
                        children: []
                    });
                    staticPropNode.children.push(part);
                    next(); //::
                    staticPropNode.children.push(staticPropNode.memberName = restrictedScopedMemberName());
                    part = end();
                    continue;
                default:
                    break;
            }
            break;
        }
        p.children.push(p.type = part);
        return end();
    }
    function restrictedScopedMemberName() {
        let p = start({
            phraseType: 149 /* ScopedMemberName */,
            name: null,
            children: []
        });
        let t = peek();
        switch (t.tokenType) {
            case 84 /* VariableName */:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                p.name = next();
                break;
            case 90 /* Dollar */:
                p.children.push(p.name = simpleVariable());
                break;
            default:
                error();
                break;
        }
        return end();
    }
    function classTypeDesignatorAtom() {
        let t = peek();
        switch (t.tokenType) {
            case 60 /* Static */:
                return relativeScope();
            case 84 /* VariableName */:
            case 90 /* Dollar */:
                return simpleVariable();
            case 83 /* Name */:
            case 51 /* Namespace */:
            case 147 /* Backslash */:
                return qualifiedName();
            default:
                start({
                    phraseType: 61 /* ErrorClassTypeDesignatorAtom */,
                    children: []
                });
                error();
                return end();
        }
    }
    function cloneExpression() {
        let p = start({
            phraseType: 35 /* CloneExpression */,
            expr: null,
            children: []
        });
        next(); //clone
        p.children.push(p.expr = expression(0));
        return end();
    }
    function listIntrinsic() {
        let p = start({
            phraseType: 106 /* ListIntrinsic */,
            initialiserList: null,
            children: []
        });
        next(); //list
        expect(118 /* OpenParenthesis */);
        p.children.push(p.initialiserList = arrayInitialiserList(121 /* CloseParenthesis */));
        expect(121 /* CloseParenthesis */);
        return end();
    }
    function unaryExpression(phraseType) {
        let p = start({
            phraseType: phraseType,
            operator: null,
            operand: null,
            children: []
        });
        p.operator = next(); //op
        switch (phraseType) {
            case 131 /* PrefixDecrementExpression */:
            case 132 /* PrefixIncrementExpression */:
                p.children.push(p.operand = variable(variableAtom()));
                break;
            default:
                p.children.push(p.operand = expression(precedenceAssociativityTuple(p.operator)[0]));
                break;
        }
        return end();
    }
    function anonymousFunctionHeader() {
        let p = start({
            phraseType: 5 /* AnonymousFunctionHeader */,
            children: []
        });
        p.modifier = optional(60 /* Static */);
        next(); //function
        p.returnsRef = optional(103 /* Ampersand */);
        expect(118 /* OpenParenthesis */);
        if (isParameterStart(peek())) {
            p.children.push(p.parameterList = delimitedList(128 /* ParameterDeclarationList */, parameterDeclaration, isParameterStart, 93 /* Comma */, [121 /* CloseParenthesis */]));
        }
        expect(121 /* CloseParenthesis */);
        if (peek().tokenType === 66 /* Use */) {
            p.children.push(p.useClause = anonymousFunctionUseClause());
        }
        if (peek().tokenType === 87 /* Colon */) {
            p.children.push(p.returnType = returnType());
        }
        return end();
    }
    function anonymousFunctionCreationExpression() {
        let p = start({
            phraseType: 4 /* AnonymousFunctionCreationExpression */,
            header: null,
            body: null,
            children: []
        });
        p.children.push(p.header = anonymousFunctionHeader(), p.body = compoundStatement());
        return end();
    }
    function isAnonymousFunctionUseVariableStart(t) {
        return t.tokenType === 84 /* VariableName */ ||
            t.tokenType === 103 /* Ampersand */;
    }
    function anonymousFunctionUseClause() {
        let p = start({
            phraseType: 6 /* AnonymousFunctionUseClause */,
            useList: null,
            children: []
        });
        next(); //use
        expect(118 /* OpenParenthesis */);
        p.children.push(p.useList = delimitedList(36 /* ClosureUseList */, anonymousFunctionUseVariable, isAnonymousFunctionUseVariableStart, 93 /* Comma */, [121 /* CloseParenthesis */]));
        expect(121 /* CloseParenthesis */);
        return end();
    }
    function anonymousFunctionUseVariable() {
        let p = start({
            phraseType: 7 /* AnonymousFunctionUseVariable */,
            name: null,
            children: []
        });
        p.byRef = optional(103 /* Ampersand */);
        p.name = expect(84 /* VariableName */);
        return end();
    }
    function isTypeDeclarationStart(t) {
        switch (t.tokenType) {
            case 147 /* Backslash */:
            case 83 /* Name */:
            case 51 /* Namespace */:
            case 96 /* Question */:
            case 3 /* Array */:
            case 6 /* Callable */:
                return true;
            default:
                return false;
        }
    }
    function parameterDeclaration() {
        let p = start({
            phraseType: 127 /* ParameterDeclaration */,
            name: null,
            children: []
        });
        if (isTypeDeclarationStart(peek())) {
            p.children.push(p.type = typeDeclaration());
        }
        p.byRef = optional(103 /* Ampersand */);
        p.variadic = optional(134 /* Ellipsis */);
        p.name = expect(84 /* VariableName */);
        if (peek().tokenType === 85 /* Equals */) {
            next();
            p.children.push(p.value = expression(0));
        }
        return end();
    }
    function variable(variableAtomNode) {
        let count = 0;
        while (true) {
            ++count;
            switch (peek().tokenType) {
                case 133 /* ColonColon */:
                    variableAtomNode = scopedAccessExpression(variableAtomNode);
                    continue;
                case 115 /* Arrow */:
                    variableAtomNode = propertyOrMethodAccessExpression(variableAtomNode);
                    continue;
                case 117 /* OpenBracket */:
                    variableAtomNode = subscriptExpression(variableAtomNode, 120 /* CloseBracket */);
                    continue;
                case 116 /* OpenBrace */:
                    variableAtomNode = subscriptExpression(variableAtomNode, 119 /* CloseBrace */);
                    continue;
                case 118 /* OpenParenthesis */:
                    variableAtomNode = functionCallExpression(variableAtomNode);
                    continue;
                default:
                    //only simple variable atoms qualify as variables
                    if (count === 1 && variableAtomNode.phraseType !== 154 /* SimpleVariable */) {
                        let errNode = start({
                            phraseType: 66 /* ErrorVariable */,
                            children: []
                        }, true);
                        errNode.children.push(variableAtomNode);
                        error();
                        return end();
                    }
                    break;
            }
            break;
        }
        return variableAtomNode;
    }
    function functionCallExpression(lhs) {
        let p = start({
            phraseType: 84 /* FunctionCallExpression */,
            callableExpr: null,
            children: []
        }, true);
        p.children.push(p.callableExpr = lhs);
        expect(118 /* OpenParenthesis */);
        if (isArgumentStart(peek())) {
            p.children.push(p.argumentList = argumentList());
        }
        expect(121 /* CloseParenthesis */);
        return end();
    }
    function scopedAccessExpression(lhs) {
        let p = start({
            phraseType: 64 /* ErrorScopedAccessExpression */,
            scope: null,
            memberName: null,
            children: []
        }, true);
        p.children.push(p.scope = lhs);
        next(); //::
        p.children.push(p.memberName = scopedMemberName(p));
        if (optional(118 /* OpenParenthesis */)) {
            p.phraseType = 148 /* ScopedCallExpression */;
            if (isArgumentStart(peek())) {
                p.children.push(p.argumentList = argumentList());
            }
            expect(121 /* CloseParenthesis */);
            return end();
        }
        else if (p.phraseType === 148 /* ScopedCallExpression */) {
            //error
            error();
        }
        return end();
    }
    function scopedMemberName(parent) {
        let p = start({
            phraseType: 149 /* ScopedMemberName */,
            name: null,
            children: []
        });
        let t = peek();
        switch (t.tokenType) {
            case 116 /* OpenBrace */:
                parent.phraseType = 148 /* ScopedCallExpression */;
                p.children.push(p.name = encapsulatedExpression(116 /* OpenBrace */, 119 /* CloseBrace */));
                break;
            case 84 /* VariableName */:
                //Spec says this should be SimpleVariable
                //leaving as a token as this avoids confusion between 
                //static property names and simple variables
                parent.phraseType = 150 /* ScopedPropertyAccessExpression */;
                p.name = next();
                break;
            case 90 /* Dollar */:
                p.children.push(p.name = simpleVariable());
                parent.phraseType = 150 /* ScopedPropertyAccessExpression */;
                break;
            default:
                if (t.tokenType === 83 /* Name */ || isSemiReservedToken(t)) {
                    p.children.push(p.name = identifier());
                    parent.phraseType = 24 /* ClassConstantAccessExpression */;
                }
                else {
                    //error
                    error();
                }
                break;
        }
        return end();
    }
    function propertyAccessExpression(lhs) {
        let p = start({
            phraseType: 134 /* PropertyAccessExpression */,
            variable: null,
            memberName: null,
            children: []
        }, true);
        p.children.push(p.variable = lhs);
        next(); //->
        p.children.push(p.memberName = memberName());
        return end();
    }
    function propertyOrMethodAccessExpression(lhs) {
        let p = start({
            phraseType: 134 /* PropertyAccessExpression */,
            variable: null,
            memberName: null,
            children: []
        }, true);
        p.children.push(p.variable = lhs);
        next(); //->
        p.children.push(p.memberName = memberName());
        if (optional(118 /* OpenParenthesis */)) {
            if (isArgumentStart(peek())) {
                p.children.push(p.argumentList = argumentList());
            }
            p.phraseType = 110 /* MethodCallExpression */;
            expect(121 /* CloseParenthesis */);
        }
        return end();
    }
    function memberName() {
        let p = start({
            phraseType: 109 /* MemberName */,
            name: null,
            children: []
        });
        switch (peek().tokenType) {
            case 83 /* Name */:
                p.name = next();
                break;
            case 116 /* OpenBrace */:
                p.children.push(p.name = encapsulatedExpression(116 /* OpenBrace */, 119 /* CloseBrace */));
                break;
            case 90 /* Dollar */:
            case 84 /* VariableName */:
                p.children.push(p.name = simpleVariable());
                break;
            default:
                error();
                break;
        }
        return end();
    }
    function subscriptExpression(lhs, closeTokenType) {
        let p = start({
            phraseType: 158 /* SubscriptExpression */,
            dereferencable: null,
            offset: null,
            children: []
        }, true);
        p.children.push(p.dereferencable = lhs);
        next(); // [ or {
        if (isExpressionStart(peek())) {
            p.children.push(p.offset = expression(0));
        }
        expect(closeTokenType);
        return end();
    }
    function argumentList() {
        return delimitedList(8 /* ArgumentExpressionList */, argumentExpression, isArgumentStart, 93 /* Comma */, [121 /* CloseParenthesis */]);
    }
    function isArgumentStart(t) {
        return t.tokenType === 134 /* Ellipsis */ || isExpressionStart(t);
    }
    function variadicUnpacking() {
        let p = start({
            phraseType: 176 /* VariadicUnpacking */,
            expr: null,
            children: []
        });
        next(); //...
        p.children.push(p.expr = expression(0));
        return end();
    }
    function argumentExpression() {
        return peek().tokenType === 134 /* Ellipsis */ ?
            variadicUnpacking() : expression(0);
    }
    function qualifiedName() {
        let p = start({
            phraseType: 139 /* QualifiedName */,
            name: null,
            children: []
        });
        let t = peek();
        if (t.tokenType === 147 /* Backslash */) {
            next();
            p.phraseType = 83 /* FullyQualifiedName */;
        }
        else if (t.tokenType === 51 /* Namespace */) {
            p.phraseType = 142 /* RelativeQualifiedName */;
            next();
            expect(147 /* Backslash */);
        }
        p.children.push(p.name = namespaceName());
        return end();
    }
    function isQualifiedNameStart(t) {
        switch (t.tokenType) {
            case 147 /* Backslash */:
            case 83 /* Name */:
            case 51 /* Namespace */:
                return true;
            default:
                return false;
        }
    }
    function shortArrayCreationExpression() {
        let p = start({
            phraseType: 9 /* ArrayCreationExpression */,
            children: []
        });
        next(); //[
        if (isArrayElementStart(peek())) {
            p.children.push(p.initialiserList = arrayInitialiserList(120 /* CloseBracket */));
        }
        expect(120 /* CloseBracket */);
        return end();
    }
    function longArrayCreationExpression() {
        let p = start({
            phraseType: 9 /* ArrayCreationExpression */,
            children: []
        });
        next(); //array
        expect(118 /* OpenParenthesis */);
        if (isArrayElementStart(peek())) {
            p.children.push(p.initialiserList = arrayInitialiserList(121 /* CloseParenthesis */));
        }
        expect(121 /* CloseParenthesis */);
        return end();
    }
    function isArrayElementStart(t) {
        return t.tokenType === 103 /* Ampersand */ || isExpressionStart(t);
    }
    function arrayInitialiserList(breakOn) {
        let p = start({
            phraseType: 11 /* ArrayInitialiserList */,
            elements: [],
            children: []
        });
        let t;
        let el;
        while (true) {
            t = peek();
            //arrays can have empty elements
            if (isArrayElementStart(t)) {
                el = arrayElement();
                p.children.push(el);
                p.elements.push(el);
            }
            else if (t.tokenType === 93 /* Comma */) {
                next();
            }
            else if (t.tokenType === breakOn) {
                break;
            }
            else {
                error();
                break;
            }
        }
        return end();
    }
    function arrayValue() {
        let p = start({
            phraseType: 13 /* ArrayValue */,
            expr: null,
            children: []
        });
        p.byRef = optional(103 /* Ampersand */);
        p.children.push(p.expr = expression(0));
        return end();
    }
    function arrayKey() {
        let p = start({
            phraseType: 12 /* ArrayKey */,
            expr: null,
            children: []
        });
        p.children.push(p.expr = expression(0));
        return end();
    }
    function arrayElement() {
        let p = start({
            phraseType: 10 /* ArrayElement */,
            value: null,
            children: []
        });
        if (peek().tokenType === 103 /* Ampersand */) {
            p.children.push(p.value = arrayValue());
            return end();
        }
        let keyOrValue = arrayKey();
        p.children.push(keyOrValue);
        if (!optional(132 /* FatArrow */)) {
            keyOrValue.phraseType = 13 /* ArrayValue */;
            p.value = keyOrValue;
            return end();
        }
        p.key = keyOrValue;
        p.children.push(p.value = arrayValue());
        return end();
    }
    function encapsulatedExpression(openTokenType, closeTokenType) {
        let p = start({
            phraseType: 56 /* EncapsulatedExpression */,
            expr: null,
            children: []
        });
        expect(openTokenType);
        p.children.push(p.expr = expression(0));
        expect(closeTokenType);
        return end();
    }
    function relativeScope() {
        let p = start({
            phraseType: 143 /* RelativeScope */,
            identifier: null,
            children: []
        });
        p.identifier = next();
        return end();
    }
    function variableAtom() {
        let t = peek();
        switch (t.tokenType) {
            case 84 /* VariableName */:
            case 90 /* Dollar */:
                return simpleVariable();
            case 118 /* OpenParenthesis */:
                return encapsulatedExpression(118 /* OpenParenthesis */, 121 /* CloseParenthesis */);
            case 3 /* Array */:
                return longArrayCreationExpression();
            case 117 /* OpenBracket */:
                return shortArrayCreationExpression();
            case 78 /* StringLiteral */:
                return next(true);
            case 60 /* Static */:
                return relativeScope();
            case 83 /* Name */:
            case 51 /* Namespace */:
            case 147 /* Backslash */:
                return qualifiedName();
            default:
                //error
                let p = start({ phraseType: 67 /* ErrorVariableAtom */, children: [] });
                error();
                return end();
        }
    }
    function simpleVariable() {
        let p = start({
            phraseType: 154 /* SimpleVariable */,
            name: null,
            children: []
        });
        let t = expectOneOf([84 /* VariableName */, 90 /* Dollar */]);
        if (t.tokenType === 90 /* Dollar */) {
            t = peek();
            if (t.tokenType === 116 /* OpenBrace */) {
                next();
                p.children.push(p.name = expression(0));
                expect(119 /* CloseBrace */);
            }
            else if (t.tokenType === 90 /* Dollar */ || t.tokenType === 84 /* VariableName */) {
                p.children.push(p.name = simpleVariable());
            }
            else {
                error();
            }
        }
        else if (t.tokenType === 84 /* VariableName */) {
            p.name = t;
        }
        return end();
    }
    function haltCompilerStatement() {
        let p = start({ phraseType: 91 /* HaltCompilerStatement */, children: [] });
        next(); // __halt_compiler
        expect(118 /* OpenParenthesis */);
        expect(121 /* CloseParenthesis */);
        expect(88 /* Semicolon */);
        //all data is ignored after encountering __halt_compiler
        while (peek().tokenType !== 1 /* EndOfFile */) {
            next();
        }
        return end();
    }
    function namespaceUseDeclaration() {
        let p = start({
            phraseType: 122 /* NamespaceUseDeclaration */,
            list: null,
            children: []
        });
        next(); //use
        p.kind = optionalOneOf([35 /* Function */, 12 /* Const */]);
        optional(147 /* Backslash */);
        let nsNameNode = namespaceName();
        let t = peek();
        if (t.tokenType === 147 /* Backslash */ || t.tokenType === 116 /* OpenBrace */) {
            p.children.push(p.prefix = nsNameNode);
            expect(147 /* Backslash */);
            expect(116 /* OpenBrace */);
            p.children.push(p.list = delimitedList(124 /* NamespaceUseGroupClauseList */, namespaceUseGroupClause, isNamespaceUseGroupClauseStartToken, 93 /* Comma */, [119 /* CloseBrace */]));
            return end();
        }
        p.children.push(p.list = delimitedList(121 /* NamespaceUseClauseList */, namespaceUseClauseFunction(nsNameNode), isQualifiedNameStart, 93 /* Comma */, [88 /* Semicolon */]));
        expect(88 /* Semicolon */);
        return end();
    }
    function namespaceUseClauseFunction(nsName) {
        return () => {
            let p = start({
                phraseType: 120 /* NamespaceUseClause */,
                name: null,
                children: []
            }, !!nsName);
            if (nsName) {
                p.children.push(p.name = nsName);
                nsName = null;
            }
            else {
                p.children.push(p.name = namespaceName());
            }
            if (peek().tokenType === 4 /* As */) {
                p.children.push(p.aliasingClause = namespaceAliasingClause());
            }
            return end();
        };
    }
    function delimitedList(phraseType, elementFunction, elementStartPredicate, delimiter, breakOn) {
        let p = start({
            phraseType: phraseType,
            elements: [],
            children: []
        });
        let t;
        let element;
        let delimitedListRecoverSet = breakOn ? breakOn.slice(0) : [];
        delimitedListRecoverSet.push(delimiter);
        recoverSetStack.push(delimitedListRecoverSet);
        while (true) {
            element = elementFunction();
            p.children.push(element);
            p.elements.push(element);
            t = peek();
            if (t.tokenType === delimiter) {
                next();
            }
            else if (!breakOn || breakOn.indexOf(t.tokenType) >= 0) {
                break;
            }
            else {
                error();
                //check for missing delimeter
                if (elementStartPredicate(t)) {
                    continue;
                }
                else if (breakOn) {
                    //skip until breakOn or delimiter token or whatever else is in recover set
                    defaultSyncStrategy();
                    if (peek().tokenType === delimiter) {
                        continue;
                    }
                }
                break;
            }
        }
        recoverSetStack.pop();
        return end();
    }
    function isNamespaceUseGroupClauseStartToken(t) {
        switch (t.tokenType) {
            case 12 /* Const */:
            case 35 /* Function */:
            case 83 /* Name */:
                return true;
            default:
                return false;
        }
    }
    function namespaceUseGroupClause() {
        let p = start({
            phraseType: 123 /* NamespaceUseGroupClause */,
            name: null,
            children: []
        });
        p.kind = optionalOneOf([35 /* Function */, 12 /* Const */]);
        p.children.push(p.name = namespaceName());
        if (peek().tokenType === 4 /* As */) {
            p.children.push(p.aliasingClause = namespaceAliasingClause());
        }
        return end();
    }
    function namespaceAliasingClause() {
        let p = start({
            phraseType: 117 /* NamespaceAliasingClause */,
            alias: null,
            children: []
        });
        next(); //as
        p.alias = expect(83 /* Name */);
        return end();
    }
    function namespaceDefinition() {
        let p = start({
            phraseType: 118 /* NamespaceDefinition */,
            children: []
        });
        next(); //namespace
        if (peek().tokenType === 83 /* Name */) {
            p.children.push(p.name = namespaceName());
            let t = expectOneOf([88 /* Semicolon */, 116 /* OpenBrace */]);
            if (!t || t.tokenType !== 116 /* OpenBrace */) {
                return end();
            }
        }
        else {
            expect(116 /* OpenBrace */);
        }
        p.children.push(p.statementList = statementList([119 /* CloseBrace */]));
        expect(119 /* CloseBrace */);
        return end();
    }
    function namespaceName() {
        let p = start({
            phraseType: 119 /* NamespaceName */,
            parts: [],
            children: []
        });
        let part = expect(83 /* Name */);
        if (part) {
            p.parts.push(part);
        }
        while (true) {
            if (peek().tokenType === 147 /* Backslash */ &&
                peek(1).tokenType === 83 /* Name */) {
                next();
                p.parts.push(next());
            }
            else {
                break;
            }
        }
        return end();
    }
    function isReservedToken(t) {
        switch (t.tokenType) {
            case 41 /* Include */:
            case 42 /* IncludeOnce */:
            case 28 /* Eval */:
            case 57 /* Require */:
            case 58 /* RequireOnce */:
            case 49 /* Or */:
            case 50 /* Xor */:
            case 48 /* And */:
            case 43 /* InstanceOf */:
            case 52 /* New */:
            case 11 /* Clone */:
            case 29 /* Exit */:
            case 39 /* If */:
            case 19 /* ElseIf */:
            case 18 /* Else */:
            case 24 /* EndIf */:
            case 17 /* Echo */:
            case 16 /* Do */:
            case 68 /* While */:
            case 26 /* EndWhile */:
            case 33 /* For */:
            case 22 /* EndFor */:
            case 34 /* ForEach */:
            case 23 /* EndForeach */:
            case 14 /* Declare */:
            case 21 /* EndDeclare */:
            case 4 /* As */:
            case 64 /* Try */:
            case 8 /* Catch */:
            case 32 /* Finally */:
            case 62 /* Throw */:
            case 66 /* Use */:
            case 44 /* InsteadOf */:
            case 36 /* Global */:
            case 67 /* Var */:
            case 65 /* Unset */:
            case 46 /* Isset */:
            case 20 /* Empty */:
            case 13 /* Continue */:
            case 37 /* Goto */:
            case 35 /* Function */:
            case 12 /* Const */:
            case 59 /* Return */:
            case 53 /* Print */:
            case 69 /* Yield */:
            case 47 /* List */:
            case 61 /* Switch */:
            case 25 /* EndSwitch */:
            case 7 /* Case */:
            case 15 /* Default */:
            case 5 /* Break */:
            case 3 /* Array */:
            case 6 /* Callable */:
            case 30 /* Extends */:
            case 40 /* Implements */:
            case 51 /* Namespace */:
            case 63 /* Trait */:
            case 45 /* Interface */:
            case 9 /* Class */:
            case 10 /* ClassConstant */:
            case 77 /* TraitConstant */:
            case 74 /* FunctionConstant */:
            case 75 /* MethodConstant */:
            case 73 /* LineConstant */:
            case 72 /* FileConstant */:
            case 71 /* DirectoryConstant */:
            case 76 /* NamespaceConstant */:
                return true;
            default:
                return false;
        }
    }
    function isSemiReservedToken(t) {
        switch (t.tokenType) {
            case 60 /* Static */:
            case 2 /* Abstract */:
            case 31 /* Final */:
            case 54 /* Private */:
            case 56 /* Protected */:
            case 55 /* Public */:
                return true;
            default:
                return isReservedToken(t);
        }
    }
    function isStatementStart(t) {
        switch (t.tokenType) {
            case 51 /* Namespace */:
            case 66 /* Use */:
            case 38 /* HaltCompiler */:
            case 12 /* Const */:
            case 35 /* Function */:
            case 9 /* Class */:
            case 2 /* Abstract */:
            case 31 /* Final */:
            case 63 /* Trait */:
            case 45 /* Interface */:
            case 116 /* OpenBrace */:
            case 39 /* If */:
            case 68 /* While */:
            case 16 /* Do */:
            case 33 /* For */:
            case 61 /* Switch */:
            case 5 /* Break */:
            case 13 /* Continue */:
            case 59 /* Return */:
            case 36 /* Global */:
            case 60 /* Static */:
            case 17 /* Echo */:
            case 65 /* Unset */:
            case 34 /* ForEach */:
            case 14 /* Declare */:
            case 64 /* Try */:
            case 62 /* Throw */:
            case 37 /* Goto */:
            case 83 /* Name */:
            case 88 /* Semicolon */:
            case 158 /* CloseTag */:
            case 81 /* Text */:
            case 156 /* OpenTag */:
            case 157 /* OpenTagEcho */:
                return true;
            default:
                return isExpressionStart(t);
        }
    }
})(Parser = exports.Parser || (exports.Parser = {}));
