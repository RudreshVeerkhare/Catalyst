const vscode = require('vscode');
const scraper = require('./scraper');
const webview = require('./webview');
const fileManager = require('./fileManager');
const pref = require('./preferences');
const { onEditorChanged, checkLaunchWebview } = require('./webview/webviewUpdateManager');
const userLoginHandler = require('./scraper/userLoginHandler');

const INPUT_BOX_OPTIONS = {
	ignoreFocusOut: true,
	prompt: "Enter the URL of the Problem/Contest",
};

const HOSTURL = 'https://codeforces.com';

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
		vscode.commands.registerCommand('catalyst.problemUrl', async () => {
			try {
				// Get URL from user
				const url = await vscode.window.showInputBox(INPUT_BOX_OPTIONS);
				// getting language for source code file
				const language = await pref.getDefaultLang();
				if (!language || language == undefined)
					throw new Error("Invalid Language");

				// identifying Contest or Problem
				// check if vaild contest URL or not
				if (scraper.utils.isValidContestURL(url)) {

					// getting problem data
					const problemUrls = await scraper.getProblemUrlsFromContest(url);
					if (!problemUrls || !problemUrls.length)
						throw new Error("No problems found");

					// getting problem data from internet
					for (let i in problemUrls) {
						// console.log(i);
						let data = await scraper.getProblem(HOSTURL + problemUrls[i]);
						if (i == 0) {
							// open first problem
							webview.createWebview(data, context);
						}
						data.language = language;
						fileManager.saveToCache(data); // saving problem
						fileManager.createSourceCodeFile(data); // creating source code file
					}


				} else {
					let data = await scraper.getProblem(url); // fetching data from website
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

	// command to add whole contest
	context.subscriptions.push(
		vscode.commands.registerCommand('catalyst.contestUrl', async () => {

			try {
				// get URL from user
				const url = await vscode.window.showInputBox({
					ignoreFocusOut: true,
					prompt: "Enter the URL of the Contest",
				});

				// check if vaild contest URL or not
				if (!scraper.utils.isValidContestURL(url))
					throw new Error("Invalid Contest URL");

				// getting problem data
				const problemUrls = await scraper.getProblemUrlsFromContest(url);
				if (!problemUrls || !problemData.length)
					throw new Error("No problems found");

				// fetching problems and creating source files
				// getting language for source code file
				const language = await pref.getDefaultLang();
				if (!language || language == undefined)
					throw new Error("Invalid Language");

				// getting problem data from internet
				let firstProb;
				for (let i in problemUrls) {
					console.log(i);
					let data = await scraper.getProblem(HOSTURL + problemUrls[i]);
					if (i == 0) firstProb = data;
					data.language = language;
					fileManager.saveToCache(data); // saving problem
					fileManager.createSourceCodeFile(data); // creating source code file
				}

				// open first problem
				webview.createWebview(firstProb, context);

			} catch (err) {
				console.log(err);
				vscode.window.showErrorMessage(err.message);
			}
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
			if (!webviewPanel) {
				const res = await checkLaunchWebview(context);
				if (!res) {
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
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
