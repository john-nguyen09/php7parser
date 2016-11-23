/* Copyright © Ben Mewburn ben@mewburn.id.au
 * Licensed under the MIT Licence.
 */

'use strict';

import { TokenType, Token } from './lexer';

export class ParseError {

    constructor(public unexpected: Token,
        public expected: (TokenType | string)[],
        public skipped: Token[] = null) {

    }

}