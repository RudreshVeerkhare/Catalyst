const crypto = require("crypto");
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const pref = require("../preferences");

/**
 *  returns a MD5 hash of given string
 * @param {String} name
 */
const getHash = (name, fileExtension) => {
    const hash = crypto
        .createHash("md5")
        .update(`${name}.${fileExtension}`)
        .digest("hex");
    return hash;
};

/**
 *  returns path to file in which problem data is stored
 * @param {Object} problemData - title of problem extracted from internet
 * @param {String} rootPath - workspace directory path
 */
const getProblemDataPath = (problemData, rootPath) => {
    const hash = getHash(
        // filename will always be in english
        sanitizeTitle(problemData.title["en"]),
        getExtensionFromLang(problemData.language)
    );
    return path.join(rootPath, ".catalyst", `${hash}.catalyst`);
};

/**
 * returns sanitized string of problem title
 * @param {String} problemTitle - probelm title
 */
const sanitizeTitle = (problemTitle) => {
    // to make appropriate JAVA class name
    // also to get valid filename to store
    // support for basic cyrillic chars
    const re = /[^a-zа-я0-9]+/gi; // replcaes every thing other than alphaNumeric
    return problemTitle.replace(re, "_");
};

/**
 *  returns path of source code file for problem
 * @param {Object} problemData - title of problem extracted from internet
 */
const getProblemFilePath = (problemData) => {
    // const regex = /[\s|.]/g;
    const rootPath = getRootPath();
    // Sanitize filename
    // always use english name for filename
    const problemName = sanitizeTitle(problemData.title["en"]);
    const fileExtension = getExtensionFromLang(problemData.language);

    // if contestId is given
    if (problemData.isPartOfContest == true)
        return path.join(
            rootPath,
            `contest_${problemData.contestId}`,
            `${problemName}.${fileExtension}`
        );

    return path.join(rootPath, `${problemName}.${fileExtension}`);
};

const getBinaryLocation = (filePath) => {
    const pathProp = path.parse(filePath);
    const tempPath = path.join(getRootPath(), ".temp");
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath);
    }
    const binPath = path.join(tempPath, pathProp.name);
    if (!fs.existsSync(binPath)) {
        fs.mkdirSync(binPath);
    }
    return path.join(binPath, `${pathProp.name}.bin`);
};

const removeBinaries = async (problemData) => {
    const rootPath = getRootPath();
    // filename will always be in english
    const binDir = path.join(rootPath, ".temp", problemData.title["en"]);
    try {
        fs.rmdirSync(binDir, { recursive: true });
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * returns current working directory path
 * @param {boolean} silent - if true, function doesn't throw error if workspace is not defined
 */
const getRootPath = (silent = false) => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || !folders.length) {
        if (!silent) throw new Error("No workspace is opened!!!");
        else return undefined;
    }
    const rootPath = folders[0].uri.fsPath;

    return rootPath;
};

/**
 * returns problem data file corresponding to given editor
 * @param {String} absPath - absolute path to the text editor file
 */
const getProblemDataFromEditorPath = (absPath) => {
    const extension = path.extname(absPath);
    const filename = path.basename(absPath, extension);
    const rootPath = pref.getCacheFolder();
    return path.join(
        rootPath,
        ".catalyst",
        `${getHash(filename, extension.substring(1))}.catalyst`
    );
};

const getExtensionFromLang = (lang) => {
    // getting default language
    let fileExtension = "";
    switch (lang) {
        case "c++":
            fileExtension = "cpp";
            break;
        case "python":
            fileExtension = "py";
            break;
        case "java":
            fileExtension = "java";
            break;

        default:
            fileExtension = "cpp";
            break;
    }

    return fileExtension;
};

module.exports = {
    getHash,
    getProblemDataPath,
    getProblemFilePath,
    getRootPath,
    getProblemDataFromEditorPath,
    getExtensionFromLang,
    getBinaryLocation,
    removeBinaries,
};
