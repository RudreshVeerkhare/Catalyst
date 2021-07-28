const vscode = require("vscode");
const path = require("path");
const { getProblemFilePath, getRootPath } = require("../fileManager/utils");
const pref = require("../preferences");
/**
 * create new webview and Initialize
 * @param {vscode.ExtensionContext} context
 * @param {String} problemName
 */
const initWebview = (context, problemName) => {
    console.log("New webview created!!!");
    return vscode.window.createWebviewPanel(
        "problem",
        problemName,
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, "dist")),
            ],
        }
    );
};

const initLayout = async () => {
    const ratio = pref.getLayoutRatio();
    await vscode.commands.executeCommand("vscode.setEditorLayout", {
        orientation: 0,
        groups: [
            { groups: [{}], size: 1 - ratio },
            { groups: [{}], size: ratio },
        ],
    });
};

/**
 * gives the html content for webview
 * @param {vscode.ExtensionContext} context
 */

const getWebviewContent = (context, problemData) => {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
        path.join(context.extensionPath, "dist", "bundle.js")
    );

    const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

    return `
        <!DOCTYPE html>
        <html style="font-size: small !important;">
            <head>
                <title></title>
            </head>
            <script>
                window.acquireVsCodeApi = acquireVsCodeApi;
                window.intialData = ${JSON.stringify(problemData)};
                window.darkMode = ${pref.isDarkTheme()};
                window.showEditorialButton = ${pref.showEditorialButton()};
                window.prevCompilerOptions = ${JSON.stringify(
                    pref.getLastCompilerOption(context)
                )};
            </script>
            <script type="text/x-mathjax-config">
                MathJax.Hub.Config({
                    tex2jax: {inlineMath: [['$$$','$$$']], displayMath: [['$$$$$$','$$$$$$']]}
                });
            </script>
            <script type="text/javascript" src="https://assets.codeforces.com/mathjax/MathJax.js?config=TeX-AMS_HTML-full"></script>
        <body>
            <div id="root">
            </div>
            <script src="${reactAppUri}"></script>
        </body>
        </html>
    `;
};

const openCodeEditor = (problemData) => {
    const rootPath = getRootPath(); // getting working dir path
    const filePath = getProblemFilePath(problemData); // getting path of source code file

    vscode.workspace.openTextDocument(filePath).then((doc) => {
        vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.One,
        });
    });
};
// exports
module.exports = {
    initWebview: initWebview,
    getWebviewContent: getWebviewContent,
    openCodeEditor: openCodeEditor,
    initLayout: initLayout,
};
