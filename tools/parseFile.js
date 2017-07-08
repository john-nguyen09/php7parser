/*
* Manual test of file
* node parseFile.js PATH_TO_FILE
*/
var fs = require('fs');
var path = require('path');
var php = require('../lib/php7parser');
var tree;

if (process.argv.length !== 3) {
    console.log('Usage: node parseFile.js PATH_TO_FILE');
    return;
}
/*
let keys = ['tokenType', 'phraseType', 'errors', 'unexpected', 'offset', 'numberSkipped', 'children'];
let replacer = (k, v) => { 

    if(k === 'tokenType') {
        return php.tokenTypeToString(v);
    }

    if(k === 'phraseType') {
        return php.phraseTypeToString(v);
    }

    return isNaN(k) && keys.indexOf(k) < 0 ? undefined : v; 

}*/
filepath = process.argv[2];

fs.readFile(filepath, function (err, data) {
    if (err) {
        throw err;
    }

    let dataString = data.toString();
    let hrtime = process.hrtime();
    tree = php.Parser.parse(dataString);
    let hrtimeDiff = process.hrtime(hrtime);
    //console.log(JSON.stringify(tree, replacer, 4));
    console.log(hrtimeDiff);
    console.log(process.memoryUsage());

});
