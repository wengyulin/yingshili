function test() {

    let a = 1;

    function b() {
        console.log(a);
    }

    return {b}
}

function test1() {
    var mediu = test();
    return {
        b: mediu.b
    }
}

function test2() {

    this.a = 1;
    this.funca = function () {
        console.log(this.a);
    }
}



function test3(){
    var objtes2 = new test2();

    return {funca:objtes2.funca}
}
var obj4 = {...test3}
obj4.funca();
var obj3 = test3();
obj3.funca()