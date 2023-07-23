{{

function evaluate(fnName: string, params: unknown[]): number {
  if (fnName in Math) {
    if (Math[fnName].length > params.length)
      throw new TypeError(`Math.${fnName} requires ${Math[fnName].length} arguments`);
    return Math[fnName](...params);
  }
  throw new TypeError(`Unknown function: ${fnName}`);
}

}}

Expression
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      return tail.reduce(function(result, element): number {
        if (element[1] === "+") { return result + element[3]; }
        if (element[1] === "-") { return result - element[3]; }
      }, head);
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce(function(result, element): number {
        if (element[1] === "*") { return result * element[3]; }
        if (element[1] === "/") { return result / element[3]; }
      }, head);
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / Constant
  / FunctionCall
  / Number

Constant "constant"
  = "pi"i { return Math.PI; }
  / "e"i { return Math.E; }

FunctionCall "function call"
  = fn:FunctionName _ "(" params:(Expression|.., _ "," _|) ")" {
    return evaluate(fn, params);
  }

FunctionName "function name"
  = _ fn:([a-z]i [a-z0-9_]i*) { return text().trim(); }

Number "decimal number"
  = _ [+-]? [0-9]+ ("." [0-9]+)? ([eE] [+-]? [0-9]+)? { return parseFloat(text()); }

_ "whitespace"
  = [ \t\n\r]*
