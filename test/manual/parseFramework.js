/*
* Manual test of framework parsing
* node parseFramework.js PATH_TO_CODE_ROOT_DIR
*/
var fs = require('fs');
var path = require('path');
var php = require('../../lib/php7parser');

var count = 0;
var done = 0;
var elapsed = 0;

if(process.argv.length !== 3){
    console.log('Usage: node parseFramework.js PATH_TO_CODE_ROOT_DIR');
    return;
}

var pathToCodeRootDir = process.argv[2];

function hasErrorRecurse(node){
    if(node.errors){
        throw new Error(JSON.stringify(node, null, 4));
    }

    if(node.children){
        for(let n = 0; n < node.children.length; ++n){
            hasErrorRecurse(node.children[n]);
        }
    }
}

function parseRecurse(dir) {
    
    fs.readdir(dir, function (err, list) {
        if (err) {
            throw err;
        }

        list.forEach(function (file) {
            var filepath = dir + "/" + file;
 
            fs.stat(filepath, function (err, stat) {
                if (err) {
                    throw err;
                }

                if (stat && stat.isDirectory()) {
                    parseRecurse(filepath);
                }
                else if (path.extname(filepath) === '.php') {
                    ++count;
                    fs.readFile(filepath, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        console.log('parsing ' + filepath);
                        let dataString = data.toString();
                        let hrTime = process.hrtime();
                        let tree = php.Parser.parse(dataString);
                        let hrTimeDiff = process.hrtime(hrTime);
                        elapsed += Math.round(hrTimeDiff[1] / 1000000) + hrTimeDiff[0] * 1000;
                        hasErrorRecurse(tree);
                        ++done;
                        if(count === done){
                            console.log(count + ' files parsed');
                            console.log('elapsed: ' + elapsed + ' ms');
                        }
                    });
                }
            });
        });
    });
};

parseRecurse(pathToCodeRootDir);
