/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import {Token, Iterator, TokenType} from './lexer';

export class TokenIterator implements Iterator<Token> {

    private _iteratable: Iterator<Token>;
    private _current: Token;
    private _buffer: Token[];
    private _endToken: Token = {
        type: TokenType.T_EOF,
        text: null,
        mode: null,
        range: null
    };
    private _lastDocComment: Token;

    constructor(iteratable: Iterator<Token>) {
        this._iteratable = iteratable;
        this._buffer = [];
    }

    get current() {
        return this._current;
    }

    get lastDocComment() {
        let t = this._lastDocComment;
        this._lastDocComment = null;
        return t;
    }

    next(): Token {
        let t = this._buffer.length ? this._buffer.shift() : this._iteratable.next();

        if (!t) {
            t = this._endToken;
        } else if (t.type === '}') {
            this._lastDocComment = null;
        } else if (this.shouldSkip(t)) {
            return this.next();
        }

        return this._current = t;

    }

    lookahead(n = 0) {

        let t: Token;

        for (let k = n - this._buffer.length; k >= 0; --k) {

            t = this._iteratable.next();
            if (!t) {
                return this._endToken;
            }
            this._buffer.push(t);
        }

        return this._buffer[n];
    }

    private shouldSkip(t: Token) {
        return t.type === TokenType.T_WHITESPACE ||
            t.type === TokenType.T_COMMENT ||
            t.type === TokenType.T_DOC_COMMENT ||
            t.type === TokenType.T_OPEN_TAG ||
            t.type === TokenType.T_OPEN_TAG_WITH_ECHO ||
            t.type === TokenType.T_CLOSE_TAG;
    }

}