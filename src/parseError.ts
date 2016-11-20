/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { TokenType } from './lexer';

export class ParseError {

    constructor(public unexpected: TokenType | string,
        public expected: (TokenType | string)[],
        public skipped: (TokenType | string)[] = null,
        public substituted: Substitute = null,
        public inserted: TokenType | string) {

    }



}

export interface Substitute {
    actual: TokenType | string;
    substitute: TokenType | string;
}