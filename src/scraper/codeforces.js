var someArr = ["\x6C\x65\x6E\x67\x74\x68", "\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74", "\x66\x6C\x6F\x6F\x72"];
    // 39ce7
function getTTA(inputCookie) {
    var someTempVar = 0;
    for (var someIndex = 0; someIndex < inputCookie[someArr[0]]; someIndex++) {
        someTempVar = (someTempVar + (someIndex + 1) * (someIndex + 2) * inputCookie[someArr[1]](someIndex)) % 1009;
        if (someIndex % 3 === 0) {
            someTempVar++;
        }
        if (someIndex % 2 === 0) {
            someTempVar *= 2;
        }
        if (someIndex > 0) {
            someTempVar -= Math[someArr[2]](inputCookie[someArr[1]](Math[someArr[2]](someIndex / 2)) / 2) * (someTempVar % 5);
        }
        while (someTempVar < 0) {
            someTempVar += 1009;
        }
        while (someTempVar >= 1009) {
            someTempVar -= 1009;
        }
    }
    return someTempVar;
}

module.exports = {
    getCode: getTTA
}