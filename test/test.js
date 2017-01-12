
    function myfunc(a, b){
        console.log(a, b);
    }

    var f = myfunc;
    var args = undefined;

    f.call(f, ...args);