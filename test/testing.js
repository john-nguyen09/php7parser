


var variable = {
    parse: () =>{
        return expression.parse();
    }
}

var expression = {
    parse: ()=>{
        console.log('HELLO WORLD');
    }
}

variable.parse();
