/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */

'use strict';

import { Token, TokenKind } from './lexer';
import { PhraseKind, Phrase } from './phrase';

export { Lexer, LexerMode, Token, TokenKind, tokenKindToString } from './lexer';
export { Parser } from './parser';
export * from './phrase';

export function isToken(node:{kind:number}): node is Token {
    return node && node.kind !== undefined && node.kind <= TokenKind.Whitespace;
}

export function isPhrase(node:{kind:number}): node is Phrase {
    return node && node.kind >= PhraseKind.Unknown;
}