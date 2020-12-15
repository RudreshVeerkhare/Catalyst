const vscode = require('vscode');
const { spawn } = require('child_process');
const pref = require('../preferences');
const fileManager = require('../fileManager');
const path = require('path');

let runningBinaries = {};

// functions 
const runAll = (problemData, id = null) => {
    let testCases = problemData.sampleTestcases;
    const language = problemData.language;
    // '2 seconds' => 2000
    const timeout = Number(problemData.timeLimit.split(" ")[0]) * 1000;
    const filePath = fileManager.utils.getProblemFilePath(problemData);

    // filter out the testcases
    const cases = testCases.filter(testcase => (!id || testcase.id === id));
    const maps = cases.map(testcase => {
        return runTestCase(testcase, language, timeout, filePath);
    });
    return maps;
}

const runTestCase = async (testcase, language, timeout, filePath) => {
    console.log(`Running for testcase => ${testcase.id}`);
    
    // getting language config
    const config = getRunningConfig(language, filePath);
    console.log(`running config => ${JSON.stringify(config)}`);

    let result = {
        id: testcase.id,
        stdout: "",
        stderr: "",
        exitcode: null,
        signal: null,
        time: 0,
        timeout: false
    };

    let runner, start;
    // setting timeout in ms
    const timeOut = setTimeout(() => {
        result.timeout = true;
        runner.kill();
    }, timeout);

    try{
        runner = spawn(config.command, config.args);
        start = Date.now();
        runningBinaries[testcase.id] = true;
    } catch (error) {
        vscode.window.showErrorMessage(`testcase run failed, Could not find ${config.command}`);
        throw error;
    }

    
    const ret = new Promise((resolve) => {
        runner.stdout.on('data', data => result.stdout += data);
        runner.stderr.on('data', data => result.stderr += data);

        runner.on('exit', (code, signal) => {
            const end = Date.now();
            clearTimeout(timeOut);
            result.exitcode = code;
            result.signal = signal;
            result.time = end - start;
            // striping the stderr and stdout
            result.stdout = result.stdout.substring(0, 1000);
            result.stderr = result.stderr.substring(0, 1000);
            delete runningBinaries[testcase.id];
            resolve(result);
        });

        // writing on stdin
        try{
            runner.stdin.write(testcase.input);
        } catch (error) {
            console.log(`Error while writing STDIN ${error}`);
        }
        runner.stdin.end();

        runner.on('error', err => {
            const end = Date.now();
            clearTimeout(timeOut);
            result.exitcode = 1;
            result.signal = err.name;
            result.time = end - start;
            // striping the stderr and stdout
            result.stdout = result.stdout.substring(0, 1000);
            result.stderr = result.stderr.substring(0, 1000);
            delete runningBinaries[testcase.id];
            console.log(`Error occured while running testcase => ${result}`);
            resolve(result);
        });

        

    });
    
    return ret;

}

// utils

const getRunningConfig = (language, filePath) => {
    let config = {};
    
    // get compiler alias
    config.command = pref.getInterpreterAlias(language);

    // add args
    const args = pref.getRuntimeArgs(language).split(" ").filter(item => !(item == " " || item == "" || !item));
    switch (language) {
        case "python":
            config.args = [
                filePath,
                ...args
            ];
            break;
        case "java":
            const binaryPath = path.parse(fileManager.utils.getBinaryLocation(filePath));
            const binFileName = pref.getJavaMainClassName();
            const binaryDir = binaryPath.dir;
            config.args = [
                '-cp',
                binaryDir,
                binFileName
            ];
            break;
    
        default:
            config.command = fileManager.utils.getBinaryLocation(filePath);
            config.args = []
            break;
    }

    return config;
}

// exports 
module.exports = {
    runTestCase
}