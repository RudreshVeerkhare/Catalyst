const fs = require("fs");
const vscode = require("vscode");
const path = require("path");
const utils = require("./utils");
const pref = require("../preferences");
// add file handeling logic here...

// problemData is object containing scraped problem data from Internet
const saveToCache = (problemData) => {
    // get cache folder root path
    const rootPath = pref.getCacheFolder(true);

    // get problem name
    // create md5 hash
    // check if filename with this hash exits or not
    // if it doesn't, create and save problem data to file
    const problemPath = utils.getProblemDataPath(problemData, rootPath);
    let jsonData = JSON.stringify(problemData);
    fs.writeFileSync(problemPath, jsonData);

    return problemPath;
};

// Used to retrieve problem editorial. Needed since editorials are stored in data
// file dynamically and not immediately when the problem was initially fetched
const retrieveFromCache = (problemData) => {
    // get cache folder root path
    const rootPath = pref.getCacheFolder();

    const problemPath = utils.getProblemDataPath(problemData, rootPath);
    return JSON.parse(fs.readFileSync(problemPath));
};

const createSourceCodeFile = (problemData) => {
    // getting path
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || !folders.length)
        throw new Error("No workspace is opened!!!");
    const rootPath = folders[0].uri.fsPath; // working directory

    const problemFilePath = utils.getProblemFilePath(problemData);
    if (!fs.existsSync(problemFilePath)) {
        const template = pref.getDefaultTemplate(problemData.language);
        fs.writeFileSync(problemFilePath, template);
    }

    return problemFilePath;
};

module.exports = {
    saveToCache,
    retrieveFromCache,
    createSourceCodeFile,
    utils,
};
