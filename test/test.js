var assert = require('chai').assert;
var cp = require('child_process');
var path = require('path');
var testDir = path.join(__dirname, 'cases');
var php7parser = require(path.join(__dirname, '../lib/php7parser'));
var fs = require('fs');

cp.execSync('npm run build');

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

const keys = [
    'tokenType', 'offset', 'length', 'modeStack',
    'phraseType', 'children', 'errors', 'unexpected',
    'numberSkipped'
];

describe("php7parser", function () {

    var list = fs.readdirSync(testDir);
    list.forEach(function (file) {
        var filepath = path.join(testDir, file);
        if (path.extname(filepath) !== '.php') {
            return;
        }
        var phpData = fs.readFileSync(filepath);
        let tree = php7parser.Parser.parse(phpData.toString());
        let actual = JSON.parse(JSON.stringify(tree, (k, v) => {
            return k && !isNumeric(k) && keys.indexOf(k) < 0 ? undefined : v;
        }, 4));

        let jsonData = fs.readFileSync(filepath + '.json');
        let expected = JSON.parse(jsonData.toString());

        it(filepath, function () {
            assert.deepEqual(actual, expected);
        });

    });

});
