const cheerio = require("cheerio");
const axios = require("axios");
const utils = require("./utils");
/**
 * @param {String} url
 * */

const getProblem = (url) => {
    // check if url belongs to codeforces.com
    if (!utils.validHostname(url)) {
        throw new Error("Not a Codeforces URL");
    }

    return axios.get(url).then((res) => {
        let data = {};

        console.log("Request status : " + res.status);
        const $ = cheerio.load(res.data);
        const problem = $(".problem-statement").html();

        // throw error if problem doesn't exists on the page
        if (!problem) throw new Error("Not a problem page!!");

        // title of the problem
        data.title = $(".problem-statement > .header > .title").html();
        // contestId of the problem
        const problemCode = utils.getProblemDetails(url);
        data.contestId = problemCode.contestId;
        // problemIndex of problem
        data.problemIndex = problemCode.problemIndex;
        // time limit for code
        data.timeLimit = $(".problem-statement > .header > .time-limit")
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();

        // mem limit for the problem
        data.memLimit = $(".problem-statement > .header > .memory-limit")
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();

        data.inputFormat = $(".problem-statement > .header > .input-file")
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();

        data.outputFormat = $(".problem-statement > .header > .output-file")
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();

        // whole problem body in html format
        data.problemHtml = $(".problem-statement > .header").next().html();

        // input constraints and specs html
        data.inSpecsHtml = $(
            ".problem-statement > .input-specification"
        ).html();

        // output constraints and specs html
        data.outSpecsHtml = $(
            ".problem-statement > .output-specification"
        ).html();

        // note for the problem
        data.noteHtml = $(".problem-statement > .note").html();

        // creating array for input output cases
        data.sampleTestcases = [];
        const dateId = new Date().getTime();
        $(".problem-statement > .sample-tests > .sample-test")
            .children()
            .each((i, ele) => {
                const index = Math.floor(i / 2);
                if (!data.sampleTestcases[index])
                    data.sampleTestcases[index] = {};
                const type = $(ele).attr("class");
                if (type == "input") {
                    // id for testcase
                    data.sampleTestcases[index].id = dateId + index;
                    data.sampleTestcases[index].input = processTestcases(
                        $(ele).find("pre").text()
                    );
                } else {
                    data.sampleTestcases[index].output = processTestcases(
                        $(ele).find("pre").text()
                    );
                }
            });

        // submission url for problem
        data.submitUrl = utils.getSubmitUrl(url);

        return data;
    });
};
/*
    usage of the getProblem function
    const ret = getProblem('https://codeforces.com/problemset/problem/1446/F');  
    ret.then(data => {
        console.log(data);
    }).catch(err => {
        console.log(err);
    })
*/

/**
 *
 * @param {String} data
 */
const processTestcases = (data) => {
    return data.replace(/<br>/g, "\n");
};

/**
 * This function will returns list of all problem urls
 * @param {String} url url of the contest
 */
const getProblemUrlsFromContest = async (url) => {
    const res = await axios.get(url);

    const $ = cheerio.load(res.data);

    const problems = $("table.problems").html();
    // console.log(problems);

    if (!problems) throw new Error("Invalid Contest");
    let problemUrls = [];
    // looping through problems
    $("table.problems > tbody")
        .children()
        .each((i, ele) => {
            if (i > 0) {
                // skip for i = 0 as it's a heading.
                problemUrls.push($(ele).find("a").attr("href"));
            }
        });

    return problemUrls;
};

module.exports = {
    getProblem,
    getProblemUrlsFromContest,
    utils,
};
