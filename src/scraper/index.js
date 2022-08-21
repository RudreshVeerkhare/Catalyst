const cheerio = require("cheerio");
const axios = require("axios").default;
const utils = require("./utils");
const { decode } = require("html-entities");
const client = require("./client");

/**
 * @param {String} url
 * */
const LANG_LIST = ["en", "ru"];

const getProblem = async (url, context) => {
    // check if url belongs to codeforces.com
    if (!utils.validHostname(url)) {
        throw new Error("Not a Codeforces URL");
    }

    client.loadCookies(context);

    const data = await fetchProblemFromWeb(url, LANG_LIST);

    return data;
};

const fetchProblemFromWeb = async (url, langIds) => {
    // fetch problem data in all languages
    let responses = await Promise.all(
        langIds.map((langId) => client.get(url, {}, { locale: langId }))
    );

    // for scraping info load using cheerio
    const cheerio_objects = responses.map((res) => cheerio.load(res.data));

    const problem = cheerio_objects.map(($) => $(".problem-statement").html());

    // if not a problem page then no "problem-statement" section
    // will be visible on any lang page
    if (problem.every((ele) => !ele)) {
        throw new Error("Not a problem page!!");
    }
    let data = {};
    // title of the problem
    data.title = {};
    cheerio_objects.map(($, index) => {
        data.title[langIds[index]] = $(
            ".problem-statement > .header > .title"
        ).text();
    });

    // contestId of the problem
    const problemCode = utils.getProblemDetails(url);
    data.contestId = problemCode.contestId;
    // problemIndex of problem
    data.problemIndex = problemCode.problemIndex;

    // time limit for code
    data.timeLimit = {};
    cheerio_objects.map(($, index) => {
        data.timeLimit[langIds[index]] = $(
            ".problem-statement > .header > .time-limit"
        )
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();
    });

    // mem limit for the problem
    data.memLimit = {};
    cheerio_objects.map(($, index) => {
        data.memLimit[langIds[index]] = $(
            ".problem-statement > .header > .memory-limit"
        )
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();
    });

    // input format for the problem
    data.inputFormat = {};
    cheerio_objects.map(($, index) => {
        data.inputFormat[langIds[index]] = $(
            ".problem-statement > .header > .input-file"
        )
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();
    });

    // output format for the problem
    data.outputFormat = {};
    cheerio_objects.map(($, index) => {
        data.outputFormat[langIds[index]] = $(
            ".problem-statement > .header > .output-file"
        )
            .clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
            .text();
    });

    // whole problem body in html format
    data.problemHtml = {};
    cheerio_objects.map(($, index) => {
        data.problemHtml[langIds[index]] = $(".problem-statement > .header")
            .next()
            .html();
    });

    // input constraints and specs html
    data.inSpecsHtml = {};
    cheerio_objects.map(($, index) => {
        data.inSpecsHtml[langIds[index]] = $(
            ".problem-statement > .input-specification"
        ).html();
    });

    // output constraints and specs html
    data.outSpecsHtml = {};
    cheerio_objects.map(($, index) => {
        data.outSpecsHtml[langIds[index]] = $(
            ".problem-statement > .output-specification"
        ).html();
    });

    // note for the problem
    data.noteHtml = {};
    cheerio_objects.map(($, index) => {
        data.noteHtml[langIds[index]] = $(".problem-statement > .note").html();
    });

    // creating array for input output cases
    // as sample testcases will be same for all
    // languages we can select any one lang
    // I'll go with English as it'll be 1st in
    // langId list
    data.sampleTestcases = [];
    const dateId = new Date().getTime();
    cheerio_objects[0](".problem-statement > .sample-tests > .sample-test")
        .children()
        .each((i, ele) => {
            const index = Math.floor(i / 2);
            if (!data.sampleTestcases[index]) data.sampleTestcases[index] = {};
            const type = cheerio_objects[0](ele).attr("class");
            if (type == "input") {
                // id for testcase
                data.sampleTestcases[index].id = dateId + index;
                data.sampleTestcases[index].input = processTestcases(
                    cheerio_objects[0](ele).find("pre").html()
                );
            } else {
                data.sampleTestcases[index].output = processTestcases(
                    cheerio_objects[0](ele).find("pre").html()
                );
            }
        });

    // submission url for problem
    data.submitUrl = utils.getSubmitUrl(url);

    return data;
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
    data = decode(data);
    data = data.replace(/<\/div>/g, "\n").replace(/<[^>]*>/g, "");
    return data.replace(/<br>/g, "\n");
};

/**
 * This function will returns list of all problem urls
 * @param {String} url url of the contest
 */
const getProblemUrlsFromContest = async (url, context) => {
    client.loadCookies(context);
    const res = await client.get(url);

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
