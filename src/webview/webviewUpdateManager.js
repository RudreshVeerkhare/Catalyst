const vscode = require("vscode");
const fs = require("fs");
const { getProblemDataFromEditorPath } = require("../fileManager/utils");
const webview = require("./index");
const pref = require("../preferences");
const scraper = require("../scraper");
const fileManager = require("../fileManager");

/**
 * updates webview when text editor is switched
 * @param {vscode.TextEditor} editor
 * @param {vscode.ExtensionContext} context
 */
const onEditorChanged = async (editor, context) => {
    // check if editor object is valid
    if (!editor) return false;

    // getting absolute path to file
    const absPath = editor.document.fileName;
    if (!absPath) return false;
    // when editor is changed
    // console.log(`Editor changed to ${absPath}`);

    // getting problem data file
    const problemDataPath = getProblemDataFromEditorPath(absPath);

    // check if data file exists or not
    if (!fs.existsSync(problemDataPath)) {
        // if file doesn't exists then close the webview
        console.log("Webview Closed");
        webview.closeWebview();
        return false;
    }

    // reading data from file
    let problemData = JSON.parse(fs.readFileSync(problemDataPath));

    const langId = pref.getProblemLang();

    // after adding feature to change languages,
    // backward compatibility is needed for
    // previously loaded problems
    // check if problem data follows old schema
    // console.log(problemData.title);
    if (
        typeof problemData.title === "string" ||
        problemData.title instanceof String
    ) {
        // this means we need to reload problem data for this problem
        // create url to re-fetch problem
        const url = `${pref.getHostName()}/problemset/problem/${
            problemData.contestId
        }/${problemData.problemIndex}`;

        vscode.window.showInformationMessage(
            `Please wait for some time as problem data is getting re-fetched`
        );
        const data = await scraper.getProblem(url, context);

        data.language = problemData.language;
        if (problemData.isPartOfContest === true) data.isPartOfContest = true;

        fileManager.saveToCache(data); // saving problem
        // console.log(data);

        problemData = data;
    }

    // console.log(webview.getTitle(), webview.getLang());
    if (
        problemData.title[langId] == webview.getTitle() &&
        problemData.language == webview.getLang()
    ) {
        // already opened editor is same
        return false;
    }

    // check if webview panel is open if not then create and populate
    await webview.createWebview(problemData, context);

    // updating title of webview
    webview.setTitle(problemData.title[langId]);

    // sending updated data to frontend
    webview.sendData({
        command: webview.CMD_NAMES.NEW_DATA,
        data: problemData,
    });

    return true;
};

const checkLaunchWebview = async (context) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    return await onEditorChanged(editor, context);
};

module.exports = {
    onEditorChanged,
    checkLaunchWebview,
};
