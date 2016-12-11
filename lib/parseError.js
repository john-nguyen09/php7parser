'use strict';
class ParseError {
    constructor(unexpected, expected = []) {
        this._unexpected = unexpected;
        this._expected = expected;
    }
    get unexpected() {
        return this._unexpected;
    }
    get expected() {
        return this._expected;
    }
}
exports.ParseError = ParseError;
