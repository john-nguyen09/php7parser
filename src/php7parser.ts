/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */

'use strict';

import { Token as ImportedToken, TokenKind as ImportedTokenKind } from './lexer';
import { PhraseKind as ImportedPhraseKind, Phrase as ImportedPhrase } from './phrase';

export { Lexer, LexerMode, Token, TokenKind, tokenKindToString } from './lexer';
export { Parser } from './parser';
export  * from './phrase';

export function isToken(node:{kind:number}): node is ImportedToken {
    return node && node.kind !== undefined && node.kind <= ImportedTokenKind.Whitespace;
}

export function isPhrase(node:{kind:number}): node is ImportedPhrase {
    return node && node.kind >= ImportedPhraseKind.Unknown;
}