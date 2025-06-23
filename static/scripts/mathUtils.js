const customFunctions={
    factorial:n=>{if(n<0)return NaN;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
};
math.import(customFunctions,{override:true});
export function safeEval(exp){
    if(!exp) return '';
    try{return math.evaluate(cleanExpression(exp))}catch(e){return ''}
}
function cleanExpression(exp){
    return exp
        .replace(/x/g,'*')
        .replace(/√(\d+)/g,'sqrt($1)')
        .replace(/√\(/g,'sqrt(')
        .replace(/log\(/g,'log10(')
        .replace(/(\d+)!/g,'factorial($1)')
        .replace(/\(([^)]+)\)!/g,'factorial($1)')
        .replace(/(\d+)\^(\d+)/g,'pow($1,$2)')
        .replace(/\b(\d+)\s*\(/g,'$1*(')
        .replace(/\)\s*(\d+)/g,')*$1')
        .replace(/\(\)/g,'0');
}
