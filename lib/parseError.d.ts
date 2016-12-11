import { TokenType, Token } from './lexer';
export declare class ParseError {
    private _unexpected;
    private _expected;
    constructor(unexpected: Token, expected?: (TokenType | string)[]);
    readonly unexpected: Token;
    readonly expected: (string | TokenType)[];
}
