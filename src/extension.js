const vscode = require('vscode');
const path = require('path');
const scraper = require('./scraper');
const webview = require('./webview');
const fileManager = require('./fileManager');
const pref = require('./preferences');
const { onEditorChanged, checkLaunchWebview } = require('./webview/webviewUpdateManager');
const userLoginHandler = require('./scraper/userLoginHandler');
const { web } = require('webpack');

const INPUT_BOX_OPTIONS = {
	ignoreFocusOut: true,
	prompt: "Enter the URL of the problem",  
};

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
		vscode.commands.registerCommand('catalyst.problemUrl', () => {
			// don't create new panel if exists
			if(currentPanel != undefined){
				currentPanel.reveal();
				console.log("Revealed!!");
				return;
			}

			// Get URL from user
			vscode.window.showInputBox(INPUT_BOX_OPTIONS).then((url) =>{
				// fetching data from website
				return scraper.getProblem(url);
			}).then(async (data) => {
				// got the scraped data
				// saving the problem data
				// and create a code src file for the same
				webview.closeWebview();
				const language = await pref.getDefaultLang();

				if(!language || language == undefined) throw new Error("Invalid Language");
				data.language = language;
				webview.createWebview(data, context);
				fileManager.saveToCache(data);
				fileManager.createSourceCodeFile(data);
			}).catch(err => {
				console.log(err);
				vscode.window.showErrorMessage(err.message);
				checkLaunchWebview(context);
			})

		})
	);
	
	// command to update login details
	context.subscriptions.push(
		vscode.commands.registerCommand('catalyst.updateLoginDetails', () => {
			userLoginHandler.getLoginDataFromUser(context);
		})
	);

	// command to run test cases
	context.subscriptions.push(
		vscode.commands.registerCommand('catalyst.runAllTestCases', () => {
			webview.sendData({
				command: webview.CMD_NAMES.RUN_ALL_TO_SEND
			});
			console.log(webview.getTitle());
		})
	);

	// command to show/hide webview
	context.subscriptions.push(
		vscode.commands.registerCommand('catalyst.showHideWebview', async () => {
			const webviewPanel = webview.getWebviewPanel();
			if (!webviewPanel){
				const res = await checkLaunchWebview(context);
				if(!res){
					vscode.window.showErrorMessage("No problem associated with this file");
					return;
				}
			} else {
				webview.closeWebview();
			}
		})
	);


	// handeling text editor change events
	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if(showWebview) onEditorChanged(editor, context);
	});

	vscode.workspace.onDidCloseTextDocument((e) => {
		// checks if all text editors are closed then closes the webview
		const activeEditors = vscode.workspace.textDocuments.length;
		console.log("Active Editors : ", activeEditors);
		if(activeEditors == 1)
			webview.closeWebview();
	});
	
	// activate webview if current editor has webview associated with it
	if(showWebview) checkLaunchWebview(context);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
