/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { TokenType, Token } from './lexer';
import { TokenIterator } from './tokenIterator';
import { NodeType } from './parser';

export class ParseError {

    private _unexpected: Token;
    private _expected: (TokenType | string)[];
    private _nodeTypes: NodeType[];

    constructor(unexpected: Token, expected: (TokenType | string)[] = [], nodeTypes: NodeType[] = []) {
        this._unexpected = unexpected;
        this._expected = expected;
        this._nodeTypes = nodeTypes;
    }

    get unexpected(){
        return this._unexpected;
    }

    get expected(){
        return this._expected;
    }

    get nodeTypes(){
        return this._nodeTypes;
    }

}

export interface SyncOption {
    expected: TokenType|string;
    followOn?: (t: Token) => boolean;
}

export class ErrorRecovery {

    private _syncDepth: number;
    private _followOnStack: ((t: Token) => boolean)[];
    private _tokens: TokenIterator;

    constructor(tokens: TokenIterator) {
        this._tokens = tokens;
        this._followOnStack = [];
        this._syncDepth = 0;
    }

    get isRecovering(): boolean {
        return this._syncDepth > 0;
    }

    /**
     * If calling production can continue then the successful syncOption is returned, else null
     * The sync token will be the current token
     */
    recover(syncOptions: SyncOption[]):SyncOption {

        this._syncDepth = 0;
        let syncOption: SyncOption;

        for (let n = 0; n < syncOptions.length; ++n) {

            syncOption = syncOptions[n];
            if (this._testInsert(syncOption)) {
                return syncOption;
            } else if (this._testSubstitute(syncOption)) {
                this._tokens.next();
                return syncOption;
            } else if (this._testSkip(syncOption)) {
                this._tokens.next();
                this._tokens.next();
                return syncOption;
            }

        }

        let t = this._tokens.peek();
        while (true) {

            if (t.type === TokenType.T_EOF) {
                this._syncDepth = this._followOnStack.length;
                break;
            }

            for (let n = this._followOnStack.length - 1; n >= 0; --n) {
                if (this._followOnStack[n](t)) {
                    this._syncDepth = this._followOnStack.length - n;
                    break;
                }
            }

            this._tokens.next();
            t = this._tokens.peek();

        }

        return null;

    }

    pushFollowOn(predicate: (t: Token) => boolean) {

        this._followOnStack.push(predicate);

    }

    popFollowOn() {

        this._followOnStack.pop();
        if (this._syncDepth > 0) {
            --this._syncDepth;
        }

    }

    private _followOnTop(){
        return this._followOnStack.length ? this._followOnStack[this._followOnStack.length - 1] : null;
    }

    private _testSubstitute(syncOption: SyncOption) {
        let followOn = syncOption.followOn ? syncOption.followOn : this._followOnTop();
        return followOn ? followOn(this._tokens.peek(1)) : false;
    }

    private _testInsert(syncOption: SyncOption) {
        return syncOption.followOn ? syncOption.followOn(this._tokens.peek()) : false;
    }

    private _testSkip(syncOption: SyncOption) {
        return syncOption.expected === this._tokens.peek(1).type;
    }


}