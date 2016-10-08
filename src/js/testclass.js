class foo {
     constructor(arg) {
          // constructor code here
		this.arg = arg;
     }

     myMethod() {
          // method body code here
		//console.log(this.arg);
		return this.arg;
     }
}

let makeFoo = (arg) => new foo(arg);

export default makeFoo;
