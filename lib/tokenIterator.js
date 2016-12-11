'use strict';
const lexer_1 = require("./lexer");
class TokenIterator {
    constructor(tokens) {
        this._endToken = {
            type: lexer_1.TokenType.T_EOF,
            text: null,
            mode: null,
            range: null
        };
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
    consume(tokenType) {
        return this.peek().type === tokenType ? this.next() : null;
    }
    next() {
        if (this._pos === this._tokens.length - 1) {
            return this._endToken;
        }
        ++this._pos;
        switch (this._tokens[this._pos].type) {
            case lexer_1.TokenType.T_DOC_COMMENT:
                this._lastDocComment = this._tokens[this._pos];
                return this.next();
            case '}':
                this._lastDocComment = null;
                break;
            case lexer_1.TokenType.T_WHITESPACE:
            case lexer_1.TokenType.T_COMMENT:
            case lexer_1.TokenType.T_OPEN_TAG:
            case lexer_1.TokenType.T_OPEN_TAG_WITH_ECHO:
            case lexer_1.TokenType.T_CLOSE_TAG:
                return this.next();
            default:
                break;
        }
        return this._tokens[this._pos];
    }
    peek(n = 0) {
        let k = n + 1;
        let pos = this._pos;
        while (k) {
            if (++pos < this._tokens.length) {
                if (!this._shouldSkip(this._tokens[pos])) {
                    --k;
                }
            }
            else {
                return this._endToken;
            }
        }
        return this._tokens[pos];
    }
    skip(until) {
        let t;
        while (true) {
            t = this.peek();
            if (until.indexOf(t.type) !== -1 || t.type === lexer_1.TokenType.T_EOF) {
                break;
            }
        }
        return t;
    }
    _shouldSkip(t) {
        switch (t.type) {
            case lexer_1.TokenType.T_DOC_COMMENT:
            case lexer_1.TokenType.T_WHITESPACE:
            case lexer_1.TokenType.T_COMMENT:
            case lexer_1.TokenType.T_OPEN_TAG:
            case lexer_1.TokenType.T_OPEN_TAG_WITH_ECHO:
            case lexer_1.TokenType.T_CLOSE_TAG:
                return true;
            default:
                return false;
        }
    }
}
exports.TokenIterator = TokenIterator;
