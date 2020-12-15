const vscode = require('vscode');
const fileManager = require('../fileManager');
const pref = require('../preferences');
const path = require('path');
const outChannel = require('./outputChannel');
const { spawn } = require('child_process');

// functions here
const compileSourceCode = async (problemData) => {

    console.log("Compilation started !!");
    
    // get source code file (save it) name and do error checking
    const filePath = fileManager.utils.getProblemFilePath(problemData);
    await vscode.workspace.openTextDocument(filePath).then(doc => doc.save());

    outChannel.hide();
    if (skipCompile(problemData.language)){
        console.log('compilation skipped');
        return true;
    }
    
    // get language specific running config => { compiler command | args |  }
    const config = getLangConfig(problemData.language, filePath);
    
    // compile file and write the binary in .temp folder in workspace
    const ret = new Promise((resolve) => {
        let compiler;
        try{
            compiler = spawn(config.command, config.args);
        } catch (error) {
            vscode.window.showErrorMessage(`Compilation failed, Could not find ${config.command}`);
            throw error;
        }

        // getting stderr data
        let stdError = "";
        compiler.stderr.on('data', data => {
            stdError += data;
        });

        
        compiler.on('exit', code => {
            if (code == 1 || stdError != ""){
                outChannel.write(stdError);
                outChannel.show();
                console.log(`comilation failed => ${code} ${stdError}`);
                resolve(false);
            }

            console.log('Compilation Completed');
            resolve(true);
        });
    });
    
    return ret;
    
}

// utils here

const skipCompile = (language) => {
    switch (language) {
        case 'python':
            return true;
            
    
        default:
            return false;
            
    }
}

const getLangConfig = (language, filePath) => {
    
    let config = {};
    
    // get compiler alias
    config.command = pref.getCompilerAlias(language);

    // add args
    const args = pref.getCompileArgs(language).split(" ").filter(item => !(item == " " || item == "" || !item));
    switch (language) {
        case "c++":
            config.args = [
                filePath,
                '-o',
                fileManager.utils.getBinaryLocation(filePath),
                ...args
            ];
            break;
        case "java":
            config.args = [
                filePath,
                '-d',
                path.dirname(fileManager.utils.getBinaryLocation(filePath)),
                ...args
            ];
            break;
    
        default:
            throw new Error(`No Compiler specified for ${language}`);
            break;
    }

    return config;
}

// exports here
module.exports = {
    compileSourceCode
}