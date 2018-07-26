# php7parser

A fast and forgiving PHP7 recursive descent parser implemented in Typescript. 

The parser outputs a parse tree of phrases (branches) and tokens (leaves). 
The full source code is represented by the tree. Trivia is accessible via `Token.previous`.

## Design Goals

* Modern browser and nodejs compatibility.
* Error tolerant and high performance.
* Output representative of full source code.
* Adherance to the PHP language specifications.
* Prefer error tolerance over enforcement of language constraints.

## Usage

```typescript
    import { Parser } from 'php7parser';

    let src = '<?php echo "Hello World!";';
    let tree = Parser.parse(src);
```

## Interface

```typescript

    export declare namespace Parser {
        function parse(text: string): Phrase;
    }

    export interface Node {
        kind: number;
        length: number;
    }

    export interface Phrase extends Node {
        /**
        * Phrase and token child nodes
        */
        children: Node[];
    }

    export interface ParseError extends Phrase {

        /**
        * The token that prompted the parse error
        */
        unexpected: Token;

        /**
        * The expected token type
        */
        expected?: TokenKind;

    }

    export interface Token extends Node {
        /**
        * Offset within source were first char of token is found
        * @deprecated
        */
        offset: number,
        /**
        * The previous token
        */
        previous: Token
    }

```
