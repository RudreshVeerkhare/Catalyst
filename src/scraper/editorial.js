const cheerio = require("cheerio");
const client = require("./client");
const fileManager = require("../fileManager");
const pref = require("../preferences");

// get appropriate hostname
const HOST = pref.getHostName();
const URL = `${HOST}/data/problemTutorial`;

const getEditorial = async (
    context,
    problemData,
    progressHandler,
    refresh = false
) => {
    try {
        // Check if editorial had been cached previously
        const savedProblemData = fileManager.retrieveFromCache(problemData);
        if (!refresh && savedProblemData && savedProblemData.editorial) {
            return { error: null, data: savedProblemData.editorial };
        }

        progressHandler.report({
            increment: 50,
            message: "Getting editorial...",
        });

        client.loadCookies(context);
        const auth = await client.loadAuth(context);
        const problemCode = problemData.contestId + problemData.problemIndex;

        const response = await client.post(
            URL,
            {
                csrf_token: auth.csrf_token,
                problemCode,
            },
            client.getHeaders()
        );

        if (response.data.success == "false") {
            progressHandler.report({
                increment: 100,
                message: "Editorial is not available",
            });
            return { error: "Tutorial is not available", data: "" };
        } else if (response.data.success == "true") {
            progressHandler.report({
                increment: 100,
                message: "Editorial successfully fetched",
            });
            const $ = cheerio.load(response.data.html);
            const content = $(".problem-statement").html();

            // save to problem data cache
            problemData.editorial = content;
            fileManager.saveToCache(problemData);

            return { error: null, data: content };
        }

        return { error: "Failed to fatched editorial", data: "" };
    } catch (err) {
        progressHandler.report({
            increment: 100,
            message: "Failed due to some error!",
        });
        console.log(err);
        return { error: "Failed due to some error!", data: "" };
    }
};

module.exports = getEditorial;
