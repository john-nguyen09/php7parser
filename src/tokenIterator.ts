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
        type: TokenType.T_EOF,
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
        return this.peek().type === tokenType ? this.next() : null;
    }

    next(): Token {

        if (this._pos === this._tokens.length - 1) {
            return this._endToken;
        }

        ++this._pos;

        switch (this._tokens[this._pos].type) {
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
        let pos = this._pos + n + 1;
        return pos < this._tokens.length ? this._tokens[pos] : this._endToken;
    }

    skip(until: (t:Token)=>boolean) {

        let t: Token;

        while (true) {
            t = this.peek();
            if (until(t) || t.type === TokenType.T_EOF) {
                break;
            }
        }

        return t;
    }

}