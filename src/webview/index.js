const vscode = require('vscode');
const utils = require('./utils');
const fileManager = require('../fileManager');
const codeRunner = require('../codeRunner');
const Submit = require('../scraper/submit');
const getEditorial = require('../scraper/editorial');
let currentPanel = undefined;
let Context = undefined;
let lang = undefined;
const CMD_NAMES = {
    // vscode to webview
    NEW_DATA: 'scrape',
    CASE_RESULT: 'case-result',
    COMPILE: 'compiling',
    RUN_ALL_TO_SEND: 'run-all-test-cases-from-key-bindings',
    GOT_EDITORIAL: 'got-editorial',

    // webview to vscode
    SAVE_DATA: 'save-data',
    RUN_ALL: 'run-all-testcases',
    SUBMIT: 'submit-code',
    GET_EDITORIAL: 'get-editorial',
}



/**
 * this function handles the creatng and populating webview
 * @param {Object} problemData - object of problem data
 * @param {vscode.ExtensionContext} context - extention context
 */
const createWebview = async (problemData, context) => {
    Context = context;
    // checking problem data
    if (!problemData) throw new Error("Problem Data is currupted!!");

    // set layout for the webview
    await utils.initLayout();

    // sets language of the problem
    lang = problemData.language;

    if(currentPanel === undefined){
        // opens code editor
        utils.openCodeEditor(problemData);
        // webview panel
        currentPanel = utils.initWebview(context, problemData.title);
        // when webview is closed
        currentPanel.onDidDispose(() => {
            console.log("Disposed");
            currentPanel = undefined;
          },
          undefined,
          context.subscriptions
        );

        // registering listeners
        registerListener();

        // populating webview
        currentPanel.webview.html = utils.getWebviewContent(context, problemData);

    }
}

/**
 * Closes webview
 */
const closeWebview = () => {
    if(currentPanel){
        currentPanel.dispose();
        currentPanel = undefined;
    }
}

/**
 * set title to the active webview
 * @param {String} title - title for the webview
 */
const setTitle = (title) => {
    if(currentPanel){
        currentPanel.title = title;
    }
}

const getTitle = () => {
    if(!currentPanel) return "";
    return currentPanel.title;
}

const getLang = () => {
    if(!currentPanel) return;
    return lang;
}

/**
 * returns the current webview instance
 */
const getWebviewPanel = () => {
    return currentPanel;
}

/**
 * Registers Listener on the webview
 */
const registerListener = () => {
    if(!currentPanel) return;
    currentPanel.webview.onDidReceiveMessage(
            message => {
            switch (message.command) {
                case CMD_NAMES.SAVE_DATA: {
                    fileManager.saveToCache(message.data);
                    break;
                }
                case CMD_NAMES.RUN_ALL: {
                    runCases(message.data, message.id);
                    fileManager.saveToCache(message.data);
                    break;
                }
                case CMD_NAMES.SUBMIT: {
                    fileManager.saveToCache(message.data);
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        cancellable: false
                    }, (progress, token) => submitProblem(message.data, progress));
                    break;
                }
                case CMD_NAMES.GET_EDITORIAL: {
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        cancellable: false
                    }, async (progress, token) => {
                        await sendData({
                            command: CMD_NAMES.GOT_EDITORIAL,
                            data: await getEditorial(Context, message.data, progress)
                        });
                    });
                    break;
                }
            }
        }
    );
}

const submitProblem = async (problemData, progress) => {
    // showing progress
    const problem = {
        contestId: '',
        problemIndex: '',
        langId: '',
        source: '',
        submitUrl: ''
    }
    progress.report({
        increment: 10,
        message: "Saving Code..."
    });


    const filePath = fileManager.utils.getProblemFilePath(problemData);
    const doc = await vscode.workspace.openTextDocument(filePath);
    problem.source = doc.getText();
    doc.save();
    progress.report({
        increment: 10,
        message: "Code Saved.."
    });


    problem.contestId = problemData.contestId;
    problem.problemIndex = problemData.problemIndex;
    problem.langId = problemData.langId;
    problem.submitUrl = problemData.submitUrl;

    // Submitting problem
    const sleep = () => new Promise(resolve => setTimeout(resolve, 7000));
    let success;
    try{
        success = await Submit(Context, problem, progress);
    } catch(err) {
        console.log(err);
        progress.report({
            increment: 100,
            message: err.message
        });
        await sleep();
        return false;
    }
    await sleep();
    return success;
}

const runCases = async (problemData, id = null) => {
    // runs all the test case

    // COMPILE <= {language specs, flags, output location}
    await sendData({
        command: CMD_NAMES.COMPILE,
        data: true
    });
    try{
        const compileExitCode = await codeRunner.compiler.compileSourceCode(problemData);
    }catch(err){
        vscode.window.showErrorMessage(err.message);
        await sendData({
            command: CMD_NAMES.COMPILE,
            data: false
        });
        throw err;
    }
    await sendData({
        command: CMD_NAMES.COMPILE,
        data: false
    });
    // run all testcases <= {compiled binary/ program file, timeout configs, input testcases}
    let testCases = problemData.sampleTestcases;
    const language = problemData.language;
    // '2 seconds' => 2000
    const timeout = Number(problemData.timeLimit.split(" ")[0]) * 1000;
    const filePath = fileManager.utils.getProblemFilePath(problemData);

    // filter out the testcases
    const cases = testCases.filter(testcase => (!id || testcase.id === id));
    for(let testcase of cases){
        console.log(testcase);
        const result = await codeRunner.runner.runTestCase(testcase, language, timeout, filePath);
        sendData({
            command: CMD_NAMES.CASE_RESULT,
            data: result
        });
    }
    // do binary file clean up
    console.log('clean Up started...');
    fileManager.utils.removeBinaries(problemData);
}


/**
 * send the data to fronend
 * @param {Object} data -  data
 */
const sendData = async (data) => {
    if (!currentPanel) return;
    await currentPanel.webview.postMessage(data);
}



module.exports = {
    createWebview,
    closeWebview,
    setTitle,
    getWebviewPanel,
    sendData,
    utils,
    CMD_NAMES,
    getTitle,
    getLang
}