const URI = require("urijs");
const pref = require("../preferences");

/**
 * to check if the given url belongs to codeforces or not
 * @param {String} url
 */
const validHostname = (url) => {
    const hostname = URI(url).hostname();
    console.log(hostname);
    return hostname === pref.getHostName((raw = true));
};

/**
 * to check if given URL is a valid contest URL or not
 * @param {String} url contest URL
 */

const isValidContestURL = (url) => {
    // check if valid Codeforces URL
    if (!validHostname(url)) return false;

    // check format of url
    const regEx = new RegExp("/contest/([0-9]+)(/|)$"); // Ex. ==> "https://codeforces.com/contest/1467"
    if (!regEx.test(url)) return false;

    return true;
};

/**
 * returns the submit url for the problem
 * @param {String} url - url of problem Ex. "https://codeforces.com/gym/102890/problem/A"
 */
const getSubmitUrl = (url) => {
    const splits = url.split("/problem/");
    const submitUrl = splits[0] + "/submit";
    return submitUrl;
};

/**
 * returns the contestId and ProblemIndex
 * @param {String} url - url path Ex. /contest/1455/problem/A
 */
const getProblemDetails = (url) => {
    const problemsetRegex = new RegExp("/problemset/problem/(.*)/(.*)");
    const gymRegex = new RegExp("/gym/(.*)/problem/(.*)");
    const contestRegex = new RegExp("/contest/(.*)/problem/(.*)");
    const problemDetails = {
        contestId: "",
        problemIndex: "",
    };
    if (problemsetRegex.test(url)) {
        const [_, contestId, problemIndex] = url.match(problemsetRegex);
        problemDetails.contestId = contestId;
        problemDetails.problemIndex = problemIndex;
        return problemDetails;
    } else if (gymRegex.test(url)) {
        const [_, contestId, problemIndex] = url.match(gymRegex);
        problemDetails.contestId = contestId;
        problemDetails.problemIndex = problemIndex;
        return problemDetails;
    } else if (contestRegex.test(url)) {
        const [_, contestId, problemIndex] = url.match(contestRegex);
        problemDetails.contestId = contestId;
        problemDetails.problemIndex = problemIndex;
        return problemDetails;
    }

    return null;
};

// =============================================================================//

module.exports = {
    validHostname,
    getProblemDetails,
    getSubmitUrl,
    isValidContestURL,
};
