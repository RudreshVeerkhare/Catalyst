const encrypt = require('./encrypt');
const vscode = require('vscode');
const debug = require('debug')('userLogin');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context 
 */
const getCredentials = async (context) => {
    const keys = encrypt.getSecret(context);
    if (!keys) {
        const creds = await getLoginDataFromUser(context);
        return creds;
    }
    const encryptedCreds = await encrypt.getCredentialsFromSystem();
    if (!encryptedCreds) {
        const creds = await getLoginDataFromUser(context);
        return creds;
    }

    const creds = encrypt.decrypt(encryptedCreds, keys);
    return creds;
}

/**
 * @param {vscode.ExtensionContext} context 
 */
const getLoginDataFromUser = async (context) => {
    // get user handle from user
    let handle, password;
    try {
        handle = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: "Enter email/handle for Codeforces login"
        });

        password = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: "Enter password for Codeforces login"
        });
        if (!handle || handle == "" || !password || password == "") throw new Error();
    } catch (err) {
        debug(err);
        throw new Error("Invalid input");
    }

    // generate new keys
    const keys = encrypt.generateKeys();

    // save keys to globalState
    await encrypt.putSecret(context, keys);

    // encrypt password and handle
    const encryptedCreds = encrypt.encrypt({
        handle,
        password
    }, keys);

    // put this encrypted password into system
    await encrypt.saveCredentialsToSystem(encryptedCreds);

    // delete existing cookies
    const folder = context.globalStorageUri.fsPath;
    const cookieStorePath = path.join(folder, `cookie.json`);
    if (fs.existsSync(folder) && fs.existsSync(cookieStorePath)) {
        // deleting cookie file
        fs.unlinkSync(cookieStorePath);
        console.log("Cookies cleared");

    }


    return { handle, password };
}

module.exports = {
    getCredentials,
    getLoginDataFromUser
}