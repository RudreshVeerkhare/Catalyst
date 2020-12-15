const vscode = require('vscode');
const LANGUAGES = [
    'c++',
    'python',
    'java'
]

const getLayoutRatio = () => {
    return vscode.workspace.getConfiguration('catalyst.default').get('layoutRatio') / 100;
}

const getDefaultLang = async () => {
    const lang = vscode.workspace.getConfiguration('catalyst.default').get('language');
    if(lang == "Always Ask"){
        const selected = await vscode.window.showQuickPick(LANGUAGES, {
            ignoreFocusOut: true
        });
        console.log(selected);
        return selected;
    }
    return lang;
}

const getInterpreterAlias = (language) => {
    switch (language) {
        case "python":{
            return vscode.workspace.getConfiguration('catalyst.lang.python').get('interpreter');
        }
        case "java":{
            return vscode.workspace.getConfiguration('catalyst.lang.java').get('interpreter');
        }
    
        default:
            return null;
    }
}

const getCompilerAlias = (language) => {
    switch (language) {
        case "c++":{
            return vscode.workspace.getConfiguration('catalyst.lang.cpp').get('compiler');
        }
        case "java":{
            return vscode.workspace.getConfiguration('catalyst.lang.java').get('compiler');
        }
    
        default:
            throw new Error(`No Compiler specified for ${language}`);
    }
}

const getCompileArgs = (language) => {
    switch (language) {
        case "c++":{
            return vscode.workspace.getConfiguration('catalyst.lang.cpp').get('args');
        }
        case "java":{
            return vscode.workspace.getConfiguration('catalyst.lang.java.compile').get('args');
        }
    
        default:
            throw new Error(`No Compiler Args specified for ${language}`);
    }
}

const getRuntimeArgs = (language) => {
    switch (language) {
        case "python":{
            return vscode.workspace.getConfiguration('catalyst.lang.python').get('args');
        }
        case "java":{
            return vscode.workspace.getConfiguration('catalyst.lang.java.runtime').get('args');
        }
    
        default:
            return '';
    }
}

const getJavaMainClassName = () => {
    return vscode.workspace.getConfiguration('catalyst.lang.java').get('mainClass');
}

module.exports = {
    getLayoutRatio,
    getDefaultLang,
    getCompilerAlias,
    getCompileArgs,
    getInterpreterAlias,
    getRuntimeArgs,
    getJavaMainClassName
}