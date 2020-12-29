const fs = require('fs');
const vscode = require('vscode');
const path = require('path');
const utils = require('./utils');
const pref = require('../preferences');
// add file handeling logic here...

// problemData is object containing scraped problem data from Internet
const saveToCache = (problemData) => {
    // save probelm to cache
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || !folders.length) throw new Error("No workspace is opened!!!");
    const rootPath = folders[0].uri.fsPath; // working directory

    // check if cache folder exits or not
    const cache = path.join(rootPath, '.catalyst');
    if (!fs.existsSync(cache)) {
        // if doesn't exists create it
        fs.mkdirSync(cache);
    }

    // get problem name
    // create md5 hash 
    // check if filename with this hash exits or not
    // if it doesn't, create and save problem data to file
    const problemPath = utils.getProblemDataPath(problemData, rootPath);
    let jsonData = JSON.stringify(problemData);
    fs.writeFileSync(problemPath, jsonData);

    return problemPath;

}


const createSourceCodeFile = (problemData) => {

    // getting path
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || !folders.length) throw new Error("No workspace is opened!!!");
    const rootPath = folders[0].uri.fsPath; // working directory

    const problemFilePath = utils.getProblemFilePath(problemData);
    if (!fs.existsSync(problemFilePath)) {
        const template = pref.getDefaultTemplate(problemData.language);
        fs.writeFileSync(problemFilePath, template);
    }

    return problemFilePath;
}

module.exports = {
    saveToCache,
    createSourceCodeFile,
    utils
}