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

import { Token as ImportedToken } from './lexer';
import { Phrase as ImportedPhrase, PhraseKind } from './phrase';
import {Node as ImportedNode} from './node';

export { Lexer, LexerMode, Token, TokenKind, tokenKindToString, isKeyword } from './lexer';
export { Parser } from './parser';
export  * from './phrase';
export * from './node';

export function isToken(node:ImportedNode): node is ImportedToken {
    return node && node.kind < PhraseKind.Unknown;
}

export function isPhrase(node:ImportedNode): node is ImportedPhrase {
    return node && node.kind >= PhraseKind.Unknown;
}