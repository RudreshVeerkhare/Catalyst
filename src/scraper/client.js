const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const cheerio = require('cheerio');
const qs = require('querystring');
const debug = require('debug')('client');
const cf = require('./codeforces');
const fs = require('fs');
// setting up cookies
axiosCookieJarSupport(axios);

let cookieJar = new tough.CookieJar();

const resetCookies = () => {
    cookieJar = new tough.CookieJar();
}

const getBfaa = () => {
    return "a39326959251388281514a805eb5233c";
}

const getHeaders = (oo) => {
    return Object.assign({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        // 'Referer': 'https://codeforces.com/problemset/submit',
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'Origin': 'https://codeforces.com',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'TE': 'Trailers',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
    }, oo)
}

const get = async (url, headers) => {
    const response = await axios.get(url, {
        headers: headers,
        jar: cookieJar,
        withCredentials: true
    })

    return response;
}

const post = async (url, data, headers) => {
    const response = await axios.post(url, qs.stringify(data), {
        headers: headers,
        jar: cookieJar,
        withCredentials: true
    });

    return response;
}

const getCookie = (key) => {
    return cookieJar.toJSON().cookies.filter(cookie => cookie.key === key)[0].value;
}

const getFtaa = () => {
    const charSet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let ftaa = '';
    const n = charSet.length;
    for (let i = 0; i < 18; i++) {
        ftaa += charSet[Math.floor(Math.random() * n)];
    }
    // console.log(`ftaa => ${ftaa}`);
    return ftaa;
}

const getCsrfToken = async (url = 'https://codeforces.com/enter') => {
    const response = await axios.get(url, {
        headers: getHeaders(),
        jar: cookieJar,
        withCredentials: true
    });

    const $ = cheerio.load(response.data);
    const csrf_token = $('form input[name="csrf_token"]').attr('value');
    return csrf_token;
}

const getChannelsAndCsrf = async (url) => {
    const response = await axios.get(url, {
        headers: getHeaders(),
        jar: cookieJar,
        withCredentials: true
    });

    const $ = cheerio.load(response.data);
    const csrf_token = $('form input[name="csrf_token"]').attr('value');
    // channels 
    const globalChannel = $("meta[name=\"gc\"]").attr("content");
    const userChannel = $("meta[name=\"uc\"]").attr("content");
    const userShowMessageChannel = $("meta[name=\"usmc\"]").attr("content")
    const contentChannel = $("meta[name=\"cc\"]").attr("content");
    const participantChannel = $("meta[name=\"pc\"]").attr("content");
    const talkChannel = $("meta[name=\"tc\"]").attr("content");

    return {
        csrf_token,
        channels : [
            globalChannel,
            userChannel,
            userShowMessageChannel,
            contentChannel,
            participantChannel,
            talkChannel
        ]
    };
}

const getTta = () => {
    const cookieVal = getCookie("39ce7");
    if (!cookieVal){
        throw new Error('39ce7 cookie not found');
    }

    const tta = cf.getCode(cookieVal);
    debug(`tta value => ${tta}`);
    return tta;
}

const login = async (credentials, auth) => {
    
    const url = 'https://codeforces.com/enter';
    
    const formData = {
        csrf_token: auth.csrf_token,
        action: 'enter',
        ftaa: auth.ftaa,
        bfaa: auth.bfaa,
        handleOrEmail: credentials.handle,
        password: credentials.password,
        _tta: auth.tta
    }

    const headers = getHeaders({
        Origin: 'https://codeforces.com',
        Referer: 'https://codeforces.com/enter'
    });

    // post request;
    try{
        const response = await axios.post(url, qs.stringify(formData), {
            headers: headers,
            jar: cookieJar, 
            withCredentials: true
        });
        console.log('Login Successful');
        return [response, true];
    } catch (err) {
        console.log('Login Failed');
        return [null, false];
    }
    
}

const submit = async (problem, auth) => {

    const url = `${problem.submitUrl}?csrf_token=${auth.csrf_token}`;

    const formData = {
        csrf_token: auth.csrf,
        ftaa: auth.ftaa,
        bfaa: auth.bfaa,
        action: "submitSolutionFormSubmitted",
        submittedProblemCode: `${problem.contestId}${problem.problemIndex}`,
        contestId: problem.contestId,
        submittedProblemIndex: problem.problemIndex,
        programTypeId: problem.langId,
        source: problem.source,
        tabSize: "4",
        sourceFile: '',
        _tta: auth.tta
    }

    const headers = getHeaders({
        Origin: 'https://codeforces.com',
        Referer: 'https://codeforces.com/problemset/submit'
    });
    // console.log(formData);
    try{
        const response = await axios.post(url, qs.stringify(formData), {
            headers: headers,
            jar: cookieJar,
            withCredentials: true
        });
        debug('Submit Successful');
        return [response, true];
    } catch (err) {
        console.log('Submit Failed', err);
        return [null, false];
    }
}

const isSubmitError = (res) => {
    const $ = cheerio.load(res.data);
    const err = $('span.error').text();
    const submited = $('div.datatable').text();
    if(err){
        return [err, true];
    } else if(submited){
        return [submited, false];
    }

    return null;
}

const isLoginError = (res) => {
    const $ = cheerio.load(res.data);
    const err = $('span.error').text();
    console.log(err);
    if(err){
        return [err, true];
    } else {
        return ["", false];
    }
}

module.exports = {
    submit,
    login,
    get,
    post,
    getFtaa,
    getBfaa,
    getHeaders,
    getCsrfToken,
    getTta,
    resetCookies,
    getChannelsAndCsrf,
    isSubmitError,
    isLoginError
}