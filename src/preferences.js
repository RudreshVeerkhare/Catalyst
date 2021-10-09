const fs = require("fs");
const vscode = require("vscode");
const path = require("path");
const LANGUAGES = ["c++", "python", "java"];

const getLayoutRatio = () => {
    return (
        vscode.workspace
            .getConfiguration("catalyst.default")
            .get("layoutRatio") / 100
    );
};

const shiftProblemData = (targetPath) => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || !folders.length) return;
    const rootPath = folders[0].uri.fsPath; // working directory

    // check if cache folder exits or not
    const cache = path.join(rootPath, ".catalyst");
    if (!fs.existsSync(cache)) return;

    // move all files from folder to current folder
    const files = fs.readdirSync(cache);
    for (const file of files) {
        if (file.endsWith(".catalyst")) {
            fs.rename(
                path.join(cache, file),
                path.join(targetPath, file),
                (err) => {
                    if (err) console.log(err);
                }
            );
        }
    }
    // remove old cache folder after moving files
    fs.rmdirSync(cache);
};

const showEditorialButton = () => {
    return vscode.workspace
        .getConfiguration("catalyst.default")
        .get("showEditorial");
};

const getCacheFolder = (write = false) => {
    const pathDir = vscode.workspace
        .getConfiguration("catalyst.default")
        .get("saveLocation");
    // if path is empty string then use save location as working dir
    if (pathDir === "") {
        // get root working dir
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || !folders.length)
            throw new Error("No workspace is opened!!!");
        const rootPath = folders[0].uri.fsPath; // working directory

        // check if cache folder exits or not
        const cache = path.join(rootPath, ".catalyst");
        if (!fs.existsSync(cache)) {
            if (!write) throw new Error("No .catalyst folder exists!");
            // if doesn't exists create it
            fs.mkdirSync(cache);
        }

        return rootPath;
    }

    // if path is not empty
    // check if path is valid or not
    try {
        if (fs.existsSync(pathDir)) {
            const cache = path.join(pathDir, ".catalyst"); // check if cache folder exits or not
            if (!fs.existsSync(cache)) {
                if (!write) throw new Error("No .catalyst folder exists!");
                // if doesn't exists create it
                fs.mkdirSync(cache);
            }

            // if it's new path then move all data files from workspace root to current cache folder
            shiftProblemData(cache);

            return pathDir;
        } else {
            vscode.window.showErrorMessage(
                "Error while reading template file: " +
                    path +
                    " doesn't exists!"
            );
        }
    } catch (err) {
        vscode.window.showErrorMessage(
            "Error while reading template file: " + err.message
        );
    }
};

const isDarkTheme = () => {
    const theme = vscode.workspace
        .getConfiguration("catalyst.default")
        .get("theme");
    if (theme === "Light") return false;
    return true;
};

const getDefaultLang = async () => {
    const lang = vscode.workspace
        .getConfiguration("catalyst.default")
        .get("language");
    if (lang == "Always Ask") {
        const selected = await vscode.window.showQuickPick(LANGUAGES, {
            ignoreFocusOut: true,
        });
        console.log(selected);
        return selected;
    }
    return lang;
};

const getProblemLang = () => {
    const lang = vscode.workspace
        .getConfiguration("catalyst.default")
        .get("problemLang");

    if (lang === "Russian") return "ru";

    return "eu";
};

const getInterpreterAlias = (language) => {
    switch (language) {
        case "python": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.python")
                .get("interpreter");
        }
        case "java": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.java")
                .get("interpreter");
        }

        default:
            return null;
    }
};

const getCompilerAlias = (language) => {
    switch (language) {
        case "c++": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.cpp")
                .get("compiler");
        }
        case "java": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.java")
                .get("compiler");
        }

        default:
            throw new Error(`No Compiler specified for ${language}`);
    }
};

const getCompileArgs = (language) => {
    switch (language) {
        case "c++": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.cpp")
                .get("args");
        }
        case "java": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.java.compile")
                .get("args");
        }

        default:
            throw new Error(`No Compiler Args specified for ${language}`);
    }
};

const getRuntimeArgs = (language) => {
    switch (language) {
        case "python": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.python")
                .get("args");
        }
        case "java": {
            return vscode.workspace
                .getConfiguration("catalyst.lang.java.runtime")
                .get("args");
        }

        default:
            return "";
    }
};

const getJavaMainClassName = () => {
    return vscode.workspace
        .getConfiguration("catalyst.lang.java")
        .get("mainClass");
};

/**
 *
 * @param {String} lang
 */
const getDefaultTemplate = (lang) => {
    let templatePath = undefined;

    switch (lang) {
        case "python": {
            const path = vscode.workspace
                .getConfiguration("catalyst.default.template")
                .get("python");
            if (!(!path || path == "")) {
                templatePath = path;
            }
            break;
        }

        case "c++": {
            const path = vscode.workspace
                .getConfiguration("catalyst.default.template")
                .get("c++");
            if (!(!path || path == "")) {
                templatePath = path;
            }
            break;
        }

        case "java": {
            const path = vscode.workspace
                .getConfiguration("catalyst.default.template")
                .get("java");
            if (!(!path || path == "")) {
                templatePath = path;
            }
            break;
        }
        default:
            break;
    }

    if (!templatePath || templatePath == "") return "";

    try {
        // console.log(templatePath);
        if (fs.existsSync(templatePath)) {
            return fs.readFileSync(templatePath).toString();
        } else {
            vscode.window.showErrorMessage(
                "Error while reading template file: " +
                    templatePath +
                    " does not exists!"
            );
        }
    } catch (err) {
        vscode.window.showErrorMessage(
            "Error while reading template file: " + err.message
        );
    }

    return "";
};

/**
 * returns hostname for website
 * ex. codeforce.com, codeforces.ml
 * @param {Boolean} raw - if true return hostname with https attached
 */
const getHostName = (raw = false) => {
    const _hostname = vscode.workspace
        .getConfiguration("catalyst.default")
        .get("hostname");

    if (raw) return _hostname;

    return `https://${_hostname}`;
};

/**
 * returns last submission saved compiler option
 * if not found then returns default
 * @param {*} context
 */
const getLastCompilerOption = (context) => {
    let _data = {
        "c++": 54,
        python: 41,
        java: 60,
    };

    // get save file location
    const folder = context.globalStorageUri.fsPath;
    if (!fs.existsSync(folder)) return _data;

    // check if file exists
    const storePath = path.join(folder, `LastCompilerOption.json`);
    if (!fs.existsSync(storePath)) return _data;

    // check if data in file
    const data = JSON.parse(fs.readFileSync(storePath));
    if (
        data["c++"] === undefined ||
        data["python"] === undefined ||
        data["java"] === undefined
    )
        return _data;

    return data;
};

module.exports = {
    getLayoutRatio,
    getDefaultLang,
    getProblemLang,
    getCompilerAlias,
    getCompileArgs,
    getInterpreterAlias,
    getRuntimeArgs,
    getJavaMainClassName,
    getDefaultTemplate,
    isDarkTheme,
    getCacheFolder,
    showEditorialButton,
    getHostName,
    getLastCompilerOption,
};
