/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { TokenType, Token } from './lexer';
import { TokenIterator } from './tokenIterator';
import { AstNodeType } from './parser';

export class ParseError {

    private _unexpected: Token;
    private _expected: (TokenType | string)[];

    constructor(unexpected: Token, expected: (TokenType | string)[] = []) {
        this._unexpected = unexpected;
        this._expected = expected;
    }

    get unexpected(){
        return this._unexpected;
    }

    get expected(){
        return this._expected;
    }

}
