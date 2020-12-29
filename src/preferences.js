const fs = require('fs');
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
    if (lang == "Always Ask") {
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
        case "python": {
            return vscode.workspace.getConfiguration('catalyst.lang.python').get('interpreter');
        }
        case "java": {
            return vscode.workspace.getConfiguration('catalyst.lang.java').get('interpreter');
        }

        default:
            return null;
    }
}

const getCompilerAlias = (language) => {
    switch (language) {
        case "c++": {
            return vscode.workspace.getConfiguration('catalyst.lang.cpp').get('compiler');
        }
        case "java": {
            return vscode.workspace.getConfiguration('catalyst.lang.java').get('compiler');
        }

        default:
            throw new Error(`No Compiler specified for ${language}`);
    }
}

const getCompileArgs = (language) => {
    switch (language) {
        case "c++": {
            return vscode.workspace.getConfiguration('catalyst.lang.cpp').get('args');
        }
        case "java": {
            return vscode.workspace.getConfiguration('catalyst.lang.java.compile').get('args');
        }

        default:
            throw new Error(`No Compiler Args specified for ${language}`);
    }
}

const getRuntimeArgs = (language) => {
    switch (language) {
        case "python": {
            return vscode.workspace.getConfiguration('catalyst.lang.python').get('args');
        }
        case "java": {
            return vscode.workspace.getConfiguration('catalyst.lang.java.runtime').get('args');
        }

        default:
            return '';
    }
}

const getJavaMainClassName = () => {
    return vscode.workspace.getConfiguration('catalyst.lang.java').get('mainClass');
}

/**
 * 
 * @param {String} lang 
 */
const getDefaultTemplate = (lang) => {
    let templatePath = undefined;

    switch (lang) {
        case "python": {
            const path = vscode.workspace.getConfiguration('catalyst.default.template').get('python');
            if (!(!path || path == "")) {
                templatePath = path;
            }
            break;
        }

        case "c++": {
            const path = vscode.workspace.getConfiguration('catalyst.default.template').get('c++');
            if (!(!path || path == "")) {
                templatePath = path;
            }
            break;
        }

        case "java": {
            const path = vscode.workspace.getConfiguration('catalyst.default.template').get('java');
            if (!(!path || path == "")) {
                templatePath = path;
            }
            break;
        }
        default:
            break;
    }

    if (!templatePath || templatePath == "")
        return "";

    try {
        // console.log(templatePath);
        if (fs.existsSync(templatePath)) {
            return fs.readFileSync(templatePath).toString();
        }
    } catch (err) {
        vscode.window.showErrorMessage("Error while reading template file: " + err.message);
    }

    return "";

}

module.exports = {
    getLayoutRatio,
    getDefaultLang,
    getCompilerAlias,
    getCompileArgs,
    getInterpreterAlias,
    getRuntimeArgs,
    getJavaMainClassName,
    getDefaultTemplate
}