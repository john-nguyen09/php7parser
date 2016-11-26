/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { TokenType, Token } from './lexer';
import { TokenIterator } from './tokenIterator';

export class ParseError {

    constructor(public unexpected: Token,
        public expected: (TokenType | string)[],
        public skipped: Token[] = null) {

    }

}

export interface SyncOption {
    expected: TokenType;
    followOnSet: (TokenType | string)[];
}

export class ErrorRecovery {

    private _syncDepth: number;
    private _followOnStack: (TokenType | string)[][];
    private _tokens: TokenIterator;

    get isRecovering(): boolean {
        return this._syncDepth > 0;
    }

    /**
     * @return boolean true if calling production can continue
     */
    recover(syncOptions: SyncOption[]) {

        this._syncDepth = 0;
        let syncOption: SyncOption;

        for (let n = 0; n < syncOptions.length; ++n) {

            syncOption = syncOptions[n];
            if (this._testInsert(syncOption)) {
                return true;
            } else if (this._testSubstitute(syncOption)) {
                this._tokens.next();
                return true;
            } else if (this._testSkip(syncOption)) {
                this._tokens.next();
                this._tokens.next();
                return true;
            }

        }

        let t = this._tokens.lookahead();
        while (true) {

            if (t.type === TokenType.T_EOF) {
                this._syncDepth = this._followOnStack.length;
                break;
            }

            for (let n = this._followOnStack.length - 1; n >= 0; --n) {
                if (this._followOnStack[n].indexOf(t.type)) {
                    this._syncDepth = this._followOnStack.length - n;
                    break;
                }
            }

            this._tokens.next();
            t = this._tokens.lookahead();

        }

        return false;

    }

    pushFollowOn(set: (TokenType | string)[]) {

        this._followOnStack.push(set);

    }

    popFollowOn() {

        this._followOnStack.pop();
        if (this._syncDepth > 0) {
            --this._syncDepth;
        }

    }

    private _testSubstitute(syncOption: SyncOption) {
        return syncOption.followOnSet.indexOf(this._tokens.lookahead(1).type) !== -1;
    }

    private _testInsert(syncOption: SyncOption) {
        return syncOption.followOnSet.indexOf(this._tokens.lookahead().type) !== -1;
    }

    private _testSkip(syncOption: SyncOption) {
        return this._tokens.lookahead(1).type === syncOption.expected;
    }


}