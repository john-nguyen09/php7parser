# php7parser

A fast and forgiving PHP7 recursive descent parser which outputs a parse tree.

## Design Goals

* Modern browser and nodejs compatibility.
* Error tolerant and high performance.
* Adhere to the PHP Language specifications.

## Usage

```typescript
    import { Parser } from 'php7parser';

    let src = '<?php echo "Hello World!";';
    let tree = Parser.parse(src);
```