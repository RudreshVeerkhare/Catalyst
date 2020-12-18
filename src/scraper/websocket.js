const wsClient = require('websocket').client;

const URL = 'wss://pubsub.codeforces.com/ws/';
let progressHandler = undefined;
let resultSocket = {
    client: new wsClient(),
    conn: undefined
}
let statusSocket = {
    client: new wsClient(),
    conn: undefined,
    submissionId: undefined
}

// listeners for status socket
// =====================================================================

statusSocket.client.on('connectFailed', err => {
    console.log(`Status socket ERROR => ${err}`);
})

statusSocket.client.on('connect', conn => {
    // closes connection after 10 sec
    setTimeout(() => {
        conn.close()
    }, 10000);
    console.log('Status Websocket client connected');
    statusSocket.conn = conn;
    conn.on('close', () => {
        statusSocket.conn = undefined;
        console.log("Status Connection closed");
    });
    conn.on('message', msg => {
        let data = JSON.parse(JSON.parse(msg.utf8Data).text);
        if(data.t == 's')
            parseData(data);
    })
});

// listeners for result socket
// =====================================================================
resultSocket.client.on('connectFailed', err => {
    console.log(`Result socket ERROR => ${err}`);
})

resultSocket.client.on('connect', conn => {
    // closes connection after 10 sec
    setTimeout(() => {
        conn.close()
    }, 10000);
    console.log('Result Websocket client connected');
    resultSocket.conn = conn;
    conn.on('close', () => {
        resultSocket.conn = undefined;
        console.log("Result Websocket Connection closed");
    });
    conn.on('message', msg => {
        let data = JSON.parse(JSON.parse(msg.utf8Data).text);
        if(data.t == 's'){
            console.log(data);
            parseData(data, true);
        }
    })
});

//=====================================================================


const setProgressHandler = (progress) => {
    progressHandler = progress;
}

/**
 * 
 * @param {Object} channels - list of all available channels 
 */
const connectResultSocket = (channels) => {
    let url = URL;
    for(let token of channels){
        if(!token) continue;
        url += `${token}/`
    }
    console.log(url);

    // connecting to socket

    resultSocket.client.connect(url);

    return new Promise(resolve => {
        const onClose = () => resolve();
        resultSocket.client.addListener('connect', conn => {
            conn.on('close', onClose);
        })
    });

}


/**
 * 
 * @param {Object} s_channels - list of all available channels 
 */
const connectStatusSocket = (s_channels, subId) => {
    let url = URL;
    for(let token of s_channels){
        if(!token) continue;
        url += `s_${token}/`
    }
    console.log(url);

    // connecting to socket
    statusSocket.submissionId = subId;
    statusSocket.client.connect(url);

    return new Promise(resolve => {
        const onClose = () => resolve();
        statusSocket.client.addListener('connect', conn => {
            conn.on('close', onClose);
        })
    });

}

const closeSockets = () => {
    if(resultSocket.conn !== undefined ) resultSocket.conn.close();
    if(statusSocket.conn !== undefined ) statusSocket.conn.close();
}

const parseData = (data, result=false) => {
    if(!result && (!statusSocket.ubmissionId || data.d[1] != statusSocket.submissionId)) return;
    // console.log(data);
    if(typeof parseData.lastCase == 'undefined'){
        // in JS functions are also object
        parseData.lastCase = -1;
    }
    const verdictString = data.d[6];
    const passedTestCount = data.d[7];
    const judgedTestCount = data.d[8];
    const timeConsumed  = data.d[9];
    const memoryConsumed = data.d[10];

    const wating = isWating(verdictString);
    if(parseData.lastCase < judgedTestCount || !wating){
        if(wating){
            if(judgedTestCount == 0){
                progressHandler.report({
                    message: `In Queue...`
                });
            } else {
                progressHandler.report({
                    message: `Running on testcase ${judgedTestCount}`
                });
            }
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
        parseData.lastCase = -1;
        closeSockets();
    }
    

}

const isWating = verdictString => {
    return (!verdictString || verdictString == 'null' || verdictString == 'TESTING' || verdictString == 'SUBMITTED');
}

module.exports = {
    connectResultSocket,
    connectStatusSocket,
    setProgressHandler,
    closeSockets
}