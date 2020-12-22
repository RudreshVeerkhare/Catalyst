const vscode = require('vscode');
const fs = require('fs');
const { getProblemDataFromEditorPath } = require('../fileManager/utils');
const webview = require('./index');

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
    if(!absPath) return false;
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
    const problemData = JSON.parse(fs.readFileSync(problemDataPath));

    // console.log(webview.getTitle(), webview.getLang());
    if(problemData.title == webview.getTitle() && problemData.language ==  webview.getLang()){
        // already opened editor is same
        return false;
    }

    // check if webview panel is open if not then create and populate
    await webview.createWebview(problemData, context);

    // updating title of webview
    webview.setTitle(problemData.title);

    // sending updated data to frontend
    webview.sendData({
        command: webview.CMD_NAMES.NEW_DATA,
        data: problemData
    });

    return true;

}

const checkLaunchWebview = async (context) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    return await onEditorChanged(editor, context);
};

module.exports = {
    onEditorChanged,
    checkLaunchWebview
}