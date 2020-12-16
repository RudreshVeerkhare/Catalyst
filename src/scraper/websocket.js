const wsClient = require('websocket').client;

const client = new wsClient();
const URL = 'wss://pubsub.codeforces.com/ws/';
let progressHandler = undefined;
let connection = undefined;

client.on('connectFailed', err => {
    console.log(`ERROR => ${err}`);
})

client.on('connect', conn => {
    console.log('Websocket client connected');
    connection = conn;
    conn.on('close', () => {
        connection = undefined;
        console.log("Connection closed");
    });
    conn.on('message', msg => {
        let data = JSON.parse(JSON.parse(msg.utf8Data).text);
        if(data.t == 's')
            parseData(data, conn);
    })
});



/**
 * 
 * @param {Array} channels - list of all available channels 
 */
const connect = (channels, progress) => {
    let url = URL;
    for(let token of channels){
        if(!token) continue;
        url += `s_${token}/`
    }
    console.log(url);

    // connecting to socket
    progressHandler = progress;
    client.connect(url);

    return new Promise(resolve => {
        client.addListener('connect', conn => {
            conn.on('close', () => resolve());
        })
    });

}

const closeConnection = async () => {
    if(!connection) return;
    await connection.close();
}


const parseData = (data, conn) => {
    console.log(data);
    if(typeof parseData.lastCase == 'undefined'){
        // in JS functions are also object
        parseData.lastCase = 0;
    }

    const verdictString = data.d[6];
    const passedTestCount = data.d[7];
    const judgedTestCount = data.d[8];
    const timeConsumed  = data.d[9];
    const memoryConsumed = data.d[10];

    const wating = isWating(verdictString);
    if(parseData.lastCase < judgedTestCount || !wating){
        if(wating){
            progressHandler.report({
                message: `Running on testcase ${judgedTestCount}`
            });
        }else{
            progressHandler.report({
                increment: 100,
                message: `Verdict: ${verdictString}
                Passed ${passedTestCount} cases
                ${timeConsumed}ms
                ${Math.floor(memoryConsumed/1024)}KB`
            });
            
        }
        
        parseData.lastCase = judgedTestCount;
    }
    if(!wating){
        parseData.lastCase = 0;
        conn.close();
    }
    

}

const isWating = verdictString => {
    return (!verdictString || verdictString == 'null' || verdictString == 'TESTING' || verdictString == 'SUBMITTED');
}

module.exports = {
    connect,
    closeConnection
}