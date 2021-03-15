const cheerio = require('cheerio');
const client = require('./client');
const fileManager = require('../fileManager');

const getEditorial = async (context, problemData, progressHandler) => {
    try {
        // Check if editorial had been cached previously
        const savedProblemData = fileManager.retrieveFromCache(problemData);
        if (savedProblemData && savedProblemData.editorial) {
            return {error: null, data: savedProblemData.editorial};
        }

        progressHandler.report({
            increment: 50,
            message: "Getting editorial..."
        });

        const url = 'https://codeforces.com/data/problemTutorial';
        client.loadCookies(context);
        const auth = await client.loadAuth(context);
        const problemCode = problemData.contestId + problemData.problemIndex;

        const response = await client.post(url, {
            csrf_token: auth.csrf_token,
            problemCode,
        }, client.getHeaders({
            Host: 'codeforces.com',
        }));

        if (!response.data.success) {
            progressHandler.report({
                increment: 100,
                message: "Editorial is not available"
            });
            return {error: "Tutorial is not available", data: ""};
        } else {
            progressHandler.report({
                increment: 100,
                message: "Editorial successfully fetched"
            });
            const $ = cheerio.load(response.data.html);
            const content = $(".problem-statement").html();

            // save to problem data cache
            problemData.editorial = content;
            fileManager.saveToCache(problemData);

            return {error: null, data: content};
        }
    } catch (err) {
        progressHandler.report({
            increment: 100,
            message: "Failed due to network issue"
        });
        return {error: "Failed due to network issue", data: ""};
    }
}

module.exports = getEditorial;
