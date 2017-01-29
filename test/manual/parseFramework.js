/*
* Manual test of large project parsing
* node test.js.manual pathToCodeRootDir
*/
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var php7parser = require('../lib/php7parser');

var ast;
var parser = new php7parser.Parser(new php7parser.Lexer(), php7parser.defaultAstNodeOps);
var count = 0;
var done = 0;

if(process.argv.length !== 3){
    console.log('Usage: node test.js.manual PATH_TO_CODE_ROOT_DIR');
}

var pathToCodeRootDir = process.argv[2];

console.time('parsed in');
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

                        ast = parser.parse(data.toString());
                        if (ast) {
                            console.log('SUCCESS: ' + filepath);
                        } else {
                            console.log('FAIL: ' + filepath);
                            throw parser.errors[0].message;
                        }
                        ++done;
                        if(count === done){
                            console.log(count + ' files parsed');
                            console.timeEnd('parsed in');
                        }
                    });
                }
            });
        });
    });
};

parseRecurse(pathToCodeRootDir);
