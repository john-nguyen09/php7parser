/*
* Manual test of file
* node parseFile.js PATH_TO_FILE
*/
var fs = require('fs');
var path = require('path');
var php = require('../../lib/php7parser');
var tree;

if (process.argv.length !== 3) {
    console.log('Usage: node parseFile.js PATH_TO_FILE');
    return;
}

filepath = process.argv[2];

fs.readFile(filepath, function (err, data) {
    if (err) {
        throw err;
    }

    console.time('elapsed');
    tree = php.Parser.parse(data.toString());
    console.timeEnd('elapsed');
    console.log(JSON.stringify(tree, null, 4));
    
});
