var assert = require('chai').assert;
var cp = require('child_process');
var path = require('path');
var testDir = path.join(__dirname, 'cases');
var php7parser = require(path.join(__dirname, '../lib/php7parser'));
var fs = require('fs');

cp.execSync('npm run build');

describe("php7parser", function () {

    var list = fs.readdirSync(testDir);
    list.forEach(function (file) {
        var filepath = path.join(testDir, file);
        if (path.extname(filepath) !== '.php') {
            return;
        }
        var phpData = fs.readFileSync(filepath);
        let actual = JSON.parse(JSON.stringify(php7parser.Parser.parse(phpData.toString()), (k,v) => k === 'previous' ? undefined : v));

        let jsonData = fs.readFileSync(filepath + '.json');
        let expected = JSON.parse(jsonData.toString());

        it(filepath, function () {
            assert.deepEqual(actual, expected);
        });

    });

});
