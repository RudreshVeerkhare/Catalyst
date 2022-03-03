const vscode = require("vscode");
const scraper = require("./scraper");
const webview = require("./webview");
const fileManager = require("./fileManager");
const pref = require("./preferences");
const {
    onEditorChanged,
    checkLaunchWebview,
} = require("./webview/webviewUpdateManager");
const userLoginHandler = require("./scraper/userLoginHandler");

const INPUT_BOX_OPTIONS = {
    ignoreFocusOut: true,
    prompt: "Enter the URL of the Problem/Contest",
};

// get appropriate hostname
let HOSTURL = pref.getHostName();

// temp fix for Certificate not vaild error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // vars for webview and url
    let currentPanel = undefined;
    let problemData = undefined;
    let showWebview = true;

    // Command to add new problem
    context.subscriptions.push(
        vscode.commands.registerCommand("catalyst.problemUrl", async () => {
            try {
                // Get URL from user
                // removing extra spaces
                let url = (
                    await vscode.window.showInputBox(INPUT_BOX_OPTIONS)
                ).trim();

                // getting language for source code file
                const language = await pref.getDefaultLang();
                if (!language || language == undefined)
                    throw new Error("Invalid Language");

                // identifying Contest or Problem
                // check if vaild contest URL or not
                if (
                    scraper.utils.isValidContestURL(url) ||
                    scraper.utils.isValidGymURL(url)
                ) {
                    // getting problem data
                    const problemUrls = await scraper.getProblemUrlsFromContest(
                        url,
                        context
                    );
                    if (!problemUrls || !problemUrls.length)
                        throw new Error("No problems found");

                    // getting problem data from internet
                    for (let i in problemUrls) {
                        // wrapping each problem in try catch block
                        // so that if error occurred while fetching in particular
                        // problem, then it won't affect loading of other problems.
                        try {
                            // console.log(i);
                            let tempUrl = HOSTURL + problemUrls[i];

                            //get problem data
                            let data = await scraper.getProblem(
                                tempUrl,
                                context
                            );
                            if (i == 0) {
                                // open first problem
                                webview.createWebview(data, context);
                            }
                            data.language = language;
                            data.isPartOfContest = true; // to get proper path while running program
                            fileManager.saveToCache(data); // saving problem
                            fileManager.createSourceCodeFile(data); // creating source code file
                        } catch (err) {
                            console.log(err);
                            vscode.window.showErrorMessage(
                                `Error while loading ${
                                    parseInt(i) + 1
                                }th Problem : ${err.message}`
                            );
                        }
                    }
                } else {
                    //get problem data
                    let data = await scraper.getProblem(url, context); // fetching data from website
                    // got the scraped data
                    webview.closeWebview();
                    data.language = language;
                    // saving the problem data
                    fileManager.saveToCache(data);
                    // and create a code src file for the same
                    fileManager.createSourceCodeFile(data);
                    webview.createWebview(data, context);
                }
            } catch (err) {
                console.log(err);
                vscode.window.showErrorMessage(err.message);
                checkLaunchWebview(context);
            }
        })
    );

    // command to update login details
    context.subscriptions.push(
        vscode.commands.registerCommand("catalyst.updateLoginDetails", () => {
            userLoginHandler.getLoginDataFromUser(context);
        })
    );

    // command to run test cases
    context.subscriptions.push(
        vscode.commands.registerCommand("catalyst.runAllTestCases", () => {
            webview.sendData({
                command: webview.CMD_NAMES.RUN_ALL_TO_SEND,
            });
            console.log(webview.getTitle());
        })
    );

    // command to show/hide webview
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "catalyst.showHideWebview",
            async () => {
                const webviewPanel = webview.getWebviewPanel();
                if (!webviewPanel) {
                    const res = await checkLaunchWebview(context);
                    if (!res) {
                        vscode.window.showErrorMessage(
                            "No problem associated with this file"
                        );
                        return;
                    }
                } else {
                    webview.closeWebview();
                }
            }
        )
    );

    // handeling text editor change events
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (showWebview) onEditorChanged(editor, context);
    });

    // vscode.workspace.onDidCloseTextDocument((e) => {
    // 	// checks if all text editors are closed then closes the webview
    // 	const activeEditors = vscode.workspace.textDocuments.length;
    // 	console.log("Active Editors : ", activeEditors);
    // 	if (activeEditors == 1)
    // 		webview.closeWebview();
    // });

    // activate webview if current editor has webview associated with it
    if (showWebview) checkLaunchWebview(context);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
