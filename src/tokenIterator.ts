/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { Token, TokenType } from './lexer';

export class TokenIterator {

    private _tokens: Token[];
    private _pos: number;
    private _current: Token;
    private _endToken: Token = {
        tokenType: TokenType.T_EOF,
        text: null,
        mode: null,
        range: null
    };
    private _lastDocComment: Token;

    constructor(tokens: Token[]) {
        this._tokens = tokens;
        this._pos = -1;
    }

    get current() {
        return this._pos >= 0 ? this._tokens[this._pos] : null;
    }

    get lastDocComment() {
        let t = this._lastDocComment;
        this._lastDocComment = null;
        return t;
    }

    consume(tokenType: TokenType | string) {
        return this.peek().tokenType === tokenType ? this.next() : null;
    }

    next(): Token {

        if (this._pos === this._tokens.length - 1) {
            return this._endToken;
        }

        ++this._pos;

        switch (this._tokens[this._pos].tokenType) {
            case TokenType.T_DOC_COMMENT:
                this._lastDocComment = this._tokens[this._pos];
                return this.next();
            case '}':
                this._lastDocComment = null;
                break;
            case TokenType.T_WHITESPACE:
            case TokenType.T_COMMENT:
            case TokenType.T_OPEN_TAG:
            case TokenType.T_OPEN_TAG_WITH_ECHO:
            case TokenType.T_CLOSE_TAG:
                return this.next();
            default:
                break;
        }

        return this._tokens[this._pos];

    }

    peek(n = 0) {

        let k = n + 1
        let pos = this._pos;

        while (k) {
            if (++pos < this._tokens.length) {
                if (!this._shouldSkip(this._tokens[pos])) {
                    --k;
                }
            } else {
                return this._endToken;
            }
        }

        return this._tokens[pos];
    }

    skip(until: (TokenType | string)[]) {

        let t: Token;

        while (true) {
            t = this.peek();
            if (until.indexOf(t.tokenType) !== -1 || t.tokenType === TokenType.T_EOF) {
                break;
            }
        }

        return t;
    }

    private _shouldSkip(t: Token) {
        switch (t.tokenType) {
            case TokenType.T_DOC_COMMENT:
            case TokenType.T_WHITESPACE:
            case TokenType.T_COMMENT:
            case TokenType.T_OPEN_TAG:
            case TokenType.T_OPEN_TAG_WITH_ECHO:
            case TokenType.T_CLOSE_TAG:
                return true;
            default:
                return false;
        }
    }

}