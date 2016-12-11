import { Token, TokenType } from './lexer';
export declare class TokenIterator {
    private _tokens;
    private _pos;
    private _current;
    private _endToken;
    private _lastDocComment;
    constructor(tokens: Token[]);
    readonly current: Token;
    readonly lastDocComment: Token;
    consume(tokenType: TokenType | string): Token;
    next(): Token;
    peek(n?: number): Token;
    skip(until: (TokenType | string)[]): Token;
    private _shouldSkip(t);
}
