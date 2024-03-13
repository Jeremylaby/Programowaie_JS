function sum(x,y) {
    return x+y;
}
function sum_strings(a){
    let suma=0;
    for(const string of a){
        let number="";
        for(const char of string){
            if(!isNaN(parseInt(char))){
                number+=char
            }else{
                break;
            }
        }
        if(number.length!==0){
            suma+=(parseInt(number))
        }
    }
    return suma;
}
function digits(s){
    const suma = [0,0]
    for(const char of s){
        const number=parseInt(char);
        if(!isNaN(number)){
            if(number % 2 ===0){
                suma[1]+=number
            }else{
                suma[0]+=number
            }
        }
    }
    return suma;
}
function letters(s){
    const suma = [0,0]
    for(const char of s) {
        if(isNaN(char)){
            if (char === char.toLowerCase()) {
                suma[0] += 1
            } else {
                suma[1] += 1
            }
        }
    }
    return suma;
}