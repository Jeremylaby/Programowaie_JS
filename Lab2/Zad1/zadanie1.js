function funkcja_zwrotna(){
    let pole_tekstowe = document.forms[0].elements["pole_tekstowe"].value
    let pole_liczbowe = document.forms[0].elements["pole_liczbowe"].value
    console.log(pole_tekstowe , typeof pole_tekstowe)
    console.log(pole_liczbowe, typeof pole_liczbowe)
    //Wprowadzenia wartości będącej liczbą i naciśnięcia powyższego przycisku.
    //Wprowadzenia wartości będącej napisem i naciśnięcia ww. przycisku.
    //Niewprowadzenia wartości i naciśnięcia przycisku "Wypisz".
    //za każdym razem wypisana wartość jest stringiem
}
function init() {
    for (let i = 0; i < 4; i++) {
        let value = window.prompt("Tekst1", "Tekst2");
        console.log(value, typeof value)
    }
}