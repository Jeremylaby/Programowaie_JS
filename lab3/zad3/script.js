var animation;
var counter = 0;

// Source: https://udn.realityripple.com/docs/Tools/Performance/Scenarios/Intensive_JavaScript
function calculatePrimes(iterations) {
    var primes = [];
    for (var i = 0; i < iterations; i++) {
        var candidate = i * (1000000000 * Math.random());
        var isPrime = true;
        for (var c = 2; c <= Math.sqrt(candidate); ++c) {
            if (candidate % c === 0) {
                // not prime
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push(candidate);
        }
    }
    return primes;
}

function calculatePrimesInBackground(iterations) {
    if(isNaN(Number(iterations))){
        window.alert(iterations+" is NaN")
        return;
    }
    const  worker = new Worker("worker.js");
    worker.onerror = function(event) {
        window.alert("Wystąpił błąd w wątku roboczym: " + event.message);
    };
    worker.onmessage = function (message){
        document.forms[0].result_worker.value=message.data;
    }
    worker.postMessage(Number(iterations));
}
function startAnimation() {
    document.forms[0].start.disabled = true;
    document.forms[0].stop.disabled = false;
    animation = window.requestAnimationFrame(step);
}

function step() {
    document.forms[0].counter.value = counter++;
    animation = window.requestAnimationFrame(step);
}

function stopAnimation() {
    document.forms[0].start.disabled = false;
    document.forms[0].stop.disabled = true;
    window.cancelAnimationFrame(animation)
}