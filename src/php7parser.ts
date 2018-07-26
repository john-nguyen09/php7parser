/*
 *   php7parser - A recursive descent php parser
 *   Copyright (C) 2018 Ben Mewburn <ben@mewburn.id.au>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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