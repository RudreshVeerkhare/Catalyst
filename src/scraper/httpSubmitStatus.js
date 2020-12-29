const client = require('./client');
const cheerio = require('cheerio');


const INTERVAL = 500; // time interval between requests in miliseconds
const URL = 'https://codeforces.com/problemset/status?my=on';

/**
 * check for status update by http request
 * @param {} progressHandler - progress handler to update status to user
 * @param {String} subId - current submission Id
 * @param {String} url - submission status url (optional) default = https://codeforces.com/problemset/status?my=on 
 */
const getUpdate = async (progressHandler, subId, url = undefined) => {
    if (!url) url = URL;
    let accepted = false;
    // if something goes wrong then then close loop after 45 sec
    setTimeout(() => {
        accepted = true
    }, 45000);
    while (!accepted) {
        // await sleep(INTERVAL);
        const res = await client.get(url);
        const data = getStatus(res.data, subId);

        if (data.waiting == false) {
            progressHandler.report({
                increment: 100,
                message: `Verdict: ${data.statusText}
                ${data.time}
                ${data.memory}`
            });
            return Promise.resolve();
        }
        if (data.waiting == true) {
            progressHandler.report({
                message: data.statusText
            });
        }
    }
}

const sleep = (time) => new Promise(resolve => setTimeout(resolve, time));

/**
 * returns the status of the current submission
 * @param {Object} res - successful submission result
 * @param {String} submissionId - submission Id of submmission
 */
const getStatus = (res, submissionId) => {

    const $ = cheerio.load(res);

    let data = {
        statusText: "",
        waiting: undefined,
        time: undefined,
        memory: undefined
    }
    // console.log($('tbody').html());
    $('tbody').children().each((i, row) => {
        const id = $(row).attr('data-submission-id');
        if (id == submissionId) {
            data.waiting = $(row).find('.status-verdict-cell').attr('waiting') == 'true' ? true : false;
            data.statusText = $(row).find('.status-verdict-cell').text().trim();
            data.time = $(row).find('.time-consumed-cell').text().trim();
            data.memory = $(row).find('.memory-consumed-cell').text().trim();
            //console.log(data);
            return data;
        }
    });

    return data;

}

module.exports = {
    getUpdate
}