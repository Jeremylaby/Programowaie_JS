function angleToRadian(angle)  {
    return Math.PI/180 * angle;
}
function draw( scale){
    "use strict";                                   // Nie wyłączaj trybu ścisłego
    var canvas = document.getElementById('canvas'); // Tutaj jest użyty standard W3C DOM — będzie on tematem następnych ćwiczeń
    var ctx = canvas.getContext('2d');

    ctx.scale(scale, scale);
    const gradient = ctx.createLinearGradient(110, 250, 280, 60);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "red");
    ctx.strokeStyle = gradient
    ctx.beginPath();
    ctx.lineWidth=20;
    ctx.arc(160, 180, 100, 0, angleToRadian(360));
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth=20;
    ctx.arc(310, 180, 100, 0, angleToRadian(360));
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth=15;
    ctx.arc(310, 180, 150, angleToRadian(260), angleToRadian(360));
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth=15;
    ctx.arc(160, 180, 150, angleToRadian(80), angleToRadian(180));
    ctx.stroke();
    ctx.clearRect(110, 150, 280, 60);
    ctx.font = "italic bold 50px Arial";// Utworzenie obiektu 'CanvasRenderingContext2D'
    ctx.fillText("CAR SHOP",100,200)

}