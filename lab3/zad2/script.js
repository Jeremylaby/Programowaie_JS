let paraNum = 0;
const text1 = "Natenczas Wojski chwycił na taśmie przypięty\n" +
    "Swój  róg bawoli, długi, cętkowany, kręty \n" +
    "Jak wąż boa, oburącz do ust go przycisnął,\n" +
    "Wzdął policzki jak banię, w oczach krwią zabłysnął, \n" +
    "Zasunął wpół powieki,  wciągnął w głąb pół brzucha \n" +
    "I do płuc wysłał z niego cały zapas ducha, \n" +
    "I zagrał: róg jak wicher, wirowatym dechem \n" +
    "Niesie w puszczę muzykę i podwaja echem."
const text2 = "Umilkli strzelcy, stali szczwacze zadziwieni \n" +
    "Mocą, czystością, dziwną harmoniją pieni. \n" +
    "Starzec cały kunszt, którym niegdyś w lasach słynął, \n" +
    "Jeszcze raz przed uszami myśliwców rozwinął; \n" +
    "Napełnił wnet, ożywił knieje i dąbrowy, \n" +
    "Jakby psiarnię w nie wpuścił i rozpoczął łowy."
const text3 = "Bo w graniu była łowów historyja krótka: \n" +
    "Zrazu odzew dźwięczący, rześki: to pobudka; \n" +
    "Potem jęki po jękach skomlą: to psów granie; \n" +
    "A gdzieniegdzie ton twardszy jak grzmot: to strzelanie."
function setElements() {
    const elements = document.querySelectorAll(".element");
    const body = document.querySelector("body")
    const headers = document.querySelectorAll("h1");
    body.classList.add("body_display")
    elements.forEach(element => {
        element.classList.add("azure", "border", "margins")
    })
    headers.forEach(header => {
        header.classList.add("animation");
    })
}

function deleteElements() {
    const elements = document.querySelectorAll(".element");
    const body = document.querySelector("body")
    const headers = document.querySelectorAll("h1");
    body.classList.remove("body_display")
    elements.forEach(element => {
        element.classList.remove("azure", "border", "margins")
    });
    headers.forEach(header => {
        header.classList.remove("animation");
    });
}

function addByLine(text) {
    const block = document.querySelector("blockquote")
    const paragraph = document.createElement("p");
    let lines = text.split("\n");
    lines.forEach(line => {
        let textNode = document.createTextNode(line);
        let br = document.createElement("br");
        paragraph.appendChild(textNode);
        paragraph.appendChild(br);
    })
    block.appendChild(paragraph);
}

function addParagraph() {
    switch (paraNum) {
        case 0:
            addByLine(text1);
            break;
        case 1:
            addByLine(text2)
            break;
        case 2:
            const button=document.getElementById("addButton")
            button.disabled=true;
            addByLine(text3)
            break;

    }
    paraNum++;
}